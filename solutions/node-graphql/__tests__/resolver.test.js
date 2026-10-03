const { resolver } = require('../resolver');

const Games = [
  { id: '1', title: 'metal gear solid', publisherId: '1' },
  { id: '2', title: 'god of war', publisherId: '2' },
  { id: '3', title: 'winning eleven', publisherId: '1' },
];

const Publishers = [
  { id: '1', title: 'konami' },
  { id: '2', title: 'santa monica' },
];

// resolvers are called as (parent, args, context); context is the store
const createContext = () => ({
  games: Games.map((game) => ({ ...game })),
  publishers: Publishers.map((publisher) => ({ ...publisher })),
});

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
    test('publisher resolves the parent game\'s publisher', () => {
      const result = resolver.GamesTrace.publisher(Games[0], {}, createContext());
      expect(result).toEqual([Publishers[0]]);
    });

    test('publisher is empty when publisherId matches nothing', () => {
      const orphan = { id: '9', title: 'contra', publisherId: '9' };
      const result = resolver.GamesTrace.publisher(orphan, {}, createContext());
      expect(result).toEqual([]);
    });
  });

  describe('Publishers', () => {
    test('games resolves the parent publisher\'s games', () => {
      const result = resolver.PublishersTrace.games(Publishers[0], {}, createContext());
      expect(result).toEqual([Games[0], Games[2]]);
    });

    test('games is empty for a publisher with no games', () => {
      const capcom = { id: '3', title: 'capcom' };
      const result = resolver.PublishersTrace.games(capcom, {}, createContext());
      expect(result).toEqual([]);
    });
  });

  // mutation logic is covered in mutation.test.js; these check the
  // resolvers write to the store passed in as context
  describe('Mutation', () => {
    test('addPublisher writes to context.publishers', () => {
      const context = createContext();
      const result = resolver.Mutation.addPublisher(undefined, { input: { title: 'capcom' } }, context);

      expect(result).toEqual([{ id: '3', title: 'capcom' }]);
      expect(context.publishers).toContainEqual({ id: '3', title: 'capcom' });
    });

    test('editPublisher writes to context.publishers', () => {
      const context = createContext();
      resolver.Mutation.editPublisher(undefined, { input: { id: '2', title: 'sony' } }, context);

      expect(context.publishers[1]).toEqual({ id: '2', title: 'sony' });
    });

    test('addGame writes to context.games', () => {
      const context = createContext();
      const result = resolver.Mutation.addGame(undefined, { input: { title: 'contra', publisherId: '1' } }, context);

      expect(result).toEqual([{ id: '4', title: 'contra', publisherId: '1' }]);
      expect(context.games).toHaveLength(4);
    });

    test('editGame writes to context.games', () => {
      const context = createContext();
      resolver.Mutation.editGame(undefined, { input: { id: '2', title: 'god of war ii', publisherId: '2' } }, context);

      expect(context.games[1]).toEqual({ id: '2', title: 'god of war ii', publisherId: '2' });
    });

    test('mutations do not touch the fixtures', () => {
      resolver.Mutation.addPublisher(undefined, { input: { title: 'capcom' } }, createContext());
      expect(Publishers).toHaveLength(2);
    });
  });
});
