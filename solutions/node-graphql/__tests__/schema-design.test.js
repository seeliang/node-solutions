// Planned schema changes: nullability, then mutation payloads with userErrors.
//
// Same rules as known-issues.test.js: red until built, everything goes
// through /graphql. Nullability is a property of the schema, so it is read
// with an introspection query, which is part of the public API.
//
// Suggested order: nullability first (it changes response shapes), then
// payloads, which replace the list-typed mutation returns.
//
// If this branch is ever merged before these land, mark the red tests
// `test.failing` so the main build stays green.

const { createApp } = require('../app');
const { createStore } = require('../store');
const { gql } = require('../test-helpers');

// prints an introspected type the way SDL writes it, e.g. [Games!]!
const printType = (type) => {
  if (type.kind === 'NON_NULL') return `${printType(type.ofType)}!`;
  if (type.kind === 'LIST') return `[${printType(type.ofType)}]`;
  return type.name;
};

const TYPE_REF = 'kind name ofType { kind name ofType { kind name ofType { kind name } } }';

// { fieldName: { type: 'SDL type', args: { argName: 'SDL type' } } }
const fieldsOf = async (typeName) => {
  const res = await gql(createApp(), `{
    __type(name: "${typeName}") {
      fields { name type { ${TYPE_REF} } args { name type { ${TYPE_REF} } } }
    }
  }`);
  const type = res.body.data.__type; // eslint-disable-line no-underscore-dangle
  if (!type) return {};
  return Object.fromEntries(type.fields.map((field) => [field.name, {
    type: printType(field.type),
    args: Object.fromEntries(field.args.map((arg) => [arg.name, printType(arg.type)])),
  }]));
};

const typeOf = async (typeName, fieldName) => (await fieldsOf(typeName))[fieldName]?.type;

describe('nullability', () => {
  // always present, so already non-null: kept as a guard for the helper
  test('ids and titles are non-null', async () => {
    const games = await fieldsOf('Games');
    const publishers = await fieldsOf('Publishers');

    expect([games.id.type, games.title.type]).toEqual(['ID!', 'String!']);
    expect([publishers.id.type, publishers.title.type]).toEqual(['ID!', 'String!']);
  });

  // one publisher per game; nullable because a publisherId can match nothing
  // (this is known-issues 3 seen from the schema side)
  test('Games.publisher is a single, nullable Publishers', async () => {
    expect(await typeOf('Games', 'publisher')).toBe('Publishers');
  });

  // a list is never null (empty instead) and never holds a null
  test('Publishers.games is [Games!]!', async () => {
    expect(await typeOf('Publishers', 'games')).toBe('[Games!]!');
  });

  test('Query.games is [Games!]!', async () => {
    expect(await typeOf('Query', 'games')).toBe('[Games!]!');
  });

  test('Query.publishers is [Publishers!]!', async () => {
    expect(await typeOf('Query', 'publishers')).toBe('[Publishers!]!');
  });

  describe('behaviour the types promise', () => {
    test('a game whose publisherId matches nothing gets publisher: null, without errors', async () => {
      const store = createStore();
      store.games.push({ id: '9', title: 'contra', publisherId: '9' });

      const res = await gql(createApp(store), '{ games(id: "9") { title publisher { title } } }');

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.games).toEqual([{ title: 'contra', publisher: null }]);
    });

    test('a publisher with no games gets games: [], not null', async () => {
      const store = createStore();
      store.publishers.push({ id: '3', title: 'capcom' });

      const res = await gql(createApp(store), '{ publishers(id: "3") { games { title } } }');

      expect(res.body.data.publishers).toEqual([{ games: [] }]);
    });
  });
});

describe('mutation payloads', () => {
  const PAYLOADS = [
    ['addPublisher', 'AddPublisherInput!', 'AddPublisherPayload!'],
    ['editPublisher', 'EditPublisherInput!', 'EditPublisherPayload!'],
    ['addGame', 'AddGameInput!', 'AddGamePayload!'],
    ['editGame', 'EditGameInput!', 'EditGamePayload!'],
  ];

  test.each(PAYLOADS)('%s takes %s and returns %s', async (name, input, payload) => {
    const mutations = await fieldsOf('Mutation');

    expect(mutations[name]).toEqual({ type: payload, args: { input } });
  });

  test('UserError has a field path and a message', async () => {
    expect(await fieldsOf('UserError')).toEqual({
      field: { type: '[String!]', args: {} },
      message: { type: 'String!', args: {} },
    });
  });

  test.each([
    ['AddPublisherPayload', 'publisher', 'Publishers'],
    ['EditPublisherPayload', 'publisher', 'Publishers'],
    ['AddGamePayload', 'game', 'Games'],
    ['EditGamePayload', 'game', 'Games'],
  ])('%s has a nullable %s and userErrors', async (payload, field, type) => {
    const fields = await fieldsOf(payload);

    expect(fields[field]?.type).toBe(type);
    expect(fields.userErrors?.type).toBe('[UserError!]!');
  });

  describe('userErrors', () => {
    const PUBLISHER_RESULT = 'publisher { id title } userErrors { field message }';
    const GAME_RESULT = 'game { id title } userErrors { field message }';

    test('addPublisher succeeds with no userErrors', async () => {
      const res = await gql(createApp(), `mutation {
        addPublisher(input: { title: "capcom" }) { ${PUBLISHER_RESULT} }
      }`);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.addPublisher).toEqual({
        publisher: { id: '3', title: 'capcom' },
        userErrors: [],
      });
    });

    test('editPublisher with an unknown id reports it and changes nothing', async () => {
      const store = createStore();

      const res = await gql(createApp(store), `mutation {
        editPublisher(input: { id: "9", title: "x" }) { ${PUBLISHER_RESULT} }
      }`);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.editPublisher).toEqual({
        publisher: null,
        userErrors: [{ field: ['input', 'id'], message: expect.any(String) }],
      });
      expect(store.publishers).toEqual(createStore().publishers);
    });

    test('editGame with an unknown id reports it and changes nothing', async () => {
      const store = createStore();

      const res = await gql(createApp(store), `mutation {
        editGame(input: { id: "9", title: "x", publisherId: "1" }) { ${GAME_RESULT} }
      }`);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.editGame).toEqual({
        game: null,
        userErrors: [{ field: ['input', 'id'], message: expect.any(String) }],
      });
      expect(store.games).toEqual(createStore().games);
    });

    test('addGame with an unknown publisherId reports it and adds nothing', async () => {
      const store = createStore();

      const res = await gql(createApp(store), `mutation {
        addGame(input: { title: "contra", publisherId: "9" }) { ${GAME_RESULT} }
      }`);

      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.addGame).toEqual({
        game: null,
        userErrors: [{ field: ['input', 'publisherId'], message: expect.any(String) }],
      });
      expect(store.games).toEqual(createStore().games);
    });

    // the current existence check asks "does any GAME use this publisherId?",
    // not "does the publisher exist?", so a new publisher can't get a first game
    test('addGame accepts a publisher that has no games yet', async () => {
      const store = createStore();
      const app = createApp(store);
      await gql(app, 'mutation { addPublisher(input: { title: "capcom" }) { publisher { id } } }');

      const res = await gql(app, `mutation {
        addGame(input: { title: "street fighter", publisherId: "3" }) { ${GAME_RESULT} }
      }`);
      console.log(store);
      expect(res.body.errors).toBeUndefined();
      expect(res.body.data.addGame).toEqual({
        game: { id: '4', title: 'street fighter' },
        userErrors: [],
      });
    });
  });
});
