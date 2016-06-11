import os, logging, logging.handlers, shutil


"""
"" this is not used
"""
class LogService:
    def __init__(self, strategy_id, pid, level = logging.DEBUG,
                 fmt='%(asctime)s-%(process)d-%(filename)s:%(lineno)d-%(levelname)s %(message)s'):
        self.__dir_name = 'logs/%s_%d' % (strategy_id, pid)
        self.__level = level
        self.__fmt = fmt
        if not os.path.isdir(self.__dir_name):
            os.makedirs(self.__dir_name)

    def __get_filename(self, num):
        return os.path.join(self.__dir_name, str(num) + '.log')

    def get_logger(self, num):
        filename = self.__get_filename(num)
        logger = logging.getLogger(filename)
        logger.setLevel(self.__level)
        if len(logger.handlers) == 0:
            fh = logging.FileHandler(filename)
            fh.setLevel(self.__level)
            formatter = logging.Formatter(self.__fmt)
            fh.setFormatter(formatter)
            logger.addHandler(fh)
        return logger

    def close_logger(self, logger):
        for handler in logger.handlers[:]:
            handler.close()
            logger.removeHandler(handler)

    def get_current_round(self):
        current_round = max(int(filename[:filename.index('.')]) for filename in os.listdir(self.__dir_name))
        return current_round

    def get_log_content(self, start_round, rounds):
        content = ''
        if start_round == -1:
            start_round = self.get_current_round() - rounds + 1
            if start_round < 0:
                start_round = 0
        end_round = start_round + rounds
        for r in range(start_round, start_round + rounds):
            filename = os.path.join(os.getcwd(), self.__get_filename(r))
            try:
                with open(filename, 'r') as f:
                    content += f.read()
            except:
                print 'file cannot open: ', filename
                end_round = r
                break
        return end_round, content

    def clear(self):
        if os.path.isdir(self.__dir_name):
            try:
                shutil.rmtree(self.__dir_name)
            except:
                print 'remove dir failed: ', self.__dir_name
