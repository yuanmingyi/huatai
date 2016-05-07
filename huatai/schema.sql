drop table if exists strategy_log;
create table strategy_log (
    id integer primary key autoincrement,
    name text not null,
    act text not null,
    detail text,
    reason text,
    result text,
    created_time timestamp not null,
    updated_time timestamp not null
);