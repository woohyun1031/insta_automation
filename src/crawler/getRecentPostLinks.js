const puppeteer = require('puppeteer');
const fs = require('fs');
const { isNewerThan } = require('../utils/dateUtils');
const { START_DATE } = require('../config');
const { autoScrollUntilLinks } = require('../utils/autoScroll');
const { extractPostLinks } = require('../utils/extractPostLinks');

const COOKIE_FILE = 'cookies.json';

// 패턴 기반 정규식
const POST_URL_REGEX = /\/(p|reel|tv)\//;

async function getRecentPostLinks(username) {
  const browser = await puppeteer.launch({ headless: 'new' });
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

  for (const link of uniqueLinks) {
    await page.goto(link, { waitUntil: 'networkidle2' });

    try {
      const datetime = await page.$eval('time', (el) =>
        el.getAttribute('datetime')
      );

      if (isNewerThan(datetime, START_DATE)) {
        console.log(`✅ 수집: ${link} (${datetime})`);
        postLinks.push(link);
      }

      if (postLinks.length >= 10) break;
    } catch (err) {
      console.log(`⚠️ 시간 추출 실패: ${link}`);
    }
  }

  await browser.close();
  return postLinks;
}

module.exports = { getRecentPostLinks };
