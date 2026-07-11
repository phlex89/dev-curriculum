<script lang="ts">
  import { onMount } from 'svelte';
  import { getCvData, getUi } from '$lib/i18n';
  import { tilt, reveal } from '$lib/actions/interactive';

  const cvData = getCvData();
  const t = getUi().glass;

  // The luminous-present glassmorphism era (macOS Big Sur / Windows 11 / iOS).
  // Deliberately the LIGHT, airy opposite of the dark neon WebGL 3D era: pastel
  // aurora blobs drift behind thick frosted-glass panels — no canvas, no WebGL.

  let avatarFailed = $state(false);
  let wrapper: HTMLElement;

  // Light/dark mode toggle. Real glassmorphism OSes (macOS Big Sur, Windows 11,
  // iOS) ship BOTH a light and a dark appearance, so a sun/moon switch is
  // period-accurate — not a second era, just the same surface lit differently.
  // The choice persists separately from the era selection.
  const readDark = () => {
    if (typeof localStorage === 'undefined') return false;
    try {
      return localStorage.getItem('cv_glass_mode') === 'dark';
    } catch {
      return false;
    }
  };
  let dark = $state(readDark());
  const toggleDark = () => {
    dark = !dark;
    try {
      localStorage.setItem('cv_glass_mode', dark ? 'dark' : 'light');
    } catch {
      /* storage blocked */
    }
  };

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

