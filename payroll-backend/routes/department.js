const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

// Mock controller - you'll need to implement this
const departmentController = {
  getAllDepartments: async (req, res) => {
    try {
      // This should query your departments collection
      const departments = [
        { _key: 'dept_eng', name: 'Engineering' },
        { _key: 'dept_fin', name: 'Finance' },
        { _key: 'dept_hr', name: 'Human Resources' },
        { _key: 'dept_sales', name: 'Sales' },
        { _key: 'dept_ops', name: 'Operations' },
        { _key: 'dept_it', name: 'IT' }
      ];
      res.json({ success: true, data: departments });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

router.use(authMiddleware);
router.get('/', departmentController.getAllDepartments);

module.exports = router;