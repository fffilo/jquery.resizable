;(function($, window) {

    "use strict";

    /**
     * Constructor
     *
     * @param {Object} element HTML node
     * @param {Object} options see window.Resizable.prototype._defaults
     * @return {Void}
     */
    window.Resizable = function(element, options) {
        this.element = element;
        this.options = options;

        this.init();
    }

    /**
     * Resizable prototype
     *
     * @type {Object}
     */
    window.Resizable.prototype = {

        /**
         * Default options
         *
         * @type {Object}
         */
        _defaults: {
            handles: [ "n", "e", "s", "w", "ne", "se", "sw", "nw" ]
        },

        /**
         * Handle mousedown event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handle_mousedown: function(e) {
            if (e.which !== 1) return;

            var that = this;
            var data = {
                element: this.element,
                handle: $(e.target).attr("data-jquery-resizable-direction"),
                startStyle: {
                    left: $(this.element).position().left,
                    top: $(this.element).position().top,
                    width: $(this.element).width(),
                    minWidth: parseInt($(this.element).css("min-width")),
                    height: $(this.element).height(),
                    minHeight: parseInt($(this.element).css("min-height"))
                },
                position: {
                    start: {
                        x: e.pageX,
                        y: e.pageY
                    },
                    current: null,
                    stop: null
                }
            }

            $("body")
                .addClass("jquery-resizable-" + data.handle);

            $(window)
                .data("jquery-resizable", data)
                .on("mousemove.jquery-resizable", function(e) {
                    that._handle_mousemove.call(that, e);
                })
                .on("mouseup.jquery-resizable", function(e) {
                    that._handle_mouseup.call(that, e);
                });

            e.preventDefault();
        },

        /**
         * Window mousemove event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handle_mousemove: function(e) {
            var data = $(window).data("jquery-resizable");
            if (!data.position.current) {
                $(data.element).trigger("resizablestart", data);
            }

            data.position.current = {
                x: e.pageX,
                y: e.pageY
            }

            this._set_size();

            $(data.element).trigger("resizablemove", data);
        },

        /**
         * Window mouseup event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handle_mouseup: function(e) {
            var data = $(window).data("jquery-resizable");
            data.position.stop = {
                x: e.pageX,
                y: e.pageY
            }
            $(data.element).trigger("resizablestop", data);

            $(window)
                .removeData("jquery-resizable")
                .off(".jquery-resizable");

            $("body")
                .removeClass("jquery-resizable-" + data.handle);
        },

        /**
         * Set element size
         *
         * @return {Void}
         */
        _set_size: function() {
            var data = $(window).data("jquery-resizable");
            if (!data) return;

            var stl = data.startStyle
            var hdl = data.handle;
            var pos = data.position;
            var css = $.extend({}, stl);

            // auto right/bottom
            css.right = "auto";
            css.bottom = "auto";

            // calculate new position/size
            if (hdl.indexOf("n") !== -1) css.top -= pos.start.y - pos.current.y;
            if (hdl.indexOf("n") !== -1) css.height += pos.start.y - pos.current.y;
            if (hdl.indexOf("e") !== -1) css.width += pos.current.x - pos.start.x;
            if (hdl.indexOf("s") !== -1) css.height += pos.current.y - pos.start.y;
            if (hdl.indexOf("w") !== -1) css.left -= pos.start.x - pos.current.x;
            if (hdl.indexOf("w") !== -1) css.width += pos.start.x - pos.current.x;

            // fix size (check min-width/min-height)
            if (hdl.indexOf("w") !== -1 && css.width < stl.minWidth) css.left = stl.left + stl.width - stl.minWidth;
            if (css.width < stl.minWidth) css.width = stl.minWidth;
            if (hdl.indexOf("n") !== -1 && css.height < stl.minHeight) css.top = stl.top + stl.height - stl.minHeight;
            if (css.height < stl.minHeight) css.height = stl.minHeight;

            // set style
            $(data.element).css(css);
        },

        /**
         * Initialize
         *
         * @return {Void}
         */
        init: function() {
            var that = this;
            that.options = $.extend({}, that._defaults, that.options);

            $(that.element)
                .addClass("jquery-resizable")
                .data("jquery-resizable", that);

            // create handles
            $.each(that.options.handles, function() {
                $("<div />")
                    .attr("class", "jquery-resizable-handle")
                    .attr("data-jquery-resizable-direction", this)
                    .on("mousedown.jquery-resizable", function(e) {
                        that._handle_mousedown.call(that, e);
                    })
                    .appendTo(that.element);
            });
        },

        /**
         * Destroy
         *
         * @return {Void}
         */
        destroy: function() {
            $(this.element)
                .removeClass("jquery-resizable")
                .removeData("jquery-resizable")
                .find(".jquery-resizable-handle")
                    .remove();
        }

    }

    // jQuery plugin
    $.fn.resizable = function(options) {
        return $(this).each(function() {
            // check
            var lib = $(this).data("jquery-resizable");

            // init
            if (!lib) {
                lib = new Resizable(this, typeof options === "object" ? options : {});
            }

            // global methods
            if (typeof options === "string" && options.substr(0,1) !== "_" && options in lib) {
                return lib[options]();
            }
        });
    }

})(jQuery, window);
