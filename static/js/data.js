jQuery(function($) {
	var formStock = $("#stock-form")[0], stockData = null;

    function setStockData(data) {
        stockData = data;
        updateStockStatus(data);
    }

    $(formStock["stock-code"]).on("input", function() {
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
        var code = $(formStock["stock-code"]).val();
        var timeout = $(formStock["timeout"]).val() * 1000;
        if (code.length === 6) {
            huatai.queryStock(code, function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                common.updateStatus(err, data);
            });
        }

        if (timeout > 0) {
            setTimeout(startRefresh, timeout);
        }
    };

    function updateStockStatus(data) {
        $("#stock-name").text(data.zqjc);
        $("#stock-code").text(data.zqdm);
        for (var i = 1; i <= 5; i++) {
            $("#sjw" + i).text(data["sjw" + i]);
            $("#ssl" + i).text(data["ssl" + i]);
            $("#bjw" + i).text(data["bjw" + i]);
            $("#bsl" + i).text(data["bsl" + i]);
        }
        $("#close").text(data.zrsp);
        $("#opening").text(data.jrkp);
        $("#price").text(data.zjcj);
        $("#inc-rate").text(data.zf * 100 + "%");
        $("#volumn").text(data.cjsl);
        $("#high-stop").text(data.zt);
        $("#low-stop").text(data.dt);
        $("#data-market").text(common.market[data.market]);
    };

    startRefresh();
});