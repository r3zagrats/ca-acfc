const router = require('express').Router();
const zaloOAController = require('../controllers/zalooa.controllers');

router.get('/', zaloOAController.getAllZaloOA);
router.post('/', zaloOAController.createZaloOA);
router.patch('/', zaloOAController.updateZaloOA);
router.get('/:id', zaloOAController.getZaloOAById);
router.delete('/', zaloOAController.deleteZaloOA);

module.exports = router;
