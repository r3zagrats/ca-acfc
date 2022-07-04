const router = require('express').Router();
const SMSSendersController = require('../controllers/smssenders.controller');
 
router.get('/', SMSSendersController.getAll);

module.exports = router;
