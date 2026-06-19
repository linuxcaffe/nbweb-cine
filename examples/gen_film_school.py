#!/usr/bin/env python3
"""Generate the Film School storyline starter pack for nbweb-cine."""
import os, re, pathlib, sys

TARGET = pathlib.Path.home() / '.nb/Takeout/storylines/film-school'
TARGET.mkdir(parents=True, exist_ok=True)

def fm(**kw):
    lines = ['---']
    for k, v in kw.items():
        if v is not None and v != '':
            lines.append(f'{k}: {v}')
    lines.append('---')
    return '\n'.join(lines)

def write(filename, frontmatter, body=''):
    path = TARGET / filename
    content = frontmatter + '\n' + body.strip() + '\n'
    path.write_text(content)
    print(f'  wrote {filename}')

# ── Storyline ────────────────────────────────────────────────────────────────

_AFTER_ORDER = (
    'concept,source-material,treatment,first-draft,table-read,revisions,'
    'script-coverage,script-registration,scene-breakdown,pitch-deck,ms-script-lock,'
    'top-sheet-budget,production-company,chain-of-title,investor-deck,tax-incentives,'
    'ms-financing-closed,detailed-budget,eo-insurance,key-contracts,'
    'hire-director,department-heads,location-scout,production-design,'
    'cast-breakdown,auditions,final-casting,ms-cast-announced,'
    'shot-list,shooting-schedule,storyboards,rehearsals,equipment-package,'
    'call-sheets,ms-first-day,shooting-day,dailies-review,script-continuity,'
    'production-reports,wrap-day,ms-last-day,'
    'footage-ingest,assembly-cut,directors-cut,test-screenings,picture-lock,'
    'ms-picture-lock,vfx,sound-design,adr,score-and-music,colour-grade,deliverables,'
    'festival-strategy,sales-agent,marketing-campaign,press-kit,theatrical-release,'
    'ms-premiere,streaming-launch,awards-campaign,rights-management,ms-release'
)

write('film-school.md', fm(
    title='Film School',
    type='storyline',
    project='film-school',
    order_before='concept',
    order_after=_AFTER_ORDER,
), """
This is the complete journey of making a real film — from the first spark
of an idea through to the moment an audience watches it on screen.

Each plotline is a phase of production. Each story card is a step you
must take. **Gold titles** mean nb-web has a tool that directly supports
that step. Promote them to the main storyline one block at a time,
as you make your movie.
""")

# ── Plotlines ────────────────────────────────────────────────────────────────

write('story-script.md', fm(
    title='Story & Script',
    type='plotline',
    color='#7c6af7',
    seq=1,
), "Develop the story from raw concept to locked screenplay.")

write('finance.md', fm(
    title='Finance & Business',
    type='plotline',
    color='#e8a44a',
    seq=2,
), "Secure the money, build the legal structure, and plan distribution.")

write('pre-production.md', fm(
    title='Pre-Production',
    type='plotline',
    color='#4ab4e8',
    seq=3,
), "Hire the crew, cast actors, scout locations, and plan every shot.")

write('production.md', fm(
    title='Production',
    type='plotline',
    color='#4ae894',
    seq=4,
), "Principal photography — capture every scene on camera.")

write('post-production.md', fm(
    title='Post-Production',
    type='plotline',
    color='#e84a7c',
    seq=5,
), "Edit, mix, grade, and finish the film.")

write('distribution.md', fm(
    title='Distribution & Release',
    type='plotline',
    color='#a44ae8',
    seq=6,
), "Deliver the film to audiences through festivals, platforms, and deals.")

# ── Milestones ───────────────────────────────────────────────────────────────

milestones = [
    ('ms-script-lock.md', 'Script Lock', 1,
     "The screenplay is declared final. All departments can now plan against a stable script. "
     "This is the single most important gate in pre-production — nothing can be costed, scheduled, "
     "or designed with confidence until the script stops moving."),
    ('ms-financing-closed.md', 'Financing Closed', 2,
     "All financing commitments are signed and funds are in the production account. "
     "Without this gate, pre-production spending is at personal risk. Once closed, "
     "you have a greenlit film and can make contractual commitments to cast and crew."),
    ('ms-cast-announced.md', 'Cast Announced', 3,
     "Lead actors are signed with deal points closed. This is the milestone that "
     "makes a film fundable (cast drives finance), schedulable (availability windows "
     "shape the shoot calendar), and marketable (names sell tickets)."),
    ('ms-first-day.md', 'First Day of Photography', 4,
     "Principal photography begins. The largest and most expensive phase of production "
     "is now running. Everything before this was planning; everything after is execution. "
     "The clock is ticking and the budget is burning."),
    ('ms-last-day.md', 'Picture Wrap', 5,
     "The final scheduled shot is in the can. Principal photography is complete. "
     "This is the moment the production machine stands down and the post-production "
     "team takes over the film."),
    ('ms-picture-lock.md', 'Picture Lock', 6,
     "The edited cut is approved by director and producers — no further changes to "
     "the picture. Sound, music, VFX, and colour can now be finished against a stable "
     "timeline. Unlocking picture after this point is expensive and disruptive."),
    ('ms-premiere.md', 'World Premiere', 7,
     "The film screens publicly for the first time — usually at a film festival. "
     "This is the moment all creative work meets its audience. Reviews, word-of-mouth, "
     "and distribution deals are made or broken here."),
    ('ms-release.md', 'Wide Release', 8,
     "The film is available to the general public — theatrically, on a streaming platform, "
     "or through broadcast. This is the finish line. The film has been made and delivered."),
]

for filename, title, seq, body in milestones:
    write(filename, fm(
        title=title,
        type='milestone',
        milestone_seq=seq,
    ), body)

# ── Stories ──────────────────────────────────────────────────────────────────
# tool values: storylines | scenes | characters | cast | shot-list | locations | schedule | budget

stories = []

# ── Story & Script ──

