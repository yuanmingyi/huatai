import sqlite3, os
from contextlib import closing


class DBService:
    __dir = os.path.dirname(__file__)

    def __init__(self, config):
        self.__config = config

    def connect_db(self):
        db = sqlite3.connect(os.path.join(self.__dir, self.__config))
        db.row_factory = sqlite3.Row
        return db

    def init_db(self):
        with closing(self.connect_db()) as db:
            with open(os.path.join(self.__dir, 'schema.sql'), mode='r') as f:
                db.cursor().executescript(f.read())
            db.commit()

    @staticmethod
    def query_db(db, query, args=(), one=False):
        cur = db.execute(query, args)
        rv = cur.fetchall()
        cur.close()
        return (rv[0] if rv else None) if one else rv

    @staticmethod
    def insert_db(db, table, fields=(), values=()):
        cur = db.cursor()
        query = 'INSERT INTO %s (%s) VALUES (%s)' % (
            table, ','.join(fields), ','.join(['?'] * len(values)))
        cur.execute(query, values)
        db.commit()
        id = cur.lastrowid
        cur.close()
        return id

    @staticmethod
    def update_db(db, table, where_fields={}, update_fields={}):
        cur = db.cursor()
        where_clause = ' and '.join(['%s=%s' % (key, str(where_fields[key])) for key in where_fields])
        if where_clause == '':
            where_clause = '1=1'
        update_clause = ','.join(['%s=?' % key for key in update_fields])
        query = 'UPDATE %s set %s where %s' % (table, update_clause, where_clause)
        cur.execute(query, update_fields.values())
        db.commit()
        cur.close()

