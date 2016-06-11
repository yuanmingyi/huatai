import random
import logging
import ConfigParser
import re
import json
import base64
import urllib
import requests
from httplib2 import Http
from authservice import AuthService


login_host = 'service.htsc.com.cn'
trade_api_url = 'https://tradegw.htsc.com.cn/'
hq_api_url = 'http://hq.htsc.com.cn/cssweb'
base_url = 'https://service.htsc.com.cn'
login_url = base_url + '/service/loginAction.do?method=login'
logout_url = base_url + '/service/login.jsp?logout=yes'
captcha_url = base_url + '/service/pic/verifyCodeImage.jsp'
bi_url = base_url + '/service/flashbusiness_new3.jsp?etfCode='


def market_to_exchange(market):
    return 'sh' if int(market) == 1 else ('sz' if int(market) == 2 else None)


def login(captcha):
    logger = logging.getLogger(__name__)
    params = make_login_params(captcha)
    logger.info('login(): login param: ' + urllib.urlencode(params))
    cookies, user = get_cookie_and_user()
    r = requests.post(login_url, data=params, headers=get_session_header(cookies))
    if r.status_code != 200:
        logger.info('login(): login failed')
        return False
    return True


def logout():
    logger = logging.getLogger(__name__)
    cookies, user = get_cookie_and_user()
    r, data = Http().request(logout_url, headers=get_session_header(cookies))
    if r.status != 200:
        logger.info('logout(): logout failed')
        return False
    return True


def get_user_info():
    auth_data = AuthService.get_auth_data()
    if auth_data is None:
        return None
    else:
        return auth_data[1]


def refresh_user_info():
    logger = logging.getLogger(__name__)
    cookies, user = get_cookie_and_user()
    if user is None:
        try:
            r, content = Http().request(bi_url, headers=get_session_header(cookies))
            p = re.compile(r'<script\s+.*?>\s*var data ?= ?"(.*?)";\s*</script>', re.I | re.M)
            m = p.search(content)
            d = m.group(1)
            user = json.loads(d.decode('base64').decode('gbk'))
        except Exception, e:
            logger.error('refresh_user_info(): not login: ' + repr(e))
        AuthService.update_auth_data(user_info=user)
        logger.info('refresh_user_info(): user updated: ' + repr(user))
    return user


def get_cookie_and_user():
    logger = logging.getLogger(__name__)
    auth_data = AuthService.get_auth_data()
    headers = {}
    if auth_data is not None and auth_data[0] is not None:
        headers['Cookie'] = auth_data[0]
    logger.info('get_cookies(): headers=' + repr(headers))
    res, content = Http().request(base_url, headers=headers)
    cookies = res.get('set-cookie')
    if cookies is not None:
        logger.info('get_cookies(): cookies refresh: %r' % cookies)
        AuthService.insert_or_update_auth_data(cookies)
        return cookies, None
    logger.info('get_cookies(): cookies=' + auth_data[0])
    return auth_data


def get_session_header(cookies):
    logger = logging.getLogger(__name__)
    session_id = parse_cookie(cookies, 'JSESSIONID')
    logger.debug('get_session_header(): session id=' + session_id)
    return {'Cookie': cookies, 'JSESSIONID': session_id}


def parse_cookie(cookies, key):
    for cookie_token in cookies.split(','):
        cookie = cookie_token.split(';')
        for cookie_part in cookie:
            idx = cookie_part.index('=')
            name = cookie_part[:idx]
            if name.strip() == key:
                return cookie_part[idx+1:].strip()
    return None


def get_captcha():
    cookies, user = get_cookie_and_user()
    r, content = Http().request(captcha_url, headers={'Cookie': cookies})
    return content, r.status


def send_trade_req(user, params, req_type, func_id, ex_type):
    if user is None:
        return 'error', 'user not login'
    accounts = user['item']
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

    r = requests.get(trade_api_url, params=base64.b64encode(querystring.encode('utf-8')))
    result = r.text.decode('base64').decode('gbk')
    # r, content = http.request('%s?%s' % (trade_api_url, base64.b64encode(querystring.encode('utf-8'))))
    # result = content.decode('base64').decode('gbk')

    data = json.loads(result)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']
        data = data['cssweb_msg']
    else:
        data = data['item']
    return err, data


