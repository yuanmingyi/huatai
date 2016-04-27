import requests, base64, random, json, logging, logging.config, datetime, command, os, strategy_manager
from flask import Flask, request, g, render_template
from httplib2 import Http
from dbservice import DBService


# create the application
app = Flask(__name__)
app.config.from_object('config')
logging.config.fileConfig('logging.conf')
db_service = DBService(app.config['DATABASE'])

login_path = '/api/login'
captcha_path = '/api/captcha'
trade_path = '/api/trade/'
hq_path = '/api/hq/'
auto_path = '/api/auto/'
auto_strategies_path = '/api/strategies'

# huatai configuration
base_url = 'https://service.htsc.com.cn'
login_url = base_url + '/service/loginAction.do?method=login'
logout_url = base_url + '/service/login.jsp?logout=yes'
hq_url = base_url + '/service/wsyyt/hq.jsp?sub_top=hq'
jy_url = base_url + '/service/jy.jsp?sub_top=jy'

captcha_url = base_url + '/service/pic/verifyCodeImage.jsp'
bi_url = base_url + '/service/flashbusiness_new3.jsp?etfCode='
trade_api_url = 'https://tradegw.htsc.com.cn/'
hq_api_url = 'http://hq.htsc.com.cn/cssweb'

logger = logging.getLogger(__name__)

# global variables
user_info = None


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


# ajax requests
@app.route(login_path, methods = ['POST'])
def api_login():
    global user_info
    cookies = get_cookies()
    captcha = request.values.get('captcha', '')
    logger.info('cookies: ' + str(cookies))
    success = command.login(captcha, cookies)
    if success:
        user_info = command.get_user_info(cookies)
        if user_info is not None:
            return 'login successfully'
    return 'login failed'


@app.route(login_path, methods = ['GET'])
def api_get_login_status():
    global user_info
    user_info = command.get_user_info(get_cookies())
    return 'offline' if user_info is None else 'online'


@app.route(captcha_path, methods = ['GET'])
def api_get_captcha():
    r = requests.get(captcha_url, cookies = get_cookies());
    return r.content, r.status_code


@app.route(trade_path, methods = ['GET'])
def api_trade():
    if user_info is None:
        return 'login first', 400
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


@app.route(hq_path, methods = ['GET'])
def api_hq():
    url = hq_api_url + '?type=' + request.args.get('type')
    res, content = Http().request(url)
    return content, res.status


@app.route(auto_path + '<strategy_name>', methods = ['POST'])
def api_start_auto(strategy_name):
    stock_code = request.values.get('stock_code')
    stock_amount = request.values.get('amount')
    interval = request.values.get('interval', 5)
    threshold = request.values.get('threshold', 0.01)
    if stock_amount <= 0:
        logger.warn('stock amount must be greater than 0')
        return json.dumps({'code':'error'})
    strategy_id = strategy_manager.start(strategy_name, interval, \
                                         {'stock_code': stock_code, 'stock_amount': stock_amount, 'threshold': threshold, 'user_info': user_info})
    code = ''
    if strategy_id is None:
        code = 'error'
    return json.dumps({'code': code, 'strategy_id': strategy_id})


@app.route(auto_path + '<strategy_id>', methods = ['DELETE'])
def api_stop_auto(strategy_id):
    strategy_manager.stop(strategy_id)
    return '{"code":""}'


@app.route(auto_path + '<strategy_id>', methods = ['GET'])
def api_get_auto_status(strategy_id):
    round = request.args.get('round', -1)
    count = request.args.get('count', 10)
    end_round, log = strategy_manager.get_log(strategy_id, round, count)
    return json.dumps({'end_round': end_round, 'log_content': log})


@app.route(auto_path, methods = ['GET'])
def api_get_auto_running_strategies():
    strategies = strategy_manager.get_all_running_strategies()
    return json.dumps(strategies)


@app.route(auto_strategies_path, methods = ['GET'])
def api_get_all_strategies():
    strategies = strategy_manager.get_all_available_strategies()
    return json.dumps(strategies)


__cookies = None
def get_cookies():
    global __cookies
    if __cookies is None:
        res = requests.get(base_url)
        __cookies = res.cookies
        logger.info('cookies refresh: %s' %(__cookies))
    return __cookies


if __name__ == '__main__':
    app.run()

