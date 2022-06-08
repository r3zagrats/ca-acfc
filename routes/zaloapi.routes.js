const router = require('express').Router();
const zaloAPI = require('../api/zalo');

router.post('/getznstemplates', zaloAPI.getZNSTemplates);
router.post('/getznstemplatedetail', zaloAPI.getZNSTemplateDetail);
router.get('/getauthcode', zaloAPI.getAuthCode);

module.exports = router;