stories += [
('concept.md', 'Story Concept', 'story-script', 1, None,
"The concept is the seed. Before anything else exists, you need a one-sentence answer "
"to: *what is this film about and why does it need to exist?* Test your concept against "
"the marketplace — has it been done? What makes your take unique? What genre? What tone? "
"Write the logline before you write a single scene: *A [protagonist] must [goal] or else [stakes].*\n\n"
"Strong concepts have built-in conflict, a clear protagonist, and an emotionally resonant "
"hook. Weak concepts are premises without engines. Spend time here — a weak concept "
"cannot be rescued by brilliant execution.\n\n"
"### References\n- *Save the Cat* — Blake Snyder\n- *The Story Grid* — Shawn Coyne\n- No Film School (nofilmschool.com)"),

('source-material.md', 'Option Source Material', 'story-script', 2, None,
"If your film is based on existing material — a novel, true story, article, podcast, "
"or play — you must legally acquire the right to adapt it. An *option agreement* gives "
"you the exclusive right to develop the property for a defined period (typically 12–18 "
"months, renewable) in exchange for a fee, before you pay the full purchase price.\n\n"
"Chain of title starts here. Every rights deal you make must be documented, and the "
"documents must be clean enough that an E&O insurer will cover the finished film. "
"An entertainment lawyer is not optional at this stage.\n\n"
"### References\n- WGA script registration\n- Entertainment lawyers directory (IAEL)\n- *Clearances & Copyright* — Michael C. Donaldson"),

('treatment.md', 'Write Treatment', 'story-script', 3, None,
"A treatment is a prose narrative of your film — usually 5–20 pages — written in "
"present tense as if watching the movie. It covers all major story beats, character "
"arcs, the three-act structure, and the emotional journey. It is not a screenplay "
"and it is not a synopsis — it lives between the two.\n\n"
"Treatments serve two purposes: they force you to find structural problems before "
"you've invested hundreds of hours in a script, and they're the primary sales "
"document for pitching to financiers and producers who won't read a full draft.\n\n"
"### References\n- *Anatomy of Story* — John Truby\n- *The Screenwriter's Bible* — David Trottier\n- Sundance Institute development resources"),

('first-draft.md', 'Write First Draft', 'story-script', 4, 'scenes',
"The first draft is about getting the story on paper — not about perfection. "
"Industry standard format: Courier 12pt, 1.5\" left margin, 1\" all others, "
"approx. one page per minute of screen time. Use proper screenplay software "
"(Final Draft, Highland 2, WriterDuet, Celtx) — amateur formatting signals "
"an amateur filmmaker to everyone who matters.\n\n"
"Write the draft fast. Don't rewrite until you have a complete draft. The goal "
"is a complete story in proper screenplay form. It will be bad. That's expected "
"and correct.\n\n"
"### In nb-web\nScene notes in `script/` are the nb-web equivalent of a screenplay's "
"scene headings. Each `type: scene` note carries the INT/EXT, location, and day/night "
"fields, and its body holds the scene description and action lines. The storylines board "
"maps the emotional architecture before you write a word.\n\n"
"### References\n- *Story* — Robert McKee\n- Final Draft / Highland 2\n- *The Screenwriter's Bible* — David Trottier"),

('table-read.md', 'Table Read', 'story-script', 5, None,
"Before spending money on revisions, hear the script out loud. Gather a group of "
"actors (even friends who can read) and sit around a table. Record it. Listen for: "
"scenes that drag, dialogue that sounds unnatural, exposition that clunks, and "
"moments that unexpectedly land.\n\n"
"The table read is humbling and essential. Problems that are invisible on the page "
"become obvious when spoken aloud. Budget at least one table read per significant "
"revision pass.\n\n"
"### References\n- Sundance Labs script development process\n- *Directing Actors* — Judith Weston\n- Script analysis frameworks"),

('revisions.md', 'Script Revisions', 'story-script', 6, 'scenes',
"Professional screenplays go through many drafts. Each pass has a focus: structure, "
"then character, then dialogue, then scene-by-scene pacing, then line-level polish. "
"Colour-coded revision pages (Blue, Pink, Yellow…) track changes so all departments "
"know which version they're working from.\n\n"
"Get notes from trusted readers, a script consultant, or a development executive. "
"Protect the core idea while being ruthless about execution. 'Kill your darlings' "
"is not a cliché — it's the job.\n\n"
"### In nb-web\nEach scene note in `script/` can carry revision notes in its annotation "
"sidecar, keeping revision history alongside the scene without polluting the note body.\n\n"
"### References\n- *Rewrite* — Paul Chitlik\n- WGA Writers Room practice\n- The Black List (coverage services)"),

('script-coverage.md', 'Commission Coverage', 'story-script', 7, None,
"Script coverage is a professional reader's report: a 1-page synopsis followed by "
"a breakdown scoring premise, plot, character, dialogue, and marketability — each "
"rated Recommend, Consider, or Pass. Studios and production companies use coverage "
"to filter the thousands of scripts they receive.\n\n"
"Commissioning coverage on your own script before you send it out tells you what "
"a cold professional reader sees, without burning your one chance with a target "
"producer. Services: The Black List, WeScreenplay, Industrial Scripts.\n\n"
"### References\n- The Black List (blcklst.com)\n- WeScreenplay\n- Industrial Scripts"),

('script-registration.md', 'Register the Script', 'story-script', 8, None,
"Register your screenplay before it leaves your hands. This establishes the date "
"of creation for copyright purposes. In the US: the WGA West Script Registry "
"(writers guild, no membership required) and the US Copyright Office "
"(stronger legal protection, recommended). In Canada: registration via WGC.\n\n"
"Registration does not prevent idea theft — ideas are not copyrightable. "
"It protects the specific expression: your specific words, structure, and characters "
"as written.\n\n"
"### References\n- WGA Script Registry (wga.org)\n- US Copyright Office (copyright.gov)\n- WGC registration (wgc.ca)"),

('scene-breakdown.md', 'Scene Breakdown', 'story-script', 9, 'scenes',
"The scene breakdown is where the screenplay becomes a production document. "
"For every scene: assign a scene number, note INT/EXT and location, list "
"all characters present, flag special requirements (stunts, VFX, special props, "
"animals, children). This becomes the raw data that feeds the schedule and budget.\n\n"
"A thorough breakdown surfaces hidden costs early — a single stunt sequence "
"or animal wrangler scene can consume days of schedule and a significant budget "
"line that wasn't obvious from the script alone.\n\n"
"### In nb-web\n`type: scene` notes in `script/` are the nb-web scene breakdown. "
"Each note carries `alias:` (scene number), `loc:`, `int_ext:`, `day_night:`. "
"The Ctrl+[ keybinding in scene edit mode creates a linked shot note instantly.\n\n"
"### References\n- Production breakdown templates (StudioBinder)\n- *The Film Director's Toolkit*\n- Second AD handbooks"),

('pitch-deck.md', 'Create Pitch Deck', 'story-script', 10, 'storylines',
"The pitch deck is your film as a visual document: 10–20 slides covering logline, "
"synopsis, tone, comparable films, target audience, director vision, key cast "
"attachments, budget range, and financing ask. It is a sales document, not an "
"artistic statement — design and clarity matter as much as content.\n\n"
"Every financier, sales agent, and distribution executive you approach will ask "
"for a deck. It lives alongside the script, not inside it. The deck sells the "
"project; the script proves you can execute it.\n\n"
"### In nb-web\nThe storylines board is your story architecture tool. "
"A `type: storyline` note with plotlines and story cards maps your narrative "
"structure visually — a powerful internal tool for developing the story logic "
"before committing it to the pitch deck.\n\n"
"### References\n- Film pitch deck templates (Canva, Pitch)\n- IFP pitch market guidelines\n- *The Independent Film Producer's Survival Guide*"),
]

