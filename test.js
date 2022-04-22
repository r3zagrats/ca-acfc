require('dotenv').config();
const redisClient = require('./redis');
const asyncGet = require('./utils/async-http-get');
const fs = require('fs');
const superagent = require('superagent');
const RestClient = require('./utils/sfmc-client');
(async () => {
  var options = {
    props: [
      'ObjectID',
      'PartnerKey',
      'Name',
      'DefaultValue',
      'MaxLength',
      'IsRequired',
      'Ordinal',
      'IsPrimaryKey',
      'FieldType',
      'CreatedDate',
      'ModifiedDate',
      'Scale',
      'Client.ID',
      'CustomerKey',
    ], //required
    ///*
    filter: {
      //remove filter for all.
      leftOperand: 'DataExtension.CustomerKey',
      operator: 'equals',
      rightOperand: 'A7B622D8-35E6-4A12-8043-658AA817DD0B',
    },
    //*/
  };
  RestClient.SDKClient.dataExtensionColumn(options).get((err, dataCol) => {
    const _data = dataCol.body.Results;
    _data.sort(dynamicSort('Name'));
    console.log({
      deCol: _data,
      // dataExtention: dataDE.body.Results[0],
    });
  });
})().catch((err) => console.log({ status: 'error', message: err }));

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}