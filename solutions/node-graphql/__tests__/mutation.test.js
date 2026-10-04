const mutation = require('../mutation');
const { createStore } = require('../store');

// each test edits a fresh copy of the seed data (objects copied too)
const fresh = () => createStore();

describe('mutation', () => {
  describe('publishers', () => {
    test('should add publishers', () => {
      const testPublishers = fresh().publishers;
      const newPublisher = { title: 'capcom' };
      const result = mutation.publisher.add(testPublishers)({ input: newPublisher });
      expect(result).toEqual([{ id: '3', title: 'capcom' }]);
      expect(testPublishers).toEqual(
        [
          { id: '1', title: 'konami' },
          { id: '2', title: 'santa monica' },
          { id: '3', title: 'capcom' },
        ],
      );
    });

    test('should edit publishers', () => {
      const testPublishers = fresh().publishers;
      const newPublisher = { id: '1', title: 'capcom' };
      const result = mutation.publisher.edit(testPublishers)({ input: newPublisher });
      expect(result).toEqual([{ id: '1', title: 'capcom' }]);
      expect(testPublishers).toEqual(
        [
          { id: '1', title: 'capcom' },
          { id: '2', title: 'santa monica' },
        ],
      );
    });
  });

  describe('games', () => {
    test('should add games', () => {
      const testGame = fresh().games;
      const newGame = { title: 'contra', publisherId: '1' };
      const result = mutation.game.add(testGame)({ input: newGame });
      expect(result).toEqual([{ id: '4', title: 'contra', publisherId: '1' }]);
      expect(testGame).toEqual(
        [
          { id: '1', title: 'metal gear solid', publisherId: '1' },
          { id: '2', title: 'god of war', publisherId: '2' },
          { id: '3', title: 'winning eleven', publisherId: '1' },
          { id: '4', title: 'contra', publisherId: '1' },
        ],
      );
    });

    test('should edit game', () => {
      const testGames = fresh().games;
      const editGame = { id: '1', title: 'contra', publisherId: '1' };
      const result = mutation.game.edit(testGames)({ input: editGame });
      expect(result).toEqual([editGame]);
      expect(testGames).toEqual(
        [
          { id: '1', title: 'contra', publisherId: '1' },
          { id: '2', title: 'god of war', publisherId: '2' },
          { id: '3', title: 'winning eleven', publisherId: '1' },
        ],
      );
    });
  });
});
