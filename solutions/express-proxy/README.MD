# Express Proxy

Lightweight reverse proxy built with Express. Forwards incoming requests (method, path, query, headers, body) to a target server.

## Prerequisites
- Node.js 18+ and npm

## Install
```bash
npm install
```

## Configure
Set environment variables:
- TARGET_URL (required): upstream origin, e.g. https://httpbin.org
- PORT (optional): proxy port, default 3000

macOS example:
```bash
export TARGET_URL="https://httpbin.org"
export PORT=3000
```

## Run
```bash
node index.js
```

## Test
```bash
curl -i "http://localhost:${PORT:-3000}/get?foo=bar"
```

The proxy forwards to: ${TARGET_URL}/get?foo=bar

## Notes
- Ensure TARGET_URL includes scheme (http/https).
- Consider adding CORS, logging, and rate limiting for production.