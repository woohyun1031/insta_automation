const puppeteer = require('puppeteer');
const { START_DATE } = require('../config');
const { isNewerThan } = require('../utils/dateUtils');

async function getRecentPostLinks(username) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const profileUrl = `https://www.instagram.com/${username}/`;

  await page.goto(profileUrl, { waitUntil: 'networkidle2' });

  const links = await page.$$eval('a', (anchors) => {
      console.log(anchors)
      return anchors
      .map((a) => a.href)
      .filter((href) => href.includes('/p/'))
    }
  );
  console.log(links)
  const postLinks = [];
  for (const link of links) {
    await page.goto(link, { waitUntil: 'networkidle2' });

    const datetime = await page.$eval('time', (el) =>
      el.getAttribute('datetime')
    );

    if (isNewerThan(datetime, START_DATE)) {
      postLinks.push(link);
    }
  }

  await browser.close();
  return [...new Set(postLinks)];
}

module.exports = { getRecentPostLinks };
