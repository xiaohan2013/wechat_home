/**
 * Created by schp-tany on 2015/12/1.
 */
define('loadJs', function (require, exports, module) {
    var _cacheThisModule_;
    var ck = require('cookie');
    var callbackNameCount = {}, letterMap = ['Z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    function transToLetter(num) {
        var arr = num + ''.split(''), v = [];
        for (var i = 0; i < arr.length; i++) {
            v.push(letterMap[arr[i]])
        }
        return v.join('');
    }

    function callbackNameUnique(str) {
        if (!callbackNameCount[str]) {
            callbackNameCount[str] = 1;
        } else {
            callbackNameCount[str] += 1;
        }
        return str + transToLetter(callbackNameCount[str]);
    }

    function sendJs(url, opt) {
        var option = {onLoad: null, onError: null, onTimeout: null, timeout: 8000, isToken: true, charset: "utf-8"};
        var timer;
        if (arguments.length == 1) {
            if (typeof arguments[0] == "object") {
                opt = arguments[0];
                url = opt.url;
            } else {
                opt = {};
            }
        }
        if (typeof(opt.data) == 'object') {
            var param = [];
            for (var k in opt.data) {
                param.push(k + '=' + opt.data[k])
            }
            if (param.length > 0) {
                param = param.join('&');
                url += (url.indexOf('?') > 0 ? '&' : '?') + param;
            }
        }
        for (var i in opt) {
            if (opt.hasOwnProperty(i)) {
                option[i] = opt[i];
            }
        }
        var el = document.createElement("script");
        el.charset = option.charset || "utf-8";
        var needCheck = false, cgiLoadOK = false, reportUrl = url.replace(/\?.*/, '');
        el.onload = el.onreadystatechange = function () {
            if (/loaded|complete/i.test(this.readyState) || navigator.userAgent.toLowerCase().indexOf("msie") == -1) {
                option.onLoad && option.onLoad();
                if (needCheck && !cgiLoadOK) {
                    if (JD && JD.report) {
                        JD.report.umpBiz({bizid: 24, operation: 3, result: "1", source: 0, message: reportUrl})
                    }
                    window.onerror('', '', '', '', {stack: 'servererrorcount'});
                }
                clear();
            }
        };
        el.onerror = function () {
            option.onError && option.onError();
            clear();
        };
        var targetUrl = option.isToken ? addToken(url, "ls") : url;
        if (window.CGI302Report && url.indexOf('wq.360buyimg.com') < 0) {
            var originFunctionName, tempStr, originFunction, newFunctionName;
            tempStr = targetUrl.replace(/callback=[^&]+/, function (a, b) {
                originFunctionName = a.replace('callback=', '');
                newFunctionName = callbackNameUnique(originFunctionName);
                return 'callback=' + newFunctionName;
            });
            if (originFunctionName && window[originFunctionName]) {
                needCheck = true;
                targetUrl = tempStr;
                originFunction = window[originFunctionName];
                window[newFunctionName] = function (d) {
                    cgiLoadOK = true;
                    originFunction(d);
                };
            }
        }
        el.src = targetUrl.replace(/^http(s?):/, "");
        document.getElementsByTagName('head')[0].appendChild(el);
        if (typeof option.onTimeout == "function") {
            timer = setTimeout(function () {
                option.onTimeout();
            }, option.timeout);
        }
        ;
        var clear = function () {
            if (!el) {
                return;
            }
            timer && clearTimeout(timer);
            el.onload = el.onreadystatechange = el.onerror = null;
            el.parentNode && (el.parentNode.removeChild(el));
            el = null;
        }
    };
    function addToken(url, type) {
        var token = getToken();
        if (url == "" || (url.indexOf("://") < 0 ? location.href : url).indexOf("http") != 0) {
            return url;
        }
        if (url.indexOf("#") != -1) {
            var f1 = url.match(/\?.+\#/);
            if (f1) {
                var t = f1[0].split("#"), newPara = [t[0], "&g_tk=", token, "&g_ty=", type, "#", t[1]].join("");
                return url.replace(f1[0], newPara);
            } else {
                var t = url.split("#");
                return [t[0], "?g_tk=", token, "&g_ty=", type, "#", t[1]].join("");
            }
        }
        return token == "" ? (url + (url.indexOf("?") != -1 ? "&" : "?") + "g_ty=" + type) : (url + (url.indexOf("?") != -1 ? "&" : "?") + "g_tk=" + token + "&g_ty=" + type);
    };
    function getToken() {
        var skey = ck.get("wq_skey"), token = skey == null ? "" : time33(skey);
        return token;
    };
    function time33(str) {
        for (var i = 0, len = str.length, hash = 5381; i < len; ++i) {
            hash += (hash << 5) + str.charAt(i).charCodeAt();
        }
        ;
        return hash & 0x7fffffff;
    }

    exports.loadScript = sendJs;
    exports.addToken = addToken;
});