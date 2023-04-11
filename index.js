const puppeteer = require('puppeteer');

(async ()=> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = process.argv[2];
    if(!url){
        throw "Please provide a URL as the first argument";
    }
   try {
    await page.goto(url);
    
   } catch (error) {
    console.error(error)
   }
    await page.screenshot({ path: 'example.png'});

    await browser.close();
})();