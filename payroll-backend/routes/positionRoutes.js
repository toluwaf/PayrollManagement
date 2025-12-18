const express = require('express');
const positionController = require('../controller/positionController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', positionController.getAllPositions);
router.get('/grades', positionController.getPositionGrades);
router.get('/:id', positionController.getPositionById);
router.post('/', positionController.createPosition);
router.put('/:id', positionController.updatePosition);
router.delete('/:id', positionController.deletePosition);

module.exports = router;