# ── Finance & Business ──

stories += [
('top-sheet-budget.md', 'Top Sheet Budget', 'finance', 1, 'budget',
"The top sheet is a one-page summary budget: above-the-line (story, writer, "
"director, cast), production (crew, locations, equipment), post-production, "
"and other (insurance, legal, contingency). It's the first document financiers "
"and sales agents ask for — before they'll look at your script.\n\n"
"Rough top sheets are built from comparable films adjusted for your specific "
"script, location, and cast level. Until you have a line-item budget, the "
"top sheet is your best estimate of what the film will cost to make.\n\n"
"### In nb-web\nThe budget system in nb-web (`gen-budget.py` + hledger) builds "
"from the cast, location, and resource notes you've already created. "
"The top sheet total emerges from the sum of those line items. "
"Start building notes in `cast/`, `locations/`, and `resources/` early.\n\n"
"### References\n- MovieMagic Budgeting\n- IFP budget templates\n- *Film Budget Boilerplate* — M.M. Lederman"),

('production-company.md', 'Set Up Production Entity', 'finance', 2, None,
"Never produce a film in your personal name. Form an LLC or corporation "
"specifically for this production — this separates your personal assets from "
"production liabilities, simplifies investor accounting, and is required by "
"most E&O insurers and completion bond companies.\n\n"
"Typical structure: one LLC per film. File with your state/province, get an EIN "
"(Employer Identification Number), open a dedicated bank account, and establish "
"a chart of accounts before any money moves.\n\n"
"### References\n- Secretary of State business registration\n- Entertainment attorneys\n- IRS EIN application (irs.gov)"),

('chain-of-title.md', 'Establish Chain of Title', 'finance', 3, None,
"Chain of title is the documented legal trail of every rights agreement that "
"gives you the right to make this film: option agreements, WGA registration, "
"copyright assignments, music clearances, life rights releases. "
"Without a clean chain of title, you cannot get E&O insurance. "
"Without E&O insurance, you cannot get distribution.\n\n"
"Start the chain of title document on day one and update it continuously. "
"An entertainment lawyer should review it before you approach distributors or "
"sales agents.\n\n"
"### References\n- *Clearances & Copyright* — Michael C. Donaldson\n- Entertainment attorney\n- E&O insurance brokers"),

('investor-deck.md', 'Build Investor Package', 'finance', 4, None,
"The investor package turns your pitch deck into a legal offering document. "
"For most independent films: a Private Placement Memorandum (PPM) outlining "
"the investment structure (equity, profit participation, return projections), "
"risk disclosures, and the business plan. In many jurisdictions, soliciting "
"investors without proper securities documentation is illegal.\n\n"
"Be conservative in projections. Investors who lose money on bad projections "
"become enemies. Investors who make money on conservative ones become partners "
"for your next film.\n\n"
"### References\n- Securities attorney\n- *Film Finance & Distribution* — John W. Cones\n- IFP Financing Conference materials"),

('tax-incentives.md', 'Research Tax Incentives', 'finance', 5, None,
"Most countries, states, and provinces offer film tax credits or rebates — "
"typically 15–40% of qualifying local spend. This is not optional money: "
"for most indie films, the tax incentive is the largest single line item "
"on the financing side of the ledger.\n\n"
"Location choice is often driven by the incentive. Research before you "
"lock locations: the difference between shooting in Ontario (40% OFTTC) "
"and somewhere without incentives can be the difference between a film "
"that gets made and one that doesn't.\n\n"
"### References\n- Film incentive databases (filmvault.com, incentivelocator.com)\n- State and provincial film offices\n- Production accountant (specialist in incentives)"),

('detailed-budget.md', 'Detailed Line-Item Budget', 'finance', 6, 'budget',
"The detailed budget breaks every cost to its lowest component: "
"crew day rates × shoot days, equipment rental × weeks, location fees, "
"catering per head × days, post-production phases itemised to the hour. "
"It is typically 60–100 pages and feeds directly into your cash flow projection.\n\n"
"The budget is a living document throughout pre-production. Lock it only "
"when the schedule is locked. A schedule change ripples through the budget "
"immediately — more days mean more crew, more equipment, more locations.\n\n"
"### In nb-web\n`gen-budget.py` reads cast notes (ATL rates), location notes "
"(BTL day rates), and resource notes (equipment/vehicles) from annotation sidecars, "
"then outputs a journal memo. `hledger` renders that as a formatted budget report. "
"See `.rules/budget.md` in your notebook for the full workflow.\n\n"
"### References\n- MovieMagic Budgeting / Gorilla budgeting\n- Production accountant\n- *The UPM Handbook*"),

('eo-insurance.md', 'Arrange E&O and Production Insurance', 'finance', 7, None,
"Entertainment and Errors & Omissions (E&O) insurance is the film industry's "
"equivalent of professional liability insurance. E&O covers claims arising "
"from the content of your film — defamation, copyright infringement, "
"privacy violations, trademark issues. Without it, no reputable distributor "
"will touch your film.\n\n"
"Production insurance additionally covers: cast (illness, death), equipment, "
"general liability, workers' compensation, and completion risk. "
"Buy insurance before the first day of pre-production, not the first day of shooting.\n\n"
"### References\n- Entertainment insurance brokers (Front Row, DeWitt Stern)\n- SAG-AFTRA insurance requirements\n- Completion bond companies (Film Finances, International Film Guarantors)"),

('key-contracts.md', 'Execute Key Contracts', 'finance', 8, None,
"Every relationship in a film production must be documented. "
"Minimum required agreements: writer (if not you), director, lead actors, "
"department heads, location releases, music licenses, and any SAG-AFTRA "
"or union agreements. Unsigned agreements are promises, not contracts.\n\n"
"Use standard industry templates as starting points, then have an entertainment "
"lawyer review anything with significant money or rights attached. "
"Disputes on set — or years later in post — are almost always caused by "
"deals that were never properly documented.\n\n"
"### References\n- SAG-AFTRA agreement database\n- DGA agreements (dga.org)\n- IATSE agreements\n- Entertainment attorney"),
]

