const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const { name, email, password, profileType } = req.body;
    if (!email || !password || !profileType) {
      const e = new Error('Missing required fields');
      e.status = 400;
      throw e;
    }
    const { user, accessToken, refreshToken } = await authService.register({ name, email, password, profileType });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(201).json({ user, accessToken });
  } catch (e) { next(e); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ user, accessToken });
  } catch (e) { next(e); }
}

async function me(req, res) {
  return res.json({ userId: req.user.id });
}

async function logout(req, res) {
  res.clearCookie('refreshToken');
  return res.status(204).send();
}

module.exports = { register, login, me, logout };
