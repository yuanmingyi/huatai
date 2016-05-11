import logging

import simple
from strategy import Strategy


StrategyLoaderKey = 'STRATEGIES_LOADER'


class StrategiesLoader:
    def __init__(self):
        self.__strategies = {}
        self.register_strategy('simple', simple.Simple())
        # add more strategies

    def register_strategy(self, strategy_name, strategy_instance):
        logger_root = logging.getLogger(__name__)
        if strategy_name in self.__strategies:
            logger_root.warn('strategy already registered')
        elif isinstance(strategy_instance, Strategy):
            self.__strategies[strategy_name] = strategy_instance
        else:
            logger_root.warn('invalid type of strategy instance')

    def get_strategy_instance(self, name):
        return self.__strategies.get(name)

    def get_all_strategy_names(self):
        return self.__strategies.keys()
