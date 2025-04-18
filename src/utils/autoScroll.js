async function autoScrollUntilLinks(page, min = 10) {
  await page.evaluate(async (minPostCount) => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let tries = 0;
      const distance = 800;

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        tries++;

        const anchors = Array.from(document.querySelectorAll('a'));
        const links = anchors.map((a) => a.href).filter((href) => href.match(/\/(p|reel|tv)\//));
        const uniqueLinks = [...new Set(links)];

        console.log(`🔄 스크롤 ${tries}회차, 게시물 ${uniqueLinks.length}개`);

        if (
          uniqueLinks.length >= minPostCount || // 수집 충분
          tries >= 40 ||                        // 너무 오래 탐색 방지
          totalHeight > scrollHeight * 2        // 페이지 길이 이상 내려갔으면 멈춤
        ) {
          clearInterval(timer);

          // ⏱️ DOM이 lazy load될 시간 살짝 더 주기
          setTimeout(resolve, 1000); // 1초 대기
        }
      }, 800); // 스크롤 간격
    });
  }, min);
}

module.exports = { autoScrollUntilLinks };