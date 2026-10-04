// resolver: data comes from context (the store), never from require
const mutation = require('../mutation');

const Query = {
  hi: () => 'hi',
  games: (_, { id, publisherId }, { games }) => {
    let filteredGames = games;
    if (id) {
      filteredGames = filteredGames.filter((g) => g.id === id);
    }
    if (publisherId) {
      filteredGames = filteredGames.filter((g) => g.publisherId === publisherId);
    }
    return filteredGames;
  },
  publishers: (_, { id }, { publishers }) => (id ? publishers.filter((p) => p.id === id) : publishers),
};

const resolver = {
  Query,
  GamesTrace: {
    publisher: (game, _, { publishers }) => publishers.filter((p) => p.id === game.publisherId),
  },
  PublishersTrace: {
    games: (publisher, _, { games }) => games.filter((g) => g.publisherId === publisher.id),
  },
  Mutation: {
    addPublisher: (_, args, { publishers }) => mutation.publisher.add(publishers)(args),
    editPublisher: (_, args, { publishers }) => mutation.publisher.edit(publishers)(args),
    addGame: (_, args, { games }) => mutation.game.add(games)(args),
    editGame: (_, args, { games }) => mutation.game.edit(games)(args),
  },
};

module.exports = {
  resolver,
};
