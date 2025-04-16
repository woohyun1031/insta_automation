async function autoScrollUntilLinks(page, min = 10) {
  await page.evaluate(async (minPostCount) => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 1000;
      let tries = 0;

      const timer = setInterval(() => {
        const anchors = [...document.querySelectorAll('a')];
        const postLinks = anchors
          .map((a) => a.href)
          .filter((href) => href.match(/\/(p|reel|tv)\//));
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

module.exports = { autoScrollUntilLinks };
