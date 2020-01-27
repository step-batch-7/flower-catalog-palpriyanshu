const {Server} = require('net');
const {readFileSync, existsSync, writeFileSync} = require('fs');
const Request = require('./lib/request.js');
const Response = require('./lib/response.js');
const CONTENT_TYPE = require('../public/js/contentTypeLookUp.js');
const previousComment = require(`${__dirname}/../commentHistory.json`);
const {
  formatComment,
  updateComments
} = require('../public/js/commentsUpdater.js');

const STATIC_FOLDER = `${__dirname}/../public`;

const successFulResponse = function(req, content) {
  const [, extn] = req.url.match(/.*\.(.*)$/);
  const contentType = CONTENT_TYPE[extn];
  const res = new Response();
  res.setHeader('content-type', contentType);
  res.setHeader('content-length', content.length);
  res.statusCode = 200;
  res.msg = 'OK';
  res.body = content;
  return res;
};

const serveStaticFiles = function(req) {
  if (!existsSync(req.url)) {
    return new Response();
  }
  content = readFileSync(`${req.url}`);
  return successFulResponse(req, content);
};

const servePost = function(req) {
  const url = `${__dirname}/../commentHistory.json`;
  const formattedComment = formatComment(req.body);
  previousComment.unshift(formattedComment);
  writeFileSync(url, JSON.stringify(previousComment, null, 2));
  return serveGuestBook(req);
};

const serveGuestBook = function(req) {
  const content = updateComments(previousComment);
  return successFulResponse(req, content);
};

const fileHandler = function(req) {
  if (req.url === '/') {
    req.url = '/index.html';
  }

  if (req.method === 'GET' && req.url === '/guestBook.html') {
    return serveGuestBook;
  }

  req.url = `${STATIC_FOLDER}${req.url}`;

  if (req.method === 'POST') {
    return servePost;
  }

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
