// storage/gridfs.js
const mongoose = require('mongoose');
const multer = require('multer');

let bucket;

async function initGridFS() {
  const conn = mongoose.connection;
  if (conn.readyState !== 1) throw new Error('Mongo connection not ready');
  bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
  return bucket;
}

function getBucket() {
  if (!bucket) throw new Error('GridFS not initialized');
  return bucket;
}

const uploadMemory = multer({ storage: multer.memoryStorage() });

async function writeToGridFS({ filename, buffer, contentType, metadata = {} }) {
  return new Promise((resolve, reject) => {
    const uploadStream = getBucket().openUploadStream(filename, { contentType, metadata });
    const fileId = uploadStream.id; // stable id available immediately
    uploadStream.once('error', reject);
    uploadStream.once('finish', () => resolve(fileId));
    uploadStream.end(buffer);
  });
}

async function deleteFromGridFS(fileId) {
  const { ObjectId } = require('mongodb');
  try { await getBucket().delete(new ObjectId(fileId)); } catch (_) {}
}

module.exports = { initGridFS, getBucket, uploadMemory, writeToGridFS, deleteFromGridFS };
