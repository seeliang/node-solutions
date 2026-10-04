// resolver: data comes from context (the store), never from require
const mutation = require('../mutation');

const Query = {
  hi: () => 'hi',
  games: (_, { id, publisherId }, { store: { games } }) => {
    // console.log("games query", { id, games });
    let filteredGames = games;
    if (id) {
      filteredGames = filteredGames.filter((g) => g.id === id);
    }
    if (publisherId) {
      filteredGames = filteredGames.filter((g) => g.publisherId === publisherId);
    }
    return filteredGames;
  },
  publishers: (_, { id }, { store: { publishers } }) => (id ? publishers.filter((p) => p.id === id) : publishers),
};

const resolver = {
  Query,
  GamesTrace: {
    publisher: (game, _, { loaders: { publishersLoader } }) => publishersLoader.load(game.publisherId),
  },
  PublishersTrace: {
    games: (publisher, _, { loaders: { gamesLoader } }) => gamesLoader.load(publisher.id),
  },
  Mutation: {
    addPublisher: (_, args, { store: { publishers } }) => mutation.publisher.add(publishers)(args),
    editPublisher: (_, args, { store: { publishers } }) => mutation.publisher.edit(publishers)(args),
    addGame: (_, args, { store: { games } }) => mutation.game.add(games)(args),
    editGame: (_, args, { store: { games } }) => mutation.game.edit(games)(args),
  },
};

module.exports = {
  resolver,
};
