const {readFileSync} = require('fs');

const updateComments = function(comments) {
  let guestBook = readFileSync(
    `${__dirname}/../template/guestBook.html`,
    'utf8'
  );

  const html = comments.toHtml();
  guestBook = guestBook.replace(/__Comments__/, html.join('\n'));
  return guestBook;
};

module.exports = {updateComments};
