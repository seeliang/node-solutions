# node-qr

A Node.js Express server that generates a QR code from contact information and emails it to the provided address.

## Features

- Accepts an email address (required) plus any optional contact fields
- Encodes contact data as a **vCard 3.0** QR code — scannable by phone cameras to save as a contact
- Sends the QR code as an **inline image** in an HTML email via custom SMTP

## Architecture

Three pure functions composed by thin I/O layers:

```
req.body → vcard.js → qr.js → mailTemplate.js → mailer.js → email inbox
```

| File | Type | Responsibility |
|---|---|---|
| `vcard.js` | Pure | Contact object → vCard string |
| `qr.js` | Pure | vCard string → base64 PNG data URL |
| `mailTemplate.js` | Pure | `{ to, qrDataUrl }` → nodemailer mail options |
| `mailer.js` | Impure | SMTP transporter, sends email |
| `index.js` | Impure | Express server, wires all modules |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env` and fill in your SMTP credentials:
   ```
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=user@example.com
   SMTP_PASS=yourpassword
   SMTP_FROM=sender@example.com
   PORT=8002
   ```

3. Start the server:
   ```bash
   npm start        # development (nodemon)
   npm run stage    # production
   ```

## API

### `POST /qr/image`

Generate a QR code image directly and return it in the HTTP response as `image/png`.

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
   -d '{"email":"you@example.com","name":"Jane Doe"}' \
   --output qrcode.png
```

This API does not send an email; it returns the PNG file bytes directly.

### `POST /qr`

**Body (JSON):**

| Field | Required | vCard mapping |
|---|---|---|
| `email` | ✅ | `EMAIL` |
| `name` | optional | `FN` |
| `phone` | optional | `TEL` |
| `org` | optional | `ORG` |
| `url` | optional | `URL` |

**Minimal example:**
```bash
curl -X POST http://localhost:8002/qr \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

**Extended example:**
```bash
curl -X POST http://localhost:8002/qr \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","name":"Jane Doe","phone":"+1234567890","org":"Acme"}'
```

**Response:**
```json
{ "message": "QR code sent to you@example.com" }
```

The recipient receives an email with the QR code image inline. Scanning it prompts the phone to save a contact with all provided fields.