# ── Pre-Production ──

stories += [
('hire-director.md', 'Attach Director', 'pre-production', 1, None,
"If you're not directing, the director is your most important hire. "
"The director shapes every creative decision on screen. Approach directors "
"with a full package: script, pitch deck, top-sheet budget, and any cast "
"attachments. A director's attachment is often what unlocks cast and financing.\n\n"
"The director-producer relationship is a partnership. You need compatible "
"creative visions AND compatible working styles. Interview extensively. "
"Watch their previous work critically — not just the highlight reel.\n\n"
"### References\n- DGA hiring guidelines\n- Directors Guild agreements\n- *The Producer's Perspective* — Ken Davenport"),

('department-heads.md', 'Hire Department Heads', 'pre-production', 2, None,
"The core department heads shape the physical world of the film: "
"Director of Photography (camera and lighting), Production Designer "
"(sets, locations, visual style), Sound Mixer, First AD (schedule), "
"and Line Producer (budget execution). Hire these before anyone else.\n\n"
"Department heads bring their own crew networks. A good gaffer follows their DP; "
"a good art director follows their production designer. "
"Let senior hires recommend their teams — loyalty and communication are "
"already established.\n\n"
"### References\n- IATSE crew directories\n- Mandy.com / ProductionHUB\n- NFTS / AFI crew hiring guides"),

('location-scout.md', 'Scout & Lock Locations', 'pre-production', 3, 'locations',
"Location scouting is both creative and logistical. For each scene: "
"does this place look right? Does it have power? Parking? Permits? "
"Noise issues? Community relations? Weather exposure? "
"Every location that looks beautiful on Instagram has a production reality "
"that only a site visit reveals.\n\n"
"Lock locations with signed agreements early. Popular locations book up months "
"in advance. Your shooting schedule often reorganises around location availability "
"rather than story order.\n\n"
"### In nb-web\nEach scouted location gets a `type: location` note in `locations/` "
"with `alias:` (your code), `category:`, `address:`, and `pin:` fields. "
"The budget system reads rate data from annotation sidecars on these notes. "
"Location cards appear in shot notes via the `loc:` field.\n\n"
"### References\n- Location managers guild (LMGI)\n- Municipal film office permit guides\n- Location release form templates"),

('production-design.md', 'Develop Production Design', 'pre-production', 4, None,
"Production design is every visual element that isn't the performance: "
"sets, props, set dressing, colour palette, and period detail. "
"The Production Designer works from the script and the director's vision "
"to create a coherent visual world.\n\n"
"Before any sets are built or rented, the PD creates: a visual mood board, "
"colour palette per character/location, set dressing lists, and a props breakdown. "
"These feed directly into the art department budget and schedule.\n\n"
"### References\n- *The Production Designer's Handbook*\n- Mood board tools (Pinterest, Milanote)\n- Art department guild (ADG)"),

('cast-breakdown.md', 'Character & Cast Breakdown', 'pre-production', 5, 'characters',
"The cast breakdown translates every speaking character in the script into "
"a casting specification: age range, type, special skills, estimated days on set, "
"union or non-union, and deal tier (lead / supporting / featured / day player / extra). "
"This document goes to the casting director.\n\n"
"Understand the union implications of your cast mix before you cast a single person. "
"Signing one SAG-AFTRA actor can trigger a SAG-AFTRA agreement for the whole production "
"(a 'must-join' scenario) with significant cost and paperwork consequences.\n\n"
"### In nb-web\n`type: character` notes in `characters/` are the casting breakdown. "
"Each note's `alias:` is the CHARACTER CODE used in shot notes; `title:` is the "
"character's name; the `actor` field links to the cast/ folder once casting is complete. "
"Recasting = change one field. No shot notes need touching.\n\n"
"### References\n- Casting Society of America (castingsociety.com)\n- SAG-AFTRA role definitions\n- *Casting By* — documentary on the casting process"),

('auditions.md', 'Hold Auditions', 'pre-production', 6, None,
"Auditions are where you discover who can actually play the role, not just "
"who looks right for it on paper. Self-tape rounds filter the first wave "
"cheaply. Callbacks bring the real contenders into the room.\n\n"
"Prepare audition sides (scene excerpts) that reveal character, not just "
"plot. Direct actors briefly in the room — you're not just evaluating the "
"performance, you're evaluating coachability and collaboration instincts. "
"Record everything with permission.\n\n"
"### References\n- *A Practical Handbook for the Actor* — Melissa Bruder et al.\n- Casting director workflows (Breakdown Services)\n- Self-tape equipment and framing guides"),

('final-casting.md', 'Final Casting & Deals', 'pre-production', 7, 'cast',
"Casting is finalised when the deal points are closed and the contract is signed. "
"Not when the actor says yes verbally. Not when the agent sends an email. "
"When the contract is signed. Many productions have lost cast days before "
"first day because deals fell apart after a verbal agreement.\n\n"
"Each cast member needs a deal memo covering: role, guaranteed days, "
"day rate or flat fee, credit, screen time, and any special riders "
"(travel, accommodation, exclusivity). SAG-AFTRA signatories follow "
"the scale agreement as a floor.\n\n"
"### In nb-web\nEach signed actor gets a `type: actor` note in `cast/` with "
"`alias:` (callsheet code), `role:`, `phone:`, `contact:` fields. "
"The budget system reads rates from annotation sidecars on these notes. "
"Shot notes reference actors by their CHARACTER code (from `characters/`), "
"not their actor code directly.\n\n"
"### References\n- SAG-AFTRA agreements (sagaftra.org)\n- Breakdown Services\n- *The Film Actor's Process* — various"),

('shot-list.md', 'Create Shot Lists', 'pre-production', 8, 'shot-list',
"A shot list specifies every shot in every scene: shot number, size "
"(extreme wide / wide / medium / close / extreme close), angle, movement, "
"lens focal length if known, and a brief description of what the shot shows. "
"The shot list is the director's technical plan for the day.\n\n"
"Build the shot list scene by scene, thinking about: where does the coverage "
"give you editing options? What's the minimum number of shots to tell this scene? "
"Where does one establishing shot replace three coverage shots? "
"Fewer, better shots beat many weak ones every time.\n\n"
"### In nb-web\nEach `type: shot` note in `shots/` is one shot. Fields: "
"`scene:` (links to a scene note), `alias:` (shot code like 4f), `day:`, "
"`seq:`, `loc:`, `desc:`, `tech:`, `art:`, `cast:`. "
"The Ctrl+[ keybinding in a scene note creates a new shot note pre-populated "
"with that scene's metadata. Shot notes render as cards in the shot list view.\n\n"
"### References\n- StudioBinder shot list tool\n- *Master Shots* Vol. 1–3 — Christopher Kenworthy\n- *The Visual Story* — Bruce Block"),

('shooting-schedule.md', 'Build Shooting Schedule', 'pre-production', 9, 'schedule',
"The shooting schedule groups scenes into shoot days, optimised for: "
"location clustering (avoid moving twice to the same place), cast availability, "
"time of day (day scenes before golden hour scenes), and set complexity. "
"It is built from the scene breakdown using stripboard software.\n\n"
"A typical feature shoots 3–5 pages of script per day. Action, VFX, or "
"dialogue-heavy scenes take longer. Simple single-location dialogue scenes "
"can run faster. The schedule determines the budget: more days = more cost.\n\n"
"### In nb-web\n`type: day` notes in `schedule/` are shoot days. Each day note "
"carries `day:` (number), `date:`, and `hours:` blocks (full_day/cast/crew/location). "
"The budget system reads these hours to calculate per-hour resource costs. "
"Day notes link to shot notes via the `day:` field on each shot.\n\n"
"### References\n- MovieMagic Scheduling\n- *The UPM Handbook*\n- Assistant Directors Training Program (ADTP)"),

('storyboards.md', 'Storyboard Key Sequences', 'pre-production', 10, None,
"Storyboards are thumbnail sketches of shots — usually for complex sequences: "
"action, VFX, stunts, or any sequence where improvising on set would be "
"prohibitively expensive. They communicate the director's visual plan to "
"DP, AD, art department, and VFX supervisor before any money is spent.\n\n"
"You don't need to storyboard every scene — experienced directors often "
"don't. Storyboard the sequences where getting it wrong on the day means "
"you don't have the scene. Animatics (moving storyboards with rough timing) "
"are useful for VFX-heavy sequences.\n\n"
"### References\n- Storyboard software (Storyboarder, FrameForge, Boords)\n- *Directing: Film Techniques and Aesthetics* — Michael Rabiger\n- VFX supervisor collaboration guides"),

('rehearsals.md', 'Actor Rehearsals', 'pre-production', 11, None,
"Rehearsal is where the director and cast discover the scenes before the "
"crew is watching and the clock is running. Even two or three days of "
"table work and blocking rehearsal with principal cast saves significant "
"time on set.\n\n"
"Focus rehearsals on: character relationships, emotional beats, and physical "
"blocking (where people move and why). The camera positions will follow "
"the performances, not the other way around.\n\n"
"### References\n- *Directing Actors* — Judith Weston\n- *The Film Director's Intuition* — Judith Weston\n- Stanislavski/Meisner acting technique references"),

('equipment-package.md', 'Lock Equipment Package', 'pre-production', 12, None,
"The camera, lighting, and grip package must be locked and tested before "
"first day. The DP drives camera and lens choices; the gaffer drives lighting; "
"the key grip drives movement (dolly, crane, gimbal). "
"All packages should be tested together before arriving on set.\n\n"
"Renting beats buying for most indie films: a full camera package for a "
"feature shoot is typically $3,000–$15,000/week depending on format. "
"Insurance must cover all rented equipment from the moment you take delivery.\n\n"
"### References\n- Camera rental houses (Keslow, ACS, Panavision)\n- Grip & lighting suppliers (Cinelease, Jem/LTV)\n- *The Filmmaker's Handbook* — Ascher & Pincus"),
]

