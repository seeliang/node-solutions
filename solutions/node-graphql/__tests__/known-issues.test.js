// Open bugs with the resolver-map setup (makeExecutableSchema + graphql-http).
//
// Red until fixed. Each test asserts the behaviour we WANT, so `yarn test`
// fails once per open bug. Fix them one at a time: each fix should turn
// exactly one test green. Then move that test to the regressions block in
// app.test.js.
//
// Rules learned from the resolver-map refactor:
// - Go through /graphql (or the public mutation module), never internals.
//   Two earlier tests called `join` and `resolver.games`; the refactor
//   removed both and the tests broke for a reason unrelated to the bugs.
// - A red test can mean "bug still here" or "test is broken", so every
//   query used below also has a plain test in "the queries still run".
//   If a guard goes red, fix the guard first.
//
// Fixed and moved to app.test.js as regression tests:
// 1. nesting deeper than one level
// 2. publishers looked up even when the query never asks for them
//
// If this branch is ever merged with bugs still open, mark those tests
// `test.failing` so the main build stays green.

const { createApp } = require('../app');
const { createStore } = require('../store');
const mutation = require('../mutation');
const { gql, countPublisherReads } = require('../test-helpers');

const QUERIES = {
  publisherOfGame: '{ games(id: "1") { publisher { title } } }',
  byPublisher: '{ games(publisherId: "2") { title } }',
  idAndPublisher: '{ games(id: "1", publisherId: "2") { title } }',
  addGameUnknownPublisher:
    'mutation { addGame(input: { title: "contra", publisherId: "9" }) { game { id } userErrors { field } } }',
  gamesWithPublishers: '{ games { title publisher { title } } }',
  renamePublisher:
    'mutation { editPublisher(input: { id: "1", title: "KONAMI" }) { publisher { title } } }',
  // mutation fields run in order, sharing one request's loaders
  renameBetweenLoads: `mutation {
    before: editGame(input: { id: "1", title: "metal gear solid", publisherId: "1" }) {
      game { publisher { title } }
    }
    rename: editPublisher(input: { id: "1", title: "KONAMI" }) { publisher { title } }
    after: editGame(input: { id: "3", title: "winning eleven", publisherId: "1" }) {
      game { publisher { title } }
    }
  }`,
};

describe('open bugs', () => {
  // 3. A game has exactly one publisher, but the schema types it as
  //    `[Publishers]!` and the resolver uses `filter`, which returns a list.
  test('3. game.publisher is a single object, not a list', async () => {
    const res = await gql(createApp(), QUERIES.publisherOfGame);

    expect(res.body.data.games).toEqual([{ publisher: { title: 'konami' } }]);
  });

  // 4. Query.games filters by `id` only, so `publisherId` is ignored: it
  //    neither filters on its own nor narrows `id`.
  test('4. publisherId filters, and narrows id', async () => {
    const app = createApp();
    const byPublisher = await gql(app, QUERIES.byPublisher);
    const both = await gql(app, QUERIES.idAndPublisher);

    expect(byPublisher.body.data.games).toEqual([{ title: 'god of war' }]);
    expect(both.body.data.games).toEqual([]); // game 1 belongs to publisher 1
  });

  // 5. edit finds the index with reduce(..., 0), so an unknown id falls
  //    back to index 0 and overwrites the first record. Tested through the
  //    mutation module until mutations return payloads with userErrors.
  describe('5. editing an unknown id', () => {
    const editUnknown = (edit) => {
      try {
        edit();
      } catch (err) {
        // throwing is an acceptable fix; only the data matters here
      }
    };

    test('leaves publishers untouched', () => {
      const store = createStore();

      editUnknown(() => mutation.publisher.edit(store.publishers)({ input: { id: '9', title: 'x' } }));

      expect(store.publishers).toEqual(createStore().publishers);
    });

    test('leaves games untouched', () => {
      const store = createStore();

      editUnknown(() => mutation.game.edit(store.games)({ input: { id: '9', title: 'x', publisherId: '1' } }));

      expect(store.games).toEqual(createStore().games);
    });
  });

  // 6. addGame accepts a publisherId that doesn't exist, creating a game
  //    whose publisher resolves to nothing. P2's userErrors should reject it.
  test('6. addGame rejects an unknown publisherId', async () => {
    const store = createStore();

    await gql(createApp(store), QUERIES.addGameUnknownPublisher);

    expect(store.games).toHaveLength(createStore().games.length);
  });

  // 7. N+1: Games.publisher runs once per game, and each run reads the
  //    publishers. A per-request DataLoader should batch them into one read.
  test('7. publishers are read once for a list of games', async () => {
    const store = createStore();
    const counter = countPublisherReads(store);

    await gql(createApp(store), QUERIES.gamesWithPublishers);

    expect(counter.reads).toBe(1);
  });

  // 8. Loaders are created once per app, so their cache outlives the
  //    request: after a rename, later requests still get the cached title.
  //    Create loaders per request with the function form of `context`.
  test.skip('8. a later request sees a renamed publisher', async () => {
    const app = createApp();
    await gql(app, QUERIES.publisherOfGame); // caches publisher 1

    await gql(app, QUERIES.renamePublisher);
    const res = await gql(app, QUERIES.publisherOfGame);

    expect(res.body.data.games).toEqual([{ publisher: { title: 'KONAMI' } }]);
  });

  // 9. Even per-request loaders cache within the request. Mutation fields
  //    run in order, so a field that loads publisher 1 before a rename
  //    leaves the old title cached for fields after it. A mutation that
  //    writes should clear what it changed, e.g.
  //    loaders.publishersLoader.clear(id).
  test.skip('9. a rename is visible to later fields in the same request', async () => {
    const res = await gql(createApp(), QUERIES.renameBetweenLoads);

    expect(res.body.data).toEqual({
      before: { game: { publisher: { title: 'konami' } } },
      rename: { publisher: { title: 'KONAMI' } },
      after: { game: { publisher: { title: 'KONAMI' } } },
    });
  });
});

// Guards for the open bugs above: each bug test should fail on its
// assertion, not because its query errors. If a guard fails, fix it first.
describe('open bugs: the queries still run', () => {
  test.each(Object.entries(QUERIES))('%s returns data without errors', async (name, query) => {
    const res = await gql(createApp(), query);

    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(res.body.data).toBeDefined();
  });
});
