var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    hi: String,
    games: [Game]
  }

  type Game {
    id: ID,
    title: String,
    publisher: String
  }
  
`);


var root = {
  hi: () => 'Just to say hi, you made it',
  games: () => [
    {id:1, title: 'metal gear solid', publisher: 'konami'},
    {id:2, title: 'god of war', publisher: 'santa monica'},
    {id:3, title: 'winning eleven', publisher: 'konami'}
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