import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup, place, customer, ticks, playDay } from './helpers.mjs';

test('a new day: one stall each, starting coins, stock and list prices; plain JSON', () => {
  const { s, CM_TUNE: T } = setup();
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
  assert.equal(s.stalls[0].owner, 'me');
  assert.equal(s.stalls[1].owner, 'u');
  assert.equal(s.stalls[2].owner, null);
  assert.equal(s.players.me.coins, T.START_COINS);
  assert.deepEqual(s.stalls[0].stock, T.START_STOCK);
  assert.equal(s.stalls[1].price.fish, T.GOODS.fish.list);
  assert.equal(s.phase, 'day');
  assert.equal(s.part, 'morning');
});

test('unknown actions, unknown players and bad input are refused', () => {
  const { s, CMSim } = setup();
  assert.equal(CMSim.applyAction(s, { type: 'teleport', player: 'me' }).reason, 'unknown');
  assert.equal(CMSim.applyAction(s, { type: 'move', player: 'nobody', x: 0, z: 0 }).reason, 'noplayer');
  assert.equal(CMSim.applyAction(s, { type: 'move', player: 'me', x: NaN, z: 0 }).reason, 'bad');
  assert.equal(CMSim.applyAction(s, { type: 'buy', player: 'me', item: 'gold' }).reason, 'bad');
  assert.equal(CMSim.applyAction(s, null).reason, 'unknown');
});

test('move: nobody goes faster than a run', () => {
  const { s, CMSim, CM_TUNE: T } = setup();
  const p = s.players.me, x0 = p.x;
  ticks(CMSim, s, 10);   // one second since the last move
  const r = CMSim.applyAction(s, { type: 'move', player: 'me', x: x0 + 100, z: p.z });
  assert.ok(r.ok && r.clamped);
  assert.ok(p.x - x0 <= T.RUN * T.MOVE_SLACK * 1 + 0.3 + 1e-9);
  const r2 = CMSim.applyAction(s, { type: 'move', player: 'me', x: p.x + 0.2, z: p.z });
  assert.ok(r2.ok && !r2.clamped);
});

test('buy: only at the supplier, only what you can carry and afford', () => {
  const { s, CMSim, CM_TUNE: T } = setup();
  const p = s.players.me;
  assert.equal(CMSim.applyAction(s, { type: 'buy', player: 'me', item: 'fish', n: 2 }).reason, 'far');
  place(s, 'me', T.SUPPLIERS.fish.x, T.SUPPLIERS.fish.z);
  const r = CMSim.applyAction(s, { type: 'buy', player: 'me', item: 'fish', n: 2 });
  assert.ok(r.ok);
  assert.equal(p.carry.fish, 2);
  assert.equal(p.coins, T.START_COINS - 2 * T.GOODS.fish.cost);
  // capacity: asks for 10, gets what fits
  const r2 = CMSim.applyAction(s, { type: 'buy', player: 'me', item: 'fish', n: 10 });
  assert.equal(r2.n, T.CARRY - 2);
  assert.equal(CMSim.carried(p), T.CARRY);
  assert.equal(CMSim.applyAction(s, { type: 'buy', player: 'me', item: 'fish' }).reason, 'full');
  // money
  p.carry = {}; p.coins = 3;
  assert.equal(CMSim.applyAction(s, { type: 'buy', player: 'me', item: 'fish' }).reason, 'broke');
  assert.equal(p.coins, 3);
});

test('shelve: only at your own stall; stock moves from your arms to the shelf', () => {
  const { s, CMSim } = setup();
  const p = s.players.me;
  p.carry = { fish: 3, cheese: 1 };
  place(s, 'me', s.stalls[1].x, s.stalls[1].z + 1.8);   // the rival's stall
  assert.equal(CMSim.applyAction(s, { type: 'shelve', player: 'me' }).reason, 'far');
  place(s, 'me', s.stalls[0].x, s.stalls[0].z + 1.8);
  const r = CMSim.applyAction(s, { type: 'shelve', player: 'me' });
  assert.ok(r.ok); assert.equal(r.n, 4);
  assert.equal(s.stalls[0].stock.fish, 3);
  assert.equal(s.stalls[0].stock.cheese, 1);
  assert.deepEqual(p.carry, {});
  assert.equal(CMSim.applyAction(s, { type: 'shelve', player: 'me' }).reason, 'empty');
});

