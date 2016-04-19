jQuery(function($) {
    var form = $("#auto-form")[0], strategyId = "", logger = loggerBuilder("#strategy-log");

    huatai.getAvailableStrategies(function(data) {
        for (var i = 0; i < data.length; i++) {
            var strategy_name = data[i];
            $("#auto-strategy-name").append("<option value='" + strategy_name + "'>" + strategy_name + "</option>");
        }
    });

    function startAutoTrade() {
        var timer, stockCode = $(form["stock-code"]).val(), strategy_name = $(form["strategy-name"]).val()
                    toggle = $(form["toggle"]), stockAmount = parseInt($(form["stock-amount"]).val()) * 100;

        toggle.text("stop");
        huatai.startStrategy(strategy_name, stockCode, stockAmount, function(err, data) {
            if (!err) {
                strategyId = data;
                console.log(strategyId);
                var jqXhr = huatai.getStrategyStatus(strategyId, function(err, data) {
                    if (err) {
                        common.updateStatus(err, data);
                    }
                    window.clearTimeout(timer);
                });
                timer = setInterval(function() {
                    logger.append(jqXhr.responseText);
                }, 1000);
            } else {
                alert("start strategy failed: " + data);
                toggle.text("start");
            }
        });
    }

    function stopAutoTrade() {
        huatai.stopStrategy(strategyId, function() {
            toggle.text("start");
        });
    }

    $(form["toggle"]).on("click", function() {
        $this = $(this);
        if ($this.text() === "start") {
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