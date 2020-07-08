const getSchema = function() {
  return `create table if not exists guestBook(
  serial_no NUMERIC(5) DEFAULT 3,
  name VARCHAR(20),
  comment VARCHAR(50),
  date DEFAULT CURRENT_TIMESTAMP
);`;
};

const uploadGuestPage = function(){
  return 'select * from guestBook;';
};

const addComments = function(post){
  const values = `3, '${post.name}', '${post.comment}', '${post.date}'`;
  return `INSERT into guestBook VALUES(${values})`;
};

module.exports = {getSchema, uploadGuestPage, addComments};
