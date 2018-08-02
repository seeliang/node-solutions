const {gamesResolver,publishersResolver,joinGame,joinPublisher} = require('./index');

const {expect} = require('chai');

describe('joinResolvers', () => {
  describe('joinGames', () => {
    it('should join games to publisher', () => {
      const games = [{ id: 1, title: 'MGS', publisherId: 3}],
        publishers = [{id: 3, title: 'konami'}];
      const result = joinGame({publishers, Games: games, gamesResolver});
      expect(result).to.deep.equal([{id:3, title: 'konami', games:[{id: 1, title:'MGS', publisherId:3}]}])
    });
  });
});