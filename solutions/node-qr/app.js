require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const buildVCard = require('./vcard');
const generateQR = require('./qr');
const buildMailOptions = require('./mailTemplate');
const mailer = require('./mailer');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/qr/image', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    const vcard = buildVCard(req.body);
    const qrDataUrl = await generateQR(vcard);
    const base64 = qrDataUrl.split('base64,')[1];
    const imageBuffer = Buffer.from(base64, 'base64');

    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', 'inline; filename="qrcode.png"');
    return res.status(200).send(imageBuffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Failed to generate QR code image',
      detail: err.message,
    });
  }
});

app.post('/qr', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    const vcard = buildVCard(req.body);
    const qrDataUrl = await generateQR(vcard);
    const mailOptions = buildMailOptions({
      from: process.env.SMTP_FROM,
      to: email,
      qrDataUrl,
    });

    await mailer.send(mailOptions);
    res.json({ message: `QR code sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to generate or send QR code',
      detail: err.message,
    });
  }
});

module.exports = app;
