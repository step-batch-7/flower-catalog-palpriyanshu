class Comments {
  constructor() {
    this.comments = [];
  }

  load(previousComment) {
    this.comments = previousComment;
  }

  add(comment) {
    this.comments.unshift(comment);
  }
}

class Comment {
  constructor(name, comment, time) {
    this.name = name;
    this.comment = comment;
    this.dateAndTime = time;
  }

  toHtml() {
    return `
    <div id="commentBox">
      <h4>
        <img src="./image/humanLogo.png" alt="img" id="logo"/>
        ${this.name}
      </h4>\n
      <p> ${this.comment} </p>\n
      <footer class="rightFooter">
        <img src="./image/clock.png" alt="clk" id="clock"/>
        ${new Date(this.dateAndTime).toUTCString()}\n
      </footer>
    </div>`;
  }
}

module.exports = {Comments, Comment};
