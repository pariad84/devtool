(function(global) {
    const fn = {};


    fn.localStorage = {};
    fn.data = {};
    fn.element = {};
    fn.function = {};
    fn.function.position = {};
    fn.component = {};
    fn.component.data = {};
    fn.component.layout = {};
    fn.component.layout.data = {};

    fn.ajax = async function (o = {}) {
        $.ajax({
            url: o.url,
            method: o.method || 'POST',
            contentType: o.contentType || 'application/json; charset=UTF-8',
            data: JSON.stringify(o.data || {}),
            success: function(response) {
                if (o.success) {
                    o.success(response);
                }
            },
            error: function(xhr, status, error) {
                if (o.error) {
                    o.error(xhr, status, error);
                }
            }
        });
    };

    fn.localStorage.get = function(o = {}) {
        if (typeof(Storage) !== "undefined") {
            return localStorage.getItem(o.key);
        }
        return null;
    };

    fn.localStorage.set = function(o = {}) {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem(o.key, o.value);
        }
    };

    fn.data.get = function(o = {}) {
        return this[o.key];
    }

    fn.data.set = function(o = {}) {
        this[o.key] = o.value;
    }

    fn.element.get = function(o = {}) {
        return document.querySelector(o.selector);
    };

    fn.element.create = function(o = {}) {
        var el = document.createElement(o.tagName);
        if (o.attribute) {
            for (const [key, value] of Object.entries(o.attribute)) {
                el.setAttribute(key, value);
            }
        }

        if (o.style) {
            for (const [key, value] of Object.entries(o.style)) {
                el.style[key] = value;
            }
        }
        if (o.parent) {
            o.parent.appendChild(el);
        }
        if (o.html) {
            el.innerHTML = o.html;
        }
        if (o.text) {
            el.textContent = o.text;
        }
        if (o.event) {
            for (const [eventType, eventHandler] of Object.entries(o.event)) {
                el.addEventListener(eventType, eventHandler);
            }
        }
        if (o.complete) {
            o.complete({el: el});
        }
        el._o = o;
        if (o.datas) {
            el._datas = o.datas || [];
        }
        if (o.data) {
            el._data = o.data || {};
        }
        if (o.caller) {
            el._caller = o.caller;
        }
        return el;
    };

    fn.function.position.get = function(o = {}) {
        var rect = o.el.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
        };
    }

    fn.component.create = function(o = {}) {
        var layout = this.layout.get(o);
        var el = layout(o);

        // 레이아웃별로 컴포넌트를 fn.component.data에 저장
        if (!this.data[o.name]) {
            this.data[o.name] = [];
        }
        this.data[o.name].push(el);

        if (o.parent) {
            o.parent.appendChild(el);
        }
        return el;
    };

    fn.component.layout.set = function(o = {}) {
        this.data[o.name] = o.value;
    };

    fn.component.layout.get = function(o = {}) {
        return this.data[o.name];
    }

    global.fn = fn;
})(window);
