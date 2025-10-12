const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure,PrivacySandboxSettings3',
                '--disable-blink-features=AutomationControlled',
            ],
        });
        const page = await browser.newPage();

        const targetUrl = 'https://gumtree.com.au/';
        const { hostname: mainHost } = new URL(targetUrl);

        // Collect third-party JS responses (exclude gumtree domains)
        const jsResources = [];
        page.on('response', async (resp) => {
            try {
                const url = resp.url();
                const u = new URL(url);
                const host = u.hostname;

                // Exclude first-party (gumtree) hosts
                const isFirstParty = host === mainHost || host.endsWith(`.${mainHost}`);
                if (isFirstParty) return;

                const headers = resp.headers();
                const contentType = headers['content-type'] || headers['Content-Type'] || '';
                const isScript = (resp.request().resourceType && resp.request().resourceType() === 'script')
                    || contentType.includes('javascript')
                    || url.endsWith('.js');

                if (!isScript) return;

                jsResources.push({
                    url,
                    hostname: host,
                    status: resp.status(),
                    content_type: contentType,
                    content_length: headers['content-length'] || headers['Content-Length'] || '',
                });
            } catch (_) {
                // ignore parsing errors
            }
        });

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 150000 });

        // Simulate some user activity to trigger ad scripts
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let total = 0;
                const step = 250;
                const timer = setInterval(() => {
                    window.scrollBy(0, step);
                    total += step;
                    if (total >= document.body.scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 150);
            });
        });

        // Try to wait for a securepubads response, but don't fail if it doesn't show
        const sawSecurePubAds = await Promise.race([
            page
                .waitForResponse(
                    (resp) => resp.url().includes('securepubads.g.doubleclick.net')
                        && resp.status() >= 200
                        && resp.status() < 400,
                    { timeout: 20000 },
                )
                .then(() => true)
                .catch(() => false),
            new Promise((resolve) => setTimeout(() => resolve(false), 20000)),
        ]);
        if (!sawSecurePubAds) {
            console.log('securepubads response not observed within timeout; proceeding anyway.');
        }

        // Small buffer to let scripts set cookies
        await new Promise((r) => setTimeout(r, 5000));

        // Collect all cookies via CDP (includes third-party)
        const client = await page.target().createCDPSession();
        const { cookies } = await client.send('Network.getAllCookies');

        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const { hostname } = new URL(targetUrl);

        // Add a simple first/third-party column for clarity
        const processed = (cookies || []).map((c) => ({
            ...c,
            cookie_type: c.domain.endsWith(hostname) ? 'first-party' : 'third-party',
        }));

        const parser = new Parser();
        const csv = parser.parse(processed);
        const outPath = path.join(reportsDir, `${hostname}-cookies.csv`);
        fs.writeFileSync(outPath, csv);
        console.log(`Saved cookies to: ${outPath}`);

        // Write third-party JS report
        const jsParser = new Parser();
        const jsCsv = jsParser.parse(jsResources);
        const jsOutPath = path.join(reportsDir, `${hostname}-thirdparty-js.csv`);
        fs.writeFileSync(jsOutPath, jsCsv);
        console.log(`Saved third-party JS to: ${jsOutPath}`);
    } catch (err) {
        console.error('Run failed:', err);
        process.exitCode = 1; // keep non-zero exit but avoid abrupt crash
    } finally {
        if (browser) {
            await browser.close().catch(() => { });
        }
    }
})();
