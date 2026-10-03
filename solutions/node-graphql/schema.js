const typeDefs = `#graphql
  type Query {
    hi: String
    games(id: ID, publisherId: ID): [Games]
    publishers(id: ID): [Publishers]
  }

  type Games {
    id: ID!
    title: String!
    publisher: [Publishers]!
  }

  type Publishers {
    id: ID!
    title: String!
    games: [Games!]
  }

  input AddPublisherInput {
    title: String!
  }

  input EditPublisherInput {
    id: ID!
    title: String!
  }

  input addGameInput {
    title: String!
    publisherId: ID!
  }

  input editGameInput {
    id: ID!
    title: String!
    publisherId: ID!
  }

  type Mutation {
    addPublisher(input: AddPublisherInput): [Publishers]
    editPublisher(input: EditPublisherInput): [Publishers]
    addGame(input: addGameInput): [Games]
    editGame(input: editGameInput): [Games]
  }
`;

module.exports = typeDefs;
