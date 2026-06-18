# Three-Act Starter Pack

A complete example storyline demonstrating the Hollywood 3-act structure using
the nbweb-cine storylines board. The story is *The Crossing* — a courier thriller
set in a near-future city.

## What's included

| Type | Count | Notes |
|------|-------|-------|
| `storyline` | 1 | `main-storyline.md` — top-level container |
| `plotline` | 2 | Main plot (Alex) + Relationship arc (Cass) |
| `milestone` | 8 | Classic 8-point beat structure (Opening Image → Resolution) |
| `story` | 15 | 11 main-plot cards, 4 relationship cards |

The 8 milestones have both `milestone_seq` (their position in the milestone row)
and `story_seq` (their interleaved position on the main storyline track), so they
appear correctly in all three views: board, story, and script.

## Installation

Copy the folder contents into a `storylines/` folder in any nb notebook:

```bash
# Example: copy into Takeout notebook
cp -r examples/three-act-starter/ ~/.nb/Takeout/storylines/three-act-starter/
```

Then rebuild the nb index for that notebook:

```bash
nb Takeout: index reconcile
```

Open nb-web, navigate to `Takeout → storylines → three-act-starter`, and click
any note with `type: storyline` to open the board overlay.

## Viewing

The board loads with all 15 story cards spread across two plotline rows and
8 milestone cards in the milestone row — all promoted to the master storyline
track so the story-view and script-view are populated immediately.

Use the zoom button (`◼ / ▣ / □`) to cycle card sizes. Switch to story-view
(`≡`) to read the beat sequence as flowing prose, or script-view (`☰`) to read
each card's full body text in order.

## Adapting to your own story

1. Rename `main-storyline.md` — update `title:` to your project name.
2. Rename/edit the plotline files — change `title:` and `color:`.
3. Replace story card bodies with your own beats.
4. Drag milestone cards to reposition the act breaks on the board.
5. Add new story cards with `Ctrl+N` in any note list, setting `type: story`
   and `plotline:` to match the plotline filename stem.

The `story_seq` and `milestone_seq` values are just integers — the board
resequences them automatically when you drag cards, so don't worry about gaps.
