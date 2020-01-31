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

module.exports = Comments;
