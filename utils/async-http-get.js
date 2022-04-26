const http = require('http');
const fs = require('fs');
module.exports = async (url, filename) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      // Image will be stored at this path
      let error;
      if (res.statusCode !== 200) {
        error = new Error('Request Failed.\n' + `Status Code: ${res.statusCode}`);
        reject(error);
      }
      const path = `./public/data/${filename}`;
      console.log('path: ', path);
      const filePath = fs.createWriteStream(path);
      res.pipe(filePath);
      filePath.on('finish', () => {
        filePath.close();
        resolve(`Download completed to /public/data/${filename}`);
      });
    });
  });
};
