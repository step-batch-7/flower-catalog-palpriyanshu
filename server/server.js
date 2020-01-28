const {Server} = require('http');
const {processRequest} = require('../flowerCatalogue.js');

const main = function(port = 4000) {
  const server = new Server(processRequest);
  server.on('clientError', err => console.error('server error', err));
  server.on('listening', () => {
    console.log('start listening', server.address());
  });
  server.listen(port);
};

main(process.argv[2]);
