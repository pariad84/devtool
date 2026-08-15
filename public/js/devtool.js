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
                            var list = fn.component.create({
                                name: 'list',
                                parent: o.popup.content,
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
                { name: 'Bookmark', action: function() {
                    fn.component.create({
                        name: 'popup',
                        title: 'Bookmark',
                        parent: document.body,
                        caller: popup,
                        complete: function(o) {
                            var list = fn.component.create({
                                name: 'list',
                                parent: o.popup.content,
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
        var form = fn.component.create({
            name: 'form',
            parent: popup.content,
            columns: [
                { name: 'ID', label: 'ID', width: '60px', dataType: 'number', inputType: 'text' },
                { name: 'Name', label: 'Name', width: '200px', dataType: 'string', inputType: 'text' },
                { name: 'Status', label: 'Status', width: '100px', dataType: 'string', inputType: 'text' }
            ],
            data: {
                ID: 1,
                Name: 'Item 1',
                Status: 'Active',
            },
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
        style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            zIndex: '10000',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
        },
        event: {
            click: function() {
                fn.devtool.toggle();
            },
            mouseover: function() {
                this.style.backgroundColor = '#4338ca';
                this.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
                this.style.transform = 'scale(1.1)';
            },
            mouseout: function() {
                this.style.backgroundColor = '#4f46e5';
                this.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
                this.style.transform = 'scale(1)';
            },
        },
        parent: document.body,
    });
});