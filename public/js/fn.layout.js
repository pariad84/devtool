(function(global) {
    var fn = global.fn;

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
                parent: popup,
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
                parent: header,
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
                parent: header,
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

            if (o.action && o.action.save) {
                fn.element.create({
                    parent: actions,
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
                    event: {
                        click: o.action.save
                    },
                });
            }

            fn.element.create({
                parent: actions,
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

            fn.element.create({
                parent: actions,
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
                        var popupArray = fn.component.data['popup'];
                        if (popupArray) {
                            var index = popupArray.indexOf(popup);
                            if (index > -1) {
                                popupArray.splice(index, 1);
                            }
                        }
                        popup.remove();
                    }
                },
            });

            var content = fn.element.create({
                parent: popup,
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

            $(popup).draggable({
                handle: header,
            });

            popup.addEventListener('click', function(e) {
                popup.parentElement.appendChild(popup);
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
                style: {
                    width: '100%',
                    borderCollapse: 'collapse',
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
                    style: {
                        padding: '6px 8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#374151',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                    },
                    parent: row,
                });

                var valueCell = fn.element.create({
                    tagName: 'td',
                    attribute: {
                        class: '__form-value',
                    },
                    style: {
                        padding: '6px 8px',
                        width: '100%',
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
                        boxSizing: 'border-box',
                        padding: '4px 6px',
                        fontSize: '13px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
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
                style: {
                    width: '100%',
                    borderCollapse: 'collapse',
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
                            padding: '6px 8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textAlign: 'left',
                            color: '#374151',
                            borderBottom: '2px solid #e5e7eb',
                            whiteSpace: 'nowrap',
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
                var row = fn.element.create({
                    tagName: 'tr',
                    attribute: {
                        class: '__list-row',
                    },
                    style: {
                        cursor: typeof data.action === 'function' ? 'pointer' : 'default',
                    },
                    event: {
                        click: function() {
                            if (typeof data.action === 'function') {
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
                        style: {
                            padding: '6px 8px',
                            fontSize: '13px',
                            color: '#1f2937',
                            borderBottom: '1px solid #f1f5f9',
                        },
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
})(window);