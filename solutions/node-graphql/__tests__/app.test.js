const request = require('supertest');

const { createApp } = require('../app');
const { createStore } = require('../store');
const { gql, countPublisherReads } = require('../test-helpers');

describe('/graphql — integration', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('400 when query is missing', async () => {
    const res = await request(app).post('/graphql').send({});
    expect(res.status).toBe(400);
  });

  test('returns games joined with publisher', async () => {
    const res = await gql(app, '{ games(id: "1") { id title publisher { title } } }');

    expect(res.status).toBe(200);
    expect(res.body.data.games).toEqual([
      { id: '1', title: 'metal gear solid', publisher: [{ title: 'konami' }] },
    ]);
  });

  test('returns publishers joined with games', async () => {
    const res = await gql(app, '{ publishers(id: "2") { title games { title } } }');

    expect(res.status).toBe(200);
    expect(res.body.data.publishers).toEqual([
      { title: 'santa monica', games: [{ title: 'god of war' }] },
    ]);
  });

  test('addPublisher mutation persists within the app', async () => {
    const add = await gql(
      app,
      'mutation ($input: AddPublisherInput) { addPublisher(input: $input) { id title } }',
      { input: { title: 'capcom' } },
    );
    expect(add.body.data.addPublisher).toEqual([{ id: '3', title: 'capcom' }]);

    const res = await gql(app, '{ publishers(id: "3") { title } }');
    expect(res.body.data.publishers).toEqual([{ title: 'capcom' }]);
  });

  test('GET /graphql with query returns JSON', async () => {
    const res = await request(app)
      .get('/graphql')
      .query({ query: '{ publishers(id: "1") { title } }' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body.data.publishers).toEqual([{ title: 'konami' }]);
  });

  test('GET /graphiql serves the GraphiQL page', async () => {
    const res = await request(app).get('/graphiql');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toContain('/graphql');
  });

  test('mutations do not leak into a new app', async () => {
    const res = await gql(createApp(), '{ publishers(id: "3") { title } }');
    expect(res.body.data.publishers).toEqual([]);
  });

  test('editGame mutation updates the game within the app', async () => {
    const edit = await gql(
      app,
      'mutation { editGame(input: { id: "2", title: "god of war ii", publisherId: "2" }) { id title } }',
    );
    expect(edit.body.data.editGame).toEqual([{ id: '2', title: 'god of war ii' }]);

    const res = await gql(app, '{ games(id: "2") { title } }');
    expect(res.body.data.games).toEqual([{ title: 'god of war ii' }]);
  });
});

// Regression tests: these were known issues before the resolver-map refactor.
describe('/graphql — regressions', () => {
  // was known issue 1: the old root-resolver joins stopped after one level
  test('nesting resolves three levels deep', async () => {
    const res = await gql(createApp(), '{ games(id: "1") { publisher { games { title } } } }');

    expect(res.body.errors).toBeUndefined();
    expect(res.body.data.games).toEqual([
      {
        publisher: [{
          games: [{ title: 'metal gear solid' }, { title: 'winning eleven' }],
        }],
      },
    ]);
  });

  // was known issue 2: the old joins ran before GraphQL knew which fields
  // were asked for. Field resolvers only run when their field is requested.
  test('publishers are not read when the query does not ask for them', async () => {
    const titlesOnly = createStore();
    const titlesCounter = countPublisherReads(titlesOnly);
    await gql(createApp(titlesOnly), '{ games { title } }');

    // control: proves the counter does count, so 0 above is meaningful
    const withPublisher = createStore();
    const withCounter = countPublisherReads(withPublisher);
    await gql(createApp(withPublisher), '{ games { title publisher { title } } }');

    expect(titlesCounter.reads).toBe(0);
    expect(withCounter.reads).toBeGreaterThan(0);
  });
});
