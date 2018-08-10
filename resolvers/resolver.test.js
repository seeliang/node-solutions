const { expect } = require('chai');
const { describe, it } = require('mocha');
const {
  resolver, join,
} = require('./index');

const oneGame = [{ id: '1', title: 'MGS', publisherId: '3' }];

const onePublisher = [{ id: '3', title: 'konami' }];

const Games = [
  { id: '1', title: 'metal gear solid', publisherId: '1' },
  { id: '2', title: 'god of war', publisherId: '2' },
  { id: '3', title: 'winning eleven', publisherId: '1' },
];

const Publishers = [
  { id: '1', title: 'konami' },
  { id: '2', title: 'santa monica' },
];


describe('the join resolvers', () => {
  describe('join game', () => {
    it('should join games to publishers', () => {
      const result = join.game({
        publishers: onePublisher,
        Games: oneGame,
        resolver,
      });
      expect(result).to.deep.equal([{
        id: '3',
        title: 'konami',
        games: [{
          id: '1',
          title: 'MGS',
          publisherId: '3',
        }],
      }]);
    });
  });

  describe('join publisher', () => {
    it('should join publishers to games', () => {
      const result = join.publisher({
        games: oneGame,
        Publishers: onePublisher,
        resolver,
      });
      expect(result).to.deep.equal(
        [
          {
            id: '1',
            title: 'MGS',
            publisherId: '3',
            publisher: [{ id: '3', title: 'konami' }],
          },
        ],
      );
    });
  });

  describe('publishersResolver', () => {
    it('by default it should join games to publisher', () => {
      const result = resolver.publishers({
        Publishers,
        Games,
        resolver,
        join,
      })({});

      expect(result).to.deep.equal([{
        id: '1',
        title: 'konami',
        games: [
          { id: '1', title: 'metal gear solid', publisherId: '1' },
          { id: '3', title: 'winning eleven', publisherId: '1' }],
      },
      {
        id: '2',
        title: 'santa monica',
        games: [{ id: '2', title: 'god of war', publisherId: '2' }],
      }]);
    });

    it('with correct id, it should join games to publishers', () => {
      const result = resolver.publishers({
        Publishers,
        Games,
        resolver,
        join,
      })({ id: '1' });
      expect(result).to.deep.equal([{
        id: '1',
        title: 'konami',
        games: [{ id: '1', title: 'metal gear solid', publisherId: '1' },
          { id: '3', title: 'winning eleven', publisherId: '1' }],
      }]);
    });

    it.skip('with wrong id, it should notify', () => {
      // const result = publishersResolver({
      //   Publishers,
      //   Games,
      //   gamesResolver,
      //   joinGame,
      // })({ id: '4' });
      // chai https://stackoverflow.com/questions/14966821/testing-for-errors-thrown-in-mocha
    });
  });


  describe('gamesResolver', () => {
    it('by default it should join publisher to games', () => {
      const result = resolver.games({
        Publishers,
        Games,
        resolver,
        join,
      })({});

      expect(result).to.deep.equal(
        [{
          id: '1', title: 'metal gear solid', publisherId: '1', publisher: [{ id: '1', title: 'konami' }],
        }, {
          id: '2', title: 'god of war', publisherId: '2', publisher: [{ id: '2', title: 'santa monica' }],
        }, {
          id: '3', title: 'winning eleven', publisherId: '1', publisher: [{ id: '1', title: 'konami' }],
        }],
      );
    });

    it('with correct id, it should join publishers to games', () => {
      const result = resolver.games({
        Publishers,
        Games,
        resolver,
        join,
      })({ id: '1' });

      expect(result).to.deep.equal(
        [{
          id: '1', title: 'metal gear solid', publisherId: '1', publisher: [{ id: '1', title: 'konami' }],
        }],
      );
    });

    it.skip('with wrong id, it should notify', () => {
    });
  });
});