test('setPrice: at your stall, never below supply cost; undercuts are counted', () => {
  const { s, CMSim, CM_TUNE: T } = setup();
  assert.equal(CMSim.applyAction(s, { type: 'setPrice', player: 'me', item: 'fruit', price: T.GOODS.fruit.cost - 1 }).reason, 'belowcost');
  assert.equal(CMSim.applyAction(s, { type: 'setPrice', player: 'me', item: 'fruit', price: T.PRICE_MAX + 1 }).reason, 'toohigh');
  place(s, 'me', 0, 0);
  assert.equal(CMSim.applyAction(s, { type: 'setPrice', player: 'me', item: 'fruit', price: 4 }).reason, 'far');
  place(s, 'me', s.stalls[0].x, s.stalls[0].z + 1.8);
  // both stalls have fruit at 5: going to 4 undercuts the rival
  const r = CMSim.applyAction(s, { type: 'setPrice', player: 'me', item: 'fruit', price: 4 });
  assert.ok(r.ok && r.undercut);
  assert.equal(s.stalls[0].price.fruit, 4);
  assert.equal(s.players.me.st.undercuts, 1);
  assert.equal(s.feed.at(-1).k, 'undercut');
  // already cheapest: lower still isn't another undercut
  assert.ok(!CMSim.applyAction(s, { type: 'setPrice', player: 'me', item: 'fruit', price: 3 }).undercut);
  assert.equal(s.players.me.st.undercuts, 1);
});

test('pitch: needs you near the customer, the customer near your stall, stock and a price in budget', () => {
  const { s, CMSim } = setup();
  const c = customer(s, { x: 32, z: -1, want: [{ item: 'fish', max: 12 }] });
  place(s, 'me', 20, 0);
  assert.equal(CMSim.applyAction(s, { type: 'pitch', player: 'me', cust: c.id }).reason, 'far');
  place(s, 'me', 32, -2.5);
  assert.equal(CMSim.applyAction(s, { type: 'pitch', player: 'me', cust: c.id }).reason, 'nostock');
  s.stalls[0].stock.fish = 1; s.stalls[0].price.fish = 13;
  assert.equal(CMSim.applyAction(s, { type: 'pitch', player: 'me', cust: c.id }).reason, 'pricey');
  assert.equal(s.feed.at(-1).k, 'pricey');
  // a customer far from your stall can't be pitched even when you walk up to them
  const far = customer(s, { x: 52, z: 0, want: [{ item: 'fruit', max: 9 }] });
  place(s, 'me', 51, 0);
  assert.equal(CMSim.applyAction(s, { type: 'pitch', player: 'me', cust: far.id }).reason, 'reach');
  assert.equal(CMSim.applyAction(s, { type: 'pitch', player: 'me', cust: 'c999' }).reason, 'gone');
});

test('budget customer: buys from the cheapest pitch under budget', () => {
  const { s, CMSim, CM_TUNE: T } = setup();
  s.stalls[1].price.fruit = 4;   // the rival is cheaper
  const c = customer(s, { x: 35.5, z: -1.5, want: [{ item: 'fruit', max: 6 }] });
  place(s, 'me', 34, -2); place(s, 'u', 37, -2);
  assert.ok(CMSim.applyAction(s, { type: 'pitch', player: 'me', cust: c.id }).ok);   // first, but pricier
  assert.ok(CMSim.applyAction(s, { type: 'pitch', player: 'u', cust: c.id }).ok);
  assert.equal(c.ph, 'think');
  ticks(CMSim, s, Math.ceil((T.DECIDE + 6) / T.DT));
  assert.equal(s.players.u.coins, T.START_COINS + 4);
  assert.equal(s.stalls[1].stock.fruit, T.START_STOCK.fruit - 1);
  assert.equal(s.players.me.coins, T.START_COINS);
  assert.equal(s.players.u.st.sales, 1);
  assert.deepEqual(s.players.u.st.best, { item: 'fruit', price: 4 });
  assert.ok(s.feed.some(e => e.k === 'sale' && e.p === 'u' && e.price === 4));
});

test('budget customer: a tie goes to whoever pitched first', () => {
  for (const first of ['me', 'u']) {
    const { s, CMSim, CM_TUNE: T } = setup();
    const c = customer(s, { x: 35.5, z: -1.5 });
    place(s, 'me', 34, -2); place(s, 'u', 37, -2);
    const second = first === 'me' ? 'u' : 'me';
    CMSim.applyAction(s, { type: 'pitch', player: first, cust: c.id });
    CMSim.tick(s);
    CMSim.applyAction(s, { type: 'pitch', player: second, cust: c.id });
    ticks(CMSim, s, Math.ceil((T.DECIDE + 6) / T.DT));
    assert.equal(s.players[first].coins, T.START_COINS + 5, `${first} pitched first and should win`);
    assert.equal(s.players[second].coins, T.START_COINS);
  }
});

