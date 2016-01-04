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

        $.ajax({
            "url": loginUrl,
            "data": params,
            "method": "POST",
            "headers": {
                "JSESSIONID": this.sessionId
            },
            "complete": callback
        });
    }

    this.logout = function logout(callback) {
        $.ajax({
            "url": logoutUrl,
            "method": "POST",
            "headers": {
                "JSESSIONID": this.sessionId
            },
            "complete": callback
        });
    }

//
// get user data:
//
// {
//     "item": [
//         {
//             "exchange_type": "1",
//             "exchange_name": "�",
//             "holder_status": "0",
//             "stock_account": "A365521154",
//             "fund_account": "666625283528",
//             "main_flag": "1",
//             "holder_rights": " "
//         },
//         {
//             "exchange_type": "2",
//             "exchange_name": "�",
//             "holder_status": "0",
//             "stock_account": "0191042364",
//             "fund_account": "666625283528",
//             "main_flag": "1",
//             "holder_rights": " "
//         }
//     ],
//     "cssweb_type": "",
//     "fund_account": "666625283528",
//     "client_risklevel_name": "=__(",
//     "uid": "153-1663-8407692",
//     "cssweb_msg": "",
//     "branch_no": "54",
//     "trdpwd": "NpQXCQ856aAtrHjhT1W3ZQ$$",
//     "client_risklevel": "3",
//     "op_station": "PC;IIP:123.125.226.134;LIP:192.168.0.106;MAC:346895ED8BCB;HD:IE250N4015302044;NT:PCN[δ猐,CPU[δ猐,PI[δ猐@ymwt|V1.0.1.2",
//     "client_name": "�",
//     "cssweb_code": "success",
//     "client_rights": "eWt",
//     "account_content": "666625283528",
//     "last_op_station": "PC;IIP:123.125.226.134;LIP:192.168.0.106;MAC:346895ED8BCB;HD:IE250N4015302044;NT:PCN[δ猐,CPU[δ猐,PI[δ猐@ymwt|V1.0.1.2;BBXX=YMWT"
// }
//
    var pattern = /<script\s+.*?>\s*var data ?= ?"(.*?)";\s*<\/script>/im;
    this.loadUserData = function loadUserData() {
        $.ajax({
            "url": biUrl,
            "method": GET,
            "headers": {
                "JSESSIONID": this.sessionId
            },
            "success": function (data) {
                console.log(biUrl + ":" + data);
                // search user data in response html
                var result = data.match(pattern);
                var data = result[1];
                this.userdata = JSON.parse(base64decode(data));
                if (!this.userdata) {
                    alert("load user data failed!");
                }
            },
            "error": function (xhr, status, err) {
                console.log(biUrl + ":" + status + "-" + err);
            }
        })
    }

//
//  ajax methods
//

//
// buy with limited price
//
    this.buy = function (market, stockCode, entrustAmount, entrustPrice, complete) {
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": 0,
            "entrust_bs": 1
        };

        tradeReq(paramMap, "STOCK_BUY", "302", market, complete);
    }

// 
// buy with market price
//
    this.buyMp = function (market, stockCode, entrustAmount, entrustPrice, remain, complete) {
        var entrustProp = (remain === "undo" ? "U" : "R");
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": entrustProp,
            "entrust_bs": 1
        };

        tradeReq(paramMap, "STOCK_BUY_MP", "302", market, complete);
    }

//
// sell with limited price
//
    this.sell = function (market, stockCode, entrustAmount, entrustPrice, complete) {
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": 0,
            "entrust_bs": 2
        };

        tradeReq(paramMap, "STOCK_SALE", "302", market, complete);
    }

//
// sell with market price
//
    this.sellMp = function (market, stockCode, entrustAmount, entrustPrice, remain, complete) {
        var entrustProp = (remain === "undo" ? "U" : "R");
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": entrustProp,
            "entrust_bs": 2
        };

        tradeReq(paramMap, "STOCK_SALE_MP", "302", market, complete);
    }

    function marketToExchange(market) {
        return (market === 1 ? "sh" : "sz");
    }

//
// get cancel list
//
    this.getWithdrawList = function (complete) {
        var paramMap = {
            "stock_code": "",
            "locate_entrust_no": "",
            "query_direction": "",
            "sort_direction": 0,
            "request_num": 100,
            "position_str": ""
        };

        tradeReq(paramMap, "GET_CANCEL_LIST", "401", "", complete);
    }

//
// get entrust list
//
    this.getEntrustList = function (complete) {
        var paramMap = {
            "stocke_code": "",
            "locate_entrust_no": "",
            "query_direction": "",
            "sort_direction": 0,
            "request_num": 100,
            "position_str": ""
        };

        tradeReq(paramMap, "GET_TODAY_ENTRUST", "401", "", complete);
    }

// get tick detail response:
//
// {
//     "cssweb_code": "success",
//     "type": "GET_TICK_DETAILNORMAL",
//     "stockcode": "sz000009",
//     "totalnum": 4159,
//     "from": 4136,
//     "to": 4159,
//     "zrsp": 18.530000,
//     "data": [
//         [17.990000, 939.000000, 17.980000, 17.990000, "14:55:56", 1687631.000000, "B"],
//         [17.950000, 885.000000, 17.930000, 17.950000, "14:55:59", 1589078.000000, "S"],
//          ...,
//         [17.960000, 17496.000000, 17.960000, 17.970000, "15:00:20", 31422816.000000, "B"]
//     ],
//     "returnflag": "",
//     "detailtype": "normal"
// }
    this.queryTickDetail = function (stockCode, market, from, to, complete) {
        var exchange = marketToExchange(market);
        var url = baseHqUrl
            + "?type=GET_TICK_DETAILNORMAL&exchange=" + exchange
            + "&stockcode=" + stockCode
            + "&from=" + from
            + "&to=" + to
            + "&radom=" + Math.random();

        $.ajax({
            "url": url,
            "method": "GET",
            "success": function (data) {
                console.log(url + ":" + data);
                try {
                    var stockInfo = JSON.parse(data);
                    var result = stockInfo["cssweb_code"];
                    if (result === "success") {
                        complete("", stockInfo);
                    } else {
                        complete(result, data);
                    }
                } catch (err) {
                    console.log("exception", err);
                }
            },
            "error": function (xhr, status, err) {
                console.log(url + ":" + status + "-" + err);
                complete(status, err);
            }
        });
    }

// get stock tick response:
//
// {
//     "cssweb_code": "success",
//     "type": "GET_TICK",
//     "stockcode": "sz000012",
//     "zqjc": "南  玻Ａ",
//     "jrkp": 13.7,
//     "close": 13.7,
//     "zqlb": 11,
//     "high": 13.96,
//     "low": 13.35,
//     "highvolume": 19089.1,
//     "highAmount": 25483975.2,
//     "quotetime": "2015-12-31 15:00:00",
//     "data": [
//         [13.7, 2029.0, 2779730.0, "2015-12-31 09:30:00"],
//         [13.57, 10560.0, 14378326.73, "2015-12-31 09:31:00"],
//         [13.69, 12346.5, 16812632.23, "2015-12-31 09:32:00"],
//          ...,
//         [13.47, 649257.6, 888656765.34, "2015-12-31 14:59:00"],
//         [13.35, 668346.7, 914140740.54, "2015-12-31 15:00:00"]
//     ]
// }
    this.queryTick = function (stockCode, market, from, complete) {
        var exchange = marketToExchange(market);
        var url = baseHqUrl
            + "?type=GET_TICK&exchange=" + exchange
            + "&stockcode=" + stockCode
            + "&from=" + from
            + "&radom=" + Math.random();

        $.ajax({
            "url": url,
            "method": "GET",
            "success": function (data) {
                console.log(url + ":" + data);
                try {
                    var stockInfo = JSON.parse(data);
                    var result = stockInfo["cssweb_code"];
                    if (result === "success") {
                        complete("", stockInfo);
                    } else {
                        complete(result, data);
                    }
                } catch (err) {
                    console.log("exception", err);
                }
            },
            "error": function (xhr, status, err) {
                console.log(url + ":" + status + "-" + err);
                complete(status, err);
            }
        });
    }

