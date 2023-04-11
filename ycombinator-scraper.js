const puppeteer = require('puppeteer');

function run(pagesToScrape){
    return new Promise(async (resolve, reject) => {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const url = process.argv[2];
            await page.goto(url);

            let currentPage = 1;
            let urls = [];

            while (currentPage <= pagesToScrape) {
                let newUrls = await page.evaluate(() => {
                    let results = [];
                    let indexNo = 0;
                    let items = document.querySelectorAll('span.titleline > a');
                    items.forEach((item) => {
                        indexNo ++;
                        results.push({
                            index: indexNo,
                            url: item.getAttribute('href'),
                            text: item.innerText,
                        });
                    });
                    return results;
                });  
                urls = urls.concat(newUrls)

                if (currentPage < pagesToScrape) {
                    await Promise.all([
                        await page.click('td.title > a.morelink'),
                        await page.waitForSelector('span.titleline > a')
                    ])
                }
                currentPage ++;
            }

            
            browser.close();
            return resolve(urls);
        } catch (error) {
            return reject(error);
        }
    })
}
run().then(console.log).catch(console.error);