<div class="glass-wrapper" class:dark bind:this={wrapper}>
  <!-- Appearance toggle (light ↔ dark), like macOS / Windows 11 ship. -->
  <button
    class="mode-toggle"
    type="button"
    onclick={toggleDark}
    aria-pressed={dark}
    aria-label={dark ? t.switchToLight : t.switchToDark}
    title={dark ? t.lightAppearance : t.darkAppearance}
  >
    <span class="mode-icon" aria-hidden="true">{dark ? '☀' : '☾'}</span>
  </button>

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
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="panel about" style="grid-area: about" use:reveal={{ delay: 70 }} use:tilt={{ max: 2.5 }}>
      <h2 class="label">{t.profile}</h2>
      <p class="summary">{cvData.summary}</p>
    </section>

    <!-- Experience -->
    <section class="panel exp" style="grid-area: exp" use:reveal={{ delay: 120 }} use:tilt={{ max: 1.8 }}>
      <h2 class="label">{t.experience}</h2>
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
      <h2 class="label">{t.skills}</h2>
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
      <h2 class="label">{t.languages}</h2>
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

    <!-- Education -->
    <section class="panel edu" style="grid-area: edu" use:reveal={{ delay: 250 }} use:tilt={{ max: 2.5 }}>
      <h2 class="label">{t.education}</h2>
      {#each cvData.education as edu}
        <div class="edu-item">
          <strong>{edu.title}</strong>
          <span class="edu-meta">{edu.institute} · {edu.period}</span>
        </div>
      {/each}
    </section>

    <!-- Talks / Conferences -->
    <section class="panel talks" style="grid-area: talks" use:reveal={{ delay: 290 }} use:tilt={{ max: 2.5 }}>
      <h2 class="label">{t.conferences}</h2>
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

    /* ── Light appearance tokens (default) ──────────────────────────────
       Every surface/text colour below is a token so the .dark variant can
       flip the whole era by overriding this one block. */
    --g-bg: linear-gradient(135deg, #eef2fb 0%, #f4eefb 50%, #ecf6fb 100%);
    --g-text: #2b2b3a;
    --g-h1: #20202e;
    --g-strong: #25253a;
    --g-accent: #5b54b8;
    --g-accent2: #6a5fd0;
    --g-tagline: #4a4a5e;
    --g-summary: #3a3a4c;
    --g-muted: #6b6b80;
    --g-meta: #5c5c78;
    --g-label: #7c74cc;
    --g-dot: #9b8bff;
    --g-panel-bg: rgba(255, 255, 255, 0.45);
    --g-panel-border: rgba(255, 255, 255, 0.6);
    --g-panel-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.8),
      inset 0 0 0 1px rgba(255, 255, 255, 0.15),
      0 10px 40px rgba(31, 38, 135, 0.12);
    --g-panel-shadow-hover:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 0 0 1px rgba(255, 255, 255, 0.2),
      0 18px 50px rgba(31, 38, 135, 0.18);
    --g-sheen: rgba(255, 255, 255, 0.55);
    --g-divider: rgba(124, 116, 204, 0.14);
    --g-exp-hover: rgba(255, 255, 255, 0.4);
    --g-chip-bg: rgba(124, 116, 255, 0.12);
    --g-chip-border: rgba(124, 116, 255, 0.2);
    --g-chip-text: #4f4796;
    --g-chip-soft-bg: rgba(255, 255, 255, 0.5);
    --g-chip-soft-border: rgba(255, 255, 255, 0.7);
    --g-chip-soft-text: #555569;
    --g-pill-bg: rgba(255, 255, 255, 0.5);
    --g-pill-border: rgba(255, 255, 255, 0.7);
    --g-pill-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 14px rgba(31, 38, 135, 0.1);
    --g-pill-text: #3b3a52;
    --g-pill-hover-bg: rgba(255, 255, 255, 0.72);
    --g-avatar-inner: rgba(255, 255, 255, 0.7);
    --g-avatar-fallback: #5b54b8;

    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow-y: auto;
    /* Luminous, near-white base — the airy opposite of the 3D deep-space void. */
    background: var(--g-bg);
    color: var(--g-text);
    font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    transition: background 0.45s ease, color 0.45s ease;
  }

  /* ── Dark appearance ──────────────────────────────────────────────────
     Same frosted-glass language, lit from the other side: a deep near-black
     base, vivid jewel-tone aurora glowing through, dark translucent panels
     with faint light edges. macOS/Windows 11 dark mode. */
  .glass-wrapper.dark {
    --g-bg: linear-gradient(135deg, #0a0c18 0%, #120f1f 50%, #0a1016 100%);
    --g-text: #d7d7e6;
    --g-h1: #f3f3fb;
    --g-strong: #eef0fb;
    --g-accent: #b3a8ff;
    --g-accent2: #b9aeff;
    --g-tagline: #c2c2d6;
    --g-summary: #c8c8db;
    --g-muted: #9a9ab4;
    --g-meta: #8a8aa8;
    --g-label: #a99bff;
    --g-dot: #b9aeff;
    --g-panel-bg: rgba(28, 28, 44, 0.45);
    --g-panel-border: rgba(255, 255, 255, 0.12);
    --g-panel-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      inset 0 0 0 1px rgba(255, 255, 255, 0.04),
      0 10px 40px rgba(0, 0, 0, 0.45);
    --g-panel-shadow-hover:
      inset 0 1px 0 rgba(255, 255, 255, 0.18),
      inset 0 0 0 1px rgba(255, 255, 255, 0.06),
      0 18px 50px rgba(0, 0, 0, 0.55);
    --g-sheen: rgba(255, 255, 255, 0.22);
    --g-divider: rgba(255, 255, 255, 0.08);
    --g-exp-hover: rgba(255, 255, 255, 0.06);
    --g-chip-bg: rgba(150, 140, 255, 0.18);
    --g-chip-border: rgba(160, 150, 255, 0.3);
    --g-chip-text: #c9c2ff;
    --g-chip-soft-bg: rgba(255, 255, 255, 0.07);
    --g-chip-soft-border: rgba(255, 255, 255, 0.14);
    --g-chip-soft-text: #b9b9cf;
    --g-pill-bg: rgba(255, 255, 255, 0.08);
    --g-pill-border: rgba(255, 255, 255, 0.16);
    --g-pill-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 4px 14px rgba(0, 0, 0, 0.4);
    --g-pill-text: #d7d7e6;
    --g-pill-hover-bg: rgba(255, 255, 255, 0.14);
    --g-avatar-inner: rgba(40, 40, 58, 0.7);
    --g-avatar-fallback: #b3a8ff;
  }
  .glass-wrapper::-webkit-scrollbar { width: 0; }
  .glass-wrapper { scrollbar-width: none; }

  /* ── Appearance toggle (sun/moon) — a frosted pill in the top-right corner.
     Desktop is free here (the audio FAB lives bottom-left); on mobile it steps
     to the top-left so it never overlaps the audio FAB. */
  .mode-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 50;
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    background: var(--g-panel-bg);
    border: 1px solid var(--g-panel-border);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    backdrop-filter: blur(20px) saturate(180%);
    box-shadow: var(--g-pill-shadow);
    color: var(--g-accent);
    font-size: 1.15rem;
    line-height: 1;
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease,
      color 0.3s ease, border-color 0.3s ease;
  }
  .mode-toggle:hover { transform: translateY(-2px) scale(1.05); background: var(--g-pill-hover-bg); }
  .mode-toggle:active { transform: scale(0.94); }
  .mode-toggle:focus-visible { outline: 2px solid var(--g-accent); outline-offset: 3px; }
  .mode-icon { display: block; }

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

  /* In dark mode the aurora turns to saturated jewel tones glowing out of the
     near-black — the same drifting field, lit like a night sky. */
  .glass-wrapper.dark .b1 { background: radial-gradient(circle, #4f7bff, transparent 70%); opacity: 0.55; }
  .glass-wrapper.dark .b2 { background: radial-gradient(circle, #9d6bff, transparent 70%); opacity: 0.5; }
  .glass-wrapper.dark .b3 { background: radial-gradient(circle, #ff5fa0, transparent 70%); opacity: 0.46; }
  .glass-wrapper.dark .b4 { background: radial-gradient(circle, #2fd9c8, transparent 70%); opacity: 0.42; }
  .glass-wrapper.dark .b5 { background: radial-gradient(circle, #ffb05f, transparent 70%); opacity: 0.36; }

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
    background: var(--g-panel-bg);
    -webkit-backdrop-filter: blur(30px) saturate(180%);
    backdrop-filter: blur(30px) saturate(180%);
    border: 1px solid var(--g-panel-border);
    border-radius: 26px;
    padding: 28px 30px;
    /* Fine top light-edge highlight + soft diffuse ambient shadow. */
    box-shadow: var(--g-panel-shadow);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, background 0.45s ease, border-color 0.45s ease;
    transform-style: preserve-3d;
    overflow: hidden;
  }
  .panel:hover {
    will-change: transform;
    box-shadow: var(--g-panel-shadow-hover);
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
      var(--g-sheen),
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
    color: var(--g-label);
    margin: 0 0 16px;
  }

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
    background: var(--g-avatar-inner);
    object-fit: cover;
  }
  .avatar-fallback {
    font-size: 2.4rem;
    font-weight: 300;
    color: var(--g-avatar-fallback);
    letter-spacing: 1px;
  }
  .hero-info { min-width: 0; }
  .hero h1 {
    margin: 0;
    font-size: clamp(2rem, 4.4vw, 3rem);
    font-weight: 200; /* Outfit ultralight — the airy, luminous Big Sur / SF voice */
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: var(--g-h1);
  }
  .hero .role {
    margin: 8px 0 0;
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--g-accent);
  }
  .hero .tagline {
    margin: 12px 0 0;
    font-size: 0.96rem;
    font-weight: 300;
    line-height: 1.55;
    color: var(--g-tagline);
    max-width: 560px;
  }
  .hero .location {
    margin: 12px 0 0;
    font-size: 0.88rem;
    font-weight: 400;
    color: var(--g-muted);
  }
  .hero .location .dot { color: var(--g-dot); }

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
    background: var(--g-pill-bg);
    border: 1px solid var(--g-pill-border);
    box-shadow: var(--g-pill-shadow);
    color: var(--g-pill-text);
    font-size: 0.86rem;
    font-weight: 500;
    text-decoration: none;
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.25s ease;
  }
  .pill:hover { transform: translateY(-2px); background: var(--g-pill-hover-bg); }
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
    color: var(--g-summary);
  }

  /* ── Experience ────────────────────────────────────────────────────── */
  .exp-list { display: flex; flex-direction: column; gap: 8px; }
  .exp-item {
    padding: 16px 18px;
    margin: 0 -18px;
    border-radius: 16px;
    transition: background 0.25s ease;
  }
  .exp-item:not(:last-child) { border-bottom: 1px solid var(--g-divider); }
  .exp-item:hover { background: var(--g-exp-hover); }
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
    color: var(--g-strong);
  }
  .period {
    flex: 0 0 auto;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--g-meta);
    white-space: nowrap;
  }
  .exp-role {
    margin: 3px 0 0;
    font-size: 0.92rem;
    font-weight: 500;
    color: var(--g-accent2);
  }
  .exp-desc {
    margin: 8px 0 0;
    font-size: 0.88rem;
    font-weight: 300;
    line-height: 1.55;
    color: var(--g-tagline);
  }
  .exp-item.early { opacity: 0.92; }

  /* ── Chips ─────────────────────────────────────────────────────────── */
  .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .chip {
    padding: 5px 13px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 500;
    background: var(--g-chip-bg);
    border: 1px solid var(--g-chip-border);
    color: var(--g-chip-text);
    white-space: nowrap;
  }
  .chip.soft {
    background: var(--g-chip-soft-bg);
    border-color: var(--g-chip-soft-border);
    color: var(--g-chip-soft-text);
  }

  /* ── Skills ────────────────────────────────────────────────────────── */
  .skill-groups { display: flex; flex-direction: column; gap: 16px; }
  .group-name {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--g-summary);
    margin-bottom: 8px;
  }

  /* ── Languages ─────────────────────────────────────────────────────── */
  .lang-list { display: flex; flex-direction: column; gap: 14px; }
  .lang-top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
  .lang-name { font-size: 1rem; font-weight: 600; color: var(--g-strong); }
  .lang-level { font-size: 0.84rem; font-weight: 500; color: var(--g-accent2); }
  .lang-note { display: block; margin-top: 4px; font-size: 0.78rem; font-weight: 300; color: var(--g-muted); }

  /* ── Education ─────────────────────────────────────────────────────── */
  .edu-item { display: flex; flex-direction: column; gap: 2px; }
  .edu-item:not(:last-of-type) { margin-bottom: 14px; }
  .edu-item strong { font-size: 0.96rem; font-weight: 600; color: var(--g-strong); }
  .edu-meta { font-size: 0.82rem; font-weight: 300; color: var(--g-muted); }

  /* ── Talks ─────────────────────────────────────────────────────────── */
  .talk-list { display: flex; flex-direction: column; gap: 12px; }
  .talk-item { display: flex; flex-direction: column; gap: 2px; }
  .talk-name { font-size: 0.94rem; font-weight: 600; color: var(--g-strong); }
  .talk-meta { font-size: 0.8rem; font-weight: 300; color: var(--g-muted); }

  @media (prefers-reduced-motion: reduce) {
    .panel { transition: box-shadow 0.3s ease, background 0.45s ease, border-color 0.45s ease; }
    .pill { transition: background 0.25s ease; }
    .mode-toggle { transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
  }

  /* On mobile the audio FAB jumps to the top-right corner, so the appearance
     toggle steps aside to the top-left to avoid stacking on top of it. */
  @media (max-width: 720px) {
    .mode-toggle {
      top: 14px;
      left: 14px;
      right: auto;
      width: 44px;
      height: 44px;
      font-size: 1rem;
    }
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
