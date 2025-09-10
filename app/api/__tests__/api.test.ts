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
