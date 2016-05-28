from huatai import db


class AuthData(db.Model):
    __tablename__ = 'auth_data'
    id = db.Column(db.Integer, primary_key=True)
    cookie = db.Column(db.String(255), nullable=False)
    user_info = db.Column(db.Text)

    def __init__(self, identity=None, cookie=None, user_info=None):
        self.id = identity
        self.cookie = cookie
        self.user_info = user_info

    def __repr__(self):
        return '[%d %s %s]' % (self.id, self.cookie, self.user_info)