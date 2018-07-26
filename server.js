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

const joinPublisher = ({game, Publishers, publishersResolver}) => {
  const {publisherId} = game;
  const publisher = publishersResolver(Publishers)({id: publisherId})
  return Object.assign(game, {publisher: publisher[0]});
}

const gamesResolver =({Games, Publishers, publishersResolver,joinPublisher}) => (args) => {
  if (args.id) {
    const game = Games.find(game => { 
      if (game.id === args.id) {
        return joinPublisher({game, Publishers, publishersResolver})
      }
    })
    return [game]
  }
  return Games;
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