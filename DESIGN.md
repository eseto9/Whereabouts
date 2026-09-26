# Design

One page, two separate games on the same little island:

- **Whereabouts**: the co-op I spy game (see README.md).
- **Crowded Market**: run a stall on Market Street and have the most coins at closing.

The page opens on a picker (`#picker`). Each game has its own setup screen, HUD and
saved settings, and **no shared economy**: Whereabouts coins and clothes (`wb.*` in
localStorage, `data/users/<id>/wallet` in the db) are never touched by Crowded Market,
whose coins exist only inside a trading day. An invite link (`?room=ABCD`) skips the
picker and goes straight to Whereabouts.

What the two games share is the world and the machinery: the island and its districts,
the townsfolk meshes, the Wanderbean avatar, walking/running/jumping/mouse look, the
audio synth, the render loop and the sticker UI style.

---

## Crowded Market

### The game (milestone 1)

A 6-minute trading day (morning, midday, evening; 2 minutes each). You and one AI
shopkeeper (Ursula, *the Undercutter*) each run a stall on Market Street.

1. **Supply runs.** Goods come from where they belong on the island. Stand in a
   supplier's yellow ring and press **E** to buy one (**Shift+E** for an armful). You
   can carry 6 at a time, and the crate shows in your arms.
2. **Shelving.** Press **E** at your own stall to put what you carry on the shelf.
   While you're away, nobody sells for you.
3. **Customers** walk up and down Market Street with a bubble such as `🧀 ≤12`: one
   thing they want and the most they'll pay.
4. **Pitching.** Walk up to a customer (within 4.5 m, and they must be within 11 m of
   your stall) and press **E**, or click them. After the first pitch, other stalls get
   1.6 s to pitch too. The customer takes the **cheapest pitch within budget**, and a
   tie goes to whoever pitched first. They then walk to that stall and pay the price
   agreed when they chose. If the shelf is empty by the time they arrive, the sale is lost.
5. **Closing bell.** Unsold stock is worthless. The recap ranks everyone by coins,
   with sales, best sale, undercuts and unsold stock, and hands out titles (at most two
   each): Market Champion, Bargain Queen, Busy Bee, Big Ticket, Big Spender, Stockpiler.
   Haggle and sabotage stats appear once those features exist.

| Good | Supplier | Cost | List price |
| --- | --- | --- | --- |
| 🐟 Fish | the harbor, at the foot of the pier | 4 | 9 |
| 🥖 Bread | Knead to Know bakery (behind the stalls) | 2 | 5 |
| 💐 Flowers | a flower cart in the park | 3 | 8 |
| 🍎 Fruit | the orchard fruit stand | 2 | 5 |
| 🧀 Cheese | a dairy cart on Farm Lane | 5 | 11 |
| 🫖 Teapots | a pottery kiln on the hillside | 8 | 17 |

In milestone 1 you sell at list prices (the price panel arrives in milestone 2). Ursula
undercuts you on anything you both stock, so you win customers by carrying what she
doesn't, or by catching them while she's off restocking.

### Architecture

```
src/js/35-cm-tuning.js   CM_TUNE: every number (prices, costs, timings, ranges, AI settings)
src/js/36-cm-sim.js      CMSim: newState, applyAction, tick, replay (no DOM, no THREE)
src/js/37-cm-ai.js       CMNav (A* on a walkable grid) and CMAI (rivals), also no DOM
src/js/38-cm-world.js    CMW: supplier props, stall shelves and price tags, customers, bubbles, rival beans
src/js/39-cm-hud.js      clock, coins, your stall, E prompt, feed, Tab summary, recap
src/js/39b-cm-game.js    CMG: picker, setup, start/exit, the local authority loop, keys and clicks
src/css/04-market.css
tests/cm/*.test.mjs      `npm test`: the simulation and AI, in Node, without a browser
```

**Simulation and rendering are separate.** Everything the game is lives in one plain,
JSON-serializable object:

```js
{ v, seed, rng, tick, t, phase: 'day'|'closed', part, diff,
  players: { [id]: { id, name, col, ai, x, z, mt, coins, stall, carry: {good: n},
                     st: { sales, earned, spent, best, undercuts, sabotage, haggle, wasted } } },
  order: [ids],
  stalls: [ { id, owner, x, z, fz, stock: {good: n}, price: {good: n} } ],
  sup: { good: { x, z } },
  cust: [ { id, kind, x, z, lane, dir, turned, born, ph, until, want: [{item, max}],
            pitches: [{p, at}], pitched: {player: t}, deal, look } ],
  nextCust, nid, feed: [ {id, t, k, ...} ], fid, recap }
```

**Every change goes through one of two functions:**

