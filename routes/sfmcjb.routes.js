'use strict';

const router = require('express').Router();
const SFMCJBController = require('../controllers/sfmcjb.controllers');

router.use('/execute', SFMCJBController.execute);
router.use('/save', SFMCJBController.save);
router.use('/publish', SFMCJBController.publish);
router.use('/validate', SFMCJBController.validate);
router.use('/stop', SFMCJBController.stop);

module.exports = router;
