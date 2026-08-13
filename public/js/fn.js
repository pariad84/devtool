(function(global) {
    const fn = {};

    fn.element = {};
    fn.component = {};
    fn.component.layout = {};
    fn.component.layout.data = {};

    fn.element.get = function(o) {
        return document.querySelector(o.selector);
    };

    fn.element.create = function(o) {
        var el = document.createElement(o.tagName);
        for (const [key, value] of Object.entries(o.attributes)) {
            el.setAttribute(key, value);
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
        return el;
    };

    fn.component.create = function(o) {
        var layout = this.layout.get(o);
        return layout.value(o);
    };

    fn.component.layout.set = function(o) {
        this.data[o.name] = o.value;
    };

    fn.component.layout.get = function(o) {
        return this.data[o.name];
    }

    fn.component.layout.set({
        name: 'popup',
        value: function(o) {
            fn.element.create({
                tagName: 'div',
                attributes: {
                    id: 'popup',
                    style: 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border: 1px solid black; padding: 20px; z-index: 1000;',
                },
            });
        }
    });

    fn.localStorage = {};

    fn.localStorage.get = function(o) {
        if (typeof(Storage) !== "undefined") {
            return localStorage.getItem(o.key);
        }
        return null;
    };

    fn.localStorage.set = function(o) {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem(o.key, o.value);
        }
    };

    global.fn = fn;
})(window);
