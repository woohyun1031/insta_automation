const puppeteer = require('puppeteer');
const fs = require('fs');

async function logout() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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
