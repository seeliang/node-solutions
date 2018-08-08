// resolver

const join = {
  game: ({ publishers, Games, resolver }) => (
    publishers.map((publisher) => {
      const games = resolver.games({ Games })({ publisherId: publisher.id });
      return { ...publisher, games };
    })
  ),
  publisher: ({ games, Publishers, resolver }) => (
    games.map((game) => {
      const publisher = resolver.publishers({ Publishers })({ id: game.publisherId });
      return { ...game, publisher };
    })
  ),
};

const publishersResolver = ({
  Publishers, Games, resolver, join, // eslint-disable-line no-shadow
}) => ({ id }) => {
  let data = [];
  if (typeof id === 'undefined') {
    return join.game({ publishers: Publishers, Games, resolver });
  }
  if (id) {
    const result = Publishers.find(publisher => publisher.id === id);
    data = typeof result === 'object' ? [...data, result] : data;
  }

  if (resolver && Games && join) {
    return join.game({ publishers: data, Games, resolver });
  }

  return data;
};

const gamesResolver = ({
  Games, Publishers, resolver, join, // eslint-disable-line no-shadow
}) => ({ id, publisherId }) => {
  let data = [];
  if (typeof id === 'undefined' && typeof publisherId === 'undefined') {
    return join.publisher({ games: Games, Publishers, resolver });
  }
  if (id) {
    const result = Games.find(game => game.id === id);
    data = typeof result === 'object' ? [...data, result] : data;
  }
  if (publisherId) {
    data = Games.filter(game => game.publisherId === publisherId);
  }

  if (Publishers && publishersResolver && join) {
    return join.publisher({ games: data, Publishers, resolver });
  }

  return data;
};

const resolver = {
  games: gamesResolver,
  publishers: publishersResolver,
};

module.exports = {
  resolver,
  join,
};
