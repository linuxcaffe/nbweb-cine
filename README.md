# NbWeb-cine

A film production scheduling plugin for [nb-web](https://github.com/linuxcaffe/nb-web).

NbWeb-cine brings the **stripboard** — the traditional paper scheduling tool of the film industry — into your nb notebook. Shot files, scene files, actor contacts, and location notes all live as plain Markdown with YAML frontmatter. The plugin renders them as interactive production documents: draggable stripboards, verbose call sheet rows, scene indexes, screenplay pages, and field-lookup tables for cast and locations.

---

## What is a stripboard?

In film production, a **stripboard** is a physical board covered in colour-coded paper strips — one per shot. The First AD and Director arrange the strips to build the shooting schedule, then hand that sequence to the Second AD, who prints the daily call sheets. The colour tells you at a glance whether a shot is interior or exterior, day or night:

| Colour | Meaning |
|--------|---------|
| White  | Interior Day |
| Yellow | Exterior Day |
| Blue   | Interior Night |
| Green  | Exterior Night |
| Tan    | Lunch break |
| Orange | Company move |
| Black  | Day break header |

NbWeb-cine renders horizontal strip rows in a scrollable board. Drag to reorder; sequence numbers are written back to frontmatter automatically.

---

## Requirements

- [nb](https://github.com/xwmx/nb) — plain-text note-taking CLI
- [nb-web](https://github.com/linuxcaffe/nb-web) — browser UI for nb
- [SortableJS](https://sortablejs.github.io/Sortable/) v1.15+ vendored in nb-web (`Sortable.min.js`)
- Python `PyYAML` for the nb-web backend

---

## Installation

```bash
# 1. Clone the plugin repo
git clone https://github.com/linuxcaffe/nbweb-cine ~/dev/nbweb-cine

# 2. Symlink into nb-web's plugins directory
ln -s ~/dev/nbweb-cine/nbweb-cine.js ~/dev/nb-web/plugins/nbweb-cine.js

# 3. Register the plugin in nb-web/nb-settings.json
#    Add to the "plugins" array:
{ "url": "/plugins/nbweb-cine.js", "enabled": true }
```

The plugin activates automatically for any notebook that contains a `.nb-cine.json` project anchor file.

---

## Project structure

A cine notebook has this directory layout:

```
MyFilm/
├── .nb-cine.json          ← project anchor (activates the plugin)
├── stripboard.md          ← master stripboard page
├── callsheet_dy_1.md      ← Day 1 call sheet
├── shots/
│   ├── 1a.md              ← one file per shot
│   ├── 1b.md
│   ├── lunch_dy1.md       ← special strip (type: lunch)
│   └── …
├── script/
│   ├── lg-establish.md    ← scene file (type: scene, alias: 1)
│   └── wh-showdown.md
├── storylines/
│   ├── main-plot.md       ← lane definition (type: storyline)
│   └── subplot-a.md       ← story card (type: story)
├── actors/
│   ├── jim_dandy.md
│   └── …
├── locations/
│   ├── lee_gardens.md
│   └── …
└── resouces/              ← (spelling is project-specific, both scanned)
    ├── car1.md
    └── …
```

### `.nb-cine.json`

```json
{
  "project": "Takeout",
  "aka": "Ninja Waiters"
}
```

### Shot file frontmatter

```yaml
---
scene: 1
shot: 1a
type: scene          # scene | lunch | move
day: 1               # shoot day number
seq: 3               # position within the day (rewritten on drag)
day_night: N         # D | N
int_ext: I           # I | E
desc: |
  Bill walks in. Alice pretends to read.
  The ceiling fan turns.
loc: LG              # location code
cameras: A, B
lens: wide
platform: hh         # hh = handheld, sticks, crane, …
actors: JD, AM
resources: Extras, Food
---
```

### Actor file frontmatter

```yaml
---
name: Jim Dandy
code: JD
character: Bill
phone: 123-456-7890
contact: |
  cel: 123-456-7890
  email: jd@somedomain.com
agent: |
  company: PeoplePower
  phone: 234-567-8910
unit: hour
qtty: 20
cost per: $75.00
---
```

### Location file frontmatter

```yaml
---
location: Lee Gardens restaurant
loc_code: LG
address: Spadina, Toronto
unit: day
cost per: $1000.00
notes: city permit required
---
```

### Scene file frontmatter

```yaml
---
type: scene
alias: 1
int_ext: I
day_night: N
loc: LG
toolbar: true
lock:
---

INT. LEE GARDENS — NIGHT

Bill walks in. The ceiling fan turns.

                    BILL
          Where is everybody?
```

`type: scene` registers the file as a scene note — it gets the 📜 icon, appears in `cine scenes`, and carries full `meta` in list responses. `alias:` is the scene number (see [Alias](#alias) below). `scene_no:` is the legacy field and still accepted.

`toolbar: true` pins a shortcut button to the nb-web toolbar for quick access.

---

## The `cine` codeblock query language

Embed live cine blocks anywhere in your nb notes using fenced ` ```cine ` blocks:

```
```cine
shots | day: 1
```
```

### Syntax

```
field[.format] [: code, code, …] [| filter: value, filter: value, …]
```

### Query reference

| Query | Result |
|-------|--------|
| `shots` | Compact shot list — all shots, all days (default) |
| `shots \| day: 1` | Shot list filtered to shoot day 1 |
| `shots \| actor: JD` | All shots featuring actor JD |
| `shots \| scene: 2` | All shots in scene 2 |
| `shots \| day: ""` | Unscheduled shots (no day assigned yet) |
| `shots.line \| day: 1` | Compact single-line list, explicit (same as default) |
| `shots.strip` | Draggable stripboard — all days; drag to resequence |
| `shots.strip \| day: 1` | Draggable stripboard filtered to shoot day 1 |
| `shots.sheet \| day: 1` | Call sheet rows — verbose text, print-friendly |
| `scenes` | Scene index: all scenes with colour coding |
| `scenes \| loc: LG` | Scenes at location LG only |
| `storylines` | 2D storylines board — draggable story cards across named lanes |
| `actor.phone: JD, AM, CC` | Field lookup: phone numbers for listed actors |
| `actor.character: JD, AM` | Field lookup: character names |
| `actor.agent` | Field lookup: all actors, agent field |
| `location.address: LG, AL` | Field lookup: addresses for listed locations |
| `location.notes: AL` | Field lookup: notes for location AL |
| `resource.notes: Car1` | Field lookup: any field from resource notes |

Filters stack: `shots.sheet | day: 1, actor: JD` gives Day 1 shots for actor JD in call sheet format.

Field lookups omitting the code list show all entries: `actor.phone` lists every actor's phone.

---

## Renderers

### Stripboard (`shots.strip`)

Horizontal grid rows, one per shot. Colour-coded by INT/EXT + DAY/NIGHT. Draggable — drop a strip to reorder, and the new sequence is written back to each shot file's `seq:` frontmatter in a single git commit.

Columns: `SEQ · D/N · I/E · Sc · Shot · Loc · Description · Actors · Res`

All code cells are clickable links to the underlying note.

### Shot sheet (`shots.sheet`)

Card layout, one card per shot. Shows full description text, full actor names with characters, location name, and a technical line (cameras · lens · platform). Designed to print clean in black and white — the Second AD's territory.

### Scene index (`scenes`)

Compact table: scene number, I/E, D/N, location code, synopsis. Colour-coded rows. Click scene number to open the script file.

### Screenplay preview

Opening a script file (`script/1.md`) in nb-web automatically renders it as a screenplay page: Courier font, Hollywood margins, slug line, action, character cues, dialogue, parentheticals. No codeblock needed — the plugin detects `scene_no:` frontmatter and takes over the preview renderer.

### Field lookup (`actor.phone`, `location.address`, …)

Three-column table: code | name | field value. Any frontmatter field from actor, location, or resource notes is accessible. Multiline YAML block scalars (like `contact: |`) render in a `<pre>` block.

---

## Drag and resequence

The stripboard uses [SortableJS](https://sortablejs.github.io/Sortable/) with `forceFallback: true`. Drag any strip to a new position; on drop the plugin walks the DOM to infer the new day and sequence order, then calls `/api/cine/resequence` to patch `day:` and `seq:` frontmatter in all affected files — one git commit for the whole operation.

Day break headers are non-draggable dividers. Strips can be dragged across day breaks to move a shot to a different shoot day.

---

## Storylines

The storylines board is a 2D conceptual overview — a 1000-ft view of story structure before committing to a scene order. It sits alongside the stripboard, not above or below it: the stripboard is production logistics, storylines is story development.

```
```cine
storylines
```
```

### What it looks like

Each **lane** is a horizontal row with a named label on the left. Story cards sit in slots across the lane. Drag any card to a new slot in the same lane, or drop it into a different lane entirely. On drop, `storyline:` and `seq:` are written back to the card files in a single git commit — the same pattern as the stripboard.

A **"No story"** row at the bottom shows any scenes not yet claimed by any story card. It is read-only — it exists to surface gaps in coverage.

### Project structure

Both storyline and story notes live in the `storylines/` folder:

```
MyFilm/
└── storylines/
    ├── main-plot.md        ← type: storyline (lane)
    ├── subplot-a.md        ← type: storyline (lane)
    ├── they-lose-the-car.md ← type: story (card)
    ├── sam-realizes.md     ← type: story (card)
    └── things-go-bad.md    ← type: story (card)
```

### Storyline (lane) frontmatter

```yaml
---
type: storyline
title: Main Plot
color: steelblue
seq: 1
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `storyline` |
| `title` | yes | Lane label shown on the left |
| `color` | no | Any CSS color — tints the lane label and card borders |
| `seq` | no | Lane order top-to-bottom (lower = higher) |

### Story card frontmatter

```yaml
---
type: story
title: They lose the car
storyline: main-plot
seq: 3
scenes: 5, 7
characters: JD, AM
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `story` |
| `title` | yes | Card label |
| `storyline` | yes | Filename stem of the target `storyline` note |
| `seq` | yes | Slot position within the lane (rewritten on drag) |
| `scenes` | no | Comma-separated scene references (see below) |
| `characters` | no | Freeform — any extra metadata is preserved |

Story cards are open-ended: add any frontmatter fields you need — character arcs, emotional beats, draft notes. NbWeb-cine passes arbitrary metadata through and displays it in the standard frontmatter table when you open the card.

### Scene references

The `scenes:` field lists scenes that belong to this story beat, conceptually. It accepts scene aliases, `scene_no` values, or filename stems interchangeably:

```yaml
scenes: 5, 7        # by alias
scenes: lg-establish, wh-showdown   # by filename stem
scenes: 5, lg-establish, 12         # mixed — all work
```

Scene references resolve against the `script/` folder. Resolved scenes appear as clickable chips on the card. Unresolved references (typos, deleted scenes) appear greyed-out. **Scene files themselves are never modified** — the relationship is owned entirely by the story card.

### Coverage and orphans

The "No story" row at the bottom of the board shows all scenes in `script/` that are not referenced by any story card. Use it to spot scenes that haven't been assigned a story context yet.

---

## Call sheet assembly

A call sheet is just a regular nb Markdown note with several `cine` blocks on the page:

```markdown
---
title: Call Sheet — Day 1
shoot_day: 1
---

## Shot Schedule
```cine
shots.sheet | day: 1
```

## Cast
**JD — Jim Dandy (Bill)**
```cine
shots.sheet | day: 1, actor: JD
```

## Contacts
```cine
actor.phone: JD, AM, CC, TM
```
```

Every block is live — refresh the page and it reflects the current schedule.

---

## Backend endpoints

NbWeb-cine adds two endpoints to nb-web's Flask backend (`app.py`):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cine/data` | GET | All shots, scenes, actors, locations, resources, lanes, stories, orphan_scenes, config for a notebook |
| `/api/cine/resequence` | POST | Batch-update `day:` and `seq:` frontmatter after a stripboard drag |
| `/api/cine/story/resequence` | POST | Batch-update `storyline:` and `seq:` frontmatter after a storylines drag |

Data is cached in the frontend for 30 seconds. The ↻ refresh button in each block header busts the cache.

---

## Frontmatter display

Any shot, scene, actor, or location note opened in nb-web shows its frontmatter fields as a clean label/value table above the note body — a core nb-web feature that kicks in whenever no special renderer has consumed the frontmatter. No configuration needed.

---

## Alias

Any note can carry an `alias:` frontmatter field — a short, mutable label that is displayed in place of the filename wherever wikilinks render.

```yaml
---
type: scene
alias: 5
---
```

**The problem it solves:** scene numbers change constantly during development. If links were stored as `[[5]]` and scene 5 becomes scene 7, every link breaks. With alias, the link is written against the stable filename:

```markdown
[[lg-establish]]        ← stored in the file, never changes
```

…and displayed as `5` (the alias). Renumber the scene by changing `alias: 5` to `alias: 7` — all links update automatically on next page load (display is session-cached; Ctrl+R refreshes).

**Wikilink display priority:** `alias` → `title` → filename stem.

**Sort by alias:** the Sort dropdown includes an **Alias** option when the cine module is active. Numeric aliases sort numerically; string aliases sort alphabetically; notes without an alias sort last.

**Scene index:** the `Sc` column in `cine scenes` shows `alias` when set, falling back to `scene_no`. Scenes sort by `alias || scene_no`.

---

## Status

Early but working. The core loop — shoot → drag stripboard → print call sheet — is functional. On the horizon:

- [ ] `nbweb:plugin?url=…` one-click install scheme
- [ ] Print/export CSS for call sheets
- [ ] `weather` query (wttr.in integration for call sheet header)
- [ ] Multi-field horizontal table queries (`scenes actors resources | day: 1`)
- [ ] Plugins page with install/enable/disable UI

---

## License

MIT
