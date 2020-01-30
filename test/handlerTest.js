const request = require('supertest');
const {app} = require('../lib/handler.js');

describe('GET /', function() {
  it('respond with html', function(done) {
    request(app.serveRequest.bind(app))
      .get('/')
      .set('Accept', '*/*')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});
