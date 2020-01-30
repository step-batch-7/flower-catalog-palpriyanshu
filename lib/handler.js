const {readFileSync, existsSync, writeFileSync, statSync} = require('fs');
const querystring = require('querystring');
const App = require('./app.js');
const CONTENT_TYPE = require('./mimeTypes.js');
const previousComment = require('../dataBase/commentHistory.json');

const {updateComments} = require('./commentsUpdater.js');

const STATIC_FOLDER = `${__dirname}/..`;

const savePost = function(req, body) {
  let post = {};
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    post = querystring.parse(body);
    post.dateAndTime = new Date();
  }
  const url = `${__dirname}/../dataBase/commentHistory.json`;
  previousComment.unshift(post);
  writeFileSync(url, JSON.stringify(previousComment, null, 2));
};

const loadAndSavePost = function(req) {
  let body = '';
  req.setEncoding('utf8');
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    savePost(req, body);
  });
};

const servePost = function(req, res) {
  req.url = `${STATIC_FOLDER}${req.url}`;
  loadAndSavePost(req);
  res.statusCode = 303;
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

const serveGuestBook = function(req, res) {
  const content = updateComments(previousComment);
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
  res.end();
};

const methodNotAllowed = function(req, res) {
  res.writeHead(400, 'Method Not Allowed');
  res.end();
};

const app = new App();

app.get('/guestBook.html', serveGuestBook);
app.get('', serveStaticFiles);
app.get('', notFound);
app.post('/guestBook.html', servePost);
app.post('', notFound);

app.use(methodNotAllowed);

module.exports = {app};
