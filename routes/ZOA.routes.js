'use strict';

const router = require('express').Router();
const zaloOAController = require('../controllers/zaloOA.controllers');

router.get('/', zaloOAController.getAllZOA);
router.post('/', zaloOAController.createZOA);
router.patch('/', zaloOAController.updateZOA);
router.get('/:id', zaloOAController.getZOAById);
router.delete('/', zaloOAController.deleteZOA);

module.exports = router;