def buy(user, market, stock_code, entrust_amount, entrust_price):
    param = {
        'stock_code': stock_code,
        'entrust_amount': entrust_amount,
        'entrust_price': entrust_price,
        'entrust_prop': 0,
        'entrust_bs': 1
    }
    return send_trade_req(user, param, 'STOCK_BUY', '302', market)


def buy_mp(user, market, stock_code, entrust_amount, entrust_price, undo = None):
    entrust_prop = 'R' if undo is None else 'U'
    param = {
        'stock_code': stock_code,
        'entrust_amount': entrust_amount,
        'entrust_price': entrust_price,
        'entrust_prop': entrust_prop,
        'entrust_bs': 1
    }
    return send_trade_req(user, param, 'STOCK_BUY_MP', '302', market)


def sell(user, market, stock_code, entrust_amount, entrust_price):
    param = {
        'stock_code': stock_code,
        'entrust_amount': entrust_amount,
        'entrust_price': entrust_price,
        'entrust_prop': 0,
        'entrust_bs': 2
    }
    return send_trade_req(user, param, 'STOCK_SALE', '302', market)


def sell_mp(user, market, stock_code, entrust_amount, entrust_price, undo = None):
    entrust_prop = 'R' if undo is None else 'U'
    param = {
        'stock_code': stock_code,
        'entrust_amount': entrust_amount,
        'entrust_price': entrust_price,
        'entrust_prop': entrust_prop,
        'entrust_bs': 2
    }
    return send_trade_req(user, param, 'STOCK_SALE_MP', '302', market)


def cancel_entrust(user, entrust_no):
    param = {'batch_flag': 0, 'entrust_no': entrust_no}
    return send_trade_req(user, param, 'STOCK_CANCEL', '304', '')


def get_withdraw_list(user):
    param = {'stock_code': '', 'locate_entrust_no': '', 'query_direction': '', 'sort_direction': 0, 'request_num': 100, 'position_str': ''}
    return send_trade_req(user, param, 'GET_CANCEL_LIST', '401', '')


def get_entrust_list(user):
    param = {'stock_code': '', 'locate_entrust_no': '', 'query_direction': '', 'sort_direction': 0, 'request_num': 100, 'position_str': ''}
    return send_trade_req(user, param, 'GET_TODAY_ENTRUST', '401', '')


def get_today_trade_list(user):
    param = {'stock_code': '', 'serial_no': '', 'query_direction': '', 'request_num': 100, 'query_mode': 0, 'position_str': ''}
    return send_trade_req(user, param, 'GET_TODAY_TRADE', '402', '')


def get_asset_info(user):
    param = {'money_type': ''}
    return send_trade_req(user, param, 'GET_FUNDS', '405', '')


def get_owned_stock_info(user):
    param = {'stock_code': '', 'query_direction': '', 'request_num': 100, 'query_mode': 0, 'position_str': ''}
    return send_trade_req(user, param, 'GET_STOCK_POSITION', '403', '')


def query_tick_detail(stock_code, market, from_s, to_s):
    exchange = market_to_exchange(market)
    url = hq_api_url + '?type=GET_TICK_DETAILNORMAL&exchange=' + exchange \
        + '&stockcode=' + str(stock_code) \
        + '&from=' + str(from_s) \
        + '&to=' + str(to_s) \
        + '&radom=' + str(random.random())
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
    res, content = Http().request(url)
    data = json.loads(content)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']
    return err, data


def query_stock(stock_code):
    url = hq_api_url + '?type=GET_PRICE_VOLUMEJY^cssweb_type=GET_HQ_B^stockcode=' \
        + stock_code + '^' + str(random.random())
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
    res, content = Http().request(url)
    data = json.loads(content)
    err = None
    if data['cssweb_code'] != 'success':
        err = data['cssweb_code']
    else:
        data = data['data'][0]
    return err, data


def make_login_params(captcha):
    secure = load_config()
    params = {
        'userType': 'jy',
        'loginEvent': 1,
        'trdpwdEns': secure.get('login', 'trdpwd'),
        'macaddr': secure.get('login', 'mac'),
        'hddInfo': secure.get('login', 'hdd'),
        'lipInfo': secure.get('login', 'ip'),
        'topath': 'null',
        'accountType': 1,
        'userName': secure.get('login', 'user_id'),
        'servicePwd': secure.get('login', 'pwd'),
        'trdpwd': secure.get('login', 'trdpwd'),
        'vcode': captcha
    }
    return params


def load_config():
    cf = ConfigParser.ConfigParser() 
    cf.read('huatai/huatai.conf')
    return cf