const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { Games, Publishers } = require('./data');
const mutation = require('./mutation');

const {
  resolver, join,
} = require('./resolver');

const cache = {
  games: Games,
  publishers: Publishers,
};

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

  input PublisherInput{
    title: String
  }

  type Mutation {
    addPublisher(input: PublisherInput): [Publishers]
  }
`);

// mapping
const apiMap = {
  games: resolver.games({
    Games: cache.games, Publishers: cache.publishers, resolver, join,
  }),
  publishers: resolver.publishers({
    Publishers: cache.publishers, Games: cache.games, resolver, join,
  }),
  addPublisher: mutation.publisher.add(cache.publishers),
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: apiMap,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