# ── Production ──

stories += [
('call-sheets.md', 'Issue Daily Call Sheets', 'production', 1, 'schedule',
"The call sheet is the daily operational document: who arrives when, where, "
"and what they're shooting. It lists every cast member's call time, "
"every department's call, the day's scenes in shooting order, lunch time, "
"estimated wrap, location address, nearest hospital, and emergency contacts.\n\n"
"The First AD prepares the call sheet the evening before, based on the "
"shooting schedule and any adjustments from that day's shoot. "
"Everyone on set lives and dies by the call sheet. "
"A late or incomplete call sheet is the first sign of a disorganised production.\n\n"
"### In nb-web\nDay notes in `schedule/` carry the structural data that feeds "
"call sheet generation. The `hours:` block documents the actual call and wrap "
"times after the fact, building a historical record of what each day cost.\n\n"
"### References\n- AD Society call sheet standards\n- StudioBinder call sheet tool\n- *The Complete Film Production Handbook* — Eve Light Honthaner"),

('shooting-day.md', 'The Shooting Day', 'production', 2, 'shot-list',
"The shooting day has a rhythm: company move → setup → rehearse → shoot → "
"move to next setup. The First AD manages time; the director manages performance "
"and coverage; the DP manages light and camera. The producer manages everything else.\n\n"
"The golden rule: every setup costs time. Slow setups mean fewer shots, "
"which means missing coverage, which means problems in the edit. "
"Prep everything before calling the cast to set. Protect your shooting time.\n\n"
"### In nb-web\nShot notes in `shots/` carry `seq:` and `day:` fields. "
"The shot list view (shots.line) lets you see the day's shots in sequence order "
"and mark them off as you go. Shot coverage against the schedule is visible at a glance.\n\n"
"### References\n- *The Film Director's Toolkit*\n- AD on-set protocols\n- *Behind the Camera* — various DoP interviews"),

('dailies-review.md', 'Review Dailies', 'production', 3, None,
"Dailies are the raw footage from the previous day's shoot, reviewed by "
"the director, producer, and DP to confirm coverage before the opportunity "
"to reshoot is gone. In the digital era, dailies are often reviewed same-day "
"on set via DIT (Digital Imaging Technician) monitoring.\n\n"
"The critical question in dailies: do you have what you need to cut the scene? "
"Not 'is it perfect?' but 'does it work?' If not, reshoot now while you still "
"have the location, the cast, and the equipment.\n\n"
"### References\n- DIT workflow guides\n- On-set dailies review protocols\n- *The Filmmaker's Eye* — Gustavo Mercado"),

('script-continuity.md', 'Script Continuity', 'production', 4, 'scenes',
"Continuity is the invisible craft that makes editing possible. "
"The Script Supervisor documents every shot: which take was selected, "
"the exact state of every costume, prop, and hairstyle, the lens and f-stop, "
"actor eyeline, and the action at the start and end of each take.\n\n"
"Without tight continuity notes, the editor cannot cut between shots. "
"A glass of water in one shot that's suddenly full in the next, a jacket "
"on then off then on — these are continuity errors that audiences notice "
"and reviewers mock. The Script Supervisor prevents them.\n\n"
"### In nb-web\nScene notes in `script/` can carry continuity annotations "
"in their sidecar files — notes on how each scene was actually shot vs. "
"how it was scripted, flagging changes for the editor.\n\n"
"### References\n- Script Supervisor handbook\n- *Script Supervising and Film Continuity* — Pat Miller\n- Continuity documentation templates"),

('production-reports.md', 'Daily Production Reports', 'production', 5, 'budget',
"The Daily Production Report (DPR) is the formal record of what happened "
"each day: scenes shot, pages completed, setups completed, crew and cast hours, "
"equipment notes, incidents, weather, and a running total of schedule and "
"budget vs. actuals.\n\n"
"The DPR is the legal and financial record of the production. "
"Insurance claims, tax credit applications, and union compliance audits "
"all rely on DPRs. The production accountant and Line Producer review "
"each one against the budget to catch overages before they compound.\n\n"
"### In nb-web\nThe budget system's output reflects actuals as you enter "
"them into annotation sidecars. Running hledger against the journal gives "
"you a live budget-vs-actual report at any point during production.\n\n"
"### References\n- DPR templates (StudioBinder)\n- Production accounting standards\n- *The UPM Handbook*"),

('wrap-day.md', 'Wrap Production', 'production', 6, 'locations',
"Wrap day is logistically the most complex day of production. "
"Every rented item must be returned: equipment to the rental house, "
"locations restored to their original condition, props and wardrobe "
"secured. Final crew timesheets collected. Petty cash reconciled.\n\n"
"A bad wrap creates expensive problems: a damaged location means a lawsuit; "
"missing equipment means security deposits lost; unsigned timesheets "
"mean payroll disputes. The wrap is as important as the first day — "
"allocate proper time and attention.\n\n"
"### In nb-web\nLocation notes in `locations/` carry the agreement and "
"restoration requirements. After wrap, update the annotation sidecar "
"with the actual condition on departure and any final costs.\n\n"
"### References\n- Wrap procedures checklist\n- Equipment return protocols\n- Location restoration standards"),
]

