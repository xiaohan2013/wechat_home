/**
 * Created by schp-tany on 2015/12/1.
 */
define('time', function (require, exports, module) {
    var __cacheThisModule__;
    var cLs = require('loadJs'), servertime = 0, heart = 0, heartEvents = [], callback, timeCgi = 'http://wq.jd.com/mcoss/servertime/getservertime?callback=GTSTime';

    function heartBeat() {
        if (!heart) {
            heart = setInterval(function () {
                if (servertime) {
                    servertime += 1000;
                }
                doHeartBeat();
            }, 1000);
        }
    }

    function doHeartBeat() {
        if (heartEvents.length) {
            for (var i = 0; i < heartEvents.length; i++) {
                try {
                    heartEvents[i]();
                } catch (e) {
                }
            }
        }
    }

    function hasHeartBeat(key) {
        return heartEvents.some(function (v) {
            return v.evtid && v.evtid === key;
        });
    }

    function removeHeartBeat(key, byGroup) {
        var v;
        if (heartEvents.length) {
            for (var i = 0; i < heartEvents.length; i++) {
                v = heartEvents[i];
                if (v && v.evtid) {
                    if (!byGroup && v.evtid === key) {
                        heartEvents.splice(i--, 1);
                    } else if (byGroup && (new RegExp(key).test(v.evtid.toString()))) {
                        heartEvents.splice(i--, 1);
                    }
                }
            }
        }
    }

    function startHeartBeat(st) {
        if (!servertime && st > 0) {
            servertime = st * 1;
            heartBeat();
        }
    }

    function getYMD(d) {
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
    }

    function floorHour(d) {
        return new Date(getYMD(d) + ' ' + d.getHours() + ':00:00').getTime() / 1000;
    }

    ~function init() {
        window['GTSTime'] = function (json) {
            if (json.errCode === '0') {
                startHeartBeat(new Date(json.data[0].serverTime).getTime());
                typeof callback === 'function' && callback();
            }
        };
        cLs.loadScript({url: timeCgi + '&t=' + Math.random(), charset: 'utf-8'});
    }();
    return {
        getServerTime: function () {
            return servertime;
        }, listen: function (evt) {
            heartEvents.push(evt);
        }, done: function (func) {
            callback = func;
        }, getYMD: getYMD, floorHour: floorHour, start: startHeartBeat, has: hasHeartBeat, remove: removeHeartBeat
    };
});