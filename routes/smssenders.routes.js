const router = require('express').Router();
const SMSSendersController = require('../controllers/smssenders.controllers');
 
router.get('/', SMSSendersController.getAll);

module.exports = router;