- `CMSim.applyAction(state, action)` validates and applies one action and returns
  `{ok, reason}`. Players and the AI use exactly this path. Actions so far:
  - `move {x,z}`: where your bean is. It's capped at run speed × time since your
    last move (×1.25 slack for jumps).
  - `buy {item,n}`: you must be at that supplier. You get what fits in your arms and
    what you can afford.
  - `shelve`: at your own stall.
  - `setPrice {item,price}`: at your own stall, never below supply cost. Going
    strictly under the cheapest rival stall that has the good counts as an undercut.
  - `pitch {cust}`: needs range, stock and a price within budget. A too-high price
    gives `pricey` and a "too pricey" bubble.
  - `say {text}`: a speech bubble, which is cosmetic. It rides in the feed so every
    viewer would see it.
- `CMSim.tick(state)` is the authority's clock, running at 10 Hz. It handles day parts,
  customer spawning (seeded), walking, deciding, buying and closing.

**The feed** (`state.feed`, capped at 40) is how the game reports what happened: `sale`,
`undercut`, `price`, `buy`, `shelve`, `pitch`, `pricey`, `chose`, `pass`, `soldout`,
`part`, `say`, `arrive`, `left`, `giveup`, `close`. The HUD turns new entries into feed
lines, toasts, sounds and bubbles.

**Seeded and replayable.** `state.rng` is a mulberry32 state, so all randomness in the
simulation comes from the seed. `CMSim.replay(init, log, tick)` rebuilds any moment of
a day from the start options plus the `[tick, action]` log. The game keeps that log in
`CMG.log`; the AI's decisions are in it as ordinary actions, so replaying never needs
to run the AI.

**One authority.** In single player the page runs the loop in `cmStep()`: your `move`,
then each AI's actions, then `tick`. Multiplayer later: the host runs the same loop and
broadcasts the state (or feed entries), and clients send their actions over the room,
just as Whereabouts' host owns `G` and broadcasts `wb.state`.

**AI rivals are clients.** `CMAI.step(state, mem, grid)` reads only what a player could
see (stalls, prices, request bubbles, positions) and returns actions. Its memory (task,
path, timers, its own dice) is kept outside the game state. It walks along an A* path
on `CMW.grid` (1 m cells built from the real town's obstacles when the market first
opens) at its difficulty speed, which is never above a player's run. The Undercutter:

- opens at 85% of list and goes one coin under any rival selling the same good, but
  never within a coin of cost;
- steps out to pitch customers near its stall, dropping to their budget if that's still
  worth it;
- restocks when its shelf is low or has too few kinds of goods. It picks the good by
  expected profit per second of the trip: how many it can still sell before closing,
  given the customer rate and how often people want that good, less what's already on
  the shelf. It buys only that many, and nothing in the last few seconds of the day.

Difficulty (Easy/Normal/Hard, on the setup screen) sets how often it thinks, how fast it
walks, how quickly it notices customers and when it restocks (`CM_TUNE.AI`).

### Changes to shared code

These are small hooks, and Whereabouts behaves exactly as before:

- `16-input.js`: `inGame()` is also true while trading. Market keys (E, Tab, H, Q, M,
  1–5) are handled by `cmKey`, and B/T/Enter (rides, tricks, chat) are off in the market.
- `26-actions.js`: clicks go to `cmClick` while trading.
- `33-loop.js`: the frame updates your bean and camera for either game, then runs
  `cmFrame` or Whereabouts' own per-frame work. Culling respects `userData.cmHidden`,
  which is how the decorative goods on the four trading stalls stay hidden while you trade.
- `32-title.js`: the Whereabouts wordmark selector is scoped to `#title`.
- `index.html`: the picker, Crowded Market's setup screen and HUD; `#title` now starts
  hidden behind the picker and has a "← Games" button.

### Testing

`npm test` runs `node --test` over `tests/**/*.test.mjs`. `tests/cm/load-sim.mjs` loads the
tuning, sim and AI files into an empty closure, so any use of the DOM or THREE fails
loudly. The tests cover every action's validation, cheapest-pitch and tie rules, agreed
prices and empty shelves, spawning within caps and budgets, day parts, seeded
determinism, closing and titles, exact replay from a log, and whole AI days (no refused
actions, no speeding, profit, undercut floor, hard beating easy).

In the browser: `/?market` opens the setup screen, and `/?market=play` starts a day
straight away. In the console, `__cm` has `CMG` (state, log), `CMW`, `CMSim`, `CMAI`,
`CMNav`, `cmStep()` and `showScreen()`.

### Changelog

- **Milestone 1** (2026-09-25): game picker; stalls, stock and six supplier spots; supply
  runs with a carried crate; budget customers with request bubbles; pitching; coins; the
  Undercutter; difficulty levels; the end-of-day recap with titles; Tab summary;
  simulation tests.
- Next, **milestone 2**: price panel (P), price wars, shopping-list customers.

### Known gaps

- There are no touch controls in the market yet: the phone joystick belongs to the
  Whereabouts HUD. Planned for the polish milestone.
- The follow camera doesn't avoid walls (the same as in Whereabouts). It can end up
  inside a shop or stall roof when you back up against one.
