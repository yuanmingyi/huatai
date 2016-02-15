function initTradePage(common, huatai, html) {
	var timer, $html = $(html), formTrade = $html.find("#tradeForm")[0], tabPage = {},
		stockData = null, refresh = false;

    function setStockData(data) {
        stockData = data;
        updateStockStatus(data);
    }

    $(formTrade["stockCode"]).on("input", function() {
        var stockCode = $(this);
        if (stockCode.val().length == 6) {
            $(formTrade["trade"]).prop("disabled", false);
            huatai.queryStock(stockCode.val(), function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                common.updateStatus(err, data);
            });
        } else {
            $(formTrade["trade"]).prop("disabled", true);
        }
    });

    $(formTrade["trade"]).on("click", function() {
        var func = $(formTrade["tradeType"]).val();
        if (!func) {
            alert("invalid trade type!");
            $(formTrade["tradeType"]).trigger("focus");
            return;
        }
        huatai[func]($(formTrade["market"]).val(), $(formTrade["stockCode"]).val(), $(formTrade["tradeAmount"]).val(), $(formTrade["tradePrice"]).val(), function(err, data) {
            //alert(data);
            common.updateStatus(err, data);
        }, formTrade["undo"].checked);
    }).prop("disabled", true);

    function startRefresh() {
        var code = $(formTrade["stockCode"]).val();
        var timeout = $(formTrade["timeout"]).val() * 1000;
        if (code.length === 6) {
            huatai.queryStock(code, function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                common.updateStatus(err, data);
            });
        }

        huatai.getAssetInfo(function(err, data) {
        	if (!err) {
        		common.renderTableTemplate("#tableFund", "#tempFund", data);
        		common.updateStatus(err, "ok")
        	} else {
        		common.updateStatus(err, data);
        	}
        });

        huatai.getOwnedStockInfo(function(err, data) {
        	if (!err) {
        		common.renderTableTemplate("#tableStocks", "#tempStock", data);
        		common.updateStatus(err, "ok");
        	} else {
        		common.updateStatus(err, data);
        	}
        });

        if (refresh && timeout > 0) {
            setTimeout(startRefresh, timeout);
        }
    };

    function updateStockStatus(data) {
        $html.find("#tradeMarketName").text(common.market[data.market]);
        $(formTrade["market"]).val(data.market);
        if (!formTrade["lockPrice"].checked) {
            $(formTrade["tradePrice"]).val(data.zjcj);
        }
    };

    tabPage.onShow = function() {
    	refresh = true;
    	startRefresh();
    };

    tabPage.onHide = function() {
    	refresh = false;
    };

    return tabPage;
}