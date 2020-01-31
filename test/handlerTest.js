const request = require('supertest');
const {app} = require('../lib/handler.js');

const STATUS_CODE2X = 200;

describe('GET /', function() {
  it('should respond with html', function(done) {
    request(app.serveRequest.bind(app))
      .get('/')
      .set('Accept', '*/*')
      .expect('Content-Type', /html/)
      .expect(STATUS_CODE2X, done);
  });
});

