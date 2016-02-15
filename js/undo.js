function initUndoPage(common, huatai, html) {
	var $html = $(html), tabPage = {};

	function updateEntrustList() {
        huatai.getWithdrawList(function(err, data) {
        	if (!err) {
        		common.renderTableTemplate("#tableUndo", "#tempUndo", data);
        		common.updateStatus(err, "ok")
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