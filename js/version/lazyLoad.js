/**
 * Created by schp-tany on 2015/12/1.
 */
define('lazyLoad', function (require, exports, module) {
    var _cacheThisModule_;
    var $ = require('zepto');
    var g = {};
    g.autoLoadImage = function (option) {
        var opt = {scrollOffsetH: 100, initSrcName: 'init_src', container: document.body, fadeIn: false, zoom: 1};
        if (option) {
            for (var key in option) {
                opt[key] = option[key];
            }
        }
        function init() {
            var cont = typeof opt.container == "string" ? $("#" + opt.container) : $(opt.container);
            var objImages = $("img[" + opt.initSrcName + "]", cont);
            objImages.each(function (i) {
                var dom = $(this);
                images_data.cache.push({
                    url: dom.attr(opt.initSrcName),
                    obj: dom,
                    top: dom[0].getBoundingClientRect().top * opt.zoom + window.pageYOffset
                });
            });
            images_data.num = images_data.cache.length;
        }

        var images_data = {viewHeight: $(window).height(), ptr: "", cache: [], num: 0};
        init();
        if (images_data.ptr) {
            clearInterval(images_data.ptr);
        }
        images_data.ptr = setInterval(doScroll, 100);
        function doScroll() {
            var scrollHeight = window.pageYOffset, visibleHeight = images_data.viewHeight + opt.scrollOffsetH + scrollHeight;
            $.each(images_data.cache, function (i, data) {
                var element = data.obj, loaded = element.attr("loaded");
                if (visibleHeight > data.top && !loaded) {
                    element.attr("src", data.url);
                    element.removeAttr(opt.initSrcName);
                    element.attr("loaded", images_data.num);
                    opt.fadeIn && element.css("opacity", "1");
                    images_data.num--;
                }
            });
            if (images_data.num == 0) {
                clearInterval(images_data.ptr);
                images_data.ptr = null;
            }
            opt.callback && opt.callback();
        }
    }
    module.exports = g;
});