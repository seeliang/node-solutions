const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { Games, Publishers } = require('./data');

const {
  resolver, join,
} = require('./resolvers');

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

// Mutation
const addPublisher = p => ({ input }) => { // eslint-disable-line no-shadow
  const { title } = input;
  const id = `${p.length + 1}`;
  p.push({ id, title }); // not working ? => p = [...p, newPublisher];
  const i = p.length - 1;
  return [p[i]];
};

const mutation = {
  add: {
    publisher: addPublisher,
  },
};

// mapping
const apiMap = {
  games: resolver.games({
    Games: cache.games, Publishers: cache.publishers, resolver, join,
  }),
  publishers: resolver.publishers({
    Publishers: cache.publishers, Games: cache.games, resolver, join,
  }),
  addPublisher: mutation.add.publisher(cache.publishers),
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: apiMap,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
