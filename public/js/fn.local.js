// 로컬(오프라인) 버전 전용 어댑터.
// fn.ajax를 localStorage 기반 구현으로 통째로 덮어써서, fn.devtool.js/fn.layout.js/
// fn.data.select-insert-update는 서버 모드와 완전히 동일한 코드로 동작한다.
// 로드 순서: fn.js -> fn.local.js -> fn.layout.js -> fn.devtool.js (views/index-local.html)
(function(global) {
    var fn = global.fn;
    var STORAGE_PREFIX = 'fn-local-';
    var RESOURCE_STORAGE_KEY = STORAGE_PREFIX + 'resource';
    var RESOURCE_URL_PATTERN = /^\/api\/([a-z][a-z0-9_]*)(?:\/(\d+))?$/;

    // sql/003_create_resource.sql에 해당하는 메타정보를 로컬에서 흉내낸 기본값
    var DEFAULT_RESOURCES = [
        {
            id: 1,
            name: '메모',
            resource_key: 'memo',
            fields: [
                { name: 'name', label: '이름', list: { width: '160px' }, form: { inputType: 'text' } },
                { name: 'status', label: '상태', list: { width: '100px' }, form: { inputType: 'text' } },
                { name: 'content', label: '내용', list: { width: 'auto' }, form: { inputType: 'text' } },
            ],
        },
        {
            id: 2,
            name: '북마크',
            resource_key: 'bookmark',
            fields: [
                { name: 'name', label: '이름', list: { width: '160px' }, form: { inputType: 'text' } },
                { name: 'url', label: 'URL', list: { width: 'auto' }, form: { inputType: 'text' } },
                { name: 'status', label: '상태', list: { width: '100px' }, form: { inputType: 'text' } },
            ],
        },
        { id: 3, name: '설정', resource_key: 'settings', fields: [] },
    ];

    function readJSON(key, fallback) {
        var raw = fn.localStorage.get({ key: key });
        if (!raw) {
            return fallback;
        }
        try {
            return JSON.parse(raw);
        } catch (err) {
            return fallback;
        }
    }

    function writeJSON(key, value) {
        fn.localStorage.set({ key: key, value: JSON.stringify(value) });
    }

    function entryStorageKey(resourceKey) {
        return STORAGE_PREFIX + resourceKey + '-entry';
    }

    function getResources() {
        var resources = readJSON(RESOURCE_STORAGE_KEY, null);
        if (!resources) {
            resources = DEFAULT_RESOURCES;
            writeJSON(RESOURCE_STORAGE_KEY, resources);
        }
        return resources;
    }

    function findResource(resourceKey) {
        var resources = getResources();
        for (var i = 0; i < resources.length; i++) {
            if (resources[i].resource_key === resourceKey) {
                return resources[i];
            }
        }
        return null;
    }

    function getEntries(resourceKey) {
        return readJSON(entryStorageKey(resourceKey), []);
    }

    function setEntries(resourceKey, entries) {
        writeJSON(entryStorageKey(resourceKey), entries);
    }

    function nextEntryId(entries) {
        return entries.reduce(function(max, entry) { return Math.max(max, entry.id); }, 0) + 1;
    }

    // routes/resource.js의 toEntryRow와 동일: data를 평평하게 펼쳐서 컬럼처럼 보이게 함
    function toEntryRow(entry) {
        var row = { id: entry.id };
        var data = entry.data || {};
        for (var key in data) {
            row[key] = data[key];
        }
        row.created_at = entry.created_at;
        row.updated_at = entry.updated_at;
        return row;
    }

    fn.ajax = async function(o = {}) {
        var method = (o.method || 'POST').toUpperCase();
        var url = o.url || '';

        if (url === '/api/resource' && method === 'GET') {
            return { ok: true, rows: getResources() };
        }

        var match = url.match(RESOURCE_URL_PATTERN);
        if (!match) {
            throw new Error('local mode에서 지원하지 않는 요청: ' + method + ' ' + url);
        }

        var resourceKey = match[1];
        var id = match[2] ? Number(match[2]) : null;
        var resource = findResource(resourceKey);
        if (!resource) {
            throw new Error('unknown resource');
        }

        var now = new Date().toISOString();

        if (method === 'GET') {
            var rows = getEntries(resourceKey)
                .slice()
                .sort(function(a, b) { return a.id - b.id; })
                .map(toEntryRow);
            return { ok: true, rows: rows };
        }

        if (method === 'POST') {
            var entries = getEntries(resourceKey);
            var entry = { id: nextEntryId(entries), data: o.data || {}, created_at: now, updated_at: now };
            entries.push(entry);
            setEntries(resourceKey, entries);
            return { ok: true, row: toEntryRow(entry) };
        }

        if (method === 'PUT') {
            var entries = getEntries(resourceKey);
            var target = null;
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].id === id) {
                    target = entries[i];
                    break;
                }
            }
            if (!target) {
                throw new Error('entry not found');
            }
            target.data = o.data || {};
            target.updated_at = now;
            setEntries(resourceKey, entries);
            return { ok: true, row: toEntryRow(target) };
        }

        throw new Error('local mode에서 지원하지 않는 메소드: ' + method);
    };
})(window);
