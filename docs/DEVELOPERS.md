# DEVELOPERS.md

*Plugin architecture, Flask endpoints, adding note types — [NbWeb-cine](../README.md)*

---

*Coming soon — Flask API endpoint reference, plugin registration API, JS architecture. Content
migrated from the previous README backend endpoints section.*

## Adding a new note type and card renderer

Worked example: `type: production` (added 2026-08-10). Three separate steps, in order — skip
the first and the rest silently does nothing, with no error to tell you why.

### 1. Register the type server-side (`nb-web/app.py`)

A frontmatter `type:` value is inert until it's in `_FM_TYPES`. `_apply_meta_type()` only
honors a `type:` value found there; anything else falls back to `classify()`'s filename-inferred
type (`note`, for a plain `.md` file). There's a 5-step checklist comment directly above
`_FM_TYPES` in `app.py` — follow it:

1. Add the name to `_FM_TYPES`.
2. Add an icon to `INDICATORS`.
3. Add it to `nb-web/main.js`'s `renderList` type-count icon dict if it should show up in the
   list-view breakdown bar.

Miss this and the symptom looks exactly like a deployment or caching problem — a renderer whose
`detect: note => note.type === 'production'` never fires, on any tier, cache-busted or not,
pushed or not (nbweb-cine is cloned fresh from GitHub into the production container at build
time — a plugin-side fix alone can't paper over a missing core registration either way). Fast
check before chasing deployment state: fetch `/api/note?selector=<the note>` and compare the
returned `type` against the note's own frontmatter. If they disagree, it's this step, not
caching.

### 2. Build the card renderer (`nbweb-cine.js`)

Follow the existing `_renderActorCard`/`_renderCharacterCard`/`_renderLocationCard` shape —
they all share the same skeleton:

```javascript
async function _renderProductionCard(note) {
    const m = note.meta || {};
    // ... avatar, fields via _cAllFields(m, customRenderers), _cBody(note)
}
```

`_cAllFields(meta, customRenderers)` renders every FM field automatically — "no field may be
silently omitted" is the stated rule — except it explicitly skips any `null`/`''`/`false` value
*before* a customRenderer ever sees it. That's the right default for a busy card, but wrong for
a field whose blank state is itself meaningful (see the required-fields section below): those
need to be built explicitly, outside `_cAllFields`, with `customRenderers[key] = () => ''` to
suppress the default pass so the value never renders twice.

Two structural keys are hardcoded-skipped inside `_cAllFields` itself, not per-card:
`constraints`/`constraints_add` are schema objects (see below), not display data — rendering
them through the generic block-expansion fallback produces garbled `[object Object]` rows.

Register the renderer in the module's `previewRenderers` array:

```javascript
{
    id:     'production-card',
    icon:   '🎬',
    types:  ['production'],
    detect: note => note.type === 'production',
    render: note => _renderProductionCard(note),
}
```

And in the notebook's own `.{notebook}.md` dotfile, under `types:`:

```yaml
types:
  production:
    renderer: production-card
    access: office
```

**The `renderer:` value must match the registered `id` exactly** — `registerModule()` does no
prefixing. A mismatched name (a real, found-live example: several existing entries in this
codebase's own `Takeout` notebook say `cine-actor`/`cine-character`/etc., which don't match the
actual registered ids `actor-card`/`character-card`) is currently harmless only because each
type has exactly one candidate renderer, so the promotion-to-front logic never has anything to
compete with — it would silently stop mattering the moment a second renderer for the same type
existed.

### 3. Optional: required-but-blank fields

If some fields are meaningful specifically *while blank* (a fill-in-the-blanks note, e.g. an
ATL role nobody's cast yet), drive that off `/api/note/constraints-full` rather than inventing
per-card state:

- The target note's own frontmatter declares `constraints_add: { fieldname: {required: true} }`
  (add-only — ignored for any key the folder's own `.{folder}.md` already governs) or
  `constraints:` (per-key override, same "nearest wins" shape as `help:`/`help_add:`). Both are
  fenced to just note+immediate-folder, not the general per-key config cascade — see the
  endpoint's own docstring for why (that cascade previously leaked an unrelated inherited
  schema into an unrelated folder).
- The card fetches that endpoint once (`Promise.all` alongside any other per-note data fetch,
  e.g. `_fetchData` for cast/character lookups) and builds the field's row explicitly: value
  present → normal row (resolved wikilink if it matches something real, plain text otherwise);
  value blank and `required` → `_cMissingRow(label)`, a small shared helper that renders a
  dimmed, italic "— required —" placeholder with a tooltip pointing at where to actually enter
  a value (the Changes/FM panel — the card face itself is read-only).
- Value blank and not required → omit, same as `_cAllFields`'s own default.

See `_renderProductionCard`'s `atlRows` for the full worked pattern.
