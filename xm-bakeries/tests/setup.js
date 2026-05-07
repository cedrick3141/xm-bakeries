// tests/setup.js
// This file runs before all tests to configure environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/xm_bakeries_test';
