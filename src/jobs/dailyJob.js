const cron = require('node-cron');
const { getRecentPostLinks } = require('../crawler/getRecentPostLinks');
const { sendEmail } = require('../email/mailer');
const { loginAndSaveCookies } = require('../login/loginAndSaveCookies');
const { logout } = require('../login/logout');

function runDailyJob() {
  console.log('💡 Scheduling Daily Job...');
  const username = process.env.TARGET_USERNAME;

  // cron.schedule(
  //   '0 8 * * *',
  //   async () => {
      cron.schedule(
        '*/2 * * * *',
        async () => {
      console.log(`🚀 Running Crawling Job at ${new Date().toISOString()}`);
      try {
        await loginAndSaveCookies(); // ✨ 로그인 & 쿠키 저장
        console.log('🔑 로그인 완료');
        const links = await getRecentPostLinks(username);
        if (links.length === 0) {
          console.log('📭 새 게시물이 없습니다.');
          return;
        }
        const htmlContent = `
          <div style="font-family: Arial, sans-serif;">
            <h2>📸 ${username}의 새 게시물 ${links.length}건</h2>
            <hr />
            ${links
              .map((link) => {
                const postId = link.split('/').filter(Boolean).pop(); // 마지막 부분 추출
                const imgUrl = `https://www.instagram.com/p/${postId}/media/?size=m`; // 중간 크기 이미지 추론

                return `
                  <div style="margin-bottom: 20px;">
                    <a href="${link}" target="_blank" style="text-decoration: none; color: #333;">
                      <img src="${imgUrl}" alt="Post image" style="width: 100%; max-width: 400px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);" />
                      <p style="margin-top: 8px;">🔗 ${link}</p>
                    </a>
                  </div>
                `;
              })
              .join('')}
            <hr />
            <p style="font-size: 12px; color: gray;">본 메일은 자동으로 전송되었습니다.</p>
          </div>
        `;
        const subject = `📬 [InstaBot] ${username}의 새 게시물 ${links.length}건`;
        await sendEmail(subject, htmlContent, process.env.EMAIL_RECEIVER);
        console.log('📬 Mail sent successfully');
        await logout(); // ✨ 로그아웃 처리
      } catch (error) {
        console.error('Error in daily job:', error);
        return;
      }
    },
    {
      timezone: 'Asia/Seoul',
    }
  );
}

module.exports = { runDailyJob };
