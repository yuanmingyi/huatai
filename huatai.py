import sqlite3, requests, ConfigParser, re, base64, random, json, logging, logging.config, datetime
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash
from contextlib import closing
from command import load_config

# create the application
app = Flask(__name__)
app.config.from_object('config')
logging.config.fileConfig('logging.conf')

login_path = '/api/login'
captcha_path = '/api/captcha'
trade_path = '/api/trade/'
hq_path = '/api/hq/'
auto_path = '/api/auto/'

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

logger = logging.getLogger()

def connect_db():
	return sqlite3.connect(app.config['DATABASE'])


def init_db():
	with closing(connect_db()) as db:
		with app.open_resource('schema.sql', mode='r') as f:
			db.cursor().executescript(f.read())
		db.commit()


def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


@app.before_request
def before_request():
	g.db = connect_db()


@app.teardown_request
def teardown_request(exception)():
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
@app.route(login_path, method = ['POST'])
def api_login():
	captcha = request.args.get('captcha', '')
	user = command.login(captcha, g.cookies)
	if user is None:
		return 'login failed'
	g.user_info = user
	strategy.init_strategy(user)
	return 'login successfully'


@app.route(login_path, method = ['GET'])
def api_get_login_status():
	return 'offline' if g.user_info is None else 'online'


@app.route(captcha_path, method = ['GET'])
def api_get_captcha():
	if g.cookies is None:
		refresh_cookies()
	r = requests.get(captcha_url, cookies = g.cookies);
	return r.content, r.status_code


@app.route(trade_path, method = ['GET'])
def api_trade():
	if g.user_info is None:
		return 'login first', 408
	ex_type = request.args.get('exchange_type', '')
	accounts = g.user_info['item'];
	stock_account = ''
    for account in accounts:
		if account['exchange_type'] == str(ex_type):
            stock_account = account['stock_account']
            break
    querystring = '&'.join([key + '=' + str(request.args.get(key)) for key in request.args]) \
    		+ '&uid=' + g.user_info['uid'] \
            + '&version=1&custid=' + g.user_info['account_content'] \
            + '&op_branch_no=' + g.user_info['branch_no'] \
            + '&branch_no=' + g.user_info['branch_no'] \
            + '&op_entrust_way=7&op_station=' + g.user_info['op_station'] \
            + '&fund_account=' + g.user_info['fund_account'] \
            + '&password=' + g.user_info['trdpwd'] \
            + '&identity_type=&stock_account=' + stock_account \
            + '&ram=' + str(random.random())
	r = requests.get(trade_api_url, params = base64.b64encode(querystring.encode('utf-8')));
	data = base64.b64decode(r.text).decode('gbk')
	return data


@app.route(hq_path, method = ['GET'])
def api_hq():
	url = hq_api_url + '?' + urlencode(request.args)
	return redirect(url)


@app.route(auto_path + '<stock_code>', method = ['POST'])
def api_start_auto(stock_code):
	stock_amount = request.args.get('amount', 0)
	interval = request.args.get('interval', 5)
	threshold = request.args.get('threshold', 0.01)
	if stock_amount <= 0:
		logger.warn('stock amount must be greater than 0')
		return json.dumps({'code':'error'})

	strategy_id = strategy.start_strategy('simple', interval, \
		{'stock_code': stock_code, 'stock_amount': stock_amount, 'threshold': threshold, 'user_info': g.user_info})
	code = ''
	if strategy_id is None:
		code = 'error'
	return json.dumps{'code': code, 'strategy_id': strategy_id})


@app.route(auto_path + '<strategy_name>', method = ['DELETE'])
def api_stop_auto(strategy_name):
	file_name = strategy.get_logger_filename(strategy_name)
	strategy.stop_strategy(strategy_name)
	if file_name is not None:
		try:
			with open(file_name, 'r') as f:
				content = f.read()
			res = query_db('insert into strategy_log (name, log, update_time) values (?, ?, ?)', \
				args = (strategy_name, content, datetime.datetime.now()), one = True)
			if res is not None and res[0] == 1:
				logger.info('log saved to db')
			else:
				logger.warn('saving log failed')
			os.remove(file_name)
		except Exception, e:
			logger.error('save log file %s to db failed: %s' %(file_name, str(e)))
	return ''


@app.route(auto_path + '<strategy_name>', method = ['GET'])
def api_get_auto_status(strategy_name):
	file_name = strategy.get_logger_filename(strategy_name)
	if file_name is None:
		try:
			row = query_db('select * from strategy_log where strategy_name = ? order by udpate_time desc limit 1', \
				args = (strategy_name,), one = True)
		except Exception, e:
			logger.error('query log from db failed: %s' %(str(e)))
		return row['log'] if row is not None else ('strategy not found', 400)

	def generator():
		f = open(file_name, 'r')
		l = ''
		while strategy.is_started(strategy_name) or l != ''：
			l = f.readline()
			if l != '':
				yield l
	return generator()


def refresh_cookies(cookies):
	if cookies is None:
		res = requests.get(base_url)
		cookies = res.cookies
	g.cookies = cookies


if __name__ == '__main__'
	app.run()


