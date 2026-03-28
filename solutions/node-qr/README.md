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

Generates a QR code image and returns raw PNG bytes in the response (`Content-Type: image/png`).

**Body (JSON):**

| Field | Required | vCard mapping |
|---|---|---|
| `email` | ✅ | `EMAIL` |
| `name` | optional | `FN` |
| `phone` | optional | `TEL` |
| `org` | optional | `ORG` |
| `url` | optional | `URL` |

**Example (save PNG to file):**

```bash
curl -X POST http://localhost:8002/qr/image \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","name":"Jane Doe"}' \
  --output qrcode.png
```

**Example (preview headers):**

```bash
curl -i -X POST http://localhost:8002/qr/image \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

## Notes

- Email delivery is intentionally removed from this package.
- If `email` is missing, the API returns `400` with `{ "error": "email is required" }`.
