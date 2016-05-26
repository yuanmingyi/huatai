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
        result = AuthData.query.filter().all()
        if len(result) == 0:
            return None
        user_info = result[0].user_info
        if user_info is None:
            logger.info('user is not login')
        else:
            user_info = json.loads(user_info)
        return result[0].session_id, result[0].session_cookie, user_info

    @staticmethod
    def insert_auth_data(session_id, session_cookie, user_info=None):
        auth_data = AuthData(session_id=session_id, session_cookie=session_cookie, user_info=user_info)
        db.session.add(auth_data)
        db.session.commit()
        return auth_data.id

    @staticmethod
    def update_auth_data(session_id=None, session_cookie=None, user_info=None):
        auth_data = AuthData.query.filter().all()
        if len(auth_data) == 0:
            return
        if session_id is not None:
            auth_data[0].session_id = session_id
        if session_cookie is not None:
            auth_data[0].session_cookie = session_cookie
        auth_data[0].user_info = None if user_info is None else json.dumps(user_info)
        db.session.commit()