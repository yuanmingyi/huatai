jQuery(function($) {
    var form = $("#auto-form")[0], strategyId = "", logger = loggerBuilder("#strategy-log"), timer;

    huatai.getAvailableStrategies(function(data) {
        for (var i = 0; i < data.length; i++) {
            var strategy_name = data[i];
            $("#auto-strategy-name").append("<option value='" + strategy_name + "'>" + strategy_name + "</option>");
        }
    });

    function startAutoTrade() {
        var stockCode = $(form["stock-code"]).val(), strategy_name = $(form["strategy-name"]).val()
                    toggle = $(form["toggle"]), stockAmount = parseInt($(form["stock-amount"]).val()) * 100,
                    interval = 5, threshold = 0.01;

        toggle.text("stop");
        huatai.startStrategy(strategy_name, stockCode, stockAmount, interval, threshold, function(err, data) {
            if (!!err) {
                alert("start strategy failed: " + data);
                toggle.text("start");
            } else {
                strategyId = data;
                var round = -1;
                console.log("strategy id: " + strategyId);
                timer = setInterval(function() {
                    huatai.getStrategyStatus(strategyId, round, count, function(err, d) {
                        if (!!err) {
                            logger.append(d);
                        } else {
                            result = JSON.parse(d);
                            round = result["end_round"];
                            logger.append(result["log_content"]);
                            if (round == -1) {
                                // the strategy has been stopped
                                clearInterval(timer);
                                toggle.text("start");
                            }
                        }
                    });
                }, interval);
            }
        });
    }

    function stopAutoTrade() {
        huatai.stopStrategy(strategyId, function() {
            //toggle.text("start");
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