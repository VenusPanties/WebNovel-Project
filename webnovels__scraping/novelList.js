const puppeteer = require('puppeteer');
const fs = require('fs');

let url = "https://novelfull.net/latest-release-novel";
(async function () {
    // Open browser
    const browser = await puppeteer.launch({
        headless: false,
        timeout: 600000,
    });

    // Go to new page
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0); // Set no timeout for navigation
    await page.setDefaultTimeout(6000000); // Set 10 minutes timeout for other operations

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (['font', 'image', 'stylesheet'].includes(request.resourceType())) {
            request.abort();
        } else {
            request.continue();
        }
    });

    let loop = true;
    let data = [];
    while (loop) {
        const pageData = await Scrape(page, url);
        data = data.concat(pageData[0]);
        const nextPageLink = pageData[1];
        loop = nextPageLink ? true : false;
        url = nextPageLink;
    }

    await browser.close();
    console.log(data);

    fs.writeFile('Novels List.txt', JSON.stringify(data), (err) => {
        if (err)
            console.log("Error writing file");
        else
            console.log("File Write Success");
    });

})();

async function Scrape(page, url) {
    await page.goto(url, { timeout: 0 }); // Set no timeout for page navigation
    const pageData = await page.evaluate(() => {
        const events = document.querySelectorAll(".row .truyen-title a");
        const novelLinks = Array.from(events).map((event) => event.href);

        const nextPageEvent = document.querySelector(".next a");
        const nextPageLink = nextPageEvent ? nextPageEvent.href : null;

        return [novelLinks, nextPageLink];
    });
    return pageData;
}
