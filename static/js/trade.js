jQuery(function($) {
	var timer, formTrade = $("#entrust-form")[0], stockData = null;

    function setStockData(data) {
        stockData = data;
        updateStockStatus(data);
    }

    function updateStockStatus(data) {
        $("#entrust-market").text(common.market[data.market]);
        $(formTrade["market"]).val(data.market);
        if (!formTrade["lock-price"].checked) {
            $(formTrade["entrust-price"]).val(data.zjcj);
        }
    };

    $(formTrade["stock-code"]).on("input", function() {
        var stockCode = $(this);
        if (stockCode.val().length == 6) {
            $(formTrade["entrust"]).prop("disabled", false);
            huatai.queryStock(stockCode.val(), function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                common.updateStatus(err, data);
            });
        } else {
            $(formTrade["entrust"]).prop("disabled", true);
        }
    });

    $(formTrade["entrust"]).submit(function(e) {
        e.preventDefault();
        var func = $(formTrade["entrust-type"]).val(), market, stockCode, stockAmount, price;
        if (!func) {
            alert("invalid entrust type!");
            $(formTrade["entrust-type"]).trigger("focus");
            return;
        }

        market = $(formTrade["market"]).val();
        stockCode = $(formTrade["stock-code"]).val();
        stockAmount = parseInt($(formTrade["entrust-amount"]).val()) * 100;
        price = $(formTrade["entrust-price"]).val();
        huatai[func](market, stockCode, stockAmount, price, function(err, data) {
            //alert(data);
            common.updateStatus(data);
        }, formTrade["undo"].checked);
    }).prop("disabled", true);

    function startRefresh() {
        var code = $(formTrade["stock-code"]).val();
        var timeout = $(formTrade["timeout"]).val() * 1000;
        if (code.length === 6) {
            huatai.queryStock(code, function(err, data) {
                if (!err) {
                    setStockData(data);
                } else {
                    common.updateStatus(err, data);
                }
            });
        }

        huatai.getAssetInfo(function(err, data) {
        	if (!err) {
        		common.renderTableTemplate("#table-fund", "#temp-fund", data);
        	} else {
        		common.updateStatus(err, data);
        	}
        });

        huatai.getOwnedStockInfo(function(err, data) {
        	if (!err) {
        		common.renderTableTemplate("#table-stocks", "#temp-stock", data);
        	} else {
        		common.updateStatus(err, data);
        	}
        });

        if (timeout > 0) {
            setTimeout(startRefresh, timeout);
        }
    };

    startRefresh();
});