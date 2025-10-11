const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const domians = 'https://gumtree.com.au/';

    // Replace 'https://example.com' with the target website
    await page.goto(domians, { waitUntil: 'networkidle2' });

    // Allow some time for third-party scripts to load and set cookies
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
            const parser = new Parser();
            const csv = parser.parse(cookies);
            fs.writeFileSync(path.join(reportsDir, `${domians}-cookies.csv`), csv);
            console.log('Successfully saved cookies to reports/cookies.csv');
        } catch (err) {
            console.error('Error writing to CSV file', err);
        }
    } else {
        console.log('No cookies found.');
    }

    await browser.close();
})();
