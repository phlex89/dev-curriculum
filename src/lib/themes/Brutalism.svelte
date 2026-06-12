<script lang="ts">
  import { cvData } from '$lib/cv-data';

  // Brutalism (2017–2020): raw, anti-design, intentional. A "view-source" punk-zine
  // CV — newsprint paper, ink-black hairlines turned into 4px slabs, hard offset
  // shadows (no blur), screaming clashing colour blocks, giant grid-breaking type,
  // monospace meta-labels. Every interaction is blunt and tactile.

  // Loud, clashing accents cycled across experience cards / section tags.
  const accents = ['acid', 'cobalt', 'red', 'lime', 'pink'] as const;

  // Ticker content (mono, scrolls forever) — built from the single source of truth.
  const tickerItems = [
    'OPEN TO WORK',
    cvData.role.toUpperCase(),
    '10+ YEARS',
    'VUE / REACT / TYPESCRIPT',
    'DESIGN SYSTEMS',
    cvData.contact.location.toUpperCase(),
    'NO FRAMEWORKS WERE HARMED'
  ];

  // expanded experience row (brutalist accordion — hard toggle, no easing)
  let openExp = $state<number | null>(0);
  function toggleExp(i: number) {
    openExp = openExp === i ? null : i;
  }
</script>

<div class="bru-wrapper">
  <!-- Scrolling monospace ticker -->
  <div class="bru-ticker" aria-hidden="true">
    <div class="bru-ticker-track">
      {#each [0, 1] as dup (dup)}
        <span class="bru-ticker-group">
          {#each tickerItems as item}
            <span class="bru-ticker-item">{item}</span>
            <span class="bru-ticker-star">✸</span>
          {/each}
        </span>
      {/each}
    </div>
  </div>

  <div class="bru-page">
    <!-- ░░ HERO ░░ -->
    <header class="bru-hero">
      <div class="bru-hero-meta">
        <span class="bru-kicker">CURRICULUM_VITAE.HTML</span>
        <span class="bru-kicker bru-blink">● {cvData.contact.location}</span>
      </div>
      <h1 class="bru-name" data-text={cvData.name}>{cvData.name}</h1>
      <div class="bru-role-row">
        <span class="bru-role">{cvData.role}</span>
      </div>
      <p class="bru-tagline">{cvData.tagline}</p>
    </header>

    <!-- ░░ 01 PROFILE ░░ -->
    <section class="bru-section">
      <div class="bru-shead">
        <span class="bru-num acid">01</span>
        <h2>PROFILE</h2>
        <span class="bru-rule"></span>
      </div>
      <div class="bru-block bru-summary">
        <p>{cvData.summary}</p>
      </div>
    </section>

    <!-- ░░ 02 EXPERIENCE ░░ -->
    <section class="bru-section">
      <div class="bru-shead">
        <span class="bru-num cobalt">02</span>
        <h2>EXPERIENCE</h2>
        <span class="bru-rule"></span>
      </div>

      <div class="bru-exp-list">
        {#each cvData.experience as exp, i}
          <article class="bru-exp accent-{accents[i % accents.length]}" class:open={openExp === i}>
            <button class="bru-exp-head" onclick={() => toggleExp(i)} aria-expanded={openExp === i}>
              <span class="bru-exp-index">{String(i + 1).padStart(2, '0')}</span>
              <span class="bru-exp-headmain">
                <span class="bru-exp-company">{exp.company}</span>
                <span class="bru-exp-title">{exp.title}</span>
              </span>
              <span class="bru-exp-meta">
                {#if exp.sector}<span class="bru-tag-sector">{exp.sector}</span>{/if}
                <span class="bru-exp-period">{exp.period}</span>
              </span>
              <span class="bru-exp-toggle" aria-hidden="true">{openExp === i ? '–' : '+'}</span>
            </button>
            {#if openExp === i}
              <div class="bru-exp-body">
                <p class="bru-exp-desc">{exp.description}</p>
                <span class="bru-loc">↳ {exp.location}</span>
                <ul class="bru-bullets">
                  {#each exp.highlights as h}<li>{h}</li>{/each}
                </ul>
                <div class="bru-tags">
                  {#each exp.technologies as t}<span class="bru-tag">{t}</span>{/each}
                </div>
              </div>
            {/if}
          </article>
        {/each}

        <!-- Early career (origins block) -->
        <article class="bru-exp accent-lime bru-early">
          <div class="bru-exp-head bru-exp-head--static">
            <span class="bru-exp-index">00</span>
            <span class="bru-exp-headmain">
              <span class="bru-exp-company">{cvData.earlyCareer.title}</span>
              <span class="bru-exp-title">{cvData.earlyCareer.description}</span>
            </span>
            <span class="bru-exp-meta">
              <span class="bru-exp-period">{cvData.earlyCareer.period}</span>
            </span>
          </div>
          <div class="bru-exp-body">
            <ul class="bru-bullets">
              {#each cvData.earlyCareer.highlights as h}<li>{h}</li>{/each}
            </ul>
            <div class="bru-tags">
              {#each cvData.earlyCareer.technologies as t}<span class="bru-tag">{t}</span>{/each}
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ░░ 03 STACK ░░ -->
    <section class="bru-section">
      <div class="bru-shead">
        <span class="bru-num red">03</span>
        <h2>STACK</h2>
        <span class="bru-rule"></span>
      </div>
      <div class="bru-skill-grid">
        {#each cvData.skillGroups as group, i}
          <div class="bru-block bru-skill-group accent-{accents[i % accents.length]}">
            <span class="bru-skill-label">{group.label}</span>
            <div class="bru-tags">
              {#each group.items as item}<span class="bru-tag">{item}</span>{/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- ░░ 04 EDUCATION + CREDENTIALS ░░ -->
    <section class="bru-section">
      <div class="bru-shead">
        <span class="bru-num pink">04</span>
        <h2>EDUCATION & CREDENTIALS</h2>
        <span class="bru-rule"></span>
      </div>
      <div class="bru-two-col">
        <div class="bru-block">
          <span class="bru-skill-label">Education</span>
          {#each cvData.education as edu}
            <div class="bru-edu-item">
              <strong>{edu.title}</strong>
              <span>{edu.institute} — {edu.location}</span>
              <span class="bru-mono-meta">{edu.period}</span>
            </div>
          {/each}
        </div>
        <div class="bru-block">
          <span class="bru-skill-label">Talks</span>
          <ul class="bru-list">
            {#each cvData.conferences as conf}<li>{conf.name} <em>· {conf.location} ’{conf.year.slice(-2)}</em></li>{/each}
          </ul>
        </div>
      </div>
    </section>

    <!-- ░░ 05 LANGUAGES ░░ -->
    <section class="bru-section">
      <div class="bru-shead">
        <span class="bru-num cobalt">05</span>
        <h2>LANGUAGES</h2>
        <span class="bru-rule"></span>
      </div>
      <div class="bru-lang-row">
        {#each cvData.languages as lang}
          <div class="bru-block bru-lang">
            <span class="bru-lang-name">{lang.name}</span>
            <span class="bru-lang-level">{lang.level}</span>
            {#if lang.note}<span class="bru-mono-meta">{lang.note}</span>{/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- ░░ 06 CONTACT ░░ -->
    <section class="bru-section">
      <div class="bru-shead">
        <span class="bru-num acid">06</span>
        <h2>CONTACT</h2>
        <span class="bru-rule"></span>
      </div>
      <div class="bru-contact-grid">
        <a class="bru-cta acid" href={cvData.contact.linkedin} target="_blank" rel="noopener">
          <span class="bru-cta-k">LinkedIn</span><span class="bru-cta-v">in/stefano-tedeschi</span><span class="bru-cta-arrow">→</span>
        </a>
        <a class="bru-cta cobalt" href="mailto:{cvData.contact.email}">
          <span class="bru-cta-k">Email</span><span class="bru-cta-v">{cvData.contact.email}</span><span class="bru-cta-arrow">→</span>
        </a>
        <a class="bru-cta red" href={cvData.contact.website} target="_blank" rel="noopener">
          <span class="bru-cta-k">Website</span><span class="bru-cta-v">{cvData.contact.website.replace('https://', '')}</span><span class="bru-cta-arrow">→</span>
        </a>
        <a class="bru-cta pink" href="tel:{cvData.contact.phone.replace(/\s/g, '')}">
          <span class="bru-cta-k">Phone</span><span class="bru-cta-v">{cvData.contact.phone}</span><span class="bru-cta-arrow">→</span>
        </a>
      </div>
    </section>

    <footer class="bru-footer">
      <span>HANDCODED · NO TEMPLATE · {cvData.name.toUpperCase()}</span>
      <span class="bru-footer-glyph">▚▞▚</span>
    </footer>
  </div>
</div>

<style>
  .bru-wrapper {
    --paper: #f3efe2;
    --ink: #0c0c0c;
    --acid: #e9ff1a;
    --cobalt: #2b39ff;
    --red: #ff3b1d;
    --lime: #9bff3b;
    --pink: #ff4fa6;

    position: absolute;
    inset: 0;
    background-color: var(--paper);
    /* Newsprint grain: faint dot grid + paper tint */
    background-image:
      radial-gradient(var(--ink) 0.5px, transparent 0.6px),
      radial-gradient(var(--ink) 0.5px, transparent 0.6px);
    background-size: 18px 18px, 18px 18px;
    background-position: 0 0, 9px 9px;
    color: var(--ink);
    font-family: 'Archivo', 'Arial Narrow', sans-serif;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-font-smoothing: none;
  }

  /* The dot grid above is too heavy at full strength — fade it via a paper overlay */
  .bru-wrapper::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--paper);
    opacity: 0.92;
    pointer-events: none;
    z-index: 0;
  }

  .bru-page {
    position: relative;
    z-index: 1;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 24px 110px;
    box-sizing: border-box;
  }

  /* ░░ TICKER ░░ */
  .bru-ticker {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--ink);
    color: var(--acid);
    border-bottom: 4px solid var(--ink);
    overflow: hidden;
    white-space: nowrap;
  }
  .bru-ticker-track {
    display: inline-flex;
    animation: bru-marquee 26s linear infinite;
    font-family: 'Space Mono', monospace;
    font-weight: 700;
    font-size: 0.82rem;
    letter-spacing: 0.06em;
    padding: 8px 0;
    will-change: transform;
  }
  .bru-ticker-group { display: inline-flex; align-items: center; }
  .bru-ticker-item { padding: 0 14px; text-transform: uppercase; }
  .bru-ticker-star { color: var(--red); }
  @keyframes bru-marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* ░░ HERO ░░ */
  .bru-hero {
    border: 4px solid var(--ink);
    background: var(--paper);
    box-shadow: 12px 12px 0 var(--ink);
    padding: 28px 30px 34px;
    margin: 34px 0 46px;
    position: relative;
  }
  .bru-hero-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Space Mono', monospace;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
  }
  .bru-kicker { background: var(--ink); color: var(--paper); padding: 3px 8px; }
  .bru-blink { background: var(--acid); color: var(--ink); animation: bru-blink 1.1s steps(1) infinite; }
  @keyframes bru-blink { 50% { opacity: 0.25; } }

  .bru-name {
    font-family: 'Anton', 'Arial Narrow', sans-serif;
    font-weight: 400;
    font-size: clamp(3.4rem, 13vw, 9rem);
    line-height: 0.86;
    letter-spacing: 0.005em;
    text-transform: uppercase;
    margin: 0;
    /* Glitch / chromatic aberration — pure brutalist-web signature */
    text-shadow: 4px 0 var(--cobalt), -4px 0 var(--red);
    animation: bru-glitch 5.5s steps(2) infinite;
  }
  @keyframes bru-glitch {
    0%, 92%, 100% { text-shadow: 4px 0 var(--cobalt), -4px 0 var(--red); transform: translate(0, 0); }
    93% { text-shadow: -6px 0 var(--cobalt), 6px 2px var(--red); transform: translate(2px, -1px); }
    95% { text-shadow: 6px 0 var(--red), -6px 0 var(--cobalt); transform: translate(-2px, 1px); }
    97% { text-shadow: 4px 0 var(--cobalt), -4px 0 var(--red); transform: translate(1px, 0); }
  }

  .bru-role-row { margin-top: 16px; }
  .bru-role {
    display: inline-block;
    background: var(--cobalt);
    color: var(--paper);
    font-weight: 800;
    font-size: clamp(0.95rem, 2.6vw, 1.45rem);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    padding: 6px 14px;
    border: 3px solid var(--ink);
    box-shadow: 5px 5px 0 var(--ink);
  }
  .bru-tagline {
    margin: 22px 0 0;
    font-size: clamp(1rem, 2vw, 1.32rem);
    font-weight: 600;
    line-height: 1.3;
    max-width: 46ch;
    border-left: 8px solid var(--red);
    padding-left: 16px;
  }

  /* ░░ SECTION SCAFFOLD ░░ */
  .bru-section {
    margin-bottom: 54px;
    /* Skip layout/paint for sections scrolled out of view; `auto` remembers each
       section's real height after first render so scrolling back never jumps. */
    content-visibility: auto;
    contain-intrinsic-size: auto 400px;
  }
  .bru-shead {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
  }
  .bru-num {
    font-family: 'Anton', sans-serif;
    font-size: 1.5rem;
    line-height: 1;
    padding: 6px 10px 4px;
    border: 3px solid var(--ink);
    color: var(--ink);
    box-shadow: 4px 4px 0 var(--ink);
  }
  .bru-shead h2 {
    font-family: 'Anton', sans-serif;
    font-weight: 400;
    font-size: clamp(1.5rem, 4.5vw, 2.6rem);
    text-transform: uppercase;
    letter-spacing: 0.01em;
    margin: 0;
    white-space: nowrap;
  }
  .bru-rule {
    flex: 1;
    height: 6px;
    background:
      repeating-linear-gradient(90deg, var(--ink) 0 10px, transparent 10px 16px);
  }

  /* ░░ GENERIC BLOCK ░░ */
  .bru-block {
    border: 4px solid var(--ink);
    background: var(--paper);
    box-shadow: 8px 8px 0 var(--ink);
    padding: 22px 24px;
  }
  .bru-summary p {
    margin: 0;
    font-size: 1.12rem;
    line-height: 1.55;
    font-weight: 500;
  }

  /* ░░ EXPERIENCE ░░ */
  .bru-exp-list { display: flex; flex-direction: column; gap: 20px; }
  .bru-exp {
    border: 4px solid var(--ink);
    background: var(--paper);
    box-shadow: 8px 8px 0 var(--ink);
    transition: transform 0.08s linear, box-shadow 0.08s linear;
  }
  .bru-exp:hover {
    transform: translate(4px, 4px);
    box-shadow: 4px 4px 0 var(--ink);
  }
  .bru-exp.open { box-shadow: 8px 8px 0 var(--ink); transform: none; }

  .bru-exp-head {
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    gap: 16px;
    padding: 16px 18px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    color: inherit;
    border-bottom: 4px solid transparent;
  }
  .bru-exp.open .bru-exp-head { border-bottom: 4px solid var(--ink); }
  .bru-exp-head--static { cursor: default; }
  .bru-exp-head:focus-visible { outline: 3px solid var(--cobalt); outline-offset: -3px; }

  .bru-exp-index {
    font-family: 'Anton', sans-serif;
    font-size: 1.8rem;
    line-height: 1;
    /* per-accent fill set below */
    padding: 5px 8px 3px;
    border: 3px solid var(--ink);
  }
  .bru-exp-headmain { display: flex; flex-direction: column; min-width: 0; }
  .bru-exp-company {
    font-weight: 800;
    font-size: 1.18rem;
    text-transform: uppercase;
    letter-spacing: 0.01em;
    line-height: 1.1;
  }
  .bru-exp-title { font-size: 0.92rem; font-weight: 600; opacity: 0.78; }
  .bru-exp-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; text-align: right; }
  .bru-tag-sector {
    font-family: 'Space Mono', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
    background: var(--ink);
    color: var(--paper);
    padding: 2px 6px;
    white-space: nowrap;
  }
  .bru-exp-period { font-family: 'Space Mono', monospace; font-size: 0.78rem; font-weight: 700; white-space: nowrap; }
  .bru-exp-toggle {
    font-family: 'Anton', sans-serif;
    font-size: 1.7rem;
    line-height: 1;
    width: 30px;
    text-align: center;
  }

  .bru-exp-body { padding: 18px 18px 20px; }
  .bru-exp-desc { margin: 0 0 6px; font-size: 1rem; font-weight: 600; line-height: 1.4; }
  .bru-loc { font-family: 'Space Mono', monospace; font-size: 0.74rem; font-weight: 700; opacity: 0.7; }
  .bru-bullets { margin: 14px 0 0; padding: 0; list-style: none; }
  .bru-bullets li {
    position: relative;
    padding: 0 0 0 24px;
    margin-bottom: 9px;
    font-size: 0.95rem;
    line-height: 1.45;
    font-weight: 500;
  }
  .bru-bullets li::before {
    content: '■';
    position: absolute;
    left: 0;
    top: 0.05em;
    font-size: 0.8rem;
  }

  .bru-early .bru-exp-title { font-weight: 500; opacity: 0.85; white-space: normal; }

  /* ░░ TAGS ░░ */
  .bru-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
  .bru-tag {
    font-family: 'Space Mono', monospace;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 4px 9px;
    border: 2px solid var(--ink);
    background: var(--paper);
    transition: background 0.06s linear, color 0.06s linear;
  }
  .bru-tag:hover { background: var(--ink); color: var(--paper); }

  /* ░░ STACK ░░ */
  .bru-skill-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  .bru-skill-group { padding: 18px 20px; }
  .bru-skill-label {
    display: block;
    font-family: 'Space Mono', monospace;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
    background: var(--ink);
    color: var(--paper);
    padding: 3px 7px;
    width: fit-content;
  }
  .bru-mt { margin-top: 18px; }

  /* ░░ TWO-COL (edu / credentials) ░░ */
  .bru-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .bru-edu-item { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-bottom: 2px dashed var(--ink); }
  .bru-edu-item:last-child { border-bottom: none; }
  .bru-edu-item strong { font-size: 1.02rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.01em; }
  .bru-edu-item span { font-size: 0.9rem; font-weight: 500; }
  .bru-mono-meta { font-family: 'Space Mono', monospace; font-size: 0.76rem; font-weight: 700; opacity: 0.75; }
  .bru-list { margin: 0; padding: 0; list-style: none; }
  .bru-list li {
    padding: 6px 0 6px 22px;
    position: relative;
    font-size: 0.92rem;
    font-weight: 600;
    border-bottom: 1px solid rgba(12, 12, 12, 0.15);
  }
  .bru-list li::before { content: '→'; position: absolute; left: 0; font-weight: 800; }
  .bru-list li em { font-style: normal; font-weight: 500; opacity: 0.65; }

  /* ░░ LANGUAGES ░░ */
  .bru-lang-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  .bru-lang { display: flex; flex-direction: column; gap: 5px; }
  .bru-lang-name { font-family: 'Anton', sans-serif; font-size: 1.5rem; text-transform: uppercase; line-height: 1; }
  .bru-lang-level { font-weight: 700; font-size: 0.95rem; }

  /* ░░ CONTACT ░░ */
  .bru-contact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  .bru-cta {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 14px;
    text-decoration: none;
    color: var(--ink);
    border: 4px solid var(--ink);
    box-shadow: 8px 8px 0 var(--ink);
    padding: 18px 20px;
    transition: transform 0.08s linear, box-shadow 0.08s linear, background 0.08s linear, color 0.08s linear;
  }
  .bru-cta:hover { transform: translate(4px, 4px); box-shadow: 4px 4px 0 var(--ink); }
  .bru-cta:active { transform: translate(8px, 8px); box-shadow: 0 0 0 var(--ink); }
  .bru-cta:focus-visible { outline: 3px solid var(--ink); outline-offset: 4px; }
  .bru-cta-k {
    font-family: 'Anton', sans-serif;
    font-size: 1.25rem;
    text-transform: uppercase;
    padding-right: 14px;
    border-right: 3px solid var(--ink);
  }
  .bru-cta-v { font-family: 'Space Mono', monospace; font-size: 0.86rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bru-cta-arrow { font-size: 1.4rem; font-weight: 800; }

  /* ░░ FOOTER ░░ */
  .bru-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 4px solid var(--ink);
    margin-top: 20px;
    padding-top: 16px;
    font-family: 'Space Mono', monospace;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .bru-footer-glyph { color: var(--red); letter-spacing: -0.1em; }

  /* ░░ PER-ACCENT FILLS ░░ */
  .bru-num.acid,
  .accent-acid .bru-exp-index,
  .accent-acid .bru-skill-label { background: var(--acid); }
  /* acid is a light yellow: keep the label text dark, not the default --paper. */
  .accent-acid .bru-skill-label { color: var(--ink); }
  .bru-num.cobalt,
  .accent-cobalt .bru-exp-index { background: var(--cobalt); color: var(--paper); }
  .accent-cobalt .bru-skill-label { background: var(--cobalt); }
  .bru-num.red,
  .accent-red .bru-exp-index { background: var(--red); color: var(--paper); }
  .accent-red .bru-skill-label { background: var(--red); }
  .bru-num.lime,
  .accent-lime .bru-exp-index { background: var(--lime); }
  .bru-num.pink,
  .accent-pink .bru-exp-index { background: var(--pink); color: var(--paper); }
  .accent-pink .bru-skill-label { background: var(--pink); color: var(--paper); }

  /* CTA accent fills (the loud part) */
  .bru-cta.acid { background: var(--acid); }
  .bru-cta.cobalt { background: var(--cobalt); color: var(--paper); }
  .bru-cta.cobalt .bru-cta-k { border-color: var(--paper); }
  .bru-cta.red { background: var(--red); color: var(--paper); }
  .bru-cta.red .bru-cta-k { border-color: var(--paper); }
  .bru-cta.pink { background: var(--pink); color: var(--paper); }
  .bru-cta.pink .bru-cta-k { border-color: var(--paper); }

  /* ░░ RESPONSIVE ░░ */
  @media (max-width: 720px) {
    .bru-skill-grid, .bru-two-col, .bru-lang-row, .bru-contact-grid { grid-template-columns: 1fr; }
    .bru-exp-head { grid-template-columns: auto 1fr auto; }
    .bru-exp-meta { grid-column: 1 / -1; flex-direction: row; align-items: center; justify-content: flex-start; gap: 10px; }
    .bru-exp-toggle { grid-row: 1; grid-column: 3; }
    .bru-hero { box-shadow: 7px 7px 0 var(--ink); }
  }
  @media (max-width: 420px) {
    .bru-page { padding: 0 14px 110px; }
    .bru-cta-k { font-size: 1rem; padding-right: 10px; }
    .bru-cta-v { font-size: 0.74rem; }
  }

  /* ░░ REDUCED MOTION — kill the marquee, glitch, blink & tactile presses ░░ */
  @media (prefers-reduced-motion: reduce) {
    .bru-ticker-track { animation: none; transform: translateX(0); }
    .bru-name { animation: none; text-shadow: 3px 0 var(--cobalt), -3px 0 var(--red); }
    .bru-blink { animation: none; }
    .bru-exp, .bru-cta { transition: none; }
    .bru-exp:hover, .bru-cta:hover, .bru-cta:active { transform: none; box-shadow: 8px 8px 0 var(--ink); }
  }
</style>
