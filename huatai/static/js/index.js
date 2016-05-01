var common = {}, huatai = new HuataiAssist();

common.renderTableTemplate = function(tableIdSelector, tempSelector, data) {
    var template = $(tempSelector), tempStr = template.html(), htmlOutput = "", htmlItem,
        matches = tempStr.match(/\[\[:[a-zA-Z_0-9:]+\]\]/g),
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
    var date = new Date().toTimeString();
    if (err) {
        $("#status").text("[" + date + "]" + err + ": " + status);
    } else {
        $("#status").text("[" + date + "] ok");
    }
};

common.market = {
    "1": "上证",
    "2": "深证"
};

jQuery(function($) {
    var page_id = $(".page-id").text();

    function saveForm() {
        var forms = $("form");
        if (forms.length > 0) {
            var form = forms[0];
            var data = {}
            for (var i = 0; i < form.length; i++) {
                data[form[i].name] = form[i].value;
            }
            $.cookie(form.id, JSON.stringify(data));
        }
    }

    function loadForm() {
        var forms = $("form");
        if (forms.length > 0) {
            var form = forms[0];
            var data = $.cookie(form.id);
            if (!!data) {
                var form_data = JSON.parse(data);
                for (var name in form_data) {
                    if (!!name) {
                        form[name].value = form_data[name];
                    }
                }
            }
        }
    }

    $(".nav>li>a").on("click", function() {
        saveForm();
        window.location.href = $(this).attr("link");
    });
    $(".nav>li").removeClass('active');
    $(".nav>li:contains(" + page_id + ")").addClass('active');

    loadForm();
});