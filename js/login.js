function initLoginPage(common, huatai, html) {
	var $html = $(html), formLogin = $html.find("#loginForm")[0], captcha = formLogin["captcha"], tabPage = {};

    function init() {
        chrome.cookies.get({
            "url":huatai.getBaseUrl(),
            "name":"JSESSIONID"
        }, function(cookie) {
            $html.find("#sessionId").text(cookie.value);
            huatai.init(cookie.value);
            $html.find("#captcha").attr("src", huatai.getCaptchaUrl());
            huatai.loadUserData(function(err, data) {
                if (!err) {
                    $(formLogin["login"]).text("logout");
                }
            });
        });
    }

    init();

    $html.find("#captcha").on("click", null, null, function() {
        init();
    });

    $(formLogin["login"]).on("click", function() {
        var vcode = captcha.value;
        var loginButton = $(this);
        loginButton.prop("disabled", true);
        if (loginButton.text() === "login") {
            huatai.login(vcode, function(jqXHR, status) {
                if (status === "success") {
                    loginButton.text("logout");
                    huatai.loadUserData(function(err, data) {
                        if (!err) {
                            common.updateStatus("user data: ", JSON.stringify(data));
                        } else {
                            common.updateStatus(err, data);
                        }
                    });
                }

                common.updateStatus("login ", status);
                loginButton.prop("disabled", false);
            });
        } else {
            huatai.logout(function(jqXHR, status) {
                if (status === "success") {
                    loginButton.text("login");
                    init();
                }

                common.updateStatus("login ", status);
                loginButton.prop("disabled", false);
            });
        }
    });

    tabPage.onShow = function() {

    };

    tabPage.onHide = function() {

    };

    return tabPage;
}