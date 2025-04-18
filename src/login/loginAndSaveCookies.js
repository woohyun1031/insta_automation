// loginAndSaveCookies.js
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
require('dotenv').config();

puppeteer.use(StealthPlugin());

const COOKIE_FILE = 'cookies.json';

async function loginAndSaveCookies() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]

  });
  const page = await browser.newPage();

  console.log(`👾 뷰포트 설정`);
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('https://www.instagram.com/accounts/login/', {
    waitUntil: 'networkidle2',
  });

  console.log(`🍺 로그인 페이지로 이동 중...`);

  try {
    await page.waitForSelector('input[name="username"]', { timeout: 8000 });
  } catch (err) {
    const html = await page.content();
    const url = page.url();
    console.error('❌ 로그인 폼을 찾지 못했습니다. 현재 URL:', url);
    console.error('🧾 페이지 내용 일부:\n', html.slice(0, 1000));
    throw new Error('❌ 로그인 폼을 찾지 못했습니다. Instagram 측에서 봇을 차단했을 수 있습니다.');
  }

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
