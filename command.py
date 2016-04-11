import requests, random, logging, logging.config, ConfigParser, re, json, base64
from httplib2 import Http

trade_api_url = 'https://tradegw.htsc.com.cn/'
hq_api_url = 'http://hq.htsc.com.cn/cssweb'
base_url = 'https://service.htsc.com.cn'
login_url = base_url + '/service/loginAction.do?method=login'
captcha_url = base_url + '/service/pic/verifyCodeImage.jsp'
bi_url = base_url + '/service/flashbusiness_new3.jsp?etfCode='

logging.config.fileConfig('logging.conf')
logger = logging.getLogger()

def market_to_exchange(market):
    return 'sh' if int(market) == 1 else ('sz' if int(market) == 2 else None)


def login(captcha, cookies):
    secure = load_config()
    params = { \
        'userType': 'jy', \
        'loginEvent': 1, \
        'trdpwdEns': secure.get('login', 'trdpwd'), \
        'macaddr': secure.get('login', 'mac'), \
        'hddInfo': secure.get('login', 'hdd'), \
        'lipInfo': secure.get('login', 'ip'), \
        'topath': None, \
        'accountType': 1, \
        'userName': secure.get('login', 'user_id'), \
        'servicePwd': secure.get('login', 'pwd'), \
        'trdpwd': secure.get('login', 'trdpwd'), \
        'vcode': captcha \
    }
    logger.info('login param: ' + json.dumps(params))
    r = requests.post(login_url, data = params, headers = get_session_header(cookies), cookies = cookies)
    if r.status_code != 200:
        print 'login failed'
        return None
    #logger.info('login result: ' + r.content)
    r = requests.get(bi_url, headers = get_session_header(cookies), cookies = cookies)
    p = re.compile(r'<script\s+.*?>\s*var data ?= ?"(.*?)";\s*</script>', re.I | re.M)
    m = p.search(r.content)
    d = m.group(1)
    user = json.loads(d.decode('base64').decode('gbk'))
    return user


def get_cookies():
    res = requests.get(base_url)
    return res.cookies


def get_session_header(cookies):
    return {'JSESSIONID': cookies.get('JSESSIONID')}


def get_captcha(cookies):
    r = requests.get(captcha_url, cookies = cookies)
    if r.status_code == 200:
        return r.content
    logger.warn('get captcha failed: ' + str(r.status_code) + ':' + r.content)
    return None


def send_trade_req(user, params, req_type, func_id, ex_type):
    if user is None:
        return

    accounts = user['item'];
    stock_account = ''
    for account in accounts:
        if account['exchange_type'] == str(ex_type):
            stock_account = account['stock_account']
            break

    querystring = 'uid=' + user['uid'] \
            + '&cssweb_type=' + req_type \
            + '&version=1&custid=' + user['account_content'] \
            + '&op_branch_no=' + user['branch_no'] \
            + '&branch_no=' + user['branch_no'] \
            + '&op_entrust_way=7&op_station=' + user['op_station'] \
            + '&function_id=' + func_id \
            + '&fund_account=' + user['fund_account'] \
            + '&password=' + user['trdpwd'] \
            + '&identity_type=&exchange_type=' + str(ex_type) \
            + '&stock_account=' + stock_account \
            + '&' \
            + '&'.join([key + '=' + str(params[key]) for key in params])

    querystring = querystring + '&ram=' + str(random.random())
    #logger.info('querystring: ' + querystring.encode('utf-8'))

    r = requests.get(trade_api_url, params = base64.b64encode(querystring.encode('utf-8')))
    result = r.text.decode('base64').decode('gbk')
    #logger.info('trade request return: ' + result)
    data = json.loads(result)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']
        data = data['cssweb_msg']
    else:
        data = data['item']

    return err, data


def buy(user, market, stock_code, entrust_amount, entrust_price):
    param = { \
        'stock_code': stock_code, \
        'entrust_amount': entrust_amount, \
        'entrust_price': entrust_price, \
        'entrust_prop': entrust_prop, \
        'entrust_bs': 1 \
    }

    return send_trade_req(user, param, 'STOCK_BUY', '302', market)


