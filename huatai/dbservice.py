import sqlite3
from contextlib import closing


class DBService:
    def __init__(self, config):
        self.__config = config

    def connect_db(self):
        db = sqlite3.connect(self.__config)
        db.row_factory = sqlite3.Row
        return db

    def init_db(self):
        with closing(self.connect_db()) as db:
            with open('schema.sql', mode='r') as f:
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
