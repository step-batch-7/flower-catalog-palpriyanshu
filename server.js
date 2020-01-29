const {Server} = require('http');
const {app} = require('./lib/handler.js');

const main = function(port = 4000) {
  const server = new Server(app.serveRequest.bind(app));
  server.on('clientError', err => console.error('server error', err));
  server.on('listening', () => {
    console.log('start listening', server.address());
  });
  server.listen(port);
};

main(process.argv[2]);
