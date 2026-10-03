// Known issues with the current buildSchema + rootValue resolver setup.
//
// Each test asserts the behaviour we WANT. They are marked `test.failing`,
// so they pass while the bug exists. Once a fix lands, jest reports
// "Failing test passed even though it was expected to fail" — flip that
// test to `test` and it becomes a regression test.
//
// 6. resolver/join wiring is not tested here: `resolver` and `join` are
//    injected into each other only because buildSchema has no per-type
//    resolvers, and `gamesResolver` checks the module-level
//    `publishersResolver` instead of the injected one. It is structural
//    and changes no output; per-type resolvers remove it entirely.

const request = require('supertest');

const { createApp } = require('../app');
const { resolver, join } = require('../resolver');
const mutation = require('../mutation');
const { Games, Publishers } = require('../data');

const gql = (app, query) => request(app).post('/graphql').send({ query });

const copy = (list) => list.map((item) => ({ ...item }));

describe('known issues', () => {
  // 1. Nested resolution stops after one level: join.publisher calls the
  //    publishers resolver without Games/join, so publishers inside a game
  //    come back without their games.
  test('1. nesting works deeper than one level', async () => {
    const res = await gql(createApp(), '{ games(id: "1") { publisher { games { title } } } }');

    expect(res.body.data.games).toEqual([
      {
        publisher: [{
          games: [{ title: 'metal gear solid' }, { title: 'winning eleven' }],
        }],
      },
    ]);
  });

  // 2. Joins are computed before GraphQL knows which fields were asked
  //    for, so publishers are looked up even when the query never asks.
  describe('2. eager joins', () => {
    afterEach(() => jest.restoreAllMocks());

    test.failing('does not join publishers when only titles are requested', async () => {
      const spy = jest.spyOn(join, 'publisher');

      await gql(createApp(), '{ games { title } }');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  // 3. A game has exactly one publisher, but the schema types it as a
  //    list because the join reuses a resolver that returns arrays.
  test.failing('3. game.publisher is a single object, not a list', async () => {
    const res = await gql(createApp(), '{ games(id: "1") { publisher { title } } }');

    expect(res.body.data.games).toEqual([{ publisher: { title: 'konami' } }]);
  });

  // 4. The publisherId filter replaces the id result instead of narrowing
  //    it, so passing both arguments ignores id.
  test.failing('4. id and publisherId together narrow the result', () => {
    const result = resolver.games({ Games: copy(Games) })({ id: '1', publisherId: '1' });

    expect(result).toEqual([{ id: '1', title: 'metal gear solid', publisherId: '1' }]);
  });

  // 5. edit finds the index with reduce(..., 0), so an unknown id falls
  //    back to index 0 and overwrites the first record.
  describe('5. editing an unknown id', () => {
    const editUnknown = (edit) => {
      try {
        edit();
      } catch (err) {
        // throwing is an acceptable fix; only the data matters here
      }
    };

    test.failing('leaves publishers untouched', () => {
      const publishers = copy(Publishers);

      editUnknown(() => mutation.publisher.edit(publishers)({ input: { id: '9', title: 'x' } }));

      expect(publishers).toEqual(Publishers);
    });

    test.failing('leaves games untouched', () => {
      const games = copy(Games);

      editUnknown(() => mutation.game.edit(games)({ input: { id: '9', title: 'x', publisherId: '1' } }));

      expect(games).toEqual(Games);
    });
  });
});
