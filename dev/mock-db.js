// Local stand-ins for the artifact runtime's `user` and `db` capabilities.
// db is kept in localStorage and shared live between tabs on this origin.
//   ?nodb      → claude.use('db') resolves null
//   ?user=NAME → a fixed viewer id (default: one per tab, so tabs act like different people)
// In the console: __mockDb.dump() shows everything, __mockDb.clear() empties it.
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  let uid = sessionStorage.getItem('mock-uid');
  if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('mock-uid', uid); }
  if (q.get('user')) uid = 'u-' + q.get('user').replace(/[^A-Za-z0-9_-]/g, '');

  window.__mocks.user = Object.freeze({
    id: async () => uid,
    me: async () => ({ id: uid, name: '', email: null, avatarUrl: '', color: '#888' }),
    isOwner: async () => true,
    canEdit: async () => true,
    can: async () => true,
    profiles: async ids => Object.fromEntries(ids.map(i => [i, { id: i, name: '' }])),
  });
  if (q.has('nodb')) { console.info('[mock db] off: claude.use("db") → null'); return; }

  const KEY = 'mock-db:v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } };
  const bc = new BroadcastChannel('mock-db');
  const subs = new Set();
  const notify = () => { for (const s of [...subs]) s.fire(); };
  bc.onmessage = notify;
  function write(path, data) {
    const all = load();
    if (data === undefined) delete all[path]; else all[path] = data;
    localStorage.setItem(KEY, JSON.stringify(all));
    bc.postMessage(1); setTimeout(notify, 0);
  }

  const segs = p => p.split('/');
  function checkPath(p, doc) {
    const s = segs(p);
    if (!p || s.some(x => !x || x === '.' || x === '..' || !/^[A-Za-z0-9_\-.~:@+]+$/.test(x))) throw new TypeError('bad path: ' + p);
    if ((s.length % 2 === 0) !== doc) throw new TypeError(`${doc ? 'document' : 'collection'} path "${p}" has ${s.length} segments`);
  }
  // other viewers' data/users/<id>/ subtrees read as missing and refuse writes
  const visible = p => { const s = segs(p); return !(s[0] === 'data' && s[1] === 'users' && s[2] && s[2] !== uid); };
  const clone = v => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const freeze = o => { if (o && typeof o === 'object') { Object.freeze(o); for (const k in o) freeze(o[k]); } return o; };
  const lag = f => setTimeout(f, 15 + Math.random() * 40);
  const err = (code, message) => Object.assign(new Error(message), { code });
  const meta = Object.freeze({ fromCache: false, hasPendingWrites: false });
  function snap(path) {
    const d = visible(path) ? load()[path] : undefined;
    return Object.freeze({ id: segs(path).pop(), exists: d !== undefined, data: () => (d === undefined ? undefined : freeze(clone(d))), metadata: meta });
  }
  function merge(a, b) {
    for (const k in b) {
      const x = a[k], y = b[k];
      a[k] = y && typeof y === 'object' && !Array.isArray(y) && x && typeof x === 'object' && !Array.isArray(x) ? merge(x, y) : y;
    }
    return a;
  }
  function listen(read, next) {
    let last;
    const s = { fire() { const r = read(); const k = JSON.stringify(r.key); if (k === last) return; last = k; try { next(r.value); } catch (e) { console.error(e); } } };
    subs.add(s); lag(() => s.fire());
    return () => subs.delete(s);
  }

  function docRef(path) {
    checkPath(path, true);
    const body = d => d && typeof d === 'object' && !Array.isArray(d);
    return Object.freeze({
      id: segs(path).pop(), path,
      get: () => new Promise(r => lag(() => r(snap(path)))),
      set: data => new Promise((res, rej) => lag(() => {
        if (!body(data)) return rej(err('invalid_argument', 'a document body must be an object'));
        if (!visible(path)) return rej(err('invalid_argument', 'not your subtree'));
        write(path, clone(data)); res();
      })),
      update: data => new Promise((res, rej) => lag(() => {
        const cur = load()[path];
        if (cur === undefined || !visible(path)) return rej(err('invalid_argument', 'no such document'));
        write(path, merge(cur, clone(data))); res();
      })),
      delete: () => new Promise(res => lag(() => { if (visible(path)) write(path, undefined); res(); })),
      acquire: async () => ({ acquired: true }),
      onSnapshot: next => listen(() => { const s = snap(path); return { key: s.exists ? s.data() : null, value: s }; }, next),
      collection: sub => colRef(path + '/' + sub),
    });
  }

  const OPS = { '==': (a, b) => a === b, '!=': (a, b) => a !== b, '<': (a, b) => a < b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '>=': (a, b) => a >= b,
    in: (a, b) => b.includes(a), 'not-in': (a, b) => !b.includes(a), 'array-contains': (a, b) => Array.isArray(a) && a.includes(b) };
  function query(col, f) {
    const run = () => {
      const all = load(), n = segs(col).length;
      let docs = Object.keys(all).filter(p => p.startsWith(col + '/') && segs(p).length === n + 1 && visible(p)).map(p => ({ p, d: all[p] }));
      for (const [field, op, v] of f.where) docs = docs.filter(x => x.d[field] !== undefined && OPS[op](x.d[field], v));
      if (f.order) {
        const [field, dir] = f.order;
        docs.sort((a, b) => { const x = a.d[field], y = b.d[field]; if (x === undefined) return 1; if (y === undefined) return -1; return (x < y ? -1 : x > y ? 1 : 0) * (dir === 'desc' ? -1 : 1); });
      } else docs.sort((a, b) => (a.p < b.p ? -1 : 1));
      if (f.limit) docs = docs.slice(0, f.limit);
      const list = docs.map(x => snap(x.p));
      return Object.freeze({ docs: list, size: list.length, empty: !list.length, metadata: meta,
        docChanges: () => list.map((doc, i) => ({ type: 'added', doc, oldIndex: -1, newIndex: i })) });
    };
    return {
      where: (field, op, v) => { if (!OPS[op]) throw new TypeError('bad operator ' + op); return query(col, { ...f, where: [...f.where, [field, op, v]] }); },
      orderBy: (field, dir) => query(col, { ...f, order: [field, dir || 'asc'] }),
      limit: n => query(col, { ...f, limit: n }),
      get: () => new Promise(r => lag(() => r(run()))),
      onSnapshot: next => listen(() => { const r = run(); return { key: r.docs.map(d => [d.id, d.data()]), value: r }; }, next),
    };
  }
  function colRef(path) {
    checkPath(path, false);
    const newId = () => Math.random().toString(36).slice(2, 12);
    return Object.freeze({ ...query(path, { where: [] }), path,
      doc: id => docRef(path + '/' + (id || newId())),
      add: async data => { const r = docRef(path + '/' + newId()); await r.set(data); return r; } });
  }

  window.__mocks.db = Object.freeze({ doc: docRef, collection: colRef });
  window.__mockDb = { dump: load, clear: () => { localStorage.removeItem(KEY); bc.postMessage(1); notify(); } };
  console.info(`[mock db] viewer ${uid}. __mockDb.dump() / __mockDb.clear()`);
})();
