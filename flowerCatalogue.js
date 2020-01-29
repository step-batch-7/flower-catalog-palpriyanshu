const {readFileSync, existsSync, writeFileSync} = require('fs');
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
  console.log('post----', req.url);
  savePost(req);
  res.statusCode = 303;
  res.setHeader('location', '/guestBook.html');
  res.end();
};

const successFulResponse = function(req, res, content) {
  const [, extn] = req.url.match(/.*\.(.*)$/);
  const contentType = CONTENT_TYPE[extn];
  res.setHeader('content-type', contentType);
  res.write(content);
  res.end();
};

const serveGuestBook = function(req, res) {
  const content = updateComments(previousComment);
  return successFulResponse(req, res, content);
};

const serveStaticFiles = function(req, res) {
  req.url = `${STATIC_FOLDER}${req.url}`;

  if (!existsSync(req.url)) {
    res.end('hello');
    return;
  }
  content = readFileSync(`${req.url}`);
  return successFulResponse(req, res, content);
};

const homePage = function(req, res) {
  req.url = '/index.html';
  return serveStaticFiles(req, res);
};

const notFound = function(req, res) {
  return res.end();
};

const postHandler = {
  '/guestBook.html': servePost
};

const getHandlers = {
  '/': homePage,
  '/guestBook.html': serveGuestBook,
  default: serveStaticFiles
};

const methods = {
  GET: getHandlers,
  POST: postHandler,
  default: {default: notFound}
};

const processRequest = (req, res) => {
  const methodHandler = methods[req.method] || methods.default;
  const handler = methodHandler[req.url] || methodHandler.default;
  return handler(req, res);
};

module.exports = {processRequest};
