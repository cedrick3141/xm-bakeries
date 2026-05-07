require('dotenv').config();
const app = require('./app');
const connectDB = require('../config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`XM Bakeries API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
