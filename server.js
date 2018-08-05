const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { Games, Publishers } = require('./data');

const {
  gamesResolver, publishersResolver, joinGame, joinPublisher,
} = require('./resolvers');

const schema = buildSchema(`

  type Query {
    hi: String,
    games(id: ID, publisherId: ID): [Games],
    publishers(id: ID): [Publishers]
  }

  type Games {
    id: ID,
    title: String,
    publisher: [Publishers]
  }
  
  type Publishers {
    id: ID,
    title: String,
    games: [Games]
  }
`);


// resolver map
const resolverMap = {
  games: gamesResolver({
    Games, Publishers, publishersResolver, joinPublisher,
  }),
  publishers: publishersResolver({
    Publishers, Games, gamesResolver, joinGame,
  }),
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolverMap,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
