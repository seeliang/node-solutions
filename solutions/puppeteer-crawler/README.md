# Puppeteer Crawler

Crawls one or more sites with Puppeteer, collects:
- All cookies visible to the browser session (via CDP), labeled as first-party or third-party.
- Third-party JavaScript requests (non-gumtree/non-first-party), saved as a CSV.

Outputs are written to the reports folder per host.

## Prerequisites

- Node.js 24+ recommended
- npm

## Installation

```bash
npm install
```

## Configure targets

Edit links.json at the project root:

```json
{
  "links": [
    {
      "url": "https://gumtree.com.au/"
    }
  ]
}
```

- Provide one or more URL entries in the links array.

## What the crawler does

For each URL in links.json:
- Opens a fresh incognito browser context (isolated session).
- Navigates to the URL, scrolls to trigger dynamic loads.
- Waits briefly for ad/third-party activity.
- Collects all cookies via Chrome DevTools Protocol (Network.getAllCookies).
  - Adds a cookie_type column:
    - first-party if cookie domain ends with the site’s hostname.
    - third-party otherwise.
- Captures third-party JavaScript responses (excluding the site’s own domain).
- Writes CSV reports to reports/.

Puppeteer runs in headful mode by default (a browser window opens) to better simulate user behavior.

## Run

From the project directory:

```bash
node src/index.js
```

Reports are created under reports/:
- <host>-cookies.csv
- <host>-thirdparty-js.csv

Example for https://gumtree.com.au/:
- reports/gumtree.com.au-cookies.csv
- reports/gumtree.com.au-thirdparty-js.csv

## Report columns

- Cookies CSV (from CDP):
  - name, value, domain, path, expires, size, httpOnly, secure, session, sameSite, priority (if present), and cookie_type.
- Third-party JS CSV:
  - url, hostname, status, content_type, content_length.

## Notes

- Third-party cookies and JS are more likely to appear after user-like interactions. The script scrolls the page and waits briefly.
- Browser flags are set to reduce automation signals and relax recent cookie restrictions.
- Headful mode helps trigger more third-party behavior. To run headless, change headless: false to headless: 'new' in src/index.js.

## Troubleshooting

- Ensure links.json exists and contains at least one valid URL.
- Run directly to see detailed errors:
  ```bash
  node src/index.js
  ```
- Clean previous reports:
  ```bash
  rm -f reports/*.csv
  ```
- Extra Puppeteer logs (macOS):
  ```bash
  DEBUG=puppeteer:* node src/index.js
  ```