// get stock info response:
//
// {
//     "cssweb_code": "success",
//     "cssweb_type": "GET_HQ_B",
//     "cssweb_msg": "",
//     "item": [{
//         "newzqlb": 11.000000,
//         "zqlb": 11.000000,
//         "market": "2",
//         "sjw5": 13.390000,
//         "ssl5": 1719.000000,
//         "sjw4": 13.380000,
//         "ssl4": 247.000000,
//         "sjw3": 13.370000,
//         "ssl3": 123.000000,
//         "sjw2": 13.360000,
//         "ssl2": 242.000000,
//         "sjw1": 13.350000,
//         "ssl1": 685.000000,
//         "bjw1": 13.340000,
//         "bsl1": 70.000000,
//         "bjw2": 13.330000,
//         "bsl2": 183.000000,
//         "bjw3": 13.320000,
//         "bsl3": 460.000000,
//         "bjw4": 13.310000,
//         "bsl4": 365.000000,
//         "bjw5": 13.300000,
//         "bsl5": 1186.000000,
//         "zqdm": "000012",
//         "zqjc": "南  玻Ａ",
//         "zrsp": 13.700000,
//         "jrkp": 13.700000,
//         "zjcj": 13.350000,
//         "cjsl": 668346.700000,
//         "zf": -0.025500,
//         "quotetime": "2015-12-31 15:00:23",
//         "xgsg": 0,
//         "zt": 15.070000,
//         "dt": 12.330000
//     }]
// }
    this.queryStock = function (stockCode, complete) {
        var url = baseHqUrl
            + "?type=GET_PRICE_VOLUMEJY^cssweb_type=GET_HQ_B^stockcode="
            + stockCode
            + "^"
            + Math.random();

        $.ajax({
            "url": url,
            "success": function (data) {
                console.log(url + ":" + data);
                try {
                    var stockInfo = JSON.parse(data);
                    var result = stockInfo["cssweb_code"];
                    if (result === "success") {
                        complete("", stockInfo["item"]);
                    } else {
                        complete(result, data);
                    }
                } catch (err) {
                    complete("exception", err);
                }
            },
            "error": function (xhr, status, err) {
                console.log(url + ":" + status + "-" + err);
                complete(status, err);
            },
            "method": "GET"
        });
    }

// get stock detail response
//
// {
//     "cssweb_code": "success",
//     "type": "GET_PRICE_VOLUMEJSON",
//     "stockcode": "sz000009",
//     "data": [{
//         "sjw5": 18.010000,
//         "ssl5": 294.000000,
//         "sjw4": 18.000000,
//         "ssl4": 2827.000000,
//         "sjw3": 17.990000,
//         "ssl3": 105.000000,
//         "sjw2": 17.980000,
//         "ssl2": 1589.000000,
//         "sjw1": 17.970000,
//         "ssl1": 4543.000000,
//         "bjw1": 17.960000,
//         "bsl1": 858.000000,
//         "bjw2": 17.950000,
//         "bsl2": 2019.000000,
//         "bjw3": 17.940000,
//         "bsl3": 408.000000,
//         "bjw4": 17.930000,
//         "bsl4": 395.000000,
//         "bjw5": 17.920000,
//         "bsl5": 200.000000,
//         "wb": -0.413800,
//         "wc": -5478.000000,
//         "zjcj": 17.960000,
//         "cjje": 899558605.110000,
//         "zd": -0.570000,
//         "jrkp": 18.530000,
//         "zf": -0.030800,
//         "zgcj": 18.610000,
//         "cjsl": 493268.200000,
//         "zdcj": 17.910000,
//         "xs": 17496.000000,
//         "lb": 0.546000,
//         "zt": 20.383000,
//         "dt": 16.677000,
//         "zrsp": 18.530000,
//         "sy": 0.000000,
//         "gb": 0.000000,
//         "hs": 0.000000,
//         "ltsl": 0.000000,
//         "jz": 0.000000,
//         "mgsy": 0.000000,
//         "syjd": 0.000000,
//         "zqjc": "中国宝安",
//         "tp": 0,
//         "fullprice": 0.000000,
//         "np": 288022.000000,
//         "wp": 205247.000000
//     }]
// }
    this.queryDetail = function (stockCode, stockType, market, complete) {
        var exchange = marketToExchange(market);
        var url = baseHqUrl
            + "?type=GET_PRICE_VOLUMEJSON&exchange=" + exchange
            + "&stockcode=" + stockCode
            + "&stocktype=" + stockType
            + "&radom=" + Math.random();

        $.ajax({
            "url": url,
            "success": function (data) {
                console.log(url + ":" + data);
                try {
                    var stockInfo = JSON.parse(data);
                    var result = stockInfo["cssweb_code"];
                    if (result === "success") {
                        complete("", stockInfo["data"]);
                    } else {
                        complete(result, data);
                    }
                } catch (err) {
                    complete("exception", err);
                }
            },
            "error": function (xhr, status, err) {
                console.log(url + ":" + status + "-" + err);
                complete(status, err);
            },
            "method": "GET"
        });
    }

    this.sendTradeReq = function tradeReq(paramMap, reqType, funcId, exType, complete) {
        var stockAccount = "";
        for(var t in this.userdata["item"]) {
            if (t["exchange_type"] == exType) {
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
            + "&fund_account=" + this.userdata["fund_account"]
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
            "url": url,
            "method": "GET",
            "success": function(data) {
                console.log(url + ":" + data);
                complete("", base64decode(data));
            },
            "error": function(xhr, status, err) {
                console.log(url + ":" + status + "-" + err);
                complete(status, err);
            }
        });
    };

    function getStockTypeFromStockCode(stockCode) {
        return 0;
    }
}