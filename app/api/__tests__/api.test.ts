// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;
let app: any;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  vi.stubEnv('MONGODB_URI', uri);
  vi.stubEnv('JWT_SECRET', 'test-secret'); // por si createSession lo requiere

  await mongoose.connect(uri);

  const mod = await import('../../../test-server');
  app = mod.default;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('API: Register y Login', () => {
  it('register: crea usuario y responde 201', async () => {
    const res = await request(app)
      .post('/api/register') // si cambiaste el test-server a /api/auth/register, cambiá acá también
      .set('Content-Type', 'application/json')
      .send({ email: 'test@user.com', password: '123456' });

    if (res.status !== 201) {
      // console.error('REGISTER FAIL:', res.status, res.body);
    }

    expect(res.status).toBe(201);
    // el handler devuelve { ok, user: { email, ... } }
    expect(res.body.user.email).toBe('test@user.com');
  });

  it('login: responde 200 y retorna cookie', async () => {
    // No re-registramos para evitar 409. Si querés, dejá esto comentado:
    // await request(app).post('/api/register').set('Content-Type','application/json')
    //   .send({ email: 'test@user.com', password: '123456' });

    const res = await request(app)
      .post('/api/login') // idem: si cambiaste a /api/auth/login, actualizá
      .set('Content-Type', 'application/json')
      .send({ email: 'test@user.com', password: '123456' });

    if (res.status !== 200) {
      // console.error('LOGIN FAIL:', res.status, res.body);
    }

    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

    // --- TESTS DE REVIEWS CRUD Y AUTORIZACIÓN ---
    describe('API: Reviews CRUD y autorización', () => {
      let cookie: string;

      beforeAll(async () => {
        // Registra y loguea un usuario para obtener la cookie
        await request(app)
          .post('/api/register')
          .send({ email: 'reviewer@test.com', password: '123456' });

        const res = await request(app)
          .post('/api/login')
          .send({ email: 'reviewer@test.com', password: '123456' });

      const rawCookie = res.headers['set-cookie'][0];
      // Extrae solo el valor del token
      const match = rawCookie.match(/session=([^;]+)/);
      cookie = match ? `session=${match[1]}` : rawCookie;
      console.log('Cookie usada en tests:', cookie);
      });

      it('no permite crear reseña sin autenticación', async () => {
        const res = await request(app)
          .post('/api/reviews')
          .send({ volumeId: 'vol1', rating: 5, content: 'Excelente libro' });

        expect(res.status).toBe(401); // o 403 según tu middleware
      });

      it('crea reseña válida con usuario autenticado', async () => {
        const res = await request(app)
          .post('/api/reviews')
          .set('Cookie', cookie)
          .send({ volumeId: 'vol1', rating: 5, content: 'Excelente libro' });

  expect(res.status).toBe(201);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty('volumeId', 'vol1');
  expect(res.body[0]).toHaveProperty('rating', 5);
      });

      it('rechaza reseña con datos inválidos', async () => {
        const res = await request(app)
          .post('/api/reviews')
          .set('Cookie', cookie)
          .send({ volumeId: '', rating: 0, content: 'ok' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });
    });
