drop table if exists strategy_log;
create table strategy_log (
    id integer primary key autoincrement,
    name text not null,
    log text not null,
    update_time timestamp not null
);