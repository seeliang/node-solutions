const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ruruHTML } = require('ruru/server');

const typeDefs = require('./schema');
const { resolver } = require('./resolver');
const { createStore } = require('./store');

// each key must be a type in typeDefs

const { GamesTrace, PublishersTrace, Query, Mutation } = resolver
const resolvers = {
  Query,
  Games: GamesTrace,
  Publishers: PublishersTrace,
  Mutation
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const createApp = () => {
  const app = express();
  const store = createStore();
  // GraphiQL lives on its own path so GET /graphql?query=... still reaches the API

  app.get('/graphiql', (req, res) => {
    res.type('html').send(ruruHTML({ endpoint: '/graphql' }));
  });
  app.all('/graphql', createHandler({ schema, context: store }));
  return app;
};

module.exports = createApp();
module.exports.createApp = createApp;
