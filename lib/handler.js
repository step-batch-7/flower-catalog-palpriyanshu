const App = require('./app.js');
const {
  serveGuestBook,
  serveStaticFiles,
  notFound,
  methodNotAllowed,
  servePost
} = require('./responses.js');

const app = new App();

app.get('/guestBook.html', serveGuestBook);
app.get('', serveStaticFiles);
app.get('', notFound);

app.post('/guestBook.html', servePost);
app.post('', notFound);

app.use(methodNotAllowed);

module.exports = {app};
