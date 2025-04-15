const puppeteer = require('puppeteer');
const fs = require('fs');
const { isNewerThan } = require('./src/utils/dateUtils');
const { START_DATE } = require('./src/config');

const COOKIE_FILE = 'cookies.json';

async function getRecentPostLinks(username) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // 쿠키 로드
  const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE));
  await page.setCookie(...cookies);

  await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'into-target.png', fullPage: true });

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

async function extractPostLinks(page) {
  let links = [];

  // 구조 기반 셀렉터 우선 시도
  links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('article a[role="link"]'));
    return anchors
      .map((a) => a.href)
      .filter((href) => href.match(/\/(p|reel|tv)\//));
  });

  console.log(`🔎 구조 기반 셀렉터 수집 개수: ${links.length}`);

  if (links.length === 0) {
    console.log('⚠️ 구조 기반 셀렉터 실패 → fallback selector 동작');

    links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('div._ac7v a'));
      return anchors
        .map((a) => a.href)
        .filter((href) => href.match(/\/(p|reel|tv)\//));
    });

    console.log(`🌀 fallback 셀렉터 수집 개수: ${links.length}`);
  }

  return links;
}

async function autoScrollUntilLinks(page, min = 10) {
  await page.evaluate(async (minPostCount) => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 1000;
      let tries = 0;

      const timer = setInterval(() => {
        const anchors = [...document.querySelectorAll('a')];
        const postLinks = anchors.map((a) => a.href).filter((href) => href.includes('/p/') || href.includes('/reel/'));
        const unique = [...new Set(postLinks)];

        window.scrollBy(0, distance);
        totalHeight += distance;
        tries++;

        if (unique.length >= minPostCount || tries > 30) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  }, min);
}

module.exports = { getRecentPostLinks };
