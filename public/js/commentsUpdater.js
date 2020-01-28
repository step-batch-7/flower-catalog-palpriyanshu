const {readFileSync} = require('fs');

const decodeSpecialChar = function(element) {
  element = element.replace(/\+/g, ' ');
  element = element.replace(/\%0D\%0A/g, '<br />');
  return decodeURIComponent(element);
};

const formatComment = function(body) {
  body.name = decodeSpecialChar(body.name);
  body.comment = decodeSpecialChar(body.comment);
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
    return `
    <div id="commentBox">
    <h4>
    <img src="../image/humanLogo.png" alt="img" id="logo"/>
    ${comment.name}</h4>\n
    <p> ${comment.comment} </p>\n
    <footer class="rightFooter">
    <img src="../image/clock.png" alt="clk" id="clock"/>
    ${new Date(comment.dateAndTime).toUTCString()}\n
    </footer>
    </div>`;
  });
  guestBook = guestBook.replace(/__Comments__/, html.join('\n'));
  return guestBook;
};

module.exports = {formatComment, updateComments};
