from huatai import app
import json


@app.errorhandler(400)
def bad_request(error):
    return json.dumps({'error': 'bad request'}), 400


@app.errorhandler(403)
def forbidden(error):
    return json.dumps({'error': 'forbidden'}), 403


@app.errorhandler(404)
def not_found(error):
    return json.dumps({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return json.dumps({'error': 'internal error'}), 500