test('the price is agreed when they choose; an empty shelf by the time they arrive loses the sale', () => {
  const { s, CMSim, CM_TUNE: T } = setup();
  const c = customer(s, { x: 33, z: -1, want: [{ item: 'fruit', max: 6 }] });
  place(s, 'me', 33, -2.5);
  CMSim.applyAction(s, { type: 'pitch', player: 'me', cust: c.id });
  ticks(CMSim, s, Math.ceil(T.DECIDE / T.DT) + 1);
  assert.equal(c.ph, 'go');
  assert.equal(c.deal.price, 5);
  s.stalls[0].stock.fruit = 0;   // sold out while they walked over
  ticks(CMSim, s, 60);
  assert.equal(s.players.me.coins, T.START_COINS);
  assert.ok(s.feed.some(e => e.k === 'soldout'));
  assert.equal(c.ph, 'walk');
});

test('customers spawn from the seed, want one thing with a budget, and never crowd past the cap', () => {
  const { s, CMSim, CM_TUNE: T } = setup({ players: [{ id: 'me' }] });
  let most = 0; const seen = new Set();
  while (s.phase === 'day') {
    CMSim.tick(s); most = Math.max(most, s.cust.length);
    for (const c of s.cust) {
      if (seen.has(c.id)) continue; seen.add(c.id);
      assert.equal(c.kind, 'budget');
      const w = c.want[0], G = T.GOODS[w.item];
      assert.ok(G);
      assert.ok(w.max >= Math.round(G.list * T.BUDGET_MULT[0]) && w.max <= Math.round(G.list * T.BUDGET_MULT[1]));
    }
  }
  assert.ok(most <= T.CUST_MAX);
  assert.ok(seen.size > 30, `only ${seen.size} customers all day`);
});

test('day parts change on time', () => {
  const { s, CMSim, CM_TUNE: T } = setup();
  const at = {};
  while (s.phase === 'day') { CMSim.tick(s); at[s.part] ??= s.t; }
  assert.equal(at.morning, T.DT);
  assert.equal(at.midday, T.PARTS[1].t);
  assert.equal(at.evening, T.PARTS[2].t);
});

test('same seed, same day; a different seed, a different day', () => {
  const a = setup({ seed: 7 }), b = setup({ seed: 7 }), c = setup({ seed: 8 });
  for (const x of [a, b, c]) for (let i = 0; i < 1500; i++) x.CMSim.tick(x.s);
  assert.deepEqual(a.s, b.s);
  assert.notDeepEqual(a.s.cust, c.s.cust);
});

test('closing: stock is worthless, actions stop, the recap ranks everyone and hands out titles', () => {
  const { s, CMSim, CM_TUNE: T } = setup();
  s.players.me.carry = { fish: 2 };
  while (s.phase === 'day') CMSim.tick(s);
  assert.equal(s.phase, 'closed');
  assert.equal(s.t, T.DAY);
  assert.deepEqual(s.cust, []);
  assert.equal(CMSim.applyAction(s, { type: 'move', player: 'me', x: 0, z: 0 }).reason, 'closed');
  const rows = s.recap.rows;
  assert.equal(rows.length, 2);
  assert.ok(rows[0].coins >= rows[1].coins);
  const me = rows.find(r => r.id === 'me');
  assert.equal(me.wasted, 6 + 2);   // 3 bread + 3 fruit on the shelf, 2 fish in hand
  assert.equal(s.recap.titles[0].title, 'Market Champion');
  const per = {}; for (const t of s.recap.titles) per[t.p] = (per[t.p] || 0) + 1;
  assert.ok(Object.values(per).every(n => n <= 2), 'nobody gets more than two titles');
  CMSim.tick(s);
  assert.equal(s.t, T.DAY);   // the clock stops
});

test('replay: the seed plus the action log rebuilds the exact same day', () => {
  const env = setup({ seed: 4242 });
  const { CMSim, CM_TUNE: T, s } = env;
  // the player does a supply run too, so the log has more than the AI in it
  const sup = T.SUPPLIERS.bread;
  const { log, results } = playDay(env, {
    until: 1800,
    script: (s, act) => {
      const p = s.players.me;
      if (s.tick < 200) act({ type: 'move', player: 'me', x: p.x + (sup.x - p.x) * 0.2, z: p.z + (sup.z - p.z) * 0.2 });
      if (s.tick === 200) act({ type: 'buy', player: 'me', item: 'bread', n: 4 });
      if (s.tick > 200 && s.tick < 260) act({ type: 'move', player: 'me', x: 33.4, z: -3.3 });
      if (s.tick === 260) act({ type: 'shelve', player: 'me' });
    },
  });
  assert.ok(results.find(x => x.a.type === 'buy' && x.a.player === 'me').r.ok);
  assert.ok(results.find(x => x.a.type === 'shelve' && x.a.player === 'me').r.ok);
  assert.ok(log.length > 100);
  const again = CMSim.replay(env.init, JSON.parse(JSON.stringify(log)), s.tick);
  assert.deepEqual(again, s);
});
