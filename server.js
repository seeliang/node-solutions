const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { Games, Publishers } = require('./data');

const {
  resolver, join,
} = require('./resolvers');

const cacheGames = Games;
let cachePublishers = Publishers;

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
    addPublisher(input: PublisherInput): Publishers
  }
`);

// Mutation

const addPublisher = ({ Publishers }) => ({ input }) => { // eslint-disable-line no-shadow
  const { title } = input;
  const id = (Publishers.length + 1);
  const newPublisher = { id, title };
  cachePublishers = [...Publishers, newPublisher];
  return { id, title };
};

// mapping
const apiMap = {
  games: resolver.games({
    Games: cacheGames, Publishers: cachePublishers, resolver, join,
  }),
  publishers: resolver.publishers({
    Publishers: cachePublishers, Games: cacheGames, resolver, join,
  }),
  addPublisher: addPublisher({ Publishers: cachePublishers }),
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: apiMap,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
