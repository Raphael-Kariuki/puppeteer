//import required puppeteer library
const puppeteer = require('puppeteer');

//create asynchronous function
async function run() {

    //try..catch block to catch errors
    try {

        //launch puppeteer built-in headless browser
        const browser = await puppeteer.launch(
            {
                //this option is meant to improve puppeteer perfomance by caching resources in a specific dir
                //By default, puppeteer stores in a temp directory that is deleted when the browser.close() is invoked
                userDataDir: './data'
            }
        );

        //obtain variables from arguments
        const url = process.argv[2];
        const pagesToScrape = process.argv[3];

        
        const page = await browser.newPage();
        await page.goto(url);
        
        //intercept the request, if request is for text, proceed else drop request. Dropped requests examples are images,css
        await page.setRequestInterception(true);
        page.on('request', (Request) => {
            if(Request.resourceType() === 'document'){
                Request.continue();
            }else{
                Request.abort();
            }
        });
        

        //this is to setup for pagination
        let currentPage = 1;
        let urls = [];

        while (currentPage <= pagesToScrape) {
            let newUrls = await page.evaluate(() => {
                let results = [];
                let indexNo = 0;

                //obtain all selector content
                let items = document.querySelectorAll('span.titleline > a');
                items.forEach((item) => {
                    indexNo ++;

                    //add result to list
                    results.push({
                        index: indexNo,
                        url: item.getAttribute('href'),
                        text: item.innerText,
                    });
                });
                return results;
            })

            //while traversing pages, join the received urls with the newly received.
            urls = urls.concat(newUrls);

            if (currentPage < pagesToScrape) {
                await Promise.all([

                    //click on link to show more content
                    await page.click('td.title > a.morelink'),

                    //wait for a second to populate page before obtaining the required selector content
                    new Promise(r => setTimeout(r, 1000)),
                    await page.waitForSelector('span.titleline > a')
                ])
            }
            currentPage ++;
        }
        browser.close();
        console.log(urls);
    } catch (error) {
        console.error(error);
    }
}

//run asynchronous function.
run();
