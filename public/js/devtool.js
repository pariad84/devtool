// ====== DevTool 관련 ======
fn.devtool = {
    isOpen: false,
    toggle: function() {
        this.isOpen = !this.isOpen;
        console.log('DevTool ' + (this.isOpen ? '열림' : '닫힘'));
        

        fn.component.create({
            name: 'popup',
            tagName: 'div',
        });

        console.log(el);
    }
};

// Ctrl + ` 키 이벤트 감지
document.addEventListener('keydown', function(e) {
    // e.code === 'Backquote'는 물결/백틱 키를 의미 (Shift 여부와 관계없이 동일)
    if (e.ctrlKey && e.code === 'Backquote') {
        e.preventDefault(); // 브라우저 기본 동작 방지
        fn.devtool.toggle();

        
    }
});