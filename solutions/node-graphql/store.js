const { Games, Publishers } = require('./data');

const copy = (list) => list.map((item) => ({ ...item }));

// a fresh in-memory database; app.js creates one per app
const createStore = () => ({
  games: copy(Games),
  publishers: copy(Publishers),
});

module.exports = { createStore };
