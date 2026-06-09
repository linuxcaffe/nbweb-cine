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

/* Column layout — shared by header row and all strips */
.nb-cine-strip {
    display: grid;
    grid-template-columns: 3ch 3ch 3ch 4ch 6ch 6ch 1fr auto 3ch;
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
.nb-cine-seq      { text-align: right; opacity: 0.6; }
.nb-cine-dn       { text-align: center; }
.nb-cine-ie       { text-align: center; }
.nb-cine-scene    { text-align: center; }
.nb-cine-shotnum  { font-weight: bold; }
.nb-cine-loc      { font-weight: bold; }
.nb-cine-desc     { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nb-cine-actors   { display: flex; flex-wrap: wrap; gap: 2px; }
.nb-cine-rescount { text-align: right; opacity: 0.7; }

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
    // "shots | day: 1" → { field: 'shots', filter: { day: 1 } }

    function _parseQuery(text) {
        const [lhs, rhs = ''] = text.split('|').map(s => s.trim());
        const field = lhs.trim().split(/\s+/)[0] || '';
        const filter = {};
        for (const part of rhs.split(',')) {
            const [k, v] = part.split(':').map(s => s.trim());
            if (k && v !== undefined && v !== '') {
                const n = Number(v);
                filter[k] = isNaN(n) ? v : n;
            }
        }
        return { field, filter };
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

        // Special strips (lunch, move) — minimal columns
        if (shot.type === 'lunch' || shot.type === 'move') {
            div.innerHTML =
                `<span class="nb-cine-seq">${_esc(String(shot.seq))}</span>` +
                `<span class="nb-cine-dn"></span><span class="nb-cine-ie"></span>` +
                `<span class="nb-cine-scene"></span><span class="nb-cine-shotnum"></span>` +
                `<span class="nb-cine-loc"></span>` +
                `<span class="nb-cine-desc">${_esc(_descFirst(shot.desc))}</span>` +
                `<span class="nb-cine-actors"></span>` +
                `<span class="nb-cine-rescount"></span>`;
            return div;
        }

        // Loc
        const locSel  = locations[shot.loc];
        const locHtml = locSel
            ? _linkBtn(shot.loc, locSel, 'nb-cine-loc')
            : `<span class="nb-cine-loc">${_esc(shot.loc)}</span>`;

        // Scene → script file
        const sceneSel  = `${notebook}:script/${shot.scene}.md`;
        const sceneHtml = shot.scene
            ? _linkBtn(shot.scene, sceneSel, 'nb-cine-scene')
            : `<span class="nb-cine-scene"></span>`;

        // Shot → the shot note itself
        const shotHtml = _linkBtn(shot.shot || shot.filename, shot.selector, 'nb-cine-shotnum');

        // Actor codes
        const actorsHtml = (shot.actors || []).map(code => {
            const sel = actors[code];
            return sel
                ? _linkBtn(code, sel, 'nb-cine-actor')
                : `<span class="nb-cine-actor">${_esc(code)}</span>`;
        }).join('');

        // Resource count
        const resCount = (shot.resources || []).filter(Boolean).length;

        div.innerHTML =
            `<span class="nb-cine-seq">${_esc(String(shot.seq))}</span>` +
            `<span class="nb-cine-dn">${_esc(shot.day_night)}</span>` +
            `<span class="nb-cine-ie">${_esc(shot.int_ext)}</span>` +
            sceneHtml +
            shotHtml +
            locHtml +
            `<span class="nb-cine-desc">${_esc(_descFirst(shot.desc))}</span>` +
            `<span class="nb-cine-actors">${actorsHtml}</span>` +
            `<span class="nb-cine-rescount">${resCount || ''}</span>`;

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
            const locSel  = locations[sc.loc];
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
            if (c.type === 'action')   return `<p class="nb-script-action">${_esc(c.text)}</p>`;
            if (c.type === 'char')     return `<p class="nb-script-char">${_esc(c.text)}</p>`;
            if (c.type === 'dialogue') return `<p class="nb-script-dialogue">${_esc(c.text)}</p>`;
            if (c.type === 'paren')    return `<p class="nb-script-paren">${_esc(c.text)}</p>`;
            return '';
        }).join('');

        return `<div class="nb-cine-screenplay"><div class="nb-script-page">` +
               `<div class="nb-script-slug"><span class="nb-script-scene-tag">${_esc(sceneTag)}</span>${_esc(slug)}</div>` +
               `<div class="nb-script-body">${bodyHtml}</div>` +
               `</div></div>`;
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

        const { field, filter } = _parseQuery(el.dataset.query || '');

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
            _buildStripboard(el, data, filter, notebook);
        } else if (field === 'scenes') {
            _buildSceneIndex(el, data, filter);
        } else {
            el.innerHTML = `<span class="nb-cine-error">unknown cine query: ${_esc(field)}</span>`;
            return;
        }

        // Wire link clicks
        el.querySelectorAll('.nb-cine-link[data-selector]').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                NbMain.openNote(btn.dataset.selector);
            })
        );
    }

    function _buildStripboard(el, data, filter, notebook) {
        const { shots, actors, locations, config } = data;

        let filtered = shots;
        if (filter.day    !== undefined) filtered = filtered.filter(s => s.day === filter.day);
        if (filter.scene  !== undefined) filtered = filtered.filter(s => String(s.scene) === String(filter.scene));
        if (filter.actor)                filtered = filtered.filter(s => s.actors.includes(filter.actor));

        el.innerHTML = '';

        // Header
        const hdr = document.createElement('div');
        hdr.className = 'nb-cine-header';
        const projectName = config?.project || 'Stripboard';
        const dayLabel    = filter.day !== undefined ? ` · Day ${filter.day}` : ' · Master Board';
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
            `<span class="nb-cine-seq">#</span>` +
            `<span class="nb-cine-dn">D/N</span>` +
            `<span class="nb-cine-ie">I/E</span>` +
            `<span class="nb-cine-scene">Sc</span>` +
            `<span class="nb-cine-shotnum">Shot</span>` +
            `<span class="nb-cine-loc">Loc</span>` +
            `<span class="nb-cine-desc">Description</span>` +
            `<span class="nb-cine-actors">Actors</span>` +
            `<span class="nb-cine-rescount">Res</span>` +
            `</div>`
        );

        let currentDay = null;
        for (const shot of filtered) {
            // Day break between days (master board only)
            if (filter.day === undefined && shot.day !== null && shot.day !== currentDay) {
                currentDay = shot.day;
                const brk = document.createElement('div');
                brk.className = 'nb-cine-daybreak';
                brk.innerHTML = `<span>DAY&nbsp;${_esc(String(shot.day))}</span>`;
                board.appendChild(brk);
            }
            board.appendChild(_buildStrip(shot, actors, locations, notebook));
        }

        el.appendChild(board);
        _wireSort(board, notebook, filter.day);
    }

    // ── Drag + resequence ─────────────────────────────────────────────────────

    function _wireSort(board, notebook, filterDay) {
        if (!window.Sortable) return;

        Sortable.create(board, {
            animation:     150,
            forceFallback: true,   // required: pointermove breaks without this
            draggable:     '.nb-cine-strip:not(.nb-cine-colheader)',
            filter:        '.nb-cine-colheader, .nb-cine-daybreak',
            ghostClass:    'nb-cine-ghost',
            chosenClass:   'nb-cine-chosen',

            onEnd: async () => {
                // Walk DOM order to infer new day and seq for every draggable strip.
                // Day breaks are fixed markers; everything between them belongs to
                // the day named by the break above it.
                const moves = [];
                let currentDay = filterDay ?? null;  // single-day view has no breaks
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
                        if (sel) {
                            moves.push({ selector: sel, day: currentDay, seq: seqInDay });
                            // Optimistic update — seq label reflects new position immediately
                            const seqEl = child.querySelector('.nb-cine-seq');
                            if (seqEl) seqEl.textContent = String(seqInDay);
                        }
                    }
                }

                if (!moves.length) return;

                try {
                    const r = await fetch('/api/cine/resequence', {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify({ notebook, moves }),
                    });
                    const d = await r.json();
                    if (d.errors?.length) console.warn('NbWeb-cine resequence errors:', d.errors);
                    _bust(notebook);   // next refresh gets fresh data
                } catch (e) {
                    console.error('NbWeb-cine resequence failed:', e);
                }
            },
        });
    }

    // ── Plugin registration ───────────────────────────────────────────────────

    NbWeb.registerModule('cine', {
        label:       'NbWeb-cine',
        description: 'Film production scheduling — stripboard, call sheets, script tools',
        helpUrl:     '/plugins/nbweb-cine.md',

        detect: notebooks => notebooks.filter(nb => nb.cine !== null && nb.cine !== undefined),

        previewRenderer: note => _renderScript(note),

        codeblockRenderers: [{
            lang: 'cine',
            html: text => `<div class="nb-cine-block" data-query="${_esc(text.trim())}"><span class="nb-spin">⟳</span></div>`,
            render: async container => {
                for (const el of container.querySelectorAll('.nb-cine-block')) {
                    await _loadCineBlock(el);
                }
            },
        }],
    });

})();
