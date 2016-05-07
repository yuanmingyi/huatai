import time
from dbservice import DBService

class Recorder:
    __table_name = 'strategy_log'

    def __init__(self, db):
        self.__db = db

    def save_action(self, name, action, detail, reason, result = None):
        updated_time = created_time = time.time()
        id = DBService.insert_db(self.__db, self.__table_name,
                            ['name', 'act', 'detail', 'reason', 'result', 'created_time', 'updated_time'],
                            [name, action, detail, reason, result, created_time, updated_time])
        return id

    def update_action(self, action_id, result):
        updated_time = time.time()
        DBService.update_db(self.__db, self.__table_name, {'id':action_id},
                            {'result':result, 'updated_time':updated_time})
