const request = require('supertest');
const {app} = require('../lib/handler.js');
const STATUS_CODES = require('../lib/statusCodes.js');
const config = require('../config.js');
const {truncateSync} = require('fs');

describe('GET', function() {
  context('request for html files', function() {
    it('should respond with landingPage when url is "/"', function(done) {
      request(app.serveRequest.bind(app))
        .get('/')
        .set('Accept', '*/*')
        .expect('Content-Type', /html/)
        .expect('content-length', '903')
        .expect(STATUS_CODES.ok, done);
    });

    it('should respond with landingPage url is "/index.html"', function(done) {
      request(app.serveRequest.bind(app))
        .get('/index.html')
        .set('Accept', '*/*')
        .expect('Content-Type', /html/)
        .expect('content-length', '903')
        .expect(STATUS_CODES.ok, done);
    });

    it('should give guestPage when url is /guestBook.html', function(done) {
      request(app.serveRequest.bind(app))
        .get('/guestBook.html')
        .set('Accept', '*/*')
        .expect('Content-Type', /html/)
        .expect(STATUS_CODES.ok, done);
    });
  });

  context('request for css files', function() {
    it('should respond with css', function(done) {
      request(app.serveRequest.bind(app))
        .get('/css/style.css')
        .set('Accept', '*/*')
        .expect('Content-Type', /css/)
        .expect(STATUS_CODES.ok, done);
    });
  });

  context('request for image files', function() {
    it('should respond with png', function(done) {
      request(app.serveRequest.bind(app))
        .get('/image/clock.png')
        .set('Accept', '*/*')
        .expect('Content-Type', /png/)
        .expect(STATUS_CODES.ok, done);
    });
  });

  context('request for bad files', function() {
    it('should respond with "not found"', function(done) {
      request(app.serveRequest.bind(app))
        .get('/badFile.html')
        .set('Accept', '*/*')
        .expect(STATUS_CODES.notFound, done);
    });
  });
});

describe('PUT /guestBook.html', function() {
  it('should respond with "method not allowed"', function(done) {
    request(app.serveRequest.bind(app))
      .put('/guestBook.html')
      .set('Accept', '*/*')
      .expect(STATUS_CODES.notFound, done);
  });
});

describe('POST /guestBook.html ', function() {
  afterEach(() => {
    truncateSync(config.DATA_STORE);
  });
  context('when content-type is application/x-www-form-urlencoded', function() {
    it('should parse queryString & respond with "redirect"', function(done) {
      request(app.serveRequest.bind(app))
        .post('/guestBook.html')
        .set('Accept', '*/*')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send('name=priyanshu&comment=good')
        .expect(STATUS_CODES.redirect, done)
        .expect('location', '/guestBook.html');
    });

    it('should respond with html after redirect', function(done) {
      request(app.serveRequest.bind(app))
        .get('/guestBook.html')
        .set('Accept', '*/*')
        .expect('Content-Type', /html/)
        .expect('content-length', '941')
        .expect(STATUS_CODES.ok, done);
    });
  });

  context('when content-type is multipart/form-data', function() {
    it('shouldn\'t parse queryString & respond with redirect', function(done) {
      request(app.serveRequest.bind(app))
        .post('/guestBook.html')
        .set('Accept', '*/*')
        .set('content-type', 'multipart/form-data')
        .send('name="priyanshu",comment="comment"')
        .expect(STATUS_CODES.redirect, done)
        .expect('location', '/guestBook.html');
    });

    it('should respond with html after redirect', function(done) {
      request(app.serveRequest.bind(app))
        .get('/guestBook.html')
        .set('Accept', '*/*')
        .expect('Content-Type', /html/)
        .expect('content-length', '941')
        .expect(STATUS_CODES.ok, done);
    });
  });
});
