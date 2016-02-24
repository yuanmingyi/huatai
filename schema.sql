drop table if exists entries;
create table accounts (
  id integer primary key autoincrement,
  account char not null,
  pwd char not null,
  secure_pwd char not null
);