var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    hi: String,
    games(id: Int, publisherId: Int): [Games],
    publishers(id: Int): [Publishers]
  }

  type Games {
    id: Int,
    title: String,
    publisher: Publishers
  }
  
  type Publishers {
    id: Int,
    title: String
  }
`);

//data

const Games = [
  {id:1, title: 'metal gear solid', publisherId: 1},
  {id:2, title: 'god of war', publisherId: 2},
  {id:3, title: 'winning eleven', publisherId: 1}
];

const Publishers =[
  {id: 1, title: 'konami'},
  {id: 2, title: 'santa monica'}
]

// resolver
const publishersResolver = (Publishers) => (args) => {
  if (args.id) {
    const publisher = Publishers.find(publisher => publisher.id === args.id)
    return [publisher]
  }
  return Publishers;
}

const joinPublisher = ({games, Publishers, publishersResolver}) =>  (
  games.map(game =>{
  const publisher = publishersResolver(Publishers)({id: game.publisherId})
  return Object.assign(game, {publisher: publisher[0]});
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

}

// resolver map
const resolverMap = {
  games: gamesResolver({Games,Publishers, publishersResolver, joinPublisher}),
  publishers: publishersResolver(Publishers)
}

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolverMap,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');