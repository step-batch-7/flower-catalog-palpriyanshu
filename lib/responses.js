const {stdout} = require('process');

const Sqlite3 = require('sqlite3').verbose();
const {readFileSync, existsSync, statSync} = require('fs');
const querystring = require('querystring');

const CONTENT_TYPE = require('./mimeTypes.js');
const STATUS_CODES = require('./statusCodes.js');
const {getSchema, uploadGuestPage, addComments} = require('./queries.js');
const {getHtmlPage} = require('./htmlPage.js');

const dbFile = './comments.db';

let db = new Sqlite3.Database(dbFile, (err) => err && stdout.write(err));

const STATIC_FOLDER = `${__dirname}/..`;
db.run(getSchema(), (err) => err && stdout.err(err));

const savePost = function(contentType, body) {
  if (contentType === 'application/x-www-form-urlencoded') {
    const post = querystring.parse(body);
    post.date = new Date();
    db.run(addComments(post), (err) => err && stdout.write(err));
  }
};

const loadAndSavePost = function(req) {
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => savePost(req.headers['content-type'], body));
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
  res.end(content);
};

const updateComments = function() {
  return new Promise((resolve, reject) => {
    db.all(uploadGuestPage(), (err, rows) => err ? reject(err) : resolve(rows));
  });
};

const serveGuestBook = function(req, res) {
  const fileName = `${STATIC_FOLDER}/template/guestBook.html`;
  let guestBook = readFileSync(fileName, 'utf8');
  db.run(getSchema(), (err) => err && stdout.write(err));
  updateComments()
    .then(rows => {
      guestBook = guestBook.replace(/__Comments__/, getHtmlPage(rows));
      return guestBook;
    })
    .then(content => successFulResponse(req, res, content));
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
