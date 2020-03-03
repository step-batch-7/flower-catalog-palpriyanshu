const {stdout, stderr} = require('process');
const {Server} = require('http');
const {app} = require('./lib/handler.js');

const port = process.env.PORT || 4000;

const main = function() {
  const server = new Server(app.serveRequest.bind(app));
  server.on('clientError', err => stderr.write(`server error, ${err}\n`));
  server.on('listening', () => {
    stdout.write(`server listening to ${JSON.stringify(server.address())}\n`);
  });
  server.listen(port);
};

main();
