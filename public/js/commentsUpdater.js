const {readFileSync} = require('fs');

const formatComment = function(body) {
  return {
    name: body.name,
    comment: body.comment,
    dateAndTime: new Date()
  };
};

const updateComments = function(comments) {
  let guestBook = readFileSync(
    `${__dirname}/../../public/guestBook.html`,
    'utf8'
  );
  const html = comments.map(comment => {
    return `<div id="commentBox">
    <h4>${comment.name}</h4>\n
    <p> ${comment.comment} </p>\n
    <footer>${comment.dateAndTime}</footer></div>`;
  });
  guestBook = guestBook.replace(/__Comments__/, html.join('\n'));
  return guestBook;
};

module.exports = {formatComment, updateComments};