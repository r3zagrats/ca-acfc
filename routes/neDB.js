// Persistent datastore with automatic loading
var Datastore = require("nedb"),
  db = {};
db.endPoint = new Datastore({ filename: "utils/datafile", autoload: true });
db.user = new Datastore({ filename: "utils/user", autoload: true });

exports.select = async (req, res) => {
  try {
    if (checkJwt(req.headers.authorization)) {
      var data;
      // Find all documents in the collection
      await db.endPoint.find({}, function (err, docs) {
        if (err != "null") {
          data = docs;
        } else {
          data = { Status: "Data Not found" };
        }
        res.status(200).send(data);
      });
    } else {
      res.status(401).send({
        Status: "Token Invalid",
      });
    }
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.insert = async (req, res) => {
  try {
    if (checkJwt(req.headers.authorization)) {
      db.endPoint.insert(req.body, function (err, newDoc) {
        // Callback is optional
        // newDoc is the newly inserted document, including its _id
        // newDoc has no key called notToBeSaved since its value was undefine
        res.status(200).send(newDoc);
      });
    } else {
      res.status(401).send({
        Status: "Token Invalid",
      });
    }
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.update = async (req, res) => {
  try {
    if (checkJwt(req.headers.authorization)) {
      // Replace a document by another
      db.endPoint.update(
        { _id: req.body._id },
        req.body,
        { multi: true },
        function (err, numReplaced) {
          res.send({
            numReplaced: numReplaced,
          });
        }
      );
    } else {
      res.status(401).send({
        Status: "Token Invalid",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.delete = async (req, res) => {
  try {
    if (checkJwt(req.headers.authorization)) {
      // Replace a document by another
      // Remove multiple documents
      db.endPoint.remove(
        { _id: req.body._id },
        { multi: true },
        function (err, numRemoved) {
          // numRemoved = 3
          // All planets from the solar system were removed
          res.status(200).send({
            numRemoved: numRemoved,
          });
        }
      );
    } else {
      res.status(401).send({
        Status: "Token Invalid",
      });
    }
  } catch (e) {
    res.status(500).send(e);
  }
};

// exports.authen = async (req, res) => {
//   var user = await getPwUser("Admin");
//   try {
//     if (req.body.uname === "Admin" && req.body.psw === user[0].pass) {
//       db.endPoint.find({}, function (err, docs) {
//         docs.forEach((element) => {
//           element.header =
//             element.header == "" ? "" : JSON.stringify(element.header);
//           element.expiresTime = Number(element.expiresTime);
//         });
//         const OAlist = docs.filter((element) => {
//           return element.method === "Zalo";
//         });
//         // Loop through all Zalo OA
//         for (let i = 0; i < OAlist.length; i++) {
//           console.log(`Thong tin OA ${OAlist[i].name}: `, OAlist[i]);
//           // Check if the token expired
//           // If True => Refresh Token
//           if (checkIsExpiredAccessToken(OAlist[i].expiresTime) === false) {
//             console.log(`Access Token cua OA ${OAlist[i].name} het han`);
//             (async () => {
//               let response = await superagent
//                 .post(`${OAlist[i].authUrl}`)
//                 .set("secret_key", OAlist[i].appSecretKey)
//                 .send(`refresh_token=${OAlist[i].refreshToken}`)
//                 .send(`app_id=${OAlist[i].appId}`)
//                 .send("grant_type=refresh_token");
//               response = JSON.parse(response.text);
//               console.log(`AccessToken Response cua OA ${OAlist[i].name}: "`, response);
//               if (response.access_token) {
//                 let updateInfo = {
//                   ...OAlist[i],
//                   header: JSON.parse(OAlist[i].header),
//                   expiresTime: Date.now() + response.expires_in * 1000,
//                   accessToken: response.access_token,
//                   refreshToken: response.refresh_token,
//                 };
//                 console.log(`updateInfo cua OA ${OAlist[i].name}: `, updateInfo);
//                 const result = await superagent
//                   .put(`${req.headers.host || req.headers.origin}/db/service/`)
//                   .set("Authorization", `JWT ${process.env.JWT}`)
//                   .set("Content-Type", "application/json")
//                   .send(JSON.stringify(updateInfo));
//                 console.log(`Cap nhat db thanh cong cho OA ${OAlist[i].name}: `, result.text);
//               }
//             })();
//           } else {
//             console.log(`Access Token cua OA ${OAlist[i].name} con han`);
//           }
//         }
//         res.render("user", { error: false, selectOpt: docs });
//       });
//     } else {
//       res.render("login", {
//         error: true,
//       });
//     }
//   } catch (e) {
//     res.render("login", { error: true });
//   }
// };

exports.authen = async (req, res) => {
  var user = await getPwUser("Admin");
  try {
    if (req.body.uname === "Admin" && req.body.psw === user[0].pass) {
      db.endPoint.find({}, function (err, docs) {
        docs.forEach((element) => {
          element.header =
            element.header == "" ? "" : JSON.stringify(element.header);
        });
        console.log(docs);
        res.render("user", { error: false, selectOpt: docs });
      });
    } else
      res.render("login", {
        error: true,
      });
  } catch (e) {
    res.render("login", { error: true });
  }
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

exports.getDB = (id) => {
  return new Promise((resolve, reject) => {
    db.endPoint.find(id == null ? {} : { _id: id }, function (err, docs) {
      resolve(docs);
    });
  });
};

//Mớ này của user :))

function getPwUser(username) {
  return new Promise((resolve, reject) => {
    db.user.find(
      username == null ? {} : { username: username },
      function (err, docs) {
        resolve(docs);
      }
    );
  });
}

exports.updateUser = async (req, res) => {
  try {
    if (checkJwt(req.headers.authorization)) {
      db.user.update(
        { username: req.body.username },
        req.body,
        { multi: true },
        function (err, numReplaced) {
          res.send({
            numReplaced: numReplaced,
          });
        }
      );
    } else {
      res.status(401).send({
        Status: "Token Invalid",
      });
    }
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.selectUser = async (req, res) => {
  if (checkJwt(req.headers.authorization)) {
    var data;
    await db.user.find({}, function (err, docs) {
      if (err != "null") {
        data = docs;
      } else {
        data = { Status: "Data Not found" };
      }
      res.status(200).send(data);
    });
  } else {
    res.status(401).send({
      Status: "Token Invalid",
    });
  }
};
