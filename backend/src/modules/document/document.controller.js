const docService = require('./document.service');
const crypto = require('crypto');
const { getBucket, writeToGridFS, deleteFromGridFS } = require('../../storage/gridfs');

async function create(req, res, next) {
  try {
    const { title, type, expiryDate, infinity } = req.body;
    const data = await docService.createDocument(req.user.id, { title, type, expiryDate, infinity });
    res.status(201).json(data);
  } catch (e) { next(e); }
}

async function list(req, res, next) {
  try {
    const { status, type, q, page, limit } = req.query;
    const data = await docService.listDocuments(req.user.id, { status, type, q, page, limit });
    res.json(data);
  } catch (e) { next(e); }
}

async function getOne(req, res, next) {
  try {
    const data = await docService.getDocument(req.user.id, req.params.id);
    res.json(data);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const { title, type, expiryDate, infinity } = req.body;
    const data = await docService.updateDocument(req.user.id, req.params.id, { title, type, expiryDate, infinity });
    res.json(data);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const deleted = await docService.deleteDocument(req.user.id, req.params.id, deleteFromGridFS);
    res.json(deleted);
  } catch (e) { next(e); }
}

async function uploadFile(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      const e = new Error('No file uploaded');
      e.status = 400;
      throw e;
    }
    const sanitized = (file.originalname || 'file').replace(/[^\w.-]/g, '_');
    const filename = `${Date.now()}-${sanitized}`;
    // Write buffer to GridFS
    const fileId = await writeToGridFS({
      filename,
      buffer: file.buffer,
      contentType: file.mimetype,
      metadata: { originalName: file.originalname }
    });
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const updated = await docService.attachFileMeta(req.user.id, req.params.id, {
      key: fileId.toString(),
      size: file.size || file.buffer?.length || 0,
      mimeType: file.mimetype,
      checksum
    });
    res.status(201).json(updated);
  } catch (e) { next(e); }
}

async function downloadFile(req, res, next) {
  try {
    const doc = await docService.getDocument(req.user.id, req.params.id);
    if (!doc.file || !doc.file.key) {
      const e = new Error('No file');
      e.status = 404;
      throw e;
    }
    const { ObjectId } = require('mongodb');
    const fileId = new ObjectId(doc.file.key);
    res.set({
      'Content-Type': doc.file.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.title || 'file')}"`
    });
    const stream = getBucket().openDownloadStream(fileId);
    stream.on('error', () => res.status(404).end());
    stream.pipe(res);
  } catch (e) { next(e); }
}

module.exports = { create, list, getOne, update, remove, uploadFile, downloadFile };
