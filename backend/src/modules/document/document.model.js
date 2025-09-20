const mongoose = require('mongoose');

const encryptedString = {
  ct: String,
  iv: String,
  tag: String
};

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  titleEnc: { type: encryptedString, required: true }, // encrypted title
  typeEnc: { type: encryptedString, required: true },  // encrypted type
  expiryDateEnc: { type: encryptedString },            // encrypted date or null
  infinity: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'expired'], index: true }, // can be derived/updated
  file: {
    provider: { type: String, enum: ['local', 's3', 'cloudinary'], default: 'local' },
    key: String,      // path or object key
    mimeType: String,
    size: Number,
    checksum: String,
    encrypted: { type: Boolean, default: false },
    iv: String,
    tag: String
  }
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;
