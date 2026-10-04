const { resolver } = require('../resolver');
const { createStore } = require('../store');
const { createLoaders } = require('../app');
const { Games, Publishers } = require('../data');

// resolvers are called as (parent, args, context); context holds a fresh
// store and per-request loaders over that same store, as in the app
const createContext = () => {
  const store = createStore();
  return { store, loaders: createLoaders(store) };
};

describe('resolver', () => {
  describe('Query', () => {
    test('hi says hi', () => {
      expect(resolver.Query.hi()).toBe('hi');
    });

    test('games returns all games without id', () => {
      const result = resolver.Query.games(undefined, {}, createContext());
      expect(result).toEqual(Games);
    });

    test('games filters by id', () => {
      const result = resolver.Query.games(undefined, { id: '2' }, createContext());
      expect(result).toEqual([Games[1]]);
    });

    test('games returns empty list for unknown id', () => {
      const result = resolver.Query.games(undefined, { id: '9' }, createContext());
      expect(result).toEqual([]);
    });

    test('publishers returns all publishers without id', () => {
      const result = resolver.Query.publishers(undefined, {}, createContext());
      expect(result).toEqual(Publishers);
    });

    test('publishers filters by id', () => {
      const result = resolver.Query.publishers(undefined, { id: '1' }, createContext());
      expect(result).toEqual([Publishers[0]]);
    });

    test('publishers returns empty list for unknown id', () => {
      const result = resolver.Query.publishers(undefined, { id: '9' }, createContext());
      expect(result).toEqual([]);
    });
  });

  describe('Games', () => {
    test('publisher resolves the parent game\'s publisher', async () => {
      const result = await resolver.GamesTrace.publisher(Games[0], {}, createContext());
      expect(result).toEqual(Publishers[0]);
    });

    test('publisher is empty when publisherId matches nothing', async () => {
      const orphan = { id: '9', title: 'contra', publisherId: '9' };
      const result = await resolver.GamesTrace.publisher(orphan, {}, createContext());
      expect(result).toEqual(null);
    });
  });

  describe('Publishers', () => {
    test('games resolves the parent publisher\'s games', async () => {
      const result = await resolver.PublishersTrace.games(Publishers[0], {}, createContext());
      expect(result).toEqual([Games[0], Games[2]]);
    });

    test('games is empty for a publisher with no games', async () => {
      const capcom = { id: '3', title: 'capcom' };
      const result = await resolver.PublishersTrace.games(capcom, {}, createContext());
      expect(result).toEqual([]);
    });
  });

  // mutation logic is covered in mutation.test.js; these check the
  // resolvers write to the store passed in as context
  describe('Mutation', () => {
    test('addPublisher writes to context.publishers', () => {
      const context = createContext();
      const result = resolver.Mutation.addPublisher(undefined, { input: { title: 'capcom' } }, context);
      console.log("addPublisher", { result, context });
      expect(result).toEqual([{ id: '3', title: 'capcom' }]);
      expect(context.store.publishers).toContainEqual({ id: '3', title: 'capcom' });
    });

    test('editPublisher writes to context.publishers', () => {
      const context = createContext();
      resolver.Mutation.editPublisher(undefined, { input: { id: '2', title: 'sony' } }, context);

      expect(context.store.publishers[1]).toEqual({ id: '2', title: 'sony' });
    });

    test('addGame writes to context.games', () => {
      const context = createContext();
      const result = resolver.Mutation.addGame(undefined, { input: { title: 'contra', publisherId: '1' } }, context);

      expect(result).toEqual([{ id: '4', title: 'contra', publisherId: '1' }]);
      expect(context.store.games).toHaveLength(4);
    });

    test('editGame writes to context.games', () => {
      const context = createContext();
      resolver.Mutation.editGame(undefined, { input: { id: '2', title: 'god of war ii', publisherId: '2' } }, context);

      expect(context.store.games[1]).toEqual({ id: '2', title: 'god of war ii', publisherId: '2' });
    });

    test('mutations do not touch the fixtures', () => {
      resolver.Mutation.addPublisher(undefined, { input: { title: 'capcom' } }, createContext());
      expect(Publishers).toHaveLength(2);
    });
  });
});
