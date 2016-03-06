import sqlite3, requests, ConfigParser, re, base64, random
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash
from contextlib import closing

# create the application
app = Flask(__name__)
app.config.from_object('config')

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

def connect_db():
	return sqlite3.connect(app.config['DATABASE'])

def init_db():
	with closing(connect_db()) as db:
		with app.open_resource('schema.sql', mode='r') as f:
			db.cursor().executescript(f.read())
		db.commit()

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
	secure = load_config('login')
    params = 'userType=jy' + \
    	'&loginEvent=1' + \
	    '&trdpwdEns=' + secure.trdpwd + \
	    '&macaddr=' + secure.mac + \
	    '&hddInfo=' + secure.hdd + \
	    '&lipInfo=' + secure.ip + '+' + \
	    '&topath=null' + \
	    '&accountType=1' + \
	    '&userName=' + secure.user_id + \
	    '&servicePwd=' + secure.pwd + \
	    '&trdpwd=' + secure.trdpwd + \
	    '&vcode=' + captcha
	r = requests.post(login_url, data=params, cookies=g.cookies)
	if r.status_code != 200:
		return r
	r = requests.get(bi_url, cookies=g.cookies)
	p = re.compile(r'<script\s+.*?>\s*var data ?= ?"(.*?)";\s*</script>', re.I | re.M)
	m = p.search(r.text)
	d = m.group(1)
	g.user_info = json.loads(base64.b64decode(d))
	return 'login successfully'

@app.route(login_path, method = ['GET'])
def api_get_login_status():
	if g.user_info is None:
		return 'offline'
	else:
		return 'online'

@app.route(captcha_path, method = ['GET'])
def api_get_captcha():
	r = requests.get(captcha_url, cookies = g.cookies);
	refresh_cookies(r.cookies)
	return Response(r.content, status=r.status_code, content_type=r.headers['content-type'])

@app.route(trade_path, method = ['GET'])
def api_trade():
	if g.user_info is None:
		return Reponse('login first', status=408)
	ex_type = request.args.get('exchange_type', '')
	accounts = g.user_info['item'];
	stock_account = ''
    for t in accounts:
		if accounts[t]['exchange_type'] == str(ex_type):
            stock_account = accounts[t]['stock_account']
            break
    querystring = request.query_string \
    		+ '&uid=' + g.user_info['uid'] \
            + '&version=1&custid=' + g.user_info['account_content'] \
            + '&op_branch_no=' + g.user_info['branch_no'] \
            + '&branch_no=' + g.user_info['branch_no'] \
            + '&op_entrust_way=7&op_station=' + g.user_info['op_station'] \
            + '&fund_account=' + g.user_info['fund_account'] \
            + '&password=' + g.user_info['trdpwd'] \
            + '&identity_type=&stock_account=' + stock_account \
            + '&ram=' + random.random()
	r = requests.get(trade_api_url, data = base64.b64encode(querystring));
	data = base64.b64decode(r.text)
	return data

@app.route(hq_path, method = ['GET'])
def api_hq():
	return requests.get(hq_api_url, data=request.query_string)

@app.route(auto_path + '<stock_code>', method = ['POST'])
def api_start_auto(stock_code):
	stock_amount = request.args.get('amount', 0)
	if stock_amount <= 0:
		print 'stock amount must be greater than 0'
		return HttpResponse(json.dumps({'code':'error'}))
	return HttpResponse(json.dumps({'strategy_id':'1'}))

def refresh_cookies(cookies):
	if cookies is None:
		res = requests.get(base_url)
		cookies = res.cookies
	g.cookies = cookies

def load_config(section):
	cf = ConfigParser.ConfigParser() 
	cf.read('huatai.conf')
	return cf.items(section)

if __name__ == '__main__'
	app.run()


