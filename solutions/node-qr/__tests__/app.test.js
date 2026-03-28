const request = require('supertest');
const fs = require('fs/promises');
const path = require('path');

const app = require('../app');

describe('POST /qr/image — integration', () => {
  afterAll(async () => {
    const generatedDir = path.join(__dirname, '../generated');
    await fs.rm(generatedDir, { recursive: true, force: true });
  });

  test('400 when email is missing', async () => {
    const res = await request(app).post('/qr/image').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('email is required');
  });

  test('200 creates png file and returns hash metadata', async () => {
    const res = await request(app)
      .post('/qr/image')
      .send({ email: 'joe@example.com', name: 'Joe Lee' });

    expect(res.status).toBe(200);
    expect(res.body.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(res.body.fileName).toMatch(/^[a-f0-9]{6}\.png$/);
    expect(res.body.path).toMatch(/^generated\/[a-f0-9]{6}\.png$/);

    const createdFilePath = path.join(__dirname, '..', res.body.path);
    const stat = await fs.stat(createdFilePath);
    expect(stat.size).toBeGreaterThan(0);
  });

  test('same input yields same hash and filename', async () => {
    const payload = { email: 'joe@example.com', name: 'Joe Lee' };
    const res1 = await request(app).post('/qr/image').send(payload);
    const res2 = await request(app).post('/qr/image').send(payload);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res1.body.hash).toBe(res2.body.hash);
    expect(res1.body.fileName).toBe(res2.body.fileName);
  });
});
