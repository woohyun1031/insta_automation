// loginAndSaveCookies.js
const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();

const COOKIE_FILE = 'cookies.json';

async function loginAndSaveCookies() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto('https://www.instagram.com/accounts/login/', {
    waitUntil: 'networkidle2',
  });

  await page.type('input[name="username"]', process.env.INSTAGRAM_ID, {
    delay: 100,
  });
  await page.type('input[name="password"]', process.env.INSTAGRAM_PW, {
    delay: 100,
  });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  const cookies = await page.cookies();
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));
  console.log('✅ 로그인 성공, 쿠키 저장 완료');

  await browser.close();
}

module.exports = { loginAndSaveCookies };
