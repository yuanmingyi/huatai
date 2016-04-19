/**
 * Created by millan on 12/19/2015.
 */

function HuataiAssist() {
    var loginUrl = "/api/login";
    var captchaUrl = "/api/captcha";
    var baseTradeUrl = "/api/trade/";
    var baseHqUrl = "/api/hq/";
    var baseAutoUrl = "/api/auto/";
    var allStrategiesUrl = "/api/strategies";

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

    this.getLoginStatus = function(callback) {
        $.ajax({
            "url": loginUrl,
            "data": "",
            "method": "GET",
            "success": callback
        });
    }
//
//  ajax methods
//

    this.sendTradeReq = function(paramMap, reqType, funcId, exType, complete) {
        var querystring = "?cssweb_type=" + reqType
            + "&function_id=" + funcId
            + "&exchange_type=" + exType, url;

        for (key in paramMap) {
            if (paramMap.hasOwnProperty(key)) {
                querystring += "&" + key + "=" + paramMap[key];
            }
        }

        url = baseTradeUrl + querystring;
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
            "entrust_prop": 0,
            "entrust_bs": 1
        };

        return this.sendTradeReq(paramMap, "STOCK_BUY", "302", market, complete);
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
            "entrust_bs": 1
        };

        return this.sendTradeReq(paramMap, "STOCK_BUY_MP", "302", market, complete);
    }

//
// sell with limited price
//
    this.sell = function(market, stockCode, entrustAmount, entrustPrice, complete) {
        var paramMap = {
            "stock_code": stockCode,
            "entrust_amount": entrustAmount,
            "entrust_price": entrustPrice,
            "entrust_prop": 0,
            "entrust_bs": 2
        };

        return this.sendTradeReq(paramMap, "STOCK_SALE", "302", market, complete);
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
            "entrust_bs": 2
        };

        return this.sendTradeReq(paramMap, "STOCK_SALE_MP", "302", market, complete);
    }

    function marketToExchange(market) {
        return (market === 1 ? "sh" : "sz");
    }

//
// cancel the entrust
//
    this.cancelEntrust = function(entrustNo, complete) {
        var paramMap = {
            "batch_flag": 0,
            "entrust_no": entrustNo
        };

        return this.sendTradeReq(paramMap, "STOCK_CANCEL", "304", "", complete);
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
        var paramMap = {
            "stock_code": "",
            "locate_entrust_no": "",
            "query_direction": "",
            "sort_direction": 0,
            "request_num": 100,
            "position_str": ""
        };

        return this.sendTradeReq(paramMap, "GET_CANCEL_LIST", "401", "", complete);
    }

//
// get entrust list
//
    this.getEntrustList = function(complete) {
        var paramMap = {
            "stock_code": "",
            "locate_entrust_no": "",
            "query_direction": "",
            "sort_direction": 0,
            "request_num": 100,
            "position_str": ""
        };

        return this.sendTradeReq(paramMap, "GET_TODAY_ENTRUST", "401", "", complete);
    }

//
// get trade list
//
    this.getTodayTradeList = function(complete) {
        var paramMap = {
            "stock_code": "",
            "serial_no": "",
            "query_direction": "",
            "request_num": 100,
            "query_mode": 0,
            "position_str": ""
        };

        return this.sendTradeReq(paramMap, "GET_TODAY_TRADE", "402", "", complete);
    }

//
// get money info
//
    this.getAssetInfo = function(complete) {
        var paramMap = {
            "money_type": ""
        };

        return this.sendTradeReq(paramMap, "GET_FUNDS", "405", "", complete);
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
        var paramMap = {
            "stock_code": "",
            "query_direction": "",
            "query_mode": 0,
            "request_num": 100,
            "position_str": ""
        };

        return this.sendTradeReq(paramMap, "GET_STOCK_POSITION", "403", "", complete);
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
        var exchange = marketToExchange(market);
        var url = baseHqUrl
            + "?type=GET_TICK_DETAILNORMAL&exchange=" + exchange
            + "&stockcode=" + stockCode
            + "&from=" + from
            + "&to=" + to
            + "&radom=" + Math.random();

        var option = genGetAjaxOption(url, complete, function(data) {
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
        var exchange = marketToExchange(market);
        var url = baseHqUrl
            + "?type=GET_TICK&exchange=" + exchange
            + "&stockcode=" + stockCode
            + "&from=" + from
            + "&radom=" + Math.random();

        var option = genGetAjaxOption(url, complete, function(data) {
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
        var url = baseHqUrl
            + "?type=GET_PRICE_VOLUMEJY^cssweb_type=GET_HQ_B^stockcode="
            + stockCode
            + "^"
            + Math.random();

        var option = genGetAjaxOption(url, complete, function(data) {
            return data["item"][0];
        });

        $.ajax(option);
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
//         "zqjc": "ä¸­å›½å®å®‰",
//         "tp": 0,
//         "fullprice": 0.000000,
//         "np": 288022.000000,
//         "wp": 205247.000000
//     }]
// }
    this.queryDetail = function(stockCode, stockType, market, complete) {
        var exchange = marketToExchange(market);
        var url = baseHqUrl
            + "?type=GET_PRICE_VOLUMEJSON&exchange=" + exchange
            + "&stockcode=" + stockCode
            + "&stocktype=" + stockType
            + "&radom=" + Math.random();

        var option = genGetAjaxOption(url, complete, function(data) {
            return data["data"][0];
        });

        $.ajax(option);
    }

    this.startStrategy = function(strategyName, stockCode, stockAmount, callback) {
        var url = baseAutoUrl + strategyName;
        $.ajax({
            "url": url,
            "method": "POST",
            "dataType": "json",
            "data": { "stock_code": stockCode, "amount": stockAmount },
            "success": function(data) {
                var status = data["code"], strategyId = data["strategy_id"];
                callback(status, strategyId);
            }
        });
    }

    this.stopStrategy = function(strategyId, callback) {
        var url = baseAutoUrl + strategyId;
        $.ajax({
            "url": url,
            "method": "DELETE",
            "dataType": "json",
            "success": function(data) {
                var status = data["code"];
                callback(status);
            }
        });
    }

    this.getStrategyStatus = function(strategyId, callback) {
        var url = baseAutoUrl + strategyId;
        return $.ajax({
            "url": url,
            "method": "GET",
            "complete": function(jqXhr, textStatus) {
                callback(textStatus === "success" ? "" : textStatus, jqXhr.responseText);
            }
        });
    }

    this.getRunningStrategies = function(callback) {
        $.ajax({
            "url": baseAutoUrl,
            "method": "GET",
            "dataType": "json",
            "success": function(data) {
                console.log(data)
                callback(data);
            }
        });
    }

    this.getAvailableStrategies = function(callback) {
        $.ajax({
            "url": allStrategiesUrl,
            "method": "GET",
            "dataType": "json",
            "success": function(data) {
                console.log(data)
                callback(data);
            }
        });
    }
}