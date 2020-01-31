const {readFileSync} = require('fs');
const {Comment} = require('./comments.js');

const getHtmlContent = function(comments) {
  return comments.map(comment => {
    const userComment = comment.comment.replace(/\r\n/g, '<br>');
    const newComment = new Comment(
      comment.name,
      userComment,
      comment.dateAndTime
    );
    return newComment.toHtml();
  });
};

const updateComments = function(comments) {
  let guestBook = readFileSync(
    `${__dirname}/../template/guestBook.html`,
    'utf8'
  );

  const html = getHtmlContent(comments);
  guestBook = guestBook.replace(/__Comments__/, html.join('\n'));
  return guestBook;
};

module.exports = {updateComments};
