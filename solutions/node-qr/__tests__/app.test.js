const request = require('supertest');

// Mock mailer so no real emails are sent during tests
jest.mock('../mailer', () => ({ send: jest.fn().mockResolvedValue({ messageId: 'test-id' }) }));

const app = require('../app');
const mailer = require('../mailer');

describe('POST /qr — integration', () => {
  beforeEach(() => {
    mailer.send.mockClear();
  });

  test('400 when email is missing', async () => {
    const res = await request(app).post('/qr').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('email is required');
    expect(mailer.send).not.toHaveBeenCalled();
  });

  test('200 with minimal payload (email only)', async () => {
    const res = await request(app)
      .post('/qr')
      .send({ email: 'joe@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('QR code sent to joe@example.com');
    expect(mailer.send).toHaveBeenCalledTimes(1);
  });

  test('200 with extended payload (all fields)', async () => {
    const res = await request(app).post('/qr').send({
      email: 'joe@example.com',
      name: 'Joe Lee',
      phone: '+1234567890',
      org: 'Acme',
      url: 'https://example.com',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('QR code sent to joe@example.com');
    expect(mailer.send).toHaveBeenCalledTimes(1);
  });

  test('mailer is called with correct to address', async () => {
    await request(app).post('/qr').send({ email: 'jane@example.com' });
    const [mailOptions] = mailer.send.mock.calls[0];
    expect(mailOptions.to).toBe('jane@example.com');
  });

  test('500 when mailer throws', async () => {
    mailer.send.mockRejectedValueOnce(new Error('SMTP failure'));
    const res = await request(app).post('/qr').send({ email: 'joe@example.com' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to generate or send QR code');
  });
});

describe('POST /qr/image — integration', () => {
  test('400 when email is missing', async () => {
    const res = await request(app).post('/qr/image').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('email is required');
  });

  test('200 returns png image bytes', async () => {
    const res = await request(app)
      .post('/qr/image')
      .send({ email: 'joe@example.com', name: 'Joe Lee' });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/png/);
    expect(res.headers['content-disposition']).toContain('qrcode.png');
    expect(Buffer.isBuffer(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
