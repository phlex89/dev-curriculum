<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { cvData } from '$lib/cv-data';
  import { teletextBeep } from '$lib/audio';

  // ── Page map ────────────────────────────────────────────────────────────────
  // A Televideo/Ceefax magazine: every section is a numbered page. The visitor
  // either types a 3-digit page number (real-decoder feel) OR clicks the index /
  // colour FASTEXT keys (dual track → never a dead end, also works on touch).
  const PAGE = {
    COVER: 100,
    PROFILE: 101,
    EXP: 102,
    ORIGINS: 103,
    SKILLS: 104,
    LANGS: 105,
    EDU: 106,
    TALKS: 107,
    CONTACT: 108,
    SECRET: 777
  } as const;

  const EXP_BASE = 110; // experience detail pages: 110, 111, 112…

  // The clickable / listed index (cover page).
  const INDEX: { n: number; label: string; color: string }[] = [
    { n: PAGE.PROFILE, label: 'PROFILO', color: 'grn' },
    { n: PAGE.EXP, label: 'ESPERIENZA', color: 'cyn' },
    { n: PAGE.ORIGINS, label: 'LE ORIGINI', color: 'cyn' },
    { n: PAGE.SKILLS, label: 'COMPETENZE', color: 'yel' },
    { n: PAGE.LANGS, label: 'LINGUE', color: 'yel' },
    { n: PAGE.EDU, label: 'FORMAZIONE', color: 'mag' },
    { n: PAGE.TALKS, label: 'CONFERENZE', color: 'mag' },
    { n: PAGE.CONTACT, label: 'CONTATTI', color: 'red' }
  ];

  const expPages = cvData.experience.map((_, i) => EXP_BASE + i);
  const validPages = new Set<number>([PAGE.COVER, ...INDEX.map((p) => p.n), ...expPages, PAGE.SECRET]);

  // Linear walk order for the ◄ / ► page keys (the secret page sits outside it).
  const ORDER = [PAGE.COVER, PAGE.PROFILE, PAGE.EXP, ...expPages, PAGE.ORIGINS, PAGE.SKILLS, PAGE.LANGS, PAGE.EDU, PAGE.TALKS, PAGE.CONTACT];

  // The four coloured FASTEXT keys at the foot of the screen.
  const FASTEXT: { color: string; n: number; label: string }[] = [
    { color: 'red', n: PAGE.PROFILE, label: 'PROFILO' },
    { color: 'grn', n: PAGE.EXP, label: 'ESPERIENZA' },
    { color: 'yel', n: PAGE.SKILLS, label: 'COMPETENZE' },
    { color: 'cyn', n: PAGE.CONTACT, label: 'CONTATTI' }
  ];

  // ── Reactive state ────────────────────────────────────────────────────────
  let currentPage = $state<number>(PAGE.COVER);
  let buffer = $state(''); // the 3-digit number being typed
  let revealed = $state(false); // CONCEAL/REVEAL toggle (classic teletext gag)
  let acquiring = $state(false); // brief "page rolling in" flicker
  let clock = $state('');

  let wrapperEl: HTMLElement;
  let clockTimer: ReturnType<typeof setInterval>;
  let flickerTimer: ReturnType<typeof setTimeout>;

  const found = $derived(validPages.has(currentPage));
  const headerNum = $derived(buffer ? (buffer + '___').slice(0, 3) : String(currentPage));

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Live broadcast clock (Televideo headers always carry one) ───────────────
  const GIORNI = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
  const MESI = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
  const p2 = (n: number) => String(n).padStart(2, '0');

  function tickClock() {
    const d = new Date();
    clock = `${GIORNI[d.getDay()]} ${p2(d.getDate())} ${MESI[d.getMonth()]}  ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
  }

  onMount(() => {
    tickClock();
    clockTimer = setInterval(tickClock, 1000);
    window.addEventListener('keydown', onKey);
  });

  onDestroy(() => {
    clearInterval(clockTimer);
    clearTimeout(flickerTimer);
    if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey);
  });

  // ── Navigation ──────────────────────────────────────────────────────────────
  function goto(n: number) {
    buffer = '';
    revealed = false;
    currentPage = n;
    teletextBeep();
    if (!prefersReduced() && wrapperEl) {
      acquiring = true;
      clearTimeout(flickerTimer);
      flickerTimer = setTimeout(() => (acquiring = false), 130);
      // scroll the freshly-loaded page back to the top
      const body = wrapperEl.querySelector('.page-body');
      if (body) body.scrollTop = 0;
    }
  }

  function step(dir: 1 | -1) {
    const i = ORDER.indexOf(currentPage);
    if (i === -1) {
      goto(PAGE.COVER);
      return;
    }
    goto(ORDER[(i + dir + ORDER.length) % ORDER.length]);
  }

  function pushDigit(d: string) {
    buffer = (buffer + d).slice(0, 3);
    if (buffer.length === 3) goto(parseInt(buffer, 10));
  }

  function onKey(e: KeyboardEvent) {
    // Let the Timeline / audio toggle keep their own keyboard handling: only act
    // when nothing else holds focus (target is the page body or our own screen).
    const t = e.target as Node | null;
    const inScreen = !!wrapperEl && !!t && wrapperEl.contains(t);
    if (!inScreen && t !== document.body) return;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      pushDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      buffer = buffer.slice(0, -1);
    } else if (e.key === 'Enter') {
      if (buffer) {
        e.preventDefault();
        goto(parseInt(buffer, 10));
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (buffer) buffer = '';
      else goto(PAGE.COVER);
    } else if (e.key === 'ArrowRight') {
      if (t === document.body) {
        e.preventDefault();
        step(1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (t === document.body) {
        e.preventDefault();
        step(-1);
      }
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      revealed = !revealed;
    }
  }

  function downloadCV() {
    const link = document.createElement('a');
    link.href = '/cv-stefano-tedeschi.pdf';
    link.download = 'Stefano_Tedeschi_CV.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // ── Cover "chunky graphics" — a mosaic TV set drawn with coloured blocks ────
  // Each char is one cell: w=white frame, k=black screen, r/g/b/y/m/c = blocks,
  // '.' = transparent. The classic Televideo 2×3 sixel look, in CSS.
  const TV_ART = [
    '.wwwwwwwww.',
    '.wkkkkkkkw.',
    '.wkyybggkw.',
    '.wkyybggkw.',
    '.wkrrmcckw.',
    '.wkkkkkkkw.',
    '.wwwwwwwww.',
    '...w...w...'
  ];
  const CELL: Record<string, string> = {
    w: '#ffffff', k: '#000000', r: '#ff0000', g: '#00ff00',
    b: '#0000ff', y: '#ffff00', m: '#ff00ff', c: '#00ffff', '.': 'transparent'
  };
</script>

<div class="tv-room" bind:this={wrapperEl}>
  <div class="screen" class:acquiring>
    <div class="scanlines" aria-hidden="true"></div>

    <!-- Header bar: page number · service · live broadcast clock -->
    <header class="ttx-header">
      <span class="hdr-page">P{headerNum}</span>
      <span class="hdr-name">STEFANO TEDESCHI</span>
      <span class="hdr-svc">TELEVIDEO</span>
      <span class="hdr-clock">{clock}</span>
    </header>

    <div class="page-body">
      {#if !found}
        <!-- Decoder still hunting for a page that isn't in the carousel -->
        <h1 class="dh c-red">P{currentPage}</h1>
        <p class="c-wht">PAGINA NON DISPONIBILE</p>
        <p class="c-cyn">Il decoder non trova questa pagina nel ciclo.</p>
        <p class="c-yel">Digita <b>100</b> per l'indice, oppure scegli una voce qui sotto.</p>
        <ul class="index-list">
          {#each INDEX as it}
            <li>
              <button class="idx-row" onclick={() => goto(it.n)}>
                <span class="c-{it.color} idx-n">{it.n}</span>
                <span class="c-wht idx-label">{it.label}</span>
              </button>
            </li>
          {/each}
        </ul>

      {:else if currentPage === PAGE.COVER}
        <div class="cover">
          <div class="tv-art" aria-hidden="true">
            {#each TV_ART as row}
              <div class="tv-row">
                {#each row.split('') as ch}
                  <span class="tv-cell" style="background:{CELL[ch]}"></span>
                {/each}
              </div>
            {/each}
          </div>
          <div class="cover-title">
            <h1 class="dh c-yel">CURRICULUM</h1>
            <h1 class="dh c-cyn">VITAE</h1>
            <p class="c-wht cover-sub">{cvData.name} · {cvData.role}</p>
          </div>
        </div>

        <div class="rainbow-bar" aria-hidden="true"></div>

        <p class="c-grn idx-head">INDICE DELLE PAGINE</p>
        <ul class="index-list">
          {#each INDEX as it}
            <li>
              <button class="idx-row" onclick={() => goto(it.n)}>
                <span class="c-{it.color} idx-n">{it.n}</span>
                <span class="c-wht idx-label">{it.label}</span>
                <span class="c-blu idx-dots">{'.'.repeat(28)}</span>
              </button>
            </li>
          {/each}
        </ul>

        <p class="c-cyn hint">
          Digita un numero di pagina (es. <b>101</b>) o usa i tasti colorati in basso.
          <span class="conceal" class:revealed>★ Curiosità: prova la pagina segreta <b>777</b> →</span>
        </p>

      {:else if currentPage === PAGE.PROFILE}
        <h1 class="dh c-grn">101 PROFILO</h1>
        <p class="c-yel role">{cvData.role}</p>
        <p class="c-cyn tagline">{cvData.tagline}</p>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        <p class="c-wht body">{cvData.summary}</p>
        <p class="c-mag where">📍 {cvData.contact.location}</p>

      {:else if currentPage === PAGE.EXP}
        <h1 class="dh c-cyn">102 ESPERIENZA</h1>
        <p class="c-yel">Seleziona un ruolo (pagine {EXP_BASE}–{EXP_BASE + cvData.experience.length - 1}):</p>
        <ul class="index-list">
          {#each cvData.experience as exp, i}
            <li>
              <button class="idx-row" onclick={() => goto(EXP_BASE + i)}>
                <span class="c-grn idx-n">{EXP_BASE + i}</span>
                <span class="idx-job">
                  <span class="c-wht">{exp.company}</span>
                  <span class="c-blu">{exp.period}</span>
                </span>
              </button>
            </li>
          {/each}
        </ul>
        <p class="c-cyn hint">Le origini (2011–2015): pagina <b>103</b>.</p>

      {:else if expPages.includes(currentPage)}
        {@const exp = cvData.experience[currentPage - EXP_BASE]}
        <h1 class="dh c-cyn">{currentPage} {exp.company}</h1>
        <p class="c-yel role">{exp.title}</p>
        <p class="c-grn meta">{exp.period} · {exp.location}{exp.sector ? ` · ${exp.sector}` : ''}</p>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        <p class="c-wht body">{exp.description}</p>
        <ul class="bullets">
          {#each exp.highlights as hl}
            <li><span class="c-yel">▪</span> <span class="c-wht">{hl}</span></li>
          {/each}
        </ul>
        <p class="tech">
          {#each exp.technologies as tech, i}
            <span class="chip c-{['grn', 'cyn', 'yel', 'mag'][i % 4]}">{tech}</span>
          {/each}
        </p>
        <p class="c-cyn hint">◄ / ► per scorrere · <b>102</b> per l'elenco</p>

      {:else if currentPage === PAGE.ORIGINS}
        {@const ec = cvData.earlyCareer}
        <h1 class="dh c-cyn">103 LE ORIGINI</h1>
        <p class="c-yel role">{ec.title}</p>
        <p class="c-grn meta">{ec.period}</p>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        <p class="c-wht body">{ec.description}</p>
        <ul class="bullets">
          {#each ec.highlights as hl}
            <li><span class="c-yel">▪</span> <span class="c-wht">{hl}</span></li>
          {/each}
        </ul>
        <p class="tech">
          {#each ec.technologies as tech, i}
            <span class="chip c-{['grn', 'cyn', 'yel', 'mag'][i % 4]}">{tech}</span>
          {/each}
        </p>

      {:else if currentPage === PAGE.SKILLS}
        <h1 class="dh c-yel">104 COMPETENZE</h1>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        {#each cvData.skillGroups as group}
          <p class="skill-line">
            <span class="c-cyn skill-label">{group.label}</span><br />
            <span class="c-wht skill-items">{group.items.join('  ·  ')}</span>
          </p>
        {/each}

      {:else if currentPage === PAGE.LANGS}
        <h1 class="dh c-yel">105 LINGUE</h1>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        {#each cvData.languages as lang}
          <p class="lang-line">
            <span class="c-cyn">{lang.name}</span>
            <span class="c-wht">— {lang.level}</span>
            {#if lang.note}<br /><span class="c-blu note">{lang.note}</span>{/if}
          </p>
        {/each}

      {:else if currentPage === PAGE.EDU}
        <h1 class="dh c-mag">106 FORMAZIONE</h1>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        {#each cvData.education as edu}
          <p class="edu-line">
            <span class="c-cyn">{edu.title}</span><br />
            <span class="c-wht">{edu.institute} · {edu.location}</span>
            <span class="c-yel"> ({edu.period})</span>
          </p>
        {/each}

      {:else if currentPage === PAGE.TALKS}
        <h1 class="dh c-mag">107 CONFERENZE</h1>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        <ul class="index-list">
          {#each cvData.conferences as conf}
            <li class="talk-row">
              <span class="c-yel idx-n">{conf.year}</span>
              <span class="c-wht idx-label">{conf.name}</span>
              <span class="c-cyn">{conf.location}</span>
            </li>
          {/each}
        </ul>

      {:else if currentPage === PAGE.CONTACT}
        <h1 class="dh c-red">108 CONTATTI</h1>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        <p class="contact-line"><span class="c-cyn">EMAIL</span> <a class="c-yel" href="mailto:{cvData.contact.email}">{cvData.contact.email}</a></p>
        <p class="contact-line"><span class="c-cyn">TEL</span>   <a class="c-yel" href="tel:{cvData.contact.phone.replace(/\s/g, '')}">{cvData.contact.phone}</a></p>
        <p class="contact-line"><span class="c-cyn">WEB</span>   <a class="c-yel" href={cvData.contact.website} target="_blank" rel="noopener">{cvData.contact.website}</a></p>
        <p class="contact-line"><span class="c-cyn">LINK</span>  <a class="c-yel" href={cvData.contact.linkedin} target="_blank" rel="noopener">LinkedIn</a></p>
        <p class="contact-line"><span class="c-cyn">LUOGO</span> <span class="c-wht">{cvData.contact.location}</span></p>
        <div class="rainbow-bar thin" aria-hidden="true"></div>
        <button class="dl-btn" onclick={downloadCV}>▼ SCARICA CV (PDF)</button>

      {:else if currentPage === PAGE.SECRET}
        <h1 class="dh c-mag">777 PAGINA SEGRETA</h1>
        <div class="rainbow-bar" aria-hidden="true"></div>
        <p class="c-yel role">OROSCOPO DEL FRONTEND ★</p>
        <p class="c-wht body">
          Le stelle indicano refactoring in arrivo. Un design system condiviso porterà
          fortuna. Diffida dei <span class="c-red">!important</span>. La tua giornata
          fortunata è il <span class="c-cyn">deploy del venerdì</span> (coraggioso).
        </p>
        <p class="c-grn">
          <span class="conceal" class:revealed>Premi <b>R</b> e hai trovato la battuta nascosta: «funziona sul mio computer». 😎</span>
        </p>
        <p class="c-cyn hint">Premi <b>R</b> per svelare/nascondere · <b>100</b> per tornare all'indice</p>
      {/if}
    </div>

    <!-- FASTEXT colour bar -->
    <div class="fastext" role="group" aria-label="Tasti rapidi colorati">
      {#each FASTEXT as f}
        <button class="fx-key fx-{f.color}" onclick={() => goto(f.n)}>{f.label}</button>
      {/each}
    </div>

    <!-- Status row -->
    <div class="status-row">
      <span class="c-cyn">100 INDICE</span>
      <span class="c-wht">◄ ► PAGINE</span>
      <span class="c-yel">R = SVELA</span>
      <span class="c-grn">P{headerNum}</span>
    </div>
  </div>

  <!-- Dual-track controls below the screen: keypad + nav (touch-friendly) -->
  <div class="deck">
    <div class="keypad" role="group" aria-label="Tastierino numerico pagine">
      {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as d}
        <button class="key" onclick={() => pushDigit(d)} aria-label="Cifra {d}">{d}</button>
      {/each}
      <button class="key key-fn" onclick={() => (buffer = buffer.slice(0, -1))} aria-label="Cancella cifra">←</button>
      <button class="key" onclick={() => pushDigit('0')} aria-label="Cifra 0">0</button>
      <button class="key key-fn" onclick={() => goto(PAGE.COVER)} aria-label="Indice 100">100</button>
    </div>
    <div class="nav-keys">
      <button class="navk" onclick={() => step(-1)} aria-label="Pagina precedente">◄</button>
      <button class="navk" onclick={() => step(1)} aria-label="Pagina successiva">►</button>
      <button class="navk reveal" class:on={revealed} onclick={() => (revealed = !revealed)} aria-pressed={revealed}>SVELA</button>
    </div>
  </div>
</div>

<style>
  /* The dark room around the broadcast screen */
  .tv-room {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    box-sizing: border-box;
    background:
      radial-gradient(circle at 50% 38%, #0a0a14 0%, #000 70%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 18px 18px 96px; /* room for the timeline */
    overflow: hidden;
    font-family: 'Bedstead', 'JetBrains Mono', 'Courier New', Courier, monospace;
  }

  /* ── The teletext page: 40-column black screen ───────────────────────────── */
  .screen {
    position: relative;
    width: min(640px, 96vw);
    height: min(70vh, 720px);
    background: #000;
    border: 3px solid #1b1b2a;
    border-radius: 4px;
    box-shadow: 0 0 0 6px #060608, 0 22px 60px rgba(0, 0, 0, 0.8), inset 0 0 60px rgba(0, 40, 80, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: clamp(11px, 2.4vw, 16px);
    line-height: 1.45;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 2px, rgba(0, 0, 0, 0.28) 3px);
    pointer-events: none;
    z-index: 5;
    mix-blend-mode: multiply;
  }

  /* Page-change "rolling in" flicker */
  .screen.acquiring .page-body { animation: rollIn 0.13s steps(2, end); }
  @keyframes rollIn {
    0% { opacity: 0.2; transform: translateY(-6px); filter: contrast(2); }
    100% { opacity: 1; transform: translateY(0); filter: none; }
  }

  /* ── Header ───────────────────────────────────────────────────────────────── */
  .ttx-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    background: #0000ff;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    flex: 0 0 auto;
    z-index: 6;
  }
  .hdr-page { color: #ffff00; }
  .hdr-name { color: #00ffff; flex: 1 1 auto; overflow: hidden; text-overflow: ellipsis; }
  .hdr-svc { color: #fff; letter-spacing: 0.12em; }
  .hdr-clock { color: #00ff00; font-variant-numeric: tabular-nums; }

  /* ── Page body ──────────────────────────────────────────────────────────────── */
  .page-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 12px 14px;
    position: relative;
    z-index: 4;
    scrollbar-width: thin;
    scrollbar-color: #0000ff #000;
  }
  .page-body::-webkit-scrollbar { width: 8px; }
  .page-body::-webkit-scrollbar-thumb { background: #0000ff; }
  .page-body::-webkit-scrollbar-track { background: #000; }

  /* Pure 8-colour palette on black */
  .c-red { color: #ff0000; }
  .c-grn { color: #00ff00; }
  .c-yel { color: #ffff00; }
  .c-blu { color: #5a6bff; } /* lifted from pure #00f for legibility on black */
  .c-mag { color: #ff00ff; }
  .c-cyn { color: #00ffff; }
  .c-wht { color: #ffffff; }

  /* Double-height headings, the signature teletext title style */
  .dh {
    font-size: 2em;
    line-height: 1.05;
    margin: 0 0 0.35em;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  p { margin: 0 0 0.7em; }
  .role { font-size: 1.05em; margin-bottom: 0.2em; }
  .tagline { margin-bottom: 0.7em; }
  .meta { margin-bottom: 0.5em; }
  .body { line-height: 1.55; }
  .where { margin-top: 0.4em; }

  /* Rainbow mosaic separator bar (chunky teletext graphics) */
  .rainbow-bar {
    height: 12px;
    margin: 6px 0 12px;
    background: linear-gradient(90deg,
      #ff0000 0 14.28%, #ffff00 14.28% 28.57%, #00ff00 28.57% 42.85%,
      #00ffff 42.85% 57.14%, #0000ff 57.14% 71.42%, #ff00ff 71.42% 85.71%, #ffffff 85.71% 100%);
  }
  .rainbow-bar.thin { height: 6px; margin: 4px 0 10px; }

  /* Index / list rows */
  .idx-head { margin: 10px 0 6px; letter-spacing: 0.08em; }
  .index-list { list-style: none; margin: 0 0 0.7em; padding: 0; }
  .index-list li { margin: 0; }

  .idx-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    width: 100%;
    background: none;
    border: none;
    padding: 3px 4px;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }
  .idx-row:hover, .idx-row:focus-visible { background: #0000ff; outline: none; }
  .idx-row:hover .idx-label, .idx-row:focus-visible .idx-label { color: #fff; }
  .idx-n { font-weight: 700; }
  .idx-label { letter-spacing: 0.06em; }
  .idx-dots { flex: 1 1 auto; overflow: hidden; white-space: nowrap; opacity: 0.6; }
  .idx-job { display: flex; flex-direction: column; }

  .talk-row { display: flex; gap: 10px; padding: 3px 4px; align-items: baseline; }

  .bullets { list-style: none; margin: 0 0 0.7em; padding: 0; }
  .bullets li { margin: 0 0 0.45em; line-height: 1.5; }

  .tech { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 0.4em; }
  .chip { white-space: nowrap; }
  .chip::before { content: '['; opacity: 0.5; }
  .chip::after { content: ']'; opacity: 0.5; }

  .skill-line { margin-bottom: 0.7em; line-height: 1.5; }
  .skill-label { letter-spacing: 0.06em; }
  .lang-line { line-height: 1.5; }
  .note { font-size: 0.9em; }
  .edu-line { line-height: 1.5; margin-bottom: 0.8em; }
  .contact-line { line-height: 1.7; }
  .contact-line a { text-decoration: none; }
  .contact-line a:hover { text-decoration: underline; }

  .hint { font-size: 0.92em; margin-top: 0.8em; }

  /* CONCEAL/REVEAL — hidden text matches the background until revealed */
  .conceal { color: #000 !important; background: #000; transition: none; }
  .conceal.revealed { color: inherit !important; background: transparent; }

  /* ── Cover ──────────────────────────────────────────────────────────────────── */
  .cover { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
  .tv-art { display: flex; flex-direction: column; flex: 0 0 auto; }
  .tv-row { display: flex; }
  .tv-cell { width: clamp(7px, 1.6vw, 11px); height: clamp(7px, 1.6vw, 11px); }
  .cover-title { flex: 1 1 180px; }
  .cover-title .dh { margin-bottom: 0; }
  .cover-sub { margin-top: 0.5em; }

  /* ── Download button (contact page) ───────────────────────────────────────── */
  .dl-btn {
    font: inherit;
    font-weight: 700;
    background: #ffff00;
    color: #000;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    letter-spacing: 0.05em;
  }
  .dl-btn:hover { background: #00ffff; }

  /* ── FASTEXT colour bar ───────────────────────────────────────────────────── */
  .fastext {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2px;
    padding: 4px;
    background: #000;
    flex: 0 0 auto;
    z-index: 6;
  }
  .fx-key {
    font: inherit;
    font-size: 0.78em;
    font-weight: 700;
    color: #000;
    border: none;
    padding: 6px 4px;
    cursor: pointer;
    letter-spacing: 0.04em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .fx-red { background: #ff0000; color: #fff; }
  .fx-grn { background: #00ff00; }
  .fx-yel { background: #ffff00; }
  .fx-cyn { background: #00ffff; }
  .fx-key:hover { filter: brightness(1.2); }

  /* ── Status row ───────────────────────────────────────────────────────────── */
  .status-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 5px 10px;
    background: #000;
    border-top: 1px solid #1b1b2a;
    font-size: 0.74em;
    flex: 0 0 auto;
    z-index: 6;
    white-space: nowrap;
    overflow: hidden;
  }

  /* ── Control deck below the screen ────────────────────────────────────────── */
  .deck { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; justify-content: center; }
  .keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
  .key {
    font: inherit;
    font-weight: 700;
    width: 42px;
    height: 32px;
    background: #11111a;
    color: #00ffff;
    border: 1px solid #2a2a44;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .key:hover { background: #0000ff; color: #fff; }
  .key:active { transform: translateY(1px); }
  .key-fn { color: #ffff00; font-size: 0.72rem; }

  .nav-keys { display: flex; flex-direction: column; gap: 5px; }
  .navk {
    font: inherit;
    font-weight: 700;
    background: #11111a;
    color: #00ff00;
    border: 1px solid #2a2a44;
    padding: 7px 14px;
    cursor: pointer;
    font-size: 0.85rem;
    letter-spacing: 0.05em;
  }
  .navk:hover { background: #00ff00; color: #000; }
  .navk.reveal { color: #ffff00; }
  .navk.reveal.on { background: #ffff00; color: #000; }

  /* ── Reduced-motion: no flicker, no scanline shimmer ──────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .screen.acquiring .page-body { animation: none; }
  }

  /* On mobile the global volume toggle floats top-right over the blue header
     band: anchor the broadcast to the top and clear a strip for the button. */
  @media (max-width: 720px) {
    .tv-room { justify-content: flex-start; padding-top: 60px; }
    .screen { height: 56vh; }
  }
  @media (max-width: 520px) {
    .screen { height: 54vh; }
    .status-row { font-size: 0.66em; gap: 4px; }
    .key { width: 38px; }
  }
</style>
