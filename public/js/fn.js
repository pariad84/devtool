(function(global) {
    const fn = {};

    fn.localStorage = {};
    fn.element = {};
    fn.component = {};
    fn.component.data = {};
    fn.component.layout = {};
    fn.component.layout.data = {};

    fn.ajax = async function (o = {}) {
        var method = (o.method || 'POST').toUpperCase();
        var options = { method: method };
        if (method !== 'GET' && method !== 'HEAD') {
            options.headers = { 'Content-Type': o.contentType || 'application/json; charset=UTF-8' };
            options.body = JSON.stringify(o.data || {});
        }

        try {
            var response = await fetch(o.url, options);
            var result = await response.json();
            if (!response.ok) {
                if (o.error) {
                    o.error(result, response.status);
                }
                return;
            }
            if (o.success) {
                o.success(result);
            }
            return result;
        } catch (err) {
            if (o.error) {
                o.error(err);
            }
        }
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

    fn.element.draggable = function(o = {}) {
        var el = o.el;
        var handle = o.handle || el;
        var startX, startY, startLeft, startTop;

        function onPointerMove(e) {
            el.style.left = (startLeft + (e.clientX - startX)) + 'px';
            el.style.top = (startTop + (e.clientY - startY)) + 'px';
        }

        function onPointerUp() {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        }

        handle.style.touchAction = 'none';
        handle.addEventListener('pointerdown', function(e) {
            if (e.target.closest('button, input, select, textarea')) {
                return;
            }
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            var rect = el.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
        });
    };

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
