const { createApp } = require('./app');
const { connect } = require('./config/db');
const { mongoUri, port } = require('./config/env');
const { initGridFS } = require('./storage/gridfs');

(async () => {
  try {
    await connect(mongoUri);
    await initGridFS();
    const app = createApp();
    const server = app.listen(port, () => console.log(`API on :${port}`));

    const shutdown = () => {
      server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
