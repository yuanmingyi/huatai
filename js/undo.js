function initUndoPage(common, huatai, html) {
	var $html = $(html), tabPage = {};

	function updateEntrustList() {
        huatai.getWithdrawList(function(err, data) {
        	if (!err) {
        		common.renderTableTemplate("#tableUndo", "#tempUndo", data);
        		common.updateStatus(err, "ok");
        		$html.find("#tableUndo a").each(function(index) {
        			var $this = $(this), entrustNo = $this.attr("id").slice(11), entrustStatus = $this.attr("data-status");
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
	};

	tabPage.onShow = function() {
		updateEntrustList();
	};

	tabPage.onHide = function() {

	};

	return tabPage;
}