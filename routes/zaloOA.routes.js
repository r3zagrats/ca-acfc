const router = require('express').Router();
const ZaloOAController = require('../controllers/zalooa.controllers');


router.get('/', ZaloOAController.getAllZaloOA);
router.post('/', ZaloOAController.createZaloOA);
router.patch('/', ZaloOAController.updateZaloOA);
router.get('/:id', ZaloOAController.getZaloOAById);
router.delete('/', ZaloOAController.deleteZaloOA);

module.exports = router;
