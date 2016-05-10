import datetime
from model.strategylog import StrategyLog
from huatai import db


class Recorder:
    MAX_INTEGER = (1 << 63) - 1

    def __init__(self):
        pass

    @staticmethod
    def get_action_log(strategy_id, pid, start_id=-1, limit=-1):
        query = StrategyLog.query\
            .filter(StrategyLog.strategy_id == strategy_id,
                    #StrategyLog.pid == pid,
                    StrategyLog.id >= start_id)\
            .order_by(StrategyLog.updated_time)
        if limit > 0 and start_id >= 0:
            query = query.limit(limit)
        result = query.all()
        if start_id < 0 < limit:
            result = result[-limit:]
        if len(result) == 0:
            return [], start_id
        log_content = [repr(rec) for rec in result]
        return log_content, result[-1].id + 1

    @staticmethod
    def save_action(name, strategy_id, pid, round_num, action, detail, reason, result=True):
        updated_time = created_time = datetime.datetime.utcnow()
        strategy_log = StrategyLog(name=name, strategy_id=strategy_id, pid=pid, round_num=round_num, act=action, detail=detail,
                                   reason=reason, result=StrategyLog.get_result(result), created_time=created_time, updated_time=updated_time)
        db.session.add(strategy_log)
        db.session.commit()
        return strategy_log.id

    @staticmethod
    def update_action(action_id, result):
        strategy_log = StrategyLog.query.get(action_id)
        strategy_log.result = result
        strategy_log.updated_time = datetime.datetime.utcnow()
        db.session.commit()