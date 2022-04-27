const RestClient = require('../utils/sfmc-client');
const superagent = require('superagent');
require('dotenv').config();
const { createClient } = require('redis');

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.getDe = async (req, res) => {
  // try {
  //   var DEOptions = [];
  //   const props = ['Name', 'CustomerKey', 'ObjectID'];
  //   RestClient.SDKClient.dataExtension({
  //     props,
  //     filter: {
  //       //remove filter for all.
  //       leftOperand: 'ObjectID',
  //       operator: 'equals',
  //       rightOperand: 'A7B622D8-35E6-4A12-8043-658AA817DD0B',
  //     },
  //   }).get((err, data) => {
  //     data.body.Results.forEach((opt) => {
  //       if (opt.Name.charAt(0) != '_') {
  //         DEOptions.push({
  //           name: opt.Name,
  //           CustomerKey: opt.CustomerKey + '||' + opt.Name,
  //           ID: opt.ObjectID,
  //         });
  //       }
  //     });
  //     res.status(200).send(DEOptions);
  //   });
  // } catch (e) {
  //   res.status(500).send({
  //     status: 'Fail',
  //   });
  // }
  var options = {
    props: ['Name', 'CustomerKey', 'ObjectID', 'Status', 'Description'], //required
    filter: {
      //remove filter for all.
      leftOperand: 'CustomerKey',
      operator: 'equals',
      rightOperand: 'CC67F80E-EA7F-429E-89DE-B9D48C0F51C6',
    },
  };
  var de = RestClient.SDKClient.dataExtension(options);

  de.get(function (err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      var statusCode =
        response && response.res && response.res.statusCode ? response.res.statusCode : 200;
      var result = response && response.body ? response.body : response;
      response && res.status(statusCode).send(result);
    }
  });
};

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.getDeColumn = async (req, res) => {
  try {
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
        rightOperand: '4B34E1DC-7751-4F28-A30E-0B8B1513D3C2',
      },
      //*/
    };
    RestClient.SDKClient.dataExtensionColumn(options).get((err, data) => {
      const _data = data.body.Results;
      _data.sort(dynamicSort('Name'));
      res.status(200).send(_data);
    });
  } catch (e) {
    res.status(500).send({
      status: 'Fail',
    });
  }
};

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.getDeRow = async (req, res) => {
  try {
    var options = {
      props: ['OAId', 'Name', 'ZaloId', 'Status'], //required
      ///*
      Name: 'OA Followers',
      filter: null,
      //*/
    };
    RestClient.SDKClient.dataExtensionRow(options).get((err, data) => {
      const _data = data.body.Results;
      _data.sort(dynamicSort('Name'));
      res.status(200).send(_data);
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      status: 'Fail',
    });
  }
};

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.getCustomContent = async (req, res) => {
  try {
    const data = await RestClient.getContent(
      JSON.stringify({
        page: {
          page: 1,
          pageSize: 100,
        },
        query: {
          leftOperand: {
            property: 'assetType.displayName',
            simpleOperator: 'contains',
            value: 'Custom',
          },
          logicalOperator: 'OR',
          rightOperand: {
            property: 'assetType.name',
            simpleOperator: 'equal',
            value: 'customblock',
          },
        },
        sort: [{ property: 'name', direction: 'ASC' }],
      })
    );
    res.status(200).send(data.body);
  } catch (error) {
    res.status(500).send({
      status: 'error',
      message: error,
    });
  }
};

exports.getImageContent = async (req, res) => {
  try {
    const data = await RestClient.getContent(
      JSON.stringify({
        page: {
          page: 1,
          pageSize: 100,
        },
        query: {
          leftOperand: {
            property: 'assetType.name',
            simpleOperator: 'equal',
            value: 'png',
          },
          logicalOperator: 'OR',
          rightOperand: {
            property: 'assetType.name',
            simpleOperator: 'equal',
            value: 'jpg',
          },
        },
        sort: [{ property: 'name', direction: 'ASC' }],
      })
    );
    res.status(200).send(data.body);
  } catch (error) {
    res.status(500).send({
      status: error,
    });
  }
};

exports.getMetaDataContent = async (req, res) => {
  try {
    const data = await RestClient.getContent(
      JSON.stringify({
        page: {
          page: 1,
          pageSize: 100,
        },
        query: {
          leftOperand: {
            property: 'assetType.name',
            simpleOperator: 'contains',
            value: 'gif',
          },
          logicalOperator: 'OR',
          rightOperand: {
            property: 'assetType.displayName',
            simpleOperator: 'contains',
            value: 'Document',
          },
        },
        sort: [{ property: 'name', direction: 'ASC' }],
      })
    );
    res.status(200).send(data.body);
  } catch (error) {
    res.status(500).send({
      status: error,
    });
  }
};

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.insertDE = async (req, res) => {
  const userFBToken = req.body.userFBToken;
  try {
    const data = await RestClient.insertDE(
      JSON.stringify({
        items: [
          {
            Id: '5',
            Name: 'Tuyen',
            FirebaseToken: userFBToken,
          },
        ],
      })
    );
    res.status(200).send(data.body);
  } catch (error) {
    res.status(500).send({
      status: error,
    });
  }
};

exports.upsertDE = async (req, res) => {
  // const userFBToken = req.body.userFBToken;
  try {
    const data = await RestClient.upsertDE(
      JSON.stringify({
        items: [
          {
            userId: '1',
            appId: 'test',
            oaId: 'test',
            msgId: 'test',
            timestamp: 'testtest',
          },
        ],
      })
    );
    res.status(200).send(data.body);
  } catch (error) {
    res.status(500).send({
      status: error,
    });
  }
};

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.getDEInfo = async (req, res) => {
  try {
    if (req.body.key != '' || req.body.key != null) {
      const data = await RestClient.getJourney(req.body.key);
      const props = ['Name', 'CustomerKey', 'ObjectID'];
      RestClient.SDKClient.dataExtension({
        props,
        filter: {
          //remove filter for all.
          leftOperand: 'ObjectID',
          operator: 'equals',
          rightOperand: data.body.dataExtensionId,
        },
      }).get((err, dataDE) => {
        if (dataDE.body.Results.length > 0) {
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
              rightOperand: dataDE.body.Results[0].CustomerKey,
            },
            //*/
          };
          RestClient.SDKClient.dataExtensionColumn(options).get((err, dataCol) => {
            const _data = dataCol.body.Results;
            _data.sort(dynamicSort('Name'));
            res.status(200).send({
              deCol: _data,
              dataExtension: dataDE.body.Results[0],
            });
          });
        } else res.status(500).send({ status: 'No Data Extension Found', message: error });
      });
    } else res.status(500).send({ status: 'Key Required', message: error });
  } catch (error) {
    console.log('error:', error);
    res.status(500).send({
      status: 'Journey Invalid',
      message: error,
    });
  }
};

exports.zaloAuth = async (req, res) => {
  console.log(res.body);
};

function checkJwt(auth) {
  if (
    auth == 'JWT ' + process.env.JWT ||
    auth == 'jwt ' + process.env.JWT ||
    auth == 'Jwt ' + process.env.JWT
  ) {
    return true;
  } else return false;
}

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

exports.test = async (req, res) => {
  try {
    const result = await RestClient.triggerJourneyBuilder(
      JSON.stringify({
        ContactKey: '1087338975254803129',
        EventDefinitionKey: 'APIEvent-53488ae9-5fb9-afba-a05e-47f555c16009',
      })
    );
    res.status(200).send({ status: 'OK', result });
  } catch (error) {
    console.log('error', error);
    res.status(500).send({ status: 'error' });
  }
};
