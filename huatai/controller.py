from huatai import app
from flask import request
from httplib2 import Http
import requests
import base64
import json
import logging
import command
import strategy_manager_2 as strategy_manager
import random


login_path = '/api/login'
captcha_path = '/api/captcha'
trade_path = '/api/trade/'
hq_path = '/api/hq/'
auto_path = '/api/auto/'
auto_strategies_path = '/api/strategies'
cron_path = '/cron/<int:time_gap>/<int:slot_id>'

# huatai configuration
trade_api_url = 'https://tradegw.htsc.com.cn/'
hq_api_url = 'http://hq.htsc.com.cn/cssweb'


# ajax requests
@app.route(login_path, methods=['POST'])
def api_login():
    captcha = request.values.get('captcha', '')
    success = command.login(captcha)
    if success:
        user_info = command.refresh_user_info()
        if user_info is not None:
            return 'login successfully'
    return 'login failed'


@app.route(login_path, methods=['GET'])
def api_get_login_status():
    user_info = command.refresh_user_info()
    return 'not login' if user_info is None else user_info['client_name']


@app.route(captcha_path, methods=['GET'])
def api_get_captcha():
    return command.get_captcha()


@app.route(trade_path, methods=['GET'])
def api_trade():
    user_info = command.get_user_info()
    if user_info is None:
        return 'login first', 403
    ex_type = request.args.get('exchange_type', '')
    accounts = user_info['item']
    stock_account = ''
    for account in accounts:
        if account['exchange_type'] == str(ex_type):
            stock_account = account['stock_account']
            break
    querystring = '&'.join([key + '=' + str(request.args.get(key)) for key in request.args]) \
            + '&uid=' + user_info['uid'] \
            + '&version=1&custid=' + user_info['account_content'] \
            + '&op_branch_no=' + user_info['branch_no'] \
            + '&branch_no=' + user_info['branch_no'] \
            + '&op_entrust_way=7&op_station=' + user_info['op_station'] \
            + '&fund_account=' + user_info['fund_account'] \
            + '&password=' + user_info['trdpwd'] \
            + '&identity_type=&stock_account=' + stock_account \
            + '&ram=' + str(random.random())
    r = requests.get(trade_api_url, params = base64.b64encode(querystring.encode('utf-8')));
    data = base64.b64decode(r.text).decode('gbk')
    return data


@app.route(hq_path, methods=['GET'])
def api_hq():
    url = hq_api_url + '?type=' + request.args.get('type')
    res, content = Http().request(url)
    return content, res.status


@app.route(auto_path + '<strategy_name>', methods=['POST'])
def api_start_auto(strategy_name):
    logger = logging.getLogger(__name__)
    stock_code = request.values.get('stock_code')
    stock_amount = int(request.values.get('amount', '100'))
    interval = float(request.values.get('interval', '5'))
    threshold = float(request.values.get('threshold', '0.01'))
    if stock_amount <= 0:
        logger.warn('stock amount must be greater than 0')
        return json.dumps({'code':'error'})
    user_info = command.get_user_info()
    strategy_id = strategy_manager.start(
        strategy_name, interval,
        {'stock_code': stock_code, 'stock_amount': stock_amount, 'threshold': threshold, 'user_info': user_info})
    code = ''
    if strategy_id is None:
        code = 'error'
    return json.dumps({'code': code, 'strategy_id': strategy_id})


@app.route(auto_path + '<strategy_id>', methods=['DELETE'])
def api_stop_auto(strategy_id):
    strategy_manager.stop(strategy_id)
    return '{"code":""}'


@app.route(auto_path + '<strategy_id>', methods=['GET'])
def api_get_auto_status(strategy_id):
    start_id = int(request.args.get('start_id', '-1'))
    count = int(request.args.get('count', '10'))
    pid = int(request.args.get('pid', '-1'))
    log, pid, end_id = strategy_manager.get_log(strategy_id, start_id, count, pid)
    return json.dumps({'end_id': end_id, 'pid': pid, 'log_content': log})


@app.route(auto_path, methods=['GET'])
def api_get_auto_running_strategies():
    strategies = strategy_manager.get_all_running_strategies()
    return json.dumps(strategies)


@app.route(auto_strategies_path, methods=['GET'])
def api_get_all_strategies():
    strategies = strategy_manager.get_all_available_strategies()
    return json.dumps(strategies)


@app.route(cron_path, methods=['GET'])
def api_refresh(time_gap, slot_id):
    strategy_manager.runner(time_gap, slot_id)
    return 'ok'
