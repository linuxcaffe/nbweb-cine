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

/* Screenplay preview — paper page */
.nb-cine-screenplay {
    padding: 24px; background: var(--bg, #1a1a1a); min-height: 100%;
}
.nb-script-page {
    max-width: 640px; margin: 0 auto;
    background: #fff; color: #111;
    font-family: 'Courier Prime', 'Courier New', Courier, monospace;
    font-size: 12pt; line-height: 1.55;
    padding: 72px 72px 96px;
    box-shadow: 0 4px 28px rgba(0,0,0,.5);
}
.nb-script-slug {
    font-weight: bold; text-transform: uppercase;
    border-bottom: 1px solid #222;
    padding-bottom: 6px; margin-bottom: 24px;
    letter-spacing: .05em;
}
.nb-script-scene-tag { float: right; font-weight: normal; opacity: .45; font-size: .85em; }
.nb-script-action   { margin: 0 0 12px; }
.nb-script-char     { margin: 18px 0 0; padding-left: 38%; text-transform: uppercase; }
.nb-script-dialogue { margin: 0 0 8px; padding: 0 15% 0 25%; }
.nb-script-paren    { margin: 0; padding: 0 22% 0 32%; font-style: italic; }

/* Shot cue superscripts — [[1c]] inside screenplay body */
sup.nb-cine-shot-cue {
    font-size: 0.62em; font-family: 'Courier New', Courier, monospace;
    color: #888; font-style: normal; font-weight: normal;
    cursor: pointer; user-select: none; margin-left: 1px;
}
sup.nb-cine-shot-cue:hover { color: #c77; text-decoration: underline; }

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
.nb-cine-sl-overlay-body { flex: 1; overflow-x: auto; overflow-y: auto; }
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
.nb-cine-story-card:active { cursor: grabbing; }
.nb-cine-story-title { font-weight: bold; margin-bottom: 3px; }
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

.nb-cine-lane-label { position: relative; }
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
        let fieldPart, codes = [];
        if (colonIdx >= 0) {
            fieldPart = lhs.slice(0, colonIdx).trim();
            codes = lhs.slice(colonIdx + 1).split(',').map(s => s.trim()).filter(Boolean);
        } else {
            fieldPart = lhs.split(/\s+/)[0] || '';
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

        return { field, format, filter, codes };
    }

    // ── Data cache ────────────────────────────────────────────────────────────

    const _cache = new Map();
    const _TTL   = 30000;

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

    // ── Script renderer ───────────────────────────────────────────────────────

    function _parseScriptBody(raw) {
        let text = raw || '';
        if (text.startsWith('---')) {
            const end = text.indexOf('\n---', 3);
            if (end !== -1) text = text.slice(end + 4).trimStart();
        }
        const chunks = [];
        let afterChar = false;
        for (const line of text.split('\n')) {
            const indent  = line.search(/\S/);
            const trimmed = line.trim();
            if (!trimmed) {
                afterChar = false;
                if (chunks.length && chunks[chunks.length - 1].type !== 'br')
                    chunks.push({ type: 'br' });
                continue;
            }
            // Character name: 3+ spaces of indent, all-uppercase (parens/numbers allowed)
            if (indent >= 3 && /^[A-Z][A-Z0-9\s\(\)\.\-\'\,]+$/.test(trimmed)) {
                afterChar = true;
                chunks.push({ type: 'char', text: trimmed });
                continue;
            }
            if (afterChar && trimmed.startsWith('(') && trimmed.endsWith(')')) {
                chunks.push({ type: 'paren', text: trimmed }); continue;
            }
            if (afterChar) {
                afterChar = false;
                chunks.push({ type: 'dialogue', text: trimmed }); continue;
            }
            chunks.push({ type: 'action', text: trimmed });
        }
        return chunks;
    }

    // Escape text but turn [[id]] into clickable superscript shot cues.
    function _renderChunkText(text) {
        return text.split(/(\[\[[^\]]+\]\])/).map((seg, i) => {
            if (i % 2 === 0) return _esc(seg);
            const id = seg.slice(2, -2);
            return `<sup class="nb-cine-shot-cue nb-wiki-link" data-selector="${_esc(id)}" title="Shot ${_esc(id)}">${_esc(id)}</sup>`;
        }).join('');
    }

    function _renderScript(note) {
        const meta = note.meta || {};
        if (note.type !== 'scene') return null;

        const ie  = String(meta.int_ext  || '').toUpperCase().startsWith('I') ? 'INT.' : 'EXT.';
        const dn  = String(meta.day_night|| '').toUpperCase().startsWith('D') ? 'DAY'  : 'NIGHT';
        const loc = String(meta.loc      || '').toUpperCase();
        const slug     = `${ie} ${loc} — ${dn}`;
        const sceneTag = `SCENE ${meta.alias ?? ''}`;

        const bodyHtml = _parseScriptBody(note.raw).map(c => {
            if (c.type === 'br')       return '';
            const t = _renderChunkText(c.text);
            if (c.type === 'action')   return `<p class="nb-script-action">${t}</p>`;
            if (c.type === 'char')     return `<p class="nb-script-char">${t}</p>`;
            if (c.type === 'dialogue') return `<p class="nb-script-dialogue">${t}</p>`;
            if (c.type === 'paren')    return `<p class="nb-script-paren">${t}</p>`;
            return '';
        }).join('');

        return `<div class="nb-cine-screenplay"><div class="nb-script-page">` +
               `<div class="nb-script-slug"><span class="nb-script-scene-tag">${_esc(sceneTag)}</span>${_esc(slug)}</div>` +
               `<div class="nb-script-body">${bodyHtml}</div>` +
               `</div></div>`;
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

    function _openStorylineOverlay(el, data, notebook, currentSize, project = '') {
        document.querySelector('.nb-cine-sl-overlay')?.remove();

        const stored = localStorage.getItem(_SL_SIZE_KEY(notebook));
        const size   = stored || currentSize;
        const { lanes, stories, orphan_scenes, config } = data;

        const overlay = document.createElement('div');
        overlay.className = 'nb-cine-sl-overlay';
        document.body.appendChild(overlay);

        // Align top edge to the bottom of the list + preview toolbars
        const toolbarBottom = Math.max(
            document.getElementById('nb-preview-toolbar')?.getBoundingClientRect().bottom ?? 0,
            document.getElementById('nb-list-meta')?.getBoundingClientRect().bottom ?? 0
        );
        if (toolbarBottom > 0) overlay.style.top = toolbarBottom + 'px';

        let board; // declared early so header button closures can reference it

        function _close() {
            overlay.remove();
            document.removeEventListener('keydown', _onEsc);
        }
        function _onEsc(e) { if (e.key === 'Escape') _close(); }
        document.addEventListener('keydown', _onEsc);

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

        // ── Header ──
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        hdr.innerHTML = `<span class="nb-cine-title">🧵 ${_esc(config?.project || 'Storylines')}</span>`;

        const storyModeBtn = document.createElement('button');
        storyModeBtn.className = 'nb-tool-btn nb-cine-story-mode-btn';
        storyModeBtn.title = 'Story view';
        storyModeBtn.textContent = '📖';
        storyModeBtn.addEventListener('click', () => {
            _close();
            el.dataset.query = 'storyline-story';
            _loadCineBlock(el);
        });
        hdr.appendChild(storyModeBtn);

        const btnGroup = document.createElement('div');
        btnGroup.className = 'nb-cine-hdr-btns';

        const addBtn = document.createElement('button');
        addBtn.className = 'nb-tool-btn'; addBtn.title = 'Add story (unassigned)'; addBtn.textContent = '+ Story';
        addBtn.addEventListener('click', () => _showInlineStoryInput(board, null, notebook, el, size, _refresh, project));
        btnGroup.appendChild(addBtn);

        const _sizes     = ['small', 'medium', 'large'];
        const _sizeIcons = { small: '▦', medium: '▤', large: '▣' };
        const sizeBtn = document.createElement('button');
        sizeBtn.className = 'nb-tool-btn';
        sizeBtn.title = `Zoom: ${size}`;
        sizeBtn.textContent = _sizeIcons[size] || '▦';
        sizeBtn.addEventListener('click', () => {
            const next = _sizes[(_sizes.indexOf(size) + 1) % _sizes.length];
            localStorage.setItem(_SL_SIZE_KEY(notebook), next);
            _close();
            _openStorylineOverlay(el, data, notebook, next, project);
        });
        btnGroup.appendChild(sizeBtn);

        const refBtn = document.createElement('button');
        refBtn.className = 'nb-tool-btn'; refBtn.title = 'Refresh'; refBtn.textContent = '↻';
        refBtn.addEventListener('click', _refresh);
        btnGroup.appendChild(refBtn);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'nb-tool-btn'; closeBtn.title = 'Close (Esc)'; closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', _close);
        btnGroup.appendChild(closeBtn);

        hdr.appendChild(btnGroup);
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
                labelText.style.cursor = 'pointer';
                labelText.title = `Preview ${laneTitle}`;
                labelText.addEventListener('click', async e => {
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
            row.appendChild(label);

            const cardZone = document.createElement('div');
            cardZone.className = 'nb-cine-lane-cards';
            cards.forEach(s => cardZone.appendChild(_buildCard(s, size, 'plotline')));
            row.appendChild(cardZone);

            const laneAdd = document.createElement('button');
            laneAdd.className = 'nb-cine-lane-add-end'; laneAdd.textContent = '+';
            laneAdd.title = `Add story to ${laneTitle}`;
            laneAdd.addEventListener('click', e => {
                e.stopPropagation();
                _showInlineStoryInput(cardZone, laneStem, notebook, el, size, _refresh, project);
            });
            row.appendChild(laneAdd);

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

        const { field, format, filter, codes } = _parseQuery(el.dataset.query || '');
        const _project = (field === 'storyline-board' || field === 'storyline-story' || field === 'storyline-script') ? (el.dataset.project || '') : '';

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
            const promotedS = [...(data.stories || [])]
                .filter(s => s.story_seq !== null && s.story_seq !== undefined);
            const promotedM = [...(data.milestones || [])]
                .filter(m => m.story_seq !== null && m.story_seq !== undefined);
            const promotedAll = [...promotedS, ...promotedM]
                .sort((a, b) => a.story_seq - b.story_seq);
            const laneColors = new Map((data.lanes || []).map(l => [l.stem, l.color]));

            el.innerHTML = '';
            const wrap = document.createElement('div');
            wrap.className = field === 'storyline-script'
                ? 'nb-cine-sl-script-view' : 'nb-cine-sl-story-view';

            // ── Toolbar ──
            const toolbar = document.createElement('div');
            toolbar.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;';

            const boardBtn = document.createElement('button');
            boardBtn.className = 'nb-tool-btn nb-cine-open-board-btn';
            boardBtn.title = 'Open line board'; boardBtn.textContent = '▦';
            boardBtn.addEventListener('click', () => {
                const sz = localStorage.getItem(_SL_SIZE_KEY(notebook)) || 'small';
                _buildStorylines(el, data, notebook, sz);
                _openStorylineOverlay(el, data, notebook, sz, _project);
            });
            toolbar.appendChild(boardBtn);

            const scriptBtn = document.createElement('button');
            scriptBtn.className = 'nb-tool-btn';
            scriptBtn.title = field === 'storyline-script' ? 'Story view' : 'Script view';
            scriptBtn.textContent = field === 'storyline-script' ? '☰' : '≡';
            scriptBtn.addEventListener('click', () => {
                el.dataset.query = field === 'storyline-script'
                    ? 'storyline-story' : 'storyline-script';
                _loadCineBlock(el);
            });
            toolbar.appendChild(scriptBtn);
            wrap.appendChild(toolbar);

            if (!promotedAll.length) {
                const empty = document.createElement('div');
                empty.className = 'nb-cine-empty';
                empty.textContent = 'No stories on the storyline yet — open the board and drag cards up.';
                wrap.appendChild(empty);
            } else if (field === 'storyline-story') {
                promotedAll.forEach(item => {
                    const isMs = item.milestone_seq !== undefined;
                    if (isMs) {
                        const bar = document.createElement('div');
                        bar.className = 'nb-cine-sl-milestone-bar';
                        bar.textContent = item.title;
                        bar.addEventListener('click', () => NbMain.openNote(item.selector));
                        wrap.appendChild(bar);
                    } else {
                        const color = laneColors.get(item.plotline) || '';
                        const desc  = item.meta?.desc
                            ? `<div class="nb-cine-sl-story-desc">${_esc(item.meta.desc)}</div>` : '';
                        const body  = item.body_preview
                            ? `<div class="nb-cine-sl-story-body">${_esc(item.body_preview)}</div>` : '';
                        const card = document.createElement('div');
                        card.className = 'nb-cine-sl-story-prose';
                        card.dataset.selector = item.selector;
                        if (color) card.style.borderLeftColor = color;
                        card.innerHTML =
                            `<div class="nb-cine-sl-story-prose-title">${_esc(item.title)}</div>${desc}${body}`;
                        card.addEventListener('click', () => NbMain.openNote(item.selector));
                        wrap.appendChild(card);
                    }
                });
            } else {
                // script-view: fetch full body of each story, render markdown
                (async () => {
                    for (const item of promotedAll) {
                        const isMs = item.milestone_seq !== undefined;
                        if (isMs) {
                            const bar = document.createElement('div');
                            bar.className = 'nb-cine-sl-script-milestone';
                            bar.textContent = item.title;
                            bar.addEventListener('click', () => NbMain.openNote(item.selector));
                            wrap.appendChild(bar);
                        } else {
                            const block = document.createElement('div');
                            block.className = 'nb-cine-sl-script-story';
                            const titleEl = document.createElement('div');
                            titleEl.className = 'nb-cine-sl-script-story-title';
                            titleEl.textContent = item.title;
                            titleEl.addEventListener('click', () => NbMain.openNote(item.selector));
                            block.appendChild(titleEl);
                            const bodyEl = document.createElement('div');
                            bodyEl.className = 'nb-rendered';
                            bodyEl.innerHTML = '<span style="opacity:0.3">…</span>';
                            block.appendChild(bodyEl);
                            wrap.appendChild(block);
                            // Fetch full body async
                            fetch(`/api/note?selector=${encodeURIComponent(item.selector)}`)
                                .then(r => r.json())
                                .then(d => {
                                    const body = d.body?.trim();
                                    bodyEl.innerHTML = body
                                        ? (window.marked?.parse ? window.marked.parse(body)
                                            : `<pre>${_esc(body)}</pre>`)
                                        : '<em style="opacity:0.3">No body text.</em>';
                                })
                                .catch(() => { bodyEl.innerHTML = '<em style="opacity:0.3">Failed to load.</em>'; });
                        }
                    }
                })();
            }
            el.appendChild(wrap);
        } else if (field === 'storyline-board') {
            const size = localStorage.getItem(_SL_SIZE_KEY(notebook)) || 'small';
            _buildStorylines(el, data, notebook, size);
            _openStorylineOverlay(el, data, notebook, size, _project);
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

    // ── Scene card (type: scene) — frontmatter card + body ───────────────────

    function _renderSceneCard(note) {
        const m  = note.meta || {};
        const fields = _cAllFields(m, {
            day_night: v => _cRow('day/night', v),
            int_ext:   v => _cRow('int/ext',   v),
        });

        const bodyHtml = (note.body || '').trim()
            ? `<div class="nb-card-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';

        return `<div class="nb-cine-shot-card">` +
            (fields ? `<div class="nb-card nb-cine-card-fm">` +
            `<div class="nb-card-fields">${fields}</div></div>` : '') +
            `${bodyHtml}</div>`;
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

    NbWeb.registerModule('cine', {
        label:       'NbWeb-cine',
        description: 'Film production scheduling — stripboard, call sheets, script tools',
        helpUrl:     '/plugins/nbweb-cine.md',

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
                id:     'story-card',
                icon:   '🃏',
                label:  'Story card',
                types:  ['story'],
                detect: note => note.type === 'story',
                render: note => {
                    const m        = note.meta || {};
                    const plotline = m.plotline ? String(m.plotline).trim() : '';
                    const desc     = m.desc     ? String(m.desc).trim()     : '';
                    const scenes   = m.scenes   ? String(m.scenes).trim()   : '';
                    const skip     = new Set(['title','type','plotline','seq','desc','scenes','color','lock','story_seq']);
                    const extras   = Object.entries(m).filter(([k,v]) => !skip.has(k) && v != null && String(v).trim());
                    const _row = (k, v) =>
                        `<div class="nb-contact-row"><span class="nb-contact-label">${_esc(k)}</span><span class="nb-contact-value">${_esc(String(v))}</span></div>`;
                    const scenesHtml = scenes
                        ? scenes.split(/[,\s]+/).filter(Boolean).map(s =>
                            `<span class="nb-cine-cast-chip nb-wiki-link" data-selector="${_esc(s.trim())}">${_esc(s.trim())}</span>`).join('')
                        : '';
                    const inner = [
                        plotline ? _row('plotline', plotline) : '',
                        desc     ? `<div class="nb-cine-sc-desc">${_esc(desc)}</div>` : '',
                        scenesHtml ? `<div class="nb-cine-sc-cast">${scenesHtml}</div>` : '',
                        extras.length ? extras.map(([k,v]) => _row(k, String(v).trim())).join('') : '',
                    ].filter(Boolean).join('');
                    const bodyHtml = (note.body || '').trim()
                        ? `<div class="nb-wp-body">${NbMain.renderMarkdown(note.body, note.selector)}</div>` : '';
                    return `<div class="nb-cine-shot-card">
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
                render:   note => _renderShotCard(note),
            },
            {
                id:     'screenplay',
                icon:   '🎬',
                label:  'Screenplay format',
                types:  ['scene'],
                detect: note => note.type === 'scene',
                render: note => _renderScript(note),
            },
            {
                id:     'markdown',
                icon:   '📝',
                label:  'Markdown',
                types:  ['scene'],
                detect: note => note.type === 'scene',
                render: note => {
                    if (note.type !== 'scene') return null;
                    const body = (note.body || '').trim();
                    if (typeof marked === 'undefined')
                        return `<div class="nb-cine-plain-script"><pre>${_esc(body)}</pre></div>`;
                    // Pre-process [[wikilinks]] into nb-wiki-link spans before marked runs;
                    // _enrichRendered will then attach click handlers to them.
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
                id:     'scene-card',
                icon:   '🎞',
                label:  'Scene card',
                types:  ['scene'],
                detect: note => note.type === 'scene',
                render: note => _renderSceneCard(note),
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
            const p = note.selector || note.path || '';
            if (/[:/]shots\//.test(p))     return '🎬';
            if (/[:/]actors\//.test(p))    return '🧑';
            if (/[:/]locations\//.test(p)) return '📍';
            if (/[:/]script\//.test(p))    return '📜';
            if (/[:/]resou/.test(p))          return '🎁';
            if (/[:/]schedule\//.test(p))       return '📅';
            if (note.type === 'day')           return '📅';
            if (note.type === 'resource')      return '🎁';
            return null;
        },

        codeblockRenderers: [{
            lang: 'cine',
            html: text => `<div class="nb-cine-block" data-query="${_esc(text.trim())}"><span class="nb-spin">⟳</span></div>`,
            render: async container => {
                for (const el of container.querySelectorAll('.nb-cine-block')) {
                    await _loadCineBlock(el);
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

})();
