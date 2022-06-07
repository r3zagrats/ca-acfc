const router = require('express').Router();
const channelsController = require('../controllers/channels.controllers');

router.get('/', channelsController.getAllChannels);

module.exports = router;