# ── Post-Production ──

stories += [
('footage-ingest.md', 'Ingest & Archive Raw Footage', 'post-production', 1, None,
"Raw camera files are irreplaceable. Before editing begins, all camera "
"cards must be ingested, verified (checksum), and backed up to at least "
"three separate locations — ideally two on-site on different drives and "
"one off-site (or cloud). Lose the footage and the film is gone.\n\n"
"Label everything systematically: camera roll, date, reel number. "
"Sync external audio to picture immediately. Build a folder structure "
"your editor will be able to navigate in six months. "
"This unglamorous step is what makes everything else possible.\n\n"
"### References\n- Digital Asset Management best practices (DPAX)\n- LTO tape for long-term archival\n- *The Digital Filmmaking Handbook* — Birn & Birn"),

('assembly-cut.md', 'Assembly Cut', 'post-production', 2, None,
"The assembly cut is the editor's first pass through all footage, "
"using roughly the best take of every shot in script order. "
"It's invariably too long (often 2–3x the target runtime) and rough, "
"but it proves the coverage works and reveals the structural issues.\n\n"
"No director should panic at the assembly cut. It is not the film — "
"it's the raw material for the film. Great editors often say the real "
"editing begins after the assembly.\n\n"
"### References\n- Editing theory (*In the Blink of an Eye* — Walter Murch)\n- Editing software (DaVinci Resolve, Avid, Premiere)\n- ACE (American Cinema Editors) resources"),

('directors-cut.md', 'Director\'s Cut', 'post-production', 3, None,
"The director works with the editor to refine the cut: shot selection, "
"timing, pacing, scene order, and performance choices. This is the most "
"creative phase of post-production.\n\n"
"In the DGA agreement, the director has a contractual right to deliver "
"a director's cut before the studio or producers can make further changes. "
"For independent films, director and producer work collaboratively, "
"but the director's vision drives the cut at this stage.\n\n"
"### References\n- *The Conversations* — Michael Ondaatje (interviews with Walter Murch)\n- DGA director's cut rights\n- *On Film Editing* — Edward Dmytryk"),

('test-screenings.md', 'Test Screenings', 'post-production', 4, None,
"Test screenings expose the cut to audiences before lock, when "
"changes can still be made. Use paper questionnaires (not focus groups — "
"group dynamics distort individual reactions) and ask specific questions: "
"Did you understand X? Did you believe Y? Where did you lose interest?\n\n"
"Identify patterns across responses, not outliers. One person who hated "
"the ending is noise. Ten people confused by the second act is signal. "
"Screen for your target audience, not for your friends.\n\n"
"### References\n- Test screening methodology\n- Market research for independent film\n- SurveyMonkey / paper questionnaire design"),

('picture-lock.md', 'Picture Lock', 'post-production', 5, None,
"Picture lock is the formal declaration that the edit is final. "
"After lock, all downstream work — sound design, VFX, music, colour — "
"is done against a stable timeline. Unlocking picture after any of "
"these departments have begun is expensive, disruptive, and sometimes impossible.\n\n"
"Before locking: the director, producer, and any approval parties "
"(studio, financier, completion bond) must formally sign off. "
"Get this in writing. Verbal approvals evaporate when someone wants changes later.\n\n"
"### References\n- Picture lock protocols\n- DGA approval rights\n- Post-production supervisor checklists"),

('vfx.md', 'VFX Supervision & Delivery', 'post-production', 6, None,
"Visual effects shots are complex because they require collaboration "
"between the editor, VFX supervisor, and VFX vendors — often simultaneously. "
"The VFX supervisor tracks every shot, approves previz and renders, "
"and integrates approved finals back into the edit.\n\n"
"The most common indie film VFX: wire removal, sky replacement, "
"screen inserts, cosmetic fixes, and compositing. Even modest VFX "
"budgets require clear specs — resolution, frame rate, deliverable format — "
"communicated to vendors before they start.\n\n"
"### References\n- VFX Society best practices\n- Foundry Nuke / Adobe After Effects\n- VFX supervisor brief templates"),

('sound-design.md', 'Sound Design', 'post-production', 7, None,
"Sound is 50% of the experience, and audience attention to picture drops "
"dramatically when sound quality degrades. Sound design creates the auditory "
"world of the film: production dialogue editing, ambience, hard effects, "
"designed sounds, and the overall sonic landscape.\n\n"
"The sound team receives the locked picture and works through: dialogue "
"editing and cleanup, effects editing, Foley recording, ADR, music spotting, "
"and the final mix. Each phase requires time — rushing post-sound produces "
"films that feel cheap regardless of picture quality.\n\n"
"### References\n- *The Practical Art of Motion Picture Sound* — David Lewis Yewdall\n- Pro Tools HDX\n- MPSE (Motion Picture Sound Editors)"),

('adr.md', 'ADR — Dialogue Re-Recording', 'post-production', 8, None,
"ADR (Automated Dialogue Replacement) is where actors re-record dialogue "
"lines in a recording studio, synced to picture. Reasons: production dialogue "
"ruined by noise, alternate line readings discovered in editing, newly "
"written lines needed for story clarity.\n\n"
"ADR is time-consuming and expensive — actors often find it difficult to "
"replicate the emotional state of the original performance. "
"Shoot with good production sound to minimise ADR. Plan the ADR sessions "
"early — actors have schedules that book up fast.\n\n"
"### References\n- ADR session protocols\n- Voice recording facilities\n- Re-engagement actor agreements"),

('score-and-music.md', 'Score & Music', 'post-production', 9, None,
"Music spotting happens after picture lock: the director and composer "
"watch the film together and decide where music goes, what it should feel, "
"and what style it should be. Every music decision has both creative and "
"financial implications — original score, licensed tracks, and public "
"domain music all cost differently.\n\n"
"The composer writes to locked picture, records (live or electronically), "
"and delivers stems (separate instrument groups) for the final mix. "
"Music licensing for pre-existing songs requires both master and sync rights "
"— budget accordingly.\n\n"
"### References\n- *On the Track: A Guide to Contemporary Film Scoring* — Fred Karlin\n- ASCAP/BMI sync licensing\n- Guild of Music Supervisors"),

('colour-grade.md', 'Colour Grade & Finishing', 'post-production', 10, None,
"The colour grade is the final visual polish: the colourist corrects "
"shot-to-shot exposure and white balance inconsistencies, then applies "
"the creative look — a warm grade for intimacy, a desaturated grade "
"for bleakness, a high-contrast look for tension.\n\n"
"Finishing also includes: end titles, subtitle burn-in, MPAA/BBFC rating "
"cards, and any other on-screen text. The output of finishing is the "
"final picture master — everything downstream is derived from this file.\n\n"
"### References\n- DaVinci Resolve (industry standard for colour)\n- *Color and Light* — James Gurney (theory)\n- Society of Motion Picture and Television Engineers (SMPTE) standards"),

('deliverables.md', 'Generate Deliverables Package', 'post-production', 11, None,
"Every distributor, platform, and broadcaster has a different spec sheet. "
"Netflix requires ProRes 4444 at specific bit rates. Apple TV+ has its own "
"IMF package requirements. Theatrical needs a DCP. TV broadcast has its own "
"loudness and aspect ratio requirements.\n\n"
"The deliverables package is assembled from the picture master, audio masters, "
"subtitle files, metadata, and marketing materials. "
"Hire a post-production supervisor who has done platform deliveries before — "
"rejected deliverables cost time and money to fix.\n\n"
"### References\n- Netflix partner help (partnerhelp.netflixstudios.com)\n- Apple TV+ technical specs\n- DCP-o-matic (open source DCP creation)"),
]

