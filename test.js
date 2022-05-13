const superagent = require('superagent');
(async () => {
  const token = await superagent
    .post('http://localhost:8080/api/getznstemplatedetail')
    .send({ TemplateId: '225285', OAId: '1015448571833111846' });
  console.log('token:', token.text);
})();
