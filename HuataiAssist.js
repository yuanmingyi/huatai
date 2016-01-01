/**
 * Created by millan on 12/19/2015.
 */

function HuataiAssist(userId, pwd, trdpwd, hdd, ip, mac) {
    this.userId = userId;
    this.pwd = pwd;
    this.trdpwd = trdpwd;
    this.hdd = hdd;
    this.ip = ip;
    this.mac = mac;
    this.userdata = null;

    var baseUrl = "https://service.htsc.com.cn";
    var loginUrl = baseUrl.concat("/service/loginAction.do?method=login");
    var logoutUrl = baseUrl.concat("/service/login.jsp?logout=yes");
    var hqUrl = baseUrl.concat("/service/wsyyt/hq.jsp?sub_top=hq");
    var jyUrl = baseUrl.concat("/service/jy.jsp?sub_top=jy");
    var captchaUrl = baseUrl.concat("/service/pic/verifyCodeImage.jsp");
    var base64Url = baseUrl.concat("/service/js/base64.js");
    var biUrl = baseUrl.concat("/service/flashbusiness_new3.jsp?etfCode=");

    var baseTradeUrl = "https://tradegw.htsc.com.cn/";
    var baseHqUrl = "http://hq.htsc.com.cn/cssweb";

    this.getBaseUrl = function() {
        return baseUrl;
    }

    this.getCaptchaUrl = function() {
        return captchaUrl + "?ran=" + Math.random();
    }

    this.getHqUrl = function() {
        return hqUrl;
    }

    this.getJyUrl = function() {
        return jyUrl;
    }

    this.init = function init(sessionId) {
        this.sessionId = sessionId;
        $.getScript(base64Url);
    }

    this.login = function login(vcode, callback) {
        var params = "userType=jy" +
            "&loginEvent=1" +
            "&trdpwdEns=" + this.trdpwd +
            "&macaddr=" + this.mac +
            "&hddInfo=" + this.hdd +
            "&lipInfo=" + this.ip + "+" +
            "&topath=null" +
            "&accountType=1" +
            "&userName=" + this.userId +
            "&servicePwd=" + this.pwd +
            "&trdpwd=" + this.trdpwd +
            "&vcode=" + vcode;

        $.ajax(loginUrl, {
            "data": params,
            "method": "POST",
            "headers": {
                "JSESSIONID": this.sessionId
            },
            "complete": callback
        });
    }

    this.logout = function logout(callback) {
        $.ajax(logoutUrl, {
            "method": "POST",
            "headers": {
                "JSESSIONID": this.sessionId
            },
            "complete": callback
        });
    }

    var pattern = /<script\s+.*?>\s*var data ?= ?"(.*?)";\s*<\/script>/im;
    this.loadUserData = function loadUserData() {
        $.ajax(biUrl, {
            "method": GET,
            "headers": {
                "JSESSIONID": this.sessionId
            },
            "complete": function(data) {
                // search user data in response html
                var result = data.match(pattern);
                var data = result[1];
                this.userdata = JSON.parse(base64decode(data));
                if (!this.userdata) {
                    alert("load user data failed!");
                }
            }
        })
    }

    this.buy = function (market, stockCode, entrustAmount, entrustPrice) {
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": 0,
            "entrust_bs": 1
        };

        tradeReq(paramMap, "STOCK_BUY", "302", market);
    }

    this.queryTick = function (stockCode, market, from, to) {

    }

    this.queryStock = function (stockCode) {
        var url = baseHqUrl
            + "?type=GET_PRICE_VOLUMEJY^cssweb_type=GET_HQ_B^stockcode="
            + stockCode
            + "^"
            + Math.random();

        var stock = null;
        $.ajax({
            "async": false,
            "url": url,
            "success": function (data) {
                var stockInfo = JSON.parse(data);
                if (stockInfo["cssweb_code"] == "success") {
                    stock = stockInfo["item"];
                }
            },
            "type": "GET"
        });

        return stock;
    }

    this.queryDetail = function (stockCode, stockType, market, success, failure) {
        var exchange = (market === 1 ? "sh" : "sz");
        var url = baseHqUrl
            + "?type=GET_PRICE_VOLUMEJSON&exchange=" + exchange
            + "&stockcode=" + stockCode
            + "&stocktype=" + stockType
            + "&radom=" + Math.random();

        var async = (typeof success !== 'undefined');
        var stock = null;
        var req = $.ajax({
            "async": async,
            "url": url,
            "success": function (data) {
                var stockInfo = JSON.parse(data);
                if (stockInfo["cssweb_code"] == "success") {
                    stock = stockInfo["data"];
                }
                success(stock);
            },
            "type": "GET"
        });

        return stock;
    }

    this.sendTradeReq = function tradeReq(paramMap, reqType, funcId, exType) {
        var fundAccount = null;
        var stockAccount = null;
        for(var t in this.userdata["item"]) {
            if (t["exchange_type"] == exType) {
                fundAccount = t["fund_account"];
                stockAccount = t["stock_account"];
                break;
            }
        };

        var querystring = "uid=" + this.userdata["uid"]
            + "&cssweb_type=" + reqType
            + "&version=1&custid=" + this.userdata["account_content"]
            + "&op_branch_no=" + this.userdata["branch_no"]
            + "&branch_no=" + this.userdata["branch_no"]
            + "&op_entrust_way=7&op_station=" + this.userdata["op_station"]
            + "&function_id=" + funcId
            + "&fund_account=" + fundAccount
            + "&password=" + this.userdata["trdpwd"]
            + "&identity_type=&exchange_type=" + exType
            + "&stock_account=" + stockAccount
            + "&ram=" + Math.random();

        for (var key in paramMap) {
            if (paramMap.hasOwnProperty(key)) {
                querystring += "&" + key + "=" + paramMap[key];
            }
        }

        var url = this.baseTradeUrl + "?" + base64encode(querystring);
        console.log("request url: " + url);

        $.ajax({
            "method":"GET",
            "url": url,
            "complete": function(data) {
                alert(base64decode(data));
            }
        });
    };

    function getStockTypeFromStockCode(stockCode) {
        return 0;
    }
}