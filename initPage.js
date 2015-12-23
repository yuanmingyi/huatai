// initPage.js
(function() {    
    jQuery(document).ready(function() {
        var options = localStorage["login_options"];
        var form = document.forms[0];
        if (!options) {
            $(form["login"]).prop("disabled", true);
            $("#loginStatus").text("set the login options first");
            return;
        }

        var captcha = form["captcha"];
        var huatai = new HuataiAssit(options.username, options.pwd, options.trdpwd, options.hdd, options.ip, options.mac);

        function init() {
            $("#captcha").attr("src", huatai.getCaptchaUrl());
            chrome.cookies.get({
                "url":huatai.getBaseUrl(),
                "name":"JSESSIONID"
            }, function(cookie) {
                $("#sessionId").text(cookie.value);
                huatai.init(cookie.value);
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
    });
}());