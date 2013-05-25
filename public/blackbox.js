hljs.initHighlightingOnLoad();

var WpDebugBar = {

    element: ['globals', 'profiler', 'database', 'errors'],

    open: null,

    switchPanel: function(open) {

        for(var i in WpDebugBar.element) {
            document.getElementById("blackbox-"+WpDebugBar.element[i]).style.display = "none";
        }

        if(open == WpDebugBar.open) {
            WpDebugBar.open = null
            return;
        }

        WpDebugBar.open = open;
        document.getElementById("blackbox-"+open).style.display = "block";
    },

    close: function() {
        document.getElementById("blackbox-web-debug").style.display = "none";
    },

	createCookie: function (name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	},

	readCookie: function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},

	eraseCookie: function(name) {
		createCookie(name,"",-1);
	}

}

jQuery(function($) {
	var DebugBar = $("#blackbox-web-debug");
	DebugBar.find("a.toggle").click(function() {
		var DebugBarToggle = $(this);

		if(DebugBarToggle.hasClass("off")) {
			DebugBarToggle
				.removeClass("off")
				.addClass("on")
				.text("");

			DebugBar
				.addClass("mini")
				.find("> div.debug-panel")
				.hide();

			WpDebugBar.createCookie("bb_toggle", "on");
		} else {
			DebugBarToggle
				.addClass("off")
				.removeClass("on")
				.text("Toggle");
			DebugBar.removeClass("mini");
			WpDebugBar.createCookie("bb_toggle", "off");
		}

		return false;
	});

	$("#bb_query_min_time, #bb_query_filter").keyup(function() {

		var time = parseFloat($("#bb_query_min_time").val());
		var query = $("#bb_query_filter").val();
		var qnum = 0;
		var qtime = 0;

		$("#blackbox-database tr").show();
		$("#blackbox-database tr").each(function() {
			var t = parseFloat($(this).find(".number").text().replace(" [ms]", ""));
			var q = $(this).find(".sql").text().indexOf(query);

			if(time > 0 && query.length > 0 && t < time && q == -1) {
				$(this).hide();
			} else if(time > 0 && t < time) {
				$(this).hide();
			} else if(query.length > 0 && q == -1) {
				$(this).hide();
			} else {
				qnum++;
				qtime += t;
			}
		});

		$(".qnum").text(qnum);
		$(".qtime").text(qtime.toFixed(2));

		WpDebugBar.createCookie("bb_query_filter", query);
		WpDebugBar.createCookie("bb_query_min_time", $("#bb_query_min_time").val());
	});


	// init
	if(WpDebugBar.readCookie("bb_toggle") == "on") {
		$("#blackbox-web-debug a.toggle").click();
	}

	$("#bb_query_filter").val(WpDebugBar.readCookie("bb_query_filter"));
	$("#bb_query_min_time").val(WpDebugBar.readCookie("bb_query_min_time"));

	$("#bb_query_filter").keyup();

	// If the Admin Bar is present, display the debug bar below it, instead of
	// overlapping
	var WPAdminBar = $('#wpadminbar');
	if(WPAdminBar.length > 0) {
		var DebugBarPosition = parseInt(DebugBar.css('top'));
		DebugBar.css('top', DebugBarPosition + WPAdminBar.outerHeight() + 'px');
	}
});
