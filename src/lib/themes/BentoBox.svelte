<script lang="ts">
  import { onMount } from 'svelte';
  import { getCvData } from '$lib/i18n';
  import { tilt, reveal } from '$lib/actions/interactive';

  const cvData = getCvData();

  let darkMode = $state(false);
  let avatarFailed = $state(false);

  const DARK_KEY = 'cv_bento_dark';

  onMount(() => {
    // Persisted preference wins; otherwise fall back to the OS color scheme.
    try {
      const saved = localStorage.getItem(DARK_KEY);
      if (saved === 'true' || saved === 'false') {
        darkMode = saved === 'true';
      } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        darkMode = true;
      }
    } catch {
      /* localStorage unavailable — keep light default */
    }
  });

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyDarkMode() {
    darkMode = !darkMode;
    try {
      localStorage.setItem(DARK_KEY, String(darkMode));
    } catch {
      /* ignore persistence errors */
    }
  }

  // Circular "ink-spread" reveal from the toggle button (View Transitions API),
  // with a graceful fallback where it isn't supported / motion is reduced.
  function toggleDarkMode(e: MouseEvent) {
    const startVT = (document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    }).startViewTransition;

    if (!startVT || prefersReduced()) {
      applyDarkMode();
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = startVT.call(document, applyDarkMode);
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }
</script>

