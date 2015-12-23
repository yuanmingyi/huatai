// Saves options to localStorage.
function save_options() {
    var username = $("#username").val();
    var pwd = $("#pwd").val();
    var trdpwd = $("#trdpwd").val();
    var hdd = $("#hdd").val();
    var ip = $("#ip").val();
    var mac = $("#mac").val();
    localStorage["login_options"] = {
        "username": username,
        "pwd": pwd,
        "trdpwd": trdpwd,
        "hdd": hdd,
        "ip": ip,
        "mac": mac
    };

    // Update status to let user know options were saved.
    var status = $("#status");
    status.text("Options Saved.");
    setTimeout(function() {
        status.text("");
    }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var options = localStorage["login_options"];
    if (!options) {
        return;
    }
    var form = document.forms[0];
    form["username"].value = options["username"];
    form["pwd"].value = options["pwd"];
    form["trdpwd"].value = options["trdpwd"];
    form["hdd"].value = options["hdd"];
    form["ip"].value = options["ip"];
    form["mac"].value = options["mac"];
}

$.ready(function() {
    console.log("loaded");
    restore_options();
    $("#save_button").click(function() {
        save_options();
    });
});
