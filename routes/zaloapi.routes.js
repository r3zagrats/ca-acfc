const router = require('express').Router();
const ZaloApi = require('../api/zalo');

router.post('/getznstemplates', ZaloApi.getZNSTemplates);
router.post('/getznstemplatedetail', ZaloApi.getZNSTemplateDetail);
router.get('/getauthcode', ZaloApi.getAuthCode);

module.exports = router;
