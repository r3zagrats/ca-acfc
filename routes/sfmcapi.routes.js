const router = require('express').Router();
const SFMCApi = require('../api/sfmc');

router.use('/getde', SFMCApi.getDE);
router.use('/getdecol', SFMCApi.getDEColumn);
router.use('/getderow', SFMCApi.getDERow);
router.use('/getcustomcontent', SFMCApi.getCustomContent);
router.use('/getimagecontent', SFMCApi.getImageContent);
router.use('/getmetadatacontent', SFMCApi.getMetaDataContent);
router.post('/getdeinfo', SFMCApi.getDEInfo);

module.exports = router;
