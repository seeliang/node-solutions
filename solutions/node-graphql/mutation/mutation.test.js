const { expect } = require('chai');
const { describe, it } = require('mocha');
const mutation = require('./index.js');

const Games = [
  { id: '1', title: 'metal gear solid', publisherId: '1' },
  { id: '2', title: 'god of war', publisherId: '2' },
  { id: '3', title: 'winning eleven', publisherId: '1' },
];

const Publishers = [
  { id: '1', title: 'konami' },
  { id: '2', title: 'santa monica' },
];

describe('mutation', () => {
  describe('publishers', () => {
    it('should add publishers', () => {
      const testPublishers = [].concat(Publishers);
      const newPublisher = { title: 'capcom' };
      const result = mutation.publisher.add(testPublishers)({ input: newPublisher });
      expect(result).to.deep.eq([{ id: '3', title: 'capcom' }]);
      expect(testPublishers).to.deep.eq(
        [
          { id: '1', title: 'konami' },
          { id: '2', title: 'santa monica' },
          { id: '3', title: 'capcom' },
        ],
      );
    });

    it('should edit publishers', () => {
      const testPublishers = [].concat(Publishers);
      const newPublisher = { id: '1', title: 'capcom' };
      const result = mutation.publisher.edit(testPublishers)({ input: newPublisher });
      expect(result).to.deep.eq([{ id: '1', title: 'capcom' }]);
      expect(testPublishers).to.deep.eq(
        [
          { id: '1', title: 'capcom' },
          { id: '2', title: 'santa monica' },
        ],
      );
    });
  });

  describe('games', () => {
    it('should add games', () => {
      const testGame = [].concat(Games);
      const newGame = { title: 'contra', publisherId: '1' };
      const result = mutation.game.add(testGame)({ input: newGame });
      expect(result).to.deep.eq([{ id: '4', title: 'contra', publisherId: '1' }]);
      expect(testGame).to.deep.eq(
        [
          { id: '1', title: 'metal gear solid', publisherId: '1' },
          { id: '2', title: 'god of war', publisherId: '2' },
          { id: '3', title: 'winning eleven', publisherId: '1' },
          { id: '4', title: 'contra', publisherId: '1' },
        ],
      );
    });

    it('should edit game', () => {
      const testGames = [].concat(Games);
      const editGame = { id: '1', title: 'contra', publisherId: '1' };
      const result = mutation.game.edit(testGames)({ input: editGame });
      expect(result).to.deep.eq([editGame]);
      expect(testGames).to.deep.eq(
        [
          { id: '1', title: 'contra', publisherId: '1' },
          { id: '2', title: 'god of war', publisherId: '2' },
          { id: '3', title: 'winning eleven', publisherId: '1' },
        ],
      );
    });
  });
});
