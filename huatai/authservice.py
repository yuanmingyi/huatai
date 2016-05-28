import logging
import json
from huatai import db
from model.authdata import AuthData


class AuthService:
    def __init__(self):
        pass

    @staticmethod
    def get_auth_data():
        logger = logging.getLogger(__name__)
        result = AuthData.query.first()
        if result is None:
            logger.warn('get_auth_data(): no auth data found!')
            return None
        user_info = result.user_info
        if user_info is not None:
            user_info = json.loads(user_info)
        return result.cookie, user_info

    @staticmethod
    def insert_or_update_auth_data(cookie, user_info=None):
        auth_data = AuthData.query.first()
        if auth_data is None:
            auth_data = AuthData(cookie=cookie, user_info=user_info)
            db.session.add(auth_data)
        else:
            if cookie is not None:
                auth_data.cookie = cookie
            auth_data.user_info = None if user_info is None else json.dumps(user_info)
        db.session.commit()
        return auth_data.id

    @staticmethod
    def insert_auth_data(cookie, user_info=None):
        auth_data = AuthData(cookie=cookie, user_info=user_info)
        db.session.add(auth_data)
        db.session.commit()
        return auth_data.id

    @staticmethod
    def update_auth_data(cookie=None, user_info=None):
        logger = logging.getLogger(__name__)
        auth_data = AuthData.query.first()
        if auth_data is None:
            logger.warn('update auth data failed: no auth data found!')
            return
        if cookie is not None:
            auth_data.cookie = cookie
        auth_data.user_info = None if user_info is None else json.dumps(user_info)
        db.session.commit()
