const fuelSDKClient = require('../../config/sfmc/fuel-sdk/fuel-sdk.config');
const fuelRestUtils = require('../../services/fuel-rest');

function dynamicSort(property) {
  let sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    // eslint-disable-next-line no-param-reassign
    property = property.substr(1);
  }
  return (a, b) => {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    // eslint-disable-next-line no-nested-ternary
    const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

const SFMCApi = {
  /**
   * @param req
   * @param res
   *  @returns {Promise<void>}
   */
  getDE: async (req, res) => {
    // try {
    //   var DEOptions = [];
    //   const props = ['Name', 'CustomerKey', 'ObjectID'];
    //   fuelSDKClient.dataExtension({
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
    const options = {
      props: ['Name', 'CustomerKey', 'ObjectID', 'Status', 'Description'],
      filter: {
        leftOperand: 'CustomerKey',
        operator: 'equals',
        rightOperand: 'CC67F80E-EA7F-429E-89DE-B9D48C0F51C6',
      },
    };
    const de = fuelSDKClient.dataExtension(options);

    de.get((err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        const statusCode =
          response && response.res && response.res.statusCode ? response.res.statusCode : 200;
        const result = response && response.body ? response.body : response;
        if (response) res.status(statusCode).send(result);
      }
    });
  },

  /**
   * @param req
   * @param res
   *  @returns {Promise<void>}
   */
  getDEColumn: async (req, res) => {
    try {
      const options = {
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
        ],
        filter: {
          leftOperand: 'DataExtension.CustomerKey',
          operator: 'equals',
          rightOperand: '4B34E1DC-7751-4F28-A30E-0B8B1513D3C2',
        },
      };
      fuelSDKClient.dataExtensionColumn(options).get((err, data) => {
        const result = data.body.Results;
        result.sort(dynamicSort('Name'));
        res.status(200).send(result);
      });
    } catch (e) {
      res.status(500).send({
        status: 'Fail',
      });
    }
  },

  /**
   * @param req
   * @param res
   *  @returns {Promise<void>}
   */
  getDERow: async (req, res) => {
    try {
      const options = {
        props: ['OAId', 'Name', 'ZaloId', 'Status'],
        Name: 'OA Followers',
        filter: null,
      };
      fuelSDKClient.dataExtensionRow(options).get((err, data) => {
        const result = data.body.Results;
        result.sort(dynamicSort('Name'));
        res.status(200).send(result);
      });
    } catch (e) {
      console.log(e);
      res.status(500).send({
        status: 'Fail',
      });
    }
  },

  /**
   * @param req
   * @param res
   *  @returns {Promise<void>}
   */
  getCustomContent: async (req, res) => {
    try {
      const data = await fuelRestUtils.getContent(
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
  },

  getImageContent: async (req, res) => {
    try {
      const data = await fuelRestUtils.getContent(
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
  },

  getMetaDataContent: async (req, res) => {
    try {
      const data = await fuelRestUtils.getContent(
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
  },

  /**
   * @param req
   * @param res
   *  @returns {Promise<void>}
   */
  getDEInfo: async (req, res) => {
    console.log('key', req.body.key);
    try {
      if (req.body.key) {
        const data = await fuelRestUtils.getJourney(req.body.key);
        const props = ['Name', 'CustomerKey', 'ObjectID'];
        fuelSDKClient
          .dataExtension({
            props,
            filter: {
              leftOperand: 'ObjectID',
              operator: 'equals',
              rightOperand: data.body.dataExtensionId,
            },
          })
          .get((error, dataDE) => {
            if (dataDE.body.Results.length > 0) {
              const options = {
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
                ],
                filter: {
                  leftOperand: 'DataExtension.CustomerKey',
                  operator: 'equals',
                  rightOperand: dataDE.body.Results[0].CustomerKey,
                },
              };
              fuelSDKClient.dataExtensionColumn(options).get((err, dataCol) => {
                const responseData = dataCol.body.Results;
                responseData.sort(dynamicSort('Name'));
                res.status(200).send({
                  deCol: responseData,
                  dataExtension: dataDE.body.Results[0],
                });
              });
            } else res.status(500).send({ status: 'No Data Extension Found', message: error });
          });
      } else res.status(500).send({ status: 'Key Required', message: 'error' });
    } catch (error) {
      console.log('error:', error);
      res.status(500).json({
        status: 'Journey Invalid',
        message: error,
      });
    }
  },
};

module.exports = SFMCApi;
