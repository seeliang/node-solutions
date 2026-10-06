const request = require('supertest');

const gql = (app, query, variables) => request(app)
  .post('/graphql')
  .send({ query, variables });

// counts every read of store.publishers, so a test can tell whether (and how
// often) resolvers looked publishers up. If context ever spreads the store
// (e.g. `{ ...store, loaders }`), the spread itself is one read: adjust then.
const countPublisherReads = (store) => {
  const publishers = store.publishers;
  const counter = { reads: 0 };
  Object.defineProperty(store, 'publishers', {
    get: () => {
      counter.reads += 1;
      return publishers;
    },
  });
  return counter;
};

module.exports = { gql, countPublisherReads };
