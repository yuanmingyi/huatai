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

    var baseUrl = "https://service.htsc.com.cn";
    var loginUrl = baseUrl.concat("/service/loginAction.do?method=login");
    var logoutUrl = baseUrl.concat("/service/login.jsp?logout=yes");
    var hqUrl = baseUrl.concat("/service/wsyyt/hq.jsp?sub_top=hq");
    var captchaUrl = baseUrl.concat("/service/pic/verifyCodeImage.jsp");

    this.getBaseUrl = function() {
        return baseUrl;
    }

    this.getCaptchaUrl = function() {
        return captchaUrl + "?ran=" + Math.random();
    }

    this.init = function init(sessionId) {
        this.sessionId = sessionId;
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
}