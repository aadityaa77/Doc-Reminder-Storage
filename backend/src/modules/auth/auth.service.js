const bcrypt = require('bcryptjs');
const User = require('../user/user.model');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');

async function register({ name, email, password, profileType }) {
  const exists = await User.findOne({ email });
  if (exists) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, profileType });
  const accessToken = signAccessToken(user._id, { roles: user.roles });
  const refreshToken = signRefreshToken(user._id, { tokenVersion: 1 });
  return { user: user.toSafeJSON(), accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const e = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }
  const ok = await user.comparePassword(password);
  if (!ok) {
    const e = new Error('Invalid credentials');
    e.status = 401;
    throw e;
  }
  const accessToken = signAccessToken(user._id, { roles: user.roles });
  const refreshToken = signRefreshToken(user._id, { tokenVersion: 1 });
  return { user: user.toSafeJSON(), accessToken, refreshToken };
}

module.exports = { register, login };
