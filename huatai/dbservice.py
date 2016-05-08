from flask.ext.sqlalchemy import SQLAlchemy, sqlalchemy


class DBService:
    def __init__(self):
        pass

    @staticmethod
    def init_db(app):
        db_user = app.config.get('DB_USERNAME', None)
        db_pass = app.config.get('DB_PASSWORD', None)
        db_port = app.config.get('DB_PORT', None)
        schema_sec = app.config['DB_SCHEMA']
        user_sec = ''
        if db_user is not None:
            user_sec = db_user
            if db_pass is not None:
                user_sec += ':' + db_pass
            user_sec += '@'
        server_sec = app.config['DB_HOST']
        if db_port is not None:
            server_sec += ':' + db_port
        database_sec = app.config['DATABASE']
        app.config['SQLALCHEMY_DATABASE_URI'] = '%s://%s%s/%s' % (schema_sec, user_sec, server_sec, database_sec)
        return SQLAlchemy(app)

    @staticmethod
    def create_table(database):
        db = sqlalchemy.create_engine(database, echo=True)
        db.execute('create table strategy_log(id integer primary key not null, name char(20) not null, '
                   'strategy_id char(20) not null, pid int not null, round_num int not null, '
                   'act char(20) not null, detail text, reason text, result char(20), '
                   'created_time datetime not null, updated_time datetime not null)')
