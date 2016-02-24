jQuery(function($) {
	var refresh = false, form = $("#auto-form")[0], strategyId = "", logger = loggerBuilder("#strategy-log");

	function startAutoTrade() {
        var timeout = $(form["timeout"]).val() * 1000, stockCode = $(form["stock-code"]).val(),
                    toggle = $(form["toggle"]), stockAmount = parseInt($(form["stock-amount"]).val()) * 100;

        toggle.text('stop');
        refresh = true;
        huatai.startStrategy(stockCode, stockAmount, function(err, data) {
            if (!err) {
                strategyId = data;
                startRefresh();
            } else {
                toggle.text('start');
                refresh = false;
            }
        });
	}

    function startRefresh() {
        huatai.getStrategyStatus(strategyId, function(err, data) {
            if (!err) {
                logger.append(data);
            } else {
                common.updateStatus(err, data);
            }

            if (refresh) {
                setTimeout(startRefresh, timeout);
            }
        });
    }

    function stopAutoTrade() {
        huatai.stopStrategy(strategyId);
    }

    $(form["toggle"]).on("click", function() {
        $this = $(this);
        if ($this.text() == "stop") {
            // check input
            startAutoTrade();
        } else {
            stopAutoTrade();
        }
    });

    $(form["autoscroll"]).on("click", function() {
        logger.setAutoScroll($(this).prop("checked"));
    });

    $(form["clear"]).on("click", function() {
        logger.clearHistory();
    });
});