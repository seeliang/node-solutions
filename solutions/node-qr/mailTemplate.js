/**
 * mailTemplate.js — pure function
 * Accepts { to, qrDataUrl } and returns a nodemailer mail options object.
 * The QR code is embedded as an inline CID image in the HTML body.
 */
const buildMailOptions = ({ from, to, qrDataUrl }) => ({
  from,
  to,
  subject: 'Your QR Code',
  html: `
    <p>Hello,</p>
    <p>Here is your QR code. Scan it with your phone camera to save the contact details.</p>
    <img src="cid:qrcode" alt="QR Code" style="width:256px;height:256px;" />
    <p>Thanks!</p>
  `,
  attachments: [
    {
      filename: 'qrcode.png',
      content: qrDataUrl.split('base64,')[1],
      encoding: 'base64',
      cid: 'qrcode',
    },
  ],
});

module.exports = buildMailOptions;
