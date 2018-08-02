// resolver
const joinGame = ({publishers, Games, gamesResolver}) => {
  const content = publishers.map(publisher =>{
    const games = gamesResolver({Games})({publisherId: publisher.id})
    return {...publisher, games};
  });
  return content;
}

const publishersResolver = ({Publishers, Games, gamesResolver, joinGame}) => ({id}) => {
  let data = [];
  if(typeof id === 'undefined') {
    return joinGame({publishers: Publishers, Games, gamesResolver});
  }
  if (id) {
    const publisher = Publishers.find(publisher => publisher.id === id)
    data = typeof publisher === 'object' ? [...data, publisher] : data;
  }
  if (data.length === 0) {
    throw new Error ('could not find publisher');
  }

  if (gamesResolver && Games && joinGame) {
    return joinGame({publishers: data, Games, gamesResolver});
  }

  return data;
}

const joinPublisher = ({games, Publishers, publishersResolver}) =>  (
  games.map(game =>{
    const publisher = publishersResolver({Publishers})({id: game.publisherId})
    return {...game, publisher};
  })
)

const gamesResolver =({Games,Publishers, publishersResolver, joinPublisher}) => ({id, publisherId}) => {
  let data = [];
  if(typeof id === 'undefined' && typeof publisherId === 'undefined') {
    return joinPublisher({games: Games, Publishers, publishersResolver});
  }
  if (id) {
    let game = Games.find(game => game.id === id);
    data = typeof game === 'object' ? [...data, game] : data;
  }
  if(publisherId) {
    data = Games.filter(game => game.publisherId === publisherId)
  }
  if (data.length === 0) {
    throw new Error ('could not find game');
  }

  if (Publishers && publishersResolver && joinPublisher) {
    return joinPublisher({games: data, Publishers, publishersResolver});
  }

  return data;

}

module.exports = {
  gamesResolver,
  publishersResolver,
  joinGame,
  joinPublisher
};