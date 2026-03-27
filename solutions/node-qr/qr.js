/**
 * qr.js — pure async function
 * Accepts a vCard string and returns a Promise resolving to a base64 PNG data URL.
 */
const QRCode = require('qrcode');

const generateQR = (vcardString) => QRCode.toDataURL(vcardString);

module.exports = generateQR;
