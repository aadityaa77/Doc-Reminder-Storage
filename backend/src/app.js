const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('./security/helmet');
const cors = require('./security/cors');
const errorHandler = require('./middleware/error');

const authRoutes = require('./modules/auth/auth.routes');
const documentRoutes = require('./modules/document/document.routes');

function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.use('/api/auth', authRoutes);
  app.use('/api/documents', documentRoutes);

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
