const {stdout, stderr} = require('process');
const {Server} = require('http');
const {app} = require('./lib/handler.js');

const main = function(port = 4000) {
  const server = new Server(app.serveRequest.bind(app));
  server.on('clientError', err => stderr.write(`server error, ${err}\n`));
  server.on('listening', () => {
    stdout.write(`server listening to ${JSON.stringify(server.address())}\n`);
  });
  server.listen(port);
};

main(process.argv[2]);
