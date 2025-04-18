const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const { isNewerThan } = require('../utils/dateUtils');
// const { START_DATE } = require('../config');
const { getYesterdayMidnightISO } = require('../utils/getYesterdayMidnightISO');
const { autoScrollUntilLinks } = require('../utils/autoScroll');
const { extractPostLinks } = require('../utils/extractPostLinks');

const COOKIE_FILE = 'cookies.json';
puppeteer.use(StealthPlugin());

// 패턴 기반 정규식
const POST_URL_REGEX = /\/(p|reel|tv)\//;

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
  const page = await browser.newPage();

  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE));
  await page.setCookie(...cookies);

  await page.goto(`https://www.instagram.com/${username}/`, {
    waitUntil: 'networkidle2',
  });
  // await page.screenshot({ path: 'into-target.png', fullPage: true });

  await autoScrollUntilLinks(page, 10);

  const links = await extractPostLinks(page);

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
