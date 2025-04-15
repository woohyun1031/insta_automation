const puppeteer = require('puppeteer');
const { START_DATE } = require('../config');
const { isNewerThan } = require('../utils/dateUtils');
const { autoScroll } = require('../utils/autoScroll');

async function getRecentPostLinks(username) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });

  // 1. 스크롤로 추가 로딩 유도
  await autoScroll(page);

  // 2. 프로필 페이지에서 게시글 링크 전부 가져오기
  const links = await page.$$eval('a', (anchors) =>
    anchors
      .map((a) => a.href)
      .filter((href) => href.includes('/p/'))
  );

  const uniqueLinks = [...new Set(links)];

  const postLinks = [];

  // 3. 각 게시글 링크 들어가서 시간 체크
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
    } catch (error) {
      console.log(`⚠️ 시간 정보 없음: ${link}`);
    }
  }

  await browser.close();

  return postLinks;
}


module.exports = { getRecentPostLinks };
