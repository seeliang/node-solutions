const request = require('supertest');

const app = require('../app');

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
