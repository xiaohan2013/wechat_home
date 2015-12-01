define('mqqStorage', function(require, exports, module) {
	var _cacheThisModule_;
	var isInQQ = ((/qq\/([\d\.]+)*/).test(navigator.userAgent)),
		supportDataApi = isInQQ && mqq.compare("4.6") >= 0,
		cfg = {
			prefix: "$lc_",
			expire: 1440,
			callId: 1,
			path: "wanggouH5data"
		};

	function writeH5Data(key, data, callback, exp) {
		try {
			var now = new Date(),
				myKey = cfg.prefix + key,
				callback = callback ? callback : empty(),
				myData = JsonToStr({
					value: data,
					expire: now.setMinutes(now.getMinutes() + (exp || cfg.expire))
				});
			if (supportDataApi) {
				mqq.data.writeH5Data({
					callid: cfg.callId,
					path: cfg.path,
					key: myKey,
					data: myData
				}, function(res) {
					callback(res.ret == 0);
				});
			} else {
				sessionStorage.setItem(myKey, myData);
				callback(true);
			}
		} catch (e) {
			callback(false);
		}
	};

	function readH5Data(key, callback) {
		try {
			var myKey = cfg.prefix + key;
			callback = callback ? callback : empty();
			if (supportDataApi) {
				mqq.data.readH5Data({
					callid: cfg.callId,
					path: cfg.path,
					key: myKey
				}, function(res) {
					if (res.ret != 0) {
						callback(null, false);
						return;
					}
					var d = StrToJson(res.response.data),
						now = new Date();
					if (!d) {
						callback(null, false);
						return;
					}
					if (d.expire > now.getTime()) {
						callback(d.value, true);
					} else {
						mqq.data.deleteH5Data({
							callid: cfg.callId,
							path: cfg.path,
							key: myKey
						});
						callback(null, false);
					}
				});
			} else {
				var d = getStorageObj(myKey);
				callback(d ? d.value : null, d ? true : false);
			}
		} catch (e) {
			callback(null, false);
		}
	};

	function deleteH5Data(key, callback) {
		try {
			var myKey = cfg.prefix + key;
			callback = callback ? callback : empty();
			if (supportDataApi) {
				mqq.data.deleteH5Data({
					callid: cfg.callId,
					path: cfg.path,
					key: myKey
				}, function(res) {
					callback(res.ret == 0);
				});
			} else {
				sessionStorage.removeItem(key);
				callback(true);
			}
		} catch (e) {
			callback(false);
		}
	};

	function JsonToStr(o) {
		if (o == undefined) {
			return "";
		}
		if (JSON && JSON.stringify) {
			return JSON.stringify(o);
		} else {
			var r = [];
			if (typeof o == "string") return "\"" + o.replace(/([\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
			if (typeof o == "object") {
				if (!o.sort) {
					for (var i in o)
						r.push("\"" + i + "\":" + JsonToStr(o[i]));
					if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
						r.push("toString:" + o.toString.toString());
					}
					r = "{" + r.join() + "}"
				} else {
					for (var i = 0; i < o.length; i++)
						r.push(JsonToStr(o[i]))
					r = "[" + r.join() + "]";
				}
				return r;
			}
			return o.toString().replace(/\"\:/g, '":""');
		}
	}

	function StrToJson(str) {
		try {
			if (JSON && JSON.parse) {
				return JSON.parse(str);
			} else {
				return eval('(' + str + ')');
			}
		} catch (e) {
			return null;
		}
	}

	function getStorageObj(name) {
		var storageObj, timeNow = new Date();
		storageObj = StrToJson(sessionStorage.getItem(name));
		if (storageObj && timeNow.getTime() < storageObj.expire) {
			return storageObj;
		} else {
			sessionStorage.removeItem(name);
			return null;
		}
	}

	function empty() {
		return function() {};
	}
	return {
		writeH5Data: writeH5Data,
		readH5Data: readH5Data,
		deleteH5Data: deleteH5Data
	};
});