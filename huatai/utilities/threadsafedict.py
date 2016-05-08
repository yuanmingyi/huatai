from multiprocessing import Lock


class ThreadSafeDict:
    def __init__(self, dictionary=None):
        self.__dict = dictionary if dictionary is not None else dict()
        self.__lock = Lock()

    def add(self, key, value):
        with self.__lock:
            if key not in self.__dict:
                self.__dict[key] = value
                return True
            return False

    def modify(self, key, value):
        with self.__lock:
            if key in self.__dict:
                self.__dict[key] = value
                return True
            return False

    def get(self, key, default_val = None):
        with self.__lock:
            return self.__dict.get(key, default_val)

    def delete(self, key):
        with self.__lock:
            if key in self.__dict:
                del self.__dict[key]
                return True
            return False

    def keys(self):
        with self.__lock:
            return self.__dict.keys()

    def has_key(self, key):
        with self.__lock:
            return key in self.__dict

    def length(self):
        with self.__lock:
            return len(self.__dict)
