'use strict';

const router = require('express').Router();
const SMSSendersController = require('../controllers/SMSSenders.controllers');

router.get('/', SMSSendersController.getAll);

module.exports = router;