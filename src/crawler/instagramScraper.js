const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { START_DATE } = require('../config');
const { isNewerThan } = require('../utils/dateUtils');
const { autoScrollUntilLinks } = require('../utils/autoScroll');

puppeteer.use(StealthPlugin());

async function getRecentPostLinks(username) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(`https://www.instagram.com/${username}/`, {
    waitUntil: 'networkidle2',
  });

  // 🔁 최신 게시물 10개가 모일 때까지 스크롤
  console.log('🌀 최신 게시물 10개가 수집될 때까지 스크롤 중...');
  await autoScrollUntilLinks(page, 10);

  await page.screenshot({ path: 'debug.png', fullPage: true });

  // 링크 수집
  const links = await page.$$eval('a', (anchors) => {
    console.log(anchors);
    return anchors
      .map((a) => a.href)
      .filter((href) => href.includes('/p/') || href.includes('/reel/'));
  });
  const uniqueLinks = [...new Set(links)];

  const postLinks = [];

  for (const link of uniqueLinks) {
    await page.goto(link, { waitUntil: 'networkidle2' });

    try {
      const datetime = await page.$eval('time', (el) =>
        el.getAttribute('datetime')
      );

      if (isNewerThan(datetime, START_DATE)) {
        console.log(`✅ 수집: ${link} (${datetime})`);
        postLinks.push(link);
      } else {
        console.log(`❌ 제외: ${link} (${datetime})`);
      }

      // 🛑 10개 이상 모이면 멈춤
      if (postLinks.length >= 10) break;
    } catch (error) {
      console.log(`⚠️ 시간 정보 없음: ${link}`);
    }
  }

  await browser.close();

  return postLinks;
}

module.exports = { getRecentPostLinks };
