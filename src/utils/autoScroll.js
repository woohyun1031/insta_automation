// src/utils/autoScroll.js
async function autoScrollUntilLinks(page, minPostCount = 10) {
  await page.evaluate(async (minPostCount) => {
    return new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 1000;
      let tries = 0;

      const timer = setInterval(() => {
        const anchors = [...document.querySelectorAll('a')];
        const postLinks = anchors.map((a) => a.href).filter((href) => href.includes('/p/'));
        const uniqueLinks = [...new Set(postLinks)];

        console.log(`📸 현재 수집된 게시글 수: ${uniqueLinks.length}`);

        window.scrollBy(0, distance);
        totalHeight += distance;
        tries++;

        if (uniqueLinks.length >= minPostCount || tries > 30) {
          clearInterval(timer);
          resolve();
        }
      }, 500);
    });
  }, minPostCount);
}

module.exports = { autoScrollUntilLinks };
