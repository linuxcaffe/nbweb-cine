// NbWeb-cine — film production scheduling plugin for nb-web
// Provides: cine fenced code block renderer — shots → stripboard
// Activates when notebook contains .nb-cine.json
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

    async function _fetchData(notebook) {
        const hit = _cache.get(notebook);
        if (hit && Date.now() - hit.ts < _TTL) return hit;
        const d   = await fetch(`/api/cine/data?notebook=${encodeURIComponent(notebook)}`).then(r => r.json());
        const entry = { ...d, ts: Date.now() };
        _cache.set(notebook, entry);
        return entry;
    }

    function _bust(notebook) { _cache.delete(notebook); }

    // ── Shot filter helper ────────────────────────────────────────────────────
    // Applies all filter fields with consistent null-sentinel handling.
    // filter.day = null → unscheduled; filter.scene = null → no scene assigned;
    // filter.actor = null → shots with no actors.

    function _filterShots(shots, filter) {
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

    function _buildStrip(shot, actors, locations, notebook) {
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
        const locTitle   = locEntry?.meta?.location || shot.loc;
        const locHtml    = locSel
            ? `<button class="nb-cine-link nb-cine-loc" data-selector="${_esc(locSel)}" title="${_esc(locTitle)}">${_esc(shot.loc)}</button>`
            : `<span class="nb-cine-loc" title="${_esc(locTitle)}">${_esc(shot.loc)}</span>`;

        // Combined scene-shot ID "1.1a" → links to shot note; tooltip shows scene link path
        const shotId   = shot.scene && shot.shot ? `${shot.scene}.${shot.shot}` : (shot.shot || shot.filename);
        const idHtml   = `<button class="nb-cine-link nb-cine-id" data-selector="${_esc(shot.selector)}" title="Sc.${_esc(String(shot.scene))} / ${_esc(shot.shot)}">${_esc(shotId)}</button>`;

        // Actor codes — tooltip shows name (character)
        const actorsHtml = (shot.actors || []).map(code => {
            const entry = actors[code];
            const sel   = entry?.selector;
            const name  = entry?.meta?.name || code;
            const char  = entry?.meta?.character || '';
            const tip   = char ? `${name} (${char})` : name;
            return sel
                ? `<button class="nb-cine-link nb-cine-actor" data-selector="${_esc(sel)}" title="${_esc(tip)}">${_esc(code)}</button>`
                : `<span class="nb-cine-actor" title="${_esc(tip)}">${_esc(code)}</span>`;
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
                `<button class="nb-cine-link nb-cine-si-no" data-selector="${_esc(sc.selector)}">${_esc(sc.scene_no)}</button>` +
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
        if (meta.scene_no === undefined) return null;

        const ie  = String(meta.int_ext  || '').toUpperCase().startsWith('I') ? 'INT.' : 'EXT.';
        const dn  = String(meta.day_night|| '').toUpperCase().startsWith('D') ? 'DAY'  : 'NIGHT';
        const loc = String(meta.loc      || '').toUpperCase();
        const slug     = `${ie} ${loc} — ${dn}`;
        const sceneTag = `SCENE ${meta.scene_no}`;

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
        const { shots, actors, locations, config } = data;

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
            const locName  = locEntry?.meta?.location || shot.loc;
            const locSel   = locEntry?.selector;
            const slug = `${ie} ${_esc(shot.loc)} — ${dn}`;

            const actorLines = (shot.actors || []).map(code => {
                const a    = actors[code];
                const name = a?.meta?.name || code;
                const char = a?.meta?.character || '';
                const sel  = a?.selector;
                const label = char ? `${name} (${char})` : name;
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
            const nameField = entry.meta?.name || entry.meta?.location || code;
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
        const { shots, actors, locations, config } = data;
        const filtered = _filterShots(shots, filter);

        el.innerHTML = '';
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        const lineDayLabel = filter.day === null      ? ' · Unscheduled'
                           : filter.day !== undefined ? ` · Day ${filter.day}`
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
            board.appendChild(_buildStrip(shot, actors, locations, notebook));
        }

        el.appendChild(board);

        el.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
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

        let data;
        try {
            data = await _fetchData(notebook);
        } catch (e) {
            el.innerHTML = `<span class="nb-cine-error">⚠ ${_esc(e.message)}</span>`;
            return;
        }
        if (data.error) {
            el.innerHTML = `<span class="nb-cine-error">⚠ ${_esc(data.error)}</span>`;
            return;
        }

        if (field === 'shots') {
            if (format === 'strip') {
                _buildStripboard(el, data, filter, notebook);
            } else if (format === 'sheet') {
                _buildShotSheet(el, data, filter, notebook);
            } else if (format && format !== 'line') {
                _buildSubfieldTable(el, data, format, filter, notebook);
            } else {
                _buildShotLine(el, data, filter, notebook);  // shots / shots.line
            }
        } else if (field === 'scenes') {
            _buildSceneIndex(el, data, filter);
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
        const { shots, actors, locations, config } = data;
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

        let currentDay = undefined;
        for (const shot of filtered) {
            // Day break between days (master board and unfiltered views)
            if (filter.day === undefined) {
                const thisDay = shot.day ?? null;
                if (thisDay !== currentDay) {
                    currentDay = thisDay;
                    const brk = document.createElement('div');
                    brk.className = 'nb-cine-daybreak';
                    brk.innerHTML = `<span>${thisDay != null ? 'DAY&nbsp;' + _esc(String(thisDay)) : 'UNSCHEDULED'}</span>`;
                    board.appendChild(brk);
                }
            }
            board.appendChild(_buildStrip(shot, actors, locations, notebook));
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
        const pat = new RegExp(`\\[\\[${sceneNo}([a-z])\\]\\]`, 'g');
        const letters = [...raw.matchAll(pat)].map(m => m[1]).sort();
        const last = letters.length ? letters[letters.length - 1] : null;
        return last ? `${sceneNo}${String.fromCharCode(last.charCodeAt(0) + 1)}` : `${sceneNo}a`;
    }

    function _showInsertShotOverlay(suggested, onConfirm, onCancel) {
        const overlay = document.createElement('div');
        overlay.className = 'nb-cine-insert-overlay';
        overlay.innerHTML = `
            <div class="nb-cine-insert-card">
                <h4>INSERT SHOT</h4>
                <label>Shot ID</label>
                <input id="nb-cine-shot-id" type="text" value="${_esc(suggested)}" autocomplete="off" spellcheck="false">
                <label>Description</label>
                <textarea id="nb-cine-shot-desc" rows="2" placeholder="Brief shot description…"></textarea>
                <label>Actors (comma-separated)</label>
                <input id="nb-cine-shot-actors" type="text" placeholder="e.g. JD, TM">
                <div class="nb-cine-insert-btns">
                    <button id="nb-cine-insert-cancel" class="nb-tool-btn">Cancel</button>
                    <button id="nb-cine-insert-ok" class="nb-tool-btn nb-btn-primary">Create &amp; Insert</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const idInput    = overlay.querySelector('#nb-cine-shot-id');
        const descInput  = overlay.querySelector('#nb-cine-shot-desc');
        const actInput   = overlay.querySelector('#nb-cine-shot-actors');
        const okBtn      = overlay.querySelector('#nb-cine-insert-ok');
        const cancelBtn  = overlay.querySelector('#nb-cine-insert-cancel');

        // Select all in ID field so user can type directly
        idInput.focus();
        idInput.select();

        const confirm = () => {
            const shotId = idInput.value.trim();
            if (!shotId) { idInput.focus(); return; }
            overlay.remove();
            onConfirm({ shotId, desc: descInput.value.trim(), actors: actInput.value.trim() });
        };
        const cancel = () => { overlay.remove(); onCancel(); };

        okBtn.addEventListener('click', confirm);
        cancelBtn.addEventListener('click', cancel);
        overlay.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); confirm(); }
            if (e.key === 'Escape') cancel();
        });
    }

    async function _createShotFromTemplate(notebook, sceneMeta, shotId, desc, actors) {
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
            shot_id:   shotId,
            scene:     String(sceneMeta.scene_no ?? ''),
            desc:      desc,
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
                `shot: ${shotId}`,
                `type: shot`,
                `day_night: ${vars.day_night}`,
                `int_ext: ${vars.int_ext}`,
                `loc: ${vars.loc}`,
                `desc: ${desc ? `|\n  ${desc.replace(/\n/g, '\n  ')}` : ''}`,
                `actors: ${actors}`,
                `resources:`,
                `---`,
            ].join('\n');
        }

        await fetch('/api/notes', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ notebook, folder: 'shots', title: shotId, content }),
        });
    }

    async function _insertShotAction(ta, note) {
        const sceneNo = note?.meta?.scene_no;
        if (sceneNo == null) return;

        const savedPos = ta.selectionStart;
        const suggested = _nextShotId(ta.value, sceneNo);

        _showInsertShotOverlay(suggested, async ({ shotId, desc, actors }) => {
            // Insert [[shotId]] at saved cursor position
            const ins    = `[[${shotId}]]`;
            ta.value     = ta.value.slice(0, savedPos) + ins + ta.value.slice(savedPos);
            const newPos = savedPos + ins.length;
            ta.focus();
            ta.setSelectionRange(newPos, newPos);

            // Create the shot note (fire and forget — no await needed)
            _createShotFromTemplate(note.notebook, note.meta, shotId, desc, actors)
                .catch(e => console.warn('NbWeb-cine: shot creation failed', e));
        }, () => {
            ta.focus();
            ta.setSelectionRange(savedPos, savedPos);
        });
    }

    // ── Plugin registration ───────────────────────────────────────────────────

    NbWeb.registerModule('cine', {
        label:       'NbWeb-cine',
        description: 'Film production scheduling — stripboard, call sheets, script tools',
        helpUrl:     '/plugins/nbweb-cine.md',

        detect: notebooks => notebooks.filter(nb => nb.cine !== null && nb.cine !== undefined),

        previewRenderers: [
            {
                id:     'screenplay',
                icon:   '🎬',
                label:  'Screenplay format',
                detect: note => note.meta?.scene_no != null,
                render: note => _renderScript(note),
            },
            {
                id:     'markdown',
                icon:   '📝',
                label:  'Markdown',
                detect: note => note.meta?.scene_no != null,
                render: note => {
                    if (note.meta?.scene_no == null) return null;
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
        ],

        listItemIcon: note => {
            const p = note.selector || note.path || '';
            if (/[:/]shots\//.test(p))     return '🎬';
            if (/[:/]actors\//.test(p))    return '🧑';
            if (/[:/]locations\//.test(p)) return '📍';
            if (/[:/]script\//.test(p))    return '📜';
            if (/[:/]resou/.test(p))       return '🎁';
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

        listTitle: note => {
            if (note.type !== 'shot' || !note.meta) return null;
            const scene = String(note.meta.scene ?? '');
            const shot  = String(note.meta.shot  ?? '');
            const desc  = String(note.meta.desc  ?? '').trim().replace(/\s+/g, ' ');
            const id    = scene ? `${scene}.${shot}` : shot;
            return desc ? `${id} — ${desc}` : (id || null);
        },

        editorKeybindings: note => note.meta?.scene_no != null ? [{
            key:    '[',
            ctrl:   true,
            shift:  false,
            alt:    false,
            label:  'Insert shot reference (Ctrl+[)',
            action: _insertShotAction,
        }] : [],
    });

})();
