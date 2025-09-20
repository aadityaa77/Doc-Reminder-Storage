const { verifyAccess, verifyRefresh, signAccessToken } = require('../utils/jwt');
const User = require('../modules/user/user.model');

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, roles: payload.roles || [] };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Optional: refresh via HttpOnly cookie in future
async function refreshToken(req, res) {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const payload = verifyRefresh(token);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const access = signAccessToken(user._id, { roles: user.roles });
    return res.json({ accessToken: access });
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

module.exports = { requireAuth, refreshToken };
