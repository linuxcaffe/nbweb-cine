// NbWeb-cine — film production scheduling plugin for nb-web
// Provides: cine fenced code block renderer — shots → stripboard
// Activates when notebook contains .nb-cine.json
// @name     NbWeb Cine
// @version  0.1.0
// @type     ecosystem
// @homepage https://openfilmmaker.ca
(() => {

    // ── CSS ───────────────────────────────────────────────────────────────────

    const _CSS = `
.nb-cine-block { font-family: monospace; font-size: 0.85em; }

.nb-cine-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 4px 8px; background: var(--bg2, #1e2228);
    border-bottom: 1px solid var(--border, #444); gap: 8px;
}
.nb-cine-title { font-weight: bold; opacity: 0.9; }

/* Column layout — shared by header row and all strips
   DN/IE | ID (1-1a) | Loc | Description | Actors | Res */
.nb-cine-strip {
    display: grid;
    grid-template-columns: 4ch 8ch 6ch 1fr auto 3ch;
    align-items: center;
    gap: 0 6px;
    padding: 2px 8px;
    border-bottom: 1px solid rgba(0,0,0,0.12);
    min-height: 1.8em;
    color: #111;
}
.nb-cine-colheader {
    background: var(--bg2, #1e2228) !important;
    color: var(--fg, #ccc) !important;
    font-weight: bold;
    border-bottom: 2px solid var(--border, #444);
    position: sticky; top: 0; z-index: 2;
}

/* Strip colors — industry standard */
.nb-cine-strip-ID { background: #f5f5f0; }
.nb-cine-strip-ED { background: #fffacd; }
.nb-cine-strip-IN { background: #c5d5ec; }
.nb-cine-strip-EN { background: #c5ecc5; }
.nb-cine-strip-lunch { background: #e8d5b0; font-style: italic; }
.nb-cine-strip-move  { background: #ffd090; font-weight: bold; }
.nb-cine-strip-scene { background: #eee; }

/* Day break strips */
.nb-cine-daybreak {
    display: flex; align-items: center;
    background: #1a1a1a; color: #fff;
    font-weight: bold; letter-spacing: 0.15em;
    font-size: 0.8em; padding: 4px 8px;
    border-bottom: 2px solid #444;
}
.nb-cine-daybreak-empty {
    background: transparent; color: #888;
    border-bottom: 1px dashed #555;
    font-weight: normal; letter-spacing: 0.1em;
}

/* Drop zone shown in UNSCHEDULED area when all shots are scheduled */
.nb-cine-unscheduled-placeholder {
    min-height: 44px; margin: 4px 6px; padding: 0 12px;
    border: 1px dashed rgba(255,255,255,0.15); border-radius: 3px;
    display: flex; align-items: center;
    color: rgba(255,255,255,0.2); font-size: 0.75em; letter-spacing: 0.08em;
    cursor: default; user-select: none;
}
.nb-cine-unscheduled-placeholder:hover { border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.4); }

/* Cell classes */
.nb-cine-dnie     { text-align: center; font-size: 0.85em; letter-spacing: 0.05em; }
.nb-cine-id       { font-weight: bold; }
.nb-cine-loc      { font-weight: bold; }
.nb-cine-desc     { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nb-cine-actors   { display: flex; flex-wrap: wrap; gap: 2px; }
.nb-cine-rescount { text-align: right; opacity: 0.7; cursor: default; }

/* shots.line — single-line compact view */
.nb-cine-board-line .nb-cine-strip {
    grid-template-columns: 4ch 8ch 6ch 1fr auto;
    min-height: 1.5em; padding: 1px 8px; font-size: 0.9em;
}
.nb-cine-board-line .nb-cine-colheader { font-size: 0.78em; }
.nb-cine-board-line .nb-cine-rescount  { display: none; }

/* Clickable cells */
.nb-cine-link {
    background: none; border: none; padding: 0; margin: 0;
    cursor: pointer; color: inherit; font-family: inherit; font-size: inherit;
    text-decoration: underline dotted; text-underline-offset: 2px;
    font-weight: inherit;
}
.nb-cine-link:hover { text-decoration: underline; opacity: 0.75; }

/* Actor code chips */
button.nb-cine-actor {
    padding: 0 3px; border-radius: 2px;
    font-size: 0.9em; white-space: nowrap;
}

.nb-cine-board { overflow-y: auto; }
.nb-cine-empty { padding: 12px 8px; opacity: 0.6; }
.nb-cine-error { padding: 8px; color: #c66; }

/* Sub-field table (shots.camera, shots.tech.lights, …) */
.nb-cine-sf-table { width: 100%; border-collapse: collapse; }
.nb-cine-sf-row { display: grid; grid-template-columns: 6em 1fr; gap: 8px; padding: 4px 8px; align-items: baseline; border-bottom: 1px solid var(--border); }
.nb-cine-sf-hdr { font-size: .8em; font-weight: 600; opacity: .6; border-bottom: 2px solid var(--border); }
.nb-cine-sf-id  { font-family: monospace; font-size: .9em; }
.nb-cine-sf-val { font-size: .88em; white-space: pre-wrap; }
.nb-cine-subtitle { font-size: .8em; opacity: .6; margin-left: 8px; }

@font-face {
    font-family: 'Courier Prime';
    font-weight: normal; font-style: normal;
    src: url('/fonts/courier-prime/Courier Prime.otf') format('opentype');
}
@font-face {
    font-family: 'Courier Prime';
    font-weight: bold; font-style: normal;
    src: url('/fonts/courier-prime/Courier Prime Bold.otf') format('opentype');
}
@font-face {
    font-family: 'Courier Prime';
    font-weight: normal; font-style: italic;
    src: url('/fonts/courier-prime/Courier Prime Italic.otf') format('opentype');
}
@font-face {
    font-family: 'Courier Prime';
    font-weight: bold; font-style: italic;
    src: url('/fonts/courier-prime/Courier Prime Bold Italic.otf') format('opentype');
}

.nb-cine-screenplay {
    padding: 24px; background: var(--bg, #1a1a1a); min-height: 100%;
}
.nb-script-page {
    /* WGA-standard page: 8.5" wide, 1.5" left/1" right margins at 12pt Courier = ~57 chars */
    max-width: 680px; margin: 0 auto;
    background: #fff; color: #111;
    /* Local override — .nb-rendered p/h1-h3/a rules read var(--text) directly off each
       element; without this they resolve to :root's dark-mode pale text on this white page. */
    --text: #111;
    font-family: 'Courier Prime', 'Courier New', Courier, monospace;
    font-size: 12pt; line-height: 1.65;
    padding: 72px 80px 96px 96px;
    box-shadow: 0 4px 28px rgba(0,0,0,.5);
}
.nb-script-slug {
    font-weight: bold; text-transform: uppercase;
    border-bottom: 1px solid #222;
    padding-bottom: 6px; margin-bottom: 20px;
    letter-spacing: .04em;
}
.nb-script-scene-tag  { float: right; font-weight: normal; opacity: .4; font-size: .85em; }
/* Action: blank line above, blank line below each paragraph */
.nb-script-action     { margin: 0 0 1em; white-space: pre-wrap; }
/* Character: 3.7" from left = ~37% of 10" text width */
.nb-script-char       { margin: 1em 0 0; padding-left: 37%; text-transform: uppercase; }
/* Dialogue: 2.5" from left, ends 2.5" from right */
.nb-script-dialogue   { margin: 0; padding: 0 16% 0 24%; }
/* Parenthetical: 3.1" from left */
.nb-script-paren      { margin: 0; padding: 0 22% 0 30%; font-style: italic; }
.nb-script-speech     { margin: 0 0 1em; }
.nb-script-transition { text-align: right; text-transform: uppercase; margin: 1em 0; }
.nb-script-centered   { text-align: center; margin: 1em 0; }
.nb-script-lyrics     { text-align: center; font-style: italic; margin: .5em 0; }
.nb-script-section    { text-transform: uppercase; letter-spacing: .06em; margin: 2em 0 .5em; padding-top: 6px; border-top: 1px solid #ccc; }
.nb-script-sec-1      { font-weight: bold; font-size: 1em; }
.nb-script-sec-2      { font-weight: bold; font-size: .9em; opacity: .65; }
.nb-script-sec-3      { font-style: italic; font-size: .85em; opacity: .5; border-top: none; margin-top: 1em; }
.nb-script-synopsis   { font-style: italic; color: #777; font-size: .88em; margin: 0 0 .75em; }
.nb-script-note       { font-size: .75em; color: #999; background: #fffbe6; padding: 1px 4px; border-radius: 2px; border: 1px solid #e8d87f; }
.nb-script-page-break { border: none; border-top: 1px dashed #ccc; margin: 2.5em 0; }
.nb-script-slug-inline { margin: 2em 0 .75em; border-top: 1px solid #444; padding-top: 6px; font-weight: bold; text-transform: uppercase; letter-spacing: .04em; }

/* Shot cue superscripts — [[1c]] inside screenplay body */
sup.nb-cine-shot-cue {
    font-size: 0.62em; font-family: 'Courier New', Courier, monospace;
    color: #888; font-style: normal; font-weight: normal;
    cursor: pointer; user-select: none; margin-left: 1px;
}
sup.nb-cine-shot-cue:hover { color: #c77; text-decoration: underline; }

/* Script title-page header (type: script) */
.nb-script-title-page {
    font-family: 'Courier Prime', 'Courier New', Courier, monospace;
    text-align: center; padding: 48px 24px 32px;
    border-bottom: 2px solid var(--border, #444);
    margin-bottom: 24px;
}
.nb-stp-title  { font-size: 2em; font-weight: bold; text-transform: uppercase;
                  letter-spacing: .08em; margin-bottom: 20px; color: var(--text, #eee); }
.nb-stp-byline { font-size: .85em; opacity: .55; margin-bottom: 4px; }
.nb-stp-author { font-size: 1.1em; margin-bottom: 12px; color: var(--text, #eee); }
.nb-stp-info   { font-size: .8em; opacity: .5; margin-bottom: 20px; }
.nb-stp-actions { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; align-items: center; }

/* Insert Shot overlay */
.nb-cine-insert-overlay {
    position: fixed; inset: 0; z-index: 9000;
    background: rgba(0,0,0,.45);
    display: flex; align-items: center; justify-content: center;
}
.nb-cine-insert-card {
    background: var(--bg2, #222); border: 1px solid var(--border, #555);
    border-radius: 8px; padding: 20px 24px; min-width: 320px;
    box-shadow: 0 8px 32px rgba(0,0,0,.6);
    font-family: var(--font, sans-serif);
}
.nb-cine-insert-card h4 {
    margin: 0 0 14px; font-size: .95em;
    color: var(--text-muted, #aaa); font-weight: 600; letter-spacing: .04em;
}
.nb-cine-insert-card label {
    display: block; font-size: .82em; color: var(--text-muted, #aaa);
    margin-bottom: 2px; margin-top: 10px;
}
.nb-cine-insert-card label:first-of-type { margin-top: 0; }
.nb-cine-insert-card input,
.nb-cine-insert-card textarea {
    width: 100%; box-sizing: border-box;
    background: var(--bg, #1a1a1a); color: var(--text, #eee);
    border: 1px solid var(--border, #555); border-radius: 4px;
    padding: 6px 8px; font-size: .9em;
}
.nb-cine-insert-card textarea { resize: vertical; min-height: 56px; }
.nb-cine-insert-btns {
    display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;
}

/* Plain script view */
.nb-cine-plain-script { padding: 16px 24px; min-height: 100%; }
.nb-cine-plain-pre {
    font-family: 'Courier Prime', 'Courier New', Courier, monospace;
    font-size: 0.9em; line-height: 1.6;
    white-space: pre-wrap; word-break: break-word;
    margin: 0; color: var(--fg, #ccc);
}

/* Shot sheet rows */
.nb-cine-sheet-row {
    padding: 8px 12px; border-bottom: 1px solid var(--border, #444);
}
.nb-cine-sheet-head {
    display: flex; gap: 12px; align-items: baseline;
    font-weight: bold; margin-bottom: 2px;
}
.nb-cine-sheet-shotid { font-size: 0.85em; opacity: 0.7; min-width: 9ch; flex-shrink: 0; }
.nb-cine-sheet-slug   { font-size: 0.95em; text-transform: uppercase; letter-spacing: 0.04em; }
.nb-cine-sheet-desc   { white-space: pre-wrap; margin: 2px 0 4px; font-size: 0.9em; line-height: 1.45; }
.nb-cine-sheet-meta   { font-size: 0.82em; opacity: 0.75; }
.nb-cine-sheet-break  {
    padding: 4px 12px; font-style: italic; font-size: 0.85em;
    border-bottom: 1px solid var(--border, #444);
}

/* Field lookup table */
.nb-cine-lookup-table { width: 100%; }
.nb-cine-lookup-row {
    display: grid;
    grid-template-columns: 5ch 1fr 2fr;
    align-items: baseline; gap: 0 10px;
    padding: 4px 8px; font-size: 0.9em;
    border-bottom: 1px solid rgba(0,0,0,0.1);
}
.nb-cine-lookup-code    { font-weight: bold; }
.nb-cine-lookup-name    { color: var(--text-muted, #888); font-size: 0.88em; }
.nb-cine-lookup-val     { }
.nb-cine-lookup-missing { opacity: 0.4; font-style: italic; }
.nb-cine-lookup-pre     {
    margin: 0; white-space: pre-wrap; font-family: inherit;
    font-size: 0.9em; line-height: 1.4;
}

/* Scene index grid */
.nb-cine-scene-index { width: 100%; }
.nb-cine-scene-row {
    display: grid;
    grid-template-columns: 4ch 4ch 4ch 8ch 1fr;
    align-items: center;
    gap: 0 6px;
    padding: 2px 8px;
    border-bottom: 1px solid rgba(0,0,0,0.12);
    min-height: 1.8em;
    color: #111;
}
.nb-cine-si-no  { font-weight: bold; text-align: center; }
.nb-cine-si-ie  { text-align: center; }
.nb-cine-si-dn  { text-align: center; }
.nb-cine-si-loc { font-weight: bold; }
.nb-cine-si-syn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Drag handles */
.nb-cine-strip:not(.nb-cine-colheader) { cursor: grab; }
.nb-cine-strip:not(.nb-cine-colheader):active { cursor: grabbing; }
.nb-cine-ghost  { opacity: 0.35; outline: 2px dashed #888; }
.nb-cine-chosen { box-shadow: 0 3px 12px rgba(0,0,0,0.35); z-index: 10; position: relative; }

/* ── Storylines board ───────────────────────────────────────────────────── */
/* Stub: compact entry point rendered in the preview pane */
.nb-cine-sl-story-view { padding: 0 4px; }
.nb-cine-open-board-btn { margin-bottom: 10px; }
.nb-cine-sl-story-prose {
    border-left: 4px solid var(--border, #444);
    padding: 10px 14px;
    margin-bottom: 10px;
    border-radius: 0 4px 4px 0;
    background: var(--bg2, #1e2228);
    cursor: pointer; transition: background 0.12s;
}
.nb-cine-sl-story-prose:hover { background: var(--bg3, #252930); }
.nb-cine-sl-story-prose-title { font-weight: 600; margin-bottom: 4px; }
.nb-cine-sl-story-desc { font-size: 0.85em; opacity: 0.7; margin: 0; }
.nb-cine-story-mode-btn { margin: 0 auto; }

/* Milestone bar in story-view */
.nb-cine-sl-milestone-bar {
    background: #0a0a0d; color: #bbb;
    border-left: 3px solid rgba(255,255,255,0.25);
    padding: 6px 14px;
    margin-bottom: 10px; border-radius: 0 3px 3px 0;
    font-size: 0.82em; font-weight: 600; letter-spacing: 0.04em;
    cursor: pointer; transition: background 0.12s;
}
.nb-cine-sl-milestone-bar:hover { background: #14141a; }

/* Script-view: continuous rendered prose */
.nb-cine-sl-script-view { padding: 0 4px; }
.nb-cine-sl-script-story {
    padding: 0 0 24px 0;
    border-bottom: 1px solid var(--border, #333);
    margin-bottom: 24px;
}
.nb-cine-sl-script-story-title {
    font-weight: 700; font-size: 1em; margin-bottom: 8px;
    opacity: 0.5; letter-spacing: 0.04em; text-transform: uppercase;
    font-size: 0.75em; cursor: pointer;
}
.nb-cine-sl-script-story-title:hover { opacity: 0.8; }
.nb-cine-sl-script-milestone {
    background: #0a0a0d; color: #bbb;
    border-left: 3px solid rgba(255,255,255,0.25);
    padding: 5px 14px; margin-bottom: 24px;
    border-radius: 0 3px 3px 0;
    font-size: 0.8em; font-weight: 600; letter-spacing: 0.06em;
    cursor: pointer;
}
.nb-cine-sl-script-milestone:hover { background: #14141a; }

.nb-cine-sl-stub {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    background: var(--bg2, #1e2228);
    border: 1px solid var(--border, #444);
    border-radius: 6px;
}
.nb-cine-sl-stub-title { font-weight: bold; }
.nb-cine-sl-stub-meta  { flex: 1; opacity: 0.6; font-size: 0.85em; }

/* Full-screen overlay — appended to document.body, bypasses all pane constraints */
.nb-cine-sl-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: var(--bg, #16191e);
    display: flex; flex-direction: column;
    overflow: hidden;
}
.nb-cine-sl-overlay > .nb-cine-header {
    flex-shrink: 0; padding: 8px 16px; gap: 12px; min-height: 44px;
    justify-content: flex-start;
}
.nb-cine-sl-overlay > .nb-cine-header .nb-cine-title {
    font-size: 13px; font-weight: 600; color: var(--text-muted, #aaa); opacity: 1;
}
.nb-cine-sl-overlay > .nb-cine-header .nb-cine-hdr-btns { gap: 4px; }
.nb-cine-sl-overlay-body {
    flex: 1; overflow-x: auto; overflow-y: auto;
    scrollbar-color: var(--accent, #7c6af7) var(--bg2, #1e2228);
}
/* Fat, finger-friendly horizontal scrollbar -- the board's own long lanes are
   otherwise only reachable via the native scrollbar, which is thin and easy
   to miss (Chromium/Safari; Firefox falls back to scrollbar-color above). */
.nb-cine-sl-overlay-body::-webkit-scrollbar { height: 22px; }
.nb-cine-sl-overlay-body::-webkit-scrollbar-track { background: var(--bg2, #1e2228); }
.nb-cine-sl-overlay-body::-webkit-scrollbar-thumb {
    background: var(--accent, #7c6af7); border-radius: 11px;
    border: 5px solid var(--bg2, #1e2228);
}
.nb-cine-sl-overlay-body::-webkit-scrollbar-thumb:hover { background: var(--accent-hover, #9384fa); }
.nb-cine-sl-overlay > .nb-cine-card-peek { flex-shrink: 0; }

/* Board layout (used inside overlay) */
.nb-cine-storylines-board {
    display: flex; flex-direction: column; gap: 2px;
    padding: 4px 0;
    width: max-content; min-width: 100%;
}
.nb-cine-storyline-row {
    display: flex; align-items: stretch; gap: 0;
    border-bottom: 1px solid var(--border, #444);
    min-height: 80px;
}
.nb-cine-lane-label {
    flex: 0 0 9em; padding: 6px 8px;
    font-size: 0.8em; font-weight: bold; opacity: 0.85;
    border-right: 2px solid var(--lane-color, #666);
    background: color-mix(in srgb, var(--lane-color, #444) 15%, var(--bg, #16191e));
    align-self: stretch; display: flex; align-items: center;
    word-break: break-word;
    position: sticky; left: 0; z-index: 2;
}
.nb-cine-lane-cards {
    display: flex; flex-wrap: nowrap; gap: 6px;
    padding: 6px; align-items: stretch; flex: 1;
}
.nb-cine-card-peek {
    border-top: 1px solid var(--border, #444);
    padding: 12px 20px; font-size: 0.9em;
    background: var(--bg2, #1e2228);
    max-height: 320px; overflow-y: auto;
}
.nb-cine-card-peek-title {
    font-weight: bold; margin-bottom: 8px;
    opacity: 0.6; font-size: 0.82em; text-transform: uppercase; letter-spacing: 0.04em;
}
.nb-cine-card-peek .nb-rendered { padding: 0; }
.nb-cine-story-card {
    background: var(--bg2, #1e2228);
    border: 1px solid var(--border, #444);
    border-left: 3px solid var(--lane-color, #666);
    border-radius: 4px; padding: 5px 8px;
    min-width: 8em; max-width: 14em;
    cursor: grab; user-select: none;
    font-size: 0.82em;
    display: flex; flex-direction: column;
}
.nb-cine-lane-add-end {
    display: flex; align-items: center; justify-content: center;
    min-width: 2.2em; width: 2.2em; align-self: stretch;
    border: 1px dashed rgba(255,255,255,0.2); border-radius: 4px;
    margin: 6px 6px 6px 0; background: none; color: inherit;
    cursor: pointer; opacity: 0.28; font-size: 1.1em; flex-shrink: 0;
    transition: opacity 0.15s;
}
.nb-cine-lane-add-end:hover { opacity: 1; background: rgba(255,255,255,0.07); }
/* Row-header add button -- corner-pinned so it never forces the row taller
   (esp. at small zoom, where rows are short) and rides along with the label's
   own sticky positioning while a long lane scrolls horizontally. */
.nb-cine-lane-add-hdr {
    position: absolute; top: 3px; right: 3px;
    display: flex; align-items: center; justify-content: center;
    width: 1.3em; height: 1.3em; line-height: 1; padding: 0;
    border: 1px dashed rgba(255,255,255,0.3); border-radius: 4px;
    background: none; color: inherit; cursor: pointer;
    opacity: 0.35; font-size: 0.95em;
    transition: opacity 0.15s;
}
.nb-cine-lane-add-hdr:hover { opacity: 1; background: rgba(255,255,255,0.12); }
.nb-cine-story-card:active { cursor: grabbing; }
/* Locked board -- read-only: no add/demote affordances, cards aren't draggable */
.nb-cine-sl-locked .nb-cine-lane-add-end,
.nb-cine-sl-locked .nb-cine-lane-add-hdr,
.nb-cine-sl-locked .nb-cine-demote-btn { display: none; }
.nb-cine-sl-locked .nb-cine-story-card,
.nb-cine-sl-locked .nb-cine-milestone-card { cursor: default; }
.nb-cine-story-title { font-weight: bold; margin-bottom: 3px; }
/* Gold title when story has a matching nb-web tool */
.nb-cine-story-scenes {
    display: flex; flex-wrap: wrap; gap: 3px; margin-top: 3px;
}
.nb-cine-scene-chip {
    background: rgba(255,255,255,0.08); border-radius: 3px;
    padding: 1px 5px; font-size: 0.85em;
}
.nb-cine-scene-unresolved { opacity: 0.5; font-style: italic; }
/* Storyline main lane — the curated top lane */
.nb-cine-storyline-main {
    background: color-mix(in srgb, var(--accent, #7c6af7) 5%, var(--bg, #16191e));
}
.nb-cine-storyline-main > .nb-cine-lane-label {
    border-right-color: var(--accent, #7c6af7);
    background: color-mix(in srgb, var(--accent, #7c6af7) 14%, var(--bg, #16191e));
    font-style: italic; letter-spacing: 0.02em;
}

.nb-cine-orders-sel {
    background: var(--bg2, #1e2228); color: var(--fg, #ccc);
    border: 1px solid var(--border, #444); border-radius: 3px;
    padding: 2px 4px; font-size: 0.85em; cursor: pointer;
    max-width: 10em;
}
/* Card promoted to storyline — greyed in its home plotline lane */
.nb-cine-story-card.nb-cine-promoted {
    opacity: 0.35; border-left-style: dashed; cursor: default;
}
.nb-cine-story-card.nb-cine-selected {
    outline: 2px solid var(--accent, #7c6af7); outline-offset: 1px;
}
.nb-cine-peek-badge {
    display: inline-block; margin-left: 8px; padding: 1px 6px;
    border-radius: 3px; font-size: 0.78em; opacity: 0.85;
    background: var(--border, #555); color: var(--text, #eee); vertical-align: middle;
}
.nb-cine-peek-desc { font-size: 0.85em; opacity: 0.7; margin-top: 4px; }
.nb-cine-peek-open { margin-top: 6px; }

/* Storyline cards have a demote button revealed on hover */
.nb-cine-storyline-main .nb-cine-story-card { position: relative; }
.nb-cine-demote-btn {
    position: absolute; top: 3px; right: 3px;
    background: none; border: none; color: inherit; opacity: 0;
    font-size: 0.8em; line-height: 1; padding: 0 2px; cursor: pointer;
    transition: opacity 0.15s;
}
.nb-cine-storyline-main .nb-cine-story-card:hover .nb-cine-demote-btn { opacity: 0.55; }
.nb-cine-demote-btn:hover { opacity: 1 !important; color: var(--red, #f87171); }

/* Header button group — flush right */
.nb-cine-hdr-btns { display: flex; gap: 2px; margin-left: auto; }

.nb-cine-add-btn { margin-left: 4px; }

/* Inline story creation */
.nb-cine-inline-add {
    display: flex; gap: 4px; align-items: center;
    padding: 4px; background: var(--bg2, #1e2228);
    border: 1px dashed var(--border, #555); border-radius: 4px;
    min-width: 10em;
}
.nb-cine-inline-input {
    flex: 1; background: transparent; border: none; outline: none;
    color: inherit; font-family: inherit; font-size: 0.85em;
    padding: 2px 4px; min-width: 8em;
}

/* Size variants */
.nb-cine-storylines-medium .nb-cine-storyline-row { min-height: 130px; }
.nb-cine-storylines-medium .nb-cine-lane-cards    { gap: 8px; padding: 8px; }
.nb-cine-story-medium { min-width: 10em; max-width: 16em; font-size: 0.85em; padding: 6px 9px; }
.nb-cine-story-desc {
    font-size: 0.82em; opacity: 0.7; margin-top: 3px; line-height: 1.3; overflow: hidden;
}
.nb-cine-story-medium .nb-cine-story-desc {
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
}
.nb-cine-storylines-large .nb-cine-storyline-row { min-height: 180px; }
.nb-cine-storylines-large .nb-cine-lane-cards    { gap: 10px; padding: 10px; }
.nb-cine-story-large {
    min-width: 12em; max-width: 20em;
    font-size: 0.88em; padding: 8px 10px;
}
.nb-cine-story-large .nb-cine-story-title { font-size: 1em; margin-bottom: 5px; }
.nb-cine-story-meta {
    display: grid; grid-template-columns: auto 1fr;
    gap: 1px 8px; margin-top: 6px;
    font-size: 0.85em; opacity: 0.8;
}
.nb-cine-story-meta dt {
    font-weight: bold; opacity: 0.7;
    white-space: nowrap;
}
.nb-cine-story-meta dd {
    margin: 0; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap;
}

/* ── Body preview in story cards / story-view ────────────────────────────── */
.nb-cine-story-body-preview {
    font-size: 0.78em; opacity: 0.55; margin-top: 4px;
    overflow: hidden; display: -webkit-box;
    -webkit-box-orient: vertical; -webkit-line-clamp: 4;
    line-height: 1.4;
}
.nb-cine-storylines-large .nb-cine-story-body-preview { -webkit-line-clamp: 6; }
.nb-cine-sl-story-body {
    font-size: 0.82em; opacity: 0.55; margin-top: 4px;
    overflow: hidden; display: -webkit-box;
    -webkit-box-orient: vertical; -webkit-line-clamp: 3;
    line-height: 1.4;
}

/* ── Milestone row ────────────────────────────────────────────────────────── */
.nb-cine-milestone-row {
    display: flex; align-items: stretch; gap: 0;
    border-top: 2px solid rgba(255,255,255,0.12);
    min-height: 60px; margin-top: 4px;
}
.nb-cine-milestone-row .nb-cine-lane-label {
    background: #0a0a0d;
    border-right-color: rgba(255,255,255,0.2);
    font-style: italic; letter-spacing: 0.02em;
}
.nb-cine-milestone-card {
    background: #0c0c10; border: 1px solid rgba(255,255,255,0.15);
    border-left: 2px solid rgba(255,255,255,0.3);
    border-radius: 3px; padding: 4px 7px;
    min-width: 5em; max-width: 8em;
    cursor: grab; user-select: none;
    font-size: 0.75em; color: #ccc;
    display: flex; flex-direction: column;
    position: relative;
}
.nb-cine-milestone-card:active { cursor: grabbing; }
.nb-cine-milestone-title { font-weight: 600; line-height: 1.3; }
.nb-cine-milestone-card .nb-cine-demote-btn { opacity: 0; }
.nb-cine-milestone-card:hover .nb-cine-demote-btn { opacity: 0.55; }

/* ── Shot card ───────────────────────────────────────────────────────────── */
.nb-cine-shot-card { max-width: 680px; }


.nb-cine-sc-sub  {
    font-size: 0.78em; opacity: 0.5; letter-spacing: 0.04em;
    padding: 5px 12px 0;
}
.nb-cine-sc-name { padding: 8px 12px 0; font-style: italic; opacity: 0.8; }
.nb-cine-sc-desc {
    padding: 10px 12px 0; line-height: 1.55;
    white-space: pre-line; color: var(--text, #eee);
}
.nb-cine-sc-cast { display: flex; flex-wrap: wrap; gap: 5px; padding: 10px 12px 0; }
.nb-cine-cast-chip {
    background: var(--bg2, #2a2d35); padding: 2px 10px;
    border-radius: 12px; font-size: 0.85em; font-weight: bold;
}
.nb-cine-cast-extras { font-weight: normal; font-style: italic; opacity: 0.6; }
.nb-cine-card-sec { margin: 12px 12px 0; }
.nb-cine-card-sec-lbl {
    font-size: 0.7em; text-transform: uppercase; letter-spacing: 0.12em;
    opacity: 0.4; margin-bottom: 3px; padding-left: 2px;
}
.nb-cine-card-sep { border: none; border-top: 1px solid var(--border, #444); margin: 16px 12px 0; }
.nb-cine-shot-card .nb-wp-body { padding: 12px 12px 20px; }
/* nb-cine-card-fm is the togglable field block. Zero horizontal padding so child */
/* elements keep their own 12px side padding without doubling up from .nb-card.   */
.nb-cine-card-fm  { padding-left: 0; padding-right: 0; padding-top: 4px; padding-bottom: 8px; }

/* ── Slate overlay ───────────────────────────────────────────────────────────── */
.nb-slate-overlay {
    position: fixed; inset: 0; z-index: 9999;
    background: #fff;
    display: flex; flex-direction: column;
    font-family: 'Courier New', Courier, monospace;
    color: #111;
    user-select: none; -webkit-user-select: none;
    touch-action: manipulation;
    overflow: hidden;
}
.nb-slate-bar {
    flex: 0 0 15vh; min-height: 55px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; position: relative; overflow: hidden;
    border-top: 3px solid #111; border-bottom: 3px solid #111;
    -webkit-tap-highlight-color: transparent;
}
/* Default (standby): green = system standing by */
.nb-slate-bar-top    { background: #1e5c1e; cursor: default; }
.nb-slate-bar-bottom { background: #1e5c1e; cursor: default; }
.nb-slate-bar:active { filter: brightness(1.15); }
@keyframes nb-slate-snap-top    { 0%{transform:translateY(0)} 35%{transform:translateY(350%)} 58%{transform:translateY(350%)} 100%{transform:translateY(0)} }
@keyframes nb-slate-snap-bottom { 0%{transform:translateY(0)} 35%{transform:translateY(-350%)} 58%{transform:translateY(-350%)} 100%{transform:translateY(0)} }
@keyframes nb-slate-flash-anim  { 0%{opacity:0} 25%{opacity:0} 32%{opacity:0.92} 58%{opacity:0.92} 82%{opacity:0} 100%{opacity:0} }
.nb-slate-bar-top.nb-slate-snapping    { animation: nb-slate-snap-top    0.30s cubic-bezier(.17,.67,.35,1.15) forwards; }
.nb-slate-bar-bottom.nb-slate-snapping { animation: nb-slate-snap-bottom  0.30s cubic-bezier(.17,.67,.35,1.15) forwards; }
.nb-slate-flash {
    position: absolute; inset: 0; background: #fff;
    pointer-events: none; opacity: 0; z-index: 2;
}
.nb-slate-flash.nb-slate-flashing { animation: nb-slate-flash-anim 0.30s linear forwards; }

/* ── Slate body: 7 equal rows; bars each equal to 1 body-row ────────────────── */
/* flex ratio: bar(1) + body(7) + bar(1) = 9 units total                        */
.nb-slate-bar  { flex: 1 1 0; min-height: 0; }
.nb-slate-body {
    flex: 7 7 0; min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(7, 1fr);
    gap: 2px; padding: 2px; background: #111; overflow: hidden;
}
/* Cell: label bar on left edge, content fills the rest */
.nb-slate-cell {
    background: #f0f0ee; display: flex; flex-direction: row;
    overflow: hidden; min-height: 0; min-width: 0;
}
.nb-slate-cell-label {
    writing-mode: vertical-rl; transform: rotate(180deg);
    background: #111; color: #fff;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    display: flex; align-items: center; justify-content: center;
    width: 28px; flex-shrink: 0;
    cursor: pointer; user-select: none; -webkit-user-select: none;
    -webkit-tap-highlight-color: rgba(255,255,255,0.12);
    transition: background 0.1s;
}
.nb-slate-cell-label:active { background: #333; }
.nb-slate-cell-content {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    overflow: hidden; padding: 3px 6px; gap: 1px; min-width: 0;
}
.nb-slate-display,
.nb-slate-cell input {
    font-family: inherit;
    font-weight: 700; color: #111; text-align: center;
    background: transparent; border: none; outline: none;
    width: 100%; padding: 0; line-height: 1; min-width: 0;
}
.nb-slate-display { display: flex; align-items: center; justify-content: center; width: 100%; overflow: hidden; }
.nb-slate-cell input[type="number"]::-webkit-inner-spin-button,
.nb-slate-cell input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
.nb-slate-cell input[type="number"] { -moz-appearance: textfield; }
.nb-slate-cell input:focus { background: rgba(0,0,0,0.04); border-radius: 2px; }
/* Explicit grid placement — 7-row body, 3-col body
   Row 1    : PRODUCTION+DAY badge(1-2) | DATE(3)
   Rows 2-3 : SCENE(1)  SHOT(2)  TAKE(3)   — each span 2 rows
   Rows 4-5 : CTRL(1)   CAM(2)   ROLL(3)   — each span 2 rows
   Row 6    : DIRECTOR(1-2)     | SOUND(3)  — SOUND spans rows 6-7
   Row 7    : DOP(1-2)          | SOUND cont.                       */
.nb-sc-prod  { grid-row: 1;     grid-column: 1 / 3; }
.nb-sc-date  { grid-row: 1;     grid-column: 3; }
.nb-sc-scene { grid-row: 2 / 4; grid-column: 1; }
.nb-sc-shot  { grid-row: 2 / 4; grid-column: 2; }
.nb-sc-take  { grid-row: 2 / 4; grid-column: 3; }
.nb-sc-ctrl  { grid-row: 4 / 6; grid-column: 1; background: #e0e0e0; }
.nb-sc-cam   { grid-row: 4 / 6; grid-column: 2; }
.nb-sc-roll  { grid-row: 4 / 6; grid-column: 3; }
.nb-sc-dir   { grid-row: 6;     grid-column: 1 / 3; }
.nb-sc-mos   { grid-row: 6 / 8; grid-column: 3; }
.nb-sc-dop   { grid-row: 7;     grid-column: 1 / 3; }
/* DATE cell: tabular digits for stable live clock */
.nb-slate-datetime {
    font-weight: 700; color: #111; text-align: center; line-height: 1.1;
    font-variant-numeric: tabular-nums; white-space: nowrap;
}
/* PRODUCTION row: name left-fills, then DAY label bar + number box on right */
.nb-sc-prod .nb-slate-cell-content { flex-direction: row; align-items: stretch; gap: 0; padding: 0; }
.nb-sc-prod-name { flex: 1 1 0; display: flex; align-items: center; overflow: hidden; min-width: 0; padding: 2px 6px; }
/* DAY: vertical label bar acts as separator, then a number box */
.nb-slate-day-sep {
    writing-mode: vertical-rl; transform: rotate(180deg);
    background: #111; color: #fff;
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
    display: flex; align-items: center; justify-content: center;
    width: 28px; flex-shrink: 0;
}
.nb-slate-day-num {
    flex: 0 0 52px; display: flex; align-items: center; justify-content: center;
    font-size: clamp(16px, 3.5vw, 28px); font-weight: 700; color: #111; text-align: center;
}
/* Crew/text cells: left-aligned; font-size set by _fitText at runtime */
.nb-sc-prod .nb-slate-display,
.nb-sc-dir  .nb-slate-display,
.nb-sc-dop  .nb-slate-display {
    text-align: left; justify-content: flex-start;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
/* Strip nearly all vertical padding from single-row crew cells */
.nb-sc-dir .nb-slate-cell-content,
.nb-sc-dop .nb-slate-cell-content { padding: 0 6px; }
/* Take cell: tighter padding so _fitText gets more height to work with */
.nb-sc-take .nb-slate-cell-content { padding: 1px 4px; }
/* Scene/Shot: 3-zone vertical split — big number top 2/3, title bottom 1/3 */
.nb-sc-scene .nb-slate-cell-content,
.nb-sc-shot  .nb-slate-cell-content { flex-direction: column; padding: 1px 4px; gap: 0; }
.nb-slate-cell-number {
    flex: 2 1 0; display: flex; align-items: center; justify-content: center;
    overflow: hidden; min-height: 0; width: 100%;
}
.nb-slate-cell-subtitle {
    flex: 1 0 0; display: flex; align-items: flex-end; justify-content: center;
    font-size: clamp(12px, 2.5vw, 18px); font-weight: 600; color: #555;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    text-align: center; min-height: 0; padding-bottom: 3px; width: 100%;
    max-width: 100%; line-height: 1.1;
}
/* Nudge buttons (< >) — wider targets, bolder, more contrast */
.nb-slate-cell-nudge {
    display: flex; align-items: center; justify-content: center;
    width: 36px; flex-shrink: 0; background: transparent; border: none;
    font-family: inherit; font-size: 24px; font-weight: 700;
    color: rgba(0,0,0,0.35); cursor: pointer;
    user-select: none; -webkit-tap-highlight-color: transparent;
    transition: color 0.08s, background 0.08s;
}
.nb-slate-cell-nudge:hover  { color: rgba(0,0,0,0.6); }
.nb-slate-cell-nudge:active { color: #111; background: rgba(0,0,0,0.12); }
/* CTRL context panel: 2×4 button grid */
.nb-sc-ctrl .nb-slate-cell-content { padding: 4px; }
.nb-slate-ctrl-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr);
    gap: 3px; width: 100%; height: 100%;
}
.nb-slate-ctrl-btn {
    display: flex; align-items: center; justify-content: center; text-align: center;
    background: #f0f0f0; border: 1px solid #c8c8c8; border-radius: 3px;
    font-family: inherit; font-size: clamp(7px, 1.1vw, 10px); font-weight: 700;
    color: #333; letter-spacing: 0.04em; text-transform: uppercase;
    cursor: pointer; user-select: none; padding: 2px 1px; line-height: 1.2;
    -webkit-tap-highlight-color: transparent; transition: background 0.08s;
}
.nb-slate-ctrl-btn:active { background: #d0d0d0; border-color: #aaa; }
.nb-slate-ctrl-btn[data-info] {
    background: transparent; border-color: rgba(0,0,0,0.1);
    cursor: default; color: #777; font-size: clamp(6px, 0.9vw, 9px);
}
.nb-slate-ctrl-btn[data-empty] {
    background: transparent; border: 1px dashed rgba(0,0,0,0.1);
    pointer-events: none;
}
.nb-slate-ctrl-rec  { background: #a93226 !important; color: #fff !important; border-color: #8a1f14 !important; cursor: default !important; }
.nb-slate-ctrl-exit { background: #ddd !important; }
/* MOS: whole cell goes red when active */
.nb-sc-mos.nb-slate-mos-active { background: #a93226; }
.nb-sc-mos.nb-slate-mos-active .nb-slate-cell-label { background: rgba(0,0,0,0.25); }
.nb-sc-mos.nb-slate-mos-active .nb-slate-mos-btn { background: transparent; color: #fff; border-color: rgba(255,255,255,0.4); }
/* MOS button */
.nb-slate-mos-btn {
    font-family: inherit; font-size: clamp(0.75rem,2.5vw,1.05rem); font-weight: 700;
    letter-spacing: 0.1em; background: #e4e4e2; color: #666;
    border: 2px solid #bbb; border-radius: 5px; padding: 5px 14px; cursor: pointer;
    transition: all 0.1s; -webkit-tap-highlight-color: transparent;
}
/* Exit button */
.nb-slate-exit {
    font-size: 0.58rem; font-family: inherit; letter-spacing: 0.1em; text-transform: uppercase;
    background: transparent; color: #bbb; border: 1px solid #ddd; border-radius: 99px;
    padding: 2px 9px; cursor: pointer; margin-top: 3px; -webkit-tap-highlight-color: transparent;
}
.nb-slate-exit:hover { color: #555; border-color: #999; }
/* GO state — traditional B&W clapperboard, no labels, snap snap snap */
.nb-slate-overlay.nb-slate-go .nb-slate-bar-top {
    background: repeating-linear-gradient(-45deg, #000 0px, #000 54px, #fff 54px, #fff 108px);
    cursor: pointer;
}
.nb-slate-overlay.nb-slate-go .nb-slate-bar-bottom {
    background: repeating-linear-gradient(45deg, #000 0px, #000 54px, #fff 54px, #fff 108px);
    cursor: default;
}
/* Keep go-label elements hidden — no text on bars in go state */
.nb-slate-go-label { display: none; }
/* Rolling state — top bar: black timer strip; overlays cover rows 1-3 and 6-7+bottom */
.nb-slate-overlay.nb-slate-rolling .nb-slate-bar-top    { background: #111; cursor: default; }
.nb-slate-overlay.nb-slate-rolling .nb-slate-bar-bottom { background: #a93226; cursor: default; }
.nb-slate-overlay.nb-slate-rolling .nb-sc-mos           { opacity: 0.4; pointer-events: none; }
/* Duration timer in top bar (action → cut elapsed) */
.nb-slate-duration {
    display: none; position: absolute; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: inherit; font-weight: 700; font-size: clamp(1rem, 3.5vw, 1.8rem);
    color: #666; letter-spacing: 0.12em; font-variant-numeric: tabular-nums;
    pointer-events: none;
}
.nb-slate-overlay.nb-slate-rolling .nb-slate-duration { display: block; }
/* ROLLING! banner — covers body rows 1-3 (top: 1/9, height: 3/9 of overlay) */
@keyframes nb-slate-rolling-pulse {
    0%, 72%  { background: #a93226; }
    80%      { background: #8a1a10; }
    90%      { background: #c42a1a; }
    100%     { background: #a93226; }
}
.nb-slate-rolling-sign {
    display: none; position: absolute; left: 0; right: 0;
    top: calc(100% / 9); height: calc(100% / 3);
    align-items: center; justify-content: center;
    z-index: 6; pointer-events: none;
    animation: nb-slate-rolling-pulse 2.5s ease-in-out infinite;
}
.nb-slate-rolling-sign span {
    font-family: inherit; font-weight: 700; color: #fff;
    font-size: clamp(2.5rem, 11vw, 7rem); letter-spacing: 0.18em;
    text-shadow: 0 2px 24px rgba(0,0,0,0.4);
}
.nb-slate-overlay.nb-slate-rolling .nb-slate-rolling-sign { display: flex; }
/* QUIET PLEASE banner — covers body rows 6-7 + bottom bar (top: 6/9, height: 3/9) */
.nb-slate-quiet-sign {
    display: none; position: absolute; left: 0; right: 0;
    top: calc(100% * 2 / 3); height: calc(100% / 3);
    align-items: center; justify-content: center;
    background: #a93226; z-index: 6; pointer-events: none;
}
.nb-slate-quiet-sign span {
    font-family: inherit; font-weight: 700; color: #fff;
    font-size: clamp(1.5rem, 6vw, 4rem); letter-spacing: 0.22em;
    text-shadow: 0 2px 16px rgba(0,0,0,0.3);
}
.nb-slate-overlay.nb-slate-rolling .nb-slate-quiet-sign { display: flex; }
/* Keep rolling-label elements (no longer used for display, but don't break anything) */
.nb-slate-rolling-label { display: none; }
/* Ctrl button roles — colours communicate production state */
.nb-slate-ctrl-roll   { background: #1e5c1e !important; color: #fff !important; border-color: #0f3a0f !important; }
.nb-slate-ctrl-action { background: #2a7a2a !important; color: #fff !important; border-color: #1a5a1a !important; }
.nb-slate-ctrl-cut    { background: #a93226 !important; color: #fff !important; border-color: #7a1e14 !important; letter-spacing: 0.12em !important; }
.nb-slate-ctrl-good   { background: #2a7a2a !important; color: #fff !important; border-color: #1a5a1a !important; }
.nb-slate-ctrl-ng     { background: #a93226 !important; color: #fff !important; border-color: #7a1e14 !important; }
.nb-slate-ctrl-active { filter: brightness(1.3) !important; outline: 2px solid rgba(255,255,255,0.5) !important; }
/* Shot/scene specialty header — color-coded border by INT/EXT · DAY/NIGHT.
   Shared between .nb-cine-shot-hdr and .nb-cine-scene-hdr so both read as
   one system. */
.nb-cine-shot-hdr[data-dnie="ID"], .nb-cine-scene-hdr[data-dnie="ID"] { border-left-color: #a8a890; }
.nb-cine-shot-hdr[data-dnie="ED"], .nb-cine-scene-hdr[data-dnie="ED"] { border-left-color: #c8a800; }
.nb-cine-shot-hdr[data-dnie="IN"], .nb-cine-scene-hdr[data-dnie="IN"] { border-left-color: #6a8bba; }
.nb-cine-shot-hdr[data-dnie="EN"], .nb-cine-scene-hdr[data-dnie="EN"] { border-left-color: #5ba35b; }
/* Fixed dark text -- all four dnie backgrounds above are light pastels
   regardless of app theme, so var(--text-muted) (near-invisible on light
   bg in dark mode) is wrong here. Pre-existing bug on the shot header;
   fixed for both shot and scene at once since they share this class. */
.nb-cine-shot-pill-dnie { font-weight: 700; font-size: 0.78em; letter-spacing: 0.04em; color: #2a2a2a; }
.nb-cine-takes-pill { cursor: pointer; border: 1px solid var(--border); background: var(--bg3, var(--bg2)); color: var(--text-muted); padding: 1px 7px; border-radius: 10px; font-size: 0.9em; }
.nb-cine-takes-pill:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
/* .nb-cine-plotline-swatch.nb-specialty-nav-btn (combined selector, not just
   the bare class) so this wins over core's .nb-specialty-nav-btn button-reset
   regardless of stylesheet load order -- the swatch keeps its round color-dot
   look while doubling as the nav trigger, not a second icon next to it. */
.nb-cine-plotline-swatch.nb-specialty-nav-btn {
    display: inline-block; width: 12px; height: 12px; border-radius: 50%; flex: none;
    background: var(--text-muted); border: 1px solid rgba(0,0,0,0.25);
    padding: 0; cursor: pointer;
}
.nb-cine-title-nav { cursor: pointer; }
.nb-cine-title-nav:hover { text-decoration: underline; }
/* Big + stub -- story/plotline headers only, deliberately larger and plainer
   than the small icon actions around it since it's a placeholder for a real
   action not built yet, not a finished feature trying to blend in. */
.nb-cine-big-plus-btn {
    width: 26px; height: 26px; border-radius: 50%;
    border: 1px solid var(--border); background: var(--bg2);
    color: var(--text-muted); font-size: 18px; line-height: 1; font-weight: 600;
    cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
}
.nb-cine-big-plus-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

/* Unified storyline header — view switcher + zoom */
.nb-cine-storyline-hdr { flex-wrap: wrap; }
/* Story/Script/Note embed this header inside .nb-cine-block (the codeblock host
   div), which sets font-family:monospace + font-size:0.85em for the stripboard/
   shot-sheet's own tabular views -- that ambient styling was leaking into the
   storyline header's title text too, making it look different from the plain
   story/plotline/milestone note headers (never nested inside .nb-cine-block, so
   never affected). calc(1em / 0.85) exactly cancels the inherited scale rather
   than hardcoding a size. Board's own header already escapes .nb-cine-block
   (its overlay is appended straight to document.body), so this rule is a no-op
   there -- fixing Story/Script/Note only, which is where it was needed. */
.nb-cine-block .nb-cine-storyline-hdr {
    font-family: var(--font-ui);
    font-size: calc(1em / 0.85);
}
.nb-cine-sl-viewgroup { display: flex; gap: 2px; background: var(--bg, #16191e); border-radius: 6px; padding: 2px; }
.nb-cine-sl-view-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 26px; border: none; border-radius: 4px;
    background: transparent; color: var(--text-muted); cursor: pointer;
}
.nb-cine-sl-view-btn svg { width: 17px; height: 17px; }
.nb-cine-sl-view-btn:hover { background: var(--bg3, var(--bg2)); color: var(--text); }
.nb-cine-sl-view-btn.nb-active { background: var(--accent); color: #fff; }
.nb-cine-sl-zoom-btn .ring-outer, .nb-cine-sl-zoom-btn .ring-mid { fill: none; transition: fill .12s, opacity .12s; }
.nb-cine-sl-zoom-btn[data-level="1"] .ring-mid { fill: currentColor; opacity: 1; stroke: none; }
.nb-cine-sl-zoom-btn[data-level="2"] .ring-mid { fill: currentColor; opacity: 1; stroke: none; }
.nb-cine-sl-zoom-btn[data-level="2"] .ring-outer { fill: currentColor; opacity: 1; stroke: none; }
.nb-cine-sl-zoom-btn svg { width: 16px; height: 16px; }
/* Visually set apart from the 3 view-select icons -- a different kind of
   control riding in the same cluster, not a 4th view. */
.nb-cine-sl-zoom-btn { margin-left: 5px; padding-left: 7px; border-left: 1px solid var(--border); }
.nb-cine-orders-sel { font-size: 0.85em; background: var(--bg); color: var(--text-muted); border: 1px solid var(--border); border-radius: 4px; padding: 2px 4px; }
/* The native multi-renderer tab switcher (#nb-preview-renderers) is generic --
   also used by type:script, type:scene, etc. -- so it can't be hidden globally,
   only when a storyline view is what's actually showing (the custom header
   already owns view-switching there, making the native tabs redundant). A
   :has() selector keeps this self-correcting: it stops matching the instant a
   different note type renders, no JS state to remember to reset. */
#nb-preview-pane:has(#nb-preview-content .nb-cine-storyline-hdr) #nb-preview-renderers { display: none; }
/* Ctrl panel mode — flex column replaces the button grid */
.nb-slate-ctrl-grid.nb-slate-ctrl-panel-mode { display: flex; flex-direction: column; gap: 0; }
.nb-slate-panel-hdr {
    display: flex; align-items: center; gap: 3px;
    padding: 2px 3px; flex-shrink: 0;
    border-bottom: 1px solid rgba(0,0,0,0.15);
}
.nb-slate-panel-title {
    flex: 1; text-align: center;
    font-size: 9px; font-weight: 700; letter-spacing: 0.12em; color: #555; text-transform: uppercase;
}
.nb-slate-panel-back { flex: 0 0 auto; padding: 0 4px; font-size: 13px; min-width: 1.8em; line-height: 1; }
.nb-slate-panel-body { flex: 1; overflow-y: auto; overflow-x: hidden; font-size: 10px; color: #333; min-height: 0; }
.nb-slate-panel-item {
    padding: 2px 5px; border-bottom: 1px solid rgba(0,0,0,0.08);
    display: flex; align-items: baseline; gap: 4px; min-height: 1.8em;
    cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.nb-slate-panel-item:active { background: rgba(0,0,0,0.1); }
.nb-slate-panel-code { font-weight: 700; min-width: 3ch; flex-shrink: 0; white-space: nowrap; }
.nb-slate-panel-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* Dark mode (toggled by ☾ button) */
.nb-slate-overlay.nb-slate-dark { background: #111; color: #eee; }
.nb-slate-overlay.nb-slate-dark .nb-slate-cell { background: #1e1e1c; }
.nb-slate-overlay.nb-slate-dark .nb-slate-display,
.nb-slate-overlay.nb-slate-dark .nb-slate-cell input { color: #eee; }
.nb-slate-overlay.nb-slate-dark .nb-sc-ctrl { background: #2a2a28; }
.nb-slate-overlay.nb-slate-dark .nb-slate-cell-label { background: #333; }
.nb-slate-overlay.nb-slate-dark .nb-slate-day-sep { background: #333; }
.nb-slate-overlay.nb-slate-dark .nb-slate-body { background: #333; }
.nb-slate-overlay.nb-slate-dark .nb-slate-ctrl-btn { background: #2e2e2c; border-color: #555; color: #ddd; }
.nb-slate-overlay.nb-slate-dark .nb-slate-ctrl-btn:active { background: #444; }
.nb-slate-overlay.nb-slate-dark .nb-slate-ctrl-btn[data-empty] { border-color: rgba(255,255,255,0.08); background: transparent; }
.nb-slate-overlay.nb-slate-dark .nb-slate-panel-title { color: #aaa; }
.nb-slate-overlay.nb-slate-dark .nb-slate-panel-body { color: #ccc; }
.nb-slate-overlay.nb-slate-dark .nb-slate-panel-hdr { border-color: rgba(255,255,255,0.1); }
.nb-slate-overlay.nb-slate-dark .nb-slate-panel-item { border-color: rgba(255,255,255,0.06); }
.nb-slate-overlay.nb-slate-dark .nb-slate-panel-item:active { background: rgba(255,255,255,0.1); }

/* org chart (pipeline) — SVG org chart, same technique as core cfg:org */
.nb-cine-org-svg  { display: block; }
.nb-cine-org-edge { stroke: var(--border, #444); stroke-width: 1.5; }
.nb-cine-org-rect { fill: var(--bg2, #1e2228); stroke: var(--border, #444); stroke-width: 1.5; transition: filter 0.1s; }
.nb-cine-org-node[style*="pointer"]:hover .nb-cine-org-rect { filter: brightness(1.18); }
.nb-cine-org-node.nb-cine-org-inert .nb-cine-org-rect { stroke-dasharray: 4 3; }
.nb-cine-org-label { font-size: 11px; fill: var(--text, #eee); font-family: var(--font-sans, system-ui); dominant-baseline: auto; }
.nb-cine-org-node.nb-cine-org-inert .nb-cine-org-label { fill: var(--text-muted, #aaa); }
.nb-cine-org-node.nb-cine-org-milestone .nb-cine-org-rect { stroke: var(--text-muted, #aaa); }
.nb-cine-org-tagstripe { stroke: none; pointer-events: none; }
.nb-cine-org-query-glyph circle { stroke: var(--bg2, #1e2228); stroke-width: 1.5; }
.nb-cine-org-query-glyph text { font-size: 9px; font-weight: 700; text-anchor: middle; pointer-events: none; }
.nb-cine-org-query-pass circle { fill: #2e7d32; }
.nb-cine-org-query-pass text   { fill: #eafbea; }
.nb-cine-org-query-fail circle { fill: #b45309; }
.nb-cine-org-query-fail text   { fill: #fff6e6; }
.nb-cine-org-legend {
    position: absolute; left: 6px; bottom: 6px; z-index: 1;
    background: var(--bg2, #1e2228); border: 1px solid var(--border, #444);
    border-radius: 4px; padding: 4px 7px; font-size: 10px; line-height: 1.6;
    max-width: 160px; pointer-events: none;
}
.nb-cine-org-legend-row { display: flex; align-items: center; gap: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nb-cine-org-legend-swatch { display: inline-block; width: 8px; height: 8px; border-radius: 2px; flex: none; }
`;

    if (!document.getElementById('nb-cine-styles')) {
        const s = document.createElement('style');
        s.id = 'nb-cine-styles';
        s.textContent = _CSS;
        document.head.appendChild(s);
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    const _esc = s => String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    function _descFirst(desc) {
        return (desc || '').split('\n').find(l => l.trim()) || '';
    }

    // ── Query parser ──────────────────────────────────────────────────────────
    // "shots | day: 1"            → { field:'shots', format:'',      filter:{day:1}, codes:[] }
    // "shots.sheet | day: 1"      → { field:'shots', format:'sheet', filter:{day:1}, codes:[] }
    // "actor.phone: JD, AM, CC"   → { field:'actor', format:'phone', filter:{},      codes:['JD','AM','CC'] }

    function _parseQuery(text) {
        const pipeIdx = text.indexOf('|');
        let lhs, rhs = '';
        if (pipeIdx >= 0) {
            lhs = text.slice(0, pipeIdx).trim();
            rhs = text.slice(pipeIdx + 1).trim();
        } else {
            lhs = text.trim();
        }

        // "field.format: code, code" — colon on lhs means code list
        const colonIdx = lhs.indexOf(':');
        let fieldPart, codes = [], arg = '';
        if (colonIdx >= 0) {
            fieldPart = lhs.slice(0, colonIdx).trim();
            codes = lhs.slice(colonIdx + 1).split(',').map(s => s.trim()).filter(Boolean);
        } else {
            // No colon: first whitespace token is the field, anything after is a
            // single positional arg -- e.g. "org cine" -> field "org", arg "cine".
            // Previously the trailing token was silently dropped here.
            const parts = lhs.split(/\s+/).filter(Boolean);
            fieldPart = parts[0] || '';
            arg = parts.slice(1).join(' ');
        }

        const dotIdx = fieldPart.indexOf('.');
        const field  = dotIdx >= 0 ? fieldPart.slice(0, dotIdx) : fieldPart;
        const format = dotIdx >= 0 ? fieldPart.slice(dotIdx + 1) : '';

        // Pipe-side filter: "day: 1, actor: JD", "day: """ → null (unscheduled)
        const filter = {};
        for (const part of rhs.split(',')) {
            const ci = part.indexOf(':');
            if (ci < 1) continue;
            const k = part.slice(0, ci).trim();
            const v = part.slice(ci + 1).trim();
            if (!k) continue;
            if (v === '""' || v === "''") { filter[k] = null; continue; }
            if (v !== '') { const n = Number(v); filter[k] = isNaN(n) ? v : n; }
        }

        return { field, format, filter, codes, arg };
    }

    // ── Tag-color helpers ─────────────────────────────────────────────────────
    // tag_color frontmatter: "tagname:#color" (single string) or YAML list of same.
    // Notebook-level: config.tag_colors = { tagname: "#color" }.
    // Per-note wins over notebook on conflict.

    function _parseTagColor(raw) {
        if (!raw) return {};
        const entries = Array.isArray(raw) ? raw : [String(raw)];
        const result = {};
        for (const e of entries) {
            const idx = e.indexOf(':');
            if (idx > 0) result[e.slice(0, idx).trim()] = e.slice(idx + 1).trim();
        }
        return result;
    }

    function _extractTags(fmTags, bodyPreview) {
        const set = new Set();
        if (fmTags) {
            const arr = Array.isArray(fmTags) ? fmTags : String(fmTags).split(/[\s,]+/);
            arr.forEach(t => { const s = t.trim().replace(/^#/, ''); if (s) set.add(s); });
        }
        if (bodyPreview) {
            (bodyPreview.match(/#([\w/-]+)/g) || []).forEach(m => set.add(m.slice(1)));
        }
        return [...set];
    }

    function _resolveTagColor(item, config) {
        const merged = { ...(config?.tag_colors || {}), ..._parseTagColor(item.meta?.tag_color) };
        if (!Object.keys(merged).length) return null;
        const tags = _extractTags(item.meta?.tags, item.body_preview);
        return NbMain.matchTagColor(merged, tags);
    }

    // All matching tag colors, not just the first -- for the cine org chart's
    // left-edge stripe, where a note with N tagged colors shows N thin stripes
    // packed together rather than picking one winner. `tagColorMap` here is the
    // real notebook-level {tagname: color} dict (top-level `tag_color:` in
    // .<notebook>.md) -- deliberately NOT the `config.tag_colors` lookup
    // `_resolveTagColor` above uses, since that reads from the `cine:`-scoped
    // config block where no notebook actually puts this map; the real one lives
    // one level up, outside `cine:` entirely. The merge (notebook map + this
    // note's own override) stays cine-specific plumbing; the actual
    // tag-to-color matching delegates to nb-web core's own
    // `matchTagColors` (main.js) -- the same array-returning sibling of the
    // core `matchTagColor` the general note list already uses, extracted so
    // this isn't a duplicate, cine-only implementation of the same mechanism.
    function _resolveTagColors(item, tagColorMap) {
        const merged = { ...(tagColorMap || {}), ..._parseTagColor(item.meta?.tag_color) };
        if (!Object.keys(merged).length) return [];
        const tags   = _extractTags(item.meta?.tags, item.body_preview);
        const colors = NbMain.matchTagColors(merged, tags);
        // matchTagColors' own contract is deliberately just colors (generic,
        // shared with the core note list) -- re-deriving which tag produced
        // each one here, a small re-lookup, is what lets the org chart's
        // tag_color_legend show "tagname -> swatch" without widening that
        // shared function's return shape for one caller's need.
        return colors.map(color => ({ tag: tags.find(t => merged[t] === color), color }));
    }

    // ── Data cache ────────────────────────────────────────────────────────────

    const _cache = new Map();
    const _TTL   = 30000;

    // Set to the currently-open board overlay's own _close (removes the
    // overlay + its keydown listener) while one is open, null otherwise --
    // lets code outside _openStorylineOverlay (the title-nav click handler
    // below) close it before navigating away, instead of leaving it sitting
    // on top of whatever the navigation just switched to underneath.
    let _slOverlayClose = null;

    async function _fetchData(notebook, project = '') {
        const key = project ? `${notebook}:${project}` : notebook;
        const hit = _cache.get(key);
        if (hit && Date.now() - hit.ts < _TTL) return hit;
        let url = `/api/cine/data?notebook=${encodeURIComponent(notebook)}`;
        if (project) url += `&project=${encodeURIComponent(project)}`;
        const d   = await fetch(url).then(r => r.json());
        const entry = { ...d, ts: Date.now() };
        _cache.set(key, entry);
        return entry;
    }

    function _bust(notebook, project = '') {
        const key = project ? `${notebook}:${project}` : notebook;
        _cache.delete(key);
    }

    // ── Shot filter helper ────────────────────────────────────────────────────
    // Applies all filter fields with consistent null-sentinel handling.
    // filter.day = null → unscheduled; filter.scene = null → no scene assigned;
    // filter.actor = null → shots with no actors.

    const _SHOT_FILTER_KEYS = new Set(['day', 'scene', 'actor', 'shot', 'loc']);

    function _filterShots(shots, filter) {
        // Unknown filter key → return empty rather than silently showing all shots
        for (const k of Object.keys(filter)) {
            if (!_SHOT_FILTER_KEYS.has(k)) return [];
        }
        let f = shots;
        if (filter.day !== undefined)
            f = filter.day === null
                ? f.filter(s => s.day == null || s.day === '')
                : f.filter(s => s.day === filter.day);
        if (filter.scene !== undefined)
            f = filter.scene === null
                ? f.filter(s => s.scene == null || String(s.scene) === '')
                : f.filter(s => String(s.scene) === String(filter.scene));
        if (filter.actor !== undefined)
            f = filter.actor === null
                ? f.filter(s => !s.actors?.length)
                : f.filter(s => s.actors.includes(filter.actor));
        if (filter.shot !== undefined)
            f = filter.shot === null
                ? f.filter(s => !s.shot && !s.alias)
                : f.filter(s => String(s.shot) === String(filter.shot) ||
                                String(s.alias) === String(filter.shot));
        if (filter.loc !== undefined)
            f = filter.loc === null
                ? f.filter(s => !s.loc)
                : f.filter(s => String(s.loc) === String(filter.loc));
        return f;
    }

    // ── Strip builder ─────────────────────────────────────────────────────────

    function _colorClass(shot) {
        if (shot.type === 'lunch') return 'lunch';
        if (shot.type === 'move')  return 'move';
        const ie = (shot.int_ext  || '').charAt(0).toUpperCase();
        const dn = (shot.day_night|| '').charAt(0).toUpperCase();
        return (ie && dn) ? ie + dn : 'scene';
    }

    function _linkBtn(text, selector, extraClass = '') {
        return `<button class="nb-cine-link${extraClass ? ' '+extraClass : ''}" `
             + `data-selector="${_esc(selector)}">${_esc(text)}</button>`;
    }

    function _buildStrip(shot, characters, cast, locations, notebook) {
        const div = document.createElement('div');
        div.className = `nb-cine-strip nb-cine-strip-${_colorClass(shot)}`;
        div.dataset.selector = shot.selector;
        if (shot.locked) {
            div.dataset.locked = 'true';
            div.title = '🔒 Locked';
            div.style.cursor = 'not-allowed';
        }

        // Special strips (lunch, move) — label spans desc column
        if (shot.type === 'lunch' || shot.type === 'move') {
            div.innerHTML =
                `<span class="nb-cine-dnie"></span>` +
                `<span class="nb-cine-id"></span><span class="nb-cine-loc"></span>` +
                `<span class="nb-cine-desc" style="grid-column:4/-1">${_esc(_descFirst(shot.desc))}</span>`;
            return div;
        }

        // Loc — tooltip shows full location name
        const locEntry   = locations[shot.loc];
        const locSel     = locEntry?.selector;
        const locTitle   = locEntry?.meta?.title || shot.loc;
        const locHtml    = locSel
            ? `<button class="nb-cine-link nb-cine-loc" data-selector="${_esc(locSel)}" title="${_esc(locTitle)}">${_esc(shot.loc)}</button>`
            : `<span class="nb-cine-loc" title="${_esc(locTitle)}">${_esc(shot.loc)}</span>`;

        // Combined scene-alias ID "1.1a" → links to shot note; tooltip shows title
        const shortId  = shot.alias || shot.shot || shot.filename;
        const shotId   = shot.scene && shortId ? `${shot.scene}.${shortId}` : shortId;
        const idHtml   = `<button class="nb-cine-link nb-cine-id" data-selector="${_esc(shot.selector)}" title="${_esc(shot.title || shotId)}">${_esc(shotId)}</button>`;

        // CHARACTER codes → resolve via characters/ → cast/ for display alias + tooltip
        const actorsHtml = (shot.actors || []).map(code => {
            const charEntry  = characters[code];
            const actorStem  = charEntry?.meta?.alias;
            const actorEntry = cast[actorStem];
            const display    = actorEntry?.meta?.alias || actorStem || code;
            const actorName  = actorEntry?.meta?.title || actorStem || code;
            const charTitle  = charEntry?.meta?.title  || code;
            const tip        = actorEntry ? `${actorName} as ${charTitle}` : charTitle;
            const sel        = actorEntry?.selector || charEntry?.selector;
            return sel
                ? `<button class="nb-cine-link nb-cine-actor" data-selector="${_esc(sel)}" title="${_esc(tip)}">${_esc(display)}</button>`
                : `<span class="nb-cine-actor" title="${_esc(tip)}">${_esc(display)}</span>`;
        }).join('');

        // Resource count — handles block-scalar dict, YAML list, or legacy CSV array
        const _res = shot.resources;
        const resList = Array.isArray(_res)
            ? _res.filter(Boolean)
            : (_res && typeof _res === 'object')
                ? Object.entries(_res).map(([k, v]) => `${k}: ${v}`)
                : [];
        const resCount = resList.length;
        const resTip   = resList.join('\n');

        // Desc — tooltip shows full description for when it's truncated
        const descFull = (shot.desc || '').trim();
        const descLine = _descFirst(descFull);

        const dn = (shot.day_night || '').charAt(0).toUpperCase();
        const ie = (shot.int_ext   || '').charAt(0).toUpperCase();
        div.innerHTML =
            `<span class="nb-cine-dnie" title="${_esc(shot.day_night)} / ${_esc(shot.int_ext)}">${dn}${ie}</span>` +
            idHtml +
            locHtml +
            `<span class="nb-cine-desc" title="${_esc(descFull)}">${_esc(descLine)}</span>` +
            `<span class="nb-cine-actors">${actorsHtml}</span>` +
            `<span class="nb-cine-rescount" title="${_esc(resTip)}">${resCount || ''}</span>`;

        return div;
    }

    // ── Scene index ───────────────────────────────────────────────────────────

    function _buildSceneIndex(el, data, filter) {
        const { scenes, locations, config } = data;

        let filtered = scenes;
        if (filter.loc) filtered = filtered.filter(s => s.loc === filter.loc);

        el.innerHTML = '';

        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        hdr.innerHTML = `<span class="nb-cine-title">🎬 ${_esc(config?.project || 'Scenes')}</span>`;
        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tw-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', () => { _bust(NbNav.notebook); _loadCineBlock(el); });
        hdr.appendChild(refBtn);
        el.appendChild(hdr);

        if (!filtered.length) {
            el.insertAdjacentHTML('beforeend', '<div class="nb-cine-empty">No scenes found</div>');
            return;
        }

        const table = document.createElement('div');
        table.className = 'nb-cine-scene-index';

        // Column header
        table.insertAdjacentHTML('beforeend',
            `<div class="nb-cine-scene-row nb-cine-colheader">` +
            `<span class="nb-cine-si-no">Sc</span>` +
            `<span class="nb-cine-si-ie">I/E</span>` +
            `<span class="nb-cine-si-dn">D/N</span>` +
            `<span class="nb-cine-si-loc">Loc</span>` +
            `<span class="nb-cine-si-syn">Synopsis</span>` +
            `</div>`
        );

        for (const sc of filtered) {
            const locSel  = locations[sc.loc]?.selector;
            const locHtml = locSel
                ? `<button class="nb-cine-link nb-cine-si-loc" data-selector="${_esc(locSel)}">${_esc(sc.loc)}</button>`
                : `<span class="nb-cine-si-loc">${_esc(sc.loc)}</span>`;

            const row = document.createElement('div');
            row.className = `nb-cine-scene-row nb-cine-strip-${sc.int_ext + sc.day_night}`;
            row.innerHTML =
                `<button class="nb-cine-link nb-cine-si-no" data-selector="${_esc(sc.selector)}">${_esc(sc.alias)}</button>` +
                `<span class="nb-cine-si-ie">${_esc(sc.int_ext)}</span>` +
                `<span class="nb-cine-si-dn">${_esc(sc.day_night)}</span>` +
                locHtml +
                `<span class="nb-cine-si-syn">${_esc(sc.synopsis)}</span>`;
            table.appendChild(row);
        }

        el.appendChild(table);

        el.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
    }

    // ── Script renderer — full Fountain pipeline ──────────────────────────────

    // Render Fountain inline markup + [[shot-id]] cues → HTML.
    function _renderInline(rawText) {
        return rawText.split(/(\[\[[^\]]+\]\])/).map((seg, idx) => {
            if (idx % 2 === 1) {
                const id = seg.slice(2, -2).trim();
                return `<sup class="nb-cine-shot-cue nb-wiki-link" data-selector="${_esc(id)}" data-autolabel title="${_esc(id)}">${_esc(id)}</sup>`;
            }
            let s = _esc(seg);
            s = s.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
            s = s.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
            s = s.replace(/\*(.+?)\*/g,        '<em>$1</em>');
            s = s.replace(/_(.+?)_/g,           '<u>$1</u>');
            s = s.replace(/\n/g,                '<br>');
            return s;
        }).join('');
    }

    // Tokenise a Fountain body. Returns [{type, text, depth?, dual?}, …].
    function _parseFountain(raw) {
        let text = raw || '';
        if (text.startsWith('---')) {
            const fmEnd = text.indexOf('\n---', 3);
            if (fmEnd !== -1) text = text.slice(fmEnd + 4).trimStart();
        }

        const lines  = text.split('\n');
        const tokens = [];
        let i         = 0;
        let prevBlank = true;

        function nx() { return i + 1 < lines.length ? lines[i + 1] : null; }

        while (i < lines.length) {
            const raw = lines[i];
            const t   = raw.trim();

            if (!t) { prevBlank = true; i++; continue; }

            if (/^={3,}\s*$/.test(t)) {
                tokens.push({ type: 'page_break' });
                prevBlank = false; i++; continue;
            }

            if (t.startsWith('/*')) {
                while (i < lines.length && !lines[i].includes('*/')) i++;
                i++; prevBlank = false; continue;
            }

            if (t.startsWith('[[') && t.endsWith(']]')) {
                tokens.push({ type: 'note', text: t.slice(2, -2) });
                prevBlank = false; i++; continue;
            }

            const secM = t.match(/^(#{1,3})\s+(.*)/);
            if (secM) {
                tokens.push({ type: 'section', depth: secM[1].length, text: secM[2] });
                prevBlank = false; i++; continue;
            }

            if (/^=\s/.test(t)) {
                tokens.push({ type: 'synopsis', text: t.slice(t.indexOf(' ') + 1) });
                prevBlank = false; i++; continue;
            }

            if (t.startsWith('.') && !t.startsWith('..')) {
                tokens.push({ type: 'scene_heading', text: t.slice(1).trim() });
                prevBlank = false; i++; continue;
            }

            if (/^(int\.?|ext\.?|est\.?|int\.?\/ext\.?|i\/e)[\s.\-]/i.test(t)) {
                tokens.push({ type: 'scene_heading', text: t.toUpperCase() });
                prevBlank = false; i++; continue;
            }

            if (t.startsWith('>') && t.endsWith('<')) {
                tokens.push({ type: 'centered', text: t.slice(1, -1).trim() });
                prevBlank = false; i++; continue;
            }

            if (raw.startsWith('>') && !t.endsWith('<')) {
                tokens.push({ type: 'transition', text: t.slice(1).trim() });
                prevBlank = false; i++; continue;
            }

            if (t.startsWith('~')) {
                tokens.push({ type: 'lyrics', text: t.slice(1).trim() });
                prevBlank = false; i++; continue;
            }

            const nxLine = nx();
            if (prevBlank && /^[A-Z][A-Z\s]+TO:\s*$/.test(t) && (!nxLine || !nxLine.trim())) {
                tokens.push({ type: 'transition', text: t });
                prevBlank = false; i++; continue;
            }

            const isAllCaps  = t === t.toUpperCase() && /[A-Z]/.test(t);
            const nxNonBlank = nxLine !== null && nxLine.trim() !== '';
            if (prevBlank && isAllCaps && nxNonBlank
                && !/^(int|ext|est)[\s.\-]/i.test(t)
                && !t.trimEnd().endsWith('TO:')) {
                const dual  = t.trimEnd().endsWith('^');
                const cname = t.replace(/\s*\^\s*$/, '').replace(/^@/, '').trim();
                tokens.push({ type: 'character', text: cname, dual });
                i++;
                while (i < lines.length && lines[i].trim()) {
                    const dl = lines[i].trim();
                    tokens.push(dl.startsWith('(') && dl.endsWith(')')
                        ? { type: 'parenthetical', text: dl }
                        : { type: 'dialogue',      text: dl });
                    i++;
                }
                prevBlank = false;
                continue;
            }

            let actionText = t.startsWith('!') ? t.slice(1) : t;
            i++;
            while (i < lines.length) {
                const cl = lines[i].trim();
                if (!cl) break;
                if (/^(={3,}|#{1,3}\s|=\s|\.\S|>|~|\[\[|\/\*)/.test(cl)) break;
                if (/^(int\.?|ext\.?|est\.)[\s.\-]/i.test(cl)) break;
                if (cl === cl.toUpperCase() && /[A-Z]/.test(cl) && lines[i + 1]?.trim()) break;
                actionText += '\n' + (cl.startsWith('!') ? cl.slice(1) : cl);
                i++;
            }
            tokens.push({ type: 'action', text: actionText });
            prevBlank = false;
        }

        return tokens;
    }

    // Render Fountain tokens → HTML string.
    function _renderFountainTokens(tokens) {
        const out = [];
        let i = 0;
        while (i < tokens.length) {
            const tok = tokens[i];
            switch (tok.type) {
                case 'page_break':
                    out.push('<div class="nb-script-page-break"></div>');
                    break;
                case 'note':
                    out.push(_renderInline(`[[${tok.text}]]`));
                    break;
                case 'scene_heading':
                    out.push(`<div class="nb-script-slug nb-script-slug-inline">${_esc(tok.text)}</div>`);
                    break;
                case 'action':
                    out.push(`<p class="nb-script-action">${_renderInline(tok.text)}</p>`);
                    break;
                case 'transition':
                    out.push(`<p class="nb-script-transition">${_esc(tok.text)}</p>`);
                    break;
                case 'centered':
                    out.push(`<p class="nb-script-centered">${_renderInline(tok.text)}</p>`);
                    break;
                case 'lyrics':
                    out.push(`<p class="nb-script-lyrics">${_renderInline(tok.text)}</p>`);
                    break;
                case 'section':
                    out.push(`<div class="nb-script-section nb-script-sec-${tok.depth}">${_esc(tok.text)}</div>`);
                    break;
                case 'synopsis':
                    out.push(`<div class="nb-script-synopsis">${_esc(tok.text)}</div>`);
                    break;
                case 'character': {
                    let j = i + 1;
                    const dHtml = [];
                    while (j < tokens.length && (tokens[j].type === 'dialogue' || tokens[j].type === 'parenthetical')) {
                        const d = tokens[j++];
                        dHtml.push(d.type === 'parenthetical'
                            ? `<p class="nb-script-paren">${_esc(d.text)}</p>`
                            : `<p class="nb-script-dialogue">${_renderInline(d.text)}</p>`);
                    }
                    out.push(`<div class="nb-script-speech${tok.dual ? ' nb-script-dual' : ''}">` +
                             `<p class="nb-script-char">${_esc(tok.text)}</p>` +
                             dHtml.join('') + `</div>`);
                    i = j;
                    continue;
                }
            }
            i++;
        }
        return out.join('\n');
    }

    function _renderScript(note) {
        const meta = note.meta || {};
        if (note.type !== 'scene') return null;

        const ie  = String(meta.int_ext  || '').toUpperCase().startsWith('I') ? 'INT.' : 'EXT.';
        const dn  = String(meta.day_night|| '').toUpperCase().startsWith('D') ? 'DAY'  : 'NIGHT';
        const loc = String(meta.loc      || '').toUpperCase();
        const slug     = `${ie} ${loc} — ${dn}`;
        const sceneTag = `SCENE ${meta.alias ?? ''}`;

        const bodyHtml = _renderFountainTokens(_parseFountain(note.raw));

        return `<div class="nb-cine-screenplay"><div class="nb-script-page">` +
               `<div class="nb-script-slug"><span class="nb-script-scene-tag">${_esc(sceneTag)}</span>${_esc(slug)}</div>` +
               `<div class="nb-script-body">${bodyHtml}</div>` +
               `</div></div>`;
    }

    // ── Script title-page header (type: script) ──────────────────────────────

    async function _renderScriptNote(note) {
        const meta    = note.meta || {};
        const title   = meta.title || note.title || 'Untitled';
        const author  = meta.author   ? `<div class="nb-stp-byline">written by</div><div class="nb-stp-author">${_esc(meta.author)}</div>` : '';
        const info    = [meta.draft, meta.copyright ? `© ${meta.copyright}` : ''].filter(Boolean).join(' · ');

        let sceneCount = 0, maxAlias = 0, assembledHtml = '';
        try {
            const data   = await _fetchData(note.notebook);
            const scenes = (data.scenes || [])
                .filter(s => /^\d+$/.test(String(s.alias || '')))
                .sort((a, b) => parseInt(a.alias) - parseInt(b.alias));
            sceneCount = scenes.length;
            maxAlias   = Math.max(0, ...scenes.map(s => parseInt(s.alias)));

            const sceneNotes = await Promise.all(
                scenes.map(s =>
                    fetch(`/api/note?selector=${encodeURIComponent(s.selector)}`)
                        .then(r => r.json()).catch(() => null)
                )
            );
            assembledHtml = sceneNotes
                .filter(Boolean)
                .map(sn => _renderScript(sn) || '')
                .join('');
        } catch (_) {}

        const stats = [
            sceneCount ? `<span class="nb-specialty-pill">${sceneCount} scene${sceneCount !== 1 ? 's' : ''}</span>` : '',
            maxAlias   ? `<span class="nb-specialty-pill">~${maxAlias} min est.</span>` : '',
        ].join('');

        const exportBtns = `
            <button class="nb-specialty-action nb-script-dl-fountain" data-notebook="${_esc(note.notebook || '')}" title="Download .fountain">⬇ .fountain</button>
            <button class="nb-specialty-action nb-script-dl-pdf"      data-notebook="${_esc(note.notebook || '')}" title="Export PDF via afterwriting">⬇ PDF</button>`;

        return `<div class="nb-script-title-page">
            <div class="nb-stp-title">${_esc(title)}</div>
            ${author}
            ${info ? `<div class="nb-stp-info">${_esc(info)}</div>` : ''}
            <div class="nb-stp-actions">${stats}${exportBtns}</div>
        </div>
        ${assembledHtml}`;
    }

    // ── Shot sheet renderer (shots.sheet) ────────────────────────────────────

    function _buildShotSheet(el, data, filter, notebook) {
        const { shots, characters, cast, locations, config } = data;

        let filtered = shots;
        if (filter.day !== undefined) {
            filtered = filter.day === null
                ? filtered.filter(s => s.day == null || s.day === '')
                : filtered.filter(s => s.day === filter.day);
        }
        if (filter.scene !== undefined) filtered = filtered.filter(s => String(s.scene) === String(filter.scene));
        if (filter.actor)               filtered = filtered.filter(s => s.actors.includes(filter.actor));

        el.innerHTML = '';
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        const sheetDayLabel = filter.day === null      ? ' · Unscheduled'
                            : filter.day !== undefined ? ` · Day ${filter.day}`
                            : '';
        hdr.innerHTML = `<span class="nb-cine-title">📋 ${_esc(config?.project || 'Shot Sheet')}${_esc(sheetDayLabel)}</span>`;
        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tw-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', () => { _bust(NbNav.notebook); _loadCineBlock(el); });
        hdr.appendChild(refBtn);
        el.appendChild(hdr);

        if (!filtered.length) {
            el.insertAdjacentHTML('beforeend', '<div class="nb-cine-empty">No shots found</div>');
            return;
        }

        let currentDay = undefined;
        for (const shot of filtered) {
            if (filter.day === undefined) {
                const thisDay = shot.day ?? null;
                if (thisDay !== currentDay) {
                    currentDay = thisDay;
                    el.insertAdjacentHTML('beforeend',
                        `<div class="nb-cine-daybreak">${thisDay != null ? 'SHOOT DAY ' + _esc(String(thisDay)) : 'UNSCHEDULED'}</div>`);
                }
            }

            if (shot.type === 'lunch' || shot.type === 'move') {
                el.insertAdjacentHTML('beforeend',
                    `<div class="nb-cine-sheet-break nb-cine-strip-${shot.type}">${_esc(_descFirst(shot.desc) || shot.type.toUpperCase())}</div>`);
                continue;
            }

            const ie = shot.int_ext ? shot.int_ext + '.' : '';
            const dn = shot.day_night || '';
            const locEntry = locations[shot.loc];
            const locName  = locEntry?.meta?.title || shot.loc;
            const locSel   = locEntry?.selector;
            const slug = `${ie} ${_esc(shot.loc)} — ${dn}`;

            const actorLines = (shot.actors || []).map(code => {
                const charEntry  = characters[code];
                const actorStem  = charEntry?.meta?.alias;
                const actorEntry = cast[actorStem];
                const actorName  = actorEntry?.meta?.title || actorStem || code;
                const charTitle  = charEntry?.meta?.title  || code;
                const label      = actorEntry ? `${actorName} as ${charTitle}` : charTitle;
                const sel        = actorEntry?.selector || charEntry?.selector;
                return sel
                    ? `<button class="nb-cine-link" data-selector="${_esc(sel)}">${_esc(label)}</button>`
                    : _esc(label);
            }).join(', ');

            const _sr = shot.resources;
            const resources = Array.isArray(_sr)
                ? _sr.filter(Boolean).join(', ')
                : (_sr && typeof _sr === 'object')
                    ? Object.entries(_sr).map(([k, v]) => `${k}: ${v}`).join(' · ')
                    : '';
            const tech = [
                shot.cameras  ? `Cam: ${shot.cameras}`   : '',
                shot.lens     ? `Lens: ${shot.lens}`      : '',
                shot.platform ? `Plt: ${shot.platform}`   : '',
            ].filter(Boolean).join(' · ');

            const card = document.createElement('div');
            card.className = 'nb-cine-sheet-row';
            card.dataset.selector = shot.selector;
            card.innerHTML =
                `<div class="nb-cine-sheet-head">` +
                    `<span class="nb-cine-sheet-shotid">` +
                        `<button class="nb-cine-link" data-selector="${_esc(shot.selector)}">Sc.${_esc(shot.scene)} / ${_esc(shot.shot)}</button>` +
                    `</span>` +
                    `<span class="nb-cine-sheet-slug">${ie} ` +
                        (locSel ? `<button class="nb-cine-link" data-selector="${_esc(locSel)}">${_esc(locName)}</button>` : _esc(locName)) +
                        ` — ${_esc(dn)}` +
                    `</span>` +
                `</div>` +
                `<div class="nb-cine-sheet-desc">${_esc(shot.desc || '')}</div>` +
                (actorLines ? `<div class="nb-cine-sheet-meta">Cast: ${actorLines}</div>` : '') +
                (tech       ? `<div class="nb-cine-sheet-meta">${_esc(tech)}${resources ? ' · Res: ' + _esc(resources) : ''}</div>` : '');

            el.appendChild(card);
        }

        el.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
    }

    // ── Field lookup renderer (actor.phone, location.address, …) ─────────────

    function _buildFieldLookup(el, data, resource, fieldName, codes) {
        const table = data[resource + 's'] || data[resource] || {};  // actors, locations, resources
        const config = data.config;

        el.innerHTML = '';
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        hdr.innerHTML = `<span class="nb-cine-title">${_esc(resource + '.' + fieldName)}</span>`;
        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tw-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', () => { _bust(NbNav.notebook); _loadCineBlock(el); });
        hdr.appendChild(refBtn);
        el.appendChild(hdr);

        // If no codes given, show all
        const keys = codes.length ? codes : Object.keys(table);

        if (!keys.length) {
            el.insertAdjacentHTML('beforeend', `<div class="nb-cine-empty">No ${_esc(resource)} found</div>`);
            return;
        }

        const rows = document.createElement('div');
        rows.className = 'nb-cine-lookup-table';
        for (const code of keys) {
            const entry = table[code];
            if (!entry) {
                rows.insertAdjacentHTML('beforeend',
                    `<div class="nb-cine-lookup-row">` +
                    `<span class="nb-cine-lookup-code">${_esc(code)}</span>` +
                    `<span class="nb-cine-lookup-val nb-cine-lookup-missing">not found</span></div>`);
                continue;
            }
            const raw = entry.meta?.[fieldName];
            let valHtml;
            if (raw === undefined || raw === null || raw === '') {
                valHtml = `<em style="opacity:0.4">—</em>`;
            } else {
                const s = String(raw).trim();
                valHtml = s.includes('\n')
                    ? `<pre class="nb-cine-lookup-pre">${_esc(s)}</pre>`
                    : _esc(s);
            }
            const nameField = entry.meta?.name || entry.meta?.title || code;
            rows.insertAdjacentHTML('beforeend',
                `<div class="nb-cine-lookup-row">` +
                `<button class="nb-cine-link nb-cine-lookup-code" data-selector="${_esc(entry.selector)}">${_esc(code)}</button>` +
                `<span class="nb-cine-lookup-name">${_esc(nameField)}</span>` +
                `<span class="nb-cine-lookup-val">${valHtml}</span>` +
                `</div>`);
        }
        el.appendChild(rows);

        el.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
    }

    // ── Block loader ──────────────────────────────────────────────────────────

    // ── Sub-field query resolver ──────────────────────────────────────────────
    // Sub-block fields searched for flat lookups (order = priority on name collision).
    const _SHOT_SUBBLOCKS = ['tech', 'art', 'cast', 'resources'];

    // Resolve a dotted or flat path against a shot record.
    //   'tech.camera'  → shot.tech.camera  (explicit)
    //   'camera'       → first sub-block containing 'camera' key  (flat)
    //   'desc'         → shot.desc  (top-level fallback)
    // Returns the value (string, number, dict, …) or null.
    function _resolveSubfield(shot, path) {
        if (path.includes('.')) {
            const dot   = path.indexOf('.');
            const block = path.slice(0, dot);
            const key   = path.slice(dot + 1);
            const sub   = shot[block];
            if (sub && typeof sub === 'object' && !Array.isArray(sub))
                return sub[key] ?? null;
            return null;
        }
        for (const block of _SHOT_SUBBLOCKS) {
            const sub = shot[block];
            if (sub && typeof sub === 'object' && !Array.isArray(sub) && path in sub)
                return sub[path];
        }
        // Top-level fallback (e.g. 'desc', 'lens', 'platform')
        return shot[path] ?? null;
    }

    // Format a resolved value for display.
    function _fmtSubValue(val) {
        if (val == null)                                    return '';
        if (typeof val === 'object' && !Array.isArray(val))
            return Object.entries(val).map(([k, v]) => `${k}: ${v}`).join('\n');
        if (Array.isArray(val))                             return val.join(', ');
        return String(val);
    }

    // ── Sub-field table renderer (shots.<anything-not-a-keyword>) ─────────────
    // Renders a two-column table: shot-id | resolved value, one row per shot.
    // Shots without the field are omitted unless every shot lacks it (then shows help).
    function _buildSubfieldTable(el, data, path, filter, notebook) {
        const { shots, config } = data;
        const filtered  = _filterShots(shots, filter);
        const fieldLabel = path.includes('.') ? path.split('.').pop() : path;
        const rows = filtered
            .map(s => ({ shot: s, val: _resolveSubfield(s, path) }))
            .filter(r => r.val != null && r.val !== '');

        el.innerHTML = '';
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        hdr.innerHTML =
            `<span class="nb-cine-title">🔍 ${_esc(fieldLabel)}</span>` +
            `<span class="nb-cine-subtitle">${rows.length} shot${rows.length !== 1 ? 's' : ''}</span>`;
        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tw-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', () => { _bust(notebook); _loadCineBlock(el); });
        hdr.appendChild(refBtn);
        el.appendChild(hdr);

        if (!rows.length) {
            el.insertAdjacentHTML('beforeend',
                `<div class="nb-cine-empty">No shots have field <code>${_esc(path)}</code></div>`);
            return;
        }

        const table = document.createElement('div');
        table.className = 'nb-cine-sf-table';
        // Header row
        table.insertAdjacentHTML('beforeend',
            `<div class="nb-cine-sf-row nb-cine-sf-hdr">` +
            `<span class="nb-cine-sf-id">Shot</span>` +
            `<span class="nb-cine-sf-val">${_esc(fieldLabel)}</span></div>`);

        for (const { shot, val } of rows) {
            const shotId = `${shot.scene}.${shot.shot}`;
            const text   = _fmtSubValue(val);
            const row    = document.createElement('div');
            row.className = 'nb-cine-sf-row';
            const btn = document.createElement('button');
            btn.className = 'nb-cine-link nb-cine-sf-id';
            btn.dataset.selector = shot.selector;
            btn.textContent = shotId;
            btn.title = shot.desc || '';
            row.appendChild(btn);
            const valEl = document.createElement('span');
            valEl.className = 'nb-cine-sf-val';
            valEl.textContent = text;
            row.appendChild(valEl);
            table.appendChild(row);
        }
        el.appendChild(table);
    }

    // ── Shot line renderer (shots.line) ──────────────────────────────────────

    function _buildShotLine(el, data, filter, notebook) {
        const { shots, characters, cast, locations, config } = data;
        const filtered = _filterShots(shots, filter);

        el.innerHTML = '';
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        const lineDayLabel = filter.shot  !== undefined ? ` · Shot ${filter.shot}`
                           : filter.scene !== undefined ? ` · Scene ${filter.scene}`
                           : filter.loc   !== undefined ? ` · Loc ${filter.loc}`
                           : filter.day   === null      ? ' · Unscheduled'
                           : filter.day   !== undefined ? ` · Day ${filter.day}`
                           : ' · All shots';
        hdr.innerHTML = `<span class="nb-cine-title">📄 ${_esc(config?.project || 'Shots')}${_esc(lineDayLabel)}</span>`;
        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tw-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', () => { _bust(notebook); _loadCineBlock(el); });
        hdr.appendChild(refBtn);
        el.appendChild(hdr);

        if (!filtered.length) {
            el.insertAdjacentHTML('beforeend', '<div class="nb-cine-empty">No shots found</div>');
            return;
        }

        const board = document.createElement('div');
        board.className = 'nb-cine-board nb-cine-board-line';

        board.insertAdjacentHTML('beforeend',
            `<div class="nb-cine-strip nb-cine-colheader">` +
            `<span class="nb-cine-dnie" title="Day/Night · Int/Ext">DN</span>` +
            `<span class="nb-cine-id">ID</span>` +
            `<span class="nb-cine-loc">Loc</span>` +
            `<span class="nb-cine-desc">Description</span>` +
            `<span class="nb-cine-actors">Actors</span>` +
            `</div>`
        );

        let currentDay = undefined;
        for (const shot of filtered) {
            if (filter.day === undefined) {
                const thisDay = shot.day ?? null;
                if (thisDay !== currentDay) {
                    currentDay = thisDay;
                    board.insertAdjacentHTML('beforeend',
                        `<div class="nb-cine-daybreak">${thisDay != null ? 'DAY&nbsp;' + _esc(String(thisDay)) : 'UNSCHEDULED'}</div>`);
                }
            }
            if (shot.type === 'lunch' || shot.type === 'move') continue; // skip special strips in line view
            board.appendChild(_buildStrip(shot, characters, cast, locations, notebook));
        }

        el.appendChild(board);

        el.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
    }

    // ── Story creation ────────────────────────────────────────────────────────

    function _showInlineStoryInput(container, laneStem, notebook, blockEl, size, onDone, project = '') {
        // Remove any existing inline input first
        container.querySelector('.nb-cine-inline-add')?.remove();

        const wrap = document.createElement('div');
        wrap.className = 'nb-cine-inline-add';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Story title… Enter to create';
        input.className = 'nb-cine-inline-input';
        wrap.appendChild(input);

        const cancel = document.createElement('button');
        cancel.textContent = '✕'; cancel.className = 'nb-tw-btn';
        cancel.addEventListener('click', () => wrap.remove());
        wrap.appendChild(cancel);

        container.appendChild(wrap);
        input.focus();

        async function _submit() {
            const title = input.value.trim();
            if (!title) { wrap.remove(); return; }
            input.disabled = true;
            await _createStory(notebook, title, laneStem || '', project);
            _bust(notebook, project);
            if (onDone) { await onDone(); } else { _loadCineBlock(blockEl); }
        }

        input.addEventListener('keydown', e => {
            if (e.key === 'Enter')  { e.preventDefault(); _submit(); }
            if (e.key === 'Escape') { wrap.remove(); }
        });
    }

    async function _createStory(notebook, title, plotline, project = '') {
        const r = await fetch('/api/cine/story/create', {
            method:  'POST',
            headers: {'Content-Type': 'application/json'},
            body:    JSON.stringify({ notebook, title, plotline, project }),
        });
        const d = await r.json();
        if (!d.ok) throw new Error(d.error || 'create failed');
        return d.selector;
    }

    // ── Storylines board ──────────────────────────────────────────────────────

    const _SL_SIZE_KEY = nb => `nb-cine-sl-size-${nb}`;
    const _SL_VIEW_KEY = nb => `nb-cine-sl-view-${nb}`;
    // One-shot signal: Board clicked from the Note view has nowhere to switch
    // "to" the way Story/Script do (there's no board sub-state of the
    // storyline-story tab) -- it has to reopen the note on the storyline-story
    // tab AND immediately pop the overlay. Consumed once by _loadCineBlock's
    // storyline-story branch, then cleared.
    const _SL_PENDING_BOARD_KEY = nb => `nb-cine-sl-pending-board-${nb}`;

    function _buildStorylines(el, data, notebook, defaultSize = 'small') {
        const stored = localStorage.getItem(_SL_SIZE_KEY(notebook));
        const size   = stored || defaultSize;
        const { lanes, stories, config } = data;

        el.innerHTML = '';

        const laneCount  = (lanes  || []).length;
        const storyCount = (stories || []).length;

        const stub = document.createElement('div');
        stub.className = 'nb-cine-sl-stub';

        const titleEl = document.createElement('div');
        titleEl.className = 'nb-cine-sl-stub-title';
        titleEl.textContent = `🧵 ${config?.project || 'Storylines'}`;
        stub.appendChild(titleEl);

        const metaEl = document.createElement('div');
        metaEl.className = 'nb-cine-sl-stub-meta';
        metaEl.textContent =
            `${laneCount} plotline${laneCount !== 1 ? 's' : ''} · ` +
            `${storyCount} stor${storyCount !== 1 ? 'ies' : 'y'}`;
        stub.appendChild(metaEl);

        const btnGroup = document.createElement('div');
        btnGroup.className = 'nb-cine-hdr-btns';

        const openBtn = document.createElement('button');
        openBtn.className = 'nb-tw-btn nb-cine-sl-open-btn';
        openBtn.textContent = 'Open Board →';
        openBtn.addEventListener('click', () => _openStorylineOverlay(el, data, notebook, size));
        btnGroup.appendChild(openBtn);

        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tw-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', () => { _bust(notebook); _loadCineBlock(el); });
        btnGroup.appendChild(refBtn);

        stub.appendChild(btnGroup);
        el.appendChild(stub);
    }

    // ── Unified storyline header ────────────────────────────────────────────
    // Shared by the board overlay and the inline story/script views so
    // Board/Story/Script read as one system instead of three independently
    // built toolbars. Icon family: same outer silhouette, different fill
    // (3 lanes / 3 solid bars / ragged hairlines) -- settled with djp
    // 2026-08-06. Zoom (concentric-square fill, one shared button) applies
    // to all three views via the same _SL_SIZE_KEY preference; Save/Load
    // order stay board-only since they act on the board's own drag state.
    const _SL_ICON_BOARD  = '<svg viewBox="0 0 20 20" fill="none"><rect x="1.5" y="7" width="4.6" height="6" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="7.7" y="7" width="4.6" height="6" rx="1.1" stroke="currentColor" stroke-width="1.6"/><rect x="13.9" y="7" width="4.6" height="6" rx="1.1" stroke="currentColor" stroke-width="1.6"/></svg>';
    const _SL_ICON_STORY  = '<svg viewBox="0 0 20 20" fill="none"><rect x="2" y="5.5" width="16" height="2.6" rx="1.3" fill="currentColor"/><rect x="2" y="9.6" width="16" height="2.6" rx="1.3" fill="currentColor"/><rect x="2" y="13.7" width="10" height="2.6" rx="1.3" fill="currentColor"/></svg>';
    const _SL_ICON_SCRIPT = '<svg viewBox="0 0 20 20" fill="none"><line x1="2" y1="3.6" x2="15.5" y2="3.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="2" y1="6.4" x2="10.5" y2="6.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="2" y1="9.2" x2="17" y2="9.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="2" y1="12" x2="7.5" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="2" y1="14.8" x2="13.5" y2="14.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="2" y1="17.6" x2="9" y2="17.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
    const _SL_ICON_ZOOM   = '<svg viewBox="0 0 20 20" fill="none"><rect class="ring-outer" x="2" y="2" width="16" height="16" rx="3.2" stroke="currentColor" stroke-width="1.4"/><rect class="ring-mid" x="6" y="6" width="8" height="8" rx="1.8" stroke="currentColor" stroke-width="1.4"/><rect class="ring-inner" x="8.6" y="8.6" width="2.8" height="2.8" rx="0.7" fill="currentColor"/></svg>';
    const _SL_ZOOM_LEVEL  = { small: 0, medium: 1, large: 2 };
    const _SL_ZOOM_ORDER  = ['small', 'medium', 'large'];

    // Story/Script zoom is content density, not font size (djp, 2026-08-06 --
    // the earlier padding/font-size CSS zoom "tries to do a bad font zoom on
    // those elements"). small never needs a body fetch (desc only, straight
    // from the bundle); medium/large do, one fetch per item, sequential --
    // see the dev-server concurrency gotcha in the verify skill.
    const _SL_LEVEL_MODE = {
        story:  { small: 'desc', medium: 'sentences3', large: 'para1' },
        script: { small: 'desc', medium: 'para1',       large: 'full'  },
    };

    function _slSliceText(text, mode) {
        const t = (text || '').trim();
        if (mode === 'full') return t;
        if (mode === 'para1') return (t.split(/\n\s*\n/)[0] || '').trim();
        if (mode === 'sentences3') {
            // Source-newline-agnostic on purpose: unwrapped-paragraph prose (one
            // long physical line per paragraph, common in this demo content) made
            // a literal "first 6 lines" grab 2+ paragraphs, more text than "large"
            // (first paragraph) showed -- inverting the small<medium<large density
            // ordering. Sentence-splitting sidesteps source line-wrapping entirely.
            // Naive (doesn't special-case "Mr." etc.) -- fine for a preview
            // truncation, worst case grabs one extra clause.
            const sentences = t.match(/[^.!?]+[.!?]+(\s+|$)/g) || [t];
            let out = sentences.slice(0, 3).join('').trim();
            // A sentence boundary can land inside *emphasis*/_emphasis_, leaving an
            // unpaired marker that marked.parse renders as a stray literal
            // character -- strip a trailing odd-one-out rather than let it show.
            // Simple count-based check, not marker-pair-aware (doesn't distinguish
            // ** from *) -- fine for a preview truncation, not a markdown parser.
            for (const marker of ['*', '_']) {
                const count = out.split(marker).length - 1;
                if (count % 2 === 1) out = out.slice(0, out.lastIndexOf(marker)) + out.slice(out.lastIndexOf(marker) + 1);
            }
            return out;
        }
        return '';
    }

    // Fills bodyEl for one promoted item at the given zoom mode. 'desc' is
    // free (already in the bundle); anything else fetches this item's full
    // body -- called from a sequential for...of loop by both the story-view
    // and script-view branches, never concurrently (dev server chokes on
    // concurrent fetches, see the verify skill).
    async function _slFillBody(bodyEl, item, mode) {
        if (mode === 'desc') {
            bodyEl.textContent = item.meta?.desc || '';
            return;
        }
        bodyEl.innerHTML = '<span style="opacity:0.3">…</span>';
        try {
            const d = await fetch(`/api/note?selector=${encodeURIComponent(item.selector)}`).then(r => r.json());
            const sliced = _slSliceText(d.body, mode);
            bodyEl.innerHTML = sliced
                ? (window.marked?.parse ? window.marked.parse(sliced) : `<p>${_esc(sliced)}</p>`)
                : '<em style="opacity:0.3">No body text.</em>';
        } catch (_) {
            bodyEl.innerHTML = '<em style="opacity:0.3">Failed to load.</em>';
        }
    }

    function _buildStorylineHeader(opts) {
        const {
            title, activeView, onSwitchView,
            showZoom = true, zoomSize, onZoomChange,
            onAddStory,
            showOrderControls = false, orderNames = [], onSaveOrder, onLoadOrder,
            locked = false, onToggleLock,
            onRefresh, onClose,
            selfSelector = '', notebook = '',
        } = opts;

        const hdr = document.createElement('div');
        hdr.className = 'nb-specialty-header nb-cine-storyline-hdr';
        if (selfSelector) hdr.dataset.selector = selfSelector;

        // Leading icon is its own nav-trigger element, same as the plotline/
        // story/milestone headers -- opens nbweb-specialty's cross-type popup
        // (only type:storyline is registered into it, not story/plotline/
        // milestone, so this stays "jump to another production" rather than
        // "browse every card"). Click delegation is entirely nbweb-specialty's
        // own generic listener (matches on class/data attributes) -- nothing
        // to wire here beyond emitting the right markup.
        const iconBtn = document.createElement('button');
        iconBtn.className = 'nb-specialty-icon nb-specialty-nav-btn';
        iconBtn.dataset.nbNav = notebook;
        iconBtn.title = `All specialty notes in ${notebook || 'this notebook'}`;
        iconBtn.textContent = '🧵';
        hdr.appendChild(iconBtn);

        // Two separate spans, same as the plotline/story headers -- only the
        // storyline's own name is clickable, "— storyline" is plain suffix
        // text, not part of the same selectable/clickable unit. Wrapped in one
        // flex item so hdr's own `gap` (meant to space header *sections*
        // apart) doesn't also shove the two title parts apart from each other.
        const titleWrap = document.createElement('span');
        titleWrap.className = 'nb-cine-sl-title-wrap';

        const titleNameEl = document.createElement('span');
        titleNameEl.className = 'nb-specialty-label';
        titleNameEl.textContent = title || 'Storylines';
        if (selfSelector) {
            titleNameEl.classList.add('nb-cine-title-nav');
            titleNameEl.dataset.navMode = 'self';
            titleNameEl.title = 'View this storyline’s own note';
        }
        titleWrap.appendChild(titleNameEl);

        const titleSuffixEl = document.createElement('span');
        titleSuffixEl.className = 'nb-specialty-label';
        titleSuffixEl.textContent = ' — storyline';
        titleWrap.appendChild(titleSuffixEl);

        hdr.appendChild(titleWrap);

        const viewGroup = document.createElement('div');
        viewGroup.className = 'nb-cine-sl-viewgroup';
        for (const v of [
            { id: 'board',  title: 'Board',  svg: _SL_ICON_BOARD  },
            { id: 'story',  title: 'Story',  svg: _SL_ICON_STORY  },
            { id: 'script', title: 'Script', svg: _SL_ICON_SCRIPT },
        ]) {
            const btn = document.createElement('button');
            btn.className = 'nb-cine-sl-view-btn' + (v.id === activeView ? ' nb-active' : '');
            btn.title = v.title;
            btn.innerHTML = v.svg;
            btn.addEventListener('click', () => onSwitchView(v.id));
            viewGroup.appendChild(btn);
        }
        // Zoom rides along in the same button cluster as a 4th icon, visually
        // separated -- it's "fickle": only meaningful when a board/story/script
        // view is actually showing (card size has no meaning for plain body
        // text or for a plotline/story note's own header), so showZoom is false
        // in those contexts rather than this button living somewhere else.
        if (showZoom) {
            const zoomBtn = document.createElement('button');
            zoomBtn.className = 'nb-cine-sl-view-btn nb-cine-sl-zoom-btn';
            zoomBtn.title = `Card size: ${zoomSize}`;
            zoomBtn.dataset.level = _SL_ZOOM_LEVEL[zoomSize] ?? 0;
            zoomBtn.innerHTML = _SL_ICON_ZOOM;
            zoomBtn.addEventListener('click', () => {
                const next = _SL_ZOOM_ORDER[(_SL_ZOOM_ORDER.indexOf(zoomSize) + 1) % _SL_ZOOM_ORDER.length];
                onZoomChange(next);
            });
            viewGroup.appendChild(zoomBtn);
        }
        hdr.appendChild(viewGroup);

        const actions = document.createElement('span');
        actions.className = 'nb-specialty-right';

        if (onAddStory && !locked) {
            const addBtn = document.createElement('button');
            addBtn.className = 'nb-specialty-action';
            addBtn.title = 'Add story (unassigned)';
            addBtn.textContent = '+ Story';
            addBtn.addEventListener('click', onAddStory);
            actions.appendChild(addBtn);
        }

        if (showOrderControls && !locked) {
            const saveOrderBtn = document.createElement('button');
            saveOrderBtn.className = 'nb-specialty-action';
            saveOrderBtn.title = 'Save current timeline order';
            saveOrderBtn.textContent = '⊙';
            saveOrderBtn.addEventListener('click', onSaveOrder);
            actions.appendChild(saveOrderBtn);

            if (orderNames.length) {
                const ordSel = document.createElement('select');
                ordSel.className = 'nb-cine-orders-sel';
                ordSel.title = 'Load a saved timeline order';
                const ph = document.createElement('option');
                ph.value = ''; ph.textContent = 'Load order…';
                ordSel.appendChild(ph);
                orderNames.forEach(n => {
                    const opt = document.createElement('option');
                    opt.value = n; opt.textContent = n;
                    ordSel.appendChild(opt);
                });
                ordSel.addEventListener('change', () => {
                    const name = ordSel.value;
                    ordSel.value = '';
                    if (name) onLoadOrder(name);
                });
                actions.appendChild(ordSel);
            }
        }

        if (onToggleLock) {
            const lockBtn = document.createElement('button');
            lockBtn.className = 'nb-specialty-action';
            lockBtn.title = locked ? 'Unlock storyline' : 'Lock storyline';
            lockBtn.textContent = locked ? '🔒' : '🔓';
            lockBtn.addEventListener('click', onToggleLock);
            actions.appendChild(lockBtn);
        }

        const refBtn = document.createElement('button');
        refBtn.className = 'nb-specialty-action'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', onRefresh);
        actions.appendChild(refBtn);

        if (onClose) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'nb-specialty-action'; closeBtn.title = 'Close (Esc)'; closeBtn.textContent = '✕';
            closeBtn.addEventListener('click', onClose);
            actions.appendChild(closeBtn);
        }

        hdr.appendChild(actions);
        return hdr;
    }

    function _openStorylineOverlay(el, data, notebook, currentSize, project = '') {
        document.querySelector('.nb-cine-sl-overlay')?.remove();

        const stored = localStorage.getItem(_SL_SIZE_KEY(notebook));
        const size   = stored || currentSize;
        const { lanes, stories, orphan_scenes, config } = data;

        const overlay = document.createElement('div');
        overlay.className = 'nb-cine-sl-overlay';
        document.body.appendChild(overlay);

        let board; // declared early so header button closures can reference it

        function _close() {
            overlay.remove();
            document.removeEventListener('keydown', _onEsc);
            if (_slOverlayClose === _close) _slOverlayClose = null;
        }
        function _onEsc(e) { if (e.key === 'Escape') _close(); }
        document.addEventListener('keydown', _onEsc);
        _slOverlayClose = _close;

        async function _refresh() {
            _bust(notebook, project);
            const fresh = await _fetchData(notebook, project).catch(e => ({ error: e.message }));
            _close();
            if (fresh.error) {
                el.innerHTML = `<span class="nb-cine-error">⚠ ${_esc(fresh.error)}</span>`;
                return;
            }
            _buildStorylines(el, fresh, notebook, size);
            _openStorylineOverlay(el, fresh, notebook, size, project);
        }

        // ── Named orders ──────────────────────────────────────────────────────
        const _slLane   = lanes?.find(l => l.is_storyline);
        const _orders   = _slLane?.orders || {};
        const _ordNames = Object.keys(_orders);

        // Locked (via the master storyline note's own lock: field) makes the
        // whole board read-only -- .nb-cine-sl-locked hides every mutation
        // affordance (add/demote buttons) via CSS; Sortable is disabled below.
        overlay.classList.toggle('nb-cine-sl-locked', !!_slLane?.locked);

        async function _saveOrder() {
            const raw = prompt('Save current timeline as:');
            if (raw === null) return;
            const name = raw.trim().toLowerCase()
                           .replace(/[^a-z0-9_-]/g, '-')
                           .replace(/-+/g, '-').replace(/^-+|-+$/g, '');
            if (!name) { alert('Invalid name — use letters, numbers, hyphens.'); return; }
            const cardZone = board.querySelector('.nb-cine-storyline-main .nb-cine-lane-cards');
            if (!cardZone) { alert('No storyline track found.'); return; }
            const stems = [...cardZone.querySelectorAll('.nb-cine-story-card, .nb-cine-milestone-card')]
                .map(c => c.dataset.selector.split('/').pop().replace(/\.md$/i, ''));
            const res = await fetch('/api/cine/storyline/order', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    notebook, selector: _slLane.selector, name, order: stems.join(','),
                }),
            }).catch(e => ({ ok: false, _err: e.message }));
            const d = res.ok !== false ? await res.json() : res;
            if (d.error || d._err) { alert('Save failed: ' + (d.error || d._err)); return; }
            await _refresh();
        }

        async function _loadOrder(name) {
            const orderStr = _orders[name];
            if (!orderStr) return;
            const stems = orderStr.split(',').map(s => s.trim()).filter(Boolean);
            const allItems = [...(data.stories || []), ...(data.milestones || [])];
            const orderedSet = new Map(stems.map((stem, i) => [stem, i + 1]));
            const moves = [];
            for (const it of allItems) {
                const stem    = it.selector.split('/').pop().replace(/\.md$/i, '');
                const newSeq  = orderedSet.get(stem) ?? null;
                const wasOnTrack = it.story_seq !== null && it.story_seq !== undefined;
                if (newSeq !== null || wasOnTrack) {
                    moves.push({
                        selector:  it.selector,
                        plotline:  it.plotline || '',
                        seq:       it.seq ?? 0,
                        story_seq: newSeq,
                        ...(it.milestone_seq !== undefined ? { milestone_seq: it.milestone_seq } : {}),
                    });
                }
            }
            if (!moves.length) return;
            await fetch('/api/cine/story/resequence', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ notebook, moves }),
            }).catch(e => console.error('Load order:', e));
            await _refresh();
        }

        // Lock/unlock targets the master storyline note's own lock: field --
        // the same field the plain note-preview toolbar's lock button writes,
        // regardless of whether the toggle happens from here, Story/Script,
        // or the Note view (see _buildStorylineHeader's onToggleLock).
        async function _toggleStorylineLock() {
            if (!_slLane) return;
            await fetch('/api/cine/lock', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ selector: _slLane.selector, locked: !_slLane.locked }),
            }).catch(e => console.error('Lock toggle:', e));
            await _refresh();
        }

        // ── Header ──
        const _activeNoteForSelf = NbMain.activeNote?.();
        const _selfSel = (_activeNoteForSelf?.type === 'storyline') ? _activeNoteForSelf.selector : '';

        const hdr = _buildStorylineHeader({
            // config is the notebook's own cine: settings block (production
            // company, strip colours, ...) -- it has never had a project
            // field, config?.project is always undefined. The real display
            // name is the storyline note's own title when we're viewing it
            // directly (the common case, hence the same type check as
            // _selfSel); 'Storylines' is a last-resort fallback for contexts
            // with no active storyline note at all (e.g. this board embedded
            // via codeblock on an unrelated note).
            title: (_activeNoteForSelf?.type === 'storyline' ? _activeNoteForSelf.title : '') || 'Storylines',
            activeView: 'board',
            onSwitchView: view => {
                if (view === 'board') return;
                _close();
                el.dataset.query = view === 'script' ? 'storyline-script' : 'storyline-story';
                _loadCineBlock(el);
            },
            zoomSize: size,
            onZoomChange: next => {
                localStorage.setItem(_SL_SIZE_KEY(notebook), next);
                _close();
                _openStorylineOverlay(el, data, notebook, next, project);
            },
            // No onAddStory here -- Board replaces the header "+ Story" pill
            // with a per-lane add button in each plotline row's own sticky
            // label (see _buildLaneRow), which stays reachable while scrolled.
            showOrderControls: !!_slLane,
            orderNames: _ordNames,
            onSaveOrder: _saveOrder,
            onLoadOrder: _loadOrder,
            locked: !!_slLane?.locked,
            onToggleLock: _slLane ? _toggleStorylineLock : undefined,
            onRefresh: _refresh,
            // No onClose -- Esc still closes the overlay via the existing
            // _onEsc listener; the header button was redundant chrome.
            selfSelector: _selfSel,
            notebook,
        });
        overlay.appendChild(hdr);

        // ── Scrollable board area ──
        const overlayBody = document.createElement('div');
        overlayBody.className = 'nb-cine-sl-overlay-body';
        overlay.appendChild(overlayBody);

        board = document.createElement('div');
        board.className = `nb-cine-storylines-board nb-cine-storylines-${size}`;
        overlayBody.appendChild(board);

        const peek = document.createElement('div');
        peek.className = 'nb-cine-card-peek';
        peek.hidden = true;
        overlay.appendChild(peek);

        // ── Card selection ────────────────────────────────────────────────────
        let _selCard = null;

        function _selectCard(card, story) {
            if (_selCard) _selCard.classList.remove('nb-cine-selected');
            _selCard = card;
            card.classList.add('nb-cine-selected');
            peek.hidden = false;
            const color = plotlineLanes.find(l => l.stem === story.plotline)?.color || '';
            const badge = story.plotline
                ? `<span class="nb-cine-peek-badge" style="${color ? `background:${_esc(color)}` : ''}">${_esc(story.plotline)}</span>` : '';
            const desc  = story.meta?.desc
                ? `<div class="nb-cine-peek-desc">${_esc(story.meta.desc)}</div>` : '';
            peek.innerHTML =
                `<div class="nb-cine-card-peek-title">${_esc(story.title)}${badge}</div>${desc}` +
                `<button class="nb-tool-btn nb-cine-peek-open" data-selector="${_esc(story.selector)}">Open ↗</button>`;
            peek.querySelector('.nb-cine-peek-open').addEventListener('click', () => {
                _close();
                NbMain.openNote(story.selector);
            });
        }

        function _deselect() {
            if (_selCard) { _selCard.classList.remove('nb-cine-selected'); _selCard = null; }
            peek.hidden = true;
            peek.innerHTML = '';
        }

        overlayBody.addEventListener('click', e => {
            if (!e.target.closest('.nb-cine-story-card')) _deselect();
        });

        // ── Build lanes ──
        const allLanes       = [...(lanes || [])];
        const storylineLanes = allLanes.filter(l => l.is_storyline);
        const plotlineLanes  = allLanes.filter(l => !l.is_storyline);

        if (!plotlineLanes.length && !storylineLanes.length) {
            board.innerHTML = '<div class="nb-cine-empty">No storylines found — add type:plotline notes to storylines/</div>';
            return;
        }

        // Group story cards by plotline
        const cardsByLane = new Map();
        plotlineLanes.forEach(l => cardsByLane.set(l.stem, []));
        for (const story of (stories || [])) {
            const key = story.plotline || '';
            if (!cardsByLane.has(key)) cardsByLane.set(key, []);
            cardsByLane.get(key).push(story);
        }
        for (const [, cards] of cardsByLane) cards.sort((a, b) => a.seq - b.seq);

        // Promoted items on the main storyline — stories + milestones, in story_seq order
        const promotedStories = [...(stories || [])]
            .filter(s => s.story_seq !== null && s.story_seq !== undefined);
        const promotedMsOnStoryline = [...(data.milestones || [])]
            .filter(m => m.story_seq !== null && m.story_seq !== undefined);
        const promotedAll = [...promotedStories, ...promotedMsOnStoryline]
            .sort((a, b) => a.story_seq - b.story_seq);

        // ── Card builder ──────────────────────────────────────────────────────
        // mode: 'plotline' (default) or 'storyline'
        function _buildCard(story, cardSize = 'small', mode = 'plotline') {
            const card = document.createElement('div');
            card.className = `nb-cine-story-card nb-cine-story-${cardSize}`;
            card.dataset.selector = story.selector;
            card.dataset.plotline = story.plotline || '';
            card.dataset.seq      = story.seq ?? 999;
            if (story.story_seq != null) card.dataset.story_seq = story.story_seq;
            if (story.meta?.desc) card.title = story.meta.desc;

            if (mode === 'plotline' && story.story_seq != null)
                card.classList.add('nb-cine-promoted');

            // Storyline card: apply home plotline's accent colour
            if (mode === 'storyline') {
                const homeLane = plotlineLanes.find(l => l.stem === story.plotline);
                if (homeLane?.color) card.style.setProperty('--lane-color', homeLane.color);
            }

            const titleEl = document.createElement('div');
            titleEl.className = 'nb-cine-story-title';
            titleEl.textContent = story.title;
            const _tc = _resolveTagColor(story, config);
            if (_tc) titleEl.style.color = _tc;
            card.appendChild(titleEl);

            if ((cardSize === 'medium' || cardSize === 'large') && story.meta?.desc) {
                const descEl = document.createElement('div');
                descEl.className = 'nb-cine-story-desc';
                descEl.textContent = story.meta.desc;
                card.appendChild(descEl);
            }

            if ((cardSize === 'medium' || cardSize === 'large') && story.body_preview) {
                const bodyEl = document.createElement('div');
                bodyEl.className = 'nb-cine-story-body-preview';
                bodyEl.textContent = story.body_preview;
                card.appendChild(bodyEl);
            }

            if (cardSize === 'large' && story.scenes?.length) {
                const scenesEl = document.createElement('div');
                scenesEl.className = 'nb-cine-story-scenes';
                scenesEl.innerHTML = story.scenes.map(ref => {
                    if (ref.selector) {
                        return `<button class="nb-cine-link nb-cine-scene-chip"
                            data-selector="${_esc(ref.selector)}">${_esc(ref.ref)}</button>`;
                    }
                    return `<span class="nb-cine-scene-chip nb-cine-scene-unresolved">${_esc(ref.ref)}</span>`;
                }).join('');
                card.appendChild(scenesEl);
            }

            if (cardSize === 'large') {
                const skip = new Set(['title','plotline','storyline','seq','scenes','color','lock','desc','story_seq']);
                const extras = Object.entries(story.meta || {})
                    .filter(([k]) => !skip.has(k) && k !== 'scenes_raw');
                if (extras.length) {
                    const metaEl = document.createElement('dl');
                    metaEl.className = 'nb-cine-story-meta';
                    for (const [k, v] of extras) {
                        if (!v && v !== 0) continue;
                        metaEl.innerHTML +=
                            `<dt>${_esc(k)}</dt><dd>${_esc(String(v).trim())}</dd>`;
                    }
                    if (metaEl.children.length) card.appendChild(metaEl);
                }
            }

            if (mode === 'storyline') {
                const demoteBtn = document.createElement('button');
                demoteBtn.className = 'nb-cine-demote-btn';
                demoteBtn.title = 'Remove from story';
                demoteBtn.textContent = '−';
                demoteBtn.addEventListener('click', async e => {
                    e.stopPropagation();
                    await _demoteCard(story);
                });
                card.appendChild(demoteBtn);
            }

            card.addEventListener('click', e => {
                if (e.target.closest('.nb-cine-link, .nb-cine-demote-btn')) return;
                _selectCard(card, story);
            });
            card.addEventListener('dblclick', e => {
                e.stopPropagation();
                _close();
                NbMain.openNote(story.selector);
            });
            return card;
        }

        // ── Storyline operations ──────────────────────────────────────────────
        async function _resequenceStoryline(cardZone) {
            const moves = [...cardZone.querySelectorAll('.nb-cine-story-card, .nb-cine-milestone-card')].map((card, i) => ({
                selector:  card.dataset.selector,
                plotline:  card.dataset.plotline || '',
                seq:       parseInt(card.dataset.seq) || 0,
                story_seq: i + 1,
            }));
            if (!moves.length) return;
            await fetch('/api/cine/story/resequence', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body:   JSON.stringify({ notebook, moves }),
            }).catch(e => console.error('Storyline resequence:', e));
        }

        async function _demoteCard(story) {
            try {
                await fetch('/api/cine/story/resequence', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body:   JSON.stringify({ notebook, moves: [{
                        selector: story.selector, plotline: story.plotline,
                        seq: story.seq, story_seq: null,
                    }]}),
                });
                await _refresh();
            } catch(e) { alert('Demote failed: ' + e.message); }
        }

        async function _demoteMilestoneFromStoryline(ms) {
            try {
                await fetch('/api/cine/story/resequence', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body:   JSON.stringify({ notebook, moves: [{ selector: ms.selector, story_seq: null }] }),
                });
                await _refresh();
            } catch(e) { alert('Demote failed: ' + e.message); }
        }

        // ── Lane row builder (plotlines only) ────────────────────────────────
        function _buildLaneRow(laneTitle, laneStem, cards, laneSelector) {
            const row = document.createElement('div');
            row.className = 'nb-cine-storyline-row';
            row.dataset.lane = laneStem;

            const label = document.createElement('div');
            label.className = 'nb-cine-lane-label';
            const labelText = document.createElement('span');
            labelText.className = 'nb-cine-lane-label-text';
            labelText.textContent = laneTitle;
            if (laneSelector) {
                label.style.cursor = 'pointer';
                label.title = `Preview ${laneTitle}`;
                label.addEventListener('click', async e => {
                    e.stopPropagation();
                    peek.hidden = false;
                    peek.innerHTML = `<div class="nb-cine-card-peek-title">${_esc(laneTitle)}</div><div>…</div>`;
                    try {
                        const r = await fetch(`/api/note?selector=${encodeURIComponent(laneSelector)}`);
                        const d = await r.json();
                        const body = d.body?.trim();
                        const html = body
                            ? (window.marked?.parse ? window.marked.parse(body) : `<pre>${_esc(body)}</pre>`)
                            : '<em style="opacity:0.45">No body text.</em>';
                        peek.innerHTML =
                            `<div class="nb-cine-card-peek-title">${_esc(d.title || laneTitle)}</div>` +
                            `<div class="nb-rendered">${html}</div>` +
                            `<button class="nb-tool-btn nb-cine-peek-open" data-selector="${_esc(laneSelector)}">Open ↗</button>`;
                        peek.querySelector('.nb-cine-peek-open').addEventListener('click', () => {
                            _close();
                            NbMain.openNote(laneSelector);
                        });
                    } catch { peek.hidden = true; }
                });
            }
            label.appendChild(labelText);

            const cardZone = document.createElement('div');
            cardZone.className = 'nb-cine-lane-cards';
            cards.forEach(s => cardZone.appendChild(_buildCard(s, size, 'plotline')));

            // Add-story button lives in the row's own sticky label (not at the
            // row's end) so it stays reachable when a long lane is scrolled
            // horizontally -- the label is position:sticky; left:0.
            const laneAdd = document.createElement('button');
            laneAdd.className = 'nb-cine-lane-add-hdr'; laneAdd.textContent = '+';
            laneAdd.title = `Add story to ${laneTitle}`;
            laneAdd.addEventListener('click', e => {
                e.stopPropagation();
                _showInlineStoryInput(cardZone, laneStem, notebook, el, size, _refresh, project);
            });
            label.appendChild(laneAdd);

            row.appendChild(label);
            row.appendChild(cardZone);

            return { row, cardZone };
        }

        // ── Storyline lane(s) — sit at top ───────────────────────────────────
        for (const lane of storylineLanes) {
            const row = document.createElement('div');
            row.className = 'nb-cine-storyline-row nb-cine-storyline-main';
            row.dataset.lane = lane.stem;

            const label = document.createElement('div');
            label.className = 'nb-cine-lane-label';
            label.textContent = lane.title;
            row.appendChild(label);

            const cardZone = document.createElement('div');
            cardZone.className = 'nb-cine-lane-cards';
            promotedAll.forEach(item => cardZone.appendChild(
                item.milestone_seq !== undefined
                    ? _buildMilestoneCard(item, 'storyline')
                    : _buildCard(item, size, 'storyline')
            ));
            row.appendChild(cardZone);
            board.appendChild(row);

            if (typeof Sortable !== 'undefined') {
                Sortable.create(cardZone, {
                    group:          { name: 'storyline', pull: true, put: ['plotlines', 'milestones-row'] },
                    animation:      150,
                    forceFallback:  true,
                    fallbackOnBody: true,
                    disabled:       !!_slLane?.locked,
                    onAdd() {
                        // Card arrived from a plotline — it's at the correct DOM position; resequence + rebuild
                        _resequenceStoryline(cardZone).then(_refresh);
                    },
                    onEnd(evt) {
                        // Resequence only when card stayed within the storyline
                        if (evt.to === cardZone) _resequenceStoryline(cardZone);
                    },
                });
            }
        }

        // ── Plotline lanes ───────────────────────────────────────────────────
        for (const lane of plotlineLanes) {
            const cards = cardsByLane.get(lane.stem) || [];
            const { row, cardZone } = _buildLaneRow(lane.title, lane.stem, cards, lane.selector);
            if (lane.color) row.style.setProperty('--lane-color', lane.color);
            board.appendChild(row);

            if (typeof Sortable !== 'undefined') {
                let _demoting = false;
                Sortable.create(cardZone, {
                    group: {
                        name: 'plotlines',
                        pull: to => to.options.group.name === 'storyline' ? 'clone' : true,
                        put:  ['plotlines', 'storyline'],
                    },
                    animation:      150,
                    forceFallback:  true,
                    fallbackOnBody: true,
                    disabled:       !!_slLane?.locked,
                    async onStart(evt) {
                        const sel = evt.item?.dataset?.selector;
                        if (!sel) return;
                        const dragStory = (stories || []).find(s => s.selector === sel);
                        if (dragStory) _selectCard(evt.item, dragStory);
                        peek.hidden = false;
                        peek.innerHTML = '<div class="nb-cine-card-peek-title">…</div>';
                        try {
                            const r = await fetch(`/api/note?selector=${encodeURIComponent(sel)}`);
                            const d = await r.json();
                            const body = d.body?.trim();
                            const html = body
                                ? (window.marked?.parse ? window.marked.parse(body) : `<pre>${_esc(body)}</pre>`)
                                : '<em style="opacity:0.45">No body text.</em>';
                            peek.innerHTML =
                                `<div class="nb-cine-card-peek-title">${_esc(d.title || sel)}</div>` +
                                `<div class="nb-rendered">${html}</div>`;
                        } catch { peek.hidden = true; }
                    },
                    onAdd(evt) {
                        if (evt.from.closest('.nb-cine-storyline-main')) {
                            // Storyline card landed here — demote it
                            _demoting = true;
                            evt.item.remove();
                            const story = promotedStories.find(
                                s => s.selector === evt.item.dataset.selector);
                            if (story) _demoteCard(story);
                            else _refresh();
                        }
                    },
                    onEnd() {
                        peek.hidden = true;
                        if (_demoting) { _demoting = false; return; }
                        _onStoryDrop(el, board, notebook);
                    },
                });
            }
        }

        // ── Milestone row ─────────────────────────────────────────────────────
        const milestones = data.milestones || [];

        function _buildMilestoneCard(ms, mode = 'row') {
            const card = document.createElement('div');
            card.className = 'nb-cine-milestone-card';
            card.dataset.selector     = ms.selector;
            card.dataset.milestoneSeq = ms.milestone_seq ?? '';

            const titleEl = document.createElement('div');
            titleEl.className = 'nb-cine-milestone-title';
            titleEl.textContent = ms.title;
            card.appendChild(titleEl);

            if (ms.body_preview) {
                const bodyEl = document.createElement('div');
                bodyEl.className = 'nb-cine-story-body-preview';
                bodyEl.textContent = ms.body_preview;
                card.appendChild(bodyEl);
            }

            const demoteBtn = document.createElement('button');
            demoteBtn.className = 'nb-cine-demote-btn';
            demoteBtn.title = mode === 'storyline' ? 'Remove from storyline' : 'Remove from timeline';
            demoteBtn.textContent = '−';
            demoteBtn.addEventListener('click', async e => {
                e.stopPropagation();
                if (mode === 'storyline') await _demoteMilestoneFromStoryline(ms);
                else                      await _demoteMilestone(ms);
            });
            card.appendChild(demoteBtn);

            card.addEventListener('click', e => {
                if (e.target.closest('.nb-cine-demote-btn')) return;
                peek.hidden = false;
                peek.innerHTML =
                    `<div class="nb-cine-card-peek-title">${_esc(ms.title)}</div>` +
                    `<button class="nb-tool-btn nb-cine-peek-open" data-selector="${_esc(ms.selector)}">Open ↗</button>`;
                peek.querySelector('.nb-cine-peek-open').addEventListener('click', () => {
                    _close(); NbMain.openNote(ms.selector);
                });
            });
            card.addEventListener('dblclick', e => { e.stopPropagation(); _close(); NbMain.openNote(ms.selector); });

            return card;
        }

        async function _resequenceMilestones(cardZone) {
            const moves = [...cardZone.querySelectorAll('.nb-cine-milestone-card')].map((card, i) => ({
                selector:     card.dataset.selector,
                milestone_seq: i + 1,
            }));
            if (!moves.length) return;
            await fetch('/api/cine/story/resequence', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body:   JSON.stringify({ notebook, moves }),
            }).catch(e => console.error('Milestone resequence:', e));
        }

        async function _demoteMilestone(ms) {
            try {
                await fetch('/api/cine/story/resequence', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body:   JSON.stringify({ notebook, moves: [{
                        selector: ms.selector, milestone_seq: null,
                    }]}),
                });
                await _refresh();
            } catch(e) { alert('Milestone demote failed: ' + e.message); }
        }

        const promotedMilestones = [...milestones]
            .filter(m => m.milestone_seq !== null && m.milestone_seq !== undefined)
            .sort((a, b) => a.milestone_seq - b.milestone_seq);

        // Always show the milestone row (+ button bootstraps the first milestone)
        {
            const msRow = document.createElement('div');
            msRow.className = 'nb-cine-milestone-row';

            const msLabel = document.createElement('div');
            msLabel.className = 'nb-cine-lane-label';
            msLabel.textContent = 'Milestones';
            msRow.appendChild(msLabel);

            const msCardZone = document.createElement('div');
            msCardZone.className = 'nb-cine-lane-cards';
            promotedMilestones.forEach(m => msCardZone.appendChild(_buildMilestoneCard(m)));
            msRow.appendChild(msCardZone);

            const msAdd = document.createElement('button');
            msAdd.className = 'nb-cine-lane-add-end'; msAdd.textContent = '+';
            msAdd.title = 'Add milestone';
            msAdd.addEventListener('click', async e => {
                e.stopPropagation();
                const title = prompt('Milestone title:');
                if (!title?.trim()) return;
                try {
                    const r = await fetch('/api/cine/milestone/create', {
                        method: 'POST', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ notebook, title: title.trim(), project }),
                    });
                    const d = await r.json();
                    if (!d.ok) throw new Error(d.error || 'create failed');
                    await _refresh();
                } catch(err) { alert('Create milestone failed: ' + err.message); }
            });
            msRow.appendChild(msAdd);
            board.appendChild(msRow);

            if (typeof Sortable !== 'undefined') {
                let _msDemoting = false;
                Sortable.create(msCardZone, {
                    group: {
                        name: 'milestones-row',
                        pull: to => to.options.group.name === 'storyline' ? 'clone' : true,
                        put:  true,
                    },
                    animation:      150,
                    forceFallback:  true,
                    fallbackOnBody: true,
                    disabled:       !!_slLane?.locked,
                    onAdd(evt) {
                        if (evt.from.closest('.nb-cine-storyline-main')) {
                            _msDemoting = true;
                            evt.item.remove();
                            const ms = (data.milestones || []).find(
                                m => m.selector === evt.item.dataset.selector);
                            if (ms) _demoteMilestoneFromStoryline(ms);
                            else    _refresh();
                        }
                    },
                    onEnd(evt) {
                        if (_msDemoting) { _msDemoting = false; return; }
                        if (evt.to === msCardZone) _resequenceMilestones(msCardZone);
                    },
                });
            }
        }

        // At min zoom, squeeze row height to fit every lane on screen with no
        // vertical scroll -- but only shrink, never grow past the normal small-
        // zoom row height (80px / 60px milestone row), so a short lane list on
        // a tall screen doesn't get stretched out just because there's room.
        if (size === 'small') {
            const rows    = [...board.querySelectorAll('.nb-cine-storyline-row')];
            const msRow   = board.querySelector('.nb-cine-milestone-row');
            const allRows = msRow ? [...rows, msRow] : rows;
            if (allRows.length) {
                const availH  = overlayBody.clientHeight;
                const perRow  = Math.floor(availH / allRows.length);
                rows.forEach(row => {
                    row.style.minHeight = Math.max(1, Math.min(80, perRow)) + 'px';
                });
                if (msRow) msRow.style.minHeight = Math.max(1, Math.min(60, perRow)) + 'px';
            }
        }

        overlay.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
    }

    async function _onStoryDrop(el, board, notebook) {
        const moves = [];
        board.querySelectorAll('.nb-cine-storyline-row:not(.nb-cine-storyline-main)').forEach(row => {
            const laneStem = row.dataset.lane;
            row.querySelectorAll('.nb-cine-story-card').forEach((card, i) => {
                moves.push({
                    selector:  card.dataset.selector,
                    plotline:  laneStem,
                    seq:       i + 1,
                });
            });
        });

        if (!moves.length) return;

        try {
            const r = await fetch('/api/cine/story/resequence', {
                method:  'POST',
                headers: {'Content-Type': 'application/json'},
                body:    JSON.stringify({ notebook, moves }),
            });
            const d = await r.json();
            if (d.errors?.length) {
                alert(`Resequence partial failure — ${d.errors.length} card(s) not saved:\n` +
                    d.errors.map(e => `${e.selector}: ${e.error}`).join('\n'));
                _bust(notebook);
                _loadCineBlock(el);
            }
        } catch(e) {
            alert('Resequence error: ' + e.message);
            _bust(notebook);
            _loadCineBlock(el);
        }
    }

    // ── Block loader ──────────────────────────────────────────────────────────

    async function _loadCineBlock(el) {
        el.classList.remove('nb-collapsed');
        el.innerHTML = '<span class="nb-spin">⟳</span>';

        const notebook = NbNav.notebook && NbNav.notebook !== '_all'
            ? NbNav.notebook : '';
        if (!notebook) {
            el.innerHTML = '<span class="nb-cine-error">⚠ No notebook selected</span>';
            return;
        }

        const { field, format, filter, codes, arg } = _parseQuery(el.dataset.query || '');
        const _project = (field === 'storyline-board' || field === 'storyline-story' || field === 'storyline-script' || field === 'storyline-note') ? (el.dataset.project || '') : '';

        if (field === 'org') {
            // Pipeline org chart — its own data source (a `.{name}-org.md` heading
            // tree), unrelated to _fetchData's shot/scene/location bundle, so skip
            // it entirely. `org <name>` names which `.{name}-org.md` file to use
            // (e.g. "org cine" -> .cine-org.md) -- defaults to "cine" so a bare
            // `org` (no arg) keeps working. Use the notebook of the note actually
            // displaying this block, not the list panel's notebook (NbNav.notebook)
            // -- same footgun _resolveWikilinkSelector already documents: they
            // diverge on a direct/deep-linked open.
            const activeSel = NbMain.activeSelector() || '';
            const activeNb  = activeSel.includes(':') ? activeSel.split(':')[0] : notebook;
            await _buildCineOrg(el, activeNb, arg || 'cine');
            return;
        }

        let data;
        try {
            data = await _fetchData(notebook, _project);
        } catch (e) {
            el.innerHTML = `<span class="nb-cine-error">⚠ ${_esc(e.message)}</span>`;
            return;
        }
        if (data.error) {
            el.innerHTML = `<span class="nb-cine-error">⚠ ${_esc(data.error)}</span>`;
            return;
        }

        if (field === 'shots' || field === 'shot') {
            if (format === 'strip') {
                _buildStripboard(el, data, filter, notebook);
            } else if (format === 'sheet') {
                _buildShotSheet(el, data, filter, notebook);
            } else if (format && format !== 'line' && format !== 'shot') {
                _buildSubfieldTable(el, data, format, filter, notebook);
            } else {
                _buildShotLine(el, data, filter, notebook);  // shots / shots.line / shot
            }
        } else if (field === 'scenes') {
            _buildSceneIndex(el, data, filter);
        } else if (field === 'storylines') {
            _buildStorylines(el, data, notebook, format || 'small');
        } else if (field === 'storyline-story' || field === 'storyline-script') {
            // Board clicked from the Note view — one-shot, consumed here.
            if (field === 'storyline-story' && localStorage.getItem(_SL_PENDING_BOARD_KEY(notebook))) {
                localStorage.removeItem(_SL_PENDING_BOARD_KEY(notebook));
                const size = localStorage.getItem(_SL_SIZE_KEY(notebook)) || 'small';
                _buildStorylines(el, data, notebook, size);
                _openStorylineOverlay(el, data, notebook, size, _project);
                return;
            }
            // Restore saved view preference — survives Back navigation (which re-renders as story-view)
            if (field === 'storyline-story') {
                const saved = localStorage.getItem(_SL_VIEW_KEY(notebook));
                if (saved === 'script') { el.dataset.query = 'storyline-script'; _loadCineBlock(el); return; }
            }

            const promotedS = [...(data.stories || [])]
                .filter(s => s.story_seq !== null && s.story_seq !== undefined);
            const promotedM = [...(data.milestones || [])]
                .filter(m => m.story_seq !== null && m.story_seq !== undefined);
            const promotedAll = [...promotedS, ...promotedM]
                .sort((a, b) => a.story_seq - b.story_seq);
            const laneColors = new Map((data.lanes || []).map(l => [l.stem, l.color]));

            const size = localStorage.getItem(_SL_SIZE_KEY(notebook)) || 'small';

            el.innerHTML = '';
            const wrap = document.createElement('div');
            wrap.className = (field === 'storyline-script'
                ? 'nb-cine-sl-script-view' : 'nb-cine-sl-story-view') + ` nb-cine-storylines-${size}`;

            const _activeNoteForSelf = NbMain.activeNote?.();
            const _selfSel = (_activeNoteForSelf?.type === 'storyline') ? _activeNoteForSelf.selector : '';
            const _slLaneForLock = (data.lanes || []).find(l => l.is_storyline);

            const hdr = _buildStorylineHeader({
                // See the board overlay's own header for why not config?.project.
                title: (_activeNoteForSelf?.type === 'storyline' ? _activeNoteForSelf.title : '') || 'Storylines',
                activeView: field === 'storyline-script' ? 'script' : 'story',
                onSwitchView: view => {
                    if (view === 'board') {
                        _buildStorylines(el, data, notebook, size);
                        _openStorylineOverlay(el, data, notebook, size, _project);
                        return;
                    }
                    const next = view === 'script' ? 'storyline-script' : 'storyline-story';
                    if (next === field) return;
                    localStorage.setItem(_SL_VIEW_KEY(notebook), view === 'script' ? 'script' : 'story');
                    el.dataset.query = next;
                    _loadCineBlock(el);
                },
                zoomSize: size,
                onZoomChange: next => {
                    localStorage.setItem(_SL_SIZE_KEY(notebook), next);
                    el.dataset.query = field;
                    _loadCineBlock(el);
                },
                onAddStory: () => _showInlineStoryInput(wrap, null, notebook, el, size, () => {
                    el.dataset.query = field;
                    _loadCineBlock(el);
                }, _project),
                showOrderControls: false,
                locked: !!_slLaneForLock?.locked,
                onToggleLock: _slLaneForLock ? async () => {
                    await fetch('/api/cine/lock', {
                        method: 'POST', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ selector: _slLaneForLock.selector, locked: !_slLaneForLock.locked }),
                    }).catch(e => console.error('Lock toggle:', e));
                    _bust(notebook, _project);
                    el.dataset.query = field;
                    _loadCineBlock(el);
                } : undefined,
                onRefresh: () => { _bust(notebook, _project); el.dataset.query = field; _loadCineBlock(el); },
                selfSelector: _selfSel,
                notebook,
            });
            wrap.appendChild(hdr);

            if (!promotedAll.length) {
                const empty = document.createElement('div');
                empty.className = 'nb-cine-empty';
                empty.textContent = 'No stories on the storyline yet — open the board and drag cards up.';
                wrap.appendChild(empty);
            } else if (field === 'storyline-story') {
                const mode = _SL_LEVEL_MODE.story[size] || 'desc';
                (async () => {
                    for (const item of promotedAll) {
                        const isMs = item.milestone_seq !== undefined;
                        if (isMs) {
                            const bar = document.createElement('div');
                            bar.className = 'nb-cine-sl-milestone-bar';
                            bar.textContent = item.title;
                            bar.addEventListener('click', () => NbMain.openNote(item.selector));
                            wrap.appendChild(bar);
                            continue;
                        }
                        const color = laneColors.get(item.plotline) || '';
                        const _tcProse = _resolveTagColor(item, data.config);
                        const _titleStyle = _tcProse ? ` style="color:${_esc(_tcProse)}"` : '';
                        const card = document.createElement('div');
                        card.className = 'nb-cine-sl-story-prose';
                        card.dataset.selector = item.selector;
                        if (color) card.style.borderLeftColor = color;
                        card.innerHTML = `<div class="nb-cine-sl-story-prose-title"${_titleStyle}>${_esc(item.title)}</div>`;
                        const bodyEl = document.createElement('div');
                        bodyEl.className = 'nb-cine-sl-story-body';
                        card.appendChild(bodyEl);
                        card.addEventListener('click', () => NbMain.openNote(item.selector));
                        wrap.appendChild(card);
                        await _slFillBody(bodyEl, item, mode);
                    }
                })();
            } else {
                // storyline-script
                const mode = _SL_LEVEL_MODE.script[size] || 'desc';
                (async () => {
                    for (const item of promotedAll) {
                        const isMs = item.milestone_seq !== undefined;
                        if (isMs) {
                            const bar = document.createElement('div');
                            bar.className = 'nb-cine-sl-script-milestone';
                            bar.textContent = item.title;
                            bar.addEventListener('click', () => NbMain.openNote(item.selector));
                            wrap.appendChild(bar);
                            continue;
                        }
                        const block = document.createElement('div');
                        block.className = 'nb-cine-sl-script-story';
                        const titleEl = document.createElement('div');
                        titleEl.className = 'nb-cine-sl-script-story-title';
                        titleEl.textContent = item.title;
                        const _tcScript = _resolveTagColor(item, data.config);
                        if (_tcScript) titleEl.style.color = _tcScript;
                        titleEl.addEventListener('click', () => NbMain.openNote(item.selector));
                        block.appendChild(titleEl);
                        const bodyEl = document.createElement('div');
                        bodyEl.className = 'nb-rendered';
                        block.appendChild(bodyEl);
                        wrap.appendChild(block);
                        await _slFillBody(bodyEl, item, mode);
                    }
                })();
            }
            el.appendChild(wrap);
        } else if (field === 'storyline-board') {
            const size = localStorage.getItem(_SL_SIZE_KEY(notebook)) || 'small';
            _buildStorylines(el, data, notebook, size);
            _openStorylineOverlay(el, data, notebook, size, _project);
        } else if (field === 'storyline-note') {
            const activeNote = NbMain.activeNote();
            const _slLaneForLock = (data.lanes || []).find(l => l.is_storyline);

            el.innerHTML = '';
            const wrap = document.createElement('div');
            wrap.className = 'nb-cine-sl-note-view';

            const hdr = _buildStorylineHeader({
                // See the board overlay's own header for why not config?.project.
                title: activeNote?.title || 'Storylines',
                activeView: null, // none of Board/Story/Script is "active" while viewing the note itself
                onSwitchView: view => {
                    if (view === 'board') {
                        localStorage.setItem(_SL_PENDING_BOARD_KEY(notebook), '1');
                    } else {
                        localStorage.setItem(_SL_VIEW_KEY(notebook), view === 'script' ? 'script' : 'story');
                    }
                    localStorage.setItem(`nb-render-mode:${notebook}`, 'storyline-story');
                    NbMain.openNote(activeNote.selector);
                },
                showZoom: false, // card-size has no meaning for plain body text
                onAddStory: () => _showInlineStoryInput(wrap, null, notebook, el, 'small', () => {
                    el.dataset.query = 'storyline-note';
                    _loadCineBlock(el);
                }, _project),
                showOrderControls: false,
                locked: !!_slLaneForLock?.locked,
                onToggleLock: _slLaneForLock ? async () => {
                    await fetch('/api/cine/lock', {
                        method: 'POST', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ selector: _slLaneForLock.selector, locked: !_slLaneForLock.locked }),
                    }).catch(e => console.error('Lock toggle:', e));
                    _bust(notebook, _project);
                    el.dataset.query = 'storyline-note';
                    _loadCineBlock(el);
                } : undefined,
                onRefresh: () => { _bust(notebook, _project); el.dataset.query = 'storyline-note'; _loadCineBlock(el); },
                selfSelector: activeNote?.selector || '',
                notebook,
            });
            wrap.appendChild(hdr);

            const bodyWrap = document.createElement('div');
            bodyWrap.className = 'nb-rendered';
            const body = (activeNote?.body || '').trim();
            bodyWrap.innerHTML = body
                ? NbMain.renderMarkdown(body, activeNote.selector)
                : '<div class="nb-cine-empty">This storyline has no written description yet.</div>';
            wrap.appendChild(bodyWrap);

            el.appendChild(wrap);
        } else if (format && ['actor','location','resource'].includes(field)) {
            _buildFieldLookup(el, data, field, format, codes);
        } else {
            el.innerHTML = `<span class="nb-cine-error">unknown cine query: ${_esc(field + (format ? '.'+format : ''))}</span>`;
            return;
        }

        // Wire link clicks (renderers also wire their own, this catches any stragglers)
        el.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
    }

    // ── Org chart (pipeline) ─────────────────────────────────────────────────
    // Tree source = recursive markdown headings in a `.{name}-org.md` file, not
    // a filesystem walk (unlike core `cfg org`, which this reuses the
    // *technique* of, not the code — see
    // claude:nbweb-cine_navigation_org_chart_design_2026-08-01.md). A heading
    // is always a node. Wikilinked -> clickable, points at a real note. Plain
    // text -> inert, "planned but not written yet". Per-heading content
    // grammar (PHASE/QUERY structured fields, bare-text caption, `-` comment)
    // is documented just below, next to the parser that implements it.

    const _CINE_WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/;

    // Per-heading content grammar (2026-08-03 formalization, PHASE renamed
    // from CODE 2026-08-03 -- "code" was never actually generic, every use of
    // it in the design was specifically "phase code"; PHASE makes the match
    // against a hosting note's own `phase:` frontmatter legible from the
    // syntax alone instead of requiring someone to already know the two are
    // linked):
    //   "> FIELD: value"  -- structured field (PHASE, QUERY today). PHASE is
    //     first-occurrence-wins (a node has exactly one phase). QUERY instead
    //     accumulates -- a node can carry N readiness checks, every `> QUERY:`
    //     line appended in document order to `node.queries[]`; any one of them
    //     failing marks the node not-ready (2026-08-07, see _evalQueries).
    //     Machine-only -- never shown anywhere.
    //   bare text / paragraphs -- accumulated, in order, into `caption`,
    //     which becomes the node's tooltip. Markdown syntax may appear but
    //     isn't rendered (native SVG <title>, plain text only) -- accepted
    //     for now, no styled-tooltip build yet.
    //   "- list item" -- comment. Ignored entirely: not stored, not shown
    //     anywhere, author-only scratch space when reading the raw file.
    //   A malformed "> ..." (unrecognized field name, or no colon at all)
    //     falls through into `caption` instead of being silently dropped --
    //     a typo becomes visible in the tooltip, not a silent no-op.
    const _ORG_FIELD_RE = /^(PHASE|QUERY):\s*(.*)$/;

    function _parseOrgSource(body) {
        const lines = (body || '').split('\n');
        const root = { level: 0, label: '', wikiTarget: null, milestone: false, queries: [], phase: null, caption: '', children: [] };
        const stack = [root];

        for (const raw of lines) {
            const hm = /^(#{1,6})\s+(.*)$/.exec(raw);
            if (hm) {
                const level = hm[1].length;
                const text  = hm[2].trim();
                const wm = _CINE_WIKILINK_RE.exec(text);
                const node = {
                    level,
                    label:      wm ? (wm[2] || wm[1]).trim() : text,
                    wikiTarget: wm ? wm[1].trim() : null,
                    milestone:  /🚩/.test(text),
                    queries:    [],
                    phase:      null,
                    caption:    '',
                    children:   [],
                };
                while (stack.length > 1 && stack[stack.length - 1].level >= level) stack.pop();
                stack[stack.length - 1].children.push(node);
                stack.push(node);
                continue;
            }
            const owner = stack[stack.length - 1];
            if (owner === root) continue;
            const trimmed = raw.trim();
            if (!trimmed) continue;                    // blank line -- no caption noise
            if (/^-\s+/.test(trimmed)) continue;        // comment -- never stored

            if (trimmed.startsWith('>')) {
                const rest = trimmed.slice(1).trim();
                const fm = _ORG_FIELD_RE.exec(rest);
                if (fm) {
                    const [, field, value] = fm;
                    if (field === 'PHASE' && owner.phase === null) owner.phase = value.trim();
                    if (field === 'QUERY') owner.queries.push(value.trim());
                    continue;
                }
                owner.caption += (owner.caption ? '\n' : '') + rest;
                continue;
            }
            owner.caption += (owner.caption ? '\n' : '') + trimmed;
        }
        return root;
    }

    // ── Query matcher (readiness checks) ─────────────────────────────────────
    // Faithful port of _fm_eval_one/_front_matches (app.py) -- the real fm
    // filter grammar, not the simplified eq/exists/empty-only version this
    // used to have before the whole status-query mechanism was removed for a
    // performance reason (adedfd3, 2026-08-02) and never restored until now
    // (2026-08-07). One QUERY string is a space-separated set of
    // "field:value" tokens ANDed together (comma *inside* one token's value
    // means anyof for that field, same as _parse_fm_scope -- not an
    // AND-separator the way the old removed matcher used comma). A node's
    // queries[] are themselves ANDed -- any one failing marks the node
    // not-ready. sort:/limit: aren't special-cased here unlike
    // _parse_fm_scope -- those are list-query directives with no meaning
    // when matching a single note's own meta.
    const _QUERY_TOKEN_RE = /(-)?(\w[\w.-]*):"([^"]*)"|(-)?(\w[\w.-]*):(\S*)/g;

    function _fmCompare(a, b, op) {
        const an = Number(a), bn = Number(b);
        if (a !== '' && b !== '' && !Number.isNaN(an) && !Number.isNaN(bn)) {
            return op === '>' ? an > bn : an < bn;
        }
        return op === '>' ? String(a) > String(b) : String(a) < String(b);
    }

    function _fmEvalOne(meta, field, op, value) {
        if (op === 'exists') return field in meta;
        if (op === 'empty') { const v = meta[field]; return v == null || !String(v).trim(); }
        if (op === 'anyof') {
            const v = meta[field];
            if (v == null) return false;
            const values = new Set(value.map(x => String(x).toLowerCase()));
            return values.has(String(v).toLowerCase());
        }
        if (op === '>' || op === '<') {
            const v = meta[field];
            if (v == null) return false;
            return _fmCompare(String(v), String(value), op);
        }
        const v = meta[field];  // eq
        if (v == null) return false;
        return String(v).toLowerCase() === String(value).toLowerCase();
    }

    function _parseQueryFilters(queryStr) {
        const filters = [];
        _QUERY_TOKEN_RE.lastIndex = 0;
        let m;
        while ((m = _QUERY_TOKEN_RE.exec(queryStr || ''))) {
            if (m[2] !== undefined) {
                filters.push({ field: m[2], op: m[3] === '' ? 'empty' : 'eq', value: m[3], neg: !!m[1] });
            } else {
                const field = m[5], value = m[6], neg = !!m[4];
                if (value[0] === '>' || value[0] === '<') {
                    filters.push({ field, op: value[0], value: value.slice(1), neg });
                } else if (value.includes(',')) {
                    filters.push({ field, op: 'anyof', value: value.split(','), neg });
                } else {
                    filters.push({ field, op: value === '' ? 'exists' : 'eq', value, neg });
                }
            }
        }
        return filters;
    }

    function _matchesQuery(meta, queryStr) {
        const filters = _parseQueryFilters(queryStr);
        // Zero parseable conditions never vacuously passes -- the exact bug
        // found and fixed once already in the removed implementation's own
        // history (adedfd3), a query with nothing real in it must not read
        // as "done."
        if (!filters.length) return false;
        for (const f of filters) {
            if (_fmEvalOne(meta, f.field, f.op, f.value) === f.neg) return false;
        }
        return true;
    }

    // { allPass, failing: [queryStr, ...] } across every QUERY on the node.
    // wordcount/linecount mirror _scan_file's pseudo-fields (app.py) -- not
    // present on /api/note's response, so computed here from the note's real
    // body before matching (this is what makes "wordcount:>20" work with zero
    // new syntax).
    function _evalQueries(queries, meta, body) {
        if (!queries || !queries.length) return { allPass: true, failing: [] };
        const trimmed = (body || '').trim();
        // linecount mirrors Python's str.splitlines() (app.py's _scan_file) --
        // a single trailing newline isn't counted as an extra blank line, and
        // an empty body is 0 lines, not 1.
        const b = body || '';
        const linecount = b === '' ? 0 : b.replace(/\n$/, '').split('\n').length;
        const withPseudo = { ...meta,
            wordcount: String(trimmed ? trimmed.split(/\s+/).length : 0),
            linecount: String(linecount) };
        const failing = queries.filter(q => !_matchesQuery(withPseudo, q));
        return { allPass: failing.length === 0, failing };
    }

    function _findNodeByPhase(node, phase) {
        if (node.phase === phase) return node;
        for (const c of (node.children || [])) {
            const found = _findNodeByPhase(c, phase);
            if (found) return found;
        }
        return null;
    }

    // Manual regen, folded into the header's own "↻ Refresh" rather than a
    // separate button -- covers the case the new auto-regen-on-save hook
    // doesn't (app.py's api_edit_note): a source edited via `nb edit`/direct
    // file write, or the generator script itself changed since the cache was
    // last built. Best-effort -- a failed/missing regen just means the
    // following re-render falls back to live per-node resolution, same as
    // an always-stale cache would; never blocks or errors the refresh itself.
    async function _regenOrgSource(notebook, orgSource) {
        try {
            await fetch('/api/regen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notebook, script: '.tools/gen-org.py', args: [orgSource] }),
            });
        } catch { /* best-effort */ }
    }

    async function _buildCineOrg(el, notebook, orgSource = 'cine') {
        el.innerHTML = '<span class="nb-spin">⟳</span>';

        const sourceFile = `.${orgSource}-org.md`;
        const cacheFile   = `.${orgSource}-org-cache.json`;

        let body, tagColorLegend = false, orgSourceTitle = sourceFile;
        const orgSourceSelector = notebook + ':' + sourceFile;
        try {
            const r = await fetch(`/api/note?selector=${encodeURIComponent(orgSourceSelector)}`);
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            body = d.body || '';
            tagColorLegend = d.meta?.tag_color_legend === true;
            orgSourceTitle = d.meta?.title || sourceFile;
        } catch (e) {
            el.innerHTML = `<span class="nb-cine-error">⚠ ${_esc(sourceFile)} not found — ${_esc(e.message)}</span>`;
            return;
        }

        // Cache-first: Takeout/.tools/gen-org.py <name> pre-resolves every
        // wikilink + phase color and writes .{name}-org-cache.json (own
        // notebook data, not tracked with the plugin code). If it's present
        // and its recorded source length still matches this fetch, use its
        // tree directly -- already has `.selector`/`.phaseColor` baked in, no
        // resolution needed at all. UTF-8 byte length, not body.length -- JS
        // string length counts UTF-16 code units (two per emoji; this file's
        // milestone headings have several) while the generator (Python)
        // counts code points, so plain .length would never match.
        let root = null;
        try {
            const cr = await fetch(`/api/file?selector=${encodeURIComponent(notebook + ':' + cacheFile)}`);
            if (cr.ok) {
                const cache = await cr.json();
                const liveLen = new TextEncoder().encode(body).length;
                if (cache.sourceLength === liveLen) root = cache.tree;
            }
        } catch { /* no cache, or unreadable -- fall through to live parse */ }

        if (!root) root = _parseOrgSource(body);

        // Notebook-level tag_color: map ({tagname: color}) -- top-level key in
        // .<notebook>.md, not the `cine:`-scoped config block (that's what
        // _resolveTagColor's `config.tag_colors` reads, and no notebook
        // actually puts this map there). Fetched once per render, not per
        // node. A string value (a different, unrelated single-color fallback
        // feature elsewhere in nb-web) doesn't apply here -- only a real dict
        // does.
        let tagColorMap = {};
        try {
            const ncr = await fetch(`/api/nb/notebook-config?notebook=${encodeURIComponent(notebook)}`);
            const nc  = await ncr.json();
            const tc  = nc.meta?.tag_color;
            if (tc && typeof tc === 'object' && !Array.isArray(tc)) tagColorMap = tc;
        } catch { /* no config -- tag stripes just won't resolve live (cache may still have them) */ }

        // Wikilink resolution is lazy from here on when there's no cache --
        // neither the initial render nor phase scoping needs a node's real
        // selector (scoping matches on `.phase`, parsed straight from the
        // file, no network involved). Resolving all ~60 nodes eagerly up
        // front was a real, needless bottleneck; a click resolves its own
        // target on demand instead. (Status-query fetching was here too at
        // one point -- removed; that mechanism was only ever designed, never
        // actually built.)


        // Phase scoping: the hosting note's own `phase:` frontmatter, self-declared,
        // no inheritance. A local override (el.dataset) lets the "up" button show
        // the full map without touching the note's actual frontmatter.
        const forceFull = el.dataset.cineOrgForceFull === '1';
        const phase = forceFull ? null : (NbMain.activeNote()?.meta?.phase || null);
        let displayRoot = root.children[0] || root;
        let scoped = false;
        if (phase) {
            const match = _findNodeByPhase(root, phase);
            if (match) { displayRoot = match; scoped = true; }
        }

        _cineOrgRender(el, displayRoot, {
            scoped, notebook, tagColorMap, orgSource, tagColorLegend,
            orgSourceTitle, orgSourceSelector,
            // A phase's real structural parent is always this same synthetic
            // top-level node (level 1, one above every phase) -- the "mother
            // ship" `cfg org` floats above its own root, same technique.
            motherShip: scoped ? (root.children[0] || null) : null,
            onUp: () => { el.dataset.cineOrgForceFull = '1'; _buildCineOrg(el, notebook, orgSource); },
        });
    }

    // Help popover -- same look/behavior as _configHelpPopover (cfg org's own),
    // just cine-specific content. Toggles off on a second click or a click away.
    function _cineOrgHelpPopover(trigger) {
        if (trigger._helpPop) { trigger._helpPop.remove(); trigger._helpPop = null; return; }
        const pop = document.createElement('div');
        pop.className = 'nb-config-help-pop';
        pop.innerHTML =
            `<strong>Org Chart</strong> — navigates a production's whole pipeline as a tree, by ` +
            `concept (phase → step) rather than by file/folder.<br><br>` +
            '<code>```cine\norg &lt;name&gt;\n```</code> &nbsp;— renders <code>.&lt;name&gt;-org.md</code> ' +
            '(bare <code>org</code> defaults to <code>cine</code>)<br><br>' +
            `Full map: 6 phase columns. Add <code>phase: &lt;code&gt;</code> to a note's own ` +
            `frontmatter to scope its chart to just that phase (a floating node above links back ` +
            `to the full map).<br><br>` +
            `Left-edge stripe(s) = this node's own <code>tags:</code>/<code>tag_color:</code>. ` +
            `<code>tag_color_legend: true</code> on the org-source note shows the key.<br><br>` +
            `<a href="#" onclick="NbMain.openNote('claude:nbweb-cine_navigation_org_chart_design_2026-08-01.md');return false">Full design notes →</a>`;
        const rect = trigger.getBoundingClientRect();
        pop.style.cssText =
            `position:fixed;z-index:9000;top:${rect.bottom+4}px;right:${window.innerWidth-rect.right}px;` +
            `background:var(--bg2);border:1px solid var(--border);border-radius:6px;` +
            `padding:10px 14px;box-shadow:0 4px 20px rgba(0,0,0,.5);max-width:320px;font-size:0.82em;line-height:1.6`;
        document.body.appendChild(pop);
        trigger._helpPop = pop;
        trigger.classList.add('nb-hl-btn-active');
        const away = e => {
            if (!pop.contains(e.target) && e.target !== trigger) {
                pop.remove(); trigger._helpPop = null;
                trigger.classList.remove('nb-hl-btn-active');
                document.removeEventListener('click', away, true);
            }
        };
        setTimeout(() => document.addEventListener('click', away, true), 0);
    }

    // ── Org chart — SVG renderer ─────────────────────────────────────────────
    // Same technique as core `cfg org` (auto-layout tree, curved SVG edges,
    // tint overlay, click-to-navigate, pan/zoom) -- reimplemented here rather
    // than shared, since cine stays a self-contained plugin.
    function _cineOrgRender(el, tree, opts = {}) {
        const { scoped, notebook, onUp, tagColorMap, orgSource, tagColorLegend, motherShip,
                orgSourceTitle, orgSourceSelector } = opts;
        el.innerHTML = '';

        // Shared barblock header convention -- same factory every core codeblock
        // (cfg, nb, git, fm, ...) already uses, instead of this block's own
        // hand-rolled header markup. Gets collapse-toggle (header click, or the
        // `nb-collapse-zone` class on any child) and the "?" help button for free.
        const { hdr, meta, acts } = NbWeb.buildBarHeader(el, {
            lang: 'cine', cls: 'cine-org', collapseZone: true,
            onRefresh: async () => { await _regenOrgSource(notebook, orgSource); _buildCineOrg(el, notebook, orgSource); },
            onHelp: _cineOrgHelpPopover,
        });
        meta.innerHTML = 'Org Chart - <a href="#" class="nb-cine-org-source-link"></a>';
        const sourceLink = meta.querySelector('a');
        sourceLink.textContent = orgSourceTitle || orgSource;
        sourceLink.addEventListener('click', e => {
            e.preventDefault(); e.stopPropagation();
            NbMain.openNote(orgSourceSelector);
        });
        if (scoped) {
            const upBtn = document.createElement('button');
            upBtn.className = 'nb-tw-btn'; upBtn.title = 'Show full map'; upBtn.textContent = '↑';
            upBtn.addEventListener('click', e => { e.stopPropagation(); onUp(); });
            acts.insertBefore(upBtn, acts.firstChild);  // leftmost of the actions group; help/refresh keep their usual relative order to the right of it
        }
        el.appendChild(hdr);
        NbWeb.initCollapseToggle(el);

        if (!tree) {
            el.insertAdjacentHTML('beforeend', '<div class="nb-cine-empty">No pipeline data found</div>');
            return;
        }

        const NW = 128, NH = 26, PAD = 14, PAD_BOT = 24;

        // Two layouts, not one -- they solve different shapes of tree:
        //   - Full map (unscoped): `tree`'s children (the 6 phases) are wide
        //     and shallow -- a plain node-link tree would make each phase's
        //     ~10-13 children fan out sideways (too wide) or share one global
        //     vertical stack (too tall, what this used to do). Instead: phases
        //     become column headers, each with its own direct children as a
        //     flat top-down list. Capped at exactly 3 levels (root/phase/step)
        //     -- a 4th-level heading (real in the data, see the "for science"
        //     test heading) simply doesn't fit a column header's list and is
        //     not drawn here.
        //   - Scoped (one phase): already just one phase's own subtree, not
        //     wide enough to need columns, and depth *does* matter here (a
        //     step's own sub-heading, e.g. "Print treatment" under "Write
        //     Treatment", should still show) -- so this keeps the original
        //     node-link tree layout, unbounded depth.
        const drawDepthCap = scoped ? Infinity : 3;  // 1=root, 2=phase, 3=step

        if (scoped) {
            const GX = 44, GY = 4;
            const _measure = node => {
                if (!node.children?.length) { node._h = NH; return; }
                node.children.forEach(_measure);
                const total = node.children.reduce((s, c) => s + c._h, 0) + GY * (node.children.length - 1);
                node._h = Math.max(NH, total);
            };
            const _place = (node, x, cy) => {
                node._x = x; node._y = cy - NH / 2;
                if (!node.children?.length) return;
                let top = cy - node._h / 2;
                for (const c of node.children) { _place(c, x + NW + GX, top + c._h / 2); top += c._h + GY; }
            };
            _measure(tree);
            _place(tree, PAD, PAD + tree._h / 2);

            // Mother-ship node -- same technique as `cfg org`'s own floating
            // global-config node: detached from the drawn tree, positioned just
            // above the scoped root, sharing its X. If there isn't enough
            // headroom (a short subtree centers its root close to PAD), shift
            // the whole tree down instead of letting the mother ship go
            // negative -- same fallback `cfg org` uses.
            if (motherShip) {
                motherShip._x = PAD;
                motherShip._y = tree._y - NH - 12;
                if (motherShip._y < PAD) {
                    const dy = PAD - motherShip._y;
                    (function _shiftY(node) {
                        node._y += dy;
                        (node.children || []).forEach(_shiftY);
                    })(tree);
                    motherShip._y = PAD;
                }
            }
        } else {
            const COL_GAP = 30, GY = 6, HEADER_GAP = 24;
            const ROOT_Y = PAD, HDR_Y = PAD + NH + HEADER_GAP, KIDS_Y = HDR_Y + NH + HEADER_GAP;
            const columns = tree.children || [];
            let colX = PAD;
            columns.forEach(col => {
                col._x = colX; col._y = HDR_Y;
                (col.children || []).forEach((step, i) => {
                    step._x = colX; step._y = KIDS_Y + i * (NH + GY);
                });
                colX += NW + COL_GAP;
            });
            const totalW = colX - COL_GAP - PAD;
            tree._x = PAD + totalW / 2 - NW / 2;
            tree._y = ROOT_Y;
        }

        function _maxX(node, depth) {
            let m = node._x + NW;
            if (depth < drawDepthCap) for (const c of (node.children || [])) m = Math.max(m, _maxX(c, depth + 1));
            return m;
        }
        function _maxY(node, depth) {
            let m = node._y + NH;
            if (depth < drawDepthCap) for (const c of (node.children || [])) m = Math.max(m, _maxY(c, depth + 1));
            return m;
        }
        const svgW = _maxX(tree, 1) + PAD;
        const svgH = _maxY(tree, 1) + PAD_BOT;

        const NS  = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'nb-cine-org-svg');

        function _drawEdges(node, depth) {
            if (depth >= drawDepthCap) return;
            for (const c of (node.children || [])) {
                const edge = document.createElementNS(NS, 'path');
                let d;
                if (scoped) {
                    const x1 = node._x + NW, y1 = node._y + NH / 2;
                    const x2 = c._x,         y2 = c._y  + NH / 2;
                    const mx = (x1 + x2) / 2;
                    d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
                } else {
                    const x1 = node._x + NW / 2, y1 = node._y + NH;
                    const x2 = c._x + NW / 2,    y2 = c._y;
                    const my = (y1 + y2) / 2;
                    d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
                }
                edge.setAttribute('d', d);
                edge.setAttribute('fill', 'none');
                edge.setAttribute('class', 'nb-cine-org-edge');
                svg.appendChild(edge);
                _drawEdges(c, depth + 1);
            }
        }

        // Left-edge stripe(s) -- one thin rect per resolved tag color, packed
        // tight against the node's left edge, in tag order (dedup'd). Separate
        // visual channel from phase-color (stroke): "a left-edge strip=
        // arbitrary per-note tag_color:" per the org chart's own design note.
        // Plain rects, not clipped to the parent's rounded corners (rx=5) --
        // a minor cosmetic overlap at the very top/bottom-left pixel, not
        // worth a clip-path for a first pass.
        function _drawTagStripe(g, pairs) {
            g.querySelectorAll('.nb-cine-org-tagstripe').forEach(n => n.remove());
            const stripeW = 3;
            // A hard-left-edge stripe visually fuses with the node's own border
            // stroke (phase color or default) -- offset by one stripe-width's
            // worth of empty space first so the real colors start a hair in
            // from the edge instead of sitting flush against it.
            pairs.forEach(({ color }, i) => {
                const s = document.createElementNS(NS, 'rect');
                s.setAttribute('x', (i + 1) * stripeW);
                s.setAttribute('y', 0);
                s.setAttribute('width', stripeW);
                s.setAttribute('height', NH);
                s.setAttribute('class', 'nb-cine-org-tagstripe');
                s.style.fill = color;
                g.appendChild(s);
            });
        }

        // Readiness glyph -- the 4th visual channel (stroke-style=clickability,
        // stroke-color=phase, left-stripe=tags, this=readiness), a small dot in
        // the node's top-right corner. Never drawn for a node with zero
        // queries[] -- most nodes (today, ~44 of ~60) have none, and lumping
        // "no query defined" in with "failing" would misrepresent most of the
        // chart as incomplete. Takes the whole node (not just queryStatus) so
        // it can make that distinction itself.
        function _drawQueryGlyph(g, node) {
            g.querySelectorAll('.nb-cine-org-query-glyph').forEach(n => n.remove());
            if (!node.queries?.length || !node.queryStatus) return;
            const pass = node.queryStatus.allPass;
            const grp = document.createElementNS(NS, 'g');
            grp.setAttribute('class', 'nb-cine-org-query-glyph ' + (pass ? 'nb-cine-org-query-pass' : 'nb-cine-org-query-fail'));
            const cx = NW - 9, cy = 9;
            const dot = document.createElementNS(NS, 'circle');
            dot.setAttribute('cx', cx); dot.setAttribute('cy', cy); dot.setAttribute('r', 7);
            grp.appendChild(dot);
            const glyph = document.createElementNS(NS, 'text');
            glyph.setAttribute('x', cx); glyph.setAttribute('y', cy + 3.5);
            glyph.setAttribute('text-anchor', 'middle');
            glyph.textContent = pass ? '✓' : '!';
            grp.appendChild(glyph);
            const tip = document.createElementNS(NS, 'title');
            tip.textContent = pass ? 'Ready' : `Not ready — click resolves anyway. Failing: ${node.queryStatus.failing.join('; ')}`;
            grp.appendChild(tip);
            g.appendChild(grp);
        }

        // tag_color_legend: true (org-source frontmatter) -- a compact legend of
        // whatever tags actually resolved to a color *in this rendered tree*, not
        // the full notebook tag_color: map (a phase-scoped view showing every
        // configured tag, most unused here, would just be clutter). Rebuilt
        // (not just appended to) each call, since the live-fetch tag-resolution
        // pass discovers more nodes after the first paint and needs to refresh it.
        function _collectTagLegend(node, into) {
            for (const p of (node.tagColors || [])) {
                if (p && p.tag && !into.has(p.tag)) into.set(p.tag, p.color);
            }
            for (const c of (node.children || [])) _collectTagLegend(c, into);
        }
        function _renderTagLegend(container, rootNode) {
            const legend = new Map();
            _collectTagLegend(rootNode, legend);
            let box = container.querySelector('.nb-cine-org-legend');
            if (!legend.size) { if (box) box.remove(); return; }
            if (!box) {
                box = document.createElement('div');
                box.className = 'nb-cine-org-legend';
                container.appendChild(box);
            }
            box.innerHTML = '';
            for (const [tag, color] of legend) {
                const row = document.createElement('div');
                row.className = 'nb-cine-org-legend-row';
                const sw = document.createElement('span');
                sw.className = 'nb-cine-org-legend-swatch';
                sw.style.background = color;
                row.appendChild(sw);
                row.appendChild(document.createTextNode(tag));
                box.appendChild(row);
            }
        }

        // Non-blocking readiness offer, fired from a failing-query node's click
        // handler below. Never gates navigation -- the design's own standing
        // invariant ("every node is clickable in any order, always") stays
        // true: filled in or not, saved or not, dismissed any way, the click
        // always still resolves to the target note afterward. Silently does
        // nothing if the target's folder has no constraints: schema at all --
        // no dead-end dialog for a folder that never declared one, and a
        // wordcount-style failure has no corresponding field to offer either.
        async function _maybeOfferCompletion(sel) {
            let note;
            try {
                note = await fetch(`/api/note?selector=${encodeURIComponent(sel)}`).then(r => r.json());
            } catch { return; }
            if (note.error) return;
            await NbWeb.openFieldsModal?.(note, {
                title: `✓ Complete this note — <em>${_esc(note.meta?.title || note.filename || '')}</em>`,
                silentIfEmpty: true,
            });
        }

        function _drawNode(node, depth) {
            const g = document.createElementNS(NS, 'g');
            g.setAttribute('transform', `translate(${node._x},${node._y})`);
            const cls = ['nb-cine-org-node'];
            if (!node.wikiTarget) cls.push('nb-cine-org-inert');
            if (node.milestone)   cls.push('nb-cine-org-milestone');
            g.setAttribute('class', cls.join(' '));

            const tip = document.createElementNS(NS, 'title');
            tip.textContent = node.label + (node.caption ? `\n${node.caption}` : '');
            g.appendChild(tip);

            const rect = document.createElementNS(NS, 'rect');
            rect.setAttribute('width', NW); rect.setAttribute('height', NH); rect.setAttribute('rx', 5);
            rect.setAttribute('class', 'nb-cine-org-rect');
            // Phase color as outline, not fill (fill's reserved for progress/status
            // later). Set via inline style, not a `stroke` attribute -- an SVG
            // presentation attribute always loses to a stylesheet rule (the
            // `.nb-cine-org-rect` CSS above sets `stroke` too), regardless of
            // selector specificity; only an inline style (or !important) can win.
            // Milestones still get their own look from the CSS class alone, since
            // this only ever fires for non-milestone nodes.
            if (node.phaseColor && !node.milestone) rect.style.stroke = node.phaseColor;
            g.appendChild(rect);
            node._g = g;

            // Cache-hit case: gen-cine-org.py already resolved this node's tag
            // stripe colors offline. Live/no-cache case is filled in later by
            // the background pass below _drawNode's own call site.
            if (node.tagColors?.length && !node.milestone) _drawTagStripe(g, node.tagColors);
            if (!node.milestone) _drawQueryGlyph(g, node);

            const label = document.createElementNS(NS, 'text');
            label.setAttribute('x', NW / 2); label.setAttribute('y', NH / 2 + 4);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('class', 'nb-cine-org-label');
            const maxCh = 16;
            const raw = (node.milestone ? '🚩 ' : '') + node.label;
            label.textContent = raw.length > maxCh ? raw.slice(0, maxCh - 1) + '…' : raw;
            g.appendChild(label);

            if (node.wikiTarget) {
                // Already resolved if this came from the cache; otherwise resolved
                // lazily on click rather than pre-fetched for every node up front.
                g.style.cursor = 'pointer';
                g.addEventListener('click', async () => {
                    const sel = node.selector || await NbMain.resolveWikilinkSelector(node.wikiTarget);
                    node.selector = sel;
                    if (node.queries?.length) {
                        let status = node.queryStatus;
                        if (!status) {
                            // Background walk hasn't reached this node yet --
                            // best-effort resolve at click time rather than let
                            // readiness silently no-op on a fast first click.
                            try {
                                const r = await fetch(`/api/note?selector=${encodeURIComponent(sel)}`);
                                const d = await r.json();
                                status = _evalQueries(node.queries, d.meta || {}, d.body || '');
                                node.queryStatus = status;
                            } catch { status = null; }
                        }
                        if (status && !status.allPass) await _maybeOfferCompletion(sel);
                    }
                    NbMain.openNote(sel);
                });
            }

            svg.appendChild(g);
            if (depth < drawDepthCap) for (const c of (node.children || [])) _drawNode(c, depth + 1);
        }

        // Mother-ship node: drawn above the scoped tree with a short straight
        // drop edge, same as cfg org's floating global node. Children hidden
        // (saved/restored) while drawing it standalone -- its real child IS
        // the scoped phase itself, already drawn separately below.
        if (motherShip) {
            const vx  = motherShip._x + NW / 2;
            const vy1 = motherShip._y + NH;
            const vy2 = tree._y;
            const vEdge = document.createElementNS(NS, 'path');
            vEdge.setAttribute('d', `M${vx},${vy1} L${vx},${vy2}`);
            vEdge.setAttribute('fill', 'none');
            vEdge.setAttribute('class', 'nb-cine-org-edge');
            svg.appendChild(vEdge);
            const savedChildren = motherShip.children;
            motherShip.children = [];
            _drawNode(motherShip, 1);
            motherShip.children = savedChildren;
        }

        _drawEdges(tree, 1);
        _drawNode(tree, 1);

        // Phase color (outline) + tag-color stripe(s): ONE serialized walk, not
        // two independent ones. This used to be two separate background async
        // passes (phase-color-only, fetching just the 6 phase roots; tag-color,
        // fetching every node) -- they ran concurrently with each other, which
        // silently reintroduced the exact "concurrent fetches choke the bare
        // dev server" problem this codebase already hit and fixed once (see the
        // git history this comment used to cite for the phase-color pass alone)
        // the moment a second simultaneous stream got added for tag stripes.
        // Confirmed live: two concurrent streams on an already-stale cache
        // produced a ~30s stall before any of ~60 queued fetches completed.
        // Unified: one fetch per node (not two for phase-root notes, which
        // used to be fetched once by each pass), phase color threaded down
        // through the recursion as it's discovered/already-known rather than
        // requiring its own separate top-down propagation pass.
        // Pill-tracked separately from the outer render()'s own add/tick pair --
        // this background walk keeps running well after render() has already
        // returned (un-awaited by design), so without its own add/tick here the
        // toolbar counter would show "done" while nodes are still visibly
        // colorizing one at a time behind it.
        NbWeb.statusPill?.add(1);
        (async () => {
          try {
            async function walk(node, depth, phaseColor) {
                let effective = phaseColor;
                // Also re-fetch when tagColors came from a cache built before
                // queryStatus existed (schema grew, content didn't change --
                // sourceLength staleness check wouldn't have caught this) --
                // a manual Refresh or the next content edit clears it up either
                // way, same as any other cache-schema addition to this feature.
                const needsFetch = node.wikiTarget && !node.milestone &&
                    (!node.tagColors || (node.queries?.length && !node.queryStatus));
                if (needsFetch) {
                    try {
                        const sel = node.selector || await NbMain.resolveWikilinkSelector(node.wikiTarget);
                        const r   = await fetch(`/api/note?selector=${encodeURIComponent(sel)}`);
                        const d   = await r.json();
                        if (node.level === 2 && d.meta?.color) effective = d.meta.color;
                        node.phaseColor = effective || null;
                        if (effective && node._g) {
                            const rect = node._g.querySelector('.nb-cine-org-rect');
                            if (rect) rect.style.stroke = effective;  // inline style -- see _drawNode's note on why
                        }
                        const pairs = _resolveTagColors({ meta: d.meta, body_preview: d.body }, tagColorMap);
                        node.tagColors = pairs;
                        if (pairs.length && node._g) _drawTagStripe(node._g, pairs);
                        node.queryStatus = _evalQueries(node.queries, d.meta || {}, d.body || '');
                        if (node._g) _drawQueryGlyph(node._g, node);
                    } catch { node.tagColors = node.tagColors || []; node.queryStatus = node.queryStatus || _evalQueries(node.queries, {}, ''); }
                } else if (node.phaseColor) {
                    effective = node.phaseColor;  // cache already resolved this node's own color
                }
                // Don't bother resolving nodes past drawDepthCap -- the full-map
                // view never draws them, same bound _drawNode itself uses.
                if (depth < drawDepthCap) for (const c of (node.children || [])) await walk(c, depth + 1, effective);
            }
            await walk(tree, 1, null);
            // Refresh the legend now that live resolution may have found tags
            // the initial cache-hit-only pass didn't know about.
            if (tagColorLegend) _renderTagLegend(svgCon, tree);
          } finally {
            NbWeb.statusPill?.tick();
          }
        })();

        // Readiness glyph (2026-08-07): a node's queries[] are evaluated in the
        // background walk above (or already resolved from the gen-org.py
        // cache) and drawn as a small overlay -- see _drawQueryGlyph. Neither
        // this nor a failing query gates navigation; see the click handler in
        // _drawNode for the non-blocking completion-dialog offer.

        // Viewport group — all drawn content goes in here for zoom/pan
        const vp = document.createElementNS(NS, 'g');
        vp.setAttribute('class', 'nb-org-vp');
        while (svg.firstChild) vp.appendChild(svg.firstChild);
        svg.appendChild(vp);
        svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');

        let _z = 1, _tx = 0, _ty = 0, _drag = null, _keysActive = false;
        function _applyVP() { vp.setAttribute('transform', `translate(${_tx.toFixed(1)},${_ty.toFixed(1)}) scale(${_z.toFixed(4)})`); }
        function _fitAll() {
            const cw = svgCon.clientWidth || svgW, ch = svgCon.clientHeight || Math.min(svgH, 480);
            const pad = 20;
            const fullFit = Math.min((cw - pad*2) / svgW, (ch - pad*2) / svgH, 2);
            const minZ = Math.max(12 / NH, 0.05);
            _z = Math.max(fullFit, minZ);
            if (_z > fullFit) { _tx = pad - tree._x * _z; _ty = ch * 0.4 - (tree._y + NH / 2) * _z; }
            else { _tx = Math.max(pad, (cw - svgW * _z) / 2); _ty = Math.max(pad, (ch - svgH * _z) / 2); }
            _applyVP();
        }
        function _zoomAt(mx, my, factor) {
            _z = Math.max(0.05, Math.min(_z * factor, 8));
            _tx = mx - (mx - _tx) * factor; _ty = my - (my - _ty) * factor;
            _applyVP();
        }

        const svgCon = document.createElement('div');
        svgCon.className = 'nb-org-svg-con';
        svgCon.style.cssText = `overflow:hidden;position:relative;width:100%;height:${Math.min(svgH + 8, 520)}px;cursor:grab;touch-action:none`;
        svgCon.appendChild(svg);
        if (tagColorLegend) _renderTagLegend(svgCon, tree);

        svgCon.addEventListener('wheel', e => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            const r = svgCon.getBoundingClientRect();
            _zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1/1.12);
        }, { passive: false });

        svgCon.addEventListener('mousedown', e => {
            if (e.button !== 0) return;
            _drag = { x: e.clientX - _tx, y: e.clientY - _ty };
            svgCon.style.cursor = 'grabbing';
            e.preventDefault();
        });
        const _onCineOrgMove = e => { if (_drag) { _tx = e.clientX - _drag.x; _ty = e.clientY - _drag.y; _applyVP(); } };
        const _onCineOrgUp   = () => { if (_drag) { _drag = null; svgCon.style.cursor = 'grab'; } };
        window.addEventListener('mousemove', _onCineOrgMove);
        window.addEventListener('mouseup',   _onCineOrgUp);

        // One finger pans (mirrors the mouse-drag block above -- touch never
        // gets mousedown/mousemove for a `touch-action:none` element, so
        // without this a single finger did nothing at all); two fingers
        // pinch-zoom. `_touchDrag` and `_pinchDist` are mutually exclusive --
        // touchend re-derives whichever mode the remaining touch count
        // implies, re-anchored from the current _tx/_ty, so lifting one of
        // two fingers hands off to single-finger pan without a jump.
        let _touchDrag = null, _pinchDist = null;
        svgCon.addEventListener('touchstart', e => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                _touchDrag = { x: t.clientX - _tx, y: t.clientY - _ty };
                _pinchDist = null;
            } else if (e.touches.length === 2) {
                _touchDrag = null;
                _pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            }
        }, { passive: true });
        svgCon.addEventListener('touchmove', e => {
            if (e.touches.length === 1 && _touchDrag) {
                e.preventDefault();
                const t = e.touches[0];
                _tx = t.clientX - _touchDrag.x;
                _ty = t.clientY - _touchDrag.y;
                _applyVP();
                return;
            }
            if (e.touches.length === 2 && _pinchDist) {
                e.preventDefault();
                const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                const r = svgCon.getBoundingClientRect();
                _zoomAt((e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left,
                        (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top, d / _pinchDist);
                _pinchDist = d;
            }
        }, { passive: false });
        svgCon.addEventListener('touchend', e => {
            if (e.touches.length === 1) {
                const t = e.touches[0];
                _touchDrag = { x: t.clientX - _tx, y: t.clientY - _ty };
                _pinchDist = null;
            } else {
                _touchDrag = null;
                _pinchDist = null;
            }
        });

        svgCon.addEventListener('mouseenter', () => { _keysActive = true; });
        svgCon.addEventListener('mouseleave', () => { _keysActive = false; });
        window.addEventListener('keydown', e => {
            if (!_keysActive) return;
            const ae = document.activeElement;
            if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
            const cw = svgCon.clientWidth, ch = svgCon.clientHeight;
            if      (e.key === 'f' || e.key === 'F') { e.preventDefault(); _fitAll(); }
            else if (e.key === '+' || e.key === '=') { e.preventDefault(); _zoomAt(cw/2, ch/2, 1.2); }
            else if (e.key === '-')                   { e.preventDefault(); _zoomAt(cw/2, ch/2, 1/1.2); }
            else if (e.key === '0')                   { e.preventDefault(); _z=1; _tx=0; _ty=0; _applyVP(); }
        });

        el.appendChild(svgCon);
        requestAnimationFrame(_fitAll);
    }

    function _buildStripboard(el, data, filter, notebook) {
        const { shots, characters, cast, locations, config } = data;
        const filtered = _filterShots(shots, filter);

        el.innerHTML = '';

        // Header
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        const projectName = config?.project || 'Stripboard';
        const dayLabel    = filter.day === null    ? ' · Unscheduled'
                          : filter.day !== undefined ? ` · Day ${filter.day}`
                          : ' · Master Board';
        hdr.innerHTML = `<span class="nb-cine-title">🎬 ${_esc(projectName)}${_esc(dayLabel)}</span>`;
        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tw-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', () => { _bust(notebook); _loadCineBlock(el); });
        hdr.appendChild(refBtn);
        el.appendChild(hdr);

        // Board
        const board = document.createElement('div');
        board.className = 'nb-cine-board';

        if (!filtered.length) {
            board.innerHTML = '<div class="nb-cine-empty">No shots scheduled</div>';
            el.appendChild(board);
            return;
        }

        // Column header row
        board.insertAdjacentHTML('beforeend',
            `<div class="nb-cine-strip nb-cine-colheader">` +
            `<span class="nb-cine-dnie" title="Day/Night · Int/Ext">DN</span>` +
            `<span class="nb-cine-id">ID</span>` +
            `<span class="nb-cine-loc">Loc</span>` +
            `<span class="nb-cine-desc">Description</span>` +
            `<span class="nb-cine-actors">Actors</span>` +
            `<span class="nb-cine-rescount">Res</span>` +
            `</div>`
        );

        // Always render UNSCHEDULED zone at top as a persistent drop target.
        // Faded when empty so it's unobtrusive; shots dragged above DAY 1 land here.
        if (filter.day === undefined) {
            const hasUnscheduled = filtered.some(s => s.day == null || s.day === '');
            const uBrk = document.createElement('div');
            uBrk.className = 'nb-cine-daybreak' + (hasUnscheduled ? '' : ' nb-cine-daybreak-empty');
            uBrk.innerHTML = '<span>UNSCHEDULED</span>';
            board.appendChild(uBrk);
            // When zone is empty, insert a visible drop zone so SortableJS has
            // a target — otherwise there's no DOM element to land on.
            if (!hasUnscheduled) {
                const ph = document.createElement('div');
                ph.className = 'nb-cine-unscheduled-placeholder';
                ph.textContent = 'drag here to unschedule';
                board.appendChild(ph);
            }
        }

        let currentDay = null;  // null = UNSCHEDULED already rendered above
        for (const shot of filtered) {
            // Day break on day transitions (master board only; skip null → already rendered)
            if (filter.day === undefined) {
                const thisDay = shot.day ?? null;
                if (thisDay !== null && thisDay !== currentDay) {
                    currentDay = thisDay;
                    const brk = document.createElement('div');
                    brk.className = 'nb-cine-daybreak';
                    brk.innerHTML = `<span>DAY&nbsp;${_esc(String(thisDay))}</span>`;
                    board.appendChild(brk);
                }
            }
            board.appendChild(_buildStrip(shot, characters, cast, locations, notebook));
        }

        el.appendChild(board);
        // Skip drag if the containing note is locked
        const _noteLocked = el.closest('#nb-preview-content')?.dataset.noteLocked === 'true';
        if (!_noteLocked) _wireSort(board, notebook, filter.day);
    }

    // ── Drag + resequence ─────────────────────────────────────────────────────

    function _computeMoves(board, filterDay) {
        const moves = [];
        let currentDay = filterDay ?? null;
        let seqInDay   = 0;
        for (const child of board.children) {
            if (child.classList.contains('nb-cine-daybreak')) {
                const m = child.textContent.match(/\d+/);
                currentDay = m ? parseInt(m[0]) : null;
                seqInDay   = 0;
            } else if (
                child.classList.contains('nb-cine-strip') &&
                !child.classList.contains('nb-cine-colheader')
            ) {
                seqInDay++;
                const sel = child.dataset.selector;
                if (sel) moves.push({ selector: sel, day: currentDay, seq: seqInDay });
            }
        }
        return moves;
    }

    function _wireSort(board, notebook, filterDay) {
        if (!window.Sortable) return;

        // Snapshot board order at render time; onEnd compares against this to find
        // which shots actually changed — avoids false positives for locked shots
        // that are on the board but not displaced by the drag.
        const origBySelector = Object.fromEntries(
            _computeMoves(board, filterDay).map(m => [m.selector, m])
        );

        Sortable.create(board, {
            animation:     150,
            forceFallback: true,   // required: pointermove breaks without this
            draggable:     '.nb-cine-strip:not(.nb-cine-colheader)',
            filter:        '.nb-cine-colheader, .nb-cine-daybreak',
            ghostClass:    'nb-cine-ghost',
            chosenClass:   'nb-cine-chosen',

            onMove: evt => {
                // Silently refuse to drag a locked shot
                if (evt.dragged?.dataset.locked === 'true') return false;
            },

            onEnd: async () => {
                const moves = _computeMoves(board, filterDay);
                if (!moves.length) return;

                // Block only if a locked shot's day or seq would actually change
                const lockedChanged = [];
                for (const child of board.children) {
                    if (child.dataset.locked !== 'true') continue;
                    const sel  = child.dataset.selector;
                    if (!sel) continue;
                    const orig = origBySelector[sel];
                    const curr = moves.find(m => m.selector === sel);
                    if (!orig || !curr) continue;
                    if (orig.day !== curr.day) {
                        const lbl = child.querySelector('.nb-cine-id')?.textContent?.trim()
                                 || sel.split('/').pop()?.replace('.md', '')
                                 || '?';
                        lockedChanged.push(lbl);
                    }
                }
                if (lockedChanged.length) {
                    const s = lockedChanged.length === 1 ? '' : 's';
                    alert(`Can't reorder — locked shot${s}: ${lockedChanged.join(', ')}`);
                    _bust(notebook);
                    _loadCineBlock(board.closest('.nb-cine-block'));
                    return;
                }

                try {
                    const r = await fetch('/api/cine/resequence', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({ notebook, moves }),
                    });
                    const d = await r.json();
                    _bust(notebook);
                    if (d.errors?.length) {
                        const names = d.errors.map(e => e.selector?.split('/').pop()?.replace('.md','') ?? e.selector).join(', ');
                        alert(`Resequence partial failure — ${d.errors.length} shot(s) not saved: ${names}`);
                        _loadCineBlock(board.closest('.nb-cine-block'));
                    }
                } catch (e) {
                    console.error('NbWeb-cine resequence failed:', e);
                    alert('Resequence failed — order not saved. Check console for details.');
                    _bust(notebook);
                    _loadCineBlock(board.closest('.nb-cine-block'));
                }
            },
        });
    }

    // ── Insert Shot keybinding (Ctrl+[) ──────────────────────────────────────────

    function _nextShotId(raw, sceneNo) {
        // Match alias suffix inside any wikilink — handles both [[4b]] and [[WH-van-arrive-4b]]
        const pat = new RegExp(`\\[\\[[^\\]]*${sceneNo}([a-z])(?:[^\\]]*)\\]\\]`, 'g');
        const letters = [...raw.matchAll(pat)].map(m => m[1]).sort();
        const last = letters.length ? letters[letters.length - 1] : null;
        return last ? `${sceneNo}${String.fromCharCode(last.charCodeAt(0) + 1)}` : `${sceneNo}a`;
    }

    function _showInsertShotOverlay(suggested, locHint, onConfirm, onCancel) {
        const suggestedFile = locHint ? `${locHint}-${suggested}` : suggested;
        const overlay = document.createElement('div');
        overlay.className = 'nb-cine-insert-overlay';
        overlay.innerHTML = `
            <div class="nb-cine-insert-card">
                <h4>INSERT SHOT</h4>
                <label>Alias <span style="font-weight:normal;opacity:.6">(stripboard code)</span></label>
                <input id="nb-cine-shot-id" type="text" value="${_esc(suggested)}" autocomplete="off" spellcheck="false">
                <label>Filename <span style="font-weight:normal;opacity:.6">(stable link target)</span></label>
                <input id="nb-cine-shot-file" type="text" value="${_esc(suggestedFile)}" autocomplete="off" spellcheck="false">
                <label>Title</label>
                <input id="nb-cine-shot-title" type="text" placeholder="Brief descriptive title…" autocomplete="off">
                <label>Actors (comma-separated)</label>
                <input id="nb-cine-shot-actors" type="text" placeholder="e.g. JD, TM">
                <div class="nb-cine-insert-btns">
                    <button id="nb-cine-insert-cancel" class="nb-tool-btn">Cancel</button>
                    <button id="nb-cine-insert-ok" class="nb-tool-btn nb-btn-primary">Create &amp; Insert</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const idInput    = overlay.querySelector('#nb-cine-shot-id');
        const fileInput  = overlay.querySelector('#nb-cine-shot-file');
        const titleInput = overlay.querySelector('#nb-cine-shot-title');
        const actInput   = overlay.querySelector('#nb-cine-shot-actors');
        const okBtn      = overlay.querySelector('#nb-cine-insert-ok');
        const cancelBtn  = overlay.querySelector('#nb-cine-insert-cancel');

        // When alias changes, keep filename in sync unless user has edited it manually
        let fileEdited = false;
        fileInput.addEventListener('input', () => { fileEdited = true; });
        idInput.addEventListener('input', () => {
            if (!fileEdited) fileInput.value = locHint ? `${locHint}-${idInput.value.trim()}` : idInput.value.trim();
        });

        // Select all in alias field so user can type directly
        idInput.focus();
        idInput.select();

        const confirm = () => {
            const alias    = idInput.value.trim();
            const filename = fileInput.value.trim();
            if (!alias) { idInput.focus(); return; }
            overlay.remove();
            onConfirm({ alias, filename: filename || alias, title: titleInput.value.trim(), actors: actInput.value.trim() });
        };
        const cancel = () => { overlay.remove(); onCancel(); };

        okBtn.addEventListener('click', confirm);
        cancelBtn.addEventListener('click', cancel);
        overlay.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirm(); }
            if (e.key === 'Escape') cancel();
        });
    }

    async function _createShotFromTemplate(notebook, sceneMeta, alias, filename, title, actors) {
        // Look for a template named 'shot' in the notebook; fall back to built-in.
        let content = null;
        try {
            const r = await fetch(`/api/templates?notebook=${encodeURIComponent(notebook)}`);
            if (r.ok) {
                const d = await r.json();
                const tpl = (d.templates || []).find(t => /^shot$/i.test(t.name));
                if (tpl) {
                    const tr = await fetch(`/api/template?path=${encodeURIComponent(tpl.path)}`);
                    if (tr.ok) content = (await tr.json()).content;
                }
            }
        } catch (_) {}

        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const vars = {
            shot_id:   alias,
            scene:     String(sceneMeta.alias ?? ''),
            desc:      title,
            actors:    actors,
            loc:       String(sceneMeta.loc       ?? ''),
            day_night: String(sceneMeta.day_night  ?? ''),
            int_ext:   String(sceneMeta.int_ext    ?? ''),
            date:      dateStr,
        };

        if (content) {
            // Substitute {{var}} placeholders in the template
            content = content.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
        } else {
            // Built-in fallback frontmatter
            content = [
                '---',
                `scene: ${vars.scene}`,
                `shot: ${alias}`,
                `alias: ${alias}`,
                `title: ${title}`,
                `type: shot`,
                `day_night: ${vars.day_night}`,
                `int_ext: ${vars.int_ext}`,
                `loc: ${vars.loc}`,
                `desc: ${title ? `|\n  ${title.replace(/\n/g, '\n  ')}` : ''}`,
                `cast: |`,
                `  actors: ${actors}`,
                `  extras:`,
                `---`,
            ].join('\n');
        }

        const r = await fetch('/api/notes', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ notebook, folder: 'shots', title: alias, filename, content }),
        });
        const d = await r.json();
        return d.selector || null;
    }

    async function _insertShotAction(ta, note) {
        const sceneNo = note?.meta?.alias;
        if (sceneNo == null || note?.type !== 'scene') return;

        const savedPos = ta.selectionStart;
        const suggested = _nextShotId(ta.value, sceneNo);
        const locHint   = (note.meta?.loc || '').toUpperCase() || null;

        _showInsertShotOverlay(suggested, locHint, async ({ alias, filename, title, actors }) => {
            // Insert [[filename]] — stable link; displays as alias via data-autolabel
            const ins    = `[[${filename}]]`;
            ta.value     = ta.value.slice(0, savedPos) + ins + ta.value.slice(savedPos);
            const newPos = savedPos + ins.length;
            ta.focus();
            ta.setSelectionRange(newPos, newPos);

            // Save the scene, create the shot, open shot in editor
            try {
                await NbMain.saveNote();
                const selector = await _createShotFromTemplate(note.notebook, note.meta, alias, filename, title, actors);
                if (selector) NbMain.openEditor(selector);
            } catch(e) {
                console.warn('NbWeb-cine: shot creation failed', e);
            }
        }, () => {
            ta.focus();
            ta.setSelectionRange(savedPos, savedPos);
        });
    }

    // ── Card renderers ────────────────────────────────────────────────────────

    // Parse a block-scalar sub-field string ("key: value\n...") into an object.
    // Also handles plain YAML objects (passed through from frontmatter parser).
    function _parseBlock(str) {
        if (!str || typeof str !== 'string') return {};
        const out = {};
        for (const line of str.trim().split('\n')) {
            const m = line.match(/^([^:]+):\s*(.*)/);
            if (m) out[m[1].trim()] = m[2].trim();
        }
        return out;
    }

    // ── Shared nb-card helpers ────────────────────────────────────────────────
    // Rule: ALL frontmatter fields must be exposed in a card, even unknown ones.
    // Custom renderers may format specific fields differently but may not hide them.

    function _cColor(str) {
        let h = 0;
        for (let i = 0; i < (str || '').length; i++) h = (h * 31 + (str || '').charCodeAt(i)) & 0xffff;
        return `hsl(${h % 360},38%,36%)`;
    }

    function _cInitials(str) {
        return (str || '?').split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
    }

    // Plain-text card row.
    function _cRow(label, val) {
        if (val == null || val === '' || val === false) return '';
        return `<div class="nb-card-row"><span class="nb-card-label">${_esc(label)}</span>` +
               `<span class="nb-card-value">${_esc(String(val))}</span></div>`;
    }

    // Card row with an anchor value.
    function _cLink(label, val, href) {
        if (!val) return '';
        return `<div class="nb-card-row"><span class="nb-card-label">${_esc(label)}</span>` +
               `<span class="nb-card-value"><a href="${_esc(href)}">${_esc(String(val))}</a></span></div>`;
    }

    // Card row whose value is a wiki-link span (enriched by _enrichRendered).
    function _cWikiRow(label, selector) {
        if (!selector) return '';
        return `<div class="nb-card-row"><span class="nb-card-label">${_esc(label)}</span>` +
               `<span class="nb-card-value"><span class="nb-wiki-link" data-selector="${_esc(selector)}" data-autolabel>${_esc(selector)}</span></span></div>`;
    }

    // Expand a block field (multiline string OR plain object) into a sub-section.
    // rowFn: optional (key, val) → html for each sub-field; defaults to _cRow.
    function _cBlock(label, v, rowFn) {
        const fn = rowFn || _cRow;
        const entries = (typeof v === 'string')
            ? Object.entries(_parseBlock(v))
            : (v && typeof v === 'object') ? Object.entries(v) : [];
        const rows = entries.filter(([, bv]) => bv != null && bv !== '').map(([k, bv]) => fn(k, bv)).join('');
        if (!rows) return '';
        return `<div class="nb-card-block">` +
               `<div class="nb-card-block-key">${_esc(label)}</div>` +
               `<div class="nb-card-block-fields">${rows}</div></div>`;
    }

    // Render ALL entries in meta as card rows. Rule: no field may be silently omitted.
    // customRenderers: { fieldName: (value) → html }  — return '' to suppress a field.
    // Fields without a custom renderer are auto-rendered: blocks expanded, plain text for scalars.
    function _cAllFields(meta, customRenderers) {
        const out = [];
        for (const [k, v] of Object.entries(meta)) {
            if (v == null || v === '' || v === false) continue;
            if (customRenderers && Object.prototype.hasOwnProperty.call(customRenderers, k)) {
                const h = customRenderers[k](v);
                if (h) out.push(h);
                continue;
            }
            if (typeof v === 'string' && v.includes('\n')) {
                out.push(_cBlock(k, v));
            } else if (v && typeof v === 'object' && !Array.isArray(v)) {
                out.push(_cBlock(k, v));
            } else {
                out.push(_cRow(k, v));
            }
        }
        return out.join('');
    }

    // Body renders OUTSIDE the .nb-card div — the card's bg3 background is the
    // visual separator; no <hr> needed.
    function _cBody(note) {
        return (note.body || '').trim()
            ? `<div class="nb-card-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>`
            : '';
    }

    // ── Actor card (type: actor) ──────────────────────────────────────────────

    function _renderActorCard(note) {
        const m    = note.meta || {};
        const name = m.title || note.title || '';
        const code = m.alias ? String(m.alias) : '';

        const avatar = `<div class="nb-card-avatar" style="background:${_cColor(name)}">${_esc(_cInitials(name))}</div>`;
        const sub    = ['Actor', code ? `code: ${code}` : ''].filter(Boolean).join(' · ');

        const fields = _cAllFields(m, {
            title:   v => _cRow('title', v),
            alias:   v => _cRow('alias', v),
            phone:   v => _cLink('phone', v, 'tel:' + String(v).replace(/\s/g, '')),
            contact: v => _cBlock('contact', v, (k, bv) => {
                if (k === 'email') return _cLink('email', bv, 'mailto:' + bv);
                if (k === 'cel' || k === 'phone') return _cLink(k, bv, 'tel:' + String(bv).replace(/\s/g, ''));
                return _cRow(k, bv);
            }),
            agent:   v => _cBlock('agent', v),
        });

        return `<div class="nb-card">` +
            `<div class="nb-card-header">${avatar}` +
            `<div><div class="nb-card-title">${_esc(name)}</div>` +
            `<div class="nb-card-sub">${_esc(sub)}</div></div></div>` +
            `<div class="nb-card-fields">${fields}</div>` +
            `</div>${_cBody(note)}`;
    }

    // ── Character card (type: character) ─────────────────────────────────────

    function _renderCharacterCard(note) {
        const m    = note.meta || {};
        const name = m.title || note.title || '';

        const avatar = `<div class="nb-card-avatar" style="background:${_cColor(note.title)}">${_esc(_cInitials(name))}</div>`;
        const sub    = 'Character';

        const fields = _cAllFields(m, {
            title:       v => _cRow('title', v),
            alias:       v => _cWikiRow('cast', v),   // alias is the cast member's stem
            description: v => typeof v === 'string' && v.includes('\n')
                ? _cBlock('description', v)
                : _cRow('description', v),
        });

        return `<div class="nb-card">` +
            `<div class="nb-card-header">${avatar}` +
            `<div><div class="nb-card-title">${_esc(name)}</div>` +
            `<div class="nb-card-sub">${_esc(sub)}</div></div></div>` +
            `<div class="nb-card-fields">${fields}</div>` +
            `</div>${_cBody(note)}`;
    }

    // ── Location card (type: location) ───────────────────────────────────────

    function _renderLocationCard(note) {
        const m    = note.meta || {};
        const name = m.title || note.title || '';
        const code = m.alias ? String(m.alias) : '';

        const avatar = `<div class="nb-card-avatar" style="background:${_cColor(name)}">${_esc(code || _cInitials(name))}</div>`;
        const sub    = ['Location', code ? `code: ${code}` : ''].filter(Boolean).join(' · ');

        const fields = _cAllFields(m, {
            title:   v => _cRow('title', v),
            alias:   v => _cRow('alias', v),
            address: v => {
                const mq = 'https://maps.google.com/?q=' + encodeURIComponent(String(v));
                return `<div class="nb-card-row"><span class="nb-card-label">address</span>` +
                       `<span class="nb-card-value"><a href="${_esc(mq)}" target="_blank" rel="noopener">${_esc(String(v))}</a></span></div>`;
            },
            pin: v => v ? _cLink('pin', v, 'https://maps.google.com/?q=' + encodeURIComponent(String(v))) : '',
        });

        return `<div class="nb-card">` +
            `<div class="nb-card-header">${avatar}` +
            `<div><div class="nb-card-title">${_esc(name)}</div>` +
            `<div class="nb-card-sub">${_esc(sub)}</div></div></div>` +
            `<div class="nb-card-fields">${fields}</div>` +
            `</div>${_cBody(note)}`;
    }

    // ── Scene header (type: scene) — mirrors _renderShotHeader's identity
    // strip so shot and scene read as one system (same dnie colour coding,
    // same nb-specialty-header shell). No action button: unlike a shot's
    // Slate, a scene note has no equivalent single-launch tool to offer.
    function _renderSceneHeader(note) {
        const m     = note.meta || {};
        const alias = m.alias != null ? String(m.alias) : '';
        const ie    = (m.int_ext   || '').charAt(0).toUpperCase();
        const dn    = (m.day_night || '').charAt(0).toUpperCase();
        const dnie  = (ie && dn) ? ie + dn : (ie || dn || '');
        const loc   = m.loc ? String(m.loc) : '';

        const sceneId = alias ? `SC ${_esc(alias)}` : _esc(note.title || '');

        const dnieLabel = { ID: 'INT·DAY', ED: 'EXT·DAY', IN: 'INT·NIGHT', EN: 'EXT·NIGHT' };
        const dniePill  = dnie
            ? `<span class="nb-specialty-pill nb-cine-shot-pill-dnie nb-cine-strip-${dnie}">${dnieLabel[dnie] || dnie}</span>`
            : '';
        const locPill   = loc ? `<span class="nb-specialty-pill">${_esc(loc)}</span>` : '';

        return `<div class="nb-specialty-header nb-cine-scene-hdr" data-selector="${_esc(note.selector || '')}" data-dnie="${_esc(dnie)}">
  <span class="nb-specialty-icon">🎞</span>
  <span class="nb-specialty-label">${sceneId}</span>
  ${dniePill}${locPill}
</div>`;
    }

    // ── Scene card (type: scene) — frontmatter card + body ───────────────────

    function _renderSceneCard(note) {
        const m  = note.meta || {};
        const fields = _cAllFields(m, {
            // alias/loc/day_night/int_ext now live in _renderSceneHeader above —
            // suppress here so they don't show twice.
            alias:     () => '',
            loc:       () => '',
            day_night: () => '',
            int_ext:   () => '',
        });

        const bodyHtml = (note.body || '').trim()
            ? `<div class="nb-card-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';

        return `<div class="nb-cine-shot-card">` +
            (fields ? `<div class="nb-card nb-cine-card-fm">` +
            `<div class="nb-card-fields">${fields}</div></div>` : '') +
            `${bodyHtml}</div>`;
    }

    // Resolves which type:storyline note owns a plotline/story note, if any --
    // explicit project: field first (matches how a storyline note names
    // itself), else the note's immediate parent folder name (storylines/<x>
    // convention). Verifies the candidate is actually type:storyline before
    // trusting it -- a same-named non-storyline note (e.g. the storylines.md
    // dashboard) must never be mistaken for a match. Resolved once at header-
    // render time (not on click) so the title can show the real storyline
    // name and the view-switcher buttons can target it directly, with no
    // fetch-on-click needed.
    async function _resolveParentStoryline(note) {
        const sel = note.selector || '';
        const colonIdx = sel.indexOf(':');
        if (colonIdx < 0) return null;
        const notebook = sel.slice(0, colonIdx);
        const path      = sel.slice(colonIdx + 1);

        const explicit = (note.meta?.project || '').trim()
            .replace(/^storylines\//, '').replace(/\/$/, '');
        const parts = path.split('/');
        parts.pop(); // drop filename
        const parentFolder = parts[parts.length - 1] || '';
        const candidates = [...new Set([explicit, parentFolder].filter(Boolean))];

        for (const stem of candidates) {
            const candSel = `${notebook}:storylines/${stem}.md`;
            try {
                const r = await fetch(`/api/note?selector=${encodeURIComponent(candSel)}`);
                if (!r.ok) continue;
                const d = await r.json();
                if (d && !d.error && d.meta?.type === 'storyline') {
                    return { selector: candSel, title: d.title || d.meta?.title || stem };
                }
            } catch (_) {}
        }
        return null;
    }

    // Board/Story/Script/Note mini view-switcher for a header that isn't
    // currently ON one of those views itself (a plotline/story note) --
    // navigates to targetSel and lands on the requested view there. No
    // zoom (meaningless off the board/story/script views themselves). See
    // the [data-sl-view] delegated click handler below for the wiring.
    function _renderSlViewGroup(targetSel) {
        const t = targetSel ? _esc(targetSel) : '';
        return `<div class="nb-cine-sl-viewgroup" data-sl-target="${t}">
  <button class="nb-cine-sl-view-btn" data-sl-view="board" title="Board">${_SL_ICON_BOARD}</button>
  <button class="nb-cine-sl-view-btn" data-sl-view="story" title="Story">${_SL_ICON_STORY}</button>
  <button class="nb-cine-sl-view-btn" data-sl-view="script" title="Script">${_SL_ICON_SCRIPT}</button>
</div>`;
    }

    // ── Plotline header + card (type: plotline) — a lane on the storyline
    // board. Identity here is its colour, not an emoji -- the same colour
    // already marks this lane's own border and every story card assigned to
    // it, so the header swatch is the header's own icon slot, reinforcing an
    // existing convention rather than adding an unrelated one. Distinct from
    // the master type:storyline note by design (djp, 2026-08-06) -- not the
    // same header, not a reuse of storyline's board/story/script machinery.
    async function _renderPlotlineHeader(note) {
        const m        = note.meta || {};
        const color    = m.color ? String(m.color) : '';
        const seq      = m.seq != null && m.seq !== '' ? String(m.seq) : '';
        const notebook = (note.selector || '').split(':')[0];

        // The swatch doubles as the nav-trigger (same slot, not a second icon
        // stacked next to it) -- clicking it opens nbweb-specialty's cross-type
        // popup, same as story/milestone's plain-emoji icon does.
        const swatch  = `<button class="nb-cine-plotline-swatch nb-specialty-nav-btn" data-nb-nav="${_esc(notebook)}" title="All specialty notes in ${_esc(notebook || 'this notebook')}"${color ? ` style="background:${_esc(color)}"` : ''}></button>`;
        const seqPill = seq ? `<span class="nb-specialty-pill">lane ${_esc(seq)}</span>` : '';

        const parent = await _resolveParentStoryline(note);
        const titleHtml = parent
            ? `<span class="nb-specialty-label nb-cine-title-nav" data-sl-view="note" data-sl-target="${_esc(parent.selector)}" title="Open ${_esc(parent.title)}">${_esc(parent.title)}</span><span class="nb-specialty-label"> — plotline — ${_esc(note.title || '')}</span>`
            : `<span class="nb-specialty-label">plotline — ${_esc(note.title || '')}</span>`;

        return `<div class="nb-specialty-header nb-cine-plotline-hdr" data-selector="${_esc(note.selector || '')}"${color ? ` style="border-left-color:${_esc(color)}"` : ''}>
  ${swatch}
  ${titleHtml}
  ${_renderSlViewGroup(parent?.selector || '')}
  <span class="nb-specialty-right">
    ${seqPill}
    <button class="nb-cine-big-plus-btn" data-sl-action="stub-add" title="Coming soon">+</button>
  </span>
</div>`;
    }

    function _renderPlotlineCard(note) {
        const m = note.meta || {};
        const fields = _cAllFields(m, {
            // title/color/seq now live in _renderPlotlineHeader above.
            title: () => '',
            color: () => '',
            seq:   () => '',
        });
        const bodyHtml = (note.body || '').trim()
            ? `<div class="nb-card-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';
        return `<div class="nb-cine-shot-card">` +
            (fields ? `<div class="nb-card nb-cine-card-fm">` +
            `<div class="nb-card-fields">${fields}</div></div>` : '') +
            `${bodyHtml}</div>`;
    }

    // ── Story header (type: story) — a card on a plotline lane. plotline
    // name and on-storyline (story_seq) status used to show as pills here;
    // removed 2026-08-06 (djp) once the view-switcher made this header busy
    // enough that they read as clutter rather than useful at-a-glance state.
    async function _renderStoryHeader(note) {
        const parent   = await _resolveParentStoryline(note);
        const notebook = (note.selector || '').split(':')[0];
        const titleHtml = parent
            ? `<span class="nb-specialty-label nb-cine-title-nav" data-sl-view="note" data-sl-target="${_esc(parent.selector)}" title="Open ${_esc(parent.title)}">${_esc(parent.title)}</span><span class="nb-specialty-label"> — story — ${_esc(note.title || '')}</span>`
            : `<span class="nb-specialty-label">story — ${_esc(note.title || '')}</span>`;

        return `<div class="nb-specialty-header nb-cine-story-hdr" data-selector="${_esc(note.selector || '')}">
  <button class="nb-specialty-icon nb-specialty-nav-btn" data-nb-nav="${_esc(notebook)}" title="All specialty notes in ${_esc(notebook || 'this notebook')}">🃏</button>
  ${titleHtml}
  ${_renderSlViewGroup(parent?.selector || '')}
  <span class="nb-specialty-right">
    <button class="nb-cine-big-plus-btn" data-sl-action="stub-add" title="Coming soon">+</button>
  </span>
</div>`;
    }

    // ── Milestone header (type: milestone) — same shape as _renderStoryHeader;
    // milestone notes had no specialty preview at all until this (fell through
    // to generic markdown, no title-click back to the storyline, no mini
    // Board/Story/Script switcher). _resolveParentStoryline is already type-
    // agnostic (project FM / parent folder), so no changes needed there.
    async function _renderMilestoneHeader(note) {
        const parent   = await _resolveParentStoryline(note);
        const notebook = (note.selector || '').split(':')[0];
        const titleHtml = parent
            ? `<span class="nb-specialty-label nb-cine-title-nav" data-sl-view="note" data-sl-target="${_esc(parent.selector)}" title="Open ${_esc(parent.title)}">${_esc(parent.title)}</span><span class="nb-specialty-label"> — milestone — ${_esc(note.title || '')}</span>`
            : `<span class="nb-specialty-label">milestone — ${_esc(note.title || '')}</span>`;

        return `<div class="nb-specialty-header nb-cine-milestone-hdr" data-selector="${_esc(note.selector || '')}">
  <button class="nb-specialty-icon nb-specialty-nav-btn" data-nb-nav="${_esc(notebook)}" title="All specialty notes in ${_esc(notebook || 'this notebook')}">🏁</button>
  ${titleHtml}
  ${_renderSlViewGroup(parent?.selector || '')}
  <span class="nb-specialty-right">
    <button class="nb-cine-big-plus-btn" data-sl-action="stub-add" title="Coming soon">+</button>
  </span>
</div>`;
    }

    // ── Slate overlay ─────────────────────────────────────────────────────────

    // Walk up from the note's selector looking for a slate.md config note.
    async function _fetchSceneTitle(notebook, sceneAlias) {
        if (!sceneAlias || !notebook) return '';
        try {
            const r = await fetch(`/api/notes?notebook=${encodeURIComponent(notebook)}&folder=script&limit=300`);
            if (!r.ok) return '';
            const items = await r.json();
            const hit = (Array.isArray(items) ? items : (items.notes || [])).find(
                n => String(n.meta?.alias ?? '') === String(sceneAlias)
            );
            return String(hit?.meta?.title || hit?.title || '');
        } catch (_) { return ''; }
    }

    async function _findSlateConfig(note) {
        const sel = note.selector || '';
        const colonIdx = sel.indexOf(':');
        if (colonIdx < 0) return { meta: {}, fields: null };
        const notebook = sel.slice(0, colonIdx);
        const parts = sel.slice(colonIdx + 1).split('/');
        parts.pop();
        while (true) {
            const folder = parts.length > 0 ? parts.join('/') + '/' : '';
            try {
                const r = await fetch(`/api/note?selector=${encodeURIComponent(notebook + ':' + folder + 'slate.md')}`);
                if (r.ok) {
                    const data = await r.json();
                    if (data && !data.error && data.meta) {
                        return { meta: data.meta };
                    }
                }
            } catch (_) {}
            if (parts.length === 0) break;
            parts.pop();
        }
        return { meta: {}, fields: null };
    }



    // Parse annotation FM + take table; return state for the next snap.
    function _slateDateTime() {
        const d = new Date(), pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    // Read slate state from annotation sidecar. Parses timelog fenced block.
    // slateDefaults = meta from nearest slate.md — fallback when no annotation yet.
    // Outer annotation FM may have uncommented camera:/fps: to override per-shot defaults.
    function _slateReadState(annotation, slateDefaults = {}) {
        const empty = { nextTake: 1, tape: '', camera: slateDefaults.camera || 'A', fps: slateDefaults.fps || '24', takeCount: 0, rolling: false };
        if (!annotation) return empty;
        // Parse outer FM — only camera: and fps: are per-shot overrides (uncommented lines only)
        const fmOverrides = {};
        let body = annotation;
        if (body.startsWith('---')) {
            const end = body.indexOf('\n---', 3);
            if (end >= 0) {
                for (const line of body.slice(3, end).split('\n')) {
                    const mx = line.match(/^(camera|fps):\s*(\S+)/);
                    if (mx) fmOverrides[mx[1]] = mx[2];
                }
                body = body.slice(end + 4);
            }
        }
        // Find timelog fenced block
        const tlMatch = body.match(/```timelog\n([\s\S]*?)```/);
        if (!tlMatch) {
            // Migration: read legacy ## Takes table so existing shots keep their take count
            const legacyRows = [...annotation.matchAll(/^\|(.+)\|$/gm)]
                .map(m => m[1].split('|').map(s => s.trim()))
                .filter(cells => cells.length >= 3 && /^\d+$/.test(cells[2]));
            const legacyMax = legacyRows.length > 0 ? Math.max(...legacyRows.map(c => parseInt(c[2], 10))) : 0;
            return {
                nextTake: legacyMax + 1, tape: '',
                camera: fmOverrides.camera || slateDefaults.camera || 'A',
                fps:    fmOverrides.fps    || slateDefaults.fps    || '24',
                takeCount: legacyRows.length, rolling: false,
            };
        }
        const tlContent = tlMatch[1];
        const iLines = [...tlContent.matchAll(/^i \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (\S+)(.*)/gm)];
        const oCount = (tlContent.match(/^o \d{4}-\d{2}-\d{2}/gm) || []).length;
        let maxTake = 0, lastTape = '', lastCamera = slateDefaults.camera || 'A', lastFps = slateDefaults.fps || '24';
        for (const m of iLines) {
            const parts = m[1].split(':');
            const n = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(n)) maxTake = Math.max(maxTake, n);
            const tagPart = (m[2] || '').includes(';') ? m[2].slice(m[2].indexOf(';') + 1) : '';
            const tm = tagPart.match(/\btape:(\S+)/); if (tm) lastTape   = tm[1];
            const cm = tagPart.match(/\bcam:(\S+)/);  if (cm) lastCamera = cm[1];
            const fm = tagPart.match(/\bfps:(\S+)/);  if (fm) lastFps   = fm[1];
        }
        // FM overrides win over per-take tags (uncommenting camera:/fps: pins this shot)
        if (fmOverrides.camera) lastCamera = fmOverrides.camera;
        if (fmOverrides.fps)    lastFps    = fmOverrides.fps;
        return {
            nextTake: maxTake + 1, tape: lastTape, camera: lastCamera, fps: lastFps,
            takeCount: iLines.length, rolling: iLines.length > oCount,
        };
    }

    // Minimal annotation FM template — written once when annotation is first created.
    // camera:/fps: are commented out; uncomment to pin this shot's slate defaults.
    const _SLATE_ANNOTATION_TEMPLATE = [
        '---',
        'lock:',
        '# camera:    ← uncomment to override inherited default',
        '# fps:       ← uncomment to override inherited default',
        '---',
    ].join('\n');

    // Write 'i' timelog line to annotation — called at SNAP (clap). Returns updated annotation string.
    function _slateOpenTake(existing, snap) {
        const { take, tape, camera, fps, mos, scene = '', alias = '', shotFile = '' } = snap;
        const dt      = _slateDateTime();
        const account = `${scene}:${shotFile || alias}:${take}`;
        const tags = [];
        if (tape) tags.push(`tape:${tape}`); // omit entirely when empty — blank tape: poisons following tags
        tags.push(`cam:${camera || 'A'}`, `fps:${fps || '24'}`);
        if (mos) tags.push(':MOS:');
        const iLine = `i ${dt} ${account}  ; ${tags.join(', ')}`; // comma-separated: hledger tag delimiter
        const tlRx  = /```timelog\n([\s\S]*?)```/;

        let body  = existing || '';
        let hasFm = false;

        // Detect and handle existing FM
        if (body.startsWith('---')) {
            const fmEnd = body.indexOf('\n---', 3);
            if (fmEnd >= 0) {
                if (body.slice(3, fmEnd).includes('lock:')) {
                    hasFm = true; // new-style template FM — leave it alone
                } else {
                    body = body.slice(fmEnd + 4).replace(/^\n+/, ''); // old state-cache FM — strip it
                }
            }
        }

        const tlMatch = body.match(tlRx);
        if (tlMatch) {
            // Timelog block exists — append i line only
            const tlContent = tlMatch[1].trimEnd() + '\n' + iLine + '\n';
            const updated   = body.replace(tlRx, '```timelog\n' + tlContent + '```');
            // If old FM was stripped, prepend the template now
            return hasFm ? updated : _SLATE_ANNOTATION_TEMPLATE + '\n\n' + updated.trim() + '\n';
        } else {
            // No timelog block — create it; add template FM if needed
            const prefix   = hasFm ? '' : _SLATE_ANNOTATION_TEMPLATE + '\n\n';
            const rest     = body.trim();
            const tlFenced = '```timelog\n' + iLine + '\n```';
            return prefix + (rest ? rest + '\n\n' : '') + tlFenced + '\n';
        }
    }

    // Write 'o' timelog line to annotation — called at CUT. Returns updated annotation string.
    function _slateCloseTake(existing) {
        const oLine  = `o ${_slateDateTime()}`;
        const tlRx   = /```timelog\n([\s\S]*?)```/;
        const tlMatch = (existing || '').match(tlRx);
        if (!tlMatch) return existing;
        const tlContent = tlMatch[1].trimEnd() + '\n' + oLine + '\n';
        return existing.replace(tlRx, '```timelog\n' + tlContent + '```');
    }


    // Auto-size inp font to fill cell. Uses a shared off-screen mirror span to measure.
    function _fitText(inp, cell) {
        const isInput = inp.tagName === 'INPUT';
        const text = isInput ? (inp.value || inp.placeholder || '0') : (inp.textContent.trim() || '0');
        let mirror = document._nbSlateMirror;
        if (!mirror) {
            mirror = document.createElement('span');
            mirror.style.cssText = 'position:fixed;top:-9999px;left:-9999px;white-space:nowrap;pointer-events:none;';
            document.body.appendChild(mirror);
            document._nbSlateMirror = mirror;
        }
        // Match the element's computed font so measurement is accurate
        const cs = getComputedStyle(inp);
        mirror.style.fontFamily = cs.fontFamily;
        mirror.style.fontWeight = cs.fontWeight;
        mirror.textContent = text;
        const maxW = cell.clientWidth  - 12;
        const maxH = cell.clientHeight - 12;
        if (maxW <= 0 || maxH <= 0) return;
        let lo = 8, hi = 400;
        while (hi - lo > 1) {
            const mid = Math.round((lo + hi) / 2);
            mirror.style.fontSize = mid + 'px';
            if (mirror.offsetWidth > maxW || mirror.offsetHeight > maxH) hi = mid;
            else lo = mid;
        }
        inp.style.fontSize = lo + 'px';
        inp.style.lineHeight = '1';
    }

    async function _showSlate(note) {
        const m  = note.meta || {};
        const ef = note.effective_fm || {};
        const alias    = m.alias ? String(m.alias) : '';
        const scene    = m.scene != null ? String(m.scene) : '';
        const shotFile = (note.selector || '').split('/').pop().replace(/\.md$/, '');
        const ie    = (m.int_ext   || '').toUpperCase();
        const dn    = (m.day_night || '').toUpperCase();
        const loc   = m.loc ? String(m.loc) : '';
        // Crew — shot FM > effective_fm > slate.md FM (loaded below)
        // slateM not yet available here; overridden after slateCfg load
        const notebook = (note.selector || '').split(':')[0] || note.notebook || '';

        // Parallel fetches: production config, slate config, scene title
        const [cfg, slateCfg, sceneTitle] = await Promise.all([
            NbWeb.loadNotebookConfig(notebook || NbNav?.notebook || '').catch(() => ({})),
            _findSlateConfig(note),
            _fetchSceneTitle(notebook, scene),
        ]);
        const production = cfg?.cine?.project || cfg?.project || notebook || '';

        const slateM    = slateCfg.meta || {};
        const initState = _slateReadState(note.annotation || '', slateM);

        // Crew cascade: shot FM > effective_fm > slate.md FM
        const director = String(m.director || ef.director || slateM.director || '');
        const dop      = String(m.dop || ef.dop || slateM.dop || m.dp || ef.dp || slateM.dp || '');

        const shootDay   = slateM.shoot_day ?? slateM.day ?? '';
        const _parseCams = raw => {
            if (!raw) return [];
            if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
            return String(raw).split(',').map(s => s.trim()).filter(Boolean);
        };
        const cameraList = _parseCams(m.cameras || ef.cameras || slateM.cameras);
        const shotTitle  = String(m.title || ef.title || '');

        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const _d = new Date();
        const dateStr = `${String(_d.getDate()).padStart(2,'0')} ${months[_d.getMonth()]} ${_d.getFullYear()}`;
        const ieStr   = [ie, dn, loc].filter(Boolean).join('·') || '—';
        const takeCount0 = initState.takeCount;
        const minTake    = initState.nextTake;   // floor — can never go below recorded max+1
        const takeTxt  = n => n ? `${n} take${n !== 1 ? 's' : ''} recorded` : 'no takes yet';

        const overlay = document.createElement('div');
        overlay.className = 'nb-slate-overlay';
        overlay.innerHTML = `
<div class="nb-slate-bar nb-slate-bar-top" role="button" aria-label="Snap">
  <span class="nb-slate-duration">0:00</span>
</div>
<div class="nb-slate-body">
  <div class="nb-slate-cell nb-sc-prod">
    <div class="nb-slate-cell-label">PROD</div>
    <div class="nb-slate-cell-content">
      <div class="nb-sc-prod-name">
        <div class="nb-slate-display">${_esc(production || 'Production')}</div>
      </div>
      ${shootDay !== '' && shootDay != null ? `<div class="nb-slate-day-sep">DAY</div><div class="nb-slate-day-num">${_esc(String(shootDay))}</div>` : ''}
    </div>
  </div>
  <div class="nb-slate-cell nb-sc-date">
    <div class="nb-slate-cell-label">DATE</div>
    <div class="nb-slate-cell-content">
      <div class="nb-slate-datetime">${_esc(dateStr)} &mdash; <span class="nb-slate-time">--:--:--</span></div>
    </div>
  </div>
  <div class="nb-slate-cell nb-sc-scene">
    <div class="nb-slate-cell-label">SCENE</div>
    <button class="nb-slate-cell-nudge" data-nudge="shot-prev" type="button">&lt;</button>
    <div class="nb-slate-cell-content">
      <div class="nb-slate-cell-number">
        <div class="nb-slate-display">${_esc(scene) || '&mdash;'}</div>
      </div>
      <div class="nb-slate-cell-subtitle" title="${_esc(sceneTitle)}">${_esc(sceneTitle)}</div>
    </div>
    <button class="nb-slate-cell-nudge" data-nudge="shot-next" type="button">&gt;</button>
  </div>
  <div class="nb-slate-cell nb-sc-shot">
    <div class="nb-slate-cell-label">SHOT</div>
    <button class="nb-slate-cell-nudge" data-nudge="shot-prev" type="button">&lt;</button>
    <div class="nb-slate-cell-content">
      <div class="nb-slate-cell-number">
        <div class="nb-slate-display">${_esc(alias) || '&mdash;'}</div>
      </div>
      <div class="nb-slate-cell-subtitle" title="${_esc(shotTitle)}">${_esc(shotTitle)}</div>
    </div>
    <button class="nb-slate-cell-nudge" data-nudge="shot-next" type="button">&gt;</button>
  </div>
  <div class="nb-slate-cell nb-sc-take">
    <div class="nb-slate-cell-label">TAKE</div>
    <button class="nb-slate-cell-nudge" data-nudge="take-dec" type="button">&lt;</button>
    <div class="nb-slate-cell-content">
      <input type="number" inputmode="numeric" value="${initState.nextTake}">
    </div>
    <button class="nb-slate-cell-nudge" data-nudge="take-inc" type="button">&gt;</button>
  </div>
  <div class="nb-slate-cell nb-sc-ctrl">
    <div class="nb-slate-cell-label">CTRL</div>
    <div class="nb-slate-cell-content">
      <div class="nb-slate-ctrl-grid"></div>
    </div>
  </div>
  <div class="nb-slate-cell nb-sc-cam">
    <div class="nb-slate-cell-label">CAM</div>
    <button class="nb-slate-cell-nudge" data-nudge="cam-prev" type="button">&lt;</button>
    <div class="nb-slate-cell-content">
      <input type="text" maxlength="4" value="${_esc(initState.camera)}">
    </div>
    <button class="nb-slate-cell-nudge" data-nudge="cam-next" type="button">&gt;</button>
  </div>
  <div class="nb-slate-cell nb-sc-roll">
    <div class="nb-slate-cell-label">ROLL</div>
    <div class="nb-slate-cell-content">
      <input type="text" value="${_esc(initState.tape)}">
    </div>
  </div>
  <div class="nb-slate-cell nb-sc-dir">
    <div class="nb-slate-cell-label">DIR</div>
    <div class="nb-slate-cell-content">
      <div class="nb-slate-display">${_esc(director) || '&mdash;'}</div>
    </div>
  </div>
  <div class="nb-slate-cell nb-sc-mos">
    <div class="nb-slate-cell-label">SOUND</div>
    <div class="nb-slate-cell-content">
      <button class="nb-slate-mos-btn" type="button">MOS</button>
    </div>
  </div>
  <div class="nb-slate-cell nb-sc-dop">
    <div class="nb-slate-cell-label">DOP</div>
    <div class="nb-slate-cell-content">
      <div class="nb-slate-display">${_esc(dop) || '&mdash;'}</div>
    </div>
  </div>
</div>
<div class="nb-slate-bar nb-slate-bar-bottom" role="button" aria-label="Snap"></div>
<div class="nb-slate-flash"></div>
<div class="nb-slate-rolling-sign"><span>ROLLING</span></div>
<div class="nb-slate-quiet-sign"><span>QUIET PLEASE</span></div>`;

        document.body.appendChild(overlay);

        // Apply slate font — font: in slate.md FM overrides; default is bold system sans-serif
        const slateFont = slateCfg.meta?.font;
        overlay.style.fontFamily = slateFont
            ? `${slateFont}, 'Liberation Sans', Arial, sans-serif`
            : "'Liberation Sans', Arial, Helvetica, sans-serif";
        overlay.style.fontWeight = '700';

        const slBody    = overlay.querySelector('.nb-slate-body');
        const topBar    = overlay.querySelector('.nb-slate-bar-top');
        const botBar    = overlay.querySelector('.nb-slate-bar-bottom');
        const flash     = overlay.querySelector('.nb-slate-flash');
        const mosBtn    = overlay.querySelector('.nb-slate-mos-btn');
        const mosCell   = overlay.querySelector('.nb-sc-mos');
        const timeEl    = overlay.querySelector('.nb-slate-time');
        const takeCell  = overlay.querySelector('.nb-sc-take');
        const camCell   = overlay.querySelector('.nb-sc-cam');
        const rollCell  = overlay.querySelector('.nb-sc-roll');
        const takeInp   = takeCell.querySelector('input');
        const camInp    = camCell.querySelector('input');
        const rollInp   = rollCell.querySelector('input');
        const takeCon   = takeCell.querySelector('.nb-slate-cell-content');
        const camCon    = camCell.querySelector('.nb-slate-cell-content');
        const rollCon   = rollCell.querySelector('.nb-slate-cell-content');
        // Static display elements
        const _disp = (sel) => overlay.querySelector(sel + ' .nb-slate-display');
        const _con  = (sel) => overlay.querySelector(sel + ' .nb-slate-cell-content');
        const prodDisp   = _disp('.nb-sc-prod');  const prodNameEl = overlay.querySelector('.nb-sc-prod-name');
        const sceneDisp  = _disp('.nb-sc-scene'); const sceneCon   = _con('.nb-sc-scene');
        const shotDisp   = _disp('.nb-sc-shot');  const shotCon    = _con('.nb-sc-shot');
        const sceneNumCon = overlay.querySelector('.nb-sc-scene .nb-slate-cell-number');
        const shotNumCon  = overlay.querySelector('.nb-sc-shot  .nb-slate-cell-number');
        const dirDisp    = _disp('.nb-sc-dir');   const dirCon     = _con('.nb-sc-dir');
        const dopDisp    = _disp('.nb-sc-dop');   const dopCon     = _con('.nb-sc-dop');
        const dateDisp   = overlay.querySelector('.nb-slate-datetime');
        const dateCon    = _con('.nb-sc-date');

        const valueEls = new Map([['take', takeInp], ['camera', camInp], ['tape', rollInp]]);
        const ctrlGrid = overlay.querySelector('.nb-slate-ctrl-grid');

        // Context-driven ctrl panel — 3-state (standby/go/action) + label-bar panels
        const _ctrlRender = (ctx) => {
            if (ctx.startsWith('panel:')) { _loadPanel(ctx.slice(6)); return; }
            ctrlGrid.classList.remove('nb-slate-ctrl-panel-mode');
            const b   = (lbl, act, cls='', style='') =>
                `<button class="nb-slate-ctrl-btn${cls?' '+cls:''}" data-action="${act}"${style?` style="${style}"`:''}>${lbl}</button>`;
            const big = (lbl, act, cls='') =>
                b(lbl, act, cls, 'grid-column:span 2;grid-row:span 2');
            const mt  = () =>
                `<button class="nb-slate-ctrl-btn" data-empty></button>`;
            let html;
            switch (ctx) {
                // ── STANDBY: ready, nothing rolling ───────────────────────────────────
                case 'standby':
                    html = [
                        big('ROLL CAMERA', 'roll', 'nb-slate-ctrl-roll'),
                        b('☾', 'dark-mode', 'nb-slate-ctrl-exit'),
                        b('EXIT', 'exit', 'nb-slate-ctrl-exit'),
                        b('SLATE', 'open-slate'),
                        b('NOTES', 'notes'),
                    ].join('');
                    break;
                // ── GO: camera rolling, slate and wait for ACTION ─────────────────────
                case 'go':
                    html = [
                        big('ACTION', 'action', 'nb-slate-ctrl-action'),
                        b('☾', 'dark-mode', 'nb-slate-ctrl-exit'),
                        b('EXIT', 'exit', 'nb-slate-ctrl-exit'),
                        b('SLATE', 'open-slate'),
                        b('NOTES', 'notes'),
                    ].join('');
                    break;
                // ── ACTION: rolling; CUT is the only active control ───────────────────
                case 'action':
                    html = [
                        big('CUT', 'cut', 'nb-slate-ctrl-cut'),
                        mt(), mt(), mt(), mt(),
                    ].join('');
                    break;
                default:
                    html = big('EXIT', 'exit', 'nb-slate-ctrl-exit');
            }
            ctrlGrid.innerHTML = html;
            ctrlGrid.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    switch (btn.dataset.action) {
                        case 'exit':
                            if (slateState === 'go') _setGo(false);
                            _close(); break;
                        case 'roll':      _rollCamera(); break;
                        case 'action':    _action(); break;
                        case 'cut':       _cut(); break;
                        case 'dark-mode': overlay.classList.toggle('nb-slate-dark'); break;
                        case 'open-slate':
                            if (slateCfg.selector) { NbMain.openNote(slateCfg.selector); _close(); }
                            break;
                        case 'notes': break; // TODO: post-take note entry
                    }
                });
            });
        };

        // Panel loader — replaces ctrl grid with a scrollable context list
        const _loadPanel = async (name) => {
            ctrlGrid.classList.add('nb-slate-ctrl-panel-mode');
            ctrlGrid.innerHTML =
                `<div class="nb-slate-panel-hdr">` +
                `<button class="nb-slate-ctrl-btn nb-slate-panel-back" data-action="home">←</button>` +
                `<span class="nb-slate-panel-title">${_esc(name.toUpperCase())}</span>` +
                `</div>` +
                `<div class="nb-slate-panel-body"><span style="padding:4px;opacity:0.5">…</span></div>`;
            ctrlGrid.querySelector('[data-action="home"]').addEventListener('click', e => {
                e.stopPropagation(); _ctrlRender('standby');
            });
            const body = ctrlGrid.querySelector('.nb-slate-panel-body');
            try {
                switch (name) {
                    case 'scene': await _panelScene(body); break;
                    case 'shot':  await _panelShot(body); break;
                    case 'day':   await _panelDay(body); break;
                    case 'roll':  await _panelRoll(body); break;
                    case 'cam':   _panelCam(body); break;
                    case 'take':  await _panelTake(body); break;
                    default:      body.innerHTML = _panelItem('—', name + ' — coming soon'); break;
                }
            } catch (err) {
                body.innerHTML = '<div style="padding:4px;color:#a93226;font-size:10px">Panel error</div>';
                console.warn('Slate panel:', name, err);
            }
        };

        // Panel helpers
        const _panelItem = (code, label, sel) =>
            `<div class="nb-slate-panel-item"${sel ? ` data-selector="${_esc(sel)}"` : ' style="cursor:default"'}>` +
            `<span class="nb-slate-panel-code">${_esc(String(code))}</span>` +
            `<span class="nb-slate-panel-name">${_esc(String(label))}</span></div>`;
        const _wireItems = (el) =>
            el.querySelectorAll('[data-selector]').forEach(item =>
                item.addEventListener('click', e => {
                    e.stopPropagation(); NbMain.openNote(item.dataset.selector); _close();
                })
            );

        const _panelScene = async (body) => {
            const data = await _fetchData(notebook);
            const dayStr = String(shootDay ?? '');
            const shots = (data.shots || []).filter(s =>
                dayStr && (String(s.day ?? '') === dayStr || String(s.shoot_day ?? '') === dayStr)
            );
            const sceneSet = new Set(shots.map(s => String(s.scene ?? '')).filter(Boolean));
            const scenes = (data.scenes || []).filter(s => sceneSet.has(String(s.alias ?? '')));
            if (!scenes.length) { body.innerHTML = _panelItem('—', 'No scenes for this day'); return; }
            body.innerHTML = scenes.map(s => _panelItem(s.alias, s.synopsis || s.title || s.alias, s.selector)).join('');
            _wireItems(body);
        };

        const _panelShot = async (body) => {
            const data = await _fetchData(notebook);
            const dayStr = String(shootDay ?? '');
            const shots = (data.shots || []).filter(s =>
                s.type !== 'lunch' && s.type !== 'move' &&
                (!dayStr || String(s.day ?? '') === dayStr || String(s.shoot_day ?? '') === dayStr)
            );
            if (!shots.length) { body.innerHTML = _panelItem('—', 'No shots scheduled'); return; }
            body.innerHTML = shots.map(s => {
                const id = s.scene && s.alias ? `${s.scene}.${s.alias}` : (s.alias || '?');
                return _panelItem(id, s.title || _descFirst(s.desc) || '', s.selector);
            }).join('');
            _wireItems(body);
        };

        const _panelTake = async (body) => {
            body.innerHTML = _panelItem('—', 'Take history — coming soon');
        };

        const _panelDay = async (body) => {
            if (shootDay === '' || shootDay == null) {
                body.innerHTML = _panelItem('—', 'No shoot day in slate.md'); return;
            }
            const sel = `${notebook}:shots/day_${shootDay}.md`;
            body.innerHTML = _panelItem(`DAY ${shootDay}`, `Open day_${shootDay}.md`, sel);
            _wireItems(body);
        };

        const _panelRoll = async (body) => {
            try {
                const r   = await fetch(`/api/note?selector=${encodeURIComponent(note.selector)}`);
                const d   = await r.json();
                const ann = d.annotation || '';
                const tapes = [...new Set(
                    [...ann.matchAll(/^i\s[^\n]*tape:([^,\s\n]+)/gm)].map(m => m[1])
                )];
                if (!tapes.length) { body.innerHTML = _panelItem('—', 'No rolls recorded this shot'); return; }
                body.innerHTML = tapes.map(t => _panelItem('🎞', t)).join('');
            } catch (_) { body.innerHTML = _panelItem('—', 'Could not load roll data'); }
        };

        const _panelCam = (body) => {
            if (!cameraList.length) {
                body.innerHTML = _panelItem('—', 'Add cameras: to slate.md'); return;
            }
            body.innerHTML = cameraList.map(c =>
                `<div class="nb-slate-panel-item nb-slate-panel-cam-pick" data-cam="${_esc(c)}">` +
                `<span class="nb-slate-panel-code">CAM</span>` +
                `<span class="nb-slate-panel-name">${_esc(c)}${camInp.value === c ? ' ✓' : ''}</span></div>`
            ).join('');
            body.querySelectorAll('[data-cam]').forEach(el =>
                el.addEventListener('click', e => {
                    e.stopPropagation();
                    camInp.value = el.dataset.cam;
                    _fitText(camInp, camCon);
                    _ctrlRender('standby');
                })
            );
        };

        // Label bars → context panels in standby state
        const _labelTap = (cellSel, panel) => {
            const lbl = overlay.querySelector(`${cellSel} .nb-slate-cell-label`);
            if (lbl) lbl.addEventListener('click', e => {
                e.stopPropagation();
                if (slateState === 'standby') _ctrlRender('panel:' + panel);
            });
        };
        _labelTap('.nb-sc-prod',  'prod');
        _labelTap('.nb-sc-date',  'date');
        _labelTap('.nb-sc-scene', 'scene');
        _labelTap('.nb-sc-shot',  'shot');
        _labelTap('.nb-sc-take',  'take');
        _labelTap('.nb-sc-cam',   'cam');
        _labelTap('.nb-sc-roll',  'roll');
        _labelTap('.nb-sc-mos',   'sound');
        _labelTap('.nb-sc-dir',   'dir');
        _labelTap('.nb-sc-dop',   'dop');
        overlay.querySelector('.nb-sc-ctrl .nb-slate-cell-label').addEventListener('click', e => {
            e.stopPropagation();
            if (slateState === 'standby') _ctrlRender('standby');
        });
        // DAY separator inside PROD cell also opens day panel
        const daySep = overlay.querySelector('.nb-slate-day-sep');
        if (daySep) {
            daySep.style.cursor = 'pointer';
            daySep.addEventListener('click', e => {
                e.stopPropagation();
                if (slateState === 'standby') _ctrlRender('panel:day');
            });
        }
        // MOS button toggles sound-off flag
        mosBtn.addEventListener('click', () => {
            mosActive = !mosActive;
            mosCell.classList.toggle('nb-slate-mos-active', mosActive);
        });

        // TAKE nudge buttons (< >) on cell edges
        takeCell.querySelector('[data-nudge="take-dec"]').addEventListener('click', e => {
            e.stopPropagation();
            takeInp.value = Math.max(minTake, (parseInt(takeInp.value, 10) || minTake) - 1);
            _fitText(takeInp, takeCon);
        });
        takeCell.querySelector('[data-nudge="take-inc"]').addEventListener('click', e => {
            e.stopPropagation();
            takeInp.value = (parseInt(takeInp.value, 10) || 0) + 1;
            _fitText(takeInp, takeCon);
        });

        takeInp.addEventListener('change', () => {
            const v = parseInt(takeInp.value, 10);
            if (isNaN(v) || v < minTake) { takeInp.value = minTake; }
            _fitText(takeInp, takeCon);
        });
        camInp.addEventListener('input',  () => _fitText(camInp,  camCon));
        rollInp.addEventListener('input', () => _fitText(rollInp, rollCon));

        // CAM nudge buttons — cycle through cameraList (< prev  next >)
        const _camCycle = dir => {
            if (!cameraList.length) return;
            const cur = camInp.value.trim();
            const idx = cameraList.indexOf(cur);
            const next = idx < 0
                ? (dir > 0 ? 0 : cameraList.length - 1)
                : (idx + dir + cameraList.length) % cameraList.length;
            camInp.value = cameraList[next];
            _fitText(camInp, camCon);
            if (slateState === 'go') _ctrlRender('go');
        };
        camCell.querySelector('[data-nudge="cam-prev"]')
            ?.addEventListener('click', e => { e.stopPropagation(); _camCycle(-1); });
        camCell.querySelector('[data-nudge="cam-next"]')
            ?.addEventListener('click', e => { e.stopPropagation(); _camCycle(+1); });

        // Shot sequence nudge buttons on SCENE and SHOT cells
        // Both cells share the same shot-prev/shot-next semantics (navigate shoot-day sequence)
        overlay.querySelectorAll('[data-nudge="shot-next"]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                if (slateState === 'standby') _nextShot();
            })
        );
        overlay.querySelectorAll('[data-nudge="shot-prev"]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                if (slateState === 'standby') _prevShot();
            })
        );

        const _fitAll = () => {
            _fitText(takeInp,   takeCon);
            _fitText(camInp,    camCon);
            _fitText(rollInp,   rollCon);
            if (prodDisp)  _fitText(prodDisp,  prodNameEl);
            if (sceneDisp) _fitText(sceneDisp, sceneNumCon || sceneCon);
            if (shotDisp)  _fitText(shotDisp,  shotNumCon  || shotCon);
            if (dirDisp)   _fitText(dirDisp,   dirCon);
            if (dopDisp)   _fitText(dopDisp,   dopCon);
            if (dateDisp)  _fitText(dateDisp,  dateCon);
        };
        requestAnimationFrame(_fitAll);
        window.addEventListener('resize', _fitAll);
        const ro = new ResizeObserver(_fitAll);
        ro.observe(slBody);

        let mosActive       = false;
        let takeCount       = initState.takeCount;
        let snapping        = false;
        let slateState      = initState.rolling ? 'action' : 'standby';
        let actionStartTime = null;
        let shootSeq        = null;   // lazy: ordered shots for this shoot_day
        let seqIdx          = -1;

        const durationEl = overlay.querySelector('.nb-slate-duration');

        const _setGo      = val => overlay.classList.toggle('nb-slate-go',      val);
        const _setRolling = val => overlay.classList.toggle('nb-slate-rolling',  val);

        if (slateState === 'action') _setRolling(true);
        _ctrlRender(slateState);

        // Live clock + rolling duration timer
        const _tick = () => {
            if (timeEl) timeEl.textContent = new Date().toTimeString().slice(0, 8);
            if (durationEl && actionStartTime !== null) {
                const s = Math.floor((Date.now() - actionStartTime) / 1000);
                const m = Math.floor(s / 60);
                durationEl.textContent = m + ':' + String(s % 60).padStart(2, '0');
            }
        };
        _tick();
        const clockId = setInterval(_tick, 1000);

        const getVal = key => {
            const el = valueEls.get(key);
            if (!el) return '';
            return el.tagName === 'INPUT' ? el.value.trim() : el.textContent.trim();
        };

        // Visual clapper snap — animation only, repeatable, no data write
        const _snapVisual = () => {
            if (snapping) return;
            snapping = true;
            slBody.style.opacity = '0';
            topBar.classList.add('nb-slate-snapping');
            botBar.classList.add('nb-slate-snapping');
            flash.classList.add('nb-slate-flashing');
            setTimeout(() => {
                topBar.classList.remove('nb-slate-snapping');
                botBar.classList.remove('nb-slate-snapping');
                flash.classList.remove('nb-slate-flashing');
                slBody.style.opacity = '1';
                snapping = false;
            }, 320);
        };

        // ROLL CAMERA — camera rolling, pre-action; no data written yet
        const _rollCamera = () => {
            slateState = 'go';
            _setGo(true);
            _ctrlRender('go');
        };

        // ACTION — director calls action; i: entry written, timers start
        const _action = async () => {
            if (slateState !== 'go') return;
            slateState = 'action';
            actionStartTime = Date.now();
            _setGo(false);
            _setRolling(true);
            _ctrlRender('action');
            const snap = {
                take:   parseInt(getVal('take'), 10) || 1,
                tape:   getVal('tape') || '',
                camera: getVal('camera') || 'A',
                fps:    initState.fps || '24',
                mos:    mosActive,
                scene, alias, shotFile,
            };
            try {
                const r  = await fetch(`/api/note?selector=${encodeURIComponent(note.selector)}`);
                const d  = await r.json();
                const up = _slateOpenTake(d.annotation || '', snap);
                const wr = await fetch(`/api/note/annotate?selector=${encodeURIComponent(note.selector)}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: up }),
                });
                if (!wr.ok) console.warn('Slate: action write failed', wr.status);
            } catch (err) { console.warn('Slate: action write error', err); }
        };

        // CUT — o: entry written, take# auto-incremented, back to standby
        const _cut = async () => {
            if (slateState !== 'action') return;
            try {
                const r  = await fetch(`/api/note?selector=${encodeURIComponent(note.selector)}`);
                const d  = await r.json();
                const up = _slateCloseTake(d.annotation || '');
                const wr = await fetch(`/api/note/annotate?selector=${encodeURIComponent(note.selector)}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: up }),
                });
                if (!wr.ok) console.warn('Slate: cut write failed', wr.status);
            } catch (err) { console.warn('Slate: cut write error', err); }
            takeCount++;
            takeInp.value = (parseInt(takeInp.value, 10) || 1) + 1;
            _fitText(takeInp, takeCon);
            mosActive = false;
            actionStartTime = null;
            if (durationEl) durationEl.textContent = '0:00';
            mosCell.classList.remove('nb-slate-mos-active');
            _setRolling(false);
            slateState = 'standby';
            _ctrlRender('standby');
        };

        // Shot sequence navigation — follows shoot_day stripboard order
        const _loadSeq = async () => {
            if (shootSeq) return;
            const data = await _fetchData(notebook);
            const dayStr = String(shootDay ?? '');
            shootSeq = dayStr
                ? (data.shots || []).filter(s =>
                    String(s.day ?? '') === dayStr || String(s.shoot_day ?? '') === dayStr)
                : (data.shots || []);
            seqIdx = shootSeq.findIndex(s => s.selector === note.selector);
        };

        const _showBreakStrip = (strip) => {
            const label = strip.type === 'lunch' ? 'LUNCH' : (strip.type === 'move' ? 'MOVE' : strip.type.toUpperCase());
            const bg    = strip.type === 'lunch' ? '#e8d5b0' : '#ffd090';
            const shotCell = overlay.querySelector('.nb-sc-shot');
            if (shotCell) shotCell.style.background = bg;
            if (sceneDisp) { sceneDisp.textContent = ''; _fitText(sceneDisp, sceneNumCon || sceneCon); }
            if (shotDisp)  { shotDisp.textContent  = label; _fitText(shotDisp, shotNumCon || shotCon); }
            const shotSub = overlay.querySelector('.nb-sc-shot .nb-slate-cell-subtitle');
            if (shotSub) shotSub.textContent = _descFirst(strip.desc) || '';
        };

        const _navigateToShot = async (shot) => {
            try {
                const r = await fetch(`/api/note?selector=${encodeURIComponent(shot.selector)}`);
                const d = await r.json();
                if (!d || d.error) return;
                if (!d.selector) d.selector = shot.selector;
                _close();
                await _showSlate(d);
            } catch (err) { console.warn('Slate: navigate error', err); }
        };

        const _stepSeq = async (dir) => {
            await _loadSeq();
            if (!shootSeq || !shootSeq.length) return;
            const next = seqIdx + dir;
            if (next < 0 || next >= shootSeq.length) return;
            seqIdx = next;
            const strip = shootSeq[seqIdx];
            if (strip.type === 'lunch' || strip.type === 'move') {
                _showBreakStrip(strip);
            } else {
                await _navigateToShot(strip);
            }
        };

        const _nextShot = () => _stepSeq(+1);
        const _prevShot = () => _stepSeq(-1);

        topBar.addEventListener('click', () => {
            if (slateState === 'go') _snapVisual();
        });
        botBar.addEventListener('click', () => {
            if (slateState === 'go') _snapVisual();
        });

        const _close = () => {
            clearInterval(clockId);
            ro.disconnect();
            window.removeEventListener('resize', _fitAll);
            overlay.remove();
            document.removeEventListener('keydown', _esc_key);
        };
        const _esc_key = e => { if (e.key === 'Escape') _close(); };
        document.addEventListener('keydown', _esc_key);
    }

    function _renderShotHeader(note) {
        const m     = note.meta || {};
        const alias = m.alias != null ? String(m.alias) : '';
        const scene = m.scene != null ? String(m.scene) : '';
        const ie    = (m.int_ext   || '').charAt(0).toUpperCase();
        const dn    = (m.day_night || '').charAt(0).toUpperCase();
        const dnie  = (ie && dn) ? ie + dn : (ie || dn || '');
        const loc   = m.loc        ? String(m.loc)        : '';
        const day   = m.day  != null ? String(m.day)      : '';
        const pages = m.page_count  ? String(m.page_count): '';

        const shotId = scene && alias ? `SC ${_esc(scene)} · ${_esc(alias)}`
                     : alias          ? _esc(alias)
                     : scene          ? `SC ${_esc(scene)}`
                     : _esc(note.title || '');

        const dnieLabel = { ID: 'INT·DAY', ED: 'EXT·DAY', IN: 'INT·NIGHT', EN: 'EXT·NIGHT' };
        const dniePill  = dnie
            ? `<span class="nb-specialty-pill nb-cine-shot-pill-dnie nb-cine-strip-${dnie}">${dnieLabel[dnie] || dnie}</span>`
            : '';
        const locPill   = loc   ? `<span class="nb-specialty-pill">${_esc(loc)}</span>`      : '';
        const dayPill   = day   ? `<span class="nb-specialty-pill">Day ${_esc(day)}</span>` : '';
        const pagesPill = pages ? `<span class="nb-specialty-pill">${_esc(pages)}p</span>`  : '';

        const takeCount = note.annotation
            ? (note.annotation.match(/^\|\s*\d+\s*\|/gm) || []).length : 0;
        const takesPill = takeCount > 0
            ? `<button class="nb-specialty-pill nb-cine-takes-pill" data-action="view-takes" title="Scroll to take log">📋 ${takeCount} take${takeCount !== 1 ? 's' : ''}</button>`
            : '';

        return `<div class="nb-specialty-header nb-cine-shot-hdr" data-selector="${_esc(note.selector || '')}" data-dnie="${_esc(dnie)}">
  <span class="nb-specialty-icon">🎬</span>
  <span class="nb-specialty-label">${shotId}</span>
  ${dniePill}${locPill}${dayPill}${pagesPill}${takesPill}
  <span class="nb-specialty-right">
    <button class="nb-specialty-action nb-cine-slate-btn" data-slate-sel="${_esc(note.selector || '')}">🎞 Slate</button>
  </span>
</div>`;
    }

    function _renderShotCard(note) {
        const m = note.meta || {};
        const alias    = m.alias     ? String(m.alias)    : '';
        const scene    = m.scene     != null ? String(m.scene) : '';
        const shotName = m.shot      ? String(m.shot)     : '';
        const dn       = (m.day_night || '').toUpperCase();
        const ie       = (m.int_ext   || '').toUpperCase();
        const loc      = m.loc  ? String(m.loc)  : '';
        const day      = m.day  != null ? String(m.day) : '';
        const desc     = typeof m.desc === 'string' ? m.desc.trim() : '';

        const tech = _parseBlock(typeof m.tech === 'string' ? m.tech : '');
        const art  = _parseBlock(typeof m.art  === 'string' ? m.art  : '');
        const cast = _parseBlock(typeof m.cast === 'string' ? m.cast : '');

        // Strip color class from I/E + D/N
        const colorClass = (ie && dn) ? ie + dn : (ie || dn || 'scene');
        const dnie       = [dn, ie].filter(Boolean).join('');

        const actorCodes = cast.actors
            ? cast.actors.split(/,\s*/).map(s => s.trim()).filter(Boolean) : [];
        const extrasChip = cast.extras
            ? `<span class="nb-cine-cast-chip nb-cine-cast-extras">+${_esc(cast.extras)} extras</span>` : '';

        const _row = (k, v) => v
            ? `<div class="nb-contact-row"><span class="nb-contact-label">${_esc(k)}</span><span class="nb-contact-value">${_esc(v)}</span></div>`
            : '';
        const _sec = (label, obj) => {
            const rows = Object.entries(obj).filter(([, v]) => v).map(([k, v]) => _row(k, v)).join('');
            return rows
                ? `<div class="nb-cine-card-sec"><div class="nb-cine-card-sec-lbl">${_esc(label)}</div><div class="nb-contact-fields">${rows}</div></div>`
                : '';
        };

        const subParts = [scene ? `Sc. ${scene}` : '', day ? `Day ${day}` : ''].filter(Boolean);

        const castChipHtml = [
            ...actorCodes.map(c => `<span class="nb-cine-cast-chip">${_esc(c)}</span>`),
            extrasChip,
        ].filter(Boolean).join('');

        // Fields inside .nb-cine-card-fm — toggled visible/hidden by the ◉ extras toggle.
        // Body stays outside the card box so annotation button is never obscured.
        const fieldsInner = [
            subParts.length  ? `<div class="nb-cine-sc-sub">${_esc(subParts.join('  ·  '))}</div>` : '',
            shotName         ? `<div class="nb-cine-sc-name">${_esc(shotName)}</div>` : '',
            desc             ? `<div class="nb-cine-sc-desc">${_esc(desc)}</div>` : '',
            castChipHtml     ? `<div class="nb-cine-sc-cast">${castChipHtml}</div>` : '',
            _sec('tech', tech),
            _sec('art', art),
        ].filter(Boolean).join('');

        const bodyHtml = (note.body || '').trim()
            ? `<div class="nb-wp-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>`
            : '';

        return `<div class="nb-cine-shot-card">
  ${fieldsInner ? `<div class="nb-card nb-cine-card-fm">${fieldsInner}</div>` : ''}
  ${bodyHtml}
</div>`;
    }

    // ── Day card (type: day) ─────────────────────────────────────────────────

    function _renderDayCard(note) {
        const m      = note.meta || {};
        const dayNo  = m.day != null ? String(m.day) : '';
        const date   = (m.date || '').trim();
        const hours  = _parseBlock(typeof m.hours === 'string' ? m.hours : '');

        const dateHtml = date
            ? `<div class="nb-card-row"><span class="nb-card-label">date</span><span class="nb-card-value">${_esc(date)}</span></div>`
            : `<div class="nb-card-row"><span class="nb-card-label">date</span><span class="nb-card-value" style="color:var(--text-muted);font-style:italic">unscheduled</span></div>`;

        const hoursRows = Object.entries(hours)
            .filter(([, v]) => v != null && v !== '')
            .map(([k, v]) => _cRow(k, v))
            .join('');

        const hoursHtml = hoursRows
            ? `<div class="nb-card-block"><div class="nb-card-block-key">hours</div><div class="nb-card-block-fields">${hoursRows}</div></div>`
            : '';

        const extraFields = _cAllFields(m, {
            type:  () => '',
            day:   () => '',
            date:  () => '',
            hours: () => '',
        });

        const fields = [dateHtml, hoursHtml, extraFields].filter(Boolean).join('');

        const bodyHtml = (note.body || '').trim()
            ? `<div class="nb-card-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';

        return `<div class="nb-cine-shot-card">` +
            `<div class="nb-card nb-cine-card-fm">` +
            `<div class="nb-card-header"><div class="nb-card-avatar" style="background:var(--accent)">${_esc(dayNo || '?')}</div>` +
            `<div><div class="nb-card-title">Day ${_esc(dayNo || '—')}</div>` +
            `<div class="nb-card-sub">${date ? _esc(date) : 'Unscheduled'}</div></div></div>` +
            `<div class="nb-card-fields">${fields}</div></div>` +
            `${bodyHtml}</div>`;
    }

    // ── Resource card (type: resource) ───────────────────────────────────────

    function _renderResourceCard(note) {
        const m    = note.meta || {};
        const name = (m.resource || note.title || '').trim();
        const code = (m.code || '').trim();
        const unit = (m.unit || 'day').trim().toLowerCase();
        const hoursType = (m.hours_type || '').trim();

        const unitDisplay = unit === 'hour' && hoursType
            ? `${unit} (${hoursType} hours)`
            : unit;

        const fields = _cAllFields(m, {
            type:       () => '',
            resource:   () => '',
            code:       v  => _cRow('code', v),
            supplier:   v  => _cRow('supplier', v),
            unit:       () => _cRow('unit', unitDisplay),
            hours_type: () => '',          // folded into unit row above
            'cost per': v  => _cRow('cost per', v),
            start:      v  => _cRow('start', v),
            end:        v  => _cRow('end', v),
            lock:       () => '',
        });

        const bodyHtml = (note.body || '').trim()
            ? `<div class="nb-card-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';

        return `<div class="nb-cine-shot-card">` +
            `<div class="nb-card nb-cine-card-fm">` +
            `<div class="nb-card-header">` +
            `<div class="nb-card-avatar" style="background:${_cColor(code)}">${_esc(_cInitials(code))}</div>` +
            `<div><div class="nb-card-title">${_esc(name)}</div>` +
            `<div class="nb-card-sub">${_esc(code)}</div></div></div>` +
            `<div class="nb-card-fields">${fields}</div></div>` +
            `${bodyHtml}</div>`;
    }

    // ── Display label (list display + sort) ──────────────────────────────────
    // Shared by listTitle and the 'display' sort option so both see the same string.

    function _displayLabel(note) {
        if (!note.meta) return note.title || note.filename || '';
        const alias = String(note.meta.alias ?? '').trim();
        const title = (note.title || '').trim();

        if (note.type === 'shot') {
            const scene = String(note.meta.scene ?? '');
            const id    = scene && alias ? `${scene}.${alias}` : (alias || scene || '');
            const label = title || String(note.meta.desc ?? '').trim().split('\n')[0];
            return id && label ? `${id} — ${label}` : (id || label || note.filename || '');
        }
        if (note.type === 'character') {
            // alias: is the casting link (actor stem), not a display code
            const code = (note.filename || '').replace(/\.md$/i, '');
            return code && title ? `${code} — ${title}` : (title || code || note.filename || '');
        }
        if (note.type === 'resource') {
            const code = (note.meta.code || '').trim();
            const name = (note.meta.resource || note.title || '').trim();
            return code && name ? `${code} — ${name}` : (name || code || note.filename || '');
        }
        if (note.type === 'day') {
            const dayNo = note.meta.day != null ? `Day ${note.meta.day}` : '';
            const date  = (note.meta.date || '').trim();
            return dayNo && date ? `${dayNo} — ${date}` : (dayNo || date || note.filename || '');
        }
        if (alias && title) return `${alias} — ${title}`;
        return title || alias || note.filename || '';
    }

    // ── Plugin registration ───────────────────────────────────────────────────

    // Only the master type:storyline note is registered into nbweb-specialty's
    // cross-type nav popup (dashboard/project headers etc. can jump straight to
    // it, and vice versa) -- deliberately not story/plotline/milestone, which
    // would flood that popup with every card in the notebook and aren't
    // meaningfully "navigable" as a flat list from a header dropdown the way a
    // handful of per-production storyline notes are. nbweb-specialty.js loads
    // before nbweb-cine.js (see nb-settings.json plugin order), but this is
    // still optional-chained defensively rather than assumed.
    // noRender: true is required -- without it, nbweb-specialty's own generic
    // previewRenderer starts competing for type:storyline notes too (it just
    // wants the type in _cfg for nav-popup/pill purposes) and won, silently
    // replacing cine's real storyline-story/storyline-note UI with a bare
    // FM-field dump. Same mechanism nbweb-quartz's 'item' type already needed.
    window.NbSpecialty?.register?.('storyline', { icon: '🧵', label: 'Storyline', noRender: true });

    NbWeb.registerModule('cine', {
        label:       'NbWeb-cine',
        description: 'Film production scheduling — stripboard, call sheets, script tools',
        helpUrl:     '/plugins/nbweb-cine.md',
        fmKeys: ['scene', 'shot', 'loc', 'day_night', 'int_ext', 'cast', 'extras',
                 'vfx', 'sequence', 'script_day', 'page_count', 'shoot_day',
                 'stripboard', 'breakdown', 'props', 'wardrobe', 'sfx',
                 'director', 'dp', 'producer', 'fps'],

        // .nb-cine-card-fm is the togglable field block inside shot and scene cards.
        // Strip header always stays visible; body/annotation button always accessible.
        hideExtrasCSS: `
            #nb-preview-content.nb-extras-hidden .nb-cine-card-fm { display: none; }
            #nb-preview-content.nb-extras-hidden .nb-cine-card-fm + .nb-wp-body,
            #nb-preview-content.nb-extras-hidden .nb-cine-card-fm + .nb-card-body { margin-top: 0; }
        `,

        detect: notebooks => notebooks.filter(nb => nb.cine !== null && nb.cine !== undefined),

        requirementCheck: async () => {
            const cineNbs = NbWeb.notebooks().filter(nb => nb.cine != null);
            if (cineNbs.length) return { ok: true };
            return { ok: false, markdownFile: '/plugins/requirements/cine-requirements.md' };
        },

        pluginContent: el => {
            const cineNbs = NbWeb.notebooks().filter(nb => nb.cine != null);
            if (!cineNbs.length) return;
            el.innerHTML = `
                <div class="nb-plugin-section">
                    <div class="nb-plugin-section-title">Active projects</div>
                    ${cineNbs.map(nb => {
                        const project = nb.cine?.project || nb.name;
                        const aka     = nb.cine?.aka ? ` <span style="opacity:0.5;font-size:0.85em">aka ${_esc(nb.cine.aka)}</span>` : '';
                        return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0">
                            <span>🎬</span>
                            <strong>${_esc(project)}</strong>${aka}
                            <button class="nb-tool-btn nb-cine-plug-link"
                                data-nb="${_esc(nb.name)}"
                                style="margin-left:auto">Shots</button>
                            <button class="nb-tool-btn nb-cine-plug-link"
                                data-nb="${_esc(nb.name)}" data-type="plotline">Storylines</button>
                        </div>`;
                    }).join('')}
                </div>`;
            el.querySelectorAll('.nb-cine-plug-link').forEach(btn => {
                btn.addEventListener('click', () => NbNav.switchNotebook(btn.dataset.nb));
            });
        },

        previewRenderers: [
            {
                id:     'script',
                icon:   '🎬',
                label:  'Script',
                types:  ['script'],
                detect: note => note.type === 'script',
                render: note => _renderScriptNote(note),
            },
            {
                id:     'script-markdown',
                icon:   '📝',
                label:  'Markdown',
                types:  ['script'],
                detect: note => note.type === 'script',
                render: note => {
                    const body = (note.body || '').trim();
                    if (typeof marked === 'undefined')
                        return `<div class="nb-cine-plain-script"><pre>${_esc(body)}</pre></div>`;
                    const withLinks = body.replace(
                        /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
                        (_, target, label) => {
                            const t = target.trim();
                            return `<span class="nb-wiki-link" data-selector="${_esc(t)}"${label ? '' : ' data-autolabel="1"'}>${_esc(label?.trim() || t)}</span>`;
                        }
                    );
                    return `<div class="nb-cine-plain-script nb-rendered">${marked.parse(withLinks)}</div>`;
                },
            },
            {
                id:     'plotline-card',
                icon:   '🧶',
                label:  'Plotline',
                types:  ['plotline'],
                detect: note => note.type === 'plotline',
                render: async note => (await _renderPlotlineHeader(note)) + _renderPlotlineCard(note),
            },
            {
                id:     'storyline-story',
                icon:   '📖',
                label:  'Story view',
                types:  ['storyline'],
                detect: note => note.type === 'storyline',
                render: note => {
                    const raw     = (note.meta?.project || '').trim();
                    const project = raw.replace(/^storylines\//, '').replace(/\/$/, '');
                    return `<div class="nb-cine-block" data-query="storyline-story"${project ? ` data-project="${_esc(project)}"` : ''}><span class="nb-spin">⟳</span></div>`;
                },
            },
            {
                // The master storyline note's own written word -- until this
                // renderer existed, type:storyline had exactly one view (the
                // aggregate board/story data), so the note's *own* body was
                // permanently unreachable through the preview pane no matter
                // what it said. Plain body render, no board machinery. Reached
                // either via nb-web's own multi-renderer tab switcher (auto-
                // appears now that this type has 2 renderers) or via the
                // storyline header's title-click / a plotline-or-story
                // header's title-click jumping up to its parent storyline
                // (see the delegated .nb-cine-title-nav click handler below).
                id:     'storyline-note',
                icon:   '📝',
                label:  'Note',
                types:  ['storyline'],
                detect: note => note.type === 'storyline',
                // Routed through _loadCineBlock (like storyline-story/-script) rather than
                // returned as a plain string -- gives it a real, persistent DOM element to
                // build the shared header into, with working closures for the Board/Story/
                // Script return-trip buttons. A plain-string render can't do that: its
                // previewRenderer output is serialized once into innerHTML, so any header
                // built there could show the same icons but none of the clicks would work.
                render: note => {
                    const raw     = (note.meta?.project || '').trim();
                    const project = raw.replace(/^storylines\//, '').replace(/\/$/, '');
                    return `<div class="nb-cine-block" data-query="storyline-note"${project ? ` data-project="${_esc(project)}"` : ''}><span class="nb-spin">⟳</span></div>`;
                },
            },
            {
                id:     'story-card',
                icon:   '🃏',
                label:  'Story card',
                types:  ['story'],
                detect: note => note.type === 'story',
                render: async note => {
                    const m        = note.meta || {};
                    const desc     = m.desc     ? String(m.desc).trim()     : '';
                    const scenes   = m.scenes   ? String(m.scenes).trim()   : '';
                    // plotline/story_seq now live in _renderStoryHeader above.
                    const skip     = new Set(['title','type','plotline','seq','desc','scenes','color','lock','story_seq']);
                    const extras   = Object.entries(m).filter(([k,v]) => !skip.has(k) && v != null && String(v).trim());
                    const _row = (k, v) =>
                        `<div class="nb-contact-row"><span class="nb-contact-label">${_esc(k)}</span><span class="nb-contact-value">${_esc(String(v))}</span></div>`;
                    const scenesHtml = scenes
                        ? scenes.split(/[,\s]+/).filter(Boolean).map(s =>
                            `<span class="nb-cine-cast-chip nb-wiki-link" data-selector="${_esc(s.trim())}">${_esc(s.trim())}</span>`).join('')
                        : '';
                    const inner = [
                        desc     ? `<div class="nb-cine-sc-desc">${_esc(desc)}</div>` : '',
                        scenesHtml ? `<div class="nb-cine-sc-cast">${scenesHtml}</div>` : '',
                        extras.length ? extras.map(([k,v]) => _row(k, String(v).trim())).join('') : '',
                    ].filter(Boolean).join('');
                    const bodyHtml = (note.body || '').trim()
                        ? `<div class="nb-wp-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';
                    const headerHtml = await _renderStoryHeader(note);
                    return `<div class="nb-cine-shot-card">
                        ${headerHtml}
                        ${inner ? `<div class="nb-card nb-cine-card-fm">${inner}</div>` : ''}
                        ${bodyHtml}
                    </div>`;
                },
            },
            {
                id:     'milestone-card',
                icon:   '🏁',
                label:  'Milestone card',
                types:  ['milestone'],
                detect: note => note.type === 'milestone',
                render: async note => {
                    const m      = note.meta || {};
                    // milestone_seq/story_seq now live in _renderMilestoneHeader above.
                    const skip   = new Set(['title','type','milestone_seq','story_seq','color','lock']);
                    const extras = Object.entries(m).filter(([k,v]) => !skip.has(k) && v != null && String(v).trim());
                    const _row = (k, v) =>
                        `<div class="nb-contact-row"><span class="nb-contact-label">${_esc(k)}</span><span class="nb-contact-value">${_esc(String(v))}</span></div>`;
                    const inner = extras.length ? extras.map(([k,v]) => _row(k, String(v).trim())).join('') : '';
                    const bodyHtml = (note.body || '').trim()
                        ? `<div class="nb-wp-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';
                    const headerHtml = await _renderMilestoneHeader(note);
                    return `<div class="nb-cine-shot-card">
                        ${headerHtml}
                        ${inner ? `<div class="nb-card nb-cine-card-fm">${inner}</div>` : ''}
                        ${bodyHtml}
                    </div>`;
                },
            },
            {
                id:       'shot-card',
                icon:     '🎬',
                label:    'Shot card',
                types:    ['shot'],
                fullCard: true,
                detect:   note => note.type === 'shot',
                render:   note => _renderShotHeader(note) + _renderShotCard(note),
            },
            {
                id:     'screenplay',
                icon:   '🎬',
                label:  'Screenplay format',
                types:  ['scene'],
                detect: note => note.type === 'scene',
                render: note => _renderSceneHeader(note) + _renderScript(note),
            },
            {
                id:     'markdown',
                icon:   '📝',
                label:  'Markdown',
                types:  ['scene'],
                detect: note => note.type === 'scene',
                render: note => {
                    if (note.type !== 'scene') return null;
                    const header = _renderSceneHeader(note);
                    const body = (note.body || '').trim();
                    if (typeof marked === 'undefined')
                        return header + `<div class="nb-cine-plain-script"><pre>${_esc(body)}</pre></div>`;
                    // Pre-process Fountain-specific syntax that marked would render as blockquotes.
                    let processed = body
                        .replace(/^> (.+?) <\s*$/gm, (_, t) =>
                            `<p class="nb-script-centered">${_esc(t.trim())}</p>`)
                        .replace(/^> (.+)$/gm, (_, t) =>
                            `<p class="nb-script-transition">${_esc(t.trim())}</p>`);
                    // Pre-process [[wikilinks]] into nb-wiki-link spans before marked runs.
                    const withLinks = processed.replace(
                        /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
                        (_, target, label) => {
                            const t = target.trim();
                            return `<span class="nb-wiki-link" data-selector="${_esc(t)}"${label ? '' : ' data-autolabel="1"'}>${_esc(label?.trim() || t)}</span>`;
                        }
                    );
                    return header + `<div class="nb-cine-plain-script nb-rendered">${marked.parse(withLinks)}</div>`;
                },
            },
            {
                id:     'scene-card',
                icon:   '🎞',
                label:  'Scene card',
                types:  ['scene'],
                detect: note => note.type === 'scene',
                render: note => _renderSceneHeader(note) + _renderSceneCard(note),
            },
            {
                id:     'actor-card',
                icon:   '🧑',
                label:  'Actor card',
                types:  ['actor'],
                detect: note => note.type === 'actor',
                render: note => _renderActorCard(note),
            },
            {
                id:     'character-card',
                icon:   '🎭',
                label:  'Character card',
                types:  ['character'],
                detect: note => note.type === 'character',
                render: note => _renderCharacterCard(note),
            },
            {
                id:     'location-card',
                icon:   '📍',
                label:  'Location card',
                types:  ['location'],
                detect: note => note.type === 'location',
                render: note => _renderLocationCard(note),
            },
            {
                id:     'day-card',
                icon:   '📅',
                label:  'Day card',
                types:  ['day'],
                detect: note => note.type === 'day',
                render: note => _renderDayCard(note),
            },
            {
                id:     'resource-card',
                icon:   '🎁',
                label:  'Resource card',
                types:  ['resource'],
                detect: note => note.type === 'resource',
                render: note => _renderResourceCard(note),
            },
        ],

        listItemIcon: note => {
            const TYPE_ICONS = {
                shot: '🎬', scene: '📜', slate: '🎬',
                character: '🎭', actor: '🧑',
                location: '📍', resource: '🎁', day: '📅',
            };
            return TYPE_ICONS[note.type] ?? null;
        },

        codeblockRenderers: [{
            lang: 'cine',
            html: text => `<div class="nb-cine-block" data-query="${_esc(text.trim())}"><span class="nb-spin">⟳</span></div>`,
            render: async container => {
                const blocks = [...container.querySelectorAll('.nb-cine-block')];
                NbWeb.statusPill?.add(blocks.length);
                for (const el of blocks) {
                    try {
                        await _loadCineBlock(el);
                    } finally {
                        NbWeb.statusPill?.tick();
                    }
                }
                // Enrich shot-cue tooltips with desc from cached board data
                const cues = [...container.querySelectorAll('.nb-cine-shot-cue[data-selector]')];
                if (!cues.length) return;
                const nb = typeof NbNav !== 'undefined' && NbNav.notebook !== '_all'
                    ? NbNav.notebook : null;
                if (!nb) return;
                try {
                    const data  = await _fetchData(nb);
                    const byId  = new Map((data.shots || []).map(s => [s.shot, s]));
                    for (const cue of cues) {
                        const shot = byId.get(cue.dataset.selector);
                        if (shot?.desc) cue.title = `${cue.dataset.selector}: ${shot.desc}`;
                    }
                } catch (_) {}
            },
        }],

        hideExtrasCSS: `
#nb-preview-content.nb-extras-hidden .nb-cine-shot-cue { display: none; }
`,

        listTitle: note => _displayLabel(note) || null,

        editorKeybindings: note => note.type === 'scene' ? [{
            key:    '[',
            ctrl:   true,
            shift:  false,
            alt:    false,
            label:  'Insert shot reference (Ctrl+[)',
            action: _insertShotAction,
        }] : [],

        listDefaults: { listType: 'shot', sortOrder: 'alias' },

        sortOptions: [{
            id:    'alias',
            label: 'Alias',
            sort:  notes => [...notes].sort((a, b) => {
                const va = a.meta?.alias;
                const vb = b.meta?.alias;
                const na = Number(va), nb = Number(vb);
                if (!isNaN(na) && !isNaN(nb)) return na - nb;
                if (va == null && vb == null) return 0;
                if (va == null) return 1;
                if (vb == null) return -1;
                return String(va).localeCompare(String(vb));
            }),
        }, {
            id:    'display',
            label: 'Alias — Title',
            sort:  notes => [...notes].sort((a, b) =>
                _displayLabel(a).localeCompare(_displayLabel(b))
            ),
        }],
    });

    // ── Header title-click navigation (storyline's own header) ─────────────
    // storyline header title (data-nav-mode="self"): switch this same note to
    // the 'storyline-note' renderer tab (plain body, no board machinery).
    const _STORYLINE_NOTE_MODE = 'storyline-note';

    document.addEventListener('click', async e => {
        const el = e.target.closest('.nb-cine-title-nav[data-nav-mode="self"]');
        if (!el) return;
        e.stopPropagation();
        const note = NbMain.activeNote();
        if (!note) return;
        // Board view's own header title carries this same data-nav-mode --
        // the note switch below happens underneath the still-open full-screen
        // overlay otherwise, invisibly.
        _slOverlayClose?.();
        localStorage.setItem(`nb-render-mode:${note.notebook}`, _STORYLINE_NOTE_MODE);
        await NbMain.openNote(note.selector);
    }, true);

    // ── Plotline/story header: title + view-switcher navigation ────────────
    // [data-sl-view] fires from two places: a plotline/story header's title
    // (always "note", pre-resolved by _resolveParentStoryline at render time
    // -- see data-sl-target) and its Board/Story/Script view-group (this
    // repo's storyline notes have no separate "open board directly" sub-
    // state, so board sets the same one-shot pending-open flag the Note
    // view's own return-trip uses). Missing data-sl-target (project has no
    // resolvable storyline note yet) degrades to an explanatory alert rather
    // than a silent no-op or a wrong navigation.
    document.addEventListener('click', async e => {
        const btn = e.target.closest('[data-sl-view]');
        if (!btn) return;
        e.stopPropagation();
        const targetSel = btn.dataset.slTarget || btn.closest('[data-sl-target]')?.dataset.slTarget || '';
        if (!targetSel) { alert('No storyline note found for this project yet.'); return; }
        const notebook = targetSel.split(':')[0];
        const view = btn.dataset.slView;
        if (view === 'note') {
            localStorage.setItem(`nb-render-mode:${notebook}`, _STORYLINE_NOTE_MODE);
        } else {
            if (view === 'board') localStorage.setItem(_SL_PENDING_BOARD_KEY(notebook), '1');
            else localStorage.setItem(_SL_VIEW_KEY(notebook), view === 'script' ? 'script' : 'story');
            localStorage.setItem(`nb-render-mode:${notebook}`, 'storyline-story');
        }
        await NbMain.openNote(targetSel);
    }, true);

    // ── Big + stub (story/plotline headers) ─────────────────────────────────
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-sl-action="stub-add"]');
        if (!btn) return;
        e.stopPropagation();
        alert('Coming soon — not built yet.');
    }, true);

    // ── Slate launch button delegation ────────────────────────────────────────
    document.addEventListener('click', async e => {
        const btn = e.target.closest('.nb-cine-slate-btn');
        if (!btn) return;
        e.stopPropagation();
        const sel  = btn.dataset.slateSel;
        const note = NbMain.activeNote();
        if (note && sel && note.selector === sel) {
            await _showSlate(note);
        } else if (sel) {
            try {
                const r    = await fetch(`/api/note?selector=${encodeURIComponent(sel)}`);
                const data = await r.json();
                if (data && !data.error) { if (!data.selector) data.selector = sel; await _showSlate(data); }
            } catch (_) {}
        }
    }, true);

    // ── Takes pill — scroll to annotation foot ────────────────────────────────
    document.addEventListener('click', e => {
        if (!e.target.closest('[data-action="view-takes"]')) return;
        e.stopPropagation();
        document.querySelector('.nb-annotation-foot')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, true);

// ── Fountain / PDF export buttons ─────────────────────────────────────────
    document.addEventListener('click', e => {
        const fountain = e.target.closest('.nb-script-dl-fountain');
        const pdf      = e.target.closest('.nb-script-dl-pdf');
        const btn = fountain || pdf;
        if (!btn) return;
        const nb = btn.dataset.notebook;
        if (!nb) return;
        const endpoint = fountain
            ? `/api/cine/export-fountain?notebook=${encodeURIComponent(nb)}`
            : `/api/cine/export-pdf?notebook=${encodeURIComponent(nb)}`;
        if (pdf) { btn.textContent = '⏳ PDF…'; btn.disabled = true; }
        const a = document.createElement('a');
        a.href = endpoint; a.download = '';
        document.body.appendChild(a); a.click(); a.remove();
        if (pdf) setTimeout(() => { btn.textContent = '⬇ PDF'; btn.disabled = false; }, 4000);
    });

})();
