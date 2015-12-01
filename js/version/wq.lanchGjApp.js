define('wq.lanchGjApp', function(require, exports, module) {
	var __cacheThisModule__;
	var $ = require('zepto');

	function getEnv() {
		var _ua = navigator.userAgent.toLowerCase();
		if (!/mobile|android/.test(_ua)) {
			return "pc";
		} else {
			if (/micromessenger(\/[\d\.]+)*/.test(_ua)) {
				return "weixin";
			} else if (/qq\/(\/[\d\.]+)*/.test(_ua) || /qzone\//.test(_ua)) {
				return "qq";
			} else {
				return "h5";
			}
		}
	}

	function getOs() {
		var u = navigator.userAgent,
			browser = {
				versions: {
					trident: u.indexOf('Trident') > -1,
					presto: u.indexOf('Presto') > -1,
					webKit: u.indexOf('AppleWebKit') > -1,
					gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
					mobile: !!u.match(/AppleWebKit.*Mobile.*/),
					ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
					android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
					iPhone: u.indexOf('iPhone') > -1,
					iPad: u.indexOf('iPad') > -1,
					webApp: u.indexOf('Safari') == -1
				},
				language: (navigator.browserLanguage || navigator.language).toLowerCase()
			};
		return browser;
	}

	function compareVersion(a, b) {
		a = String(a).split('.');
		b = String(b).split('.');
		try {
			for (var i = 0, len = Math.max(a.length, b.length); i < len; i++) {
				var l = isFinite(a[i]) && Number(a[i]) || 0,
					r = isFinite(b[i]) && Number(b[i]) || 0;
				if (l < r) {
					return -1;
				} else if (l > r) {
					return 1;
				}
			}
		} catch (e) {
			return -1;
		}
		return 0;
	}

	function lanchGjApp(obj) {
		var option = {
			wx_dest_view: '65537',
			wx_show_id: '2015082616163401116',
			wx_show_channel: '',
			sq_dest_view: 'mobileqq',
			sq_show_id: '2015082616165801153',
			sq_show_channel: '',
			onSuccess: function() {}
		}
		for (var i in obj) {
			option[i] = obj[i];
		}
		var nowOs = getOs();
		if (nowOs.versions.android) {
			var nowenv = getEnv();
			if (nowenv == "weixin") {
				if (typeof WeixinJSBridge === "undefined") {
					if (document.addEventListener) {
						document.addEventListener('WeixinJSBridgeReady', function() {
							onWxBridgeReady(option)
						}, false);
					}
				} else {
					onWxBridgeReady(option);
				}
			} else if (nowenv == "qq" && mqq) {
				mqq.app.isAppInstalled("com.tencent.qqpimsecure", function(result) {
					if (result) {
						mqq.app.checkAppInstalled("com.tencent.qqpimsecure", function(ret) {
							if (compareVersion(ret, '5.7') >= 0) {
								var iframe = $('<iframe src="tcsecure://com.tencent.qqpimsecure/call_at_bg/' + option.sq_dest_view + '/' + option.sq_show_id + '/' + option.sq_show_channel + '" style="display: none;"></iframe>');
								$("body").append(iframe);
								option.onSuccess();
							} else {}
						});
					} else {}
				});
			}
		}
	}

	function onWxBridgeReady(option) {
		WeixinJSBridge.invoke("getInstallState", {
			"packageName": "com.tencent.qqpimsecure"
		}, function(res) {
			if (res.err_msg != 'get_install_state:no') {
				var version = res.err_msg.replace('get_install_state:yes_', '');
				if (version > 1065) {
					var iframe = $('<iframe src="tcsecure://com.tencent.qqpimsecure/call_at_bg/' + option.wx_dest_view + '/' + option.wx_show_id + '/' + option.wx_show_channel + '" style="display: none;"></iframe>');
					$("body").append(iframe);
					option.onSuccess();
				} else {}
			} else {}
		});
	}
	exports.lanchGjApp = lanchGjApp;
});