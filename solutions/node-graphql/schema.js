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

  type UserError {
    field: [String!]
    message: String!
  }

  type AddPublisherPayload {
    publisher: Publishers
    userErrors: [UserError!]!
  }

  type EditPublisherPayload {
    publisher: Publishers
    userErrors: [UserError!]!
  }

  type AddGamePayload {
    game: Games
    userErrors: [UserError!]!
  }

  type EditGamePayload {
    game: Games
    userErrors: [UserError!]!
  }

  type Mutation {
    addPublisher(input: AddPublisherInput!): AddPublisherPayload!
    editPublisher(input: EditPublisherInput!): EditPublisherPayload!
    addGame(input: AddGameInput!): AddGamePayload!
    editGame(input: EditGameInput!): EditGamePayload!
  }
`;

module.exports = typeDefs;
