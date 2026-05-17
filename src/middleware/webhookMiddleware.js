const express = require('express');

/**
 * Middleware to capture raw body for webhook signature verification
 */
const captureRawBody = express.json({
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf.toString(encoding || 'utf8');
  },
});

module.exports = { captureRawBody };
