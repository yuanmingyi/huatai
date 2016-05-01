from huatai import app
from flask import render_template, g

from dbservice import DBService
db_service = DBService(app.config['DATABASE'])


@app.before_request
def before_request():
    g.db = db_service.connect_db()


@app.teardown_request
def teardown_request(exception):
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


@app.route('/')
@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/trade')
def trade():
    return render_template('trade.html')


@app.route('/undo')
def undo():
    return render_template('undo.html')


@app.route('/data')
def data():
    return render_template('data.html')


@app.route('/auto')
def auto():
    return render_template('auto.html')

