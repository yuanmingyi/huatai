import logging

import simple
from huatai.utilities.threadsafedict import ThreadSafeDict
from strategy import Strategy

__strategies = ThreadSafeDict()
def register_strategy(strategy_name, strategy_instance):
    logger_root = logging.getLogger(__name__)
    if __strategies.has_key(strategy_name):
        logger_root.warn('strategy already registered')
    elif isinstance(strategy_instance, Strategy):
        __strategies.add(strategy_name, strategy_instance)
    else:
        logger_root.warn('invalid type of strategy instance')


def get_strategy_instance(name):
    return __strategies.get(name)


def get_all_strategy_names():
    return __strategies.keys()


register_strategy('simple', simple.Simple())
