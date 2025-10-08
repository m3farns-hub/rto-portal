import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 8080;

// --- Config ---
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ALLOW_ORIGINS = (process.env.ALLOW_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

// --- Middleware ---
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // allow curl/postman
    if (ALLOW_ORIGINS.length === 0 || ALLOW_ORIGINS.some(o => origin.endsWith(o))) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

// Propagate tenant from header for all routes
app.use((req, _res, next) => {
  req.tenantId = req.header('X-Tenant-Id') || 'primary';
  next();
});

// --- Auth ---
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  // TODO: replace with real auth check (e.g., DB lookup)
  if (!email || !password) return res.status(400).send('Missing credentials');

  const token = jwt.sign(
    { sub: email, tenant: req.tenantId, roles: ['user'] },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({ token });
});

// --- Simple status route ---
app.get('/status', (req, res) => {
  res.json({
    ok: true,
    tenant: req.tenantId,
    now: new Date().toISOString()
  });
});

// --- Actions (placeholders) ---
app.post('/actions/on-demand-read', async (req, res) => {
  // TODO: connect to your store DB (read-only) using req.tenantId
  res.json({ ok: true, action: 'read', tenant: req.tenantId });
});

app.post('/actions/on-demand-write', async (req, res) => {
  // TODO: write to store DB + also write a change-history record in *cloud* storage
  res.json({ ok: true, action: 'write', tenant: req.tenantId });
});

// --- Error handler ---
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
