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
    res.status(500).json({ error: 'Failed to generate or send QR code' });
  }
});

module.exports = app;
