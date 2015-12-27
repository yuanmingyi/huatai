/**
 * Created by millan on 12/19/2015.
 */

function HuataiAssit(userId, pwd, trdpwd, hdd, ip, mac) {
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

    this.sendTradeReq = function (paramMap, reqType, funcId, exType) {
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

        for (var param in paramMap) {
            querystring += "&" + param["name"] + "=" + param["value"];
        }

        $.ajax({
            "method":"GET",
            "url": this.baseTradeUrl + "?" + base64encode(querystring),
            "complete": function(data) {
                alert(base64decode(data));
            }
        });
    };
}