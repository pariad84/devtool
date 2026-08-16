(function(global) {
    var fn = global.fn;
    var THEME_KEY = 'fn-theme';
    var popupZIndex = 1000;

    (function applyStoredTheme() {
        var saved = fn.localStorage.get({ key: THEME_KEY });
        if (saved === 'dark' || saved === 'light') {
            document.documentElement.setAttribute('data-fn-theme', saved);
        }
    })();

    function isDarkTheme() {
        var attr = document.documentElement.getAttribute('data-fn-theme');
        if (attr === 'dark') return true;
        if (attr === 'light') return false;
        return !!(global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    function toggleTheme(btn) {
        var next = isDarkTheme() ? 'light' : 'dark';
        document.documentElement.setAttribute('data-fn-theme', next);
        fn.localStorage.set({ key: THEME_KEY, value: next });
        if (btn) {
            btn.textContent = next === 'dark' ? '☀️' : '🌙';
        }
    }

    fn.component.layout.set({
        name: 'popup-actions',
        value: function(o = {}) {
            var el = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup-actions',
                },
            });

            fn.element.create({
                parent: el,
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '테마 전환',
                    class: '__popup-btn __popup-theme',
                },
                text: isDarkTheme() ? '☀️' : '🌙',
                event: {
                    click: function() {
                        toggleTheme(this);
                    }
                },
            });

            if (o.action && o.action.edit) {
                fn.element.create({
                    parent: el,
                    tagName: 'button',
                    attribute: {
                        type: 'button',
                        title: '새로 만들기',
                        class: '__popup-btn __popup-edit',
                    },
                    text: '✏️',
                    event: {
                        click: o.action.edit
                    },
                });
            }

            if (o.action && o.action.save) {
                fn.element.create({
                    parent: el,
                    tagName: 'button',
                    attribute: {
                        type: 'button',
                        title: '저장',
                        class: '__popup-btn __popup-save',
                    },
                    text: '💾',
                    event: {
                        click: o.action.save
                    },
                });
            }

            fn.element.create({
                parent: el,
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '새로고침',
                    class: '__popup-btn __popup-refresh',
                },
                text: '↻',
            });

            fn.element.create({
                parent: el,
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '닫기',
                    class: '__popup-btn __popup-close',
                },
                text: '✕',
                event: {
                    click: function() {
                        if (o.onClose) {
                            o.onClose();
                        }
                    }
                },
            });

            return el;
        }
    });

    fn.component.layout.set({
        name: 'popup',
        value: function(o = {}) {
            // 팝업 위치 계산
            var top = 50;
            var left = 50;
            var offset = 30;

            if (o.caller) {
                var callerTop = parseInt(o.caller.style.top) || 50;
                var callerLeft = parseInt(o.caller.style.left) || 50;
                top = callerTop + offset;
                left = callerLeft + offset;
            }

            var popup = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup',
                },
                style: {
                    position: 'fixed',
                    top: top + 'px',
                    left: left + 'px',
                    zIndex: ++popupZIndex,
                },
            });

            var header = fn.element.create({
                parent: popup,
                tagName: 'div',
                attribute: {
                    class: '__popup-header',
                },
            });

            var title = fn.element.create({
                parent: header,
                tagName: 'div',
                attribute: {
                    class: '__popup-title',
                },
                text: o.title || 'Popup',
            });

            var actions = fn.component.create({
                name: 'popup-actions',
                parent: header,
                action: o.action,
                onClose: function() {
                    var popupArray = fn.component.data['popup'];
                    if (popupArray) {
                        var index = popupArray.indexOf(popup);
                        if (index > -1) {
                            popupArray.splice(index, 1);
                        }
                    }
                    popup.classList.add('__popup--leave');
                    setTimeout(function() {
                        popup.remove();
                    }, 200);
                },
            });

            var content = fn.element.create({
                parent: popup,
                tagName: 'div',
                attribute: {
                    class: '__popup-content',
                },
            });

            fn.element.draggable({
                el: popup,
                handle: header,
            });

            popup.addEventListener('mousedown', function() {
                popup.style.zIndex = ++popupZIndex;
            }, true);

            popup.header = header;
            popup.content = content;
            popup.title = title;
            if (o.complete) {
                o.complete({ el: popup });
            }
            return popup;
        }
    });

    fn.component.layout.set({
        name: 'form',
        value: function(o = {columns: [], data: {}}) {
            var el = fn.element.create({
                tagName: 'table',
                attribute: {
                    class: '__form',
                },
            });

            el._inputs = {};

            o.columns.forEach(function(column) {
                var row = fn.element.create({
                    tagName: 'tr',
                    attribute: {
                        class: '__form-row',
                    },
                    parent: el,
                });

                fn.element.create({
                    tagName: 'td',
                    attribute: {
                        class: '__form-label',
                    },
                    text: column.label || column.name,
                    parent: row,
                });

                var valueCell = fn.element.create({
                    tagName: 'td',
                    attribute: {
                        class: '__form-value',
                    },
                    parent: row,
                });

                var input = fn.element.create({
                    tagName: 'input',
                    attribute: {
                        type: column.inputType || 'text',
                        name: column.name,
                        class: '__form-input',
                    },
                    style: {
                        width: column.width || '100%',
                    },
                    parent: valueCell,
                });

                if (o.data[column.name] !== undefined) {
                    input.value = o.data[column.name];
                }

                el._inputs[column.name] = input;
            });

            el.getData = function() {
                var result = {};
                o.columns.forEach(function(column) {
                    var input = el._inputs[column.name];
                    result[column.name] = column.dataType === 'number' ? Number(input.value) : input.value;
                });
                return result;
            };

            el.setData = function(newData) {
                o.columns.forEach(function(column) {
                    var input = el._inputs[column.name];
                    if (newData[column.name] !== undefined) {
                        input.value = newData[column.name];
                    }
                });
            };

            return el;
        }
    });

    fn.component.layout.set({
        name: 'list',
        value: function(o = {columns: [], datas: []}) {
            var el = fn.element.create({
                tagName: 'table',
                attribute: {
                    class: '__list',
                },
            });

            if (o.columns.length) {
                var thead = fn.element.create({
                    tagName: 'thead',
                    parent: el,
                });
                var headRow = fn.element.create({
                    tagName: 'tr',
                    attribute: {
                        class: '__list-head-row',
                    },
                    parent: thead,
                });
                o.columns.forEach(function(column) {
                    fn.element.create({
                        tagName: 'th',
                        attribute: {
                            class: '__list-head-cell',
                        },
                        text: column.label || column.name,
                        style: {
                            width: column.width || 'auto',
                        },
                        parent: headRow,
                    });
                });
            }

            var tbody = fn.element.create({
                tagName: 'tbody',
                parent: el,
            });

            o.datas.forEach(function(data) {
                var clickable = typeof data.action === 'function';
                var row = fn.element.create({
                    tagName: 'tr',
                    attribute: {
                        class: clickable ? '__list-row __list-row--clickable' : '__list-row',
                    },
                    event: {
                        click: function() {
                            if (clickable) {
                                data.action(data);
                            }
                        },
                    },
                    data: data,
                    parent: tbody,
                });

                var cellColumns = o.columns.length ? o.columns : [{ name: 'name', label: '' }];
                cellColumns.forEach(function(column) {
                    fn.element.create({
                        tagName: 'td',
                        attribute: {
                            class: '__list-cell',
                        },
                        text: data[column.name] !== undefined ? data[column.name] : '',
                        parent: row,
                    });
                });
            });

            return el;
        }
    });

    fn.component.layout.set({
        name: 'menu',
        value: function(o = {}) {
            var el = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__menu',
                },
            });
            if (o.datas && Array.isArray(o.datas)) {
                o.datas.forEach(function(data) {
                    fn.element.create({
                        parent: el,
                        tagName: 'div',
                        attribute: {
                            class: '__menu-item',
                        },
                        text: data.name,
                        event: {
                            click: data.action
                        },
                        data: data,
                    });
                });
            }
            return el;
        }
    });
})(window);