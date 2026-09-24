# Whereabouts

```
src/index.html       page template (markup; <!-- @styles --> and <!-- @app --> markers)
src/css/NN-*.css     styles, concatenated in filename order
src/js/NN-*.js       game code, concatenated in filename order inside one IIFE
tools/build.mjs      → dist/whereabouts.html (the Claude artifact) and docs/index.html (GitHub Pages)
tools/dev-server.mjs local test server (live reload, source maps)
dev/mock-*.js        stand-ins for the artifact runtime: claude.use(), room, db and user
```

The JS files are consecutive slices of one closure, not ES modules: every top-level
name is visible to every file, and the number prefix sets load order. New file? Pick a
number that puts it after the things it uses at load time.

```
npm run dev     # http://localhost:5178
npm run build   # dist/whereabouts.html + docs/index.html
```

Test URLs (combine with `&`):

| URL | What it does |
| --- | --- |
| `/` | the game from `src/`; open 2+ tabs to play together |
| `/dist` | the built single file |
| `?solo` | no room (the page's solo loopback) |
| `?nodb` | no shared db: no daily board, no room backup, coins only in this browser |
| `?lag=200` | room messages from other tabs arrive ~200 ms late |
| `?drop=wb.state` | never deliver these room topics (tests the late-joiner backup) |
| `?room=x` | a separate room |
| `?user=ana` | a fixed viewer id (default: each tab is a different person) |

In the console, `__mockDb.dump()` shows the fake db and `__mockDb.clear()` empties it;
clear `localStorage` too to reset coins and bought clothes (tabs on one origin share it).

## Publishing

The page uses three runtime capabilities. Declare all of them when publishing
`dist/whereabouts.html`:

```json
{
  "room": { "topics": { "wb.state": "interact", "wb.guess": "interact", "wb.result": "interact",
                        "wb.chat": "interact", "wb.ping": "interact", "wb.spyclue": "interact",
                        "wb.spyhint": "interact" } },
  "db": {},
  "user": {}
}
```

- `room` topics must be opened to `interact`, or only people who can edit the artifact
  can send guesses, chat and state.
- `db` holds the daily-hunt boards (`daily/<date>/teams`), a backup of each room's state
  for late joiners (`rooms/<code>`, pruned after a day) and each player's private
  coins and bought clothes (`data/users/<id>/wallet`). Declaring `db` keeps the artifact inside the
  organization: it can't be shared by public link.
- `user` gives each player an id, which keys their wallet and their team's daily score.

Without `db` or `user` the game still plays; those features just switch off.

## GitHub Pages

`docs/index.html` is the same page, served at https://eseto9.github.io/Whereabouts/ when
Pages is set to deploy from the `main` branch, `/docs` folder. There is no Claude runtime
there, so multiplayer goes through a free public MQTT relay instead (see the end of
`src/js/17-net.js`; it falls back through three relays). Anyone who knows a room code could
listen in on that room, so nothing private is sent. The daily board and the shared wallet
still need Claude: on Pages, coins and bought clothes are saved in that browser only.
