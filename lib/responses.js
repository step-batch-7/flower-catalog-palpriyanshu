const {stdout} = require('process');

const Sqlite3 = require('sqlite3').verbose();
const {readFileSync, existsSync, statSync} = require('fs');
const querystring = require('querystring');

const CONTENT_TYPE = require('./mimeTypes.js');
const STATUS_CODES = require('./statusCodes.js');

const schema = `create table if not exists guestBook(
  serial_no NUMERIC(5) DEFAULT 3,
  name VARCHAR(20),
  comment VARCHAR(50),
  date DEFAULT CURRENT_TIMESTAMP
);`;

const dbFile = './dataBase/comments.db';

let db = new Sqlite3.Database(dbFile, Sqlite3.OPEN_READWRITE, (err) => {
  if(err){
    stdout.err(err);
  } 
});

const STATIC_FOLDER = `${__dirname}/..`;

const savePost = function(contentType, body) {
  if (contentType === 'application/x-www-form-urlencoded') {
    const post = querystring.parse(body);
    post.date = new Date();
    const sql = 'INSERT into guestBook (serial_no, name, comment, date) VALUES';
    db.run(` ${sql} (3, '${post.name}', '${post.comment}', '${post.date}')`,
      (err) => {
        if(err){
          stdout.err(err);
        } 
      });
  }
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
  res.end(content);
};

const toHtml = (comments) => {
  return `
  <div id="commentBox">
    <h4>
      <img src="./image/humanLogo.png" alt="img" id="logo"/>
      ${comments.name}
    </h4>\n
    <p> ${comments.comment} </p>\n
    <footer class="rightFooter">
      <img src="./image/clock.png" alt="clk" id="clock"/>
      ${new Date(comments.date).toUTCString()}\n
    </footer>
  </div>`;
};

const htmlPage = (rows) => {
  if(rows){
    return rows.map(toHtml).join('');
  }
  return '';
};

const updateComments = function() {
  return new Promise((resolve, reject) => {
    const fileName = `${STATIC_FOLDER}/template/guestBook.html`;
    let guestBook = readFileSync(fileName, 'utf8');
    const sql = 'select * from guestBook order by date';
    db.all(sql, (err, rows) => {
      if(err){
        stdout.err(err);
      } else {
        guestBook = guestBook.replace(/__Comments__/, htmlPage(rows));
        resolve(guestBook);
      }
    });
  });
};

const serveGuestBook = function(req, res) {
  db.run(schema, (err) => err && stdout.err(err));
  updateComments().then(content => successFulResponse(req, res, content));
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
