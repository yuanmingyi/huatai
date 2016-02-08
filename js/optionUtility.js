/**
 * Created by millan on 12/24/2015.
 */
(function(win) {
    var loginKey = "login_options";

    function loadOption(key) {
        var option_str = localStorage[key];
        if (!option_str) {
            return null;
        }

        try {
            return JSON.parse(option_str);
        } catch (e) {
            console.log(e + ";" + option_str);
            return null;
        }
    }

    win.loadLoginOption = function() {
        return loadOption(loginKey);
    };

    win.saveLoginOption = function(option) {
        var option_str = JSON.stringify(option);
        localStorage[loginKey] = option_str;
    }

})(window);