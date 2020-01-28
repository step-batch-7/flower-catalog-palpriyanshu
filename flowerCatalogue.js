const {readFileSync, existsSync, writeFileSync} = require('fs');
const CONTENT_TYPE = require('./server/lib/mimeTypes.js');

const previousComment = require(`${__dirname}/commentHistory.json`);

const {
  formatComment,
  updateComments
} = require('./public/js/commentsUpdater.js');

const STATIC_FOLDER = `${__dirname}/public`;

const successFulResponse = function(req, res, content) {
  const [, extn] = req.url.match(/.*\.(.*)$/);
  const contentType = CONTENT_TYPE[extn];
  res.setHeader('content-type', contentType);
  res.write(content);
  res.end();
};

const pickupParams = (query, keyValue) => {
  const [key, value] = keyValue.split('=');
  query[key] = value;
  return query;
};
const readParams = keyValueTextPairs =>
  keyValueTextPairs.split('&').reduce(pickupParams, {});

const serveStaticFiles = function(req, res) {
  if (!existsSync(req.url)) {
    return new Response();
  }
  content = readFileSync(`${req.url}`);
  return successFulResponse(req, res, content);
};

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
  savePost(req);
  res.statusCode = 303;
  res.setHeader('location', '/guestBook.html');
  res.end();
};

const serveGuestBook = function(req, res) {
  const content = updateComments(previousComment);
  return successFulResponse(req, res, content);
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

  return res;
};

const processRequest = (req, res) => {
  const handler = findHandler(req);
  return handler(req, res);
};

module.exports = {processRequest};
