<script lang="ts">
  import { cvData } from '$lib/cv-data';
  import { tilt, reveal } from '$lib/actions/interactive';

  let avatarFailed = $state(false);

  // Era ~2010: skeuomorphism / Web 2.0. Real-world materials (brushed metal,
  // stitched leather, paper, felt) and glossy "gel" buttons. No new webfonts —
  // uses the OS serif (Georgia/Palatino, for embossed headings) and the classic
  // Helvetica/Lucida Grande sans of the era, exactly as the WinXP theme leans on
  // system fonts for authenticity.

  // Skills are grouped (source of truth = skillGroups); each item becomes a gel chip.
  const groups = cvData.skillGroups;

  // Map the language proficiency string to a gel-gauge fill (UI-only, not in the data).
  const langPct = (level: string): number => {
    const l = level.toLowerCase();
    if (l.includes('madre')) return 100;
    if (l.includes('c2')) return 95;
    if (l.includes('c1')) return 85;
    if (l.includes('b2')) return 70;
    if (l.includes('b1')) return 55;
    return 50;
  };

  const initials = cvData.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
</script>

<div class="skeuo-wrapper">
  <div class="desk">
    <!-- Brushed-metal title plate -->
    <header class="plate" use:reveal={{ delay: 0 }}>
      <div class="avatar-frame">
        {#if avatarFailed}
          <div class="avatar-fallback">{initials}</div>
        {:else}
          <img class="avatar-img" src="/avatar.svg" alt={cvData.name} onerror={() => (avatarFailed = true)} />
        {/if}
      </div>
      <div class="plate-text">
        <h1>{cvData.name}</h1>
        <span class="role-plaque">{cvData.role}</span>
        <p class="tagline">{cvData.tagline}</p>
        <p class="location"><span class="screw-dot"></span>{cvData.contact.location}</p>
      </div>
      <span class="screw tl"></span><span class="screw tr"></span>
      <span class="screw bl"></span><span class="screw br"></span>
    </header>

    <!-- About — yellow legal pad with tape -->
    <section class="notepad" use:reveal={{ delay: 80 }} use:tilt={{ max: 1.5 }}>
      <span class="tape"></span>
      <h2 class="pad-head">About</h2>
      <p class="pad-body">{cvData.summary}</p>
    </section>

    <!-- Skills — gel chips on a felt panel, grouped -->
    <section class="felt-panel" use:reveal={{ delay: 140 }}>
      <h2 class="emboss-head">Competenze</h2>
      <div class="skill-groups">
        {#each groups as group}
          <div class="skill-group">
            <span class="group-label">{group.label}</span>
            <div class="chips">
              {#each group.items as item}
                <span class="gel-chip">{item}</span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Experience — leather-bound address book -->
    <section class="leather-book" use:reveal={{ delay: 200 }}>
      <h2 class="leather-head">Esperienza</h2>
      <div class="entries">
        {#each cvData.experience as exp}
          <article class="entry">
            <div class="entry-top">
              <span class="company">{exp.company}</span>
              <span class="period-tag">{exp.period}</span>
            </div>
            <div class="job-title">{exp.title}{#if exp.sector}<span class="sector"> · {exp.sector}</span>{/if}</div>
            <p class="job-desc">{exp.description}</p>
            <div class="tech-row">
              {#each exp.technologies as tech}<span class="tech-chip">{tech}</span>{/each}
            </div>
          </article>
        {/each}
        <article class="entry early">
          <div class="entry-top">
            <span class="company">{cvData.earlyCareer.title}</span>
            <span class="period-tag">{cvData.earlyCareer.period}</span>
          </div>
          <p class="job-desc">{cvData.earlyCareer.description}</p>
          <div class="tech-row">
            {#each cvData.earlyCareer.technologies as tech}<span class="tech-chip">{tech}</span>{/each}
          </div>
        </article>
      </div>
    </section>

    <div class="two-col">
      <!-- Education + Certifications — framed diplomas -->
      <section class="frame" use:reveal={{ delay: 240 }} use:tilt={{ max: 2 }}>
        <div class="frame-inner">
          <h2 class="diploma-head">Istruzione</h2>
          {#each cvData.education as edu}
            <div class="diploma-item">
              <strong>{edu.title}</strong>
              <span class="inst">{edu.institute}</span>
              <span class="when">{edu.location} · {edu.period}</span>
            </div>
          {/each}
        </div>
      </section>

      <!-- Languages — glossy gel gauges -->
      <section class="frame languages" use:reveal={{ delay: 300 }} use:tilt={{ max: 2 }}>
        <div class="frame-inner">
          <h2 class="diploma-head">Lingue</h2>
          {#each cvData.languages as lang}
            <div class="gauge-row">
              <div class="gauge-top">
                <span class="lang-name">{lang.name}</span>
                <span class="lang-level">{lang.level}</span>
              </div>
              <div class="gauge-track">
                <div class="gauge-fill" style="width: {langPct(lang.level)}%"></div>
              </div>
            </div>
          {/each}
          <h2 class="diploma-head talks-head">Conferenze</h2>
          <ul class="talks">
            {#each cvData.conferences as conf}
              <li>{conf.name} <span class="when">· {conf.location} ’{conf.year.slice(-2)}</span></li>
            {/each}
          </ul>
        </div>
      </section>
    </div>

    <!-- Contacts — App Store style gel buttons -->
    <section class="contact-bar" use:reveal={{ delay: 360 }}>
      <a class="gel-btn linkedin" href={cvData.contact.linkedin} target="_blank" rel="noopener">
        <span class="gel-ico">in</span><span class="gel-label">LinkedIn</span>
      </a>
      <a class="gel-btn email" href="mailto:{cvData.contact.email}">
        <span class="gel-ico">@</span><span class="gel-label">Email</span>
      </a>
      <a class="gel-btn website" href={cvData.contact.website} target="_blank" rel="noopener">
        <span class="gel-ico">🌐</span><span class="gel-label">Sito web</span>
      </a>
    </section>
  </div>
</div>

<style>
  /* ── Desk surface: dark stitched leather (iOS 6 era) ─────────────────────── */
  .skeuo-wrapper {
    --leather-1: #4a3322;
    --leather-2: #35241704;
    --stitch: rgba(226, 205, 173, 0.55);
    --paper: #f6f1e4;
    --ink: #2b2118;
    --ink-soft: #6c5c47;
    --metal-hi: #fafafa;
    --metal-lo: #c2c2c6;
    --gel-blue: #2f6fd0;
    --gel-green: #4e9a2f;
    --gel-purple: #7b4fc4;
    --felt: #2f6b4a;

    width: 100vw;
    height: 100vh;
    height: 100dvh;
    box-sizing: border-box;
    overflow-y: auto;
    padding: 2.4rem 2rem 96px;
    color: var(--ink);
    font-family: 'Lucida Grande', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    background-color: #4a3322;
    background-image:
      radial-gradient(circle at 18% 12%, rgba(255, 224, 178, 0.16), transparent 42%),
      radial-gradient(circle at 84% 88%, rgba(0, 0, 0, 0.32), transparent 55%),
      repeating-radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.018) 0 2px, transparent 2px 4px),
      linear-gradient(135deg, #543a26, #3a2616);
  }

  .desk {
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  /* Stitched-leather border helper (a dashed inset line) */
  .notepad,
  .felt-panel,
  .leather-book,
  .frame,
  .plate {
    position: relative;
  }

  /* ── Brushed-metal title plate ───────────────────────────────────────────── */
  .plate {
    display: flex;
    align-items: center;
    gap: 26px;
    padding: 24px 30px;
    border-radius: 14px;
    background:
      linear-gradient(180deg, #fcfcfd 0%, #e6e6ea 18%, #d3d3d8 50%, #bcbcc2 82%, #d0d0d5 100%);
    background-size: 100% 100%, 3px 100%;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -2px 4px rgba(0, 0, 0, 0.2),
      0 2px 0 #8d8d92,
      0 12px 26px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }
  /* Brushed texture */
  .plate::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.35) 0 1px, transparent 1px 3px);
    opacity: 0.4;
    pointer-events: none;
  }

  .avatar-frame {
    flex: 0 0 auto;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    padding: 5px;
    background: linear-gradient(180deg, #fff, #b9b9be 60%, #8f8f95);
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.9),
      0 3px 6px rgba(0, 0, 0, 0.45);
  }
  .avatar-img,
  .avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: block;
    object-fit: cover;
    background: #ece9e1;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.45);
  }
  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 2.1rem;
    font-weight: 700;
    color: #6c5c47;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  .plate-text { position: relative; z-index: 1; }
  .plate-text h1 {
    margin: 0;
    font-family: Georgia, 'Palatino Linotype', 'Times New Roman', serif;
    font-size: 2.3rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #43403c;
    /* Letterpress emboss */
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.85), 0 -1px 1px rgba(0, 0, 0, 0.25);
  }
  .role-plaque {
    display: inline-block;
    margin-top: 8px;
    padding: 4px 14px;
    border-radius: 5px;
    font-size: 0.82rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(180deg, #5a616d 0%, #3c424d 100%);
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.4);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  .tagline {
    margin: 12px 0 0;
    font-style: italic;
    font-size: 0.92rem;
    color: #5d564c;
    max-width: 540px;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .location {
    margin: 8px 0 0;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6c645a;
    display: flex;
    align-items: center;
    gap: 7px;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  }
  .screw-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #c0392b, #7c1d12);
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
  }

  /* Corner screws on the plate */
  .screw {
    position: absolute;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #f2f2f4, #8a8a90 70%, #6a6a70);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 1px 1px rgba(0, 0, 0, 0.4);
  }
  .screw::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-top: 1px solid rgba(0, 0, 0, 0.4);
    transform: rotate(40deg);
  }
  .screw.tl { top: 9px; left: 9px; }
  .screw.tr { top: 9px; right: 9px; }
  .screw.bl { bottom: 9px; left: 9px; }
  .screw.br { bottom: 9px; right: 9px; }

  /* ── Section headings ────────────────────────────────────────────────────── */
  .emboss-head,
  .leather-head,
  .diploma-head {
    font-family: Georgia, 'Palatino Linotype', serif;
    margin: 0 0 16px;
  }

  /* ── About — legal pad ───────────────────────────────────────────────────── */
  .notepad {
    align-self: flex-start;
    width: 100%;
    max-width: 560px;
    box-sizing: border-box; /* keep the 30px padding inside the width so the pad never sticks past the desk margin on mobile */
    padding: 26px 30px 30px;
    border-radius: 3px;
    color: #2f2a22;
    background-color: #fdf8df;
    background-image:
      linear-gradient(90deg, transparent 38px, rgba(220, 90, 80, 0.45) 38px, rgba(220, 90, 80, 0.45) 40px, transparent 40px),
      repeating-linear-gradient(180deg, transparent 0 27px, rgba(80, 130, 190, 0.32) 27px 28px);
    background-position: 0 0, 0 16px;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 14px 28px rgba(0, 0, 0, 0.45),
      0 2px 4px rgba(0, 0, 0, 0.3);
    transform: rotate(-0.7deg);
    transform-style: preserve-3d;
  }
  .tape {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%) rotate(-3deg);
    width: 120px;
    height: 28px;
    background: rgba(225, 220, 180, 0.55);
    border-left: 1px dashed rgba(255, 255, 255, 0.5);
    border-right: 1px dashed rgba(255, 255, 255, 0.5);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  }
  .pad-head {
    font-size: 1.5rem;
    color: #3b6ea5;
    margin: 0 0 10px 14px;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
  }
  .pad-body {
    margin: 0 0 0 14px;
    font-size: 0.98rem;
    line-height: 28px; /* lock to the ruled lines */
    color: #3a342a;
  }

  /* ── Skills — felt panel + gel chips ─────────────────────────────────────── */
  .felt-panel {
    padding: 26px 30px 30px;
    border-radius: 12px;
    background:
      radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.06), transparent 60%),
      linear-gradient(180deg, #357a54, #245138);
    box-shadow:
      inset 0 0 0 2px rgba(0, 0, 0, 0.25),
      inset 0 2px 6px rgba(0, 0, 0, 0.4),
      0 10px 24px rgba(0, 0, 0, 0.45);
    /* Felt fuzz */
    position: relative;
  }
  .felt-panel::before {
    content: '';
    position: absolute;
    inset: 8px;
    border: 1px dashed rgba(255, 255, 255, 0.18);
    border-radius: 8px;
    pointer-events: none;
  }
  .emboss-head {
    color: #d7ecdc;
    font-size: 1.45rem;
    text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.5);
    position: relative;
  }
  .skill-groups { display: flex; flex-direction: column; gap: 16px; position: relative; }
  .group-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(215, 236, 220, 0.7);
    margin-bottom: 8px;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.4);
  }
  .chips { display: flex; flex-wrap: wrap; gap: 9px; }
  .gel-chip {
    padding: 7px 15px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    color: #20351f;
    background: linear-gradient(180deg, #fbfff4 0%, #d6f0b8 48%, #bce389 52%, #cfeaa0 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -2px 3px rgba(0, 0, 0, 0.12),
      0 2px 3px rgba(0, 0, 0, 0.35);
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  /* ── Experience — leather-bound book ─────────────────────────────────────── */
  .leather-book {
    padding: 26px 30px 30px;
    border-radius: 12px;
    background:
      radial-gradient(circle at 20% 0%, rgba(255, 220, 170, 0.12), transparent 45%),
      linear-gradient(180deg, #6e4a2e, #4a2f1a);
    box-shadow:
      inset 0 1px 0 rgba(255, 220, 170, 0.2),
      inset 0 0 0 2px rgba(0, 0, 0, 0.25),
      0 12px 26px rgba(0, 0, 0, 0.5);
  }
  .leather-head {
    color: #f4e3cb;
    font-size: 1.45rem;
    text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.6);
  }
  .entries { display: flex; flex-direction: column; }
  .entry {
    padding: 16px 4px;
    border-bottom: 1px dashed rgba(226, 205, 173, 0.4);
    border-top: 1px solid rgba(0, 0, 0, 0.18);
  }
  .entry:first-of-type { border-top: none; }
  .entry:last-child { border-bottom: none; padding-bottom: 0; }
  .entry-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .company {
    font-family: Georgia, serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fbeed8;
    text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.5);
  }
  .period-tag {
    flex: 0 0 auto;
    font-size: 0.72rem;
    font-weight: 700;
    color: #4a2f1a;
    padding: 3px 10px;
    border-radius: 4px;
    background: linear-gradient(180deg, #f6d999, #d8ad5e);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  .job-title {
    color: #e9b97a;
    font-size: 0.9rem;
    font-weight: 600;
    margin-top: 4px;
  }
  .sector { color: rgba(233, 185, 122, 0.7); font-weight: 500; }
  .job-desc {
    margin: 6px 0 10px;
    font-size: 0.86rem;
    line-height: 1.5;
    color: #e4d3bd;
  }
  .tech-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .tech-chip {
    font-size: 0.7rem;
    font-weight: 600;
    color: #f0e2cc;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.28);
    border: 1px solid rgba(226, 205, 173, 0.25);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
  .entry.early .company { font-size: 1rem; }
  .entry.early { opacity: 0.9; }

  /* ── Education / Languages — framed paper ────────────────────────────────── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 26px;
  }
  .frame {
    padding: 12px;
    border-radius: 8px;
    background: linear-gradient(135deg, #c9a24a 0%, #8a6a2a 50%, #b8923f 100%);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 0 0 1px rgba(0, 0, 0, 0.3),
      0 12px 26px rgba(0, 0, 0, 0.5);
    transform-style: preserve-3d;
  }
  .frame-inner {
    height: 100%;
    box-sizing: border-box;
    padding: 24px 26px;
    border-radius: 3px;
    background:
      repeating-linear-gradient(180deg, rgba(0, 0, 0, 0.012) 0 24px, transparent 24px 25px),
      #faf6ec;
    box-shadow: inset 0 0 24px rgba(120, 90, 40, 0.18), inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }
  .diploma-head {
    font-size: 1.3rem;
    color: #5a4626;
    text-align: center;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
    margin-bottom: 16px;
  }
  .diploma-item {
    text-align: center;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .diploma-item strong {
    font-family: Georgia, serif;
    font-size: 0.98rem;
    color: #3a2f1c;
  }
  .diploma-item .inst { font-size: 0.86rem; color: #6c5c41; }
  .diploma-item .when { font-size: 0.78rem; color: #8a7a5c; font-style: italic; }

  /* Languages gel gauges */
  .gauge-row { margin-bottom: 16px; }
  .gauge-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }
  .lang-name { font-family: Georgia, serif; font-weight: 700; font-size: 0.95rem; color: #3a2f1c; }
  .lang-level { font-size: 0.76rem; color: #8a7a5c; }
  .gauge-track {
    height: 16px;
    border-radius: 999px;
    background: linear-gradient(180deg, #d9cfb8, #efe7d4);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.6);
    overflow: hidden;
  }
  .gauge-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(180deg, #7fd0ff 0%, #2f8fe0 48%, #1f6fc0 52%, #4fa6e8 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -2px 3px rgba(0, 0, 0, 0.2);
  }
  .talks-head { margin-top: 22px; font-size: 1.1rem; }
  .talks { margin: 0; padding: 0; list-style: none; text-align: center; }
  .talks li { font-size: 0.82rem; color: #4a3c26; line-height: 1.7; }
  .talks .when, .diploma-item .when { color: #8a7a5c; }

  /* ── Contacts — App Store gel buttons ────────────────────────────────────── */
  .contact-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  .gel-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px;
    border-radius: 12px;
    text-decoration: none;
    color: #fff;
    font-weight: 700;
    font-size: 0.95rem;
    text-shadow: 0 -1px 1px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.55),
      inset 0 -3px 6px rgba(0, 0, 0, 0.25),
      0 3px 0 rgba(0, 0, 0, 0.35),
      0 8px 18px rgba(0, 0, 0, 0.4);
    transition: transform 0.08s ease, box-shadow 0.08s ease;
  }
  /* Top gloss sweep */
  .gel-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 48%;
    border-radius: 12px 12px 50% 50% / 12px 12px 22px 22px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.08));
    pointer-events: none;
  }
  .gel-btn:active {
    transform: translateY(2px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.4),
      inset 0 2px 6px rgba(0, 0, 0, 0.35),
      0 1px 0 rgba(0, 0, 0, 0.35),
      0 3px 8px rgba(0, 0, 0, 0.4);
  }
  .gel-btn.linkedin { background: linear-gradient(180deg, #4f97e6 0%, #2f6fd0 50%, #2560bd 100%); }
  .gel-btn.email { background: linear-gradient(180deg, #7cc24e 0%, #4e9a2f 50%, #418526 100%); }
  .gel-btn.website { background: linear-gradient(180deg, #a878e0 0%, #7b4fc4 50%, #6a40b2 100%); }
  .gel-ico {
    font-family: Georgia, serif;
    font-size: 1.3rem;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }
  .gel-label { position: relative; z-index: 1; }

  /* ── Responsive ──────────────────────────────────────────────────────────── */
  @media (max-width: 760px) {
    .plate { flex-direction: column; text-align: center; }
    .plate-text h1 { font-size: 1.9rem; }
    .location { justify-content: center; }
    .two-col { grid-template-columns: 1fr; }
    .notepad { transform: none; max-width: 100%; }
  }
  @media (max-width: 520px) {
    .skeuo-wrapper { padding: 1.4rem 1rem 96px; }
    .contact-bar { grid-template-columns: 1fr; }
    .entry-top { flex-direction: column; gap: 4px; }
  }

  /* The reveal/tilt actions already respect reduced motion; nothing animates on
     its own here, so there is no additional motion to gate. */
  @media (prefers-reduced-motion: reduce) {
    .notepad { transform: none; }
  }
</style>
