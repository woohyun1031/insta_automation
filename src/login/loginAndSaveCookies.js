const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
const dns = require('dns/promises');

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
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  console.log('👾 뷰포트 설정');
  await page.setViewport({ width: 1280, height: 800 });

  // DNS 체크
  try {
    await dns.lookup('www.instagram.com');
    console.log('✅ DNS 확인 완료');
  } catch (e) {
    console.error('❌ DNS 확인 실패');
    process.exit(0);
  }

  // 네트워크 체크
  try {
    const res = await axios.get('https://www.instagram.com/accounts/login/', {
      timeout: 8000,
    });
    console.log(`✅ Instagram 응답: ${res.status}`);
  } catch (e) {
    console.error('❌ Instagram 연결 실패:', e.message);
    process.exit(0);
  }

  const loginURL = 'https://www.instagram.com/accounts/login/';
  const maxAttempts = 3;
  let loginFormDetected = false;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await page.goto(loginURL, {
        waitUntil: 'networkidle2',
        timeout: 20000,
      });

      console.log(`🍺 로그인 페이지로 이동 중... (시도 ${attempt})`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await page.waitForSelector('input[name="username"]', { timeout: 8000 });
      loginFormDetected = true;
      console.log('🔐 로그인 폼 감지 완료');
      break;
    } catch (err) {
      const html = await page.content();
      const url = page.url();
      console.warn(`⚠️ 로그인 폼 탐지 실패 (시도 ${attempt})`);
      console.warn('📍 현재 URL:', url);
      console.warn('📄 페이지 내용 일부:\n', html.slice(0, 600));

      if (attempt < maxAttempts) {
        console.log('🔁 새로고침 후 재시도');
        await page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        throw new Error('❌ 로그인 폼을 찾지 못했습니다. Instagram 측에서 봇을 차단했을 수 있습니다.');
      }
    }
  }

  if (!loginFormDetected) return;

  // 로그인 입력
  await page.type('input[name="username"]', process.env.INSTAGRAM_ID, { delay: 100 });
  await page.type('input[name="password"]', process.env.INSTAGRAM_PW, { delay: 100 });

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
