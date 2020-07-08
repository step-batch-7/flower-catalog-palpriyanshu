const toHtml = (comments) => {
  return `
  <div id="commentBox">
    <h4>
      <img src="./image/humanLogo.png" alt="img" id="logo"/>
      ${comments.name}
    </h4>\n
    <p> ${comments.comment} </p>\n
    <footer class="rightFooter">
      <img src="./image/clock.png" alt="clk" id="clock"/>
      ${new Date(comments.date).toUTCString()}\n
    </footer>
  </div>`;
};

const getHtmlPage = (rows) => {
  if(rows){
    return rows.map(toHtml).join('');
  }
  return '';
};

module.exports = {getHtmlPage};
