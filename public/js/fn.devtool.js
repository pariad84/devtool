// ====== DevTool 관련 ======
fn.devtool = {
    isOpen: false,
    toggle: function() {
        this.isOpen = !this.isOpen;
        console.log('DevTool ' + (this.isOpen ? '열림' : '닫힘'));

        var popup = fn.component.create({
            name: 'popup',
            title: 'DevTool',
            parent: document.body,
            action: {
                save: function() {
                    console.log('DevTool 저장');
                }
            }
        });

        // fields가 없는 리소스(Settings 등)는 목록/상세 없이 빈 팝업만 띄움
        function openResource(config) {
            if (!config.fields || !config.fields.length) {
                fn.component.create({
                    name: 'popup',
                    title: config.name,
                    parent: document.body,
                    caller: popup,
                });
                return;
            }

            var resourcePopup;

            function loadList(container) {
                fn.ajax({
                    url: '/api/' + config.resource_key,
                    method: 'GET',
                    success: function(response) {
                        var rows = (response.rows || []).map(function(row) {
                            row.action = openDetail;
                            return row;
                        });
                        container.innerHTML = '';
                        fn.component.create({
                            name: 'list',
                            parent: container,
                            columns: config.fields,
                            datas: rows,
                        });
                    },
                    error: function(err) {
                        console.error(config.name + ' 목록 조회 실패:', err);
                    }
                });
            }

            function openDetail(data) {
                var isNew = !(data && data.id);
                var form;
                var detailPopup;

                detailPopup = fn.component.create({
                    name: 'popup',
                    title: isNew ? ('새 ' + config.name) : (config.name + ' 상세 (' + data.name + ')'),
                    parent: document.body,
                    caller: resourcePopup,
                    action: {
                        save: function() {
                            fn.ajax({
                                url: isNew ? ('/api/' + config.resource_key) : ('/api/' + config.resource_key + '/' + data.id),
                                method: isNew ? 'POST' : 'PUT',
                                data: form.getData(),
                                success: function() {
                                    detailPopup.classList.add('__popup--leave');
                                    setTimeout(function() { detailPopup.remove(); }, 200);
                                    loadList(resourcePopup.content);
                                },
                                error: function(err) {
                                    console.error(config.name + ' 저장 실패:', err);
                                }
                            });
                        }
                    },
                    complete: function(o) {
                        form = fn.component.create({
                            name: 'form',
                            parent: o.el.content,
                            columns: config.fields,
                            data: data,
                        });
                    }
                });
            }

            resourcePopup = fn.component.create({
                name: 'popup',
                title: config.name,
                parent: document.body,
                caller: popup,
                action: {
                    edit: function() { openDetail({}); }
                },
                complete: function(o) {
                    loadList(o.el.content);
                }
            });
        }

        fn.ajax({
            url: '/api/resource',
            method: 'GET',
            success: function(response) {
                var resources = response.rows || [];
                fn.component.create({
                    name: 'menu',
                    caller: popup,
                    datas: resources.map(function(config) {
                        return { name: config.name, action: function() { openResource(config); } };
                    }),
                    parent: popup.content,
                });
            },
            error: function(err) {
                console.error('리소스 목록 조회 실패:', err);
            }
        });

        console.log(popup);
    }
};

// 화면 우측 하단에 톱니바퀴 고정 아이콘
document.addEventListener('DOMContentLoaded', function() {
    fn.element.create({
        tagName: 'button',
        attribute: {
            type: 'button',
            title: 'DevTool 열기 (Ctrl+`)',
            class: '__devtool-toggle-btn',
        },
        text: '⚙',
        event: {
            click: function() {
                fn.devtool.toggle();
            },
        },
        parent: document.body,
    });
});
