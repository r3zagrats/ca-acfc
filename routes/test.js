require('dotenv').config();
const FormData = require('form-data');
const superagent = require('superagent');
const axios = require('axios');
const http = require('http');
const fs = require('fs');
const fsPromises = require('fs/promises');
const asyncget = require('../utils/async-http-get')

;(async () => {
  try {
    const url =
      'http://image.mc.gimasys.com/lib/fe28117170640474731277/m/1/6ea1cd47-cc78-4399-833b-d2123dd6d118.gif';
    const result = await asyncget(url, 'test2.gif')
    console.log(result)
    const file = fs.createReadStream(`./public/data/test2.gif`);
    const response = await superagent
      .post(`https://openapi.zalo.me/v2.0/oa/upload/gif`)
      .set(
        'access_token',
        'YafHI2SBdJU8I5TD9GwMDuTFMqil4i0qq10ED7mFe4Y09WfGQW-uNReCTNDc9kyAgc9-241p_0giSr0APZIRTSiaLsve7Vfre0z7MLu8oIEhA4LS00p9Tia71GWwDhCPym861oD1kn_2Imzv0Nk71Uzl2NuMLPPivdKy5GfmyMccTprNItoKNfjSN7D4JCflZ0rPIsuioM66E6HmAZFH3eSwUG0j7SWTn1jc8pKwxrwU06DnKalfTxr2Vmz_ODO2qpvc7pyExZt817ynDI3C7vqoOp5r6SvAeXv0GbK1tqYaGtKoRdtz7vr9TGvUNjWjbs942Zj-yYF1Rai-TsI1BAfFBrPfctFuIoKNcpC'
      )
      .set('content-type', 'multipart/form-data')
      .field('file', file);
    console.log('response', response.body);
  } catch (error) {
    console.log(error);
  }
})();