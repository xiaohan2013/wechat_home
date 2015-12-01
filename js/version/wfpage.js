/**
 * Created by schp-tany on 2015/12/1.
 */
define('wfpage', function (require, exports, module) {
    var $ = require('zepto'), fj = require('formatJson'), conn = require('wfdata'), clickEvent = 'ontouchstart'in window ? 'tap' : 'click', loadimg = require('lazyLoad'), useCache = true, useStorage = true, useDebug = JD.url.getUrlParam("debug") ? true : false, bInit = false, curWF = {}, minimg = JD.performance.useScaleImg(), segment, objIds = {}, everyPageHeight = 0, bLoading = false, callloadimg, _cacheThisModule_;

    function checkNextPage() {
        var win = $(window), docHeight = $(document).height(), st = win.scrollTop();
        if (!bLoading && !curWF.isFinished && ((st + win.height() > (docHeight - everyPageHeight)) || (curWF.bfirstLoad && (curWF.curPage < curWF.hisPage || (curWF.curPage == curWF.hisPage && curWF.curPi <= curWF.hisPi) || (curWF.curPage == 0 && curWF.curPi == 1))))) {
            return true;
        } else {
            return false;
        }
    }

    function setHistoryStatus() {
        if (useDebug) {
            console.log('setHistoryStatus');
        }
        var lastScH = getHash('curst') || 0, xin_action = 'xin_action_his', btn, ck = JD.cookie;
        if (curWF.customHisCallback) {
            curWF.customHisCallback();
        } else {
            if (lastScH > 0) {
                window.scrollTo(0, lastScH);
                setTimeout(function () {
                    $(window).trigger("scroll");
                }, 1000);
            }
            if (ck.get(xin_action)) {
                btn = $('#' + ck.get(xin_action));
                setTimeout(function () {
                    btn.trigger('tap');
                }, 600);
                ck.set(xin_action, '', -1, '', 'jd.com');
            }
        }
    }

    function getCacheKey(ppms, curpi) {
        var version = '1546', key;
        key = ppms.cacheKey ? ppms.cacheKey : (ppms.cgi ? ppms.cgi : 'mart') + '_' + (ppms.actid || '0') + '_' + (ppms.areaid || '0') + '_' + (curpi || 1) + '_' + (ppms.pc || 0) + '_' + (ppms.pretime || 1) + version;
        return key.replace(/-/, '');
    }

    function bindScrollEvent() {
        var scrollHeight, viewHeight = $(window).height(), win = $(window), doc = $(document), st, element, goTop = $('#backToTop'), actImgUrl;
        $(document).on('scroll', function () {
            if (window._curTpl && (window._curTpl != 1)) {
                return;
            }
            everyPageHeight = 600;
            throttle(showPage, null, 100);
        });
        showPage();
    }

    function getHash(name, url) {
        var u = arguments[1] || location.hash;
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = u.substr(u.indexOf("#") + 1).match(reg);
        if (r != null) {
            return r[2];
        }
        return "";
    }

    function throttle(method, context, delay) {
        clearTimeout(method.tId);
        method.tId = setTimeout(function () {
            method.call(context);
        }, delay);
    }

    function clearRepeat(datas, el) {
        var datas = datas || arguments[0], el = el || arguments[1], tempDatas;
        tempDatas = datas.filter(function (o) {
            if (!objIds[o.sItemId]) {
                return o;
            } else {
                objIds.push(o.sItemId);
            }
        });
        return tempDatas;
    }

    function resetMaxPI(segment, obj) {
        var param = segment.param;
        if (segment.resetMaxPI) {
            var totalPage = parseInt(obj.data.total / param.pc) + ((obj.data.total % param.pc) > 0 ? 1 : 0);
            if (segment.maxpi > totalPage || !segment.maxpi) {
                segment.maxpi = totalPage;
            }
        }
    }

    function renderHtml(con, segment, objData) {
        var html = '';
        try {
            html = fj.formatJson($("#" + segment.templateName).html(), {data: objData, seg: [segment]});
        } catch (exp) {
            if (useDebug) {
                console.log('error-begin.............');
                console.log(segment.templateName);
                console.log(objData);
                console.log(segment);
                console.log(exp.message);
                console.log(exp.stack);
                console.log('...............error-end');
            }
        }
        if (segment.isAppend) {
            con.append(html);
        } else {
            con.html(html);
        }
        loadimg.autoLoadImage({fadeIn: true});
    }

    function showPage(segment) {
        segment = segment || curWF.allPPMSData[curWF.curPage];
        if (useDebug) {
            if (!curWF.allPPMSData) {
                console.log('curWF.allPPMSData can not be null~');
                return;
            }
            if (!curWF.showLoading) {
                console.log('curWF.showLoading can not be null~');
                return;
            }
            if (!curWF.hideLoading) {
                console.log('curWF.hideLoading can not be null~');
                return;
            }
        }
        if (checkNextPage()) {
            bLoading = true;
            if (segment.lastPage) {
                curWF.isFinished = true;
                bLoading = false;
                setHistoryStatus();
            } else {
                curWF.showLoading(curWF.Container, true);
                if (segment.noRequestData) {
                    segment.customRender && segment.customRender();
                    segment.afterRender && segment.afterRender();
                    setNextPageParams(segment);
                } else {
                    var opt = segment;
                    opt.handleError = curWF.handleError;
                    opt.cb = function (objData) {
                        resetMaxPI(segment, objData);
                        if (segment.customRender) {
                            segment.customRender(objData);
                        } else {
                            renderHtml((typeof(segment.Container) === 'function' ? segment.Container() : segment.Container) || curWF.Container, segment, objData);
                        }
                        segment.afterRender && segment.afterRender(objData);
                        setNextPageParams(segment);
                    }
                    conn.getData(opt);
                }
            }
        }
    }

    function setNextPageParams(segment) {
        if (segment.maxpi == 0 || curWF.curPi == segment.maxpi || segment.noRequestData) {
            goNexSegment();
        } else {
            goNextPage(segment);
            console.log('goNextPage');
        }
        bLoading = false;
        !segment.alwaysShowLoading && curWF.hideLoading();
        if ((curWF.curPage == curWF.hisPage) && (curWF.curPi == curWF.hisPi)) {
            setHistoryStatus();
        }
        ;
        showPage();
    }

    function goNextPage(segment) {
        curWF.curPi++;
        if (segment.param && segment.param.hasOwnProperty("pi")) {
            segment.param.pi = curWF.curPi;
        }
    }

    function goNexSegment() {
        curWF.curPi = 1;
        curWF.curPage++;
    }

    function initPageData(opt) {
        curWF = opt;
        everyPageHeight = curWF.ScrollHeight || 500;
        bindScrollEvent();
        showPage();
    }

    function _showLoading() {
        arguments[0] && showLoadingContent(arguments[0], arguments[1]);
    }

    function showLoadingContent(Container, bWaitingTips) {
        var innerHTML = bWaitingTips ? '<i class="wx_loading_icon"></i>' : '<i onclick="commonReload();">轻触此处重新加载</i>';
        if ($(".wx_loading2").length === 0) {
            Container.after('<div class="wx_loading2"></div>')
        }
        $(".wx_loading2").html(innerHTML).show();
    }

    function _hideLoading() {
        $(".wx_loading2").hide();
    }

    function _init(opt) {
        if (!bInit) {
            var _opt = $.extend({
                curPi: 1,
                curPage: 0,
                bfirstLoad: true,
                isFinished: false,
                ScrollHeight: 500,
                showLoading: _showLoading,
                hideLoading: _hideLoading
            }, opt);
            initPageData(_opt);
        } else {
            bInit = true;
        }
    }

    exports.init = _init;
    exports.getCurWF = function () {
        return curWF;
    };
    exports.resetdata = function (data) {
        curWF = data;
        _init(data)
    };
    exports.initScrollEvent = function () {
        bindScrollEvent();
    };
    exports.showLoading = function () {
        _showLoading(arguments[0], arguments[1]);
    };
    exports.hideLoading = function () {
        _hideLoading();
    };
    exports.initScrollEvent = function () {
        bindScrollEvent();
    };
    exports.initBackBtn = function (el, activeCls) {
        var screenH = screen.height;
        if (el.length == 0) {
            console.log('el can not be null');
        }
        el.off(clickEvent).on(clickEvent, function (e) {
            window.scrollTo(0, 0);
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
        });
        $(document).on('scroll', function () {
            checkBackToTop(screenH);
        });
        function checkBackToTop(screenH) {
            activeCls = activeCls || 'WX_backtop_active';
            if (document.body.scrollTop > screenH && !el.hasClass(activeCls)) {
                el.addClass(activeCls);
            } else if (document.body.scrollTop < screenH && el.hasClass(activeCls)) {
                el.removeClass(activeCls);
            }
        }
    }
    exports.clearRepeat = function () {
        return clearRepeat.apply(null, Array.prototype.slice.call(arguments));
    };
    exports.getHash = function (name) {
        return getHash(name);
    };
    exports.resetPageHeight = function (height) {
        everyPageHeight = height;
    };
});