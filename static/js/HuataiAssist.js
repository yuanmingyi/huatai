/**
 * Created by millan on 12/19/2015.
 */

function HuataiAssist() {
    this.userId = userId;
    this.pwd = pwd;
    this.trdpwd = trdpwd;
    this.hdd = hdd;
    this.ip = ip;
    this.mac = mac;

    var loginUrl = "/huatai/login";
    var captchaUrl = "/huatai/captcha";
    var baseTradeUrl = "/huatai/trade/";
    var baseHqUrl = "/huatai/hq/";

    this.getCaptchaUrl = function() {
        return captchaUrl + "?ran=" + Math.random();
    }

    this.login = function(vcode, callback) {
        var params = "captcha=" + vcode;

        $.ajax({
            "url": loginUrl,
            "data": params,
            "method": "POST",
            "complete": callback
        });
    }

//
//  ajax methods
//

    this.sendTradeReq = function(paramMap, reqType, complete) {
        var querystring = "?", url;

        for (key in paramMap) {
            if (paramMap.hasOwnProperty(key)) {
                querystring += key + "=" + paramMap[key] + "&";
            }
        }

        url = baseTradeUrl + reqType + querystring.slice(0, -1);
        //console.log("request url: " + url);

        $.ajax({
            "url": url,
            "method": "GET",
            "success": function(data) {
                //console.log(url + ":" + data);
                try {
                    data = JSON.parse(data);
                    if (data["cssweb_code"] !== "success") {
                        complete(data["cssweb_code"], data["cssweb_msg"]);
                    } else {
                        complete("", data["item"]);
                    }
                } catch(err) {
                    complete("error", data);
                }
            },
            "error": function(xhr, status, err) {
                console.warn("fail trade request: " + status + "-" + err);
                complete(status, err);
            }
        });
    };

//
// buy with limited price
//
    this.buy = function(market, stockCode, entrustAmount, entrustPrice, complete) {
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "market": market
        };

        return this.sendTradeReq(paramMap, "STOCK_BUY", complete);
    }

// 
// buy with market price
//
    this.buyMp = function(market, stockCode, entrustAmount, entrustPrice, complete, undo) {
        var entrustProp = undo ? "U" : "R";
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": entrustProp,
            "market": market
        };

        return this.sendTradeReq(paramMap, "STOCK_BUY_MP", complete);
    }

//
// sell with limited price
//
    this.sell = function(market, stockCode, entrustAmount, entrustPrice, complete) {
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "market": market
        };

        return this.sendTradeReq(paramMap, "STOCK_SALE", complete);
    }

//
// sell with market price
//
    this.sellMp = function(market, stockCode, entrustAmount, entrustPrice, complete, undo) {
        var entrustProp = undo ? "U" : "R";
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": entrustProp,
            "market": market
        };

        return this.sendTradeReq(paramMap, "STOCK_SALE_MP", complete);
    }

//
// cancel the entrust
//
    this.cancelEntrust = function(entrustNo, complete) {
        var paramMap = {
            "entrust_no": entrustNo
        };

        return this.sendTradeReq(paramMap, "STOCK_CANCEL", complete);
    }

//
// get cancel list
//
// bs_name: "买入"
// business_amount: "0"
// business_price: "0"
// entrust_amount: "100.00"
// entrust_bs: "1"
// entrust_no: "16389"
// entrust_price: "0.620"
// entrust_prop: "0"
// entrust_status: "2"
// entrust_time: "133739"
// exchange_name: "深圳Ａ"
// exchange_type: "2"
// prop_name: "买卖"
// status_name: "已报"
// stock_account: "0191042364"
// stock_code: "159940"
// stock_name: "全指金融"
//
    this.getWithdrawList = function(complete) {
        return this.sendTradeReq({}, "GET_CANCEL_LIST", complete);
    }

//
// get entrust list
//
    this.getEntrustList = function(complete) {
        return this.sendTradeReq({}, "GET_TODAY_ENTRUST", complete);
    }

//
// get trade list
//
    this.getTodayTradeList = function(complete) {
        return this.sendTradeReq({}, "GET_TODAY_TRADE", complete);
    }

//
// get money info
//
    this.getAssetInfo = function(complete) {
        return this.sendTradeReq({}, "GET_FUNDS", complete);
    }

//
// get owned stock info
//
// av_buy_price: "0"
// av_income_balance: "0"
// cost_price: "0.693"
// current_amount: "100.00"
// enable_amount: "0"
// exchange_name: "深圳Ａ"
// exchange_type: "2"
// hand_flag: "0"
// income_balance: "-0.20"
// income_balance_ratio: "-0.29"
// keep_cost_price: "0.693"
// last_price: "0.692"
// market_value: "69.20"
// stock_account: "0191042364"
// stock_code: "159940"
// stock_name: "全指金融"
//
    this.getOwnedStockInfo = function(complete) {
        return this.sendTradeReq(paramMap, "GET_STOCK_POSITION", complete);
    }

// helper function
   var genGetAjaxOption = function(url, complete, dataHandler) {
        return {
            "url": url,
            "success": function(data) {
                try {
                    var stockInfo = data;
                    if (typeof data === "string") {
                        stockInfo = JSON.parse(data);
                    } else {
                        data = JSON.stringify(data);
                    }

                    // console.log(url + ":" + data);
                    var result = stockInfo["cssweb_code"];
                    if (result === "success") {
                        complete("", dataHandler(stockInfo));
                    } else {
                        complete(result, data);
                    }
                } catch (err) {
                    complete("exception", err);
                }
            },
            "error": function(xhr, status, err) {
                console.warn("fail ajax request: " + status + "-" + err);
                complete(status, err);
            },
            "method": "GET"
        }
    };

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
    this.queryTickDetail = function(stockCode, market, from, to, complete) {
        var url = baseHqUrl + stockCode + "/GET_TICK_DETAILNORMAL"
            + "?market=" + market
            + "&from=" + from
            + "&to=" + to,
            option = genGetAjaxOption(url, complete, function(data) {
                return data;
            });

        $.ajax(option);
    }

// get stock tick response:
//
// {
//     "cssweb_code": "success",
//     "type": "GET_TICK",
//     "stockcode": "sz000012",
//     "zqjc": "å?  çŽ»ï¼¡",
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
    this.queryTick = function(stockCode, market, from, complete) {
        var url = baseHqUrl + stockCode + "/GET_TICK"
            + "?market=" + market
            + "&from=" + from,
            option = genGetAjaxOption(url, complete, function(data) {
                return data;
            });

        $.ajax(option);
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
//         "zqjc": "å?  çŽ»ï¼¡",
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
    this.queryStock = function(stockCode, complete) {
        var url = baseHqUrl + stockCode,
                option = genGetAjaxOption(url, complete, function(data) {
                    return data["item"][0];
                });

        $.ajax(option);
    }

}