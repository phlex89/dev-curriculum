<script lang="ts">
  import { onMount } from 'svelte';
  import { cvData } from '$lib/cv-data';
  import { tilt, reveal } from '$lib/actions/interactive';

  // The luminous-present glassmorphism era (macOS Big Sur / Windows 11 / iOS).
  // Deliberately the LIGHT, airy opposite of the dark neon WebGL 3D era: pastel
  // aurora blobs drift behind thick frosted-glass panels — no canvas, no WebGL.

  let avatarFailed = $state(false);
  let wrapper: HTMLElement;

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  onMount(() => {
    if (prefersReduced()) return; // no blob parallax when motion is reduced

    // Soft 2D parallax: the aurora layer drifts a few px toward the cursor. This
    // is flat gradient motion (no perspective/camera) — distinct from the 3D era.
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        // Ease toward the target so it glides rather than snaps.
        tx += (nx - tx) * 1;
        ty += (ny - ty) * 1;
        wrapper?.style.setProperty('--px', tx.toFixed(3));
        wrapper?.style.setProperty('--py', ty.toFixed(3));
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
    };
  });
</script>

<div class="glass-wrapper" bind:this={wrapper}>
  <!-- Luminous animated aurora backdrop (pure CSS — the panels' frosted blur
       samples these drifting pastel blobs). -->
  <div class="aurora" aria-hidden="true">
    <span class="blob b1"></span>
    <span class="blob b2"></span>
    <span class="blob b3"></span>
    <span class="blob b4"></span>
    <span class="blob b5"></span>
  </div>

  <div class="glass-grid">
    <!-- Hero -->
    <section class="panel hero" style="grid-area: hero" use:reveal={{ delay: 0 }} use:tilt={{ max: 3, scale: 1.004, perspective: 1400 }}>
      <div class="avatar-ring">
        {#if avatarFailed}
          <div class="avatar-fallback">ST</div>
        {:else}
          <img class="avatar-img" src="/avatar.svg" alt={cvData.name} onerror={() => (avatarFailed = true)} />
        {/if}
      </div>
      <div class="hero-info">
        <h1>{cvData.name}</h1>
        <p class="role">{cvData.role}</p>
        <p class="tagline">{cvData.tagline}</p>
        <p class="location"><span class="dot">◍</span> {cvData.contact.location}</p>
        <div class="contact-pills">
          <a class="pill" href={cvData.contact.linkedin} target="_blank" rel="noopener">
            <span class="pill-icon">in</span> LinkedIn
          </a>
          <a class="pill" href="mailto:{cvData.contact.email}">
            <span class="pill-icon">@</span> Email
          </a>
          <a class="pill" href={cvData.contact.website} target="_blank" rel="noopener">
            <span class="pill-icon">⦿</span> Website
          </a>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="panel about" style="grid-area: about" use:reveal={{ delay: 70 }} use:tilt={{ max: 2.5 }}>
      <span class="label">Profilo</span>
      <p class="summary">{cvData.summary}</p>
    </section>

    <!-- Experience -->
    <section class="panel exp" style="grid-area: exp" use:reveal={{ delay: 120 }} use:tilt={{ max: 1.8 }}>
      <span class="label">Esperienza</span>
      <div class="exp-list">
        {#each cvData.experience as exp}
          <article class="exp-item">
            <div class="exp-head">
              <h3>{exp.company}</h3>
              <span class="period">{exp.period}</span>
            </div>
            <p class="exp-role">{exp.title}</p>
            <p class="exp-desc">{exp.description}</p>
            <div class="chips">
              {#each exp.technologies as tech}<span class="chip soft">{tech}</span>{/each}
            </div>
          </article>
        {/each}
        <article class="exp-item early">
          <div class="exp-head">
            <h3>{cvData.earlyCareer.title}</h3>
            <span class="period">{cvData.earlyCareer.period}</span>
          </div>
          <p class="exp-desc">{cvData.earlyCareer.description}</p>
          <div class="chips">
            {#each cvData.earlyCareer.technologies as tech}<span class="chip soft">{tech}</span>{/each}
          </div>
        </article>
      </div>
    </section>

    <!-- Skills -->
    <section class="panel skills" style="grid-area: skills" use:reveal={{ delay: 170 }} use:tilt={{ max: 2.5 }}>
      <span class="label">Competenze</span>
      <div class="skill-groups">
        {#each cvData.skillGroups as group}
          <div class="skill-group">
            <span class="group-name">{group.label}</span>
            <div class="chips">
              {#each group.items as item}<span class="chip">{item}</span>{/each}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Languages -->
    <section class="panel lang" style="grid-area: lang" use:reveal={{ delay: 210 }} use:tilt={{ max: 2.5 }}>
      <span class="label">Lingue</span>
      <div class="lang-list">
        {#each cvData.languages as lang}
          <div class="lang-item">
            <div class="lang-top">
              <span class="lang-name">{lang.name}</span>
              <span class="lang-level">{lang.level}</span>
            </div>
            {#if lang.note}<span class="lang-note">{lang.note}</span>{/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Education & Certifications -->
    <section class="panel edu" style="grid-area: edu" use:reveal={{ delay: 250 }} use:tilt={{ max: 2.5 }}>
      <span class="label">Formazione</span>
      {#each cvData.education as edu}
        <div class="edu-item">
          <strong>{edu.title}</strong>
          <span class="edu-meta">{edu.institute} · {edu.period}</span>
        </div>
      {/each}
      <span class="label sub">Certificazioni</span>
      <div class="chips">
        {#each cvData.certifications as cert}<span class="chip soft">{cert.name}</span>{/each}
      </div>
    </section>

    <!-- Talks / Conferences -->
    <section class="panel talks" style="grid-area: talks" use:reveal={{ delay: 290 }} use:tilt={{ max: 2.5 }}>
      <span class="label">Conferenze</span>
      <div class="talk-list">
        {#each cvData.conferences as conf}
          <div class="talk-item">
            <span class="talk-name">{conf.name}</span>
            <span class="talk-meta">{conf.location} · {conf.year}</span>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .glass-wrapper {
    --px: 0;
    --py: 0;
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow-y: auto;
    /* Luminous, near-white base — the airy opposite of the 3D deep-space void. */
    background: linear-gradient(135deg, #eef2fb 0%, #f4eefb 50%, #ecf6fb 100%);
    color: #2b2b3a;
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .glass-wrapper::-webkit-scrollbar { width: 0; }
  .glass-wrapper { scrollbar-width: none; }

  /* ── Aurora backdrop ───────────────────────────────────────────────── */
  .aurora {
    position: fixed;
    inset: -10%;
    z-index: 0;
    pointer-events: none;
    /* Drift the whole field a few px toward the cursor (flat 2D parallax). */
    transform: translate3d(calc(var(--px) * 18px), calc(var(--py) * 18px), 0);
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.75;
    will-change: transform;
  }
  /* Pastel Big-Sur palette: aqua, lilac, peach, sky, mint. */
  .b1 { width: 46vw; height: 46vw; left: -8vw; top: -6vw; background: radial-gradient(circle, #7cc5ff, transparent 70%); animation: drift1 26s ease-in-out infinite; }
  .b2 { width: 40vw; height: 40vw; right: -6vw; top: -4vw; background: radial-gradient(circle, #c4a8ff, transparent 70%); animation: drift2 31s ease-in-out infinite; }
  .b3 { width: 44vw; height: 44vw; left: 14vw; bottom: -16vw; background: radial-gradient(circle, #ffb3d1, transparent 70%); animation: drift3 28s ease-in-out infinite; }
  .b4 { width: 34vw; height: 34vw; right: 6vw; bottom: -8vw; background: radial-gradient(circle, #9af2d8, transparent 70%); animation: drift4 34s ease-in-out infinite; }
  .b5 { width: 30vw; height: 30vw; left: 38vw; top: 26vh; background: radial-gradient(circle, #ffe1a8, transparent 70%); opacity: 0.6; animation: drift1 38s ease-in-out infinite reverse; }

  @keyframes drift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(6vw, 5vh) scale(1.12); } }
  @keyframes drift2 { 0%, 100% { transform: translate(0, 0) scale(1.05); } 50% { transform: translate(-5vw, 7vh) scale(0.92); } }
  @keyframes drift3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(4vw, -6vh) scale(1.1); } }
  @keyframes drift4 { 0%, 100% { transform: translate(0, 0) scale(0.95); } 50% { transform: translate(-6vw, -4vh) scale(1.08); } }

  @media (prefers-reduced-motion: reduce) {
    .aurora { transition: none; transform: none; }
    .blob { animation: none; }
  }

  /* ── Layout ────────────────────────────────────────────────────────── */
  .glass-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'hero hero'
      'about about'
      'exp exp'
      'skills lang'
      'edu talks';
    gap: 22px;
    max-width: 1080px;
    margin: 0 auto;
    padding: 48px 32px 110px;
    box-sizing: border-box;
  }

  /* ── Frosted glass panel — the hallmark: present, milky, light-edged ── */
  .panel {
    position: relative;
    background: rgba(255, 255, 255, 0.45);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 26px;
    padding: 28px 30px;
    /* Fine top light-edge highlight + soft diffuse ambient shadow. */
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 0 0 1px rgba(255, 255, 255, 0.15),
      0 10px 40px rgba(31, 38, 135, 0.12);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
    transform-style: preserve-3d;
    overflow: hidden;
  }
  .panel:hover {
    will-change: transform;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      0 18px 50px rgba(31, 38, 135, 0.18);
  }

  /* Specular sheen following the cursor (driven by the tilt action's vars). */
  .panel::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--spot, 0);
    transition: opacity 0.35s ease;
    background: radial-gradient(
      340px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 255, 255, 0.55),
      transparent 60%
    );
    mix-blend-mode: overlay;
  }

  /* ── Section labels ────────────────────────────────────────────────── */
  .label {
    display: block;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #7c74cc;
    margin-bottom: 16px;
  }
  .label.sub { margin-top: 22px; }

  /* ── Hero ──────────────────────────────────────────────────────────── */
  .hero {
    grid-area: hero;
    display: flex;
    align-items: center;
    gap: 32px;
    padding: 36px 40px;
  }
  .avatar-ring {
    flex: 0 0 auto;
    width: 124px;
    height: 124px;
    border-radius: 50%;
    padding: 4px;
    background: linear-gradient(140deg, #7cc5ff, #c4a8ff 45%, #ffb3d1 80%);
    box-shadow: 0 10px 30px rgba(124, 116, 255, 0.3);
  }
  .avatar-img, .avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.7);
    object-fit: cover;
  }
  .avatar-fallback {
    font-size: 2.4rem;
    font-weight: 300;
    color: #5b54b8;
    letter-spacing: 1px;
  }
  .hero-info { min-width: 0; }
  .hero h1 {
    margin: 0;
    font-size: clamp(2rem, 4.4vw, 3rem);
    font-weight: 200; /* Outfit ultralight — the airy, luminous Big Sur / SF voice */
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: #20202e;
  }
  .hero .role {
    margin: 8px 0 0;
    font-size: 1.05rem;
    font-weight: 500;
    color: #5b54b8;
  }
  .hero .tagline {
    margin: 12px 0 0;
    font-size: 0.96rem;
    font-weight: 300;
    line-height: 1.55;
    color: #4a4a5e;
    max-width: 560px;
  }
  .hero .location {
    margin: 12px 0 0;
    font-size: 0.88rem;
    font-weight: 400;
    color: #6b6b80;
  }
  .hero .location .dot { color: #9b8bff; }

  .contact-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.7);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 14px rgba(31, 38, 135, 0.1);
    color: #3b3a52;
    font-size: 0.86rem;
    font-weight: 500;
    text-decoration: none;
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.25s ease;
  }
  .pill:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.72); }
  .pill-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(140deg, #7cc5ff, #a78bfa);
    color: #fff;
    font-size: 0.82rem;
    font-weight: 700;
  }

  /* ── About ─────────────────────────────────────────────────────────── */
  .summary {
    margin: 0;
    font-size: 1.02rem;
    font-weight: 300;
    line-height: 1.7;
    color: #3a3a4c;
  }

  /* ── Experience ────────────────────────────────────────────────────── */
  .exp-list { display: flex; flex-direction: column; gap: 8px; }
  .exp-item {
    padding: 16px 18px;
    margin: 0 -18px;
    border-radius: 16px;
    transition: background 0.25s ease;
  }
  .exp-item:not(:last-child) { border-bottom: 1px solid rgba(124, 116, 204, 0.14); }
  .exp-item:hover { background: rgba(255, 255, 255, 0.4); }
  .exp-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 14px;
  }
  .exp-head h3 {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 600;
    color: #25253a;
  }
  .period {
    flex: 0 0 auto;
    font-size: 0.8rem;
    font-weight: 500;
    color: #8484a0;
    white-space: nowrap;
  }
  .exp-role {
    margin: 3px 0 0;
    font-size: 0.92rem;
    font-weight: 500;
    color: #6a5fd0;
  }
  .exp-desc {
    margin: 8px 0 0;
    font-size: 0.88rem;
    font-weight: 300;
    line-height: 1.55;
    color: #50505f;
  }
  .exp-item.early { opacity: 0.92; }

  /* ── Chips ─────────────────────────────────────────────────────────── */
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .chip {
    padding: 5px 13px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 500;
    background: rgba(124, 116, 255, 0.12);
    border: 1px solid rgba(124, 116, 255, 0.2);
    color: #4f4796;
    white-space: nowrap;
  }
  .chip.soft {
    background: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.7);
    color: #555569;
  }

  /* ── Skills ────────────────────────────────────────────────────────── */
  .skill-groups { display: flex; flex-direction: column; gap: 16px; }
  .group-name {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #3a3a4c;
    margin-bottom: 8px;
  }

  /* ── Languages ─────────────────────────────────────────────────────── */
  .lang-list { display: flex; flex-direction: column; gap: 14px; }
  .lang-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .lang-name { font-size: 1rem; font-weight: 600; color: #25253a; }
  .lang-level { font-size: 0.84rem; font-weight: 500; color: #6a5fd0; }
  .lang-note { display: block; margin-top: 4px; font-size: 0.78rem; font-weight: 300; color: #7a7a90; }

  /* ── Education ─────────────────────────────────────────────────────── */
  .edu-item { display: flex; flex-direction: column; gap: 2px; }
  .edu-item:not(:last-of-type) { margin-bottom: 14px; }
  .edu-item strong { font-size: 0.96rem; font-weight: 600; color: #25253a; }
  .edu-meta { font-size: 0.82rem; font-weight: 300; color: #6b6b80; }

  /* ── Talks ─────────────────────────────────────────────────────────── */
  .talk-list { display: flex; flex-direction: column; gap: 12px; }
  .talk-item { display: flex; flex-direction: column; gap: 2px; }
  .talk-name { font-size: 0.94rem; font-weight: 600; color: #25253a; }
  .talk-meta { font-size: 0.8rem; font-weight: 300; color: #6b6b80; }

  @media (prefers-reduced-motion: reduce) {
    .panel { transition: box-shadow 0.3s ease; }
    .pill { transition: background 0.25s ease; }
  }

  /* ── Responsive ────────────────────────────────────────────────────── */
  @media (max-width: 820px) {
    .glass-grid {
      grid-template-columns: 1fr;
      grid-template-areas:
        'hero'
        'about'
        'exp'
        'skills'
        'lang'
        'edu'
        'talks';
      padding: 32px 18px 110px;
    }
    .hero { flex-direction: column; text-align: center; }
    .contact-pills { justify-content: center; }
    .exp-head { flex-direction: column; gap: 2px; }
  }
</style>
