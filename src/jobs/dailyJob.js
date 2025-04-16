const cron = require('node-cron');
const { getRecentPostLinks } = require('../crawler/getRecentPostLinks');
const { sendEmail } = require('../email/mailer');

function runDailyJob() {
  console.log('💡 Scheduling Daily Job...');
  const username = process.env.TARGET_USERNAME;

  // cron.schedule('0 8 * * *', async () => {
  cron.schedule('* * * * *', async () => {
    console.log(`🚀 Running Crawling Job at ${new Date().toISOString()}`);
    try {
      const links = await getRecentPostLinks(username);
      if (links.length === 0) {
        console.log('📭 새 게시물이 없습니다.');
        return;
      }
      const htmlContent = links
        .map((link) => `<a href="${link}" target="_blank">${link}</a>`)
        .join('<br>');
      const subject = `[InstaBot] ${username}의 새 게시물 ${links.length}건`;
      await sendEmail(subject, htmlContent, process.env.EMAIL_RECEIVER);
      console.log('📬 Mail sent successfully');
    } catch (error) {
      console.error('Error in daily job:', error);
      return;
    }
  });
}

module.exports = { runDailyJob };
