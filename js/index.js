// initPage.js 
jQuery(function($) {
    var options = loadLoginOption(), huatai, common = {}, tabPages = {};

    if (!options) {
        alert("set the login options first!");
        window.close();
        return;
    }

    huatai = new HuataiAssist(options.username, options.pwd, options.trdpwd, options.hdd, options.ip, options.mac);

    common.renderTableTemplate = function(tableIdSelector, tempSelector, data) {
        var template = $(tempSelector), tempStr = template.html(), htmlOutput = "", htmlItem,
            matches = tempStr.match(/\{\{:[a-zA-Z_0-9:]+\}\}/g),
            tbody = $(tableIdSelector + ">tbody"), param, i, m, keys = [], value;
        if (!data.length) {
            data = [data]
        }

        for (i = 0; i < matches.length; i++) {
            keys[i] = matches[i].slice(3, -2);
        }

        for (i = 0; i < data.length; i++) {
            param = data[i];
            htmlItem = tempStr;
            for (m = 0; m < matches.length; m++) {
                if (keys[m] === ":") {
                    value = param;
                } else if (keys[m] in param) {
                    value = param[keys[m]];
                } else {
                    value = "";
                }

                htmlItem = htmlItem.replace(matches[m], value);
            }

            htmlOutput += htmlItem;
        }

        tbody.html(htmlOutput);
    };

    common.updateStatus = function(err, status) {
        if (err) {
            $("#status").text(err + ":" + status);
        } else {
            $("#status").text("ok");
        }
    };

    common.market = {
        "1": "上证",
        "2": "深证"
    };

    tabPages["#login-page"] = initLoginPage(common, huatai, "#login-page");
    tabPages["#trade-page"] = initTradePage(common, huatai, "#trade-page");
    tabPages["#undo-page"] = initUndoPage(common, huatai, "#undo-page");
    tabPages["#data-page"] = initDataPage(common, huatai, "#data-page");

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
        var panelId = $(e.target).attr("href");
        tabPages[panelId].onShow();
    }).on('hide.bs.tab', function(e) {
        var panelId = $(e.target).attr("href");
        tabPages[panelId].onHide();
    });
});