const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { ruruHTML } = require('ruru/server');

const typeDefs = require('./schema');
const { resolver } = require('./resolver');
const { createStore } = require('./store');
const DataLoader = require('dataloader');

// each key must be a type in typeDefs

const { GamesTrace, PublishersTrace, Query, Mutation } = resolver
const resolvers = {
  Query,
  Games: GamesTrace,
  Publishers: PublishersTrace,
  Mutation
};



const createLoaders = (store) => {
  return {
    publishersLoader: new DataLoader(async (gameIds) => {
      let cachePublishers = {
      }; // simple in-memory cache for DataLoader
      if (gameIds.every((id) => cachePublishers[id])) {
        console.log("has all game,  cache:", cachePublishers, "gameIds:", gameIds);
        return gameIds.map((id) => cachePublishers[id]);
      }
      // console.log("cache:", cachePublishers, "gameIds:", gameIds);
      const publishers = await store.publishers.filter((p) => gameIds.includes(p.id));
      gameIds.forEach((id) => { console.log(id, publishers); cachePublishers[id] = publishers.find((p) => p.id === id) || null; });
      return gameIds.map((id) => publishers.find((p) => p.id === id) || null);
    }),
    gamesLoader: new DataLoader(async (publisherIds) => {
      const games = await store.games.filter((g) => publisherIds.includes(g.publisherId));
      return publisherIds.map((id) => games.filter((g) => g.publisherId === id));
    }),
  };
}

// tests may pass their own store to observe how resolvers use it
const createApp = (store = createStore()) => {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const app = express();
  // GraphiQL lives on its own path so GET /graphql?query=... still reaches the API

  app.get('/graphiql', (req, res) => {
    res.type('html').send(ruruHTML({ endpoint: '/graphql' }));
  });

  const loaders = createLoaders(store);
  app.all('/graphql', createHandler({
    schema, context: {
      store,
      loaders
    }
  }));
  return app;
};

module.exports = createApp();
module.exports.createApp = createApp;
module.exports.createLoaders = createLoaders;