# ── Distribution & Release ──

stories += [
('festival-strategy.md', 'Festival Strategy', 'distribution', 1, None,
"Film festivals are not all equal. Sundance, Cannes, TIFF, Berlin, and "
"Venice are the top tier — a premiere at one of these is a marketing event "
"that can transform a small film's commercial prospects. "
"Tier 2 (SXSW, Tribeca, Rotterdam) are strong second options. "
"Your film's genre and subject matter should match the festival's brand.\n\n"
"World premiere strategy matters: festivals generally want exclusivity. "
"Submitting to multiple A-list festivals simultaneously means committing "
"to one as soon as you get an offer. Don't make A-list festivals wait "
"while you shop for a better offer — they'll withdraw the slot.\n\n"
"### References\n- FilmFreeway (festival submission platform)\n- *The Festival Circuit* — various guides\n- Sundance, TIFF submission guidelines"),

('sales-agent.md', 'Secure Sales Agent', 'distribution', 2, None,
"A sales agent represents your film to distributors worldwide. "
"They have pre-existing relationships with buyers at film markets "
"(Cannes, AFM, EFM, Sundance), know what territories will pay for "
"your type of film, and handle the deal negotiations.\n\n"
"Sales agents typically take 15–25% of distribution revenues. "
"Approach them before your festival premiere — a sales agent who "
"believes in the film can help shape your festival strategy and "
"set up market screenings alongside your premiere.\n\n"
"### References\n- AFMA (American Film Market Association)\n- *Selling Your Film Without Selling Your Soul*\n- Film market calendars (Cannes/Marché, AFM, EFM)"),

('marketing-campaign.md', 'Launch Marketing Campaign', 'distribution', 3, None,
"Marketing is the work that connects the film to the audience that "
"wants to see it. For an independent film with limited P&A budget, "
"the most effective tools are: a great trailer, a clear one-sheet, "
"authentic social media presence, and early critic relationships.\n\n"
"Marketing strategy must answer: who is the audience, where do they live "
"online, and what's the hook that makes this film worth two hours of their "
"attention? A film without a clear answer to this question is hard to market "
"no matter how good it is.\n\n"
"### References\n- *Indie Film Marketing* — various\n- No Film School marketing resources\n- PR firms specialising in film (Falco Ink, Ginsberg/Libby)"),

('press-kit.md', 'Create Press Kit & EPK', 'distribution', 4, None,
"The press kit is the journalist's toolbox: production notes (story of the film, "
"cast/director bios, behind-the-scenes), production stills (high-res, cleared "
"for publication), the trailer, and a fact sheet. "
"The EPK (Electronic Press Kit) adds B-roll footage and interview segments.\n\n"
"Invest in great production stills — they live forever. A single iconic still "
"can become the film's identity in ways a poster never does. "
"Hire a dedicated stills photographer on set; don't rely on frame grabs.\n\n"
"### References\n- Press kit templates\n- MPAA production stills guidelines\n- *The Film Marketing Handbook*"),

('theatrical-release.md', 'Theatrical Release', 'distribution', 5, None,
"A theatrical run — even a limited one — establishes prestige, "
"enables award eligibility, and creates marketing noise that drives "
"downstream streaming and VOD sales. "
"For most independent films, theatrical is a loss leader for everything else.\n\n"
"Coordinate cinema bookings, advertising (newspaper, online, outdoor), "
"preview screenings, Q&As with the director, and press junkets "
"around the opening weekend. "
"Opening weekend box office determines whether the run expands or "
"gets pulled — there are no second chances.\n\n"
"### References\n- Theatrical distribution mechanics\n- Cinema circuit negotiations\n- Box office tracking (Box Office Mojo)"),

('streaming-launch.md', 'Streaming & VOD Launch', 'distribution', 6, None,
"Streaming is now the primary audience for most independent films. "
"A deal with a major SVOD platform (Netflix, Apple TV+, Amazon, Hulu) "
"provides a guaranteed advance and global audience. "
"A deal with a smaller platform or self-distribution via Vimeo OTT, "
"Gumroad, or Reelgood preserves rights but requires your own marketing.\n\n"
"Platform metadata — title, description, keywords, genres, "
"cast credits — directly affects algorithm discoverability. "
"Spend time on metadata; it's free marketing.\n\n"
"### References\n- Platform distribution specs\n- *Streaming Wars* industry reporting\n- WIPO digital distribution resources"),

('awards-campaign.md', 'Awards Campaign', 'distribution', 7, None,
"An awards campaign is a marketing campaign targeted at industry voters. "
"For the Oscars: films must have a qualifying theatrical run in Los Angeles County. "
"Campaigns include: industry screenings, trade advertising, FYC (For Your Consideration) "
"events, and cultivating relationships with Academy branch members.\n\n"
"Awards campaigns are expensive. Before investing, assess honestly: "
"does the film have genuine awards potential, or are you spending money "
"on hope? A strategic mid-tier awards campaign (critics circles, guild awards) "
"can be more valuable than a failed Oscar push.\n\n"
"### References\n- Academy Awards submission rules\n- BAFTA eligibility guidelines\n- Awards circuit trade publications (Deadline, IndieWire)"),

('rights-management.md', 'Ongoing Rights Management', 'distribution', 8, None,
"Films generate revenue for decades — residuals, reversion windows, "
"catalog licensing, and library sales. "
"Track every rights agreement, every territory, every window, "
"and every reversion date. When distribution rights revert, "
"you can relicense or self-distribute.\n\n"
"Residuals — payments to guild members (SAG, DGA, WGA) based on "
"distribution revenues — are legally required and administered through "
"the guilds. Failure to pay residuals has serious consequences. "
"Make sure your production accountant tracks and remits them.\n\n"
"### References\n- SAG-AFTRA residuals department\n- WGA residuals\n- Rights management software (RightsLine)"),
]

