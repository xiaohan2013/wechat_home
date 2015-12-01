define("wfdata", function(require, exports, module) {
	function a(e, t) {
		var n = [];
		for (var r in e) {
			var i = e[r];
			n.push(t ? r + "_" + i : r + "=" + i)
		}
		return t ? n.sort().join("_") : (n.push("t=" + Math.round(new Date / 3e5)), n.join("&"))
	}

	function f(e) {
		var t = u[e.dataType];
		return e.dataType == s.PPMS ? t.replace("{#key#}", e.param.key) : t
	}

	function l(e, t) {
		return e = e || "cb" + i.getHash(a(t, !0))
	}

	function c(e, t, n) {
		var r = {
			0: ["actid", "ptype", "pi", "pc", "pcs", "cgid", "areaid", "sorttype", "ch", "callback", "tpl", "pretime", "mscence", "exclarea", "options", "gbyarea", "btime", "etime"],
			1: ["id", "pageindex", "pagesize", "tpl", "category", "level", "ch", "webview", "parent", "minimg", "newarrival", "tag", "callback", "bi", "showtype", "sday", "eday"],
			2: ["gids", "pc", "callback", "pcs"],
			3: ["id", "pageindex", "pagesize", "tpl", "category", "level", "ch", "webview", "parent", "minimg", "newarrival", "tag", "callback", "bi", "showtype", "sday", "eday"],
			4: ["actid", "ptype", "pi", "pc", "pcs", "cgid", "areaid", "sorttype", "ch", "callback", "tpl", "pretime", "mscence", "exclarea", "options", "gbyarea", "btime", "etime"],
			6: [
				["mids", "gid", "callback"],
				["showtype", "gid", "callback", "category", "pageindex", "pagesize"]
			]
		};
		if (e == s.MART || e == s.MART_MUTI) t += "&mscence=" + ({
			weixin: 1,
			qq: 2,
			jzyc: 4,
			mobile: 3
		}[JD.device.scene] || 3);
		var o = t.split("?")[1],
			u = {},
			a = o.split("&"),
			f = a.map(function(e) {
				var t = e.split("=")[0];
				return u[t] = e, t
			}),
			l = r[e];
		e === s.MaterialQuery && (l = n.param.pageindex ? l[1] : l[0]), f = f.filter(function(e) {
			return l.some(function(t) {
				return e == t
			})
		}), f.sort();
		var c = {
				0: "mmart",
				1: "focuscpt",
				2: "focusbi",
				3: "focuscpt",
				4: "mmart",
				6: "material"
			}[e],
			h = {
				0: "show",
				1: "qqshow",
				2: "show",
				3: "wxshow",
				4: "mshow",
				6: "query"
			}[e],
			p = f.reduce(function(e, t, n) {
				return e + "_" + u[t].replace(/[,:;|\/=]/g, "_")
			}, "mcoss_" + c + "_" + h);
		console.log(p);
		var d = i.getHash(p),
			v = u[{
				0: "actid",
				1: "id",
				2: "gids",
				3: "id",
				4: "pcs",
				6: "gid"
			}[e]].split("=")[1];
		return v = e == s.MART_MUTI ? v.split(":")[0] : v.split("|")[0], "http://wqs.jd.com/data/coss/recovery/" + (e == s.MaterialQuery && n.param.pageindex ? "material2" : c) + "2/" + v + "/" + d + ".shtml" + "?" + o
	}

	function h(e) {
		var t = e.param,
			n = f(e),
			r = n + (n.indexOf("?") > -1 ? "&" : "?") + a(t),
			i = "",
			o = JD.disasterRecovery;
		if (e.dataType == s.MART || e.dataType == s.CPC || e.dataType == s.CPT || e.dataType == s.CPT_WX || e.dataType == s.MaterialQuery || e.dataType == s.MART_MUTI) i = c(e.dataType, r, e);
		return i || r
	}

	function p(i, o) {
		var u = arguments.callee,
			h = arguments,
			p = this,
			d = e.extend({}, i.param),
			v = i.dataType == s.PPMS ? i.param.callback : l(i.param.callback, d);
		d.callback = v;
		var m = f(i),
			g = m + (m.indexOf("?") > -1 ? "&" : "?") + a(d),
			y = "",
			b = JD.disasterRecovery;
		if (i.dataType == s.MART && b.mart.useStaticUrl || i.dataType == s.CPC && b.cpc.useStaticUrl || i.dataType == s.CPT && b.cpt.useStaticUrl || i.dataType == s.CPT_WX && b.cpt.useStaticUrl || i.dataType == s.MaterialQuery && b.materialQuery.useStaticUrl || i.dataType == s.MART_MUTI && b.multiMart.useStaticUrl) y = c(i.dataType, g, i);
		window[v] = function(t) {
			try {
				if (t.pageId && !t.errCode) i.cb && i.cb(t), r.writeH5Data(o, t, null, 5);
				else if (t.errCode == "0") {
					if (t.recovery && parseInt(t.recovery) > 0) {
						e.ajax({
							type: "get",
							dataType: "script",
							url: t.recoveryUrl,
							error: function(e) {
								JD.report.badJs(_url), i.handleError && i.handleError(u, h, p)
							}
						});
						return
					}
					i.cb && i.cb(t), n || r.writeH5Data(o, t, null, 5)
				} else i.utilFailed && reportUtil(ppmsData.utilFailed), i.handleError && i.handleError(u, h, p)
			} catch (s) {
				n && (console.log("wf-data-error-begin............."), console.log(s.message), console.log(s.stack), console.log("..............wf-data-error-end")), i.utilFailed && reportUtil(ppmsData.utilFailed), i.handleError && i.handleError(u, h, p)
			}
		}, window.GLOBAL_CROSSORIGIN ? JD.sendJsByDomain({
			url: y || g,
			defer: !0,
			async: !0,
			crossOrigin: !0
		}) : t.loadScript({
			url: y || g,
			charset: "utf-8"
		})
	}

	function d(e) {
		var t;
		n ? p(e, t) : (t = e.param.cacheKey || a(e.param, !0), r.readH5Data(t, function(n, r) {
			if (!r || !n) {
				p(e, t);
				return
			}
			e.cb && e.cb(n)
		}))
	}
	var _cacheThisModule_, e = require("zepto"),
		t = require("loadJs"),
		n = JD.url.getUrlParam("mdebug") ? !0 : !1,
		r = require("mqqStorage"),
		i = require("md5"),
		s = {
			MART: 0,
			CPT: 1,
			CPC: 2,
			CPT_WX: 3,
			MART_MUTI: 4,
			PPMS: 5,
			MaterialQuery: 6,
			Spematerial: 7,
			Mportal: 8
		},
		o = "http://wq.jd.com",
		u = [o + "/mcoss/mmart/show", o + "/mcoss/focuscpt/qqshow", o + "/mcoss/focusbi/show", o + "/mcoss/focuscpt/wxshow", o + "/mcoss/mmart/mshow", "http://wq.360buyimg.com/data/ppms/js/ppms.page{#key#}.jsonp", "http://wq.jd.com/mcoss/material/query", "http://wq.jd.com/mcoss/spematerial/spematerialshow", "http://wq.jd.com/mcoss/mportal/show"];
	exports.getData = function(e) {
		d(e)
	}, exports.getStaticUrl = function(e) {
		return h(e)
	}, exports.DataType = s
});;