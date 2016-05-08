from huatai import db
import datetime


class StrategyLog(db.Model):
    __tablename__ = 'strategy_log'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    strategy_id = db.Column(db.String(20), nullable=False)
    pid = db.Column(db.Integer, nullable=False)
    round_num = db.Column(db.Integer, nullable=True)
    act = db.Column(db.String(20), nullable=False)
    detail = db.Column(db.Text, nullable=True)
    reason = db.Column(db.Text, nullable=True)
    result = db.Column(db.String(20), nullable=True)
    created_time = db.Column(db.DateTime, nullable=False)
    updated_time = db.Column(db.DateTime, nullable=False)

    def __init__(self, identity=None, name='', strategy_id='', pid=0, round_num=None, act='', detail=None,
                 reason=None, result=None, created_time=None, updated_time=None):
        self.id = identity
        self.name = name
        self.strategy_id = strategy_id
        self.pid = pid
        self.round_num = round_num
        self.act = act
        self.detail = detail
        self.reason = reason
        self.result = result
        self.created_time = created_time if created_time is not None else datetime.datetime.utcnow()
        self.updated_time = updated_time if updated_time is not None else datetime.datetime.utcnow()

    def __repr__(self):
        return '[%s] %r-%s-%r-%r (%s: %s) for "%s" --> (%s)' %\
               (self.updated_time.ctime(), self.id, self.strategy_id, self.pid, self.round_num, self.act, self.detail,
                self.reason, self.result)

    @staticmethod
    def result(success):
        return 'SUCCESS' if success else 'FAILURE'
