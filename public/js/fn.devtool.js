// ====== DevTool 관련 ======
fn.devtool = {
    isOpen: false,
    toggle: async function() {
        this.isOpen = !this.isOpen;

        var popup = fn.component.create({
            name: 'popup',
            title: 'DevTool',
            parent: document.body,
        });

        // fields가 없는 리소스(Settings 등)는 목록/상세 없이 빈 팝업만 띄움
        function openResource(config) {
            if (!config.fields || !config.fields.length) {
                fn.component.create({
                    name: 'popup',
                    title: config.name,
                    parent: document.body,
                    caller: popup,
                    complete: function(o) {
                        fn.component.create({
                            name: 'popup-theme-btn',
                            parent: o.el.content,
                        });
                    },
                });
                return;
            }

            var resourcePopup;

            async function loadList(container) {
                try {
                    var response = await fn.data.select({ resourceKey: config.resource_key });
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
                } catch (err) {
                    console.error(config.name + ' 목록 조회 실패:', err);
                }
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
                        save: async function() {
                            try {
                                if (isNew) {
                                    await fn.data.insert({ resourceKey: config.resource_key, data: form.getData() });
                                } else {
                                    await fn.data.update({ resourceKey: config.resource_key, id: data.id, data: form.getData() });
                                }
                                detailPopup.classList.add('__popup--leave');
                                setTimeout(function() { detailPopup.remove(); }, 200);
                                loadList(resourcePopup.content);
                            } catch (err) {
                                console.error(config.name + ' 저장 실패:', err);
                            }
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

        // DB 연결이 안 돼서 리소스 목록 조회가 실패하면, 메뉴 대신 접속 정보 입력 폼을 보여주고
        // 저장에 성공하면 다시 이 함수를 호출해 메뉴 로딩을 재시도한다.
        async function loadMenu() {
            popup.content.innerHTML = '';
            try {
                var response = await fn.ajax({ url: '/api/resource', method: 'GET' });
                var resources = response.rows || [];
                fn.component.create({
                    name: 'menu',
                    caller: popup,
                    datas: resources.map(function(config) {
                        return { name: config.name, action: function() { openResource(config); } };
                    }),
                    parent: popup.content,
                });
            } catch (err) {
                console.error('리소스 목록 조회 실패:', err);
                fn.component.create({
                    name: 'db-config-form',
                    parent: popup.content,
                    onSuccess: loadMenu,
                });
            }
        }

        await loadMenu();
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
