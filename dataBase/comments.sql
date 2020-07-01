drop TABLE if EXISTS guestBook;

create table guestBook(
  serial_no NUMERIC(5) DEFAULT 3,
  name VARCHAR(20),
  comment VARCHAR(50),
  date DEFAULT CURRENT_TIMESTAMP
);

INSERT into guestBook (serial_no, name, comment, date) values
(1, 'anuja', 'good', CURRENT_TIMESTAMP),
(2, 'anil', 'nice', CURRENT_TIMESTAMP);

select * from guestBook;