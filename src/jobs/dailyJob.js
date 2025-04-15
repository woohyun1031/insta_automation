const cron = require('node-cron');
const { getRecentPostLinks } = require('../crawler/instagramScraper');
const { sendEmail } = require('../email/mailer');
const { INSTAGRAM_USERNAME, RECEIVER_EMAIL } = require('../config');

function runDailyJob() {
  console.log('💡 Scheduling Daily Job...');

  // cron.schedule('0 8 * * *', async () => {
  cron.schedule('* * * * *', async () => {
    // console.log(`🚀 Running Crawling Job at ${new Date().toISOString()}`);
    console.log(`테스트용 실행 시간: ${new Date().toISOString()}`);
    try {
      const links = await getRecentPostLinks(INSTAGRAM_USERNAME);
      console.log(links)
      if (links.length === 0) {
        console.log('📭 No new posts found');
        return;
      }
  
      console.log(`📦 Found ${links.length} new posts`);
  
      const htmlContent = links.map((l) => `<a href="${l}">${l}</a>`).join('<br>');
  
      await sendEmail(`[InstaBot] 오늘의 새 게시물`, htmlContent, RECEIVER_EMAIL);
  
      console.log('📬 Mail sent successfully');
    } catch (error) {
      console.error('Error in daily job:', error);
      return;
    }
  });
}

module.exports = { runDailyJob };
