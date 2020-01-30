const {readFileSync} = require('fs');

const getHtmlContent = function(comments) {
  return comments.map(comment => {
    const userComment = comment.comment.replace(/\r\n/g, '<br>');
    return `
    <div id="commentBox">
    <h4>
    <img src="./image/humanLogo.png" alt="img" id="logo"/>
    ${comment.name}</h4>\n
    <p> ${userComment} </p>\n
    <footer class="rightFooter">
    <img src="./image/clock.png" alt="clk" id="clock"/>
    ${new Date(comment.dateAndTime).toUTCString()}\n
    </footer>
    </div>`;
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
