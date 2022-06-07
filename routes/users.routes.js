const router = require('express').Router();
const usersController = require('../controllers/users.controllers');

router.get('/', usersController.getAllUser);
router.post('/', usersController.updateUser);
router.post('/auth', usersController.authenUser);

module.exports = router;
