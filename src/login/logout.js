const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

require('dotenv').config();

puppeteer.use(StealthPlugin());

const COOKIE_FILE = 'cookies.json';


async function logout() {
  console.log('🔑 Instagram 로그아웃 시작');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      // '--disable-dev-shm-usage'
    ]
  });
  console.log('🌐 브라우저 시작');
  const page = await browser.newPage();

  console.log('👾 뷰포트 설정');
  await page.setViewport({ width: 1280, height: 800 });

  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE));

  if (!cookies || cookies.length === 0) {
    console.log('⚠️ 쿠키 파일이 비어있거나 존재하지 않습니다. 로그인 후 쿠키를 저장하세요.');
    await browser.close();
    return [];
  }

  await page.setCookie(...cookies);

  await page.goto('https://www.instagram.com/accounts/logout/', {
    waitUntil: 'networkidle2',
  });

  console.log('👋 로그아웃 완료');

  await browser.close();

  console.log('👋 페이지 종료');
}

module.exports = { logout };
