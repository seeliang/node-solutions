// resolver

const join = {
  game: ({ publishers, Games, gamesResolver }) => (
    publishers.map((publisher) => {
      const games = gamesResolver({ Games })({ publisherId: publisher.id });
      return { ...publisher, games };
    })
  ),
  publisher: ({ games, Publishers, publishersResolver }) => (
    games.map((game) => {
      const publisher = publishersResolver({ Publishers })({ id: game.publisherId });
      return { ...game, publisher };
    })
  ),
};

const publishersResolver = ({
  Publishers, Games, gamesResolver, join, // eslint-disable-line no-shadow
}) => ({ id }) => {
  let data = [];
  if (typeof id === 'undefined') {
    return join.game({ publishers: Publishers, Games, gamesResolver });
  }
  if (id) {
    const result = Publishers.find(publisher => publisher.id === id);
    data = typeof result === 'object' ? [...data, result] : data;
  }

  if (gamesResolver && Games && join) {
    return join.game({ publishers: data, Games, gamesResolver });
  }

  return data;
};

const gamesResolver = ({
  Games, Publishers, publishersResolver, join, // eslint-disable-line no-shadow
}) => ({ id, publisherId }) => {
  let data = [];
  if (typeof id === 'undefined' && typeof publisherId === 'undefined') {
    return join.publisher({ games: Games, Publishers, publishersResolver });
  }
  if (id) {
    const result = Games.find(game => game.id === id);
    data = typeof result === 'object' ? [...data, result] : data;
  }
  if (publisherId) {
    data = Games.filter(game => game.publisherId === publisherId);
  }

  if (Publishers && publishersResolver && join) {
    return join.publisher({ games: data, Publishers, publishersResolver });
  }

  return data;
};

module.exports = {
  gamesResolver,
  publishersResolver,
  join,
};
