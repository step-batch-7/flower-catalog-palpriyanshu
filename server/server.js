const {Server} = require('http');
const {processRequest} = require('../flowerCatalogue.js');

const respondOnConnect = function(req, res) {
  processRequest(req, res);
};

const main = function() {
  const server = new Server(respondOnConnect);
  server.on('clientError', err => console.error('server error', err));
  server.on('listening', () => {
    console.log('start listening', server.address());
  });
  server.listen(4000);
};

main();
