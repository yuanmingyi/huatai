from huatai import db
from datetime import datetime


class TaskExecutor(db.Model):
    __tablename__ = 'task_executor'
    WORKING_STATUS = 1
    FREE_STATUS = 0
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    strategy_id = db.Column(db.String(40), nullable=False, unique=True)
    interval = db.Column(db.Integer, nullable=False)
    round_num = db.Column(db.Integer, nullable=False)
    parameters = db.Column(db.Text, nullable=True)
    status = db.Column(db.Integer, nullable=False)
    created_time = db.Column(db.DateTime, nullable=False)
    updated_time = db.Column(db.DateTime, nullable=False)

    def __init__(self, identity=None, name='', strategy_id=None, interval=1, round_num=0,
                 parameters=None, status=0, created_time=None, updated_time=None):
        self.id = identity
        self.name = name
        self.strategy_id = strategy_id
        self.interval = interval
        self.round_num = round_num
        self.parameters = parameters
        self.status = status
        self.created_time = created_time if created_time is not None else datetime.utcnow()
        self.updated_time = updated_time if updated_time is not None else datetime.utcnow()

    def __repr__(self):
        return '<%d %s %s %s %s %s>' % \
           (self.id, self.name, self.strategy_id, TaskExecutor.get_status(self.status),
            self.created_time.ctime(), self.updated_time.ctime())

    @staticmethod
    def get_status(status):
        return 'FREE' if status == TaskExecutor.FREE_STATUS else 'WORKING'
