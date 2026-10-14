import { randomBytes } from 'node:crypto';

const sessions = new Map();
const cookieName = 'pitstop_demo';

function sessionToken(req) {
  const cookie = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`));
  return cookie ? decodeURIComponent(cookie.slice(cookieName.length + 1)) : '';
}

export function attachDemoUser(req, res, next) {
  const user = sessions.get(sessionToken(req)) ?? null;
  res.locals.currentUser = user;
  next();
}

export function loginPage(req, res) {
  res.render('account/login', {
    title: 'Giriş Yap',
    error: '',
    email: '',
    welcome: req.query.welcome === '1' && Boolean(res.locals.currentUser)
  });
}

export function login(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validEmail || password.length < 6) {
    return res.status(400).render('account/login', {
      title: 'Giriş Yap', error: 'Geçerli bir e-posta ve en az 6 karakterli parola gir.', email, welcome: false
    });
  }

  const token = randomBytes(32).toString('hex');
  const displayName = email.split('@')[0].replace(/[._-]+/g, ' ');
  sessions.set(token, { email, name: displayName });
  res.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return res.redirect('/Account/Login?welcome=1');
}

export function logout(req, res) {
  sessions.delete(sessionToken(req));
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.redirect('/');
}
