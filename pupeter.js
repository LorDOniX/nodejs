const puppeteer = require('puppeteer');

(async () => {
	 console.log("starting browser")
	  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'], ignoreHTTPSErrors: true });
	console.log("starting page");
	  const page = await browser.newPage();
	  page.setViewport({
	     width: 1024,
	     height: 768
	  });
	console.log("page, waiting for goto...")
	  await page.goto('http://agenturaivana.cz');
	  //await page.goto('https://mapy.dev');
	  //await page.screenshot({path: 'example.png'});
	  let cont = await page.content();
	console.log("writing html...")
	 require("fs").writeFileSync("./output.html", cont, "utf-8");
//let mf = page.mainFrame();
//let rm = await mf.$("body");
//let xy = await rm.getProperties();
//console.log(xy.values().length)
//console.log(rm.getProperty("style"));

	  await browser.close();
})();

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'example.png'});

  await browser.close();
})();

const puppeteer = require('puppeteer');

(async () => {
     console.log("starting browser")
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'], ignoreHTTPSErrors: true });
    console.log("starting page");
      const page = await browser.newPage();
      page.setViewport({
         width: 1024,
         height: 768
      });
    console.log("page, waiting for goto...")
      await page.goto('http://agenturaivana.cz');
      //await page.goto('https://mapy.dev');
      //await page.screenshot({path: 'example.png'});
      let cont = await page.content();
    console.log("writing html...")
     require("fs").writeFileSync("./output.html", cont, "utf-8");
//let mf = page.mainFrame();
//let rm = await mf.$("body");
//let xy = await rm.getProperties();
//console.log(xy.values().length)
//console.log(rm.getProperty("style"));

      await browser.close();
})();

var a = () => {
<meta name="szn:status" content="200">

("meta[name='szn:status'][content != '']")

document.querySelector("meta[name='szn:status']:not([content=''])")
<meta name=​"szn:​status" content=​"200">​


https://github.com/GoogleChrome/puppeteer/issues/728
};
