const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Replace 'https://example.com' with the target website
    await page.goto('https://gumtree.com.au/');

    // Retrieve cookies
    const cookies = await page.cookies();

    if (cookies && cookies.length > 0) {
        try {
            const reportsDir = path.join(__dirname, '..', 'reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }
            const parser = new Parser();
            const csv = parser.parse(cookies);
            fs.writeFileSync(path.join(reportsDir, 'cookies.csv'), csv);
            console.log('Successfully saved cookies to reports/cookies.csv');
        } catch (err) {
            console.error('Error writing to CSV file', err);
        }
    } else {
        console.log('No cookies found.');
    }

    await browser.close();
})();
