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

class Comments {
  constructor() {
    this.comments = [];
  }

  static load(previousComments) {
    const commentList = previousComments || [];
    const comments = new Comments();
    commentList.forEach(comment => {
      comments.comments.push(
        new Comment(comment.name, comment.comment, comment.dateAndTime)
      );
    });
    return comments;
  }

  add(comment) {
    this.comments.unshift(comment);
  }

  toHtml() {
    return this.comments.map(comment => {
      const userComment = comment.comment.replace(/\r\n/g, '<br>');
      const newComment = new Comment(
        comment.name,
        userComment,
        comment.dateAndTime
      );
      return newComment.toHtml();
    });
  }
}

module.exports = {Comments, Comment};
