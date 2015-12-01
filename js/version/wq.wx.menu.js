define("wq.wx.menu", function(require, exports) {
	var $ = require("zepto"),
		_cacheThisModule_ = '',
		_iscroll = require("iscroll"),
		searchFormCls = "wx_search_form",
		serachbar, serachFormFocusCls = "wx_search_form_focus",
		sBtnCls = "wx_search_btn_blue",
		bar = document.getElementById("topsearchbar"),
		switchword = "",
		opt = {
			mouseWheel: !1,
			bounce: !0,
			disableMouse: !0,
			disablePointer: !0,
			freeScroll: !1,
			momentum: !0
		},
		tipsKey = "jd_newversion_062021";

	function changRongzaiLink(locUrl, toUrl) {
		return toUrl.replace('new', (locUrl.indexOf("new") > -1) ? 'new' : 'old');
	}

	function setSearhBar() {
		var tabUrl = ['//wq.jd.com/mcoss/mportal/show?tpl=14&tabid=5&ptag=37035.8.1', '//wq.jd.com/mcoss/mportal/show?tabid=13&tpl=13&ptag=37787.1.1'];
		if (location.href.indexOf("//wqs.jd.com/data/coss/tolerant") > -1) {
			tabUrl = [changRongzaiLink(location.href, '//wqs.jd.com/data/coss/tolerant/new/6_1.shtml?ptag=37787.1.2'), changRongzaiLink(location.href, '//wqs.jd.com/data/coss/tolerant/new/9_1.shtml?ptag=37787.1.1')];
		}
		topSearchbtn = document.getElementById("topSearchbtn"), searhPanel = document.querySelector(".wx_search_form"), barData = bar.dataset, switchword = "1" == barData.homepage ? "<span ptag='37787.1.1'>换旧版</span>" : "<span ptag='37787.1.2'>换新版</span>", switchurl = "1" == barData.homepage ? tabUrl[0] : tabUrl[1];
		barData.index = 2, barData.switchclassname = "1" == barData.switchstyle ? " wx_search_promote" : "";
		searhPanel.className = searhPanel.className + barData.switchclassname;
		topSearchbtn.innerHTML = switchword;
		barData.switchstyle == "1" && (topSearchbtn.style.display = "", barData.switchstyle == "1" && document.querySelector(".wx_search_ov").addEventListener("touchstart", function(e) {
			if (e.srcElement && -1 === e.srcElement.className.indexOf("wx_search_btn")) {
				if (barData.homepage) {
					JD.report.rd("37787.1.2");
				}
				e && e.stopPropagation() && e.preventDefault();
				location.href = window.GLOBAL_OLD_PAGE || switchurl;
			}
		}, !1));
		serachbar = barData;
	}

	function showFirstTips() {
		if (location.href.indexOf("//wqs.jd.com/portal/wx/index.shtml") == -1) {
			return $(".wx_bar_guide_area").remove();
		}
		var hasShowInst = JD.cookie.get(tipsKey);
		hasShowInst ? $(".wx_bar_guide_area").remove() : $(".wx_bar_guide_area").show();
	}

	function go(searchLink) {
		location.href = searchLink;
	}

	function initSmarBox() {
		var smartboxUrl = JD.url.smartboxUrl,
			head = document.getElementsByTagName("head")[0],
			js = document.createElement("script");
		js.type = "text/javascript", js.src = smartboxUrl || "//wq.360buyimg.com/js/common/dest/jd.smartbox.min.js?t=201501191917", head.appendChild(js), js.onload = function() {
			var curtainHead = document.getElementById("btnShowCurtain"),
				wxSfrm = document.querySelector("." + searchFormCls),
				tBtn = document.getElementById("topSearchbtn"),
				tClear = document.getElementById("topSearchClear"),
				topTong = document.getElementById("topTong"),
				wordslider = document.querySelector(".subpromote_banner"),
				wxTab = document.getElementById("toolbarHead"),
				wxAdid = $("#topsearchbar").attr("data-wxadid") || "2";
			jd.smartbox.init({
				scene: 2,
				kwObj: "topSearchTxt",
				clearBtn: "topSearchClear",
				searchBtn: "topSearchbtn",
				cancelBtn: "",
				smartWrap: "smartboxBlock",
				wxHotUrl: "//wq.360buyimg.com/data/coss/keyword/project/mpj{#mpj#}.jsonp".replace("{#mpj#}", /\d/.test(serachbar.mpj) ? serachbar.mpj : "120"),
				searchRd: serachbar.searchrd || "17020.2.4",
				hotRd: serachbar.hotrd || "17020.2.4",
				wxAdid: wxAdid,
				showCb: function() {
					var wxFooter = document.querySelector('.wx_footer'),
						jdapp = document.getElementById("jdappdlOutter"),
						wxNav = document.querySelector(".wx_nav");
					document.querySelector(".wx_wrap").style.display = "none";
					wxSfrm.className = searchFormCls + " " + serachFormFocusCls;
					document.body.style.minHeight = "";
					jdapp && (jdapp.style.display = "none");
					wxTab && (wxTab.style.display = "none");
					wxNav && (wxNav.style.display = "none");
					wxFooter && (wxFooter.style.display = "none");
					curtainHead && (curtainHead.style.display = "none", $("#bigShow").removeClass("show").hide());
					$("#topsearchbar").removeClass("wx_search_show_window");
					topTong && (topTong.style.display = "none");
					wordslider && (wordslider.style.display = "none");
					tBtn.style.display = "";
					tBtn.innerHTML = "搜索";
					tBtn.className = sBtnCls;
					if ($("#topCurtainBtn").length > 0 && $("#topCurtainBtn").html() != "") {
						$("#topCurtainBtn").hide();
						$("#topsearchbar").removeClass('wx_search_promote_ex');
					}
				},
				hideCb: function() {
					var wxFooter = document.querySelector('.wx_footer'),
						jdapp = document.getElementById("jdappdlOutter"),
						wxNav = document.querySelector(".wx_nav");
					document.getElementById("topSearchTxt").value = "";
					document.querySelector(".wx_wrap").style.display = "block";
					document.body.style.minHeight = "1000px";
					tClear.style.display = "none";
					jdapp && (jdapp.style.display = "");
					wxNav && (wxNav.style.display = "");
					wxTab && (wxTab.style.display = "");
					wxFooter && (wxFooter.style.display = "");
					topTong && (topTong.style.display = "");
					wordslider && (wordslider.style.display = "");
					curtainHead && (curtainHead.style.display = "");
					curtainHead && (wxSfrm.className = searchFormCls + " " + (serachbar.switchclassname || "wx_search_promote")), !curtainHead && (wxSfrm.className = searchFormCls), topTong && (topTong.style.display = "");
					console.log("switchStyle__" + serachbar.switchstyle);
					tBtn.style.display = "none";
					"1" == serachbar.switchstyle && (tBtn.style.display = "", tBtn.innerHTML = switchword, tBtn.className = "wx_search_ov", wxSfrm.className = searchFormCls + " " + serachFormFocusCls);
					$("#bigShow").show();
					if ($("#topCurtainBtn").length > 0 && $("#topCurtainBtn").html() != "") {
						$("#topCurtainBtn").show();
						$("#topsearchbar").addClass('wx_search_promote_ex');
					}
				},
				keyInput: function(key) {
					curtainHead && (curtainHead.style.display = "none", $("#bigShow").removeClass("show").hide());
					$("#topsearchbar").removeClass("wx_search_show_window");
					"" == key ? (tClear.style.display = "none") : (tClear.style.display = "");
				}
			});
		};
	}

	function setSideMenu() {
		var Bar, stopMove, clickEvent = "ontouchstart" in window ? "tap" : "click",
			wx_side_menu = $(".wx_side_menu"),
			wx_search_chanel_mode = $(".wx_search_chanel_mode"),
			bigShow = $("#bigShow"),
			menu_list = $(".menu_list"),
			guide = $(".wx_bar_guide_area"),
			wx_search_inner = $(".wx_search_inner"),
			showMenu = function(hide) {
				JD.events.trigger("event_checkpopmenu", hide);
			},
			stopMove = function(e) {
				0 == $(e.target).parents(".stopmove").length && (e.preventDefault());
			};
		menu_list.find(".item[data-dis=new] .new").show();
		menu_list.find(".item[data-strong='1'] .hot").show();
		JD.events.listen("event_checkpopmenu", function(hide) {
			if (hide || menu_list.css("display") !== "none") {
				wx_side_menu.removeClass("show");
				wx_search_chanel_mode.removeClass("wx_search_show_menu");
				JD.events.trigger("event_hidecurtain");
				setTimeout(function() {
					menu_list.hide().parent().hide();
				}, 500);
				$(document).unbind("touchmove", stopMove, !1)
			} else {
				wx_search_chanel_mode.removeClass("wx_search_show_window").addClass("wx_search_show_menu");
				wx_side_menu.addClass("show");
				bigShow.removeClass("show");
				$(document).bind("touchmove", stopMove, !1);
				if (wx_search_chanel_mode.hasClass("fixed")) {
					menu_list.show().parent().show();
				} else {
					setTimeout(function() {
						menu_list.show().parent().show();
					}, 500);
					menu_list.show().parent().show();
					window.scrollTo(0, 0);
					menu_list.show().parent().show().css("top", (wx_search_inner.offset().top + wx_search_inner.height() - 1) + "px");
				}
				s1.refresh();
			}
		});
		menu_list.find(".item").on(clickEvent, function(e) {
			var target = $(e.target);
			e.preventDefault(), e.stopPropagation(), go(target.data("href") || $(target).parents("[data-href]").attr("data-href"));
		}), Bar = {
			init: function() {
				this.init_tab(), this.init_menu(), this.init_guide();
			},
			init_tab: function() {
				wx_search_inner.on(clickEvent, function(e) {
					showMenu(true);
				});
			},
			init_menu: function(e) {
				var mask = wx_side_menu.find(".mod_alert_mask"),
					fold = wx_side_menu.find(".fold"),
					on_click = function(e) {
						if (e && $(e.target).attr("class") == "icon_cate") {
							JD.report.rd($(e.target).attr("ptag"));
						}
						e && (e.preventDefault(), e.stopPropagation());
						showMenu(false);
					},
					on_menu = function(e) {
						var elm = $(e.target).closest(".menu_list");
						elm.length > 0 || on_click();
					};
				wx_search_chanel_mode.find(".wx_bar_cate").on(clickEvent, on_click), mask.on(clickEvent, on_click), fold.on(clickEvent, on_click), wx_side_menu.on(clickEvent, on_menu);
			},
			init_guide: function() {
				var on_clear = function() {
						guide.remove();
					},
					on_click = function() {
						JD.cookie.set(tipsKey, 1, 5256e4, "/", "jd.com"), guide.addClass("fade"), timer = setTimeout(on_clear, 500);
					};
				guide.on(clickEvent, on_click);
			}
		}, Bar.init(), window._navfoot && showFirstTips();
	}
	exports.init = function() {
		if (!window.closeSearchEntrance) {
			if (!window._searchbar) {
				setSearhBar();
			} else {
				serachbar = window._searchbar;
				switchword = serachbar && serachbar.homepage && "1" == serachbar.homepage ? "<span ptag='37787.1.1'>换旧版</span>" : "<span ptag='37787.1.2'>换新版</span>";
			}
			initSmarBox();
		} else {
			bar.style.display = "none";
		}
		s1 = _iscroll.init("#yScroll1", opt);
		setSideMenu();
	};
});