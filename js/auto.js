function initAutoPage(common, huatai, html) {
	var $html = $(html), refresh = false, form = $html.find("#autoForm")[0], tabPage = {};

	function startRefresh() {
        var timeout = $(form["timeout"]).val() * 1000, stockCode = $(form["stockCode"]).val(),
                    stockAmount = $(form["stockAmount"]).val();

        strategy1(huatai, common, stockCode, stockAmount);

        if (refresh) {
            setTimeout(startRefresh, timeout);
        }
	}

    function strategy1(tradeEngine, errorLogger, stockCode, stockAmount) {
        tradeEngine.getWithdrawList(function(err, data) {
            var item = "";

            if (err) {
                errorLogger.updateStatus(err, data);
                return;
            }

            errorLogger.updateStatus("ok");

            for (i = 0; i < data.length; i++) {
                if (data[i]["bs_name"] === "买入" && data[i]["stock_code"] == stockCode
                    && parseFloat(data[i]["entrust_amount"]) === parseFloat(stockAmount) && data[i]["entrust_status"] == 2) {
                    item = data[i];
                    break;
                }
            }

            tradeEngine.queryStock(stockCode, function(err, data) {
                if (err) {
                    errorLogger.updateStatus(err, data);
                    return;
                }

                var bjw1 = parseFloat(data["bjw1"]), market = data["market"];
                if (item && bjw1 == item["entrust_price"] && data["bsl1"] <= stockAmount) {
                    bjw1 = data["bjw2"];
                }

                if (data["sjw1"] - bjw1 < 0.01) {
                    if (item) {
                        tradeEngine.cancelEntrust(item["entrust_no"], function(err, data) {
                            if (err) {
                                errorLogger.updateStatus(err, data);
                            }
                        });    
                    }

                    return;
                }

                if (!item) {
                    tradeEngine.buy(market, stockCode, stockAmount, bjw1 + 0.001, function() {});
                    return;
                } 

                if (item["entrust_price"] != bjw1 + 0.001) {
                    tradeEngine.cancelEntrust(item["entrust_no"], function(err, data) {
                        tradeEngine.buy(market, stockCode, stockAmount, bjw1 + 0.001, function() {});
                    });
                }
            });    
        }
        
    }

    function disableInput(disabled) {
        $(form["stockCode"]).prop("disabled", disabled);
        $(form["stockAmount"]).prop("disabled", disabled);
        $(form["timeout"]).prop("disabled", disabled);
    }

    tabPage.onShow = function() {
        $(form["toggle"]).on("click", function() {
            refresh = !refresh;
            if (refresh) {
                // check input
                disableInput("disabled");
                startRefresh();
            } else {
                disableInput(false);
            }
        });
    };

    tabPage.onHide = function() {
    };

    return tabPage;
}