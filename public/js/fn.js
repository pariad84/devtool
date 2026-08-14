(function(global) {
    const fn = {};

    
    fn.localStorage = {};
    fn.data = {};
    fn.element = {};
    fn.component = {};
    fn.component.layout = {};
    fn.component.layout.data = {};
    
    fn.ajax = async function (o) {
        
    };

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

    fn.data.get = function(o) {
        return this[o.key];
    }

    fn.data.set = function(o) {
        this[o.key] = o.value;
    }

    fn.element.get = function(o) {
        return document.querySelector(o.selector);
    };

    fn.element.create = function(o) {
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
            o.complete(el);
        }
        el._o = o;
        if (o.datas) {
            el._datas = o.datas || [];
        }
        if (o.data) {
            el._data = o.data || {};
        }
        return el;
    };

    fn.component.create = function(o) {
        var layout = this.layout.get(o);
        var el = layout(o);
        if (o.parent) {
            o.parent.appendChild(el);
        }
        return el;
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
            var popup = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup',
                },
                style: {
                    position: 'fixed',
                    top: '50px',
                    left: '50px',
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    border: '1px solid #d7dce5',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.18)',
                    minWidth: '320px',
                    minHeight: '180px',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    resize: 'both',
                    boxSizing: 'border-box',
                    transform: 'none',
                    fontFamily: 'sans-serif',
                },
            });

            var header = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup-header',
                },
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'move',
                    background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
                    padding: '10px 12px',
                    borderBottom: '1px solid #dfe5ee',
                    userSelect: 'none',
                },
            });

            var title = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup-title',
                },
                text: o.title || 'Popup',
                style: {
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#1f2937',
                    letterSpacing: '0.02em',
                },
            });

            var actions = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup-actions',
                },
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                },
            });

            var saveBtn = fn.element.create({
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '저장',
                    class: '__popup-btn __popup-save',
                },
                text: '💾',
                style: {
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    borderRadius: '8px',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: '1',
                    padding: '0',
                },
            });

            var refreshBtn = fn.element.create({
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '새로고침',
                    class: '__popup-btn __popup-refresh',
                },
                text: '↻',
                style: {
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    borderRadius: '8px',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: '1',
                    padding: '0',
                },
            });

            var closeBtn = fn.element.create({
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '닫기',
                    class: '__popup-btn __popup-close',
                },
                text: '✕',
                style: {
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    borderRadius: '8px',
                    width: '28px',
                    height: '28px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    lineHeight: '1',
                    padding: '0',
                },
                event: {
                    click: function() {
                        popup.remove();
                    }
                },
            });

            actions.appendChild(saveBtn);
            actions.appendChild(refreshBtn);
            actions.appendChild(closeBtn);
            header.appendChild(title);
            header.appendChild(actions);
            popup.appendChild(header);

            var content = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup-content',
                },
                style: {
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    minHeight: '120px',
                },
            });
            popup.appendChild(content);

            $(popup).draggable({
                handle: header,
            });
            
            popup.header = header;
            popup.content = content;
            popup.title = title;
            popup.actions = actions;
            popup.saveBtn = saveBtn;
            popup.refreshBtn = refreshBtn;
            popup.closeBtn = closeBtn;
            return popup;
        }
    });

    fn.component.layout.set({
        name: 'table',
        value: function(o) {
            var el = fn.element.create({
                tagName: 'table',
                attribute: {
                    class: '__table',
                },
                style: {
                    
                },
            });
            return el;
        }
    });

    fn.component.layout.set({
        name: 'list',
        value: function(o) {
            var el = fn.element.create({
                tagName: 'table',
                attribute: {
                    class: '__list',
                },
                style: {
                    
                },
            });
            return el;
        }
    });

    fn.component.layout.set({
        name: 'menu',
        value: function(o) {
            var el = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__menu',
                },
                style: {
                    
                },
            });
            if (o.datas && Array.isArray(o.datas)) {
                o.datas.forEach(function(data) {
                    var item = fn.element.create({
                        tagName: 'div',
                        attribute: {
                            class: '__menu-item',
                        },
                        text: data.name,
                        style: {
                            padding: '5px 10px',
                            cursor: 'pointer',
                        },
                        event: {
                            click: data.action
                        },
                        data: data,
                    });
                    el.appendChild(item);
                });
            }
            return el;
        }
    });

    global.fn = fn;
})(window);
