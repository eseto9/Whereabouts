import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup, playDay } from './helpers.mjs';

test('the Undercutter trades a whole day through the same actions as a player', () => {
  const env = setup({ seed: 31 });
  const t0 = Date.now();
  const { results } = playDay(env);
  const ms = Date.now() - t0;
  const { s, CM_TUNE: T } = env;
  assert.equal(s.phase, 'closed');
  const u = s.recap.rows.find(r => r.id === 'u');
  assert.ok(u.sales >= 15, `only ${u.sales} sales`);
  assert.ok(u.coins > T.START_COINS + 20, `ended with ${u.coins}`);
  assert.ok(results.some(x => x.a.type === 'buy' && x.r.ok), 'never restocked');
  assert.ok(results.some(x => x.a.type === 'shelve' && x.r.ok), 'never shelved');
  // no speeding, and (apart from customers moving on mid-pitch) nothing refused
  assert.ok(!results.some(x => x.a.type === 'move' && x.r.clamped), 'moved faster than a run');
  const odd = results.filter(x => !x.r.ok && !(x.a.type === 'pitch' && ['gone', 'busy', 'already'].includes(x.r.reason)));
  assert.deepEqual(odd.map(x => [x.a.type, x.r.reason]), []);
  assert.ok(ms < 3000, `a day took ${ms} ms`);
});

test('the Undercutter prices just under a rival, but never within a coin of cost', () => {
  const env = setup({ seed: 5 });
  const { s, CM_TUNE: T } = env;
  s.stalls[0].price.bread = 4;                   // the player sells bread at 4
  const run = playDay(env, { until: 30 });
  assert.equal(s.stalls[1].price.bread, 3);     // Ursula goes to 3 (cost 2 + 1)
  assert.ok(s.feed.some(e => e.k === 'undercut' && e.p === 'u'));
  s.stalls[0].price.bread = 2;                   // the player dumps at cost
  playDay(env, { until: 60, mems: run.mems });
  assert.equal(s.stalls[1].price.bread, T.GOODS.bread.cost + 1);
});

test('difficulty: faster and sharper on hard, never beyond a run', () => {
  const { CM_TUNE: T } = setup();
  for (const d of ['easy', 'normal', 'hard']) assert.ok(T.AI.speed[d] <= T.RUN);
  const coins = { easy: 0, hard: 0 };
  for (const seed of [77, 78, 79]) for (const diff of ['easy', 'hard']) {
    const env = setup({ seed, diff });
    playDay(env);
    coins[diff] += env.s.recap.rows.find(r => r.id === 'u').coins;
  }
  assert.ok(coins.hard > coins.easy, `hard ${coins.hard} vs easy ${coins.easy}`);
});
