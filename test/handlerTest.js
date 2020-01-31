const request = require('supertest');
const {app} = require('../lib/handler.js');

const STATUS_CODE2X = 200;
const STATUS_CODE4X = 404;

describe('GET /', function() {
  it('should respond with html', function(done) {
    request(app.serveRequest.bind(app))
      .get('/')
      .set('Accept', '*/*')
      .expect('Content-Type', /html/)
      .expect(STATUS_CODE2X, done);
  });
});

describe('GET /index.html', function() {
  it('should respond with html', function(done) {
    request(app.serveRequest.bind(app))
      .get('/index.html')
      .set('Accept', '*/*')
      .expect('Content-Type', /html/)
      .expect(STATUS_CODE2X, done);
  });
});

describe('GET /guestBook.html', function() {
  it('should respond with html', function(done) {
    request(app.serveRequest.bind(app))
      .get('/guestBook.html')
      .set('Accept', '*/*')
      .expect('Content-Type', /html/)
      .expect(STATUS_CODE2X, done);
  });
});

describe('GET /css/style.css', function() {
  it('should respond with css', function(done) {
    request(app.serveRequest.bind(app))
      .get('/css/style.css')
      .set('Accept', '*/*')
      .expect('Content-Type', /css/)
      .expect(STATUS_CODE2X, done);
  });
});

describe('GET /image/clock.png', function() {
  it('should respond with png', function(done) {
    request(app.serveRequest.bind(app))
      .get('/image/clock.png')
      .set('Accept', '*/*')
      .expect('Content-Type', /png/)
      .expect(STATUS_CODE2X, done);
  });
});

describe('PUT /guestBook.html', function() {
  it('should respond with "method not allowed"', function(done) {
    request(app.serveRequest.bind(app))
      .put('/guestBook.html')
      .set('Accept', '*/*')
      .expect(STATUS_CODE4X, done);
  });
});

describe('get /badFile.html', function() {
  it('should respond with "not found"', function(done) {
    request(app.serveRequest.bind(app))
      .get('/badFile.html')
      .set('Accept', '*/*')
      .expect(STATUS_CODE4X, done);
  });
});

