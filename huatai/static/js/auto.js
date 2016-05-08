jQuery(function($) {
    var form = $("#auto-form")[0], strategyId = "", toggle = $(form["toggle"]),
        logger = loggerBuilder("#strategy-log"), timer = null;

    if ($(form["stock-code"]).val().length !== 6) {
        toggle.prop("disabled", true);
    }

    huatai.getAvailableStrategies(function(data) {
        for (var i = 0; i < data.length; i++) {
            var strategy_name = data[i];
            $("#auto-strategy-name").append("<option value='" + strategy_name + "'>" + strategy_name + "</option>");
        }
        refreshStatus();
    });

    function startTimer() {
        var start_id = -1, count = 10;
        return setInterval(function() {
            huatai.getStrategyStatus(strategyId, start_id, count, -1, function(err, d) {
                if (!!err) {
                    logger.append(d);
                } else {
                    result = JSON.parse(d);
                    logs = result["log_content"];
                    start_id = result["end_id"];
                    logger.appendLines(logs);
                    if (result["pid"] == -1) {
                        // the strategy has been stopped
                        toggle.text("start");
                    } else {
                        toggle.text("stop");
                    }
                }
            });
        }, 5000);
    }

    function startAutoTrade() {
        var stockCode = $(form["stock-code"]).val(), strategy_name = $(form["strategy-name"]).val(),
                    stockAmount = parseInt($(form["stock-amount"]).val()) * 100,
                    interval = parseInt($(form["interval"]).val()),
                    threshold = parseFloat($(form["threshold"]).val());

        huatai.startStrategy(strategy_name, stockCode, stockAmount, interval, threshold, function(err, data) {
            if (!!err) {
                alert("start strategy failed: " + data);
            } else {
                strategyId = data;
                console.log("strategy id: " + strategyId);
            }
        });
    }

    function stopAutoTrade() {
        huatai.stopStrategy(strategyId, function() {
            //toggle.text("start");
        });
    }

    function refreshStatus() {
        var stockCode = $(form["stock-code"]).val();
        if (stockCode.length === 6) {
            var strategy_name = $(form["strategy-name"]).val();
            strategyId = strategy_name + stockCode;
            toggle.prop("disabled", false);
            if (!timer) {
                timer = startTimer();
            }
        } else {
            toggle.prop("disabled", true);
        }
    }

    function verifyInput() {
        var stockCode = $(form["stock-code"]).val(),
            stockAmount = $(form["stock-amount"]).val(),
            interval = $(form["interval"]).val(),
            threshold = $(form["threshold"]).val();
        if (isNaN(parseInt(stockCode))) {
            alert('invalid stock code');
            return false;
        }
        if (isNaN(parseInt(stockAmount))) {
            alert('invalid stock amount');
            return false;
        }
        if (isNaN(parseInt(interval))) {
            alert('invalid interval');
            return false;
        }
        if (isNaN(parseFloat(threshold))) {
            alert('invalid threshold');
            return false;
        }
        return true;
    }

    $(form["toggle"]).on("click", function() {
        $this = $(this);
        if ($this.text() === "start") {
            // check input
            if (verifyInput()) {
                startAutoTrade();
            }
        } else {
            stopAutoTrade();
        }
    });

    $(form["stock-code"]).on("input", function() {
        refreshStatus();
    });

    $(form["autoscroll"]).on("click", function() {
        logger.setAutoScroll($(this).prop("checked"));
    });

    $(form["clear"]).on("click", function() {
        logger.clearHistory();
    });

});