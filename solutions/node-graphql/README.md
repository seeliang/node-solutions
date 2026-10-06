# node-graphql

A Node.js Express API that serves an in-memory games / publishers GraphQL schema.

## Repo intro

This project is one workspace package under `solutions/node-graphql`.

- `app.js`: Express app mounting the GraphQL handler (`graphql-http`) and GraphiQL (`ruru`)
- `index.js`: server startup
- `schema.js`: GraphQL SDL schema
- `data/`: seed data
- `resolver/`: query resolvers and joins between games and publishers
- `mutation/`: add / edit mutations
- `__tests__/`: Jest integration and unit tests

## Develop

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure local env (optional, only port is used):
   ```
   PORT=4000
   ```
3. Run locally:
   ```bash
   npm start
   ```
4. Run tests:
   ```bash
   npm test
   ```

## API usage

### GraphiQL

Open http://localhost:4000/graphiql in a browser to explore the schema and run queries.

### `POST /graphql`

**Query example:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ games(id: \"1\") { id title publisher { title } } }"}'
```

**GET query example:**

```bash
curl -G http://localhost:4000/graphql \
  --data-urlencode 'query={ publishers(id: "1") { title } }'
```

**Mutation example:**

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation ($input: AddPublisherInput) { addPublisher(input: $input) { id title } }","variables":{"input":{"title":"capcom"}}}'
```

## Notes

- `express-graphql` is deprecated; this package uses the official `graphql-http` handler, which has no built-in UI, so GraphiQL is served separately by `ruru` at `/graphiql`. Keeping it off `/graphql` means `GET /graphql?query=...` still reaches the API.
- Data lives in memory and resets on restart.
