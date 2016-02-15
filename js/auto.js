function initAutoPage(common, huatai, html) {
	var tabPage = {};

	function startRefresh() {

	}

    tabPage.onShow = function() {
        refresh = true;
        startRefresh();
    };

    tabPage.onHide = function() {
        refresh = false;
    };

    return tabPage;
}