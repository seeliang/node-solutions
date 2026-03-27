const buildMailOptions = require('../mailTemplate');

describe('mailTemplate.js', () => {
  const opts = buildMailOptions({
    from: 'sender@example.com',
    to: 'joe@example.com',
    qrDataUrl: 'data:image/png;base64,abc123',
  });

  test('sets from and to correctly', () => {
    expect(opts.from).toBe('sender@example.com');
    expect(opts.to).toBe('joe@example.com');
  });

  test('has a subject', () => {
    expect(typeof opts.subject).toBe('string');
    expect(opts.subject.length).toBeGreaterThan(0);
  });

  test('html body contains inline cid image', () => {
    expect(opts.html).toContain('cid:qrcode');
  });

  test('attachment uses correct cid and base64 encoding', () => {
    expect(opts.attachments).toHaveLength(1);
    const [attachment] = opts.attachments;
    expect(attachment.cid).toBe('qrcode');
    expect(attachment.encoding).toBe('base64');
    expect(attachment.content).toBe('abc123');
  });
});
