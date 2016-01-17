// initPage.js 
jQuery(function($) {
    var options = loadLoginOption();
    var formLogin = $("#loginForm")[0];
    if (!options) {
        $(formLogin["login"]).prop("disabled", true);
        $("#status").text("set the login options first");
        return;
    }

    var captcha = formLogin["captcha"];
    var huatai = new HuataiAssist(options.username, options.pwd, options.trdpwd, options.hdd, options.ip, options.mac);

    function init() {
        chrome.cookies.get({
            "url":huatai.getBaseUrl(),
            "name":"JSESSIONID"
        }, function(cookie) {
            if (!cookie || !cookie.value) {
                $("#huataiLink").attr("href", huatai.getHqUrl()).text("open website");
                return;
            }

            $("#sessionId").text(cookie.value);
            huatai.init(cookie.value);
            $("#captcha").attr("src", huatai.getCaptchaUrl());
        });
    }

    init();

    $("#captcha").on("click", null, null, function() {
        init();
    });

    $(formLogin["login"]).on("click", function() {
        var vcode = captcha.value;
        var loginButton = $(this);
        loginButton.prop("disabled", true);
        if (loginButton.val() === "login") {
            huatai.login(vcode, function(jqXHR, status) {
                if (status == "success") {
                    loginButton.val("logout");
                } else {
                    // failed
                    $("#status").text("login failed!" + status);
                }
                loginButton.prop("disabled", false);
            });
        } else {
            huatai.logout(function(jqXHR, status) {
                if (status === "success") {
                    loginButton.val("login");
                    init();
                } else {
                    // failed
                    $("#status").text("logout failed!" + status);
                }
                loginButton.prop("disabled", false);
            });
        }
    });

    /// entrust section
    var market = {
        "1": "shanghai",
        "2": "shenzhen"
    };
    var formTrade = $("#tradeForm")[0];

    var stockData = null;
    function setStockData(data) {
        stockData = data;
        updateUI(data);
    }

    $(formTrade["stockCode"]).on("input", function() {
        var stockCode = $(this);
        if (stockCode.val().length == 6) {
            huatai.queryStock(stockCode.val(), function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                updateStatus(err, data);
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
            alert(data);
            updateStatus(err, data);
        }, formTrade["undo"].checked);
    }).prop("disabled", true);

    var startRefresh = function() {
        var code = $(formTrade["stockCode"]).val();
        var timeout = $(formTrade["timeout"]).val() * 1000;
        if (code.length === 6) {
            huatai.queryStock(code, function(err, data) {
                if (!err) {
                    setStockData(data);
                }
                updateStatus(err, data);
            });
        }

        if (timeout > 0) {
            setTimeout(startRefresh, timeout);
        }
    };

    startRefresh();

    var updateUI = function(data) {
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
        $("#market").text(market[data.market]);
        $(formTrade["market"]).val(data.market);
        if (!formTrade["lockPrice"].checked) {
            $(formTrade["tradePrice"]).val(data.zjcj);
        }
        $(formTrade["trade"]).prop("disabled", false);
    };

    var updateStatus = function(err, status) {
        if (err) {
            $("#status").text(err + ":" + status);
        } else {
            $("#status").text("ok");
        }
    };
});