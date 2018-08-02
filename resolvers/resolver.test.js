const { expect } = require('chai');
const {
  gamesResolver, publishersResolver, joinGame, joinPublisher,
} = require('./index');


const games = [{ id: 1, title: 'MGS', publisherId: 3 }];


const publishers = [{ id: 3, title: 'konami' }];

describe('the join resolvers', () => {
  describe('joinGames', () => {
    it('should join games to publisher', () => {
      const result = joinGame({ publishers, Games: games, gamesResolver });
      expect(result).to.deep.equal([{ id: 3, title: 'konami', games: [{ id: 1, title: 'MGS', publisherId: 3 }] }]);
    });
  });

  describe('joinPublisher', () => {
    it('should join publisher to games', () => {
      const result = joinPublisher({ games, Publishers: publishers, publishersResolver });
      expect(result).to.deep.equal(
        [
          {
            id: 1, title: 'MGS', publisherId: 3, publisher: [{ id: 3, title: 'konami' }],
          },
        ],
      );
    });
  });
});
