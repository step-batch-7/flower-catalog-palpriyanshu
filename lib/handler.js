const {readFileSync, existsSync, writeFile, statSync} = require('fs');
const App = require('./app.js');
const CONTENT_TYPE = require('./mimeTypes.js');
const querystring = require('querystring');
const previousComment = require('../dataBase/commentHistory.json');

const {updateComments} = require('./commentsUpdater.js');

const STATIC_FOLDER = `${__dirname}/../public`;

const saveComments = function(url) {
  writeFile(url, JSON.stringify(previousComment, null, 2), err => {
    if (err) {
      console.error('error on save');
    } else console.log('post is saved');
  });
};

const savePost = function(req, body) {
  if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
    body = querystring.parse(body);
    body.dateAndTime = new Date();
  }
  const url = `${__dirname}/../dataBase/commentHistory.json`;
  previousComment.unshift(body);
  saveComments(url);
};

const loadAndSavePost = function(req, x) {
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
  const absPath = `${STATIC_FOLDER}${req.url}`;
  const stat = existsSync(absPath) && statSync(absPath).isFile();
  if (!stat) {
    return next();
  }
  content = readFileSync(absPath);
  return successFulResponse(req, res, content);
};

const homePage = function(req, res) {
  req.url = '/index.html';
  return serveStaticFiles(req, res);
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
app.get('/', homePage);
app.get('', notFound);
app.post('/guestBook.html', servePost);
app.post('', notFound);

app.use(methodNotAllowed);

module.exports = {app};
