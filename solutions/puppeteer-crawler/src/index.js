const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Replace 'https://example.com' with the target website
    await page.goto('https://gumtree.com.au/');

    // Retrieve cookies
    const cookies = await page.cookies();
    console.log(cookies);

    await browser.close();
})();
