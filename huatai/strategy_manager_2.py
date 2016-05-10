import logging
import logging.config
import os
import traceback
import datetime.datetime
import json
from huatai import db
from model.taskexecutor import TaskExecutor
from recorder import Recorder
from strategies import strategies_loader as loader


def get_all_available_strategies():
    return loader.get_all_strategy_names()


def get_all_running_strategies():
    results = TaskExecutor.query.filter_by(status=TaskExecutor.WORKING_STATUS).all()
    return [result.strategy_id for result in results]


def get_log(strategy_id, round, count, pid=-1):
    logger = logging.getLogger(__name__)
    task = TaskExecutor.query.filter_by(strategy_id=strategy_id, status=TaskExecutor.WORKING_STATUS).first()
    if task is None:
        logger.warn('strategy_id %r is not running' % strategy_id)
        return [], -1, -1
    logs, round_num = Recorder.get_action_log(strategy_id, -1, round, count)
    return logs, 0, round_num


def start(strategy_name, interval, strategy_args):
    logger_root = logging.getLogger(__name__)
    strategy_instance = loader.get_strategy_instance(strategy_name)
    if strategy_instance is None:
        logger_root.warn('cannot create task from name: ' + strategy_name)
        return None
    strategy_id = __generate_strategy_id(strategy_name, strategy_args)
    task = TaskExecutor.query.filter_by(strategy_id=strategy_id, status=TaskExecutor.WORKING_STATUS).first()
    if task is not None:
        logger_root.warn('task %s already run' % strategy_id)
        return strategy_id
    else:
        logger_root.info('create new task for: ' + strategy_name)
        slot = TaskExecutor.query.filter_by(status=TaskExecutor.FREE_STATUS).first()
        if slot is None:
            logger_root.warn('task slot is full. cannot create any more task')
            return None
        slot.strategy_id = strategy_id
        slot.updated_time = datetime.utcnow()
        slot.name = strategy_name
        slot.interval = interval
        slot.parameters = json.dumps(strategy_args)
        slot.status = TaskExecutor.WORKING_STATUS
        slot.count = 0
        db.session.commit()
        return strategy_id


def is_started(strategy_id):
    task = TaskExecutor.query.filter_by(strategy_id=strategy_id, status=TaskExecutor.WORKING_STATUS).first()
    return task is not None


def stop(strategy_id):
    logger_root = logging.getLogger(__name__)
    task = TaskExecutor.query.filter_by(strategy_id=strategy_id, status=TaskExecutor.WORKING_STATUS).first()
    if task is not None:
        task.status = TaskExecutor.FREE_STATUS
        db.session.commit()
        logger_root.info('task %s (slot id=%d) is stopped' % (strategy_id, task.id))


def runner(time_gap, slot_id):
    slot = TaskExecutor.query.get(slot_id)
    # time gap in second
    time_gap_s = time_gap * 60
    while True:
    if slot.status == TaskExecutor.WORKING_STATUS:
        slot.count += 1
        db.session.commit()
        if slot.count % slot.interval == 1:
            strategy_instance = loader.get_strategy_instance(slot.name)
            strategy_id = slot.strategy_id
            strategy_args = json.loads(slot.parameters)
            round_num = slot.count / slot.interval
            logger = logging.getLogger(strategy_id)
            logger.info('start round %d of task: %s' % (round_num, strategy_id))
            strategy_args.update({'logger_prefix': '[round-%d]' % round_num,
                                  'strategy_id': strategy_id, 'pid': -1, 'round': round_num})
            try:
                strategy_instance.run(logger, strategy_args)
            except:
                logger.error(traceback.format_exc())
            logger.info('end round %d of task: %s' % (round_num, strategy_id))


def __generate_strategy_id(strategy_name, strategy_args):
    return strategy_name + strategy_args.get('stock_code')