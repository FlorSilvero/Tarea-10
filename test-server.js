import express from 'express';
import { POST as registerHandler } from './app/api/auth/register/route';
import { POST as loginHandler } from './app/api/auth/login/route';

const app = express();
app.use(express.json());

// util para adaptar Response de Next al de Express (incluyendo cookies)
async function adaptNextResponse(nextRes, res) {
  // copiar Set-Cookie (pueden venir múltiples)
  const setCookie = nextRes.headers.get('set-cookie');
  if (setCookie) {
    // Next puede empaquetar varias cookies en un string; Express acepta array o string.
    // Si necesitás separar, podés hacer split por `,` sólo si sabés que no hay comas en atributos;
    // para test está OK pasar tal cual.
    res.setHeader('set-cookie', setCookie);
  }

  // copiar otros headers útiles si querés
  // nextRes.headers.forEach((v, k) => res.setHeader(k, v));

  const data = await nextRes.json().catch(() => ({}));
  res.status(nextRes.status).json(data);
}

app.post('/api/register', async (req, res) => {
  const nextReq = new Request('http://localhost/api/register', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' },
  });
  const nextRes = await registerHandler(nextReq);
  await adaptNextResponse(nextRes, res);
});

app.post('/api/login', async (req, res) => {
  const nextReq = new Request('http://localhost/api/login', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' },
  });
  const nextRes = await loginHandler(nextReq);
  await adaptNextResponse(nextRes, res);
});

export default app;
// --- ENDPOINT /api/reviews ---
import { POST as reviewsPostHandler } from './app/api/reviews/route';
app.post('/api/reviews', async (req, res) => {
  const nextReq = new Request('http://localhost/api/reviews', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json', cookie: req.headers.cookie || '' },
  });
  const nextRes = await reviewsPostHandler(nextReq);
  await adaptNextResponse(nextRes, res);
});
