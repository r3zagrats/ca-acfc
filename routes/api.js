const RestClient = require("../utils/sfmc-client");

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.getDe = async (req, res) => {
  try {
    var DEOptions = [];
    const props = ["Name", "CustomerKey", "ObjectID"];
    RestClient.SDKClient.dataExtension({
      props,
      filter: {
        //remove filter for all.
        leftOperand: "ObjectID",
        operator: "equals",
        rightOperand: "9f991e28-a590-ec11-b834-48df37dc15d4",
      },
    }).get((err, data) => {
      data.body.Results.forEach((opt) => {
        if (opt.Name.charAt(0) != "_") {
          DEOptions.push({
            name: opt.Name,
            CustomerKey: opt.CustomerKey + "||" + opt.Name,
            ID: opt.ObjectID,
          });
        }
      });
      res.status(200).send(DEOptions);
    });
  } catch (e) {
    res.status(500).send({
      status: "Fail",
    });
  }
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
        "ObjectID",
        "PartnerKey",
        "Name",
        "DefaultValue",
        "MaxLength",
        "IsRequired",
        "Ordinal",
        "IsPrimaryKey",
        "FieldType",
        "CreatedDate",
        "ModifiedDate",
        "Scale",
        "Client.ID",
        "CustomerKey",
      ], //required
      ///*
      filter: {
        //remove filter for all.
        leftOperand: "DataExtension.CustomerKey",
        operator: "equals",
        rightOperand: "4B34E1DC-7751-4F28-A30E-0B8B1513D3C2",
      },
      //*/
    };
    RestClient.SDKClient.dataExtensionColumn(options).get((err, data) => {
      const _data = data.body.Results;
      _data.sort(dynamicSort("Name"));
      res.status(200).send(_data);
    });
  } catch (e) {
    res.status(500).send({
      status: "Fail",
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
      props: ["Id", "Name", "Email", "Phone", "FirebaseToken"], //required
      ///*
      Name: "Quan DE Test",
      filter: null,
      //*/
    };
    RestClient.SDKClient.dataExtensionRow(options).get((err, data) => {
      const _data = data.body.Results;
      _data.sort(dynamicSort("Name"));
      res.status(200).send(_data);
    });
  } catch (e) {
    res.status(500).send({
      status: "Fail",
    });
  }
};

/**
 * @param req
 * @param res
 *  @returns {Promise<void>}
 */
exports.getContent = async (req, res) => {
  try {
    const data = await RestClient.getContent(
      JSON.stringify({
        page: {
          page: 1,
          pageSize: 50,
        },

        query: {
          leftOperand: {
            property: "assetType.displayName",
            simpleOperator: "contains",
            value: "Custom",
          },
          logicalOperator: "OR",
          rightOperand: {
            property: "assetType.name",
            simpleOperator: "equal",
            value: "customblock",
          },

          // leftOperand: {
          //   property: "assetType.displayName",
          //   simpleOperator: "contains",
          //   value: "Snippet",
          // },
          // logicalOperator: "OR",
          // rightOperand: {
          //   property: "assetType.name",
          //   simpleOperator: "equal",
          //   value: "codesnippetblock",
          // },
        },

        sort: [{ property: "name", direction: "ASC" }],

        fields: [
          "enterpriseId",
          "memberId",
          "thumbnail",
          "category",
          "content",
          "data",
          // "fileProperties"
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
exports.insertDE = async (req, res) => {
  const userFBToken = req.body.userFBToken;
  try {
    const data = await RestClient.insertDE(
      JSON.stringify({
        items: [
          {
            Id: "5",
            Name: "Tuyen",
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
            userId: "1",
            appId: "test",
            oaId: "test",
            msgId: "test",
            timestamp: "testtest",
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
exports.getAttEvent = async (req, res) => {
  try {
    if (req.query.key != "" || req.query.key != null) {
      const data = await RestClient.getJourney(req.query.key);
      //res.status(200).send(data.body.dataExtensionId);

      const props = ["Name", "CustomerKey", "ObjectID"];
      RestClient.SDKClient.dataExtension({
        props,
        filter: {
          //remove filter for all.
          leftOperand: "ObjectID",
          operator: "equals",
          rightOperand: data.body.dataExtensionId,
        },
      }).get((err, dataDE) => {
        //res.status(200).send(dataDE.body.Results.length > 0 ? dataDE.body.Results[0]: {});
        if (dataDE.body.Results.length > 0) {
          var options = {
            props: [
              "ObjectID",
              "PartnerKey",
              "Name",
              "DefaultValue",
              "MaxLength",
              "IsRequired",
              "Ordinal",
              "IsPrimaryKey",
              "FieldType",
              "CreatedDate",
              "ModifiedDate",
              "Scale",
              "Client.ID",
              "CustomerKey",
            ], //required
            ///*
            filter: {
              //remove filter for all.
              leftOperand: "DataExtension.CustomerKey",
              operator: "equals",
              rightOperand: dataDE.body.Results[0].CustomerKey,
            },
            //*/
          };
          RestClient.SDKClient.dataExtensionColumn(options).get(
            (err, dataCol) => {
              const _data = dataCol.body.Results;
              _data.sort(dynamicSort("Name"));
              res.status(200).send({
                deCol: _data,
                dataExtention: dataDE.body.Results[0],
              });
            }
          );
        } else res.status(500).send({ Status: "No Data Extension Found" });
      });
    } else res.status(500).send({ Status: "Key Required" });
  } catch (error) {
    res.status(500).send({
      Status: "Journey Invalid",
    });
  }
};

exports.zaloAuth = async (req, res) => {
  console.log(res.body);
};

function checkJwt(auth) {
  if (
    auth == "JWT " + process.env.JWT ||
    auth == "jwt " + process.env.JWT ||
    auth == "Jwt " + process.env.JWT
  ) {
    return true;
  } else return false;
}

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    var result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

exports.test = async (req, res) => {
  try {
    const data = await RestClient.upsertOAFollowers(
      JSON.stringify({
        items: [
          {
            Name: 'test',
            ZaloId: '1087338',
            Status: 'unfollow',
            OAName: 'test'
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
