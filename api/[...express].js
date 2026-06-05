// Vercel Serverless Function entry point
// Load environment variables from .env file (for local dev)
// On Vercel, env vars are set via the dashboard
require('dotenv').config({ path: require('path').resolve(__dirname, '..', 'Backend', '.env') });

const app = require('../Backend/server');

module.exports = app;