<div class="bento-wrapper {darkMode ? 'dark' : 'light'}">
  <!-- Theme toggle (top-right, compact) -->
  <button
    class="theme-toggle"
    onclick={toggleDarkMode}
    aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    title={darkMode ? 'Light Mode' : 'Dark Mode'}
  >
    <span class="toggle-icon">{darkMode ? '☀️' : '🌙'}</span>
  </button>

  <div class="bento-grid">
    <!-- Profile Box (Large) -->
    <div class="bento-box profile-box" use:reveal={{ delay: 0 }} use:tilt={{ max: 2.5 }}>
      <div class="avatar-container">
        {#if avatarFailed}
          <div class="avatar-placeholder">ST</div>
        {:else}
          <img class="avatar-img" src="/avatar.svg" alt={cvData.name} onerror={() => (avatarFailed = true)} />
        {/if}
      </div>
      <div class="profile-info">
        <h1>{cvData.name}</h1>
        <span class="role-badge">{cvData.role}</span>
        <p class="tagline">{cvData.tagline}</p>
        <p class="location"><span class="pin">◎</span> {cvData.contact.location}</p>
      </div>
    </div>

    <!-- About Me Box -->
    <div class="bento-box about-box" use:reveal={{ delay: 80 }} use:tilt={{ max: 2.5 }}>
      <span class="box-label">About</span>
      <p>{cvData.summary}</p>
    </div>

    <!-- Skills Marquee Box -->
    <div class="bento-box skills-box" use:reveal={{ delay: 160 }} use:tilt={{ max: 2.5 }}>
      <span class="box-label">Core Stack</span>
      <div class="marquee-container">
        <div class="marquee">
          <span class="mseq">{#each cvData.skills as skill}<span class="sk">{skill}</span> • {/each}</span><span class="mseq dup" aria-hidden="true">{#each cvData.skills as skill}<span class="sk">{skill}</span> • {/each}</span>
        </div>
      </div>
    </div>

    <!-- Experiences Box -->
    <div class="bento-box exp-box" use:reveal={{ delay: 220 }} use:tilt={{ max: 2 }}>
      <span class="box-label">Experience</span>
      <div class="exp-list">
        {#each cvData.experience as exp}
          <div class="exp-item">
            <div class="exp-header">
              <span class="company">{exp.company}</span>
              <span class="period">{exp.period}</span>
            </div>
            <div class="exp-title">{exp.title}</div>
            <p class="exp-desc">{exp.description}</p>
          </div>
        {/each}
        <div class="exp-item early">
          <div class="exp-header">
            <span class="company">{cvData.earlyCareer.title}</span>
            <span class="period">{cvData.earlyCareer.period}</span>
          </div>
          <p class="exp-desc">{cvData.earlyCareer.description}</p>
        </div>
      </div>
    </div>

    <!-- Education Box -->
    <div class="bento-box edu-box" use:reveal={{ delay: 280 }} use:tilt={{ max: 2.5 }}>
      <span class="box-label">Education</span>
      {#each cvData.education as edu}
        <div class="edu-item">
          <strong>{edu.title}</strong>
          <p>{edu.institute}</p>
          <span class="period">{edu.period}</span>
        </div>
      {/each}
    </div>

    <!-- Languages Box -->
    <div class="bento-box lang-box" use:reveal={{ delay: 320 }} use:tilt={{ max: 2.5 }}>
      <span class="box-label">Languages</span>
      <div class="lang-list">
        {#each cvData.languages as lang}
          <div class="lang-item">
            <span class="lang-name">{lang.name}</span>
            <span class="lang-level">{lang.level}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Talks Box -->
    <div class="bento-box cert-box" use:reveal={{ delay: 360 }} use:tilt={{ max: 2 }}>
      <span class="box-label">Talks</span>
      <div class="cert-cols">
        <div class="cert-col">
          <span class="cert-head">Conferences</span>
          <ul>
            {#each cvData.conferences as conf}
              <li>{conf.name} <span class="muted">· {conf.location} ’{conf.year.slice(-2)}</span></li>
            {/each}
          </ul>
        </div>
      </div>
    </div>

    <!-- Social / Contact Boxes -->
    <a href={cvData.contact.linkedin} target="_blank" rel="noopener" class="bento-box social-box linkedin" use:reveal={{ delay: 400 }} use:tilt={{ max: 3 }}>
      <span class="social-icon">in</span>
      <span class="social-label">LinkedIn</span>
      <span class="social-go" aria-hidden="true">→</span>
    </a>

    <a href="mailto:{cvData.contact.email}" class="bento-box social-box email" use:reveal={{ delay: 440 }} use:tilt={{ max: 3 }}>
      <span class="social-icon">@</span>
      <span class="social-label">Email</span>
      <span class="social-go" aria-hidden="true">→</span>
    </a>

  </div>
</div>

<style>
  /* The circular reveal drives the toggle: the new (dark/light) snapshot is
     clipped open over the old one, so disable the default root cross-fade. */
  :global(::view-transition-old(root)),
  :global(::view-transition-new(root)) {
    animation: none;
    mix-blend-mode: normal;
  }
  :global(::view-transition-new(root)) { z-index: 1; }
  :global(::view-transition-old(root)) { z-index: 0; }

  .bento-wrapper {
    --bg-color: #ececf0;
    --bg-accent: #e3e6f5;
    --box-bg: #ffffff;
    --text-main: #16161a;
    --text-sec: #6e6e78;
    --accent: #4f46e5;
    --accent-soft: rgba(79, 70, 229, 0.08);
    --shadow: 0 4px 14px rgba(20, 20, 40, 0.05), 0 12px 40px rgba(20, 20, 40, 0.06);
    --hover-shadow: 0 10px 24px rgba(20, 20, 40, 0.1), 0 24px 60px rgba(20, 20, 40, 0.12);
    --border: 1px solid rgba(20, 20, 40, 0.06);

    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background-color: var(--bg-color);
    background-image:
      radial-gradient(circle at 12% 18%, var(--bg-accent), transparent 45%),
      radial-gradient(circle at 88% 82%, rgba(79, 70, 229, 0.06), transparent 50%);
    color: var(--text-main);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    display: flex;
    transition: background-color 0.5s ease, color 0.5s ease;
    overflow-y: auto;
    padding: 2.5rem 2.5rem 90px;
    box-sizing: border-box;
  }

  .bento-wrapper.dark {
    --bg-color: #08080c;
    --bg-accent: #16162a;
    --box-bg: #141418;
    --text-main: #f4f4f7;
    --text-sec: #9a9aa6;
    --accent: #7c74ff;
    --accent-soft: rgba(124, 116, 255, 0.12);
    --shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 12px 40px rgba(0, 0, 0, 0.35);
    --hover-shadow: 0 10px 24px rgba(0, 0, 0, 0.5), 0 24px 60px rgba(0, 0, 0, 0.45);
    --border: 1px solid rgba(255, 255, 255, 0.07);
  }

  .bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: minmax(0, auto);
    grid-template-areas:
      'profile profile about  about'
      'profile profile skills skills'
      'exp     exp     edu    edu'
      'exp     exp     lang   lang'
      'exp     exp     cert   cert'
      'exp     exp     soc1   soc1'
      'soc2    soc2    soc2   soc2';
    gap: 18px;
    max-width: 1040px;
    width: 100%;
    margin: auto;
  }

  .bento-box {
    position: relative;
    background-color: var(--box-bg);
    border-radius: 24px;
    padding: 26px;
    box-shadow: var(--shadow);
    border: var(--border);
    transition: transform 0.18s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
    transform-style: preserve-3d;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
  }

  .bento-box:hover {
    box-shadow: var(--hover-shadow);
  }

  /* Cursor-following spotlight (driven by the tilt action's CSS vars) */
  .bento-box::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 3;
    opacity: var(--spot, 0);
    transition: opacity 0.3s ease;
    background: radial-gradient(
      260px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 255, 255, 0.16),
      transparent 60%
    );
  }
  .bento-wrapper.dark .bento-box::after {
    background: radial-gradient(
      260px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 255, 255, 0.09),
      transparent 60%
    );
  }
  /* Brighter sheen on the saturated social cards */
  .social-box::after {
    background: radial-gradient(
      240px circle at var(--mx, 50%) var(--my, 50%),
      rgba(255, 255, 255, 0.28),
      transparent 55%
    );
  }

  @media (prefers-reduced-motion: reduce) {
    .bento-box { transition: box-shadow 0.35s ease; }
    .bento-box:hover { transform: translateY(-4px); }
  }

  /* Editorial section labels */
  .box-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-sec);
    margin-bottom: 16px;
  }

  /* ---- Profile ---- */
  .profile-box {
    grid-area: profile;
    justify-content: center;
    align-items: center;
    text-align: center;
    background:
      radial-gradient(circle at 50% 0%, var(--accent-soft), transparent 60%),
      var(--box-bg);
  }

  .avatar-container {
    width: 116px;
    height: 116px;
    border-radius: 50%;
    background: var(--accent);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.14);
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--box-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--text-main);
    letter-spacing: -1px;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: var(--box-bg);
    display: block;
  }

  .profile-info h1 {
    margin: 0 0 14px 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 2.3rem;
    font-weight: 700;
    letter-spacing: -1px;
    line-height: 1.05;
  }

  .role-badge {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    padding: 7px 18px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.28);
  }

  .tagline {
    color: var(--text-sec);
    font-size: 0.94rem;
    font-style: italic;
    line-height: 1.5;
    margin: 16px 0 0 0;
    max-width: 320px;
  }

  .location {
    color: var(--text-sec);
    font-weight: 500;
    font-size: 0.92rem;
    margin: 12px 0 0 0;
  }
  .pin { color: var(--accent); }

  /* ---- About ---- */
  .about-box {
    grid-area: about;
    font-size: 1.02rem;
    line-height: 1.65;
  }
  .about-box p { margin: 0; color: var(--text-main); }

  /* ---- Dark mode toggle (compact, top-right) ---- */
  .theme-toggle {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 50;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: var(--border);
    background-color: var(--box-bg);
    box-shadow: var(--shadow);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
  }
  .theme-toggle:hover {
    transform: translateY(-2px) scale(1.06);
    box-shadow: var(--hover-shadow);
  }
  .theme-toggle:active { transform: scale(0.96); }
  .toggle-icon { font-size: 1.35rem; line-height: 1; }

  /* ---- Skills marquee ---- */
  .skills-box {
    grid-area: skills;
    overflow: hidden;
    justify-content: center;
  }

  .marquee-container {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    position: relative;
    padding: 6px 0;
  }

  .marquee-container::before, .marquee-container::after {
    content: '';
    position: absolute;
    top: 0;
    width: 70px;
    height: 100%;
    z-index: 2;
  }
  .marquee-container::before { left: 0; background: linear-gradient(to right, var(--box-bg), transparent); }
  .marquee-container::after { right: 0; background: linear-gradient(to left, var(--box-bg), transparent); }

  .marquee {
    display: inline-block;
    animation: scroll 28s linear infinite;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--text-sec);
  }

  /* Pause the marquee on hover/focus so the skills can actually be read */
  .skills-box:hover .marquee,
  .skills-box:focus-within .marquee {
    animation-play-state: paused;
  }

  .marquee .sk {
    color: var(--text-main);
    margin: 0 6px 0 18px;
  }

  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* Reduced motion: the scroll stops and the skills become a static,
     wrapped, fully readable list (the duplicate loop copy is dropped). */
  @media (prefers-reduced-motion: reduce) {
    .skills-box { overflow: visible; }
    .marquee-container { white-space: normal; overflow: visible; }
    .marquee-container::before,
    .marquee-container::after { display: none; }
    .marquee { display: block; animation: none; white-space: normal; }
    .marquee .dup { display: none; }
    .marquee .sk { display: inline-block; margin: 0 14px 4px 0; }
  }

  /* ---- Experience ---- */
  .exp-box {
    grid-area: exp;
  }

  .exp-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .exp-item {
    padding: 14px 12px;
    margin: 0 -12px;
    border-radius: 12px;
    border-bottom: 1px solid rgba(134, 134, 139, 0.18);
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .exp-item:first-child { padding-top: 0; }
  .exp-item:last-child { border-bottom: none; padding-bottom: 0; }

  /* Invite reading: soft accent highlight + nudge on hover */
  .exp-item:hover {
    background: var(--accent-soft);
    transform: translateX(4px);
  }

  @media (prefers-reduced-motion: reduce) {
    .exp-item:hover { transform: none; }
  }

  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 4px;
    gap: 12px;
  }

  .company {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 1.08rem;
  }
  .period {
    font-size: 0.8rem;
    color: var(--text-sec);
    font-weight: 500;
    white-space: nowrap;
  }
  .exp-title { color: var(--accent); font-size: 0.92rem; font-weight: 600; }
  .exp-desc {
    margin: 6px 0 0 0;
    color: var(--text-sec);
    font-size: 0.85rem;
    line-height: 1.45;
  }
  .exp-item.early { opacity: 0.82; }
  .exp-item.early .company { font-size: 0.98rem; }

  /* ---- Languages ---- */
  .lang-box { grid-area: lang; }
  .lang-list { display: flex; flex-direction: column; gap: 10px; }
  .lang-item {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .lang-name { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 0.98rem; }
  .lang-level { color: var(--text-sec); font-size: 0.85rem; font-weight: 500; }

  /* ---- Certifications & Talks ---- */
  .cert-box { grid-area: cert; }
  .cert-cols { display: grid; grid-template-columns: 1fr; gap: 18px; }
  .cert-head {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 600;
    font-size: 0.92rem;
    margin-bottom: 8px;
  }
  .cert-col ul { margin: 0; padding-left: 16px; }
  .cert-col li { font-size: 0.85rem; line-height: 1.5; color: var(--text-main); margin-bottom: 4px; }
  .cert-col .muted { color: var(--text-sec); }
  @media (max-width: 500px) { .cert-cols { grid-template-columns: 1fr; } }

  /* ---- Education ---- */
  .edu-box {
    grid-area: edu;
  }
  .edu-item {
    padding: 10px 0;
    border-bottom: 1px solid rgba(134, 134, 139, 0.18);
  }
  .edu-item:last-child { border-bottom: none; padding-bottom: 0; }
  .edu-item strong { font-family: 'Space Grotesk', sans-serif; font-weight: 600; }
  .edu-item p { margin: 4px 0; font-size: 0.92rem; color: var(--text-main); }
  .edu-item .period { display: block; }

  /* ---- Social ---- */
  .social-box {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 12px;
    position: relative;
    overflow: hidden;
    color: #fff;
    min-height: 84px;
  }
  .social-box.linkedin { grid-area: soc1; background: linear-gradient(140deg, #0a66c2, #0a4f96); }
  .social-box.email { grid-area: soc2; background: linear-gradient(140deg, #5b54e6, #4338ca); }

  .social-box .social-icon {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.7rem;
    font-weight: 700;
    line-height: 1;
  }
  .social-box .social-label { font-weight: 600; font-size: 0.9rem; opacity: 0.95; }
  .social-box .social-go {
    font-size: 1.1rem;
    font-weight: 700;
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .social-box:hover .social-go {
    opacity: 0.95;
    transform: translateX(0);
  }

  @media (max-width: 900px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-areas:
        'profile profile'
        'about   about'
        'skills  skills'
        'exp     exp'
        'edu     edu'
        'lang    lang'
        'cert    cert'
        'soc1    soc2';
    }
  }

  @media (max-width: 500px) {
    .bento-grid { display: flex; flex-direction: column; }
    .bento-box { width: 100%; box-sizing: border-box; }
  }

  /* On mobile the global volume toggle lives top-right, so the theme toggle moves
     to the top-left to avoid stacking the two in the same corner. */
  @media (max-width: 720px) {
    .theme-toggle { top: 16px; left: 16px; right: auto; }
  }
</style>
