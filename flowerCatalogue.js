const {readFileSync, existsSync, writeFileSync, statSync} = require('fs');
const CONTENT_TYPE = require('./server/lib/mimeTypes.js');

const previousComment = require(`${__dirname}/commentHistory.json`);

const {
  formatComment,
  updateComments
} = require('./public/js/commentsUpdater.js');

const STATIC_FOLDER = `${__dirname}/public`;

const pickupParams = (query, keyValue) => {
  const [key, value] = keyValue.split('=');
  query[key] = value;
  return query;
};
const readParams = keyValueTextPairs =>
  keyValueTextPairs.split('&').reduce(pickupParams, {});

const savePost = function(req) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    body = readParams(body);
    const url = `${__dirname}/commentHistory.json`;
    const formattedComment = formatComment(body);
    previousComment.unshift(formattedComment);
    writeFileSync(url, JSON.stringify(previousComment, null, 2));
  });
};

const servePost = function(req, res) {
  req.url = `${STATIC_FOLDER}${req.url}`;
  savePost(req);
  res.statusCode = 303;
  res.setHeader('location', '/guestBook.html');
  res.end();
};

const successFulResponse = function(req, res, content) {
  const extension = req.url.match(/.*\.(.*)$/).pop();
  const contentType = CONTENT_TYPE[extension];
  res.setHeader('content-type', contentType);
  res.write(content);
  res.end();
};

const serveGuestBook = function(req, res) {
  const content = updateComments(previousComment);
  return successFulResponse(req, res, content);
};

const serveStaticFiles = function(req, res, next) {
  const absPath = `${STATIC_FOLDER}${req.url}`;
  const stat = existsSync(absPath) && statSync(absPath).isFile();
  if (!stat) {
    next();
    return;
  }
  content = readFileSync(absPath);
  return successFulResponse(req, res, content);
};

const homePage = function(req, res) {
  req.url = '/index.html';
  return serveStaticFiles(req, res);
};

const notFound = function(req, res) {
  return res.end();
};

const processRequest = function(req, res) {
  const methodHandlers = methods[req.method] || methods.default;
  const matchedHandlers = methodHandlers.filter(route => {
    return req.url.match(route.path);
  });
  const next = function() {
    if (matchedHandlers.length === 0) return;
    const router = matchedHandlers.shift();
    return router.handler(req, res, next);
  };
  return next();
};

const postHandler = [
  {path: '/guestBook.html', handler: servePost},
  {path: '', handler: notFound}
];

const getHandlers = [
  {path: '/guestBook.html', handler: serveGuestBook},
  {path: '', handler: serveStaticFiles},
  {path: '/', handler: homePage},
  {path: '', handler: notFound}
];

const methods = {
  GET: getHandlers,
  POST: postHandler,
  default: {default: notFound}
};

module.exports = {processRequest};
