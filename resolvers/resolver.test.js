const { expect } = require('chai');
const {
  gamesResolver, publishersResolver, joinGame, joinPublisher,
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
  describe('joinGames', () => {
    it('should join games to publisher', () => {
      const result = joinGame({
        publishers: onePublisher,
        Games: oneGame,
        gamesResolver,
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

  describe('joinPublisher', () => {
    it('should join publisher to games', () => {
      const result = joinPublisher({
        games: oneGame,
        Publishers: onePublisher,
        publishersResolver,
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
      const result = publishersResolver({
        Publishers,
        Games,
        gamesResolver,
        joinGame,
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

    it('with correct id, it should join games to publisher', () => {
      const result = publishersResolver({
        Publishers,
        Games,
        gamesResolver,
        joinGame,
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
      const result = gamesResolver({
        Publishers,
        Games,
        publishersResolver,
        joinPublisher,
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

    it('with correct id, it should join games to publisher', () => {
      const result = gamesResolver({
        Publishers,
        Games,
        publishersResolver,
        joinPublisher,
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
