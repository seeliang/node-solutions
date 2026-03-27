const generateQR = require('../qr');

describe('qr.js', () => {
  test('returns a base64 PNG data URL', async () => {
    const dataUrl = await generateQR('BEGIN:VCARD\nEMAIL:joe@example.com\nEND:VCARD');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test('produces a non-empty base64 payload', async () => {
    const dataUrl = await generateQR('hello');
    const base64 = dataUrl.split('base64,')[1];
    expect(base64.length).toBeGreaterThan(0);
  });

  test('different inputs produce different QR codes', async () => {
    const a = await generateQR('mailto:a@example.com');
    const b = await generateQR('mailto:b@example.com');
    expect(a).not.toEqual(b);
  });
});
