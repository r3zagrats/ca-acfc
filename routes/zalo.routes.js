'use strict';

const router = require('express').Router();
const zaloAPI = require('../api/zalo');

router.post('/getznstemplates', zaloAPI.getZNSTemplates);
router.post('/getznstemplatedetail', zaloAPI.getZNSTemplateDetail);

module.exports = router;
