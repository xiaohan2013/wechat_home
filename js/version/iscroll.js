/**
 * Created by schp-tany on 2015/12/1.
 */
define("iscroll", function (require, exports, module) {
    function t(t, n) {
        this.wrapper = typeof t == "string" ? document.querySelector(t) : t, this.scroller = this.wrapper.children[0], this.scrollerStyle = this.scroller.style, this.options = {
            startX: 0,
            startY: 0,
            scrollY: !0,
            directionLockThreshold: 5,
            momentum: !0,
            bounce: !0,
            bounceTime: 600,
            bounceEasing: "",
            preventDefault: !0,
            preventDefaultException: {tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/},
            HWCompositing: !0,
            useTransition: !0,
            useTransform: !0
        };
        for (var r in n)this.options[r] = n[r];
        this.translateZ = this.options.HWCompositing && e.hasPerspective ? " translateZ(0)" : "", this.options.useTransition = e.hasTransition && this.options.useTransition, this.options.useTransform = e.hasTransform && this.options.useTransform, this.options.eventPassthrough = this.options.eventPassthrough === !0 ? "vertical" : this.options.eventPassthrough, this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault, this.options.scrollY = this.options.eventPassthrough == "vertical" ? !1 : this.options.scrollY, this.options.scrollX = this.options.eventPassthrough == "horizontal" ? !1 : this.options.scrollX, this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough, this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold, this.options.bounceEasing = typeof this.options.bounceEasing == "string" ? e.ease[this.options.bounceEasing] || e.ease.circular : this.options.bounceEasing, this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling, this.options.tap === !0 && (this.options.tap = "tap"), this.options.probeType == 3 && (this.options.useTransition = !1), this.x = 0, this.y = 0, this.directionX = 0, this.directionY = 0, this._events = {}, this._init(), this.refresh(), this.scrollTo(this.options.startX, this.options.startY), this.enable()
    }

    var _cacheThisModule_ = "", e = function () {
        function r(e) {
            return n === !1 ? !1 : n === "" ? e : n + e.charAt(0).toUpperCase() + e.substr(1)
        }

        var e = {}, t = document.createElement("div").style, n = function () {
            var e = ["t", "webkitT", "MozT", "msT", "OT"], n, r = 0, i = e.length;
            for (; r < i; r++) {
                n = e[r] + "ransform";
                if (n in t)return e[r].substr(0, e[r].length - 1)
            }
            return !1
        }();
        e.getTime = Date.now || function () {
                return (new Date).getTime()
            }, e.extend = function (e, t) {
            for (var n in t)e[n] = t[n]
        }, e.addEvent = function (e, t, n, r) {
            e.addEventListener(t, n, !!r)
        }, e.removeEvent = function (e, t, n, r) {
            e.removeEventListener(t, n, !!r)
        }, e.prefixPointerEvent = function (e) {
            return window.MSPointerEvent ? "MSPointer" + e.charAt(9).toUpperCase() + e.substr(10) : e
        }, e.momentum = function (e, t, n, r, i, s) {
            var o = e - t, u = Math.abs(o) / n, a, f;
            return s = s === undefined ? 6e-4 : s, a = e + u * u / (2 * s) * (o < 0 ? -1 : 1), f = u / s, a < r ? (a = i ? r - i / 2.5 * (u / 8) : r, o = Math.abs(a - e), f = o / u) : a > 0 && (a = i ? i / 2.5 * (u / 8) : 0, o = Math.abs(e) + a, f = o / u), {
                destination: Math.round(a),
                duration: f
            }
        };
        var i = r("transform");
        return e.extend(e, {
            hasTransform: i !== !1,
            hasPerspective: r("perspective")in t,
            hasTouch: "ontouchstart"in window,
            hasPointer: window.PointerEvent || window.MSPointerEvent,
            hasTransition: r("transition")in t
        }), e.isBadAndroid = /Android /.test(window.navigator.appVersion) && !/Chrome\/\d/.test(window.navigator.appVersion), e.extend(e.style = {}, {
            transform: i,
            transitionTimingFunction: r("transitionTimingFunction"),
            transitionDuration: r("transitionDuration"),
            transitionDelay: r("transitionDelay"),
            transformOrigin: r("transformOrigin")
        }), e.hasClass = function (e, t) {
            var n = new RegExp("(^|\\s)" + t + "(\\s|$)");
            return n.test(e.className)
        }, e.addClass = function (t, n) {
            if (e.hasClass(t, n))return;
            var r = t.className.split(" ");
            r.push(n), t.className = r.join(" ")
        }, e.removeClass = function (t, n) {
            if (!e.hasClass(t, n))return;
            var r = new RegExp("(^|\\s)" + n + "(\\s|$)", "g");
            t.className = t.className.replace(r, " ")
        }, e.offset = function (e) {
            var t = -e.offsetLeft, n = -e.offsetTop;
            while (e = e.offsetParent)t -= e.offsetLeft, n -= e.offsetTop;
            return {left: t, top: n}
        }, e.preventDefaultException = function (e, t) {
            for (var n in t)if (t[n].test(e[n]))return !0;
            return !1
        }, e.extend(e.eventType = {}, {
            touchstart: 1,
            touchmove: 1,
            touchend: 1,
            mousedown: 2,
            mousemove: 2,
            mouseup: 2,
            pointerdown: 3,
            pointermove: 3,
            pointerup: 3,
            MSPointerDown: 3,
            MSPointerMove: 3,
            MSPointerUp: 3
        }), e.extend(e.ease = {}, {
            quadratic: {
                style: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", fn: function (e) {
                    return e * (2 - e)
                }
            }, circular: {
                style: "cubic-bezier(0.1, 0.57, 0.1, 1)", fn: function (e) {
                    return Math.sqrt(1 - --e * e)
                }
            }, back: {
                style: "cubic-bezier(0.175, 0.885, 0.32, 1.275)", fn: function (e) {
                    var t = 4;
                    return (e -= 1) * e * ((t + 1) * e + t) + 1
                }
            }, bounce: {
                style: "", fn: function (e) {
                    return (e /= 1) < 1 / 2.75 ? 7.5625 * e * e : e < 2 / 2.75 ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : e < 2.5 / 2.75 ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
                }
            }, elastic: {
                style: "", fn: function (e) {
                    var t = .22, n = .4;
                    return e === 0 ? 0 : e == 1 ? 1 : n * Math.pow(2, -10 * e) * Math.sin((e - t / 4) * 2 * Math.PI / t) + 1
                }
            }
        }), e.tap = function (e, t) {
            var n = document.createEvent("Event");
            n.initEvent(t, !0, !0), n.pageX = e.pageX, n.pageY = e.pageY, e.target.dispatchEvent(n)
        }, e.click = function (e) {
            var t = e.target, n;
            /(SELECT|INPUT|TEXTAREA)/i.test(t.tagName) || (n = document.createEvent("MouseEvents"), n.initMouseEvent("click", !0, !0, e.view, 1, t.screenX, t.screenY, t.clientX, t.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null), n._constructed = !0, t.dispatchEvent(n))
        }, e
    }();
    t.prototype = {
        version: "5.1.3", _init: function () {
            this._initEvents()
        }, destroy: function () {
            this._initEvents(!0), this._execEvent("destroy")
        }, _transitionEnd: function (e) {
            if (e.target != this.scroller || !this.isInTransition)return;
            this._transitionTime(), this.resetPosition(this.options.bounceTime) || (this.isInTransition = !1, this._execEvent("scrollEnd"))
        }, _start: function (t) {
            if (e.eventType[t.type] != 1 && t.button !== 0)return;
            if (!this.enabled || this.initiated && e.eventType[t.type] !== this.initiated)return;
            this.options.preventDefault && !e.isBadAndroid && !e.preventDefaultException(t.target, this.options.preventDefaultException) && t.preventDefault();
            var n = t.touches ? t.touches[0] : t, r;
            this.initiated = e.eventType[t.type], this.moved = !1, this.distX = 0, this.distY = 0, this.directionX = 0, this.directionY = 0, this.directionLocked = 0, this._transitionTime(), this.startTime = e.getTime(), this.options.useTransition && this.isInTransition ? (this.isInTransition = !1, r = this.getComputedPosition(), this._translate(Math.round(r.x), Math.round(r.y)), this._execEvent("scrollEnd")) : !this.options.useTransition && this.isAnimating && (this.isAnimating = !1, this._execEvent("scrollEnd")), this.startX = this.x, this.startY = this.y, this.absStartX = this.x, this.absStartY = this.y, this.pointX = n.pageX, this.pointY = n.pageY, this._execEvent("beforeScrollStart")
        }, _move: function (t) {
            if (!this.enabled || e.eventType[t.type] !== this.initiated)return;
            this.options.preventDefault && t.preventDefault();
            var n = t.touches ? t.touches[0] : t, r = n.pageX - this.pointX, i = n.pageY - this.pointY, s = e.getTime(), o, u, a, f;
            this.pointX = n.pageX, this.pointY = n.pageY, this.distX += r, this.distY += i, a = Math.abs(this.distX), f = Math.abs(this.distY);
            if (s - this.endTime > 300 && a < 10 && f < 10)return;
            !this.directionLocked && !this.options.freeScroll && (a > f + this.options.directionLockThreshold ? this.directionLocked = "h" : f >= a + this.options.directionLockThreshold ? this.directionLocked = "v" : this.directionLocked = "n");
            if (this.directionLocked == "h") {
                if (this.options.eventPassthrough == "vertical")t.preventDefault(); else if (this.options.eventPassthrough == "horizontal") {
                    this.initiated = !1;
                    return
                }
                i = 0
            } else if (this.directionLocked == "v") {
                if (this.options.eventPassthrough == "horizontal")t.preventDefault(); else if (this.options.eventPassthrough == "vertical") {
                    this.initiated = !1;
                    return
                }
                r = 0
            }
            r = this.hasHorizontalScroll ? r : 0, i = this.hasVerticalScroll ? i : 0, o = this.x + r, u = this.y + i;
            if (o > 0 || o < this.maxScrollX)o = this.options.bounce ? this.x + r / 3 : o > 0 ? 0 : this.maxScrollX;
            if (u > 0 || u < this.maxScrollY)u = this.options.bounce ? this.y + i / 3 : u > 0 ? 0 : this.maxScrollY;
            this.directionX = r > 0 ? -1 : r < 0 ? 1 : 0, this.directionY = i > 0 ? -1 : i < 0 ? 1 : 0, this.moved || this._execEvent("scrollStart"), this.moved = !0, this._translate(o, u), s - this.startTime > 300 && (this.startTime = s, this.startX = this.x, this.startY = this.y, this.options.probeType == 1 && this._execEvent("scroll")), this.options.probeType > 1 && this._execEvent("scroll")
        }, _end: function (t) {
            if (!this.enabled || e.eventType[t.type] !== this.initiated)return;
            this.options.preventDefault && !e.preventDefaultException(t.target, this.options.preventDefaultException) && t.preventDefault();
            var n = t.changedTouches ? t.changedTouches[0] : t, r, i, s = e.getTime() - this.startTime, o = Math.round(this.x), u = Math.round(this.y), a = Math.abs(o - this.startX), f = Math.abs(u - this.startY), l = 0, c = "";
            this.isInTransition = 0, this.initiated = 0, this.endTime = e.getTime();
            if (this.resetPosition(this.options.bounceTime))return;
            this.scrollTo(o, u);
            if (!this.moved) {
                this.options.tap && e.tap(t, this.options.tap), this.options.click && e.click(t), this._execEvent("scrollCancel");
                return
            }
            if (this._events.flick && s < 200 && a < 100 && f < 100) {
                this._execEvent("flick");
                return
            }
            this.options.momentum && s < 300 && (r = this.hasHorizontalScroll ? e.momentum(this.x, this.startX, s, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : {
                destination: o,
                duration: 0
            }, i = this.hasVerticalScroll ? e.momentum(this.y, this.startY, s, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : {
                destination: u,
                duration: 0
            }, o = r.destination, u = i.destination, l = Math.max(r.duration, i.duration), this.isInTransition = 1);
            if (o != this.x || u != this.y) {
                if (o > 0 || o < this.maxScrollX || u > 0 || u < this.maxScrollY)c = e.ease.quadratic;
                this.scrollTo(o, u, l, c);
                return
            }
            this._execEvent("scrollEnd")
        }, _resize: function () {
            var e = this;
            clearTimeout(this.resizeTimeout), this.resizeTimeout = setTimeout(function () {
                e.refresh()
            }, this.options.resizePolling)
        }, resetPosition: function (e) {
            var t = this.x, n = this.y;
            return e = e || 0, !this.hasHorizontalScroll || this.x > 0 ? t = 0 : this.x < this.maxScrollX && (t = this.maxScrollX), !this.hasVerticalScroll || this.y > 0 ? n = 0 : this.y < this.maxScrollY && (n = this.maxScrollY), t == this.x && n == this.y ? !1 : (this.scrollTo(t, n, e, this.options.bounceEasing), !0)
        }, disable: function () {
            this.enabled = !1
        }, enable: function () {
            this.enabled = !0
        }, refresh: function () {
            var t = this.wrapper.offsetHeight;
            this.wrapperWidth = this.wrapper.clientWidth, this.wrapperHeight = this.wrapper.clientHeight, this.scrollerWidth = this.scroller.offsetWidth, this.scrollerHeight = this.scroller.offsetHeight, this.maxScrollX = this.wrapperWidth - this.scrollerWidth, this.maxScrollY = this.wrapperHeight - this.scrollerHeight, this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0, this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0, this.hasHorizontalScroll || (this.maxScrollX = 0, this.scrollerWidth = this.wrapperWidth), this.hasVerticalScroll || (this.maxScrollY = 0, this.scrollerHeight = this.wrapperHeight), this.endTime = 0, this.directionX = 0, this.directionY = 0, this.wrapperOffset = e.offset(this.wrapper), this._execEvent("refresh"), this.resetPosition()
        }, on: function (e, t) {
            this._events[e] || (this._events[e] = []), this._events[e].push(t)
        }, off: function (e, t) {
            if (!this._events[e])return;
            var n = this._events[e].indexOf(t);
            n > -1 && this._events[e].splice(n, 1)
        }, _execEvent: function (e) {
            if (!this._events[e])return;
            var t = 0, n = this._events[e].length;
            if (!n)return;
            for (; t < n; t++)this._events[e][t].apply(this, [].slice.call(arguments, 1))
        }, scrollBy: function (e, t, n, r) {
            e = this.x + e, t = this.y + t, n = n || 0, this.scrollTo(e, t, n, r)
        }, scrollTo: function (t, n, r, i) {
            i = i || e.ease.circular, this.isInTransition = this.options.useTransition && r > 0;
            if (!r || this.options.useTransition && i.style)this._transitionTimingFunction(i.style), this._transitionTime(r), this._translate(t, n)
        }, scrollToElement: function (t, n, r, i, s) {
            t = t.nodeType ? t : this.scroller.querySelector(t);
            if (!t)return;
            var o = e.offset(t);
            o.left -= this.wrapperOffset.left, o.top -= this.wrapperOffset.top, r === !0 && (r = Math.round(t.offsetWidth / 2 - this.wrapper.offsetWidth / 2)), i === !0 && (i = Math.round(t.offsetHeight / 2 - this.wrapper.offsetHeight / 2)), o.left -= r || 0, o.top -= i || 0, o.left = o.left > 0 ? 0 : o.left < this.maxScrollX ? this.maxScrollX : o.left, o.top = o.top > 0 ? 0 : o.top < this.maxScrollY ? this.maxScrollY : o.top, n = n === undefined || n === null || n === "auto" ? Math.max(Math.abs(this.x - o.left), Math.abs(this.y - o.top)) : n, this.scrollTo(o.left, o.top, n, s)
        }, _transitionTime: function (t) {
            t = t || 0, this.scrollerStyle[e.style.transitionDuration] = t + "ms", !t && e.isBadAndroid && (this.scrollerStyle[e.style.transitionDuration] = "0.001s")
        }, _transitionTimingFunction: function (t) {
            this.scrollerStyle[e.style.transitionTimingFunction] = t
        }, _translate: function (t, n) {
            this.options.useTransform ? this.scrollerStyle[e.style.transform] = "translate(" + t + "px," + n + "px)" + this.translateZ : (t = Math.round(t), n = Math.round(n), this.scrollerStyle.left = t + "px", this.scrollerStyle.top = n + "px"), this.x = t, this.y = n
        }, _initEvents: function (t) {
            var n = t ? e.removeEvent : e.addEvent, r = this.options.bindToWrapper ? this.wrapper : window;
            n(window, "orientationchange", this), n(window, "resize", this), this.options.click && n(this.wrapper, "click", this, !0), e.hasTouch && !this.options.disableTouch && (n(this.wrapper, "touchstart", this), n(r, "touchmove", this), n(r, "touchcancel", this), n(r, "touchend", this)), n(this.scroller, "transitionend", this), n(this.scroller, "webkitTransitionEnd", this), n(this.scroller, "oTransitionEnd", this), n(this.scroller, "MSTransitionEnd", this)
        }, getComputedPosition: function () {
            var t = window.getComputedStyle(this.scroller, null), n, r;
            return this.options.useTransform ? (t = t[e.style.transform].split(")")[0].split(", "), n = +(t[12] || t[4]), r = +(t[13] || t[5])) : (n = +t.left.replace(/[^-\d.]/g, ""), r = +t.top.replace(/[^-\d.]/g, "")), {
                x: n,
                y: r
            }
        }, handleEvent: function (e) {
            switch (e.type) {
                case"touchstart":
                case"pointerdown":
                case"MSPointerDown":
                case"mousedown":
                    this._start(e);
                    break;
                case"touchmove":
                case"pointermove":
                case"MSPointerMove":
                case"mousemove":
                    this._move(e);
                    break;
                case"touchend":
                case"pointerup":
                case"MSPointerUp":
                case"mouseup":
                case"touchcancel":
                case"pointercancel":
                case"MSPointerCancel":
                case"mousecancel":
                    this._end(e);
                    break;
                case"orientationchange":
                case"resize":
                    this._resize();
                    break;
                case"transitionend":
                case"webkitTransitionEnd":
                case"oTransitionEnd":
                case"MSTransitionEnd":
                    this._transitionEnd(e);
                    break;
                case"wheel":
                case"DOMMouseScroll":
                case"mousewheel":
                    this._wheel(e);
                    break;
                case"keydown":
                    this._key(e);
                    break;
                case"click":
                    e._constructed || (e.preventDefault(), e.stopPropagation())
            }
        }
    }, t.utils = e, exports.init = function (n, r) {
        var i = new t(n, r);
        return i.utils = e, i
    }
});
;