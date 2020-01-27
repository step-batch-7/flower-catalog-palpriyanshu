const {Server} = require('net');
const {readFileSync, existsSync} = require('fs');
const Request = require('./lib/request.js');
const Response = require('./lib/response.js');

const STATIC_FOLDER = `${__dirname}/../public`;
const CONTENT_TYPE = {
  js: 'application/javascript',
  css: 'text/css',
  html: 'text/html',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  gif: 'image/gif',
  txt: 'text/plain'
};

const serveStaticFiles = function(req) {
  if (!existsSync(req.url)) {
    return new Response();
  }
  const [, extn] = req.url.match(/.*\.(.*)$/);
  content = readFileSync(`${req.url}`);
  const contentType = CONTENT_TYPE[extn];
  const res = new Response();
  res.setHeader('content-type', contentType);
  res.setHeader('content-length', content.length);
  res.statusCode = 200;
  res.msg = 'OK';
  res.body = content;
  return res;
};

const fileHandler = function(req) {
  if (req.url === '/') {
    req.url = '/index.html';
  }
  req.url = `${STATIC_FOLDER}${req.url}`;
  
  if (req.method === 'GET') {
    return serveStaticFiles;
  }

  return () => new Response();
};

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
    console.log(req);
    const handler = fileHandler(req);
    const res = handler(req);
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
