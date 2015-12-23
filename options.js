// Saves options to localStorage.
function save_options() {
    console.log("save options");
    var options = {
        "username": $("#username").val(),
        "pwd": $("#pwd").val(),
        "trdpwd": $("#trdpwd").val(),
        "hdd": $("#hdd").val(),
        "ip": $("#ip").val(),
        "mac": $("#mac").val()
    };

    saveLoginOption(options);

    // Update status to let user know options were saved.
    var status = $("#status");
    status.text("Options Saved.");
    setTimeout(function() {
        status.text("");
    }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var options = loadLoginOption();
    if (!options) {
        return;
    }

    $("#username").val(options["username"]);
    $("#pwd").val(options["pwd"]);
    $("#trdpwd").val(options["trdpwd"]);
    $("#hdd").val(options["hdd"]);
    $("#ip").val(options["ip"]);
    $("#mac").val(options["mac"]);
}

$(document).ready(function() {
    console.log("loaded");
    restore_options();
    $("#save_button").click(function() {
        save_options();
    });
});
