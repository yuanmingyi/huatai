from huatai import app
from flask import render_template


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