# ── Generate all story files ─────────────────────────────────────────────────

HINT = (
    "\n\n---\n\n"
    "**Everybody has an idea for a movie. This is yours.**\n\n"
    "Open the board (▦) — every step of making your film is already waiting in the "
    "lanes below, from first draft to world premiere. Drag the next card up to the "
    "storyline when you're ready to take that step."
)

for entry in stories:
    filename, title, plotline, seq, tool, body = entry
    kw = dict(title=title, type='story', plotline=plotline, seq=seq, desc='')
    # extract desc from first sentence of body
    first_para = body.strip().split('\n')[0]
    kw['desc'] = first_para.split('.')[0].replace('*','').strip()[:80]
    if tool:
        # tag nb-web so notebook tag_colors config can color the title;
        # also carry tag_color per-note for portability in other notebooks
        kw['tags'] = 'nb-web'
        kw['tag_color'] = 'nb-web:#c8960c'
    # concept.md ships as the single "before" card on the main storyline
    if filename == 'concept.md':
        kw['story_seq'] = 1
        body = body.rstrip() + HINT
    write(filename, fm(**kw), body)

# ── .index ───────────────────────────────────────────────────────────────────

all_files = (
    ['film-school.md',
     'story-script.md', 'finance.md', 'pre-production.md',
     'production.md', 'post-production.md', 'distribution.md']
    + [m[0] for m in milestones]
    + [s[0] for s in stories]
)

(TARGET / '.index').write_text('\n'.join(all_files) + '\n')
print(f'\nDone — {len(all_files)} files in {TARGET}')
print('\nNow add film-school to the parent .index:')
print(f"  echo 'film-school' >> ~/.nb/Takeout/storylines/.index")
