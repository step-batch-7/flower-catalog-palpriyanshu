const {Server} = require('net');
const {processRequest} = require('../flowerCatalogue.js');
const Request = require('./lib/request.js');

const respondOnConnect = function(socket) {
  const remote = `${socket.remoteAddress}: ${socket.remotePort}`;
  console.warn('new connection', remote);
  socket.setEncoding('utf8');
  socket.on('close', hadErr =>
    console.error(`${remote} closed ${hadErr ? 'with error' : ''}`)
  );
  socket.on('error', err => console.warn('socket error', err));
  socket.on('drain', () => console.log(`${remote} drained`));
  socket.on('end', () => console.warn(remote, 'disconnected'));
  socket.on('data', text => {
    console.warn(`${remote} data:\n`);
    const req = Request.parse(text);
    const res = processRequest(req);
    res.writeTo(socket);
  });
};

const main = function() {
  const server = new Server();
  server.on('error', err => console.error('server error', err));
  server.on('connection', respondOnConnect);
  server.on('listening', () => {
    console.log('start listening', server.address());
  });
  server.listen(4000);
};

main();
