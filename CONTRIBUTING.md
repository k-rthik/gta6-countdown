# Contributing

Mostly this repo wants better jokes.

## Adding or improving a card

All 64 entries live in one array near the top of the `<script>` block in
`index.html`:

```js
["throwback", "Follow the damn train", "Two decades on, a generation still flinches..."],
```

Three fields: **category**, **headline**, **body**.

Categories and what they're for:

| Category    | Accent | What goes in it                                          |
| ----------- | ------ | -------------------------------------------------------- |
| `throwback` | cyan   | Previous games — missions, glitches, radio, era feeling   |
| `receipts`  | pink   | The code-in-a-box story and the physical-media fallout    |
| `fineprint` | amber  | Digital ownership, licensing, delisting, account binding  |
| `radio`     | lilac  | Fake in-world ads, weather, call-in shows                 |
| `dispatch`  | lime   | Police scanner chatter                                    |

House style, such as it is:

- Two sentences, three at the absolute most. The card has a fixed footprint.
- Headline under about 32 characters or it wraps badly on phones.
- Punch at policies and companies, not at named individuals. No invented
  quotes attributed to real people.
- Reference game moments in your own words. Don't paste in dialogue.
- Anything factual should be traceable to something in the Sources list at the
  bottom of the page. If you're adding a new claim, add the source too.

The array must stay exactly 64 entries long — `npm test` will tell you off if
it isn't, because the dates and the "nights to go" numbers are derived from
each card's position.

## Before opening a PR

```bash
npm test
```

That checks the card count, the categories, the launch dates, that nothing
external is being fetched at runtime, that every referenced font file exists,
that the social meta tags are intact, and that the cheat code in the page still
matches the one in the README.

Then open `index.html` in a browser and look at it. Check phone width too —
the grid drops to two columns around 520px and the doors get tighter.

## Things to leave alone

- **No analytics, no cookies, no backend.** The page stores opened doors in
  `localStorage` and that's the whole data model. Keep it that way.
- **No external requests at runtime.** Fonts are self-hosted on purpose. A PR
  that adds a CDN link will fail `npm test`.
- **The disclaimers** in the hero, the footer and the LICENSE stay.
