const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function logout() {
  const browser = await puppeteer.launch({
    executablePath: '/opt/render/.cache/puppeteer/chrome/linux-135.0.7049.84/chrome-linux64/chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const cookies = JSON.parse(fs.readFileSync('cookies.json'));
  await page.setCookie(...cookies);

  await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2' });
  await page.goto('https://www.instagram.com/accounts/logout/', {
    waitUntil: 'networkidle2',
  });

  console.log('👋 로그아웃 완료');

  await page.close();
  await browser.close();
}

module.exports = { logout };
