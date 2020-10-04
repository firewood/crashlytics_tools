const puppeteer = require('puppeteer');
const fs = require('fs');
const jsonfile = require('jsonfile')

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const cookiesFilePath = './cookies.json';
const service_url = config['url'] + '?state=open&type=crash&time=last-seven-days';
const PATH = 'temp.png';
const email = config['email'];
const USERNAME_SELECTOR = '#identifierId';

async function login() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
/*
  page.on(`console`, msg => {
      for (let i = 0; i < msg._args.length; ++i) {
          console.log(`${i}: ${msg._args[i]}`);
      }
  });
*/

  console.log("Trying to logged in...");

  await page.setViewport({ width: 1024, height: 1024 });
  await page.goto(service_url, {waitUntil: "domcontentloaded"});

  const is_login_page = await page.$(USERNAME_SELECTOR).then(res => !!res);
  if (!is_login_page) {
    console.log("NOT A LOGIN PAGE");
    await browser.close();
    return false;
  }
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(email);  

  while (true) {
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 600000 })
    if (service_url.split('/')[2] == page.url().split('/')[2]) {
      break;
    }
  }

  console.log("Successfully logged in!");

  const cookiesObject = await page.cookies();
  await jsonfile.writeFile(cookiesFilePath, cookiesObject, { spaces: 2 }, function(err) {
    if (err) {
      console.log('The file could not be written.', err);
    } else {
      console.log('Session has been successfully saved');
    }
  });

  await browser.close();
  return true;
}

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    const cookies = jsonfile.readFileSync(cookiesFilePath);
    for (let cookie of cookies) {
      await page.setCookie(cookie);
    }
  } catch (err) {
  }
/*
  page.on(`console`, msg => {
      for (let i = 0; i < msg._args.length; ++i) {
          console.log(`${i}: ${msg._args[i]}`);
      }
  });
*/

  await page.setViewport({ width: 512, height: 1024 });
  await page.goto(service_url, {waitUntil: "domcontentloaded"});

  if (service_url.split('/')[2] != page.url().split('/')[2]) {
    await browser.close();
    return false;
  }

  console.log("Waiting for the page is loaded...");
  await page.waitForTimeout(10000);

  await page.screenshot({ path: PATH });

  await browser.close();
  return true;
}

main().then(result => {
  if (!result) {
    login().then(result => {
      if (result) {
        main();
      }
    });
  }
});
