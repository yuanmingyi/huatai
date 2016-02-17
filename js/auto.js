function initAutoPage(common, huatai, html) {
	var $html = $(html), refresh = false, form = $html.find("#autoForm")[0],
            logger = loggerBuilder("#strategy-log"), tabPage = {}, round = 0;

	function startRefresh() {
        var timeout = $(form["timeout"]).val() * 1000, stockCode = $(form["stockCode"]).val(),
                    stockAmount = parseInt($(form["stockAmount"]).val()) * 100;

        logger.setExtInfo("Round " + ++round);
        strategy1(huatai, logger, stockCode, stockAmount);

        if (refresh) {
            setTimeout(startRefresh, timeout);
        }
	}

    function strategy1(tradeEngine, logger, stockCode, stockAmount) {
        tradeEngine.getWithdrawList(function(err, data) {
            var item = "", price;

            if (err) {
                logger.error("get withdraw list failed: " + data);
                return;
            }

            for (i = 0; i < data.length; i++) {
                if ("stock_code" in data[i] && data[i]["bs_name"] === "买入" && data[i]["stock_code"] == stockCode
                    && data[i]["entrust_status"] == "2") {
                    item = data[i];
                    price = parseFloat(item["entrust_price"]);
                    logger.info("get last buy entrust: " + item["entrust_no"] +
                        "; price=" + price + "; amount=" + stockAmount + "; entrust_status=" + item["entrust_status"]);
                    break;
                }
            }

            tradeEngine.queryStock(stockCode, function(err, data) {
                if (err) {
                    logger.error("query stock info failed: " + data);
                    return;
                }

                logger.info("buy1: " + data["bjw1"] + "; vol1: " + data["bsl1"] + "; sell1: " + data["sjw1"]);
                var bjw1 = data["bjw1"], market = data["market"];
                if (item && bjw1 === price && data["bsl1"] <= stockAmount / 100) {
                    bjw1 = data["bjw2"];
                    logger.warn("buy1=" + bjw1);
                }

                if (data["sjw1"] - bjw1 < 0.01) {
                    logger.warn("sell1 - buy1 < 0.01. cancel the entrust");
                    if (item) {
                        tradeEngine.cancelEntrust(item["entrust_no"], function(err, data) {
                            if (err) {
                                logger.error("cancel entrust failed: " + data);
                            } else {
                                logger.info("cancel entrust success!");
                            }
                        });
                    }

                    return;
                }

                logger.info("sell1 - buy1 >= 0.01");
                if (!item) {
                    logger.info("do buy entrust");
                    tradeEngine.buy(market, stockCode, stockAmount, bjw1 + 0.001, function(err, data) {
                        if (err) {
                            logger.error("buy stock failed: " + data);
                        } else {
                            logger.info("buy stock success!");
                        }
                    });
                    return;
                } 

                if (item["entrust_price"] != bjw1 + 0.001) {
                    logger.info("entrust price != buy1 + 0.001. cancel and redo the entrust");
                    tradeEngine.cancelEntrust(item["entrust_no"], function(err, data) {
                        if (err) {
                            logger.error("cancel entrust failed: " + data);
                        } else {
                            logger.info("cancel entrust success!")
                        }

                        tradeEngine.buy(market, stockCode, stockAmount, bjw1 + 0.001, function(err, data) {
                            if (err) {
                                logger.error("buy stock failed: " + data);    
                            } else {
                                logger.info("buy stock success!");
                            }
                        });
                    });
                }
            });
        });
        
    }

    function disableInput(disabled) {
        $(form["stockCode"]).prop("disabled", disabled);
        $(form["stockAmount"]).prop("disabled", disabled);
        $(form["timeout"]).prop("disabled", disabled);
    }

    $(form["toggle"]).on("click", function() {
        refresh = !refresh;
        if (refresh) {
            // check input
            $(this).text("stop");
            disableInput("disabled");
            startRefresh();
        } else {
            $(this).text("start");
            disableInput(false);
        }
    });

    $(form["autoscroll"]).on("click", function() {
        logger.setAutoScroll($(this).prop("checked"));
    });

    $(form["clear"]).on("click", function() {
        logger.clearHistory();
    });

    tabPage.onShow = function() {
    };

    tabPage.onHide = function() {
    };

    return tabPage;
}