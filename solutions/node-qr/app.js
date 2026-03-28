require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const buildVCard = require('./vcard');
const generateQR = require('./qr');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const hashFromString = (value) => crypto.createHash('sha256').update(value).digest('hex');
const outputDir = path.join(__dirname, 'generated');

app.post('/qr/image', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email is required' });
  }

  try {
    const vcard = buildVCard(req.body);
    const hash = hashFromString(vcard);
    const qrDataUrl = await generateQR(vcard);
    const base64 = qrDataUrl.split('base64,')[1];
    const imageBuffer = Buffer.from(base64, 'base64');
    const fileName = `${hash.slice(0, 6)}.png`;
    const filePath = path.join(outputDir, fileName);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filePath, imageBuffer);

    return res.status(200).json({
      hash,
      fileName,
      path: `generated/${fileName}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Failed to generate QR code file',
      detail: err.message,
    });
  }
});

module.exports = app;
