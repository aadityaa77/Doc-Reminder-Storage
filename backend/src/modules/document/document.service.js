const Document = require('./document.model');
const { encryptGCM, decryptGCM } = require('../../utils/crypto');
const mongoose = require('mongoose');

function deriveStatus({ infinity, expiryDate }) {
  if (infinity) return 'active';
  if (!expiryDate) return 'active';
  const now = new Date();
  const exp = new Date(expiryDate);
  return exp >= new Date(now.toDateString()) ? 'active' : 'expired';
}

// Encrypt fields into enc blobs used by the schema
function encryptDocFields({ title, type, expiryDate }) {
  return {
    titleEnc: encryptGCM(title || ''),
    typeEnc: encryptGCM(type || ''),
    expiryDateEnc: expiryDate ? encryptGCM(new Date(expiryDate).toISOString()) : undefined
  };
}

// Decrypt enc fields to plain values for responses
function decryptDoc(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;
  let title = '';
  let type = '';
  let expiryDate = null;
  try { title = decryptGCM(obj.titleEnc); } catch {}
  try { type = decryptGCM(obj.typeEnc); } catch {}
  try {
    if (obj.expiryDateEnc) {
      expiryDate = new Date(decryptGCM(obj.expiryDateEnc));
    }
  } catch {}
  return {
    id: obj._id,
    userId: obj.userId,
    title,
    type,
    expiryDate,
    infinity: obj.infinity,
    status: obj.status,
    file: obj.file,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}

async function createDocument(userId, { title, type, expiryDate, infinity }) {
  const enc = encryptDocFields({ title, type, expiryDate });
  const status = deriveStatus({ infinity: !!infinity, expiryDate });
  const doc = await Document.create({
    userId,
    ...enc,
    infinity: !!infinity,
    status
  });
  return decryptDoc(doc);
}

async function listDocuments(userId, { status, type, q, page = 1, limit = 10 }) {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };
  if (status) filter.status = status;
  // type/title are encrypted; simple filtering on plaintext is not possible here without hashes.
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Document.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Document.countDocuments(filter)
  ]);
  return {
    items: items.map(decryptDoc),
    pagination: { page: Number(page), limit: Number(limit), total }
  };
}

async function getDocument(userId, id) {
  const doc = await Document.findOne({ _id: id, userId });
  if (!doc) {
    const e = new Error('Not found');
    e.status = 404;
    throw e;
  }
  return decryptDoc(doc);
}

async function updateDocument(userId, id, { title, type, expiryDate, infinity }) {
  const doc = await Document.findOne({ _id: id, userId });
  if (!doc) {
    const e = new Error('Not found');
    e.status = 404;
    throw e;
  }
  // Update encrypted fields if provided
  if (typeof title !== 'undefined') doc.titleEnc = encryptGCM(title || '');
  if (typeof type !== 'undefined') doc.typeEnc = encryptGCM(type || '');
  if (typeof expiryDate !== 'undefined') {
    doc.expiryDateEnc = expiryDate ? encryptGCM(new Date(expiryDate).toISOString()) : undefined;
  }
  if (typeof infinity !== 'undefined') doc.infinity = !!infinity;

  // Recompute status
  let expPlain = null;
  if (doc.expiryDateEnc) {
    try { expPlain = new Date(decryptGCM(doc.expiryDateEnc)); } catch {}
  }
  doc.status = deriveStatus({ infinity: doc.infinity, expiryDate: expPlain });
  await doc.save();
  return decryptDoc(doc);
}

async function deleteDocument(userId, id, deleteFileFn) {
  const doc = await Document.findOne({ _id: id, userId });
  if (!doc) {
    const e = new Error('Not found');
    e.status = 404;
    throw e;
  }
  // If file present, delete from GridFS via provided fn
  if (doc.file && doc.file.key && deleteFileFn) {
    await deleteFileFn(doc.file.key);
  }
  await Document.deleteOne({ _id: id, userId });
  return { ok: true };
}

async function attachFileMeta(userId, id, { key, size, mimeType, checksum }) {
  const doc = await Document.findOneAndUpdate(
    { _id: id, userId },
    { $set: { file: { provider: 'gridfs', key, size, mimeType, checksum, encrypted: false } } },
    { new: true }
  );
  if (!doc) {
    const e = new Error('Not found');
    e.status = 404;
    throw e;
  }
  return decryptDoc(doc);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
  attachFileMeta
};
