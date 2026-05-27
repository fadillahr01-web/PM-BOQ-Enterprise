const { prisma } = require('../config/db');
const fallbackStore = require('../utils/fallbackStore');
const https = require('https');

// ── Helper: verify Google ID token via Google's tokeninfo endpoint ────────────
function verifyGoogleToken(idToken) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    https.get(url, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const payload = JSON.parse(raw);
          if (payload.error_description || res.statusCode !== 200) {
            reject(new Error(payload.error_description || 'Invalid token'));
          } else {
            resolve(payload);
          }
        } catch {
          reject(new Error('Failed to parse Google response'));
        }
      });
    }).on('error', reject);
  });
}

// ── Traditional email/password login ─────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    console.warn('[Database Offline] Falling back to memory authStore for login.');
    const user = fallbackStore.users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password (Demo Mode)' });
    }
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  }
}

// ── Google OAuth login with email whitelist ───────────────────────────────────
async function googleAuth(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential is required' });
  }

  // 1. Verify the ID token with Google
  let payload;
  try {
    payload = await verifyGoogleToken(credential);
  } catch (err) {
    console.error('[Google Auth] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Token Google tidak valid. Silakan coba lagi.' });
  }

  const { email, name, picture, email_verified } = payload;

  if (!email_verified || email_verified === 'false') {
    return res.status(401).json({ error: 'Email Google belum diverifikasi.' });
  }

  // 2. Check against email whitelist (set in ALLOWED_EMAILS env var, comma-separated)
  const rawList = process.env.ALLOWED_EMAILS || '';
  const whitelist = rawList
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (whitelist.length > 0 && !whitelist.includes(email.toLowerCase())) {
    console.warn(`[Google Auth] Blocked login attempt from unregistered email: ${email}`);
    return res.status(403).json({ error: 'Email tidak terdaftar. Akses ditolak.' });
  }

  // 3. Try to find the user in the database
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.json({
        id:      user.id,
        name:    user.name,
        email:   user.email,
        role:    user.role,
        picture: picture || null,
        authMethod: 'google'
      });
    }
  } catch (dbError) {
    console.warn('[Google Auth] DB offline, checking in-memory store.');
  }

  // 4. Fallback: check in-memory store
  const memUser = fallbackStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (memUser) {
    return res.json({
      id:         memUser.id,
      name:       memUser.name,
      email:      memUser.email,
      role:       memUser.role,
      picture:    picture || null,
      authMethod: 'google'
    });
  }

  // 5. Email is whitelisted but not yet in DB/store — grant access with default PM role
  console.log(`[Google Auth] New whitelisted user granted access: ${email}`);
  return res.json({
    id:         `google-${Date.now()}`,
    name:       name || email.split('@')[0],
    email:      email,
    role:       'PROJECT_MANAGER',
    picture:    picture || null,
    authMethod: 'google'
  });
}

module.exports = { login, googleAuth };
