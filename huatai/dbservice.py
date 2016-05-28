from flask.ext.sqlalchemy import SQLAlchemy, sqlalchemy


class DBService:
    def __init__(self):
        pass

    @staticmethod
    def init_db(app):
        db_user = app.config.get('DB_USERNAME', '')
        db_pass = app.config.get('DB_PASSWORD', '')
        db_port = app.config.get('DB_PORT', '')
        schema_sec = app.config['DB_SCHEMA']
        user_sec = ''
        if db_user != '':
            user_sec = db_user
            if db_pass != '':
                user_sec += ':' + db_pass
            user_sec += '@'
        server_sec = app.config['DB_HOST']
        if db_port != '':
            server_sec += ':' + db_port
        database_sec = app.config['DATABASE']
        app.config['SQLALCHEMY_DATABASE_URI'] = database_uri =\
            '%s://%s%s/%s' % (schema_sec, user_sec, server_sec, database_sec)
        print 'database uri: ', database_uri
        return SQLAlchemy(app)

    @staticmethod
    def create_table(database):
        db = sqlalchemy.create_engine(database, echo=True)
        db.execute('drop table if exists strategy_log')
        db.execute('drop table if exists task_executor')
        db.execute('drop table if exists auth_data')
        db.execute('create table strategy_log (id integer primary key not null, name char(20) not null, '
                   'strategy_id char(20) not null, pid integer not null, round_num integer not null, '
                   'act char(20) not null, detail text, reason text, result char(20), '
                   'created_time datetime not null, updated_time datetime not null)')
        db.execute('create index strategy_id on strategy_log (strategy_id, pid)')
        db.execute('create table task_executor (id integer primary key not null, name char(20), '
                   'strategy_id char(40) unique, time_interval float(4), round_num int(4), parameters text, '
                   'status int(2) not null, created_time datetime not null, updated_time datetime not null)')
        db.execute('create index status on task_executor (status)')
        db.execute("insert into task_executor (id, name, strategy_id, time_interval, round_num, parameters, status, "
                   "created_time, updated_time) values "
                   "(1, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:45:17', '2016-05-11 10:45:23'),"
                   "(2, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:46:44', '2016-05-11 10:46:44'),"
                   "(3, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:46:44', '2016-05-11 10:46:44'),"
                   "(4, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),"
                   "(5, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),"
                   "(6, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),"
                   "(7, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),"
                   "(8, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47');")
        db.execute('create table auth_data (id integer primary key not null, '
                   'cookie char(255) not null unique, user_info text)')
