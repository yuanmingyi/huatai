jQuery(function($) {
	var formLogin = $("#login-form")[0], captcha = formLogin["captcha"];

    function init() {
        $("#captcha").attr("src", huatai.getCaptchaUrl());
        huatai.getLoginStatus(function(data) {
            $("#login-status").text(data);
        });
    }

    init();

    $("#refresh").on("click", null, null, function() {
        init();
    });

    $("#captcha-text").on("keydown", function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            $(formLogin["login"]).trigger("click");
        }
    });

    $(formLogin["login"]).submit(function(e) {
        e.preventDefault();
        var vcode = captcha.value;
        var loginButton = $(this);
        loginButton.prop("disabled", true);
        if (loginButton.text() === "login") {
            huatai.login(vcode, function(jqXHR, status) {
                common.updateStatus("login", status);
                init();
                loginButton.prop("disabled", false);
            });
        }
    });
});