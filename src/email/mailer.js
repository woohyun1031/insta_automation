// mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(subject, htmlContent, to) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Gmail 주소
      pass: process.env.EMAIL_PASS, // 앱 비밀번호
    },
  });

  const mailOptions = {
    from: `"InstaBot 📸" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('📬 메일 전송 완료!');
  } catch (error) {
    console.error('❌ 메일 전송 실패:', error);
  }
}

module.exports = { sendEmail };
