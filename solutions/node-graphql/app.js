const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');

const schema = require('./schema');
const { Games, Publishers } = require('./data');
const mutation = require('./mutation');
const { resolver, join } = require('./resolver');

// in-memory store, copied so mutations never touch the seed data
const createRootValue = () => {
  const games = Games.map((game) => ({ ...game }));
  const publishers = Publishers.map((publisher) => ({ ...publisher }));

  return {
    hi: () => 'hi',
    games: resolver.games({
      Games: games, Publishers: publishers, resolver, join,
    }),
    publishers: resolver.publishers({
      Publishers: publishers, Games: games, resolver, join,
    }),
    addPublisher: mutation.publisher.add(publishers),
    addGame: mutation.game.add(games),
    editPublisher: mutation.publisher.edit(publishers),
    editGame: mutation.game.edit(games),
  };
};

const createApp = () => {
  const app = express();
  app.all('/graphql', createHandler({ schema, rootValue: createRootValue() }));
  return app;
};

module.exports = createApp();
module.exports.createApp = createApp;
