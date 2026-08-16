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

    // fn.component.data['popup']을 생성 순서 + bringToFront 이동을 반영한
    // "활성 순서 스택"으로 그대로 활용 — 맨 뒤가 곧 제일 위(활성) 팝업
    function getTopPopup() {
        var popupArray = fn.component.data['popup'];
        return (popupArray && popupArray.length) ? popupArray[popupArray.length - 1] : null;
    }

    function bringToFront(popupEl) {
        popupEl.style.zIndex = ++popupZIndex;
        var popupArray = fn.component.data['popup'];
        if (popupArray) {
            var index = popupArray.indexOf(popupEl);
            if (index > -1) {
                popupArray.splice(index, 1);
                popupArray.push(popupEl);
            }
        }
    }

    function closePopup(popupEl) {
        var popupArray = fn.component.data['popup'];
        if (popupArray) {
            var index = popupArray.indexOf(popupEl);
            if (index > -1) {
                popupArray.splice(index, 1);
            }
        }
        popupEl.classList.add('__popup--leave');
        setTimeout(function() {
            popupEl.remove();
            // 닫힌 팝업 다음으로 남아있는 팝업 중 제일 위(활성)로 포커스를 옮기고,
            // 하나도 안 남았으면 DevTool을 여는 톱니바퀴 버튼으로 되돌린다
            var next = getTopPopup();
            if (next) {
                next.focus();
            } else {
                var toggleBtn = document.querySelector('.__devtool-toggle-btn');
                if (toggleBtn) {
                    toggleBtn.focus();
                }
            }
        }, 200);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var top = getTopPopup();
            if (top) {
                closePopup(top);
            }
        }
    });

    fn.component.layout.set({
        name: 'popup-theme-btn',
        value: function(o = {}) {
            return fn.element.create({
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
        }
    });

    fn.component.layout.set({
        name: 'popup-edit-btn',
        value: function(o = {}) {
            return fn.element.create({
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '새로 만들기',
                    class: '__popup-btn __popup-edit',
                },
                text: '✏️',
                event: {
                    click: o.onClick
                },
            });
        }
    });

    fn.component.layout.set({
        name: 'popup-save-btn',
        value: function(o = {}) {
            return fn.element.create({
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '저장',
                    class: '__popup-btn __popup-save',
                },
                text: '💾',
                event: {
                    click: o.onClick
                },
            });
        }
    });

    fn.component.layout.set({
        name: 'popup-refresh-btn',
        value: function(o = {}) {
            return fn.element.create({
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '새로고침',
                    class: '__popup-btn __popup-refresh',
                },
                text: '↻',
                event: {
                    click: o.onClick
                },
            });
        }
    });

    fn.component.layout.set({
        name: 'popup-close-btn',
        value: function(o = {}) {
            return fn.element.create({
                tagName: 'button',
                attribute: {
                    type: 'button',
                    title: '닫기',
                    class: '__popup-btn __popup-close',
                },
                text: '✕',
                event: {
                    click: o.onClick
                },
            });
        }
    });

    fn.component.layout.set({
        name: 'popup-actions',
        value: function(o = {}) {
            var el = fn.element.create({
                tagName: 'div',
                attribute: {
                    class: '__popup-actions',
                },
            });

            if (o.action && o.action.edit) {
                fn.component.create({
                    name: 'popup-edit-btn',
                    parent: el,
                    onClick: o.action.edit,
                });
            }

            if (o.action && o.action.save) {
                fn.component.create({
                    name: 'popup-save-btn',
                    parent: el,
                    onClick: o.action.save,
                });
            }

            fn.component.create({
                name: 'popup-refresh-btn',
                parent: el,
            });

            fn.component.create({
                name: 'popup-close-btn',
                parent: el,
                onClick: function() {
                    if (o.onClose) {
                        o.onClose();
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
                    tabindex: '-1',
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
                    closePopup(popup);
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

            popup.addEventListener('pointerdown', function() {
                bringToFront(popup);
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
                data: o.data,
            });

            el._inputs = {};

            o.columns.forEach(function(column) {
                if (!column.form) {
                    return;
                }

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
                        type: column.form.inputType || 'text',
                        name: column.name,
                        class: '__form-input',
                    },
                    style: {
                        width: column.form.width || '100%',
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
                    if (!column.form) {
                        return;
                    }
                    var input = el._inputs[column.name];
                    result[column.name] = column.form.dataType === 'number' ? Number(input.value) : input.value;
                });
                return result;
            };

            el.setData = function(newData) {
                o.columns.forEach(function(column) {
                    if (!column.form) {
                        return;
                    }
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

            if (o.columns.some(function(column) { return !!column.list; })) {
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
                    if (!column.list) {
                        return;
                    }
                    fn.element.create({
                        tagName: 'th',
                        attribute: {
                            class: '__list-head-cell',
                        },
                        text: column.label || column.name,
                        style: {
                            width: column.list.width || 'auto',
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

                if (o.columns.length) {
                    o.columns.forEach(function(column) {
                        if (!column.list) {
                            return;
                        }
                        fn.element.create({
                            tagName: 'td',
                            attribute: {
                                class: '__list-cell',
                            },
                            text: data[column.name] !== undefined ? data[column.name] : '',
                            parent: row,
                        });
                    });
                } else {
                    fn.element.create({
                        tagName: 'td',
                        attribute: {
                            class: '__list-cell',
                        },
                        text: data.name !== undefined ? data.name : '',
                        parent: row,
                    });
                }
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