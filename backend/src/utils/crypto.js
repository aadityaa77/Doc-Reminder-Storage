const crypto = require('crypto');
const { cryptoMasterKey } = require('../config/env');

function encryptGCM(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', cryptoMasterKey, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    ct: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

function decryptGCM({ ct, iv, tag }) {
  const ivBuf = Buffer.from(iv, 'base64');
  const tagBuf = Buffer.from(tag, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', cryptoMasterKey, ivBuf);
  decipher.setAuthTag(tagBuf);
  const pt = Buffer.concat([decipher.update(Buffer.from(ct, 'base64')), decipher.final()]);
  return pt.toString('utf8');
}

module.exports = { encryptGCM, decryptGCM };
