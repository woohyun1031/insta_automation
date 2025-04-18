const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const { isNewerThan } = require('../utils/dateUtils');
const { getYesterdayMidnightISO } = require('../utils/getYesterdayMidnightISO');
const { autoScrollUntilLinks } = require('../utils/autoScroll');
const { extractPostLinks } = require('../utils/extractPostLinks');

const COOKIE_FILE = 'cookies.json';
puppeteer.use(StealthPlugin());

async function getRecentPostLinks(username) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });
  console.log(`🌐 브라우저 시작: ${browser.process()?.pid}`);
  const page = await browser.newPage();

  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE));
  if (!cookies || cookies.length === 0) {
    console.log('⚠️ 쿠키 파일이 비어있거나 존재하지 않습니다. 로그인 후 쿠키를 저장하세요.');
    await browser.close();
    return [];
  }
  await page.setCookie(...cookies);

  await page.goto(`https://www.instagram.com/${username}/`, {
    waitUntil: 'networkidle2',
  });
  console.log(`🔍 ${username} 프로필 페이지 접근 완료`);
  await autoScrollUntilLinks(page, 10);
  console.log('🔄 스크롤 완료');

  const links = await extractPostLinks(page);
  console.log(`🔗 수집된 링크 개수: ${links.length}`);

  const uniqueLinks = [...new Set(links)];

  const postLinks = [];

  const startDate = getYesterdayMidnightISO();
  console.log(`📅 기준 시점 (전날 00시): ${startDate}`);

  for (const link of uniqueLinks) {
    try {
      await page.goto(link, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      console.log(`🔗 게시물 접근: ${link}`);

      try {
        await page.waitForSelector('time', { timeout: 5000 });

        const datetime = await page.$eval('time', (el) =>
          el.getAttribute('datetime')
        );

        if (isNewerThan(datetime, startDate)) {
          console.log(`✅ 수집: ${link} (${datetime})`);
          postLinks.push(link);
        } else {
          console.log(`⏭️ 오래된 게시물 제외: ${link} (${datetime})`);
        }
      } catch (err) {
        console.log(`⚠️ 시간 추출 실패: ${link}`);
      }

      if (postLinks.length >= 10) break;
    } catch (err) {
      console.log(`🚫 게시물 이동 실패 (timeout 등): ${link}`);
      console.error(err.message);
    }
  }

  await browser.close();
  return postLinks;
}

module.exports = { getRecentPostLinks };
