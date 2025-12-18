const express = require('express');
const router = express.Router();

// Simple test route without DB dependency
router.get('/test', (req, res) => {
  res.json({ message: 'Route is working!' });
});

module.exports = router;