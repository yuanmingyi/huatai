import logging
import logging.config
import os
import threading
import time
import traceback
from multiprocessing import Process, Pipe

from strategies import strategies_loader as loader
from utilities.threadsafedict import ThreadSafeDict
from recorder import Recorder


__tasks = ThreadSafeDict()


def update_pids():
    while True:
        for key in __tasks.keys():
            value = __tasks.get(key)
            if value is not None:
                pipe, pid = value
                new_pid = pipe.recv() if pipe.poll() else pid
                __tasks.modify(key, (pipe, new_pid))
        time.sleep(0.5)

threading.Thread(target=update_pids, name='monitor_thread').start()


def get_all_available_strategies():
    return loader.get_all_strategy_names()


def get_all_running_strategies():
    return __tasks.keys()


def get_log(strategy_id, round, count, pid=-1):
    if pid == -1:
        logger = logging.getLogger(__name__)
        value = __tasks.get(strategy_id)
        if value is None:
            logger.warn('strategy_id %r is not running' % strategy_id)
            return [], -1, -1
        pipe, pid = value
    logs, round_num = Recorder.get_action_log(strategy_id, pid, round, count)
    return logs, pid, round_num


def start(strategy_name, interval, strategy_args):
    logger_root = logging.getLogger(__name__)
    strategy_instance = loader.get_strategy_instance(strategy_name)
    if strategy_instance is None:
        logger_root.warn('cannot create task from name: ' + strategy_name)
        return None
    strategy_id = __generate_strategy_id(strategy_name, strategy_args)
    if __tasks.has_key(strategy_id):
        logger_root.warn('task %s already run' % strategy_id)
        return None
    else:
        logger_root.info('create new task for: ' + strategy_name)
        parent, child = Pipe(True)
        p = Process(target=__wrapper, args=(child, strategy_instance, strategy_id, interval, strategy_args))
        __tasks.add(strategy_id, (parent, None))
        p.start()
        return strategy_id


def is_started(strategy_id):
    return __tasks.has_key(strategy_id)


def stop(strategy_id):
    logger_root = logging.getLogger(__name__)
    value = __tasks.get(strategy_id)
    if value is not None:
        pipe, pid = value
        __tasks.delete(strategy_id)
        pipe.send(True)
        logger_root.info('task %s (pid=%s) is deleted' % (strategy_id, str(pid)))


def __wrapper(conn, strategy_instance, strategy_id, interval, strategy_args):
    pid = os.getpid()
    logger = logging.getLogger(strategy_id)
    logger.warn('task started')
    conn.send(pid)
    num = 0
    stop_signal = conn.recv() if conn.poll() else False
    while not stop_signal:
        logger.info('start round %d of task: %s' % (num, strategy_id))
        strategy_args.update({'logger_prefix': '[round-%d]' % num,
                              'strategy_id': strategy_id, 'pid': pid, 'round': num})
        try:
            strategy_instance.run(logger, strategy_args)
        except:
            logger.error(traceback.format_exc())
        logger.info('end round %d of task: %s' % (num, strategy_id))
        num += 1
        stop_signal = conn.recv() if conn.poll(interval) else False
    logger.warn('task stopped')


def __generate_strategy_id(strategy_name, strategy_args):
    return strategy_name + strategy_args.get('stock_code')