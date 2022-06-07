const router = require('express').Router();
const SFMCAPI = require('../api/sfmc');

router.use('/getde', SFMCAPI.getDE);
router.use('/getdecol', SFMCAPI.getDEColumn);
router.use('/getderow', SFMCAPI.getDERow);
router.use('/getcustomcontent', SFMCAPI.getCustomContent);
router.use('/getimagecontent', SFMCAPI.getImageContent);
router.use('/getmetadatacontent', SFMCAPI.getMetaDataContent);
router.post('/getdeinfo', SFMCAPI.getDEInfo);

module.exports = router;
