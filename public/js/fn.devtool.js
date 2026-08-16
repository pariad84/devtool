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
                    var memoPopup;

                    var memoColumns = [
                        { name: 'id', label: 'ID', width: '60px', dataType: 'number', inputType: 'text' },
                        { name: 'name', label: 'Name', width: '200px', dataType: 'string', inputType: 'text' },
                        { name: 'status', label: 'Status', width: '100px', dataType: 'string', inputType: 'text' }
                    ];
                    var memoDetailColumns = memoColumns.concat([
                        { name: 'content', label: 'Content', width: '100%', dataType: 'string', inputType: 'text' }
                    ]);

                    function loadMemoList(container) {
                        fn.ajax({
                            url: '/api/memo',
                            method: 'GET',
                            success: function(response) {
                                var rows = (response.rows || []).map(function(row) {
                                    row.action = openMemoDetail;
                                    return row;
                                });
                                container.innerHTML = '';
                                fn.component.create({
                                    name: 'list',
                                    parent: container,
                                    columns: memoColumns,
                                    datas: rows,
                                });
                            },
                            error: function(err) {
                                console.error('메모 목록 조회 실패:', err);
                            }
                        });
                    }

                    function openMemoDetail(data) {
                        var isNew = !(data && data.id);
                        var form;
                        var detailPopup;

                        detailPopup = fn.component.create({
                            name: 'popup',
                            title: isNew ? '새 Memo' : ('Memo 상세 (' + data.name + ')'),
                            parent: document.body,
                            caller: memoPopup,
                            action: {
                                save: function() {
                                    fn.ajax({
                                        url: isNew ? '/api/memo' : ('/api/memo/' + data.id),
                                        method: isNew ? 'POST' : 'PUT',
                                        data: form.getData(),
                                        success: function() {
                                            detailPopup.classList.add('__popup--leave');
                                            setTimeout(function() { detailPopup.remove(); }, 200);
                                            loadMemoList(memoPopup.content);
                                        },
                                        error: function(err) {
                                            console.error('메모 저장 실패:', err);
                                        }
                                    });
                                }
                            },
                            complete: function(o) {
                                form = fn.component.create({
                                    name: 'form',
                                    parent: o.el.content,
                                    columns: memoDetailColumns,
                                    data: data,
                                });
                            }
                        });
                    }

                    memoPopup = fn.component.create({
                        name: 'popup',
                        title: 'Memo',
                        parent: document.body,
                        caller: popup,
                        action: {
                            edit: function() { openMemoDetail({}); }
                        },
                        complete: function(o) {
                            loadMemoList(o.el.content);
                        }
                    });
                } },
                { name: 'Bookmark', action: function() {
                    var bookmarkPopup;

                    var bookmarkColumns = [
                        { name: 'id', label: 'ID', width: '60px', dataType: 'number', inputType: 'text' },
                        { name: 'name', label: 'Name', width: '200px', dataType: 'string', inputType: 'text' },
                        { name: 'status', label: 'Status', width: '100px', dataType: 'string', inputType: 'text' }
                    ];
                    var bookmarkDetailColumns = bookmarkColumns.concat([
                        { name: 'url', label: 'URL', width: '100%', dataType: 'string', inputType: 'text' }
                    ]);

                    function loadBookmarkList(container) {
                        fn.ajax({
                            url: '/api/bookmark',
                            method: 'GET',
                            success: function(response) {
                                var rows = (response.rows || []).map(function(row) {
                                    row.action = openBookmarkDetail;
                                    return row;
                                });
                                container.innerHTML = '';
                                fn.component.create({
                                    name: 'list',
                                    parent: container,
                                    columns: bookmarkColumns,
                                    datas: rows,
                                });
                            },
                            error: function(err) {
                                console.error('북마크 목록 조회 실패:', err);
                            }
                        });
                    }

                    function openBookmarkDetail(data) {
                        var isNew = !(data && data.id);
                        var form;
                        var detailPopup;

                        detailPopup = fn.component.create({
                            name: 'popup',
                            title: isNew ? '새 Bookmark' : ('Bookmark 상세 (' + data.name + ')'),
                            parent: document.body,
                            caller: bookmarkPopup,
                            action: {
                                save: function() {
                                    fn.ajax({
                                        url: isNew ? '/api/bookmark' : ('/api/bookmark/' + data.id),
                                        method: isNew ? 'POST' : 'PUT',
                                        data: form.getData(),
                                        success: function() {
                                            detailPopup.classList.add('__popup--leave');
                                            setTimeout(function() { detailPopup.remove(); }, 200);
                                            loadBookmarkList(bookmarkPopup.content);
                                        },
                                        error: function(err) {
                                            console.error('북마크 저장 실패:', err);
                                        }
                                    });
                                }
                            },
                            complete: function(o) {
                                form = fn.component.create({
                                    name: 'form',
                                    parent: o.el.content,
                                    columns: bookmarkDetailColumns,
                                    data: data,
                                });
                            }
                        });
                    }

                    bookmarkPopup = fn.component.create({
                        name: 'popup',
                        title: 'Bookmark',
                        parent: document.body,
                        caller: popup,
                        action: {
                            edit: function() { openBookmarkDetail({}); }
                        },
                        complete: function(o) {
                            loadBookmarkList(o.el.content);
                        }
                    });
                } },
                { name: 'Settings', action: function() {
                    fn.component.create({
                        name: 'popup',
                        title: 'Settings',
                        parent: document.body,
                        caller: popup,
                        complete: function(o) {
                            
                        }
                    });
                } },
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