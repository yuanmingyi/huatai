function initDataPage(common, huatai, html) {
	var $html = $(html), formStock = $("#stockForm")[0],
        stockData = null, refresh = false, tabPage = {};

    function setStockData(data) {
        stockData = data;
        updateStockStatus(data);
    }

    $(formStock["stockCode"]).on("input", function() {
        var stockCode = $(this);
        if (stockCode.val().length == 6) {
            huatai.queryStock(stockCode.val(), function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                common.updateStatus(err, data);
            });
        }
    });

    function startRefresh() {
        var code = $(formStock["stockCode"]).val();
        var timeout = $(formStock["timeout"]).val() * 1000;
        if (code.length === 6) {
            huatai.queryStock(code, function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                common.updateStatus(err, data);
            });
        }

        if (refresh && timeout > 0) {
            setTimeout(startRefresh, timeout);
        }
    };

    function updateStockStatus(data) {
        $("#stockName").text(data.zqjc);
        $("#stockCode").text(data.zqdm);
        for (var i = 1; i <= 5; i++) {
            $("#sjw" + i).text(data["sjw" + i]);
            $("#ssl" + i).text(data["ssl" + i]);
            $("#bjw" + i).text(data["bjw" + i]);
            $("#bsl" + i).text(data["bsl" + i]);
        }
        $("#close").text(data.zrsp);
        $("#opening").text(data.jrkp);
        $("#price").text(data.zjcj);
        $("#incRate").text(data.zf * 100 + "%");
        $("#volumn").text(data.cjsl);
        $("#highStop").text(data.zt);
        $("#lowStop").text(data.dt);
        $("#data-market").text(common.market[data.market]);
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