const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

(async () => {
    let browser;
    try {
        // Load URLs from links.json
        const linksPath = path.join(__dirname, '..', 'links.json');
        if (!fs.existsSync(linksPath)) {
            console.error(`links.json not found at: ${linksPath}`);
            process.exit(1);
        }
        const linksData = JSON.parse(fs.readFileSync(linksPath, 'utf8'));
        const links = Array.isArray(linksData?.links) ? linksData.links : [];
        if (links.length === 0) {
            console.error('No links found in links.json (expected {"links":[{ "url": "...", ...}]})');
            process.exit(1);
        }

        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure,PrivacySandboxSettings3',
                '--disable-blink-features=AutomationControlled',
            ],
        });

        // Helper: scroll page to trigger dynamic loads
        const scrollPage = (page) =>
            page.evaluate(async () => {
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

        for (const entry of links) {
            const url = entry.url;
            if (!url) continue;

            const { hostname: mainHost } = new URL(url);
            const context = await browser.createIncognitoBrowserContext();
            const page = await context.newPage();

            // Collect third-party JS responses (exclude first-party)
            const jsResources = [];
            const respHandler = async (resp) => {
                try {
                    const respUrl = resp.url();
                    const u = new URL(respUrl);
                    const host = u.hostname;

                    const isFirstParty = host === mainHost || host.endsWith(`.${mainHost}`);
                    if (isFirstParty) return;

                    const headers = resp.headers();
                    const contentType = headers['content-type'] || headers['Content-Type'] || '';
                    const req = resp.request();
                    const rType = typeof req.resourceType === 'function' ? req.resourceType() : '';
                    const isScript = rType === 'script' || contentType.includes('javascript') || respUrl.endsWith('.js');

                    if (!isScript) return;

                    jsResources.push({
                        url: respUrl,
                        hostname: host,
                        status: resp.status(),
                        content_type: contentType,
                        content_length: headers['content-length'] || headers['Content-Length'] || '',
                    });
                } catch {
                    // ignore parsing issues
                }
            };
            page.on('response', respHandler);

            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 150000 });
                await scrollPage(page);

                // Try to wait for a securepubads request; proceed regardless
                await Promise.race([
                    page.waitForResponse(
                        (r) =>
                            r.url().includes('securepubads.g.doubleclick.net') &&
                            r.status() >= 200 &&
                            r.status() < 400,
                        { timeout: 20000 }
                    ),
                    new Promise((resolve) => setTimeout(resolve, 20000)),
                ]).catch(() => { });

                // Buffer time for scripts to set cookies
                await new Promise((r) => setTimeout(r, 5000));

                // Collect cookies in this isolated context
                const client = await page.target().createCDPSession();
                const { cookies } = await client.send('Network.getAllCookies');

                // Prepare outputs
                const parser = new Parser();
                const processedCookies = (cookies || []).map((c) => ({
                    ...c,
                    cookie_type: c.domain.endsWith(mainHost) ? 'first-party' : 'third-party',
                }));

                const hostSlug = mainHost; // already safe for filenames

                // 1) Cookies CSV
                const cookiesCsv = parser.parse(processedCookies);
                const cookiesCsvPath = path.join(reportsDir, `${hostSlug}-cookies.csv`);
                fs.writeFileSync(cookiesCsvPath, cookiesCsv);
                console.log(`Saved cookies CSV: ${cookiesCsvPath}`);

                // 2) Third-party JS CSV
                const jsCsv = new Parser().parse(jsResources);
                const jsCsvPath = path.join(reportsDir, `${hostSlug}-thirdparty-js.csv`);
                fs.writeFileSync(jsCsvPath, jsCsv);
                console.log(`Saved third-party JS CSV: ${jsCsvPath}`);
            } catch (e) {
                console.error(`Failed processing ${url}:`, e.message || e);
            } finally {
                page.off('response', respHandler);
                await context.close().catch(() => { });
            }
        }
    } catch (err) {
        console.error('Run failed:', err);
        process.exitCode = 1;
    } finally {
        if (browser) {
            await browser.close().catch(() => { });
        }
    }
})();
