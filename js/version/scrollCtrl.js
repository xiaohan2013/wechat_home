/**
 * Created by schp-tany on 2015/12/1.
 */
define('scrollCtrl', function (require, exports, module) {
    var _cacheThisModule_;

    function throttle(delay, action, tail, debounce) {
        var now = Date.now, last_call = 0, last_exec = 0, timer = null, curr, diff, ctx, args, exec = function () {
            last_exec = now();
            action.apply(ctx, args);
        };
        return function () {
            ctx = this, args = arguments, curr = now(), diff = curr - (debounce ? last_call : last_exec) - delay;
            clearTimeout(timer);
            if (debounce) {
                if (tail) {
                    timer = setTimeout(exec, delay);
                } else if (diff >= 0) {
                    exec();
                }
            } else {
                if (diff >= 0) {
                    exec();
                } else if (tail) {
                    timer = setTimeout(exec, -diff);
                }
            }
            last_call = curr;
        }
    }

    function scrollCtrl(context) {
        var _guid = (new Date()).getTime(), _items = {}, _fix = window.screen.height, _activeTypes = {
            'beforeTop': 1,
            'beforeBottom': 2,
            'all': 0
        }, me = this, isArray = Array.isArray || function (object) {
                return object instanceof Array
            };
        !context && (context = document.body);
        this.on = function (objs, activeType, callback) {
            if (!arguments[2]) {
                callback = arguments[1];
                activeType = null;
            }
            if ($.type(arguments[0]) !== 'array') {
                objs = [arguments[0]];
            }
            if (objs.pos) {
                _items[_guid++] = {target: objs, callback: callback, enable: true, activeType: activeType || 'all'}
            } else {
                for (var i = 0; i < objs.length; i++) {
                    var obj = objs[i], key = obj.id || (_guid++);
                    obj.setAttribute('attr-autoload', 1);
                    _items[key] = {target: obj, callback: callback, enable: true, activeType: activeType || 'all'}
                }
            }
            this.watch();
        };
        this.watch = function () {
            var pageHeight = document.documentElement.clientHeight, pageTop = $(context).scrollTop(), pageBottom = pageHeight + pageTop;
            for (var key in _items) {
                var item = _items[key];
                if (!item || (item.enable !== true))continue;
                var target, offset, itemTop, itemBottom;
                if (item.target.pos) {
                    itemTop = item.target[0];
                    itemBottom = item.target[1];
                } else {
                    target = $(item.target), offset = target.offset(), itemTop = offset.top + (context == document.body ? 0 : pageTop), itemBottom = itemTop + offset.height;
                }
                itemTop -= _fix;
                itemBottom += _fix;
                if (this.checkIsInScreen(itemTop, itemBottom, pageTop, pageBottom, item.activeType)) {
                    if (item.enable === true) {
                        delete _items[key];
                    }
                    item.callback.apply(item.target, [item]);
                    item.target.removeAttribute('attr-autoload');
                }
            }
        };
        this.checkIsInScreen = function (itemTop, itemBottom, pageTop, pageBottom, activeType) {
            if (activeType === 'all') {
                if ((itemTop < pageBottom && itemTop > pageTop) || (itemBottom < pageBottom && itemBottom > pageTop)) {
                    return true;
                } else if (itemTop < pageTop && itemBottom > pageBottom) {
                    return true;
                }
            } else if (activeType === 'beforeTop' && itemBottom > pageTop) {
                return true;
            } else if (activeType === 'beforeBottom' && itemTop < pageBottom) {
                return true;
            }
            return false;
        };
        this.clear = function () {
            _items = {};
        };
        $(!context || context === document.body ? document : context).on('scroll', throttle(80, function () {
            me.watch();
        }, true));
    };
    exports.init = function (context) {
        return new scrollCtrl(context);
    }
});