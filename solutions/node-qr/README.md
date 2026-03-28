# node-qr

A Node.js Express API that generates a PNG QR code from contact information.

## Repo intro

This project is one workspace package under `solutions/node-qr`.

- `app.js`: API routes and request handling
- `index.js`: server startup
- `vcard.js`: pure function that maps payload to vCard 3.0
- `qr.js`: pure function that turns vCard text into a PNG data URL
- `__tests__/`: Jest integration and unit tests

## Develop

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure local env (only port is needed):
   ```bash
   cp .env .env.local
   ```
   or edit `.env` directly:
   ```
   PORT=8002
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

### `POST /qr/image`

Generates a QR code image and writes it to `generated/<hash6>.png` on the server.
Returns JSON metadata, so `curl --output` is not required.

**Body (JSON):**

| Field | Required | vCard mapping |
|---|---|---|
| `email` | ✅ | `EMAIL` |
| `name` | optional | `FN` |
| `phone` | optional | `TEL` |
| `org` | optional | `ORG` |
| `url` | optional | `URL` |

**Example:**

```bash
curl -X POST http://localhost:8002/qr/image \
  -H "Content-Type: application/json" \
   -d '{"email":"you@example.com","name":"Jane Doe"}'
```

**Response:**

```json
{
   "hash": "<sha256-of-input-vcard>",
   "fileName": "a1b2c3.png",
   "path": "generated/a1b2c3.png"
}
```

**Example (same input => same file name):**

```bash
curl -X POST http://localhost:8002/qr/image \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

## Notes

- Email delivery is intentionally removed from this package.
- If `email` is missing, the API returns `400` with `{ "error": "email is required" }`.
