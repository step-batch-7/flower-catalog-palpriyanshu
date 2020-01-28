const {readFileSync, existsSync, writeFileSync} = require('fs');
const Response = require('./server/lib/response.js');
const CONTENT_TYPE = require('./server/lib/mimeTypes.js');

const previousComment = require(`${__dirname}/commentHistory.json`);

const {
  formatComment,
  updateComments
} = require('./public/js/commentsUpdater.js');

const STATIC_FOLDER = `${__dirname}/public`;

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
  const url = `${__dirname}/commentHistory.json`;
  const formattedComment = formatComment(req.body);
  previousComment.unshift(formattedComment);
  writeFileSync(url, JSON.stringify(previousComment, null, 2));
  return serveGuestBook(req);
};

const serveGuestBook = function(req) {
  const content = updateComments(previousComment);
  return successFulResponse(req, content);
};

const findHandler = function(req) {
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

const processRequest = req => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = {processRequest};
