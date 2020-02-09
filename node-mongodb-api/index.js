const { MongoClient } = require('mongodb');
const assert = require('assert');
const { normalize, schema } = require('normalizr');
const { api, port } = require('./api');

// schema

const publisher = new schema.Entity('publisher');
const character = new schema.Entity('character');
const developer = new schema.Entity('developer');
const game = new schema.Entity('game', {
  developers: [developer],
  publishers: [publisher],
  characters: [character],
});
const gow = {
  id: 1,
  developers: [
    {
      id: 1,
      name: 'santa monica',
    },
  ],
  publishers: [
    {
      id: 1,
      name: 'sony computer entertainment',
    },
    {
      id: 2,
      name: 'capcom',
    },
  ],
  name: 'God of war',
  characters: [
    {
      id: 1,
      name: 'Kratos',
    },
    {
      id: 2,
      name: 'Athena',
    },
  ],
  publishYear: 2005,
};
const normalizedData = normalize(gow, game);

// Connection URL
const url = 'mongodb://localhost:27017';


// Database Name
const dbName = 'games';
const connection = 'results';
// Use connect method to connect to the server
const findAllGames = (db, callback) => {
  const cursor = db.collection(connection).find({});
  callback(cursor);
};

MongoClient.connect(
  url,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    assert.equal(null, err);
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    // insertGame(db, function(result) {
    //   console.log(result);
    //   client.close();
    // });
    findAllGames(db, (data) => data.forEach((i) => console.log(JSON.stringify(i))));
  },
);


const insertGame = (db, callback) => {
  const collection = db.collection(connection);
  collection.insertMany([normalizedData], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    assert.equal(err, null);
    console.log('Inserted entry into the collection');
    callback(result);
  });
};


// api

api.listen(port, () => {
  console.log(`api is running on port ${port}`);
});

api.get('/get/games', (req, res) => {
  const games = [{ pacman: 'japan' }];
  res.json(games);
});
