#!/usr/bin/env node

/**
 * Module dependencies.
 */

const debug = require("debug")("sfmc-custom-activity:server");
const fs = require("fs");
const http = require("http");
const https = require("https");
const app = require("../app");
// const at = require("../utils/atHandler");
// const privateKey = fs.readFileSync("certificates/localhost-key.pem");
// const certificate = fs.readFileSync("certificates/localhost.pem");

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   // ca: ca,
// };

// const schedule = require("node-schedule");

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "8080");

app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
//  /**
//   * Listen on provided port, on all network interfaces.
//   */

server.listen(port);
server.requestTimeout = 60000;
server.setTimeout(60000);
server.keepAliveTimeout = 59000;
server.headersTimeout = 11000;

/**
 * Event listener for HTTP server "error" event.
 */
/* eslint no-console: 0 */
server.on("error", (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

/**
 * Event listener for HTTP server "listening" event.
 */

server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
});
