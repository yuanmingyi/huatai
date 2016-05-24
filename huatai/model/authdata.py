from huatai import db


class AuthData(db.Model):
    __tablename__ = 'auth_data'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(255), nullable=False)
    session_cookie = db.Column(db.String(50), nullable=False)
    user_info = db.Column(db.Text)

    def __init__(self, identity=None, session_id=None, session_cookie=None, user_info=None):
        self.id = identity
        self.session_id = session_id
        self.session_cookie = session_cookie
        self.user_info = user_info

    def __repr__(self):
        return '[%d %s %s %s]' % (self.id, self.session_id, self.session_cookie, self.user_info)
