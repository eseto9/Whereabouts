// Local stand-in for the artifact runtime's `room` capability.
// Tabs on the same origin share one room over BroadcastChannel, so opening the
// dev page in two or more tabs gives you real multiplayer to test against.
//   ?solo      → claude.use('room') resolves null, like a view that can't connect
//   ?lag=MS    → delay delivery of everything from other tabs by ~MS
//   ?room=NAME → separate rooms on the same server
//   ?drop=a,b  → never deliver these topics from other tabs (simulates lost messages)
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  if (q.has('solo')) {
    console.info('[mock room] solo: claude.use("room") → null');
    return;
  }

  const LAG = Math.max(0, Number(q.get('lag')) || 0);
  const DROP = new Set((q.get('drop') || '').split(',').filter(Boolean));
  const ME = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  const bc = new BroadcastChannel('mock-room:' + (q.get('room') || 'default'));
  const HEARTBEAT = 1000, TIMEOUT = 3500, MAX_BYTES = 4096;

  const bytes = v => new TextEncoder().encode(JSON.stringify(v)).length;
  const later = fn => (LAG ? setTimeout(fn, LAG * (0.75 + Math.random() * 0.5)) : setTimeout(fn, 0));
  const err = (code, message) => Object.assign(new Error(message), { code });
  const sender = peer => ({ peer, by: null, isMe: peer === ME, sameTab: peer === ME, kind: 'viewer', guest: false });

  // peer → { presence, updatedAt, seen }
  const known = new Map([[ME, { presence: Object.freeze({}), updatedAt: Date.now(), seen: Infinity }]]);
  let snapshot = null;           // frozen Peer[] (rebuilt only when something changed)
  const frozenPeer = new Map();  // peer → frozen Peer, reused while unchanged
  const pending = { joined: new Set([ME]), left: new Map(), updated: new Set() };
  let flushTimer = null;

  const peerObj = id => {
    const k = known.get(id);
    let p = frozenPeer.get(id);
    if (!p || p.presence !== k.presence) {
      p = Object.freeze({ ...sender(id), presence: k.presence, updatedAt: k.updatedAt });
      frozenPeer.set(id, p);
    }
    return p;
  };
  const peers = () => (snapshot ||= Object.freeze([...known.keys()].map(peerObj)));

  const peerHandlers = new Set();
  const topicHandlers = new Map(); // topic → Set<handler>

  function touch(kind, id) {
    snapshot = null;
    if (kind === 'joined') { pending.joined.add(id); pending.left.delete(id); }
    else if (kind === 'left') {
      if (pending.joined.delete(id)) { pending.updated.delete(id); }
      else pending.left.set(id, frozenPeer.get(id) || Object.freeze({ ...sender(id), presence: Object.freeze({}), updatedAt: Date.now() }));
      pending.updated.delete(id);
      frozenPeer.delete(id);
    } else if (!pending.joined.has(id)) pending.updated.add(id);
    scheduleFlush();
  }
  function scheduleFlush() {
    if (flushTimer || !peerHandlers.size) return;
    flushTimer = setTimeout(flush, 16); // "once per frame", but keeps ticking in background tabs
  }
  function flush() {
    flushTimer = null;
    const all = peers();
    const change = Object.freeze({
      peers: all,
      joined: Object.freeze([...pending.joined].filter(id => known.has(id)).map(peerObj)),
      left: Object.freeze([...pending.left.values()]),
      updated: Object.freeze([...pending.updated].filter(id => known.has(id)).map(peerObj)),
    });
    pending.joined.clear(); pending.left.clear(); pending.updated.clear();
    if (!change.joined.length && !change.left.length && !change.updated.length) return;
    for (const h of [...peerHandlers]) { try { h(change); } catch (e) { console.error(e); } }
  }

  function deliver(topic, from, data) {
    const hs = topicHandlers.get(topic);
    if (!hs) return;
    const msg = Object.freeze({ ...sender(from), topic, data: data === undefined ? undefined : JSON.parse(JSON.stringify(data)) });
    for (const h of [...hs]) { try { h(msg); } catch (e) { console.error(e); } }
  }

  function setPresence(id, presence, changed) {
    const had = known.has(id);
    const k = known.get(id) || { presence: Object.freeze({}), updatedAt: Date.now(), seen: 0 };
    k.seen = id === ME ? Infinity : Date.now();
    if (changed || !had) { k.presence = Object.freeze(presence); k.updatedAt = Date.now(); }
    known.set(id, k);
    if (!had) touch('joined', id); else if (changed) touch('updated', id);
  }

  bc.onmessage = ({ data: m }) => {
    if (!m || m.from === ME) return;
    later(() => {
      if (m.t === 'hello') { setPresence(m.from, m.presence, true); announce(); }
      else if (m.t === 'pres') {
        const cur = known.get(m.from);
        setPresence(m.from, m.presence, !cur || JSON.stringify(cur.presence) !== JSON.stringify(m.presence));
      } else if (m.t === 'bye') { if (known.delete(m.from)) touch('left', m.from); }
      else if (m.t === 'emit') { if (!known.has(m.from)) setPresence(m.from, {}, false); if (!DROP.has(m.topic)) deliver(m.topic, m.from, m.data); }
    });
  };
  const announce = () => bc.postMessage({ t: 'pres', from: ME, presence: known.get(ME).presence });

  setInterval(() => {
    announce();
    const now = Date.now();
    for (const [id, k] of known) if (id !== ME && now - k.seen > TIMEOUT) { known.delete(id); touch('left', id); }
  }, HEARTBEAT);
  addEventListener('pagehide', () => bc.postMessage({ t: 'bye', from: ME }));
  bc.postMessage({ t: 'hello', from: ME, presence: {} });

  const TOPIC_RE = /^[a-z][a-z0-9_.-]{0,47}$/;
  const room = Object.freeze({
    async emit(topic, data) {
      if (!TOPIC_RE.test(topic)) throw err('invalid_argument', 'bad topic ' + topic);
      if (data !== undefined && bytes(data) > MAX_BYTES) throw err('invalid_argument', `data over ${MAX_BYTES} bytes`);
      bc.postMessage({ t: 'emit', from: ME, topic, data });
      setTimeout(() => deliver(topic, ME, data), 0); // own echo: isMe && sameTab
    },
    on(topic, handler, onError) {
      if (typeof handler !== 'function') throw new TypeError('handler must be a function');
      if (!TOPIC_RE.test(topic)) { queueMicrotask(() => onError && onError({ code: 'invalid_argument', message: 'bad topic ' + topic })); return () => {}; }
      if (!topicHandlers.has(topic)) topicHandlers.set(topic, new Set());
      const h = m => handler(m); // each registration is independent
      topicHandlers.get(topic).add(h);
      return () => topicHandlers.get(topic).delete(h);
    },
    async presence(patch) {
      const next = { ...known.get(ME).presence };
      for (const [k, v] of Object.entries(patch || {})) { if (v === null) delete next[k]; else next[k] = v; }
      if (bytes(next) > MAX_BYTES) throw err('invalid_argument', `presence over ${MAX_BYTES} bytes`);
      setPresence(ME, JSON.parse(JSON.stringify(next)), true);
      announce();
    },
    peers,
    onPeers(handler, onError) {
      if (typeof handler !== 'function') throw new TypeError('handler must be a function');
      const h = c => handler(c);
      // first delivery presents the room so far as `joined`, no earlier than a microtask
      queueMicrotask(() => {
        if (!peerHandlers.has(h)) return;
        handler(Object.freeze({ peers: peers(), joined: peers(), left: Object.freeze([]), updated: Object.freeze([]) }));
      });
      peerHandlers.add(h);
      return () => peerHandlers.delete(h);
    },
    connected: () => true,
    onConnected(handler) { queueMicrotask(() => handler(true)); return () => {}; },
  });

  window.__mocks.room = room;
  window.__mockRoom = { id: ME, peers, lag: LAG };
  console.info(`[mock room] peer ${ME}${LAG ? `, lag ~${LAG}ms` : ''}. Open another tab to add a player.`);
})();
