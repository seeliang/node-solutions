const { normalize, schema } = require("normalizr");

// schema

const publisher = new schema.Entity("publisher");
const character = new schema.Entity("character");
const developer = new schema.Entity("developer");
const game = new schema.Entity("game", {
  developers: [developer],
  publishers: [publisher],
  characters: [character]
});

const gow = {
  id: 1,
  developers: [
    {
      id: 1,
      name: 'santa monica'
    }  
  ],
  publishers: [
    {
      id: 1,
      name: "sony computer entertainment"
    },
    {
      id: 2,
      name: "capcom"
    }
  ],
  name: "God of war",
  characters: [
    {
      id: 1,
      name: "Kratos"
    },
    {
      id: 2,
      name: "Athena"
    }
  ],
  publishYear: 2005
};
const normalizedData = normalize(gow, game);
console.log(JSON.stringify(normalizedData));

