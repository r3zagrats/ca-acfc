'use strict';

const router = require('express').Router();
const SFMCCAController = require('../controllers/sfmcjb.controllers');

router.use('/execute', SFMCCAController.execute);
router.use('/save', SFMCCAController.save);
router.use('/publish', SFMCCAController.publish);
router.use('/validate', SFMCCAController.validate);
router.use('/stop', SFMCCAController.stop);

module.exports = router;
