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

// Connection URL
const url = 'mongodb://localhost:27017';


// Database Name
const dbName = 'games';
const connection = 'results';
// Use connect method to connect to the server

const connectDb = () => new Promise((res, rej) => {
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      assert.equal(null, err);
      if (err) {
        rej(err);
        return;
      }
      console.log('Connected successfully to db');
      const db = client.db(dbName);
      res(db);
    },
  );
});


// api

api.listen(port, () => {
  console.log(`api is running on port ${port}`);
});

// get
const findAllGames = async (db, callback) => {
  const cursor = await db.collection(connection).find({}).toArray();
  callback(cursor);
};

api.get('/get/games', (req, res) => {
  connectDb().then((db) => {
    findAllGames(db, (feed) => res.json(feed));
  });
});

// post

const insertGame = (db, data, callback) => {
  const collection = db.collection(connection);
  const insertData = {
    ...normalize(data, game).entities,
  };
  collection.insertMany([insertData], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    assert.equal(err, null);
    console.log('Inserted entry into the collection');
    callback(result);
  });
};

api.post('/post/games', (req, res) => {
  const data = req.body;
  connectDb().then((db) => {
    insertGame(db, data, (feed) => res.json(feed));
  });
});


/* testing json
{
  "id": 1,
  "developers": [
    {
      "id": 1,
      "name": "santa monica"
    }
  ],
  "publishers": [
    {
      "id": 1,
      "name": "sony computer entertainment"
    },
    {
      "id": 2,
      "name": "capcom"
    }
  ],
  "name": "God of war",
  "characters": [
    {
      "id": 1,
      "name": "Kratos"
    },
    {
      "id": 2,
      "name": "Athena"
    }
  ],
  "publishYear": 2005
}
*/
