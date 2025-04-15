require('dotenv').config();
const { getRecentPostLinks } = require('./getRecentPostLinks');
const { sendEmail } = require('./src/email/mailer');

(async () => {
  const username = process.env.TARGET_USERNAME;
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
})();
