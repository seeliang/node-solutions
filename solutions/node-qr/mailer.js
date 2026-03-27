/**
 * mailer.js — impure module
 * Creates a nodemailer SMTP transporter from env vars and exposes a send function.
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const send = (mailOptions) => transporter.sendMail(mailOptions);

module.exports = { send };
