const puppeteer = require('puppeteer');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const url = config['url'] + '?state=open&type=crash&time=last-seven-days';
const PATH = 'temp.png';
const email = config['email'];

console.log(email);
console.log(url);

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 512, height: 1024 });
  await page.goto(url);
  await page.screenshot({ path: PATH });
  await browser.close();
}

main();
