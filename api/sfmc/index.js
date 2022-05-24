'use strict';

const fuelSDKClient = require('../../config/sfmc/fuel-sdk/fuel-sdk.config');
const superagent = require('superagent');
require('dotenv').config();

class SFMCAPI {
  /**
   * @param req
   * @param res
   *  @returns {Promise<void>}
   */
  getDE = async (req, res) => {
    // try {
    //   var DEOptions = [];
    //   const props = ['Name', 'CustomerKey', 'ObjectID'];
    //   fuelSDKClient.SDKClient.dataExtension({
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
    var de = fuelSDKClient.SDKClient.dataExtension(options);

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
  getDEColumn = async (req, res) => {
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
      fuelSDKClient.SDKClient.dataExtensionColumn(options).get((err, data) => {
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
  getDERow = async (req, res) => {
    try {
      var options = {
        props: ['OAId', 'Name', 'ZaloId', 'Status'], //required
        ///*
        Name: 'OA Followers',
        filter: null,
        //*/
      };
      fuelSDKClient.SDKClient.dataExtensionRow(options).get((err, data) => {
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
  getCustomContent = async (req, res) => {
    try {
      const data = await fuelSDKClient.getContent(
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

  getImageContent = async (req, res) => {
    try {
      const data = await fuelSDKClient.getContent(
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

  getMetaDataContent = async (req, res) => {
    try {
      const data = await fuelSDKClient.getContent(
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
  getDEInfo = async (req, res) => {
    try {
      if (req.body.key != '' || req.body.key != null) {
        const data = await fuelSDKClient.getJourney(req.body.key);
        const props = ['Name', 'CustomerKey', 'ObjectID'];
        fuelSDKClient.SDKClient.dataExtension({
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
            fuelSDKClient.SDKClient.dataExtensionColumn(options).get((err, dataCol) => {
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
}

module.exports = new SFMCAPI();
