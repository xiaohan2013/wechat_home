/**
 * Created by schp-tany on 2015/12/1.
 */
define('loopScroll', function (require, exports, module) {
    var _cacheThisModule_;
    var $ = require('zepto');
    var scroll = function (o) {
        this.opt = {
            tp: 'text',
            moveDom: null,
            moveChild: [],
            tab: [],
            viewDom: null,
            touchDom2: [],
            sp: null,
            min: 0,
            minp: 0,
            step: 0,
            len: 1,
            index: 1,
            offset: 0,
            loadImg: false,
            image: [],
            loopScroll: false,
            lockScrY: false,
            stopOnce: false,
            autoTime: 0,
            holdAuto: false,
            tabClass: 'cur',
            transition: 0.3,
            imgInit: true,
            imgInitLazy: 4000,
            enableTransX: false,
            fun: function () {
            }
        };
        $.extend(this, this.opt, o);
        this.len = this.moveChild.length;
        this.min = this.min || {'text': 100, 'img': 1}[this.tp];
        this.minp = this.minp || Math.max(this.min, 30);
        if (!this.viewDom)this.viewDom = $(window);
        if (this.len > 1)this.startEvent();
        if (this.loadImg)this.image = this.moveDom.find('img');
        this.resize(this.step || this.moveChild.eq(0).width());
        if (this.autoTime) {
            var obj = this;
            setInterval(function () {
                if (!obj.holdAuto) {
                    if (!obj.stopOnce)obj.stepMove(obj.index + 1);
                    obj.stopOnce = false;
                }
            }, this.autoTime);
        }
    };
    $.extend(scroll.prototype, {
        resize: function (step) {
            this.step = step || this.step;
            var harf = (this.viewDom.width() - this.step) / 2;
            this.offset = this.loopScroll ? this.step - harf : harf;
            if (this.len == 1)this.offset = -harf;
            this.stepMove(this.index, true);
        }, addChild: function (dom, tabDom) {
            if (!this.loopScroll)return;
            this.moveChild.eq(0).after(dom);
            this.len += 1;
            this.tab.eq(this.len - 2).after(tabDom);
            this.tab = this.tab.parent().children();
            if (this.len == 2) {
                this.moveChild = this.moveDom.children();
                this.startEvent();
            }
            else {
                this.stepMove(2);
            }
        }, startEvent: function () {
            var obj = this, mid = this.moveDom.get(0), ael = function (dom) {
                dom.addEventListener("touchstart", obj, false);
                dom.addEventListener("touchmove", obj, false);
                dom.addEventListener("touchend", obj, false);
                dom.addEventListener("touchcancel", obj, false);
                dom.addEventListener("webkitTransitionEnd", obj, false);
            };
            ael(mid);
            this.tab.each(function (i, em) {
                $(em).attr('no', i + 1);
                $(em).click(function () {
                    obj.stepMove($(this).attr('no'));
                });
            });
            if (this.loopScroll) {
                this.moveDom.append(this.moveChild.eq(0).clone());
                var last = this.moveChild.eq(this.len - 1).clone();
                this.moveDom.prepend(last);
            }
            for (var i = 0; i < this.touchDom2.length; i++) {
                ael(this.touchDom2[i]);
            }
            ;
        }, handleEvent: function (e) {
            switch (e.type) {
                case"touchstart":
                    this.sp = this.getPosition(e);
                    this.holdAuto = true;
                    this.stopOnce = true;
                    break;
                case"touchmove":
                    this.touchmove(e);
                    break;
                case"touchend":
                case"touchcancel":
                    this.move(e);
                    this.holdAuto = false;
                    break;
                case"webkitTransitionEnd":
                    e.preventDefault();
                    break;
            }
        }, getPosition: function (e) {
            var touch = e.changedTouches ? e.changedTouches[0] : e;
            return {x: touch.pageX, y: touch.pageY};
        }, touchmove: function (e) {
            var mp = this.getPosition(e), x = mp.x - this.sp.x, y = mp.y - this.sp.y;
            if (Math.abs(x) - Math.abs(y) > this.min) {
                e.preventDefault();
                var offset = x - this.step * (this.index - 1) - this.offset;
                this.moveDom.css({
                    "-webkit-backface-visibility": "hidden",
                    "-webkit-transform": this.enableTransX ? "translateX(" + (this.loopScroll ? this.index : this.index - 1) * (-100) + "%)" : "translate3D(" + offset + "px,0,0)",
                    "-webkit-transition": "0"
                });
            } else {
                if (!this.lockScrY)e.preventDefault();
            }
        }, move: function (e) {
            var mp = this.getPosition(e), x = mp.x - this.sp.x, y = mp.y - this.sp.y;
            if (Math.abs(x) < Math.abs(y) || Math.abs(x) < this.minp) {
                this.stepMove(this.index);
                return;
            }
            if (x > 0) {
                e.preventDefault();
                this.stepMove(this.index - 1);
            } else {
                e.preventDefault();
                this.stepMove(this.index + 1);
            }
        }, loadImage: function (no) {
            var img = this.image;
            var setImg = function (i) {
                if (img[i] && $(img[i]).attr('back_src')) {
                    img[i].src = $(img[i]).attr('back_src');
                    $(img[i]).removeAttr('back_src');
                }
            };
            setImg(no);
            (function (n, flag, t) {
                setTimeout(function () {
                    setImg(n - 1);
                    setImg(n + 1);
                }, flag ? t : 0);
            })(no, this.imgInit, this.imgInitLazy);
            this.imgInit = false;
        }, stepMove: function (no, isSetOffsetIndex) {
            this.index = no > this.len ? this.len : no < 1 ? 1 : no;
            this.tab.removeClass(this.tabClass);
            this.tab.eq(this.index - 1).addClass(this.tabClass);
            var tran = -this.step * ((this.loopScroll ? no : this.index) - 1) - this.offset;
            this.moveDom.css({
                "-webkit-transform": this.enableTransX ? "translateX(" + (this.loopScroll ? no : this.index - 1) * (-100) + "%)" : "translate3D(" + tran + "px,0,0)",
                "-webkit-transition": isSetOffsetIndex ? "0ms" : "all " + this.transition + "s ease"
            });
            if (this.loadImg)this.loadImage(this.index);
            this.fun(this.index);
            if (this.loopScroll && !isSetOffsetIndex) {
                var obj = this, cindex = no;
                if (no <= 0)cindex = this.len;
                if (no > this.len)cindex = 1;
                if (cindex != no)
                    setTimeout(function () {
                        obj.stepMove(cindex, true);
                    }, this.transition * 1000);
            }
        }
    });
    exports.init = function (opt) {
        return new scroll(opt);
    };
});