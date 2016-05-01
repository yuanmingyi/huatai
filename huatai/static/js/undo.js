jQuery(function($) {
    function updateEntrustList() {
        huatai.getWithdrawList(function(err, data) {
            if (!err) {
                common.renderTableTemplate("#table-undo", "#temp-undo", data);
                common.updateStatus(err, "ok");
                $("#table-undo a").each(function(index) {
                    var $this = $(this), entrustNo = $this.attr("id").slice(11),
                                entrustStatus = $this.attr("data-status");
                    if (entrustNo === "") {
                        $this.hide();
                    } else {
                        $this.on("click", function(e) {
                            huatai.cancelEntrust(entrustNo, function(err, data) {
                                if (!err) {
                                    alert("success!");
                                } else {
                                    alert(err + ": " + data);
                                }
                                updateEntrustList();
                            });
                        });
                    }
                });
            } else {
                common.updateStatus(err, data);
            }
        });
    }

    updateEntrustList();
});