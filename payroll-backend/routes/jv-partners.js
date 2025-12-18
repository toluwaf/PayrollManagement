const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

// Mock controller - you'll need to implement this
const jvPartnerController = {
  getAllJVPartners: async (req, res) => {
    try {
      // This should query your jv_partners collection
      const jvPartners = [
        { _key: 'jv_nnpc', name: 'NNPC' },
        { _key: 'jv_shell', name: 'Shell' },
        { _key: 'jv_chevron', name: 'Chevron' },
        { _key: 'jv_total', name: 'Total' }
      ];
      res.json({ success: true, data: jvPartners });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

router.use(authMiddleware);
router.get('/', jvPartnerController.getAllJVPartners);

module.exports = router;