def buy_mp(user, market, stock_code, entrust_amount, entrust_prop, undo = None):
    entrust_prop = 'R' if undo is None else 'U'

    param = { \
        'stock_code': stock_code, \
        'entrust_amount': entrust_amount, \
        'entrust_price': entrust_price, \
        'entrust_prop': entrust_prop, \
        'entrust_bs': 1 \
    }

    return send_trade_req(user, param, 'STOCK_BUY_MP', '302', market)


def sell(user, market, stock_code, entrust_amount, entrust_price):
    param = { \
        'stock_code': stock_code, \
        'entrust_amount': entrust_amount, \
        'entrust_price': entrust_price, \
        'entrust_prop': 0, \
        'entrust_bs': 2 \
    }

    return send_trade_req(user, param, 'STOCK_SALE', '302', market)


def sell_mp(user, market, stock_code, entrust_amount, entrust_price, undo = None):
    entrust_prop = 'R' if undo is None else 'U'

    param = { \
        'stock_code': stock_code, \
        'entrust_amount': entrust_amount, \
        'entrust_price': entrust_price, \
        'entrust_prop': entrust_prop, \
        'entrust_bs': 2 \
    }

    return send_trade_req(user, param, 'STOCK_SALE_MP', '302', market)


def cancel_entrust(user, entrust_no):
    param = { 'batch_flag': 0, 'entrust_no': entrust_no }
    return send_trade_req(user, param, 'STOCK_CANCEL', '304', '')


def get_withdraw_list(user):
    param = { 'stock_code': '', 'locate_entrust_no': '', 'query_direction': '', 'sort_direction': 0, 'request_num': 100, 'position_str': '' }
    return send_trade_req(user, param, 'GET_CANCEL_LIST', '401', '')


def get_entrust_list(user):
    param = { 'stock_code': '', 'locate_entrust_no': '', 'query_direction': '', 'sort_direction': 0, 'request_num': 100, 'position_str': '' }
    return send_trade_req(user, param, 'GET_TODAY_ENTRUST', '401', '')


def get_today_trade_list(user):
    param = { 'stock_code': '', 'serial_no': '', 'query_direction': '', 'request_num': 100, 'query_mode': 0, 'position_str': '' }
    return send_trade_req(user, param, 'GET_TODAY_TRADE', '402', '')


def get_asset_info(user):
    param = { 'money_type': '' }
    return send_trade_req(user, param, 'GET_FUNDS', '405', '')


def get_owned_stock_info(user):
    param = { 'stock_code': '', 'query_direction': '', 'request_num': 100, 'query_mode': 0, 'position_str': '' }
    return send_trade_req(user, param, 'GET_STOCK_POSITION', '403', '')


def query_tick_detail(stock_code, market, from_s, to_s):
    exchange = market_to_exchange(market)
    url = hq_api_url + '?type=GET_TICK_DETAILNORMAL&exchange=' + exchange \
        + '&stockcode=' + str(stock_code) \
        + '&from=' + str(from_s) \
        + '&to=' + str(to_s) \
        + '&radom=' + str(random.random())
    #print url

    res, content = Http().request(url)
    data = json.loads(content)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']

    return err, data


def query_tick(stock_code, market, from_s):
    exchange = market_to_exchange(market)
    url = hq_api_url + '?type=GET_TICK&exchange=' + exchange \
        + '&stockcode=' + str(stock_code) \
        + '&from=' + str(from_s) \
        + '&radom=' + str(random.random())
    #print url

    res, content = Http().request(url)
    data = json.loads(content)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']

    return err, data


def query_stock(stock_code):
    url = hq_api_url + '?type=GET_PRICE_VOLUMEJY^cssweb_type=GET_HQ_B^stockcode=' \
        + stock_code + '^' + str(random.random())
    #print url

    res, content = Http().request(url)
    data = json.loads(content)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']
    else:
        data = data['item'][0]

    return err, data


def query_detail(stock_code, stock_type, market):
    exchange = market_to_exchange(market)
    url = hq_api_url + '?type=GET_PRICE_VOLUMEJSON&exchange=' + exchange \
        + '&stockcode=' + str(stock_code) \
        + '&stocktype=' + str(stock_type) \
        + '&radom=' + str(random.random())
    #print url

    res, content = Http().request(url)
    data = json.loads(content)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']
    else:
        data = data['data'][0]

    return err, data


def load_config():
    cf = ConfigParser.ConfigParser() 
    cf.read('huatai.conf')
    return cf