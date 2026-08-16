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
        var menu = fn.component.create({
            name: 'menu',
            caller: popup,
            datas: [
                { name: 'Memo', action: function() {
                    fn.component.create({
                        name: 'popup',
                        title: 'Memo',
                        parent: document.body,
                        caller: popup,
                        complete: function(o) {
                            var memoPopup = o.el;

                            var memoColumns = [
                                { name: 'id', label: 'ID', width: '60px', dataType: 'number', inputType: 'text' },
                                { name: 'name', label: 'Name', width: '200px', dataType: 'string', inputType: 'text' },
                                { name: 'status', label: 'Status', width: '100px', dataType: 'string', inputType: 'text' }
                            ];
                            var memoDetailColumns = memoColumns.concat([
                                { name: 'content', label: 'Content', width: '100%', dataType: 'string', inputType: 'text' }
                            ]);

                            function openMemoDetail(data) {
                                fn.component.create({
                                    name: 'popup',
                                    title: 'Memo 상세 (' + data.name + ')',
                                    parent: document.body,
                                    caller: memoPopup,
                                    complete: function(o) {
                                        fn.component.create({
                                            name: 'form',
                                            parent: o.el.content,
                                            columns: memoDetailColumns,
                                            data: data,
                                        });
                                    }
                                });
                            }

                            fn.ajax({
                                url: '/api/memo',
                                method: 'GET',
                                success: function(response) {
                                    var rows = (response.rows || []).map(function(row) {
                                        row.action = openMemoDetail;
                                        return row;
                                    });
                                    fn.component.create({
                                        name: 'list',
                                        parent: memoPopup.content,
                                        columns: memoColumns,
                                        datas: rows,
                                    });
                                },
                                error: function(xhr, status, error) {
                                    console.error('메모 목록 조회 실패:', error);
                                }
                            });
                        }
                    });
                } },
                { name: 'Bookmark', action: function() {
                    fn.component.create({
                        name: 'popup',
                        title: 'Bookmark',
                        parent: document.body,
                        caller: popup,
                        complete: function(o) {
                            var list = fn.component.create({
                                name: 'list',
                                parent: o.el.content,
                                columns: [
                                    { name: 'ID', label: 'ID', width: '60px', dataType: 'number', inputType: 'text' },
                                    { name: 'Name', label: 'Name', width: '200px', dataType: 'string', inputType: 'text' },
                                    { name: 'Status', label: 'Status', width: '100px', dataType: 'string', inputType: 'text' }
                                ],
                                datas: [
                                    { ID: 1, Name: 'List Item 1', Status: 'Active', action: function() { console.log('List Item 1 clicked'); } },
                                    { ID: 2, Name: 'List Item 2', Status: 'Inactive', action: function() { console.log('List Item 2 clicked'); } },
                                    { ID: 3, Name: 'List Item 3', Status: 'Active', action: function() { console.log('List Item 3 clicked'); } },
                                ],
                            });
                        }
                    });
                } },
                { name: 'Menu 3', action: function() { console.log('Menu 3 clicked'); } },
            ],
            parent: popup.content,
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