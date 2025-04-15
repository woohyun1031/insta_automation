const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config/secrets');

async function sendEmail(subject, content, to) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"InstaBot" <${EMAIL_USER}>`,
    to,
    subject,
    html: content,
  });
}

module.exports = { sendEmail };
