/**
 * Created by schp-tany on 2015/12/1.
 */
define('formatJson', function (require, exports, module) {
    var _cacheThisModule_;
    var _formatJson_cache = {};
    $formatJson = function (str, data) {
        var fn = !/\W/.test(str) ? _formatJson_cache[str] = _formatJson_cache[str] || $formatJson(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
        return data ? fn(data) : fn;
    }
    exports.formatJson = $formatJson;
});