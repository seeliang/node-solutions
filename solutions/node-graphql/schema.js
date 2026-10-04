const typeDefs = `#graphql
  type Query {
    hi: String
    games(id: ID, publisherId: ID): [Games!]!
    publishers(id: ID): [Publishers!]!
  }

  type Games {
    id: ID!
    title: String!
    publisher: Publishers
  }

  type Publishers {
    id: ID!
    title: String!
    games: [Games!]!
  }

  input AddPublisherInput {
    title: String!
  }

  input EditPublisherInput {
    id: ID!
    title: String!
  }

  input AddGameInput {
    title: String!
    publisherId: ID!
  }

  input EditGameInput {
    id: ID!
    title: String!
    publisherId: ID!
  }

  type Mutation {
    addPublisher(input: AddPublisherInput!): [Publishers]
    editPublisher(input: EditPublisherInput!): [Publishers]
    addGame(input: AddGameInput!): [Games]
    editGame(input: EditGameInput!): [Games]
  }
`;

module.exports = typeDefs;
