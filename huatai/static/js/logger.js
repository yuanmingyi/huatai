function loggerBuilder(domOrSelector) {
    var con = $(domOrSelector), extInfo = "", autoScroll = false;

    function htmlEncode(value) {
        return $('<div/>').text(value).html();
    }

    function htmlDecode(value) {
        return $('<div/>').html(value).text();
    }

    function log(level, text) {
        var date = new Date().toTimeString(), output,
            prefix = "<span class=\"" + level + "\">[" + date + " " + level.toUpperCase() + "]";
        if (extInfo !== "") {
            prefix = prefix + "[" + extInfo + "]";
        }

        output = prefix + ": " + htmlEncode(text) + "</span><br/>";
        con.html(con.html() + output);
        if (autoScroll) {
            con.scrollTop(con[0].scrollHeight);
        }
    }

    return {
        "setAutoScroll": function(autoscroll) {
            autoScroll = autoscroll;
        },
        "clearHistory": function() {
            con.scrollTop(0);
            con.html("");
        },
        "setExtInfo": function(extinfo) {
            extInfo = extinfo;
        },
        "info": function(text) {
            log("info", text);
        },
        "warn": function(text) {
            log("warn", text);
        },
        "error": function(text) {
            log("error", text);
        },
        "append": function(text) {
            con.html(con.html() + text);
            if (autoScroll) {
                con.scrollTop(con[0].scrollHeight);
            }
        },
        "appendLogs": function(text) {
            this.append(text.replace(/\n/g,'<br>'));
        }
    }
}