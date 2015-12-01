/**
 * Created by schp-tany on 2015/12/1.
 */
define("wq.wx.index", function (require, exports, module) {
    var _cacheThisModule_;
    var $ = require("zepto"),
        wfpage = require("wfpage"),
        wfdata = require("wfdata"),
        fj = require("formatJson"),
        ls = require("loadJs"),
        ll = require("lazyLoad"),
        util = require("util"),
        loopSrcoll = require("loopScroll"),
        dateFm = require("date"),
        mTime = require("time"),
        wxpopmenu = require("wq.wx.menu"),
        mReport = require('report'),
        lanchGjApp = require('wq.lanchGjApp'),
        sc = require('scrollCtrl').init(),
        localStorage = window.localStorage,
        dotVisibleKey = "$lc_wx_index",
        cpcAllData,
        localLink = document.location.href.replace(/\?.*/, ''),
        hasRemindTip = $('#yxHead').css('display') !== 'none',
        backScrollTop = sessionStorage.getItem("backScrollTop") ? sessionStorage.getItem("backScrollTop") * 1 : 0;

    var VSlider = function (w, option) {
        var self = this;
        var o = option || {};
        var timer;
        var wrap = $(w);
        var list = wrap.find(o.list || '.line_list').first();
        var lines = list.find(o.item || '.line');
        var height = lines.height() || 0;
        var num = lines.length || 0;
        this.index = o.index || 0;
        this.delay = o.delay || 3000;
        this.open = true;
        var is_open = function () {
            var flag = false;
            if (self.open)flag = true;
            return flag;
        };
        this.init = function () {
            var line = lines.first().clone();
            list.append(line);
            list.on('webkitTransitionEnd', function () {
                if (self.index >= num) {
                    self.index = 0;
                    list.attr('style', '-webkit-transform: translate3D(0,0,0);');
                }
            });
        };
        this.move = function (i, a) {
            var index = i || self.index;
            var flag = a || false;
            if (++index > num) {
                index = 0;
            }
            var d = '-' + index * height + 'px';
            var s = '-webkit-transform: translate3D(0,' + d + ',0);';
            if (!flag) {
                s += ' -webkit-transition: -webkit-transform 0.4s';
            }
            list.attr('style', s);
            if (is_open()) {
                self.loop();
            }
            self.index = index;
        };
        this.loop = function () {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            timer = setTimeout(self.move, self.delay);
        };
        if (height > 0 && num > 1) {
            self.init();
            self.loop();
        } else {
            console.log(' lol~~~~  wrong vslider ');
        }
    };
    var index = {
        replaceParam: function (param, value, url, forceReplace) {
            url = url || location.href;
            var reg = new RegExp("([\\?&]" + param + "=)[^&#]*");
            if (!url.match(reg)) {
                return (url.indexOf("?") == -1) ? (url + "?" + param + "=" + value) : (url + "&" + param + "=" + value);
            }
            if (forceReplace) {
                return url.replace(reg, "$1" + value);
            }
            return url;
        }, initTopADPanel: function () {
            var me = this, items = $('#divTopBanner>.list>div.item'), loopScroll;
            if (!items.length) {
                me.umpReport(1);
            } else {
                me.umpReport('1-1');
            }
            if (items.length > 1) {
                loopScroll = loopSrcoll.init({
                    tp: "img",
                    moveDom: $(".wet_slider>.list"),
                    moveChild: $(".wet_slider>.list div.item"),
                    tab: $("div.nav b"),
                    len: 3,
                    index: 1,
                    loopScroll: true,
                    autoTime: 5000,
                    tabClass: "cur",
                    transition: 0.3,
                    fun: function (index) {
                        $(".tit_list .cur").removeClass('cur');
                        $('.tit_list>div.tit').eq(index - 1).addClass('cur');
                    }
                });
                $('.switch').on('click', 'i.icon_s_left,i.icon_s_right', function () {
                    var $this = $(this), index = $('.tit_list>div.cur').index() + 1;
                    $this.is('.icon_s_left') ? index-- : index++;
                    loopScroll.stepMove(index);
                });
                $('.tit_list').on('click', 'div.tit', function () {
                    var $this = $(this);
                    if ($this.is('cur')) {
                        return;
                    }
                    loopScroll.stepMove($this.index() + 1);
                });
            } else {
                var a = $("#divTopBanner");
                a.find('.left').hide();
                a.find('.right').hide();
                a.find('.tit').addClass('cur');
            }
        }, showCurtain: function () {
            var curAd, i, j, now = new Date(), curtainAdShow = JD.cookie.get("curtainAdShow"), jdpin = window.localStorage.getItem("showold");
            if (!jdpin) {
                return;
            }
            for (i = 0, j = wx_curtainad.length; j > i; i++)
                if (now >= new Date(wx_curtainad[i].startTime.replace(/-/g, "/")) && now < new Date(wx_curtainad[i].endTime.replace(/-/g, "/"))) {
                    curAd = wx_curtainad[i];
                    break;
                }
            if (curAd && !curtainAdShow) {
                var mywindow = $("#bigShow1")[0], mask = mywindow.querySelector(".wx_bar_guide_area_1"), bigShow1 = $("#bigShow1")[0], on_click = function (e) {
                    if (e && "img" == e.target.tagName.toLowerCase()); else {
                        bigShow1.style.display = "none";
                        e && (e.preventDefault(), e.stopPropagation());
                    }
                };
                mask.addEventListener("touchstart", on_click, !1);
                if (!curtainAdShow) {
                    $("#bigShow1Inner").html('<a href="' + curAd.link + '" id="big">  <img src="' + curAd.urlImg1 + '" alt="" > </a>');
                    bigShow1.style.display = '';
                    window.setTimeout(function () {
                        on_click();
                    }, 10000);
                    JD.cookie.set("curtainAdShow", 1, Math.round((new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now) / 6e4), "/", "jd.com");
                }
            }
            if (curAd && curAd.urlImg2) {
                var topCurtainBtn = $("#topCurtainBtn");
                $("#topsearchbar").addClass('wx_search_promote_ex');
                topCurtainBtn.attr("href", curAd.link);
                topCurtainBtn.html('<img src="' + curAd.urlImg2 + '" alt="" > </a>');
                topCurtainBtn.show();
            }
        }, initADBannerPanel: function () {
            var me = this, serverTime = new Date(), ppmsData = window.wx_portal_ad_tong || [], data = [], $ct = $('.wet_bnr'), tplAdBanner = $('#tplAdBanner').html();
            $.each(ppmsData, function (index, item) {
                var link, ptags = [];
                if (item && me.between(serverTime, new Date(item.startTime), new Date(item.endTime))) {
                    link = me.replaceParam("PTAG", "37787.7.1", item.link, true);
                    data.push({link: link, urlImg1: item.urlImg1});
                }
            });
            $ct.html(fj.formatJson(tplAdBanner, {data: data}));
        }, initQuanCnt: function () {
            var me = this, quanCent = $("#quanCenter");
            for (var i = 0, len = ppmsQuanCenter.length; i < len; i++) {
                var item = ppmsQuanCenter[i];
                if (new Date().getDay() == item.weekday) {
                    var temp = $(quanCent.find('.item')[0]);
                    temp.find("a").attr("href", item.lqLink);
                    temp.find("span").html(item.lqValue);
                    temp.find(".name").html(item.lqTitle);
                    temp.find(".desc").html(item.lqDesc);
                    break;
                }
            }
            ;
            var temp1 = $(quanCent.find('.item')[1]);
            temp1.find('a').attr("href", ppms_wx_index_app[2].url);
            temp1.find('.name').html(ppms_wx_index_app[2].title);
            if (new Date().getDay() == 5) {
                temp1.find('.desc').html("抢会员福利券");
            } else {
                temp1.find('.desc').html(ppms_wx_index_app[2].desc);
            }
            quanCent.parent().show();
        }, getSecKillPPMSData: function () {
            var me = this, ppmsData = window.ppms_index_seckill || [], tabgroundid = {
                "家庭场": "1",
                "吃货场": "2",
                "数码场": "3",
                "家电场": "4"
            }, now = new Date(parseInt(new Date().getTime() / 1000) * 1000), time00 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 1), time01 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0, 0), time08 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0, 0, 0);
            data = {current: {title: '', desc: ''}, next: {title: '', desc: ''}}, getSecKillInfo = function (list) {
                var date = new Date(mTime.getYMD(now)), data = {};
                if (now.getTime() >= time00.getTime() && now.getTime() < time01.getTime()) {
                    date.setDate(date.getDate() - 1);
                }
                $.each(list, function (idx, o) {
                    if (o && date.getTime() === me.str2date(o.date).getTime()) {
                        data = o;
                        return;
                    }
                });
                return data;
            }, getComingSecKillTime = function () {
                if (me.comingTime)return me.comingTime;
                var arr = [];
                $.each(ppmsData, function (index, item) {
                    var st;
                    if (item) {
                        st = new Date(dateFm.format(now, "yyyy/mm/dd " + item.stime));
                        arr.push(Math.abs(st - now));
                    }
                });
                me.comingTime = Math.min.apply(Math, arr);
                return me.comingTime;
            };
            $.each(ppmsData, function (index, curSecKill) {
                var date = new Date(mTime.getYMD(now)), st, et, nextSecKill = {
                    name: '',
                    stime: ''
                }, nextSecKillDate, stateTemp = 1;
                if (curSecKill) {
                    st = new Date(dateFm.format(now, "yyyy/mm/dd " + curSecKill.stime));
                    et = new Date(dateFm.format(now, "yyyy/mm/dd " + curSecKill.etime));
                    if (et.getTime() < st.getTime()) {
                        if (now.getTime() >= time00.getTime() && now.getTime() < time01.getTime()) {
                            st.setDate(st.getDate() - 1);
                        } else {
                            et.setDate(et.getDate() + 1);
                        }
                    }
                    ;
                    if (me.between(now, st, et)) {
                        if (ppmsData[index + 1]) {
                            nextSecKill = ppmsData[index + 1];
                            $.extend(nextSecKill, getSecKillInfo(nextSecKill.list));
                        } else {
                            nextSecKillDate = new Date(now);
                            if (!(now.getTime() >= time00.getTime() && now.getTime() < time01.getTime())) {
                                nextSecKillDate.setDate(nextSecKillDate.getDate() + 1);
                            }
                            $.each(ppmsData[0].list, function (index, o) {
                                if (o && new Date(mTime.getYMD(nextSecKillDate)).getTime() == me.str2date(o.date).getTime()) {
                                    nextSecKill = $.extend(ppmsData[0], o);
                                    return;
                                }
                            });
                        }
                        $.extend(curSecKill, getSecKillInfo(curSecKill.list));
                        if (now.getTime() >= time01.getTime() && now.getTime() < time08.getTime()) {
                            stateTemp = 0;
                            et = time08;
                        }
                        $.extend(data, {
                            current: {
                                title: curSecKill.name,
                                tabground: tabgroundid[curSecKill.name],
                                desc: curSecKill.desc || curSecKill.defaultDesc,
                                img: curSecKill.img || curSecKill.defaultImg,
                                state: stateTemp,
                                diffTime: (et.getTime() - now.getTime()) / 1000
                            },
                            next: {
                                name: nextSecKill.name,
                                tabground: tabgroundid[nextSecKill.name],
                                title: nextSecKill.name == "家庭场" ? "[08:00] 家庭场" : util.format('[{0}] {1}', nextSecKill.stime.substr(0, 5), nextSecKill.name),
                                desc: nextSecKill.desc || nextSecKill.defaultDesc,
                                img: nextSecKill.img || nextSecKill.defaultImg
                            }
                        });
                        return false;
                    }
                }
            });
            return data;
        }, initTejiaPanel: function () {
            var me = this, $ct = $('#divTejia'), $ctCount, tplSecKill = $('#tplTejia').html(), data = me.getSecKillPPMSData(), diffTime = data.current.diffTime;
            $ct.html(fj.formatJson(tplSecKill, {data: data}));
            mTime.listen(function () {
                if (diffTime <= 0) {
                    data = me.getSecKillPPMSData();
                    diffTime = data.current.diffTime;
                    $ct.html(fj.formatJson(tplSecKill, {data: data}));
                    return;
                }
                $ctCount = $ct.find('span.mod_time_counter');
                var t = me.getTimeStr(diffTime--);
                $ctCount.html(util.format(['<b class="h">{0}</b>', '<span class="p">:</span>', '<b class="m">{1}</b>', '<span class="p">:</span>', '<b class="s">{2}</b>'].join(''), t[0], t[1], t[2]));
            });
            if (!data.current.img || !data.next.img) {
                me.umpReport('2-2');
            }
        }, showTip: function () {
            var today = new Date();
            if (today.getDay() == 0 || today.getDay() == 6) {
                $("#joyFloat").attr("class", "wx_side_float show");
            } else {
                $("#joyFloat").attr("class", "wx_side_float hide");
            }
            $("#joyBody").on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                JD.report.rd("7164.1.1");
                location.href = "//wqs.jd.com/promote/201508/weekendgou/index.shtml";
            });
            $("#joyClose").on('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                $(this).parent().parent().attr("class", "wx_side_float hide");
            });
        }, showNewTip: function () {
            var jdpin = window.localStorage.getItem("showold"), showDom = $(".wx_bar_guide_area_1");
            if (!jdpin) {
                showDom.show();
                var on_clear = function () {
                    showDom.remove();
                }
                showDom.bind("click", function () {
                    showDom.addClass('fade');
                    timer = setTimeout(on_clear, 500);
                });
                window.localStorage.setItem("showold", "showold");
            } else {
                return;
            }
        }, initIndexHotPanel: function () {
            var me = this, $ct = $('.wet_mat_list'), data = [], tplIndexHot = $('#tplIndexHot').html(), emptyMater = {
                "_8109": {
                    materialname: "女装内衣;进馆即抽奖",
                    materialdesc: "0",
                    sUrl: "//wqs.jd.com/portal/wx/lady/lady.shtml?PTAG=37787.5.6",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2098/82/792798873/10335/8004a1e7/5628401dN4eba274f.jpg"
                },
                "_8110": {
                    materialname: "大牌男装;秋冬爆款69元起",
                    materialdesc: "0",
                    sUrl: "//wq.jd.com/mcoss/mportal/show?tpl=14&tabid=5&PTAG=37787.5.5",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t1846/125/772336209/8829/1158587c/5628401bN26066fed.jpg"
                },
                "_8111": {
                    materialname: "男女鞋靴;全场低至79元",
                    materialdesc: "0",
                    sUrl: "//wq.jd.com/mcoss/mportal/show?tpl=14&tabid=5&PTAG=37787.5.7",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2419/100/777961626/8489/ac767f85/56284025N57644a9c.jpg"
                },
                "_8112": {
                    materialname: "运动大牌;低至99元",
                    materialdesc: "0",
                    sUrl: "//wqs.jd.com/portal/wx/yundongguan.shtml?PTAG=37787.5.4",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2311/78/756301341/7091/50f2c684/56284026N513c9f66.jpg"
                },
                "_8113": {
                    materialname: "箱包礼品;低至9.9元起",
                    materialdesc: "0",
                    sUrl: "//wq.jd.com/mcoss/mportal/show?tpl=14&tabid=5&PTAG=37787.5.9",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2320/102/763695103/12293/e7752476/56284021N524a07b5.jpg"
                },
                "_8114": {
                    materialname: "钟表美妆;大牌惠不停",
                    materialdesc: "0",
                    sUrl: "//wq.jd.com/mcoss/mportal/show?tpl=14&tabid=5&PTAG=37787.5.15",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2407/92/733526086/9987/d5252312/56284028N5f3d86db.jpg"
                },
                "_8151": {
                    materialname: "家居家装;沙发1999元抢",
                    materialdesc: "0",
                    sUrl: "//wq.jd.com/mcoss/mportal/show?tpl=14&tabid=5&PTAG=37787.5.13",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2506/91/714701556/9762/c9c39e1e/56284017N2db21c0c.jpg"
                },
                "_8152": {
                    materialname: "母婴玩具;尿裤奶粉大放价",
                    materialdesc: "0",
                    sUrl: "//wqs.jd.com/event/chaoshi/cs_10.shtml?PTAG=37787.5.14",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2263/114/745296713/22890/2d181908/56284019Nd295e0ef.jpg"
                },
                "_8153": {
                    materialname: "图书音像;39折/49折/59折封顶",
                    materialdesc: "0",
                    sUrl: "//wq.jd.com/mcoss/mportal/show?tabid=9&tpl=9&PTAG=37787.5.17",
                    material: "//img11.360buyimg.com/jdphoto/s140x140_jfs/t2074/105/771481394/8553/99c2b107/5628401fN0dd024df.jpg"
                }
            };
            for (var i = 0, len = cpcAllData.length; i < len; i++) {
                var item = cpcAllData[i];
                if (item.groupid == "3078" || item.groupid == "3091") {
                    for (var j = 0, len1 = item.locations.length; j < len1; j++) {
                        var o = item.locations[j];
                        if (o.plans[0]) {
                            if (o.plans[0].material) {
                                data.push($.extend({locationid: o.locationid}, o.plans[0]));
                            } else {
                                data.push($.extend({locationid: o.locationid}, emptyMater["_" + o.locationid]));
                            }
                        } else {
                            if (emptyMater["_" + o.locationid]) {
                                data.push($.extend({locationid: o.locationid}, emptyMater["_" + o.locationid]));
                            }
                        }
                    }
                    ;
                }
            }
            ;
            data.sort(function (a, b) {
                return a.locationid - b.locationid
            });
            $ct.html(fj.formatJson(tplIndexHot, {data: data}));
            sc.on($('.wet_mat_list img[init_src]'), function (e) {
                var $this = $(this), src = $this.attr('init_src');
                $this.attr('src', src).attr('init_src', null);
            });
            me.checkBackScrollTop(".wet_v2_panel");
            if (!data.length) {
                me.umpReport('3');
            }
        }, initFloorChannel: function () {
            var _this = this, floorData = [], cateDate = [], now = new Date(), dayOrder = Math.abs(parseInt(new Date(mTime.getYMD(now)) - new Date("2015/09/25")) / 1000 / 86400) % 2, cateIndex = JD.url.getUrlParam("floorid");
            var tplFloorHead = $("#tplFloorHead").html();
            var tplFloorCnt = $("#tplFloorCnt").html();
            var createFloorHead = function (floor, data) {
                $("#channelFloor" + floor).addClass(data.style)
                $("#channelFloor" + floor + " .hd").html(fj.formatJson(tplFloorHead, data));
            };
            var createFloorCnt = function (floor, list) {
                $("#channelFloor" + floor + " .info").html(fj.formatJson(tplFloorCnt, list));
            };
            var adIds = [];
            if (dayOrder != 0 && dayOrder != 1) {
                dayOrder = 0;
            }
            window._floorData.forEach(function (el, index) {
                $.each(window.floorOrder[dayOrder], function (key, value) {
                    if (value == el.name) {
                        floorData[key.substring(key.length - 1) * 1] = el;
                        return false;
                    }
                });
            });
            if (cateIndex && cateIndex > 0 && cateIndex <= 4) {
                var temp = floorData[cateIndex * 1 - 1];
                floorData.splice(cateIndex * 1 - 1, 1);
                floorData.splice(0, 0, temp);
            }
            floorData.forEach(function (data, index) {
                createFloorHead(index + 1, data);
                adIds.push(data.adId);
            });
            wfdata.getData({
                dataType: wfdata.DataType.CPC,
                param: {gids: adIds.join("|"), callback: "getFLoorItems"},
                cb: function (res) {
                    if (res.retCode != 0 || !res.list.length) {
                        return;
                    }
                    res.list.forEach(function (act) {
                        var floor = adIds.indexOf(act.groupid);
                        floorData[floor].list = [];
                        floorData[floor].list.link = floorData[floor].link;
                        floorData[floor].list.btnText = floorData[floor].btnText;
                        floorData[floor].list.chaoshi = act.groupid == "3077";
                        act.locations.forEach(function (location, index) {
                            if (location.plans.length) {
                                var item = location.plans[0];
                                var parts = item.materialname.replace("；", ";").split(";");
                                item.itemName = parts[0];
                                item.itemPromote = parts[1];
                                item.sUrl = util.addRd(item.sUrl, floorData[floor].rd + "." + (index + 2));
                                floorData[floor].list.push(item);
                            }
                        });
                    });
                    floorData.forEach(function (data, index) {
                        data.list.length && createFloorCnt(index + 1, {list: data.list});
                    });
                    ll.autoLoadImage();
                    _this.checkBackScrollTop("#channelFloor");
                }
            });
        }, getSpcChaDate: function () {
            var homeThemeData = [];
            $('#ppmsdata_home').children('p').each(function (i, p) {
                p = $(p);
                var obj = {
                    materialname: "京东微店",
                    sUrl: "//wqs.jd.com/portal/wx/microstore.shtml?PTAG=37787.12.1&title=%E5%BE%AE%E5%BA%97&tab=1",
                    material: p.attr('dshow'),
                    materialdesc: p.attr('dtitle'),
                    title: p.attr('dtitle')
                };
                try {
                    obj.dateobj = new Date(p.attr('ddate'))
                } catch (e) {
                    obj.dateobj = new Date()
                }
                if (obj.dateobj < Date.now() && !isPPMSEmptyData(obj.material)) {
                    homeThemeData.push(obj)
                }
            });
            homeThemeData.sort(function (a, b) {
                return b.dateobj - a.dateobj
            });
            homeThemeData = homeThemeData[0] || null;
            return homeThemeData;
        }, initSpecialChannel: function () {
            var _this = this, list = [], wdppmsData = _this.getSpcChaDate();
            if (wdppmsData) {
                list.push(wdppmsData);
            }
            for (var i = 0, len = cpcAllData.length; i < len; i++) {
                var item = cpcAllData[i];
                if (item.groupid == "3079") {
                    for (var j = 0, len1 = item.locations.length; j < len1; j++) {
                        var o = item.locations[j];
                        if (o.plans.length) {
                            list.push(o.plans[0]);
                        }
                    }
                    ;
                    break;
                }
            }
            ;
            $("#specialChannel").html(fj.formatJson("tplSpecialChannel", {list: list}));
            ll.autoLoadImage();
            _this.checkBackScrollTop("#specialChannel");
        }, getInterestUrl: function () {
            var vk = JD.cookie.get("visitkey"), gray = vk ? ((vk % parseInt(10)) < 1) : (Math.random() < 0.1), jdpin = JD.cookie.get("jdpin"), wuser = ['lily28533', 'dashuangli_m', 'townguo', 'thefairytale', 'shendiaomo', 'kemmy_cat', 'jd_6f880fd92507b', 'handsomezhi', 'janesilencepax', '134864899-443038', 'miven94', 'yoyozyr', 'ncudsp', 'podigang', 'jd_742eda4b7b3b5', "miven94", "yoyozyr", "lily28533", "ncudsp", "podigang", "jd_742eda4b7b3b5", "15675842421_p", "haolry", "18665822525_p"], param, returnUrl = "", lidStr = (JD.cookie.get("jdAddrId") && JD.cookie.get("jdAddrId").split("_")[0]) || 1, interestGrey = (gray || wuser.indexOf(jdpin) != -1) ? 1 : 0;
            window.sessionStorage.setItem("interestGrey", interestGrey);
            if (interestGrey) {
                params = decodeURIComponent($.param({
                    p: 630002,
                    uuid: JD.cookie.get("visitkey") || -1,
                    ec: "utf-8",
                    pin: jdpin || '',
                    lid: lidStr,
                    lim: 100,
                    ad_ids: 1741,
                    hi: 1,
                    mobile_type: 3,
                    device_id: JD.cookie.get('open_id'),
                    device_type: 512,
                    callback: "buildInterestPanel"
                }));
                returnUrl = "//mixer.jd.com/mixer?" + params;
            } else {
                var hiParam = "visitkey:{0},pin:{1},page:1,pageSize:100";
                hiParam = util.format(hiParam, JD.cookie.get("visitkey"), JD.cookie.get("jdpin"));
                params = decodeURIComponent($.param({
                    p: 630002,
                    ec: "utf-8",
                    uuid: JD.cookie.get("visitkey") || 1,
                    lid: 1,
                    lim: 100,
                    hi: hiParam,
                    callback: "buildInterestPanel"
                }));
                returnUrl = "//diviner.jd.com/diviner?" + params;
            }
            return returnUrl;
        }, initInterestPanel: function () {
            var me = this, result = me.readH5Cache("wx_index_interest_data");
            window.buildInterestPanel = function (result) {
                var $ct = $(".wet_pro_list"), tplInterest = $('#tplInterest').html(), data = [], getVParams = function (name, impr) {
                    var reg = new RegExp(name + "=([^\$]*)"), r = impr.match(reg);
                    return r != null ? r[1] : "";
                }, interestGrey = window.sessionStorage.getItem("interestGrey") * 1;
                if (result.success) {
                    impr = util.getQuery('v', result.impr);
                    mReport.skuRecomExposure({
                        t: 'wg_rec.' + util.getQuery('t', result.impr).split('.')[1],
                        action: 0,
                        expid: getVParams('expid', impr),
                        reqsig: getVParams('reqsig', impr)
                    });
                    me.writeH5Cache("wx_index_interest_data", result);
                    $ct.html(fj.formatJson(tplInterest, {
                        data: result.data,
                        flow: result.flow,
                        recid: "630002",
                        rd: interestGrey ? "37787.6.1" : "37787.6.2",
                        exp: interestGrey ? "1741" : "0"
                    }));
                    $(".wet_pro_list").off('click').on('click', ' a.url', function (e) {
                        var $a = $(this);
                        if (interestGrey) {
                            window.sessionStorage.removeItem('reportTJW');
                            window.sessionStorage && window.sessionStorage.setItem('reportTJW', $a.attr('repURL'));
                        } else {
                            result.impr = util.getQuery('v', result.impr);
                            mReport.skuRecomExposure({
                                t: 'wg_rec.' + $a.data('recid'),
                                sku_id: $a.data('sku'),
                                action: 1,
                                expid: getVParams('expid', result.impr),
                                reqsig: getVParams('reqsig', result.impr),
                                index: $a.parent().index() + 1
                            });
                        }
                    });
                    sc.on($('.wet_pro_list img[init_src]'), function (e) {
                        var $this = $(this), src = $this.attr('init_src');
                        $this.attr('src', src).attr('init_src', null);
                    });
                } else {
                    me.umpReport(4);
                }
            };
            if (result) {
                buildInterestPanel(result);
            } else {
                ls.loadScript({url: me.getInterestUrl(), charset: "utf-8"});
            }
        }, checkBackScrollTop: function (selector) {
            $(selector).on("click", "a", function () {
                sessionStorage.setItem("backScrollTop", $(window).scrollTop());
            });
            this.setBackScrollTop(selector);
        }, setBackScrollTop: function (selector) {
            if (backScrollTop == 0) {
                return;
            }
            var box = $(selector).offset();
            var viewAreaTopY = backScrollTop;
            var viewAreaHeight = $(window).height();
            var viewAreaBottomY = viewAreaHeight + backScrollTop;
            if ((viewAreaHeight <= box.height && box.top <= viewAreaTopY && box.top + box.height >= viewAreaBottomY) || (viewAreaHeight > box.height && (viewAreaTopY < box.top && viewAreaBottomY > box.top || viewAreaTopY < box.top + box.height && viewAreaBottomY > box.top + box.height))) {
                window.scrollTo(0, backScrollTop);
                backScrollTop = 0;
                sessionStorage.removeItem("backScrollTop");
            }
        }, share: function () {
            window.shareConfig = {
                img_url: "http://img11.360buyimg.com/jdphoto/s80x80_jfs/t1075/153/429220015/7210/901c4304/552e0bc9N8992288d.jpg",
                img_width: "80",
                img_height: "80",
                link: 'http://wq.jd.com/mcoss/mportal/show?tabid=13&tpl=13&PTAG=17007.7.1',
                title: "微信购物精选好货，多快好省，集您所需！",
                desc: "微信购物，京东直供，正品保证，新品首发，手快有手慢无！",
                clkPtag: ''
            };
        }, readH5Cache: function (key) {
            var val = window.sessionStorage.getItem('$ss_' + key);
            return val && JSON.parse(val);
        }, writeH5Cache: function (key, val) {
            window.sessionStorage.setItem('$ss_' + key, JSON.stringify(val));
        }, getTimeStr: function (second) {
            if (second < 0)second = 0;
            var h = Math.floor(second / 3600), m = Math.floor((second % 3600) / 60), s = (second % 3600) % 60;

            function fix(str) {
                return String(str).length === 1 ? '0' + str : str;
            }

            return [fix(h), fix(m), fix(s)];
        }, random: function (min, max) {
            if (!max) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        }, str2date: function (str) {
            return new Date(str.replace(/-/g, '/'));
        }, between: function (date, start, end) {
            var t = date.getTime();
            return start.getTime() <= t && t <= end.getTime();
        }, urlAppend: function (url, string) {
            if ($.trim(string).length) {
                return url + (url.indexOf('?') === -1 ? '?' : '&') + string;
            }
            return url;
        }, getOS: function () {
            var ua = navigator.userAgent, android = ua.match(/(Android);?[\s\/]+([\d.]+)?/), ipad = ua.match(/(iPad).*OS\s([\d_]+)/), ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/), iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/), webos = ua.match(/(webOS|hpwOS)[\s\/]([\d.]+)/), touchpad = webos && ua.match(/TouchPad/), kindle = ua.match(/Kindle\/([\d.]+)/), silk = ua.match(/Silk\/([\d._]+)/), blackberry = ua.match(/(BlackBerry).*Version\/([\d.]+)/), bb10 = ua.match(/(BB10).*Version\/([\d.]+)/), os = 'other';
            if (android) {
                os = 'android';
            }
            if (iphone || ipod || ipad) {
                os = 'ios';
            }
            if (webos) {
                os = 'webos';
            }
            if (touchpad) {
                os = 'touchpad';
            }
            if (blackberry) {
                os = 'blackberry';
            }
            if (bb10) {
                os = 'bb10';
            }
            return os;
        }, umpReport: function (type) {
            var me = this, umpBiz = JD && JD.report && JD.report.umpBiz, report;
            if (!umpBiz || !type) {
                return;
            }
            report = {
                1: function () {
                    umpBiz({bizid: '29', operation: '1', result: '1', source: '0', message: '首屏banner为空'});
                }, '1-1': function () {
                    umpBiz({bizid: '29', operation: '1', result: '0', source: '0', message: '首屏banner加载成功'});
                }, '2-1': function () {
                    umpBiz({bizid: '29', operation: '2', result: '0', source: '0', message: '首发、品牌、秒杀固化栏目数据异常'});
                }, '2-2': function () {
                    umpBiz({bizid: '29', operation: '2', result: '0', source: '0', message: '发现好店、心跳秒杀固化栏目数据异常'});
                }, 3: function () {
                    umpBiz({bizid: '29', operation: '3', result: '0', source: '0', message: '精选类目数据异常'});
                }, 4: function () {
                    umpBiz({bizid: '29', operation: '4', result: '0', source: '0', message: '猜你喜欢数据异常'});
                }
            };
            report[type]();
        }, pvReport: function () {
            var ptag = JD.report.redpointPtag || JD.url.getUrlParam('PTAG') || JD.url.getUrlParam('ptag');
            mReport.pvReport({vurl: 'http://wq.jd.com/mcoss/mportal/wxindex?ptag=' + ptag, ptag: ptag});
            if (JD.report.redpointPtag) {
                mReport.setCookiePtag(JD.report.redpointPtag);
            }
        }, fixTopSearchFixed: function () {
            var tempScrTop = 0;
            $('#topSearchTxt').focus(function () {
                tempScrTop = $(window).scrollTop();
                $('#topsearchbar').removeClass('fixed');
                window.scroll(0, 0);
            });
            $("#topSearchCbtn").on('click', function () {
                if (!hasRemindTip) {
                    $('#topsearchbar').addClass('fixed');
                }
                setTimeout(function () {
                    window.scroll(0, tempScrTop);
                }, 50);
            });
            if (hasRemindTip) {
                $('#topsearchbar').removeClass('fixed');
            }
        }, render: function () {
            var me = this;
            me.showCurtain();
            me.initTopADPanel();
            me.initQuanCnt();
            me.initADBannerPanel();
            wfdata.getData({
                dataType: wfdata.DataType.CPC,
                param: {gids: "3078|3091|3079", pc: 1, callback: "getCpcAllData"},
                cb: function (res) {
                    cpcAllData = res.list;
                    me.initIndexHotPanel();
                    me.initSpecialChannel();
                }
            });
            me.initTejiaPanel();
            me.showNewTip();
            me.initFloorChannel();
            if (ppms_cnxh[0].isShowCNXH * 1) {
                $("#cnxhShow").show();
                me.initInterestPanel();
            } else {
                $("#cnxhShow").hide();
            }
            me.share();
            wfpage.initBackBtn($("#backToTop"));
            me.fixTopSearchFixed();
            me.pvReport();
        }
    };

    function isPPMSEmptyData(t) {
        t = t || '';
        if (t.length == 0) {
            return true
        }
        return /^{#/.test(t);
    }

    exports.init = function () {
        index.render();
        setTimeout(function () {
            lanchGjApp.lanchGjApp({
                onSuccess: function () {
                    JD.report.rd("7250.1.4");
                }
            });
        }, 2000);
        wxpopmenu.init();
    };
});