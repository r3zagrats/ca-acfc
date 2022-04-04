const path = require("path");
const fs = require("fs");
const neDB = require("./neDB");
/**
 * Render Config
 * @param req
 * @param res
 */
exports.config = (req, res) => {
  const domain = req.headers.host || req.headers.origin;
  const file = path.join(__dirname, "..", "public", "config-template.json");
  const configTemplate = fs.readFileSync(file, "utf-8");
  const config = JSON.parse(configTemplate.replace(/\$DOMAIN/g, domain));
  res.json(config);
};

/**
 * Render UI
 * @param req
 * @param res
 */
exports.customActivity = async (req, res) => {
  if ((req.headers["referer"] ?? "no end").includes("marketingcloudapps")) {
    var messTypes = await neDB.getDB();
    res.render("customActivity", { messTypes });
  } else {
    res.status(500).send({ Status: "Access is not allowed" });
  }
};

const znsOptions = [
  { value: "Default", name: "--Select one of the following options--"},
  { value: "Text", name: "ZNS Text" },
  { value: "Image", name: "ZNS Image" },
  { value: "NormalList", name: "ZNS Normal List" },
  { value: "ButtonList", name: "ZNS Button List" },
];

exports.customContent = async (req, res) => {
  res.status(200).render("customContent", { znsOptions });
};

/**
 * Render UI
 * @param req
 * @param res
 */
exports.login = async (req, res) => {
  res.render("login", { error: false });
};
