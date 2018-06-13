var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    hi: String,
    games: [Game],
    publishers: [Publisher]
  }

  type Game {
    id: ID,
    title: String,
    publisherId: Int
  }
  
  type Publisher {
    id: ID,
    title: String
  }
`);


var root = {
  hi: () => 'Just to say hi, you made it',
  games: () => [
    {id:1, title: 'metal gear solid', publisherId: 1},
    {id:2, title: 'god of war', publisherId: 2},
    {id:3, title: 'winning eleven', publisherId: 1}
  ],

  publishers: () => [
    {id: 1, title: 'konami'},
    {id: 2, title: 'santa monica'}
  ]
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');