const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // Run in headful mode to observe
    const page = await browser.newPage();

    const targetUrl = 'https://gumtree.com.au/';

    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    console.log('Page loaded. Simulating user scroll...');

    // Simulate scrolling down the page to trigger dynamic content/scripts
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const { scrollHeight } = document.body;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    console.log('Scrolling finished. Waiting for scripts to load...');

    // Allow some time for third-party scripts to load AFTER interaction
    await new Promise((resolve) => setTimeout(resolve, 20000));

    // Use the DevTools protocol to get all browser cookies
    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getAllCookies');

    if (cookies && cookies.length > 0) {
        try {
            const reportsDir = path.join(__dirname, '..', 'reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            const sanitizedFilename = new URL(targetUrl).hostname;
            const parser = new Parser();
            const csv = parser.parse(cookies);
            fs.writeFileSync(path.join(reportsDir, `${sanitizedFilename}-cookies.csv`), csv);
            console.log(`Successfully saved cookies to reports/${sanitizedFilename}-cookies.csv`);
        } catch (err) {
            console.error('Error writing to CSV file', err);
        }
    } else {
        console.log('No cookies found.');
    }

    await browser.close();
})();
