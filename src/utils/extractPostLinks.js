async function extractPostLinks(page) {
  let links = [];

  // 1차 구조 기반 셀렉터
  links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[role="link"]'));
    console.log('🔍 구조 기반 anchor 개수:', anchors.length);
    return anchors
      .map((a) => a.href)
      .filter((href) => href.match(/\/(p|reel|tv)\//));
  });

  console.log(`🔎 구조 기반 셀렉터 수집 개수: ${links.length}`);

  if (links.length === 0) {
    console.log('⚠️ 구조 기반 셀렉터 실패 → fallback selector 동작');

    // 2차 div 기반
    links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('div._ac7v a'));
      return anchors
        .map((a) => a.href)
        .filter((href) => href.match(/\/(p|reel|tv)\//));
    });

    console.log(`🌀 fallback 셀렉터 수집 개수: ${links.length}`);
  }

  if (links.length === 0) {
    console.log('⚠️ fallback 실패 → 전역 셀렉터 동작');

    // 3차 최후의 전역 a 태그
    links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .map((a) => a.href)
        .filter((href) => href.match(/\/(p|reel|tv)\//));
    });

    console.log(`🚨 전역 셀렉터 수집 개수: ${links.length}`);
  }

  return links;
}

module.exports = { extractPostLinks };
