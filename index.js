// initPage.js 
jQuery(function($) {
    var options = loadLoginOption();
    var form = $("#loginForm");
    if (!options) {
        $(form["login"]).prop("disabled", true);
        $("#loginStatus").text("set the login options first");
        return;
    }

    var captcha = form["captcha"];
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

    $(form["login"]).on("click", null, null, function() {
        var vcode = captcha.value;
        var loginButton = $(this);
        loginButton.prop("disabled", true);
        if (loginButton.val() === "login") {
            huatai.login(vcode, function(jqXHR, status) {
                if (status == "success") {
                    loginButton.val("logout");
                } else {
                    // failed
                    $("#loginStatus").text("login failed!" + status);
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
                    $("#loginStatus").text("logout failed!" + status);
                }
                loginButton.prop("disabled", false);
            });
        }
    });

    $("#captcha").on("click", null, null, function() {
        init();
    });

    var market = {
        "1": "shanghai",
        "2": "shenzhen"
    };

    var startRefresh = function() {
        var code = $("input[name=stockCode]").val();
        var timeout = $("input[name=timeout]").val() * 1000;
        console.log(timeout);

        if (code.length === 6) {
            huatai.queryStock(code, function(err, data) {
                if (err === "") {
                    // successful
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
                    $("#status").text("ok");
                } else {
                    $("#status").text(err + ": " + data);
                }
            });
        }

        if (timeout > 0) {
            setTimeout(startRefresh, timeout);
        }
    };

    startRefresh();
});