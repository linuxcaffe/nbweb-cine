---
toc: true
---

# NbWeb-cine

A film production scheduling plugin for [nb-web](https://github.com/linuxcaffe/nb-web).

---

Traditional film production software — Movie Magic, StudioBinder, Celtx — locks your schedule, your script, and your call sheets inside proprietary formats and subscription paywalls. When the project wraps, the data is stranded. When the tool changes its pricing, you're held hostage.

NbWeb-cine takes the opposite position: **your production data is just files**. A shot is a Markdown file with YAML frontmatter. A scene is a Markdown file. Actor contacts, location notes, story cards — all plain text, readable in any editor, version-controlled by git, searchable from the command line, editable on any device without an internet connection. The production lives in a folder. You own it completely.

The plugin is a set of lenses on that folder. The same shot file that appears as a draggable strip on the stripboard appears as a verbose card on the call sheet and as a row in the scene index — the data doesn't change, only the query does. Renumber a scene by changing one field; every reference updates automatically. Restructure your entire shooting order by dragging strips; the git history records every decision. Lock a shot when it's confirmed; the board enforces it.

Move a shot to a different day and the budget updates. The live total sits at the top of the stripboard; hit **↻** to recompute from the current schedule in place. Archive the entire production any time as a standard zip of standard text files. You don't need to — git is already tracking every change — but the option is always there, and it will open on any computer in twenty years.

This is what becomes possible when infrastructure is separated from domain. [nb](https://github.com/xwmx/nb) solved the hard problems — notebook management, git sync, full-text search, cross-linking. [nb-web](https://github.com/linuxcaffe/nb-web) solved the rendering layer. NbWeb-cine just says: here are the fields a film production cares about, here are the views that make them useful. The result is a production scheduling tool that fits in a git repository, costs nothing to run, and will still open its files in twenty years.

---

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

## Three-identifier system

Every production note carries three independent identifiers:

| Layer | Convention | Example | Purpose |
|-------|-----------|---------|---------|
| **Filename stem** | `WH-captive-cu-4f` | stable anchor | Used in wikilinks — never changes once embedded in scripts |
| **`alias:`** | `4f` | compact code | Stripboard cells, callsheets, list display, inline script labels |
| **`title:`** | `Captive CU — Not His First Chair` | human name | Tooltip, full display, search |

This applies to all five production note types:

| Type | Filename stem | `alias:` | `title:` |
|------|--------------|----------|----------|
| Scene | `AL-alley` | `2` (scene number) | `The Alley — Kidnapping Witnessed` |
| Shot | `WH-captive-cu-4f` | `4f` | `Captive CU — Not His First Chair` |
| Character | `BILL` | `jim_dandy` (actor file stem) | `Bill — Head Waiter, Lee Gardens` |
| Actor | `jim_dandy` | `JD` | `Jim Dandy` |
| Location | `lee_gardens` | `LG` | `Lee Gardens Restaurant` |

**Display:** `alias` always takes precedence (`alias → title → filename`). The nb-web list shows `alias — title`.

**Linking:** always embed the filename stem in wikilinks. `[[WH-captive-cu-4f]]` displays as `4f` automatically via `data-autolabel`. Never embed a bare alias (`[[4f]]`) — it won't resolve.

---

## Project structure

A cine notebook has this directory layout:

```
MyFilm/
├── .nb-cine.json          ← project anchor (activates the plugin)
├── stripboard.md          ← master stripboard page
├── callsheet_dy_1.md      ← Day 1 call sheet
├── shots/
│   ├── LG-establish-1a.md ← {LOC}-{desc}-{alias}.md convention
│   ├── WH-captive-cu-4f.md
│   ├── lunch_dy1.md       ← special strip (type: lunch)
│   └── …
├── script/
│   ├── lg-establish.md    ← scene file (type: scene, alias: 1)
│   └── WH-warehouse-bust.md
├── characters/
│   ├── BILL.md            ← character role (type: character, ALLCAPS stem)
│   ├── AMY.md
│   └── …
├── cast/
│   ├── jim_dandy.md       ← actor person (type: actor)
│   └── …
├── locations/
│   ├── lee_gardens.md
│   └── …
├── resources/
│   ├── car1.md
│   └── …
├── schedule/
│   ├── day_1.md           ← shoot day record (type: day)
│   └── …
└── storylines/
    ├── main-plot.md       ← lane definition (type: storyline)
    └── subplot-a.md       ← story card (type: story)
```

`characters/` and `cast/` are siblings, not nested. Characters are immutable roles; cast are the people assigned to them. This separation makes recasting a one-field change with zero shot files touched.

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
alias: 1a            # compact display label (stripboard cell, list title)
title: Lee Gardens Establishing
type: shot           # shot | lunch | move
day: 1               # shoot day number
seq: 3               # position within the day (rewritten on drag)
day_night: N         # D | N
int_ext: I           # I | E
loc: LG              # location alias
desc: |
  High-energy HH establishing shot — last customers,
  waiters clearing and cashing out. Bill notices Terry.
tech: |
  camera: A-cam with 18mm, B-cam with 35mm
  sound: wild traffic noise
  lights: neon sign flicker for cu
  grip: 10ft dolly
art: |
  props: chopsticks, whiskey
  hair: Terry's bad plastered-down crisis look
  wardrobe: cheap rumpled brown suit
cast: |
  actors: BILL, AMY, CARLOS   ← CHARACTER codes, not actor codes
  extras: 9
lock:
---
```

`cast.actors:` lists **CHARACTER codes** — the ALLCAPS filename stems from `characters/`. These are immutable once a shot is locked. Recasting never touches shot files.

The three sub-block fields (`tech`, `art`, `cast`) are freeform YAML block scalars — write whatever lines make sense for your production. They render as a `<pre>` block in the frontmatter table and are preserved verbatim on drag/resequence.

**`day: ""`** marks a shot as unscheduled — it appears in the UNSCHEDULED zone at the top of the master stripboard and is excluded from day-filtered queries.

**`lock:`** with no value (or any truthy value: `lock: true`) pins a shot in place on the stripboard. Locked shots cannot be dragged; an attempt to drag them across a day break shows an alert and reverts.

### Character file frontmatter

```yaml
---
type: character
title: Bill — Head Waiter, Lee Gardens
alias: jim_dandy        # actor filename stem — empty means uncast
description: |
  Mid-50s, world-weary restaurateur.
  Owes favours to the wrong people.
fudge: 12000            # ATL estimate before casting (budget: use this)
rate:                   # populated from actor note once alias is set
days:                   # from stripboard schedule
wardrobe:
props:
---
```

Filename stem (`BILL`) is the immutable CHARACTER code used in shot `cast.actors:` fields.

`alias:` is the actor filename stem (`jim_dandy`). Empty = uncast. Setting it links to `cast/jim_dandy.md`. Recasting = change this field. Zero shot files touched.

Resolution chain: `BILL → characters/BILL.md → alias: jim_dandy → cast/jim_dandy.md → alias: JD`

### Actor file frontmatter

```yaml
---
type: actor
title: Jim Dandy
alias: JD               # compact code — stripboard cell label
phone: 123-456-7890
contact: |
  cel: 123-456-7890
  email: jd@somedomain.com
agent: |
  company: PeoplePower
  phone: 234-567-8910
rate: 1500/day
union:
---
```

`alias:` is the compact callsheet code (e.g. `JD`). `title:` is the person's name.

### Location file frontmatter

```yaml
---
type: location
title: Lee Gardens Restaurant
alias: LG               # compact code — stripboard loc column
address: Spadina, Toronto
pin:
start:
end:
notes: city permit required
---
```

### Day file frontmatter

```yaml
---
type:  day
day:   1               # shoot day number — links to shots with day: 1
date:  2026-09-08      # calendar date; absent = hypothetical/unscheduled
hours: |
  full_day: 12
  cast: 8
  crew: 12
  location: 10
---
```

`day:` is the numeric shoot day, matching the `day:` field on shot notes.

`date:` is optional. When present the day is *hard-scheduled* — the date appears on the DAY banner in shot lists and is used by gen-budget.py for journal dating. Without a date the day is hypothetical.

`hours:` drives per-hour resource costing. Sub-fields correspond to the `hours_type:` field on resource notes:

| Sub-field | Meaning |
|-----------|---------|
| `full_day` | Total crew hours on set |
| `cast` | Hours talent is on set (may differ from full day) |
| `crew` | Crew-only hours (prep + strike + shoot) |
| `location` | Hours at the location (may include prep day) |

Add or rename sub-fields freely — they are read by name from the resource `hours_type:` field.

Day notes live in `schedule/`.

### Resource file frontmatter

```yaml
---
type:       resource
resource:   Hero delivery van
code:       Car1
supplier:   Props house
unit:       day          # day | hour
hours_type: full_day     # which hours bucket to use when unit: hour
start:      2026-09-08   # first shoot date this resource applies (optional)
end:        2026-09-10   # last shoot date (optional; open range if omitted)
lock:
---
```

Financial data lives in the **annotation sidecar** (admin-only), not the note:

```yaml
---
cost per: 80.00
unit: day
---
```

This keeps the resource visible to `office` level (who can see supplier, scheduling, and billing method) while the actual rate is only visible to `admin`. gen-budget.py reads cost from the annotation sidecar via `parse_rate()` — the same pattern used for cast rates.

`unit: day` — flat rate per scheduled shoot day.

`unit: hour` — rate multiplied by the value of `hours_type` from the day note for that shoot day. For example, a hair & makeup kit billed per cast hour uses `unit: hour` and `hours_type: cast`.

`start:` / `end:` constrain which shoot days the resource applies to. Omit both for a resource that applies to every scheduled day.

`code:` is the compact identifier used in stripboard field lookups (`resource.notes: Car1`) and in the budget journal account path (`Expenses:BTL:Resources:Car1`).

Resource notes live in `resources/`.

### Scene file frontmatter

```yaml
---
type: scene
alias: 1                # scene number — display code and sort key
title: Lee Gardens — Late Night Service
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

`type: scene` is the detection marker. `alias:` is the scene number.

`toolbar: true` pins a shortcut button to the nb-web toolbar for quick access.

`lock:` (any truthy value) prevents the script from being edited in nb-web — the Edit button is replaced by an Unlock button. Useful for approved pages.

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
| `shots.strip` | Draggable stripboard — all days + UNSCHEDULED zone at top |
| `shots.strip \| day: 1` | Draggable stripboard filtered to shoot day 1 |
| `shots.strip \| day: ""` | Draggable view of unscheduled shots only |
| `shots.sheet \| day: 1` | Call sheet rows — verbose text, print-friendly |
| `scenes` | Scene index: all scenes with colour coding |
| `scenes \| loc: LG` | Scenes at location LG only |
| `storylines` | 2D storylines board — small cards (title only), default size |
| `storylines.small` | Same as `storylines` — compact cards, title only |
| `storylines.large` | Board with large cards — title, scene chips, and metadata |
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

Card layout, one card per shot. Shows full description text, full actor names with characters, location name, and the `tech:`, `art:`, and `cast:` sub-blocks. Designed to print clean in black and white — the Second AD's territory.

### Scene index (`scenes`)

Compact table: scene number, I/E, D/N, location code, synopsis. Colour-coded rows. Click scene number to open the script file.

### Screenplay preview

Opening a script file (`script/1.md`) in nb-web automatically renders it as a screenplay page: Courier font, Hollywood margins, slug line, action, character cues, dialogue, parentheticals. No codeblock needed — the plugin detects `type: scene` (or legacy `scene_no:`) frontmatter and takes over the preview renderer.

Two toggle buttons appear in the preview toolbar:

| Button | Mode |
|--------|------|
| 🎬 | Screenplay view — formatted page with Hollywood margins |
| 📝 | Raw markdown view — plain text with frontmatter table |

The last-used mode is remembered per note via `localStorage`.

### Field lookup (`actor.phone`, `location.address`, …)

Three-column table: code | name | field value. Any frontmatter field from actor, location, or resource notes is accessible. Multiline YAML block scalars (like `contact: |`) render in a `<pre>` block.

---

## Drag and resequence

The stripboard uses [SortableJS](https://sortablejs.github.io/Sortable/) with `forceFallback: true`. Drag any strip to a new position; on drop the plugin walks the DOM to infer the new day and sequence order, then calls `/api/cine/resequence` to patch `day:` and `seq:` frontmatter in all affected files — one git commit for the whole operation.

Day break headers are non-draggable dividers. Strips can be dragged across day breaks to move a shot to a different shoot day.

### UNSCHEDULED zone

The master board (`shots.strip` with no day filter) always shows an **UNSCHEDULED** header at the top. Shots with `day: ""` appear there. Drag any scheduled shot above the DAY 1 header to unschedule it — the backend writes `day: ""` back to the file. Drag an unscheduled shot down past a day header to schedule it.

When all shots are scheduled the zone shows a faint *"drag here to unschedule"* drop target. For a permanent anchor — so the zone is always open — add a locked placeholder shot with `day: ""` and `lock: true`.

### Lock

Set `lock:` (or `lock: true`) in a shot's frontmatter to pin it in place. The drag handle is still visible, but any attempt to move the shot across a day break is blocked with an alert and the board reverts. Useful for confirmed shots that must not be accidentally rescheduled.

---

## Storylines

The storylines board is a 2D conceptual overview — a 1000-ft view of story structure before committing to a scene order. It sits alongside the stripboard, not above it: the stripboard is production logistics, storylines is story development.

```
```cine
storylines
```
```

### Board layout

The board has three horizontal layers stacked top to bottom:

| Layer | Type | Purpose |
|-------|------|---------|
| **Storyline track** | `type: storyline` | One row — the master story spine. Cards dragged here are "promoted" to the main arc. |
| **Plotline rows** | `type: plotline` | One row per named arc (character, theme, subplot). Story cards live here until promoted. |
| **Milestone row** | `type: milestone` | One row — structural markers: act breaks, picture lock, key turning points. Can also be promoted to the storyline track. |

All rows scroll horizontally. Lane labels on the left are sticky.

### Promote / demote

**Storyline track** — the top row acts as the master spine. Drag any story card (from a plotline row) up to the storyline track to promote it; it gets a `story_seq:` field and appears in story-view and script-view. Drag it back down to demote (or use the `−` button that appears on hover). Milestone cards can be promoted to the storyline track the same way.

**Plotline rows** — cards can be dragged between plotline lanes to reassign an arc. A card's `plotline:` and `seq:` are updated on drop.

**Milestone row** — milestones have their own `milestone_seq:` for position in the milestone row, independent of `story_seq:` for position on the storyline track. A milestone can have both set simultaneously.

### Body peek while dragging

When you start dragging a plotline card, its full note body renders as formatted markdown in a peek panel on the right side of the board. Useful for reading the card's details — character arcs, draft notes — while choosing where to place it. The panel closes when you drop.

### Card sizes

Three zoom levels, cycled with the **▦** button in the board toolbar:

| Size | Min height | Content |
|------|-----------|---------|
| `small` | 80px | Title only — high density, good for structure work |
| `medium` | 130px | Title + desc + first paragraph of body |
| `large` | 180px | Title + desc + body + scene chips + all frontmatter |

Size is persisted in `localStorage` per notebook.

### Views

Three views share the same `el.dataset.query` slot and switch in place:

| Button | Query | Description |
|--------|-------|-------------|
| **▦** | `storyline-board` | Interactive drag board (overlay) |
| **📖** | `storyline-story` | Prose cards: promoted stories + milestone bars in `story_seq` order |
| **≡** | `storyline-script` | Full body of each promoted story rendered as markdown, interleaved with milestone bars |

The `▦` button appears in story-view and script-view toolbars. The **≡/☰** button toggles between story-view and script-view. The board's **📖** button returns to story-view.

Script-view fetches each story's full note body asynchronously and renders it with `marked.parse()`. It is a read-only continuous document — click any title or milestone bar to open the note.

### Project structure

All storyline-related notes live in `storylines/`. Use a named subfolder for multi-project notebooks:

```
MyFilm/
└── storylines/
    ├── main-plot.md          ← type: storyline  (the master spine)
    ├── bill-arc.md           ← type: plotline   (character arc lane)
    ├── subplot-heist.md      ← type: plotline   (subplot lane)
    ├── they-lose-the-car.md  ← type: story      (story card)
    ├── sam-realizes.md       ← type: story      (story card)
    ├── picture-lock.md       ← type: milestone
    └── end-of-act-2.md       ← type: milestone
```

Multi-project notebooks scope storylines to a subfolder:

```
MyNotebook/
└── storylines/
    └── makemovies/           ← project subfolder
        ├── main-plot.md
        ├── they-lose-the-car.md
        └── …
```

The `el.dataset.project` attribute on the codeblock element holds the active project scope. `_loadCineBlock` passes it to `_fetchData` so all three views fetch scoped data.

### Plotline (lane) frontmatter

```yaml
---
type: plotline
title: Bill's Arc
color: steelblue
seq: 1
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `plotline` |
| `title` | yes | Lane label shown on the left |
| `color` | no | Any CSS color — tints the lane label and card borders |
| `seq` | no | Lane order top-to-bottom (lower = higher) |

### Storyline (master spine) frontmatter

```yaml
---
type: storyline
title: Main Storyline
seq: 0
---
```

Exactly one `type: storyline` note per project. It defines the master spine row at the top of the board. Additional plotline rows are `type: plotline`.

### Story card frontmatter

```yaml
---
type: story
title: They lose the car
plotline: bill-arc
seq: 3
story_seq: 7
scenes: 5, 7
desc: Bill realises the car is gone — stakes escalate
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `story` |
| `title` | yes | Card label |
| `plotline` | yes | Filename stem of the home plotline lane |
| `seq` | yes | Position within the plotline lane (rewritten on drag) |
| `story_seq` | auto | Position on the master storyline track; absent = not promoted |
| `desc` | no | One-line description — shown on medium/large cards and in story-view |
| `scenes` | no | Comma-separated scene references |

Story cards are open-ended: any additional frontmatter fields are preserved and displayed in the standard table when the note is opened.

### Milestone frontmatter

```yaml
---
type: milestone
title: End of Act II
milestone_seq: 3
story_seq: 12
---
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | Must be `milestone` |
| `title` | yes | Label shown on the card and in bars |
| `milestone_seq` | auto | Position in the milestone row (rewritten on drag); absent = not on the row |
| `story_seq` | auto | Position on the master storyline track; absent = not promoted |

Milestones are structurally independent from plotlines — they mark points in time that cut across all arcs. Use them for act breaks, lock dates, turning points. A milestone can appear in both the milestone row (`milestone_seq`) and the storyline track (`story_seq`) simultaneously.

### Scene references

The `scenes:` field lists scenes conceptually belonging to a story card. Accepts scene aliases, `scene_no` values, or filename stems:

```yaml
scenes: 5, 7        # by alias
scenes: lg-establish, wh-showdown   # by filename stem
scenes: 5, lg-establish, 12         # mixed — all work
```

Resolved scenes appear as clickable chips on the card at large size. Unresolved references appear greyed-out. Scene files are never modified — the relationship lives entirely in the story card.

### Adding cards inline

Each plotline lane has a **+** button at its right end. Type a title, press **Enter** to create. The card is assigned the next available `seq` and the lane's `plotline:` stem is set automatically.

The global **+ Story** button in the board toolbar creates an unassigned card (`plotline:` unset) which appears in the "No story" row.

The milestone row has its own **+** button. It prompts for a title, creates the note via `/api/cine/milestone/create`, and assigns the next `milestone_seq`.

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

## Access controls & privacy

Production data has different audiences. The script and shot list belong to the whole crew. Cast contact details and contracts don't. Budget line items belong to the producer, not the dailies PA.

nb-web implements a level hierarchy — `guest → user → office → admin` — and access can be set at three granularities:

- **Notebook-wide** — a production notebook can default to `user`-level; anything narrower needs explicit permission
- **Per-note** — `access: office` on any file silently hides it from users below that level; it doesn't 403, it simply doesn't appear
- **Per-block** — hledger and budget codeblocks can be restricted independently of the note that contains them

On a published Quartz crew site, proxy-layer auth (Cloudflare Access, Authelia, or similar) gates the whole site. Per-note `access:` controls what each tier sees once inside. The callsheet URL the crew gets shows scenes and locations; the same note on a producer login shows budget lines too.

For anything that genuinely must not be readable by the server — signed contracts, NDAs, sensitive personal details — nb supports per-file GPG encryption. Encrypted files travel through git version-controlled and backed up, but the content is opaque to anyone without the key. The access control system and encryption are independent and composable: use one, the other, or both.

---

## Production accounting

The same notebook that holds the stripboard holds the books. Budget line items, location fees, cast rates, and actuals all live as plain-text [hledger](https://hledger.org/) journal files alongside the shot and scene files.

The live budget total in the stripboard (see [Budget total in stripboard](#budget-total-in-stripboard)) is the visible surface of a full double-entry accounting engine. The underlying journal can be queried for any report hledger supports — top sheet, cost-to-date, account breakdown by CRTC category — directly from nb-web's hledger codeblock renderer.

Because the accounting data is plain text in the same git repository as the schedule, every budget revision has a commit timestamp, every line item has an author, and the complete financial history of the production archives alongside the creative one.

---

## Backend endpoints

NbWeb-cine adds these endpoints to nb-web's Flask backend (`app.py`):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/cine/data` | GET | All shots, scenes, actors, locations, resources, lanes, stories, milestones, orphan_scenes, config |
| `/api/cine/resequence` | POST | Batch-update `day:` and `seq:` after a stripboard drag |
| `/api/cine/story/resequence` | POST | Batch-update `plotline:`, `seq:`, `story_seq:`, `milestone_seq:` after a storylines drag |
| `/api/cine/story/create` | POST | Create a story card — slugify title, auto-assign `seq`, index, commit |
| `/api/cine/milestone/create` | POST | Create a milestone note — auto-assign `milestone_seq`, index, commit |
| `/api/cine/lock` | POST | Set or clear `lock:` on any note |

`/api/cine/data` response shape:

```json
{
  "shots":         [...],
  "scenes":        [...],
  "characters":    { "BILL": {...}, ... },
  "cast":          { "jim_dandy": {...}, ... },
  "locations":     { "LG": {...}, ... },
  "resources":     [...],
  "lanes":         [...],
  "stories":       [...],
  "milestones":    [...],
  "orphan_scenes": [...],
  "config":        { "project": "Takeout", ... }
}
```

Each story and milestone includes `body_preview` (first 280 chars of note body) for display at medium/large zoom without requiring a per-card fetch.

Data is cached in the frontend for 30 seconds per `notebook:project` key. The ↻ refresh button busts the cache.

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

**Scene index:** the `Sc` column in `cine scenes` shows `alias`. Scenes sort numerically by alias.

---

## Ctrl+[ — Insert shot from scene editor

In scene edit mode (`type: scene` notes), **Ctrl+[** opens the Insert Shot dialog:

- **Alias** — auto-suggested as next letter after the last alias found in the scene (e.g. `4f` → suggests `4g`)
- **Filename** — pre-filled as `{LOC}-{alias}`, stays in sync with alias unless manually edited
- **Title** — human-readable shot description

On confirm:
1. `[[filename]]` inserted at cursor (displays as alias automatically)
2. Scene saved
3. Shot file created in `shots/` with `alias:`, `title:`, and scene meta (`loc:`, `day_night:`, `int_ext:`, `scene:`) pre-populated
4. New shot opens in edit mode

---

## Budget total in stripboard

The stripboard note can show a live budget total using nb-web's `{{hledger: ...}}` inline query:

```markdown
Current budget total: {{hledger: balance Expenses --no-total --format '%(total)' -1}}
```

This resolves on render to e.g. `10,010.00 CAD`. The number format (thousands separator, commodity symbol) comes from a `commodity` directive in the notebook's main journal:

```journal
commodity 1,000.00 CAD
```

**Recalc button:** when `.nb-hledger.json` has a `regen_script` field pointing to the budget generator, nb-web adds a `↻` button inline after the total. One click:

1. Runs `.tools/gen-budget.py` (reads current shot day assignments, rewrites `photography-budget.journal`)
2. Re-fetches the hledger query (cache cleared by regen)
3. Updates the total in place — no page reload

Configure in `.nb-hledger.json`:

```json
{
  "journal": "~/.nb/Takeout/accounting/journals/main.journal",
  "regen_script": ".tools/gen-budget.py"
}
```

The button only appears when `regen_script` is set — notes without it get a plain resolved value.

**gen-budget.py** reads the schedule from `shots/` (day assignments), resolves the CHARACTER→actor chain, and writes hledger transactions to `accounting/journals/photography-budget.journal`.

Four data sources are loaded:

| Source | Folder | Used for |
|--------|--------|---------|
| Shots | `shots/` | Schedule — which characters and locations appear on each day |
| Characters + Cast | `characters/` + `cast/` | ATL costing via fudge or rate × days |
| Locations | `locations/` | BTL location fees per day used |
| Resources | `resources/` | BTL equipment, vehicles, packages |
| Days | `schedule/` | Hours per day — multiplier for per-hour resources |

**ATL costing (characters):** two-path — `fudge:` on the character file (pre-cast lump estimate) or `rate × qty` from the cast annotation sidecar once an actor is attached.

**BTL costing (resources):** `unit: day` → flat rate per applicable shoot day; `unit: hour` → rate × hours from the day note's `hours.<hours_type>` sub-field. Date-range filtering via `start:` / `end:` on the resource note. A resource with no dates applies to every scheduled day.

---

## Status

Working and in active use. The core loop — edit script → Ctrl+[ shots → drag stripboard → print call sheet — is functional.

- [x] Draggable stripboard with day/seq write-back
- [x] Drag to unscheduled (`day: ""`)
- [x] Scene index with alias sort
- [x] Three-identifier scheme — filename / alias / title on all production types
- [x] `alias — title` display format in nb-web list for all cine types
- [x] CHARACTER/actor resolution chain — shots never touch actor names
- [x] Screenplay preview with 🎬/📝 renderer toggle
- [x] Ctrl+[ insert shot from scene editor — auto-suggest, create, open
- [x] Storylines board — plotline lanes, master storyline track, horizontal scroll
- [x] Three card sizes (small/medium/large) with body preview at medium/large
- [x] Promote/demote — drag story card to/from master storyline track; `story_seq` written back
- [x] Milestone lane — `type: milestone`, narrow dark cards, `milestone_seq` + `story_seq`
- [x] Milestones on storyline track — same drag-on/off mechanic as story cards
- [x] Three views: board (▦), story-view (📖), script-view (≡)
- [x] Story-view: prose cards interleaved with milestone bars, in `story_seq` order
- [x] Script-view: full body markdown + milestone bars, async per-card fetch
- [x] Inline story card creation per lane; milestone + button
- [x] Body peek panel while dragging plotline cards
- [x] Clickable lane labels to preview plotline note in peek panel
- [x] `shot:` and `loc:` filters in `shots.line` codeblock
- [ ] gen-characters.py — ALLCAPS extraction from scene prose
- [x] gen-budget.py — CHARACTER/actor two-path costing; resource BTL costing (day + hourly); `↻` recalc button in stripboard
- [x] `type: day` — shoot day record with hours breakdown; card preview; `schedule/` folder
- [x] `type: resource` — BTL line item with `unit: day|hour` + `hours_type:`; card preview
- [ ] Print/export CSS for call sheets
- [ ] `weather` query (wttr.in for call sheet header)
- [ ] `nbweb:plugin?url=…` one-click install scheme

---

## Developer notes

### SortableJS group configuration — the `put` trap

`put: false` on a SortableJS sortable blocks **all** drag-and-drop interaction with that list, including within-list reordering. With `forceFallback: true` (which this plugin always uses), SortableJS checks `put` even for same-list moves before showing the insertion indicator. A list that should only sort within itself must use `put: true`, not `put: false`.

The contamination guard lives on the **receiving** side: plotline rows accept `put: ['plotlines', 'storyline']`; the storyline track accepts `put: ['plotlines', 'milestones-row']`. Nothing accepts an unrecognised group name, so cards snap back if dropped somewhere that doesn't want them.

```javascript
// WRONG — blocks within-list sort indicator
group: { name: 'milestones-row', pull: true, put: false }

// RIGHT — allows within-list sort; no other zone has 'milestones-row' in its put list
group: { name: 'milestones-row', pull: true, put: true }
```

### Promote-to-storyline: `pull: 'clone'` pattern

Plotline rows (and the milestone row) use `pull: (to) => to.options.group.name === 'storyline' ? 'clone' : true`. When a card is dragged to the storyline track, SortableJS inserts a **clone** in the target and leaves the original in the source. The storyline `onAdd` handler calls `_resequenceStoryline(cardZone)`, which walks the current DOM (including the clone, which has the correct `data-selector`) and assigns `story_seq` values. Then `_refresh()` discards the DOM and rebuilds from fresh API data — the original card stays in its plotline lane, and a rebuilt card appears in the storyline track.

This means `_resequenceStoryline` must select **both** card types: `.nb-cine-story-card, .nb-cine-milestone-card`.

### Drop position: read DOM, don't use maxSeq+1

The original `_promoteCard` function used `maxSeq + 1` — cards always appended at the end regardless of drop position. The fix: SortableJS already placed the card at the correct DOM index before `onAdd` fires. `_resequenceStoryline(cardZone)` just walks `querySelectorAll` in DOM order and assigns `story_seq: i + 1`. The drop position is free, not forced.

### The `_demoting` flag pattern

When a card is dragged from the storyline back to a plotline row, TWO handlers fire: the plotline's `onAdd` (which handles the demote) and the plotline's `onEnd` (which would normally call `_onStoryDrop`). `onEnd` fires after `onAdd`. The `_demoting` flag (declared per-sortable, not shared) short-circuits `onEnd`:

```javascript
let _demoting = false;
onAdd(evt) {
    if (evt.from.closest('.nb-cine-storyline-main')) {
        _demoting = true;
        evt.item.remove();
        _demoteCard(story);   // async, calls _refresh()
    }
},
onEnd() {
    if (_demoting) { _demoting = false; return; }
    _onStoryDrop(el, board, notebook);
},
```

The same pattern applies to `_msDemoting` in the milestone zone sortable.

### `_project` scope in `_loadCineBlock`

`_loadCineBlock` sets `_project` from `el.dataset.project` only for known storyline field types. When adding a new field type that uses storyline data, add it to the condition or it silently fetches unscoped data and gets nothing:

```javascript
const _project = (field === 'storyline-board'
    || field === 'storyline-story'
    || field === 'storyline-script')   // ← must include all storyline views
    ? (el.dataset.project || '') : '';
```

### `getPreviewRenderer` shim — always call `detect()`

The `getPreviewRenderer` backward-compat shim in `nbweb.js` returns the first renderer whose `detect(note)` returns true. **Do not return `previewRenderers[0]` without calling `detect()`** — the storyline renderer only activates for notes with `type: storyline` or `type: story` etc. Without the detect check, it leaks to every note in the cine notebook and renders them all as empty storyline blocks.

### `milestone_seq` vs `story_seq` — two independent sequences

A milestone note carries two independent position fields:

- `milestone_seq` — its position in the milestone row at the bottom of the board
- `story_seq` — its position on the master storyline track (shared with story cards)

Both can be set simultaneously. Both can be null independently. The `promotedAll` list in story-view and script-view combines `data.stories` (filtered by `story_seq`) with `data.milestones` (also filtered by `story_seq`) and sorts by `story_seq`. The `isMs` distinguisher is `item.milestone_seq !== undefined` — milestones always have that key in the API response; story cards never do.

---

## License

[AGPL v3](LICENSE) — software always free, your data always yours.
