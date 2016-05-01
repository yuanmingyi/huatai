# base class
class Strategy:
    def run(self, logger, strategy_args):
        raise NotImplementedError()
