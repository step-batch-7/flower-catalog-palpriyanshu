const {readFileSync, existsSync, writeFileSync, statSync} = require('fs');
const querystring = require('querystring');

const CONTENT_TYPE = require('./mimeTypes.js');
const STATUS_CODES = require('./statusCodes.js');
const {Comments} = require('./comments.js');
const previousComment = require('../dataBase/commentHistory.json');

const STATIC_FOLDER = `${__dirname}/..`;
const comments = Comments.load(previousComment);

const savePost = function(contentType, body) {
  if (!body) {
    return;
  }
  if (contentType === 'application/x-www-form-urlencoded') {
    const post = querystring.parse(body);
    post.dateAndTime = new Date();
    comments.add(post);
  }
  const url = `${STATIC_FOLDER}/dataBase/commentHistory.json`;
  writeFileSync(url, JSON.stringify(comments.comments, null, 2));
};

const loadAndSavePost = function(req) {
  let body = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    savePost(req.headers['content-type'], body);
  });
};

const servePost = function(req, res) {
  loadAndSavePost(req);
  res.statusCode = STATUS_CODES.redirect;
  res.setHeader('location', '/guestBook.html');
  res.end();
};

const successFulResponse = function(req, res, content) {
  const extension = req.url.split('.').pop();
  const contentType = CONTENT_TYPE[extension];
  res.setHeader('content-type', contentType);
  res.write(content);
  res.end();
};

const updateComments = function(comments) {
  let guestBook = readFileSync(
    `${__dirname}/../template/guestBook.html`,
    'utf8'
  );

  const html = comments.toHtml();
  guestBook = guestBook.replace(/__Comments__/, html.join('\n'));
  return guestBook;
};


const serveGuestBook = function(req, res) {
  const content = updateComments(comments);
  return successFulResponse(req, res, content);
};

const serveStaticFiles = function(req, res, next) {
  if (req.url === '/') {
    req.url = '/index.html';
  }
  const absPath = `${STATIC_FOLDER}/public${req.url}`;
  const stat = existsSync(absPath) && statSync(absPath).isFile();
  if (!stat) {
    return next();
  }
  const content = readFileSync(absPath);
  return successFulResponse(req, res, content);
};

const notFound = function(req, res) {
  res.writeHead(STATUS_CODES.notFound, 'File Not Allowed');
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(STATUS_CODES.notFound, 'Method Not Allowed');
  res.end();
};

module.exports = {
  serveGuestBook,
  serveStaticFiles,
  notFound,
  methodNotAllowed,
  servePost
};
