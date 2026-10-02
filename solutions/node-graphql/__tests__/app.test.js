const request = require('supertest');

const { createApp } = require('../app');

const gql = (app, query, variables) => request(app)
  .post('/graphql')
  .send({ query, variables });

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
});
