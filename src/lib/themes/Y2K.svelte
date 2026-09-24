<script module lang="ts">
  let introSeen = false;
</script>

<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { prefersReduced } from '$lib/motion';
  import { getCvData, getUi } from '$lib/i18n';
  import { audioEnabled, toggleAudio, playEra, y2kClick } from '$lib/audio';

  const cv = getCvData();
  const ui = getUi();
  const t = ui.y2k;
  const shared = ui.shared;
  const uid = $props.id();

  type SectionId = 'profile' | 'experience' | 'skills' | 'education' | 'contacts';
  const sections: { id: SectionId; label: string; flavor: string; glyph: string }[] = [
    { id: 'profile', label: t.nav.profile, flavor: 'blueberry', glyph: '◉' },
    { id: 'experience', label: t.nav.experience, flavor: 'tangerine', glyph: '▶' },
    { id: 'skills', label: t.nav.skills, flavor: 'lime', glyph: '✦' },
    { id: 'education', label: t.nav.education, flavor: 'grape', glyph: '◆' },
    { id: 'contacts', label: t.nav.contacts, flavor: 'strawberry', glyph: '✉' }
  ];
  const FX = ['zoom', 'wipe', 'scan', 'wipe', 'zoom'] as const;

  const initials = cv.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const years = new Date().getFullYear() - cv.keyFigures.startYear;
  const phoneHref = `tel:${cv.contact.phone.replace(/\s+/g, '')}`;
  const visitors = '0002000';
  const tickerItems = [
    `${t.nowOnline}: ${cv.name} · ${cv.role}`,
    cv.tagline,
    ...cv.skillGroups.map((g) => `${g.label}: ${g.items.slice(0, 3).join(' · ')}`),
    `${t.basedIn}: ${cv.contact.location}`
  ];

  const reduced = prefersReduced();
  let entered = $state(introSeen || reduced);
  let leaving = $state(false);
  let booting = $state(false);
  let progress = $state(0);
  let loaded = $state(false);
  let active = $state(0);
  let narrow = $state(false);
  let now = $state(new Date());
  let bug = $state<'off' | 'bug' | 'patched'>('off');
  let tabEls = $state<HTMLButtonElement[]>([]);
  let enterBtn = $state<HTMLButtonElement>();
  const timers: ReturnType<typeof setTimeout>[] = [];

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateText = $derived(bug === 'bug' ? '01.01.19100' : `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}`);
  const timeText = $derived(bug === 'bug' ? '00:00:00' : `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
  const current = $derived(sections[active]);

  async function focusActiveTab() {
    await tick();
    tabEls[active]?.focus({ preventScroll: true });
  }

  function finishIntro() {
    introSeen = true;
    entered = true;
    leaving = false;
    void focusActiveTab();
  }

  function enter() {
    if (leaving || entered) return;
    y2kClick();
    if (reduced) {
      finishIntro();
      return;
    }
    leaving = true;
    booting = true;
    timers.push(setTimeout(finishIntro, 560));
    timers.push(setTimeout(() => (booting = false), 1400));
  }

  function skip() {
    if (entered) return;
    finishIntro();
  }

  function select(i: number) {
    if (i === active) return;
    active = i;
    y2kClick();
    if (narrow) tabEls[i]?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
  }

  function onTabKey(e: KeyboardEvent, i: number) {
    const n = sections.length;
    let next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % n;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    e.stopPropagation();
    select(next);
    tabEls[next]?.focus();
  }

  function triggerBug() {
    if (bug !== 'off') return;
    bug = 'bug';
    y2kClick();
    timers.push(setTimeout(() => (bug = 'patched'), 1700));
    timers.push(setTimeout(() => (bug = 'off'), 3900));
  }

  function onSound() {
    if (toggleAudio()) playEra('y2k');
  }

  onMount(() => {
    const clock = setInterval(() => (now = new Date()), 1000);
    const mq = window.matchMedia('(max-width: 759px)');
    const onMq = () => (narrow = mq.matches);
    onMq();
    mq.addEventListener('change', onMq);

    let raf = 0;
    if (!entered) {
      const start = performance.now() + 700;
      const total = 2300;
      const loop = (ts: number) => {
        const k = Math.min(1, Math.max(0, (ts - start) / total));
        const eased = k < 0.55 ? k * 1.25 : 0.6875 + (k - 0.55) * 0.694;
        progress = Math.min(100, Math.round(eased * 100));
        if (k < 1) raf = requestAnimationFrame(loop);
        else {
          progress = 100;
          loaded = true;
          void tick().then(() => {
            if (!entered && (document.activeElement === document.body || !document.activeElement)) enterBtn?.focus({ preventScroll: true });
          });
        }
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      clearInterval(clock);
      cancelAnimationFrame(raf);
      mq.removeEventListener('change', onMq);
      timers.forEach(clearTimeout);
    };
  });
</script>

{#snippet monogram(size: number, animated: boolean)}
  <svg class="mono" class:animated width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="{uid}-chrome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.36" stop-color="#d9e3ec" />
        <stop offset="0.5" stop-color="#6f8397" />
        <stop offset="0.53" stop-color="#23384d" />
        <stop offset="0.72" stop-color="#a7b9c9" />
        <stop offset="1" stop-color="#f5f9fc" />
      </linearGradient>
      <linearGradient id="{uid}-ring" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.3" stop-color="#8ea2b5" />
        <stop offset="0.52" stop-color="#f2f7fa" />
        <stop offset="0.78" stop-color="#55697e" />
        <stop offset="1" stop-color="#ffffff" />
      </linearGradient>
      <radialGradient id="{uid}-disc" cx="0.36" cy="0.3" r="0.82">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.3" stop-color="#bdeafc" />
        <stop offset="0.72" stop-color="#2f9fd0" />
        <stop offset="1" stop-color="#0a4f7c" />
      </radialGradient>
      <clipPath id="{uid}-clip"><circle cx="100" cy="100" r="60" /></clipPath>
    </defs>
    <ellipse class="orbit o1" cx="100" cy="100" rx="94" ry="32" pathLength="100" fill="none" stroke="url(#{uid}-ring)" stroke-width="5" transform="rotate(-18 100 100)" />
    <circle class="disc" cx="100" cy="100" r="60" fill="url(#{uid}-disc)" stroke="url(#{uid}-ring)" stroke-width="7" />
    <ellipse cx="86" cy="72" rx="34" ry="16" fill="#fff" opacity="0.55" />
    <text class="letters" x="100" y="117" text-anchor="middle" font-family="Michroma, 'Arial Black', sans-serif" font-size="46" fill="url(#{uid}-chrome)" stroke="#0b2338" stroke-width="1.4" paint-order="stroke">{initials}</text>
    <g clip-path="url(#{uid}-clip)">
      <rect class="glint" x="-70" y="-10" width="34" height="220" fill="#fff" opacity="0.7" />
    </g>
    <ellipse class="orbit o2" cx="100" cy="100" rx="94" ry="32" pathLength="100" fill="none" stroke="url(#{uid}-ring)" stroke-width="5" stroke-dasharray="0 50 50 0" transform="rotate(24 100 100)" />
  </svg>
{/snippet}

<div class="y2k" class:narrow>
  <div class="sky" aria-hidden="true">
    <div class="flare">
      <span class="f-core"></span>
      <span class="f-ring"></span>
      <span class="f-dot d1"></span>
      <span class="f-dot d2"></span>
      <span class="f-dot d3"></span>
      <span class="f-hex"></span>
    </div>
    <div class="horizon"></div>
    <div class="grid-floor"></div>
    <span class="blob b1"></span>
    <span class="blob b2"></span>
    <span class="blob b3"></span>
    <span class="blob b4"></span>
    <span class="chrome-ring"></span>
    <span class="spark s1"></span>
    <span class="spark s2"></span>
    <span class="spark s3"></span>
    <span class="spark s4"></span>
  </div>

  {#if !entered}
    <section class="splash" class:leaving aria-label={t.introLabel} aria-hidden={leaving ? 'true' : undefined}>
      <div class="splash-inner">
        <div class="splash-logo">{@render monogram(188, true)}</div>
        <h1 class="splash-name chrome-dark">{cv.name}</h1>
        <p class="splash-role">{cv.role}</p>
        <div class="loader" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-label={t.loadingAria(progress)}>
          <div class="trough"><div class="fill" style="width: {progress}%"></div></div>
          <p class="load-label" aria-hidden="true">{loaded ? 'COMPLETE' : 'LOADING'}<span class="dots">{loaded ? '' : '...'}</span> {progress}%</p>
        </div>
        <div class="splash-actions">
          {#if loaded}
            <button class="gel gel-enter flavor-blueberry" bind:this={enterBtn} onclick={enter} aria-label={t.enterAria}>
              <span class="gel-label">ENTER »</span>
            </button>
          {/if}
          <button class="skip" onclick={skip} aria-label={t.skipAria}>skip intro »</button>
        </div>
      </div>
    </section>
  {/if}

  {#if entered || leaving}
    <div class="stage">
      <div class="console" class:boot={booting}>
        <span class="screw sc1" aria-hidden="true"></span>
        <span class="screw sc2" aria-hidden="true"></span>
        <span class="screw sc3" aria-hidden="true"></span>
        <span class="screw sc4" aria-hidden="true"></span>
        <div class="shell">
          <header class="head">
            <div class="brand">
              <span class="brand-logo">{@render monogram(52, false)}</span>
              <div class="brand-text">
                <h1 class="brand-name chrome-dark">{cv.name}</h1>
                <p class="brand-role">{cv.role}</p>
              </div>
            </div>
            <div class="instruments">
              <button class="lcd" class:bugged={bug === 'bug'} onclick={triggerBug} aria-label={t.clockAria}>
                <span class="lcd-date">{dateText}</span>
                <span class="lcd-time">{timeText}</span>
                <span class="lcd-flag">
                  {#if bug === 'bug'}MILLENNIUM BUG!{:else if bug === 'patched'}PATCHED ✓{:else}Y2K COMPLIANT ✓{/if}
                </span>
              </button>
              <span class="sr-only" aria-live="polite">{bug === 'patched' ? t.bugNote : ''}</span>
              <div class="counter" role="img" aria-label={t.visitorsAria(visitors)}>
                <span class="odo" aria-hidden="true">
                  {#each visitors.split('') as d, i (i)}<span class="digit">{d}</span>{/each}
                </span>
                <span class="counter-label" aria-hidden="true">{t.visitors}</span>
              </div>
              <button
                class="sound"
                class:on={$audioEnabled}
                onclick={onSound}
                aria-pressed={$audioEnabled}
                aria-label={$audioEnabled ? shared.audioOff : shared.audioOn}
              >
                <span class="sound-led" aria-hidden="true"></span>
                <span class="sound-text" aria-hidden="true">SOUND {$audioEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </header>

          <nav class="side" aria-label={t.navLabel}>
            <div class="tabs" role="tablist" aria-orientation={narrow ? 'horizontal' : 'vertical'}>
              {#each sections as s, i (s.id)}
                <button
                  bind:this={tabEls[i]}
                  class="gel tab flavor-{s.flavor}"
                  class:active={active === i}
                  role="tab"
                  id="{uid}-tab-{s.id}"
                  aria-selected={active === i}
                  aria-controls="{uid}-panel"
                  tabindex={active === i ? 0 : -1}
                  onclick={() => select(i)}
                  onkeydown={(e) => onTabKey(e, i)}
                >
                  <span class="tab-dot" aria-hidden="true"><span>{s.glyph}</span></span>
                  <span class="gel-label">{s.label}</span>
                </button>
              {/each}
            </div>
            <div class="cdrom" aria-hidden="true">
              <span class="disc-cd"></span>
              <span class="cd-label">CD-ROM · 700MB</span>
            </div>
          </nav>

          <div class="screen">
            <div class="screen-bar" aria-hidden="true">
              <span class="screen-path">C:\{current.id.toUpperCase()}.SWF</span>
              <span class="screen-index">0{active + 1}/0{sections.length}</span>
            </div>
            {#key active}
              <div
                class="panel fx-{FX[active]}"
                role="tabpanel"
                id="{uid}-panel"
                aria-labelledby="{uid}-tab-{current.id}"
                tabindex="0"
              >
                <h2 class="panel-title chrome-light">{current.label}</h2>

                {#if current.id === 'profile'}
                  <div class="profile">
                    <div class="porthole">
                      <img src="/avatar.svg" alt="" width="86" height="86" />
                    </div>
                    <div class="profile-text">
                      <p class="role-line">{cv.role}</p>
                      <p class="tagline">{cv.tagline}</p>
                    </div>
                  </div>
                  <p class="summary">{cv.summary}</p>
                  <ul class="stats">
                    <li><span class="stat-num">{years}</span><span class="stat-label">{t.statYears}</span></li>
                    <li><span class="stat-num">{cv.keyFigures.products}+</span><span class="stat-label">{t.statProducts}</span></li>
                    <li><span class="stat-num">{cv.keyFigures.sectors}</span><span class="stat-label">{t.statSectors}</span></li>
                  </ul>
                {:else if current.id === 'experience'}
                  <ol class="jobs">
                    {#each cv.experience as job (job.company + job.period)}
                      <li class="job">
                        <div class="job-head">
                          <h3 class="job-title">{job.title} <span class="job-at">@ {job.company}</span></h3>
                          <span class="period">{job.period}</span>
                        </div>
                        <p class="job-desc">{job.description}</p>
                        <ul class="chips" aria-label={t.technologies}>
                          {#each job.technologies as tech (tech)}<li class="chip">{tech}</li>{/each}
                        </ul>
                      </li>
                    {/each}
                    <li class="job job-roots">
                      <div class="job-head">
                        <h3 class="job-title">{t.earlyCareer} <span class="job-at">· {cv.earlyCareer.title}</span></h3>
                        <span class="period">{cv.earlyCareer.period}</span>
                      </div>
                      <p class="job-desc">{cv.earlyCareer.description}</p>
                      <ul class="chips" aria-label={t.technologies}>
                        {#each cv.earlyCareer.technologies as tech (tech)}<li class="chip">{tech}</li>{/each}
                      </ul>
                    </li>
                  </ol>
                {:else if current.id === 'skills'}
                  <div class="skill-grid">
                    {#each cv.skillGroups as group (group.label)}
                      <section class="module">
                        <h3 class="module-title">{group.label}</h3>
                        <ul class="chips">
                          {#each group.items as item (item)}<li class="chip">{item}</li>{/each}
                        </ul>
                      </section>
                    {/each}
                  </div>
                {:else if current.id === 'education'}
                  <div class="edu-grid">
                    <section class="module">
                      <h3 class="module-title">{t.degrees}</h3>
                      <ul class="rows">
                        {#each cv.education as ed (ed.title)}
                          <li>
                            <span class="row-main">{ed.title}</span>
                            <span class="row-sub">{ed.institute} · {ed.location}</span>
                            <span class="period">{ed.period}</span>
                          </li>
                        {/each}
                      </ul>
                    </section>
                    <section class="module">
                      <h3 class="module-title">{t.languages}</h3>
                      <ul class="rows">
                        {#each cv.languages as l (l.name)}
                          <li>
                            <span class="row-main">{l.name}</span>
                            <span class="row-sub">{l.level}{l.note ? ` · ${l.note}` : ''}</span>
                          </li>
                        {/each}
                      </ul>
                    </section>
                    <section class="module module-wide">
                      <h3 class="module-title">{t.conferences}</h3>
                      <ul class="confs">
                        {#each cv.conferences as c (c.name + c.year)}
                          <li><span class="period">{c.year}</span><span class="row-main">{c.name}</span><span class="row-sub">{c.location}</span></li>
                        {/each}
                      </ul>
                    </section>
                  </div>
                {:else}
                  <ul class="contacts">
                    <li>
                      <a class="gel contact flavor-blueberry" href="mailto:{cv.contact.email}">
                        <span class="c-key">{t.email}</span><span class="c-val">{cv.contact.email}</span>
                      </a>
                    </li>
                    <li>
                      <a class="gel contact flavor-lime" href={phoneHref}>
                        <span class="c-key">{t.phone}</span><span class="c-val">{cv.contact.phone}</span>
                      </a>
                    </li>
                    <li>
                      <a class="gel contact flavor-grape" href={cv.contact.linkedin} target="_blank" rel="noopener noreferrer">
                        <span class="c-key">{t.linkedin}</span><span class="c-val">linkedin.com/in/stefano-tedeschi-developer ↗</span>
                        <span class="sr-only">{shared.opensInNewTab}</span>
                      </a>
                    </li>
                    <li>
                      <a class="gel contact flavor-tangerine" href="/cv-stefano-tedeschi.pdf" download="Stefano_Tedeschi_CV.pdf">
                        <span class="c-key">PDF</span><span class="c-val">{t.downloadCv}</span>
                      </a>
                    </li>
                  </ul>
                  <p class="location"><span class="c-key-plain">{t.location}</span> {cv.contact.location}</p>
                {/if}
              </div>
            {/key}
            {#key active}
              <span class="scanline" aria-hidden="true"></span>
            {/key}
            <span class="glare" aria-hidden="true"></span>
          </div>

          <footer class="foot">
            <div class="leds" aria-hidden="true">
              <span class="led led-power"></span><span class="led-label">POWER</span>
              <span class="led led-net"></span><span class="led-label">NET</span>
            </div>
            <div class="ticker" role="marquee" aria-label={t.tickerLabel}>
              <div class="ticker-track">
                <span class="ticker-run">
                  {#each tickerItems as item, i (i)}<span class="tick-item">★ {item}</span>{/each}
                </span>
                <span class="ticker-run" aria-hidden="true">
                  {#each tickerItems as item, i (i)}<span class="tick-item">★ {item}</span>{/each}
                </span>
              </div>
            </div>
            <p class="best" lang="en">best viewed at 800×600</p>
          </footer>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .y2k {
    --bondi: #3aa9d6;
    --navy: #06243d;
    --ink: #0b2a44;
    --screen-fg: #e6f4ff;
    --screen-soft: #a9cde6;
    --cyan: #6fe3ff;
    position: absolute;
    inset: 0;
    overflow: hidden;
    font-family: Verdana, Tahoma, 'DejaVu Sans', sans-serif;
    font-size: 13px;
    color: var(--ink);
    background: linear-gradient(180deg, #8fd3fb 0%, #c4ebff 34%, #eefaff 60%, #d6f0fd 61%, #a9dcf6 100%);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .sky {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .horizon {
    position: absolute;
    left: -10%;
    right: -10%;
    top: 60%;
    height: 90px;
    transform: translateY(-50%);
    background: radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0) 70%);
  }
  .grid-floor {
    position: absolute;
    left: -50%;
    right: -50%;
    top: 60.5%;
    bottom: -30%;
    transform-origin: 50% 0;
    transform: perspective(420px) rotateX(62deg);
    background-image:
      repeating-linear-gradient(90deg, rgba(20, 130, 190, 0.45) 0 1.5px, transparent 1.5px 64px),
      repeating-linear-gradient(0deg, rgba(20, 130, 190, 0.45) 0 1.5px, transparent 1.5px 64px);
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 40%);
    mask-image: linear-gradient(180deg, transparent 0%, #000 40%);
    animation: gridRun 3.2s linear infinite;
  }
  @keyframes gridRun {
    from { background-position: 0 0, 0 0; }
    to { background-position: 0 0, 0 64px; }
  }

  .flare {
    position: absolute;
    left: 9%;
    top: 7%;
    width: 0;
    height: 0;
  }
  .flare span { position: absolute; border-radius: 50%; }
  .f-core {
    width: 260px;
    height: 260px;
    left: -130px;
    top: -130px;
    background: radial-gradient(circle, #fff 0 9%, rgba(255, 255, 255, 0.85) 14%, rgba(200, 240, 255, 0.35) 34%, rgba(200, 240, 255, 0) 66%);
  }
  .f-ring {
    width: 150px;
    height: 150px;
    left: -75px;
    top: -75px;
    border: 2px solid rgba(255, 255, 255, 0.55);
    box-shadow: 0 0 18px rgba(255, 255, 255, 0.5);
  }
  .f-dot { background: radial-gradient(circle, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0) 70%); }
  .d1 { width: 60px; height: 60px; left: 180px; top: 110px; background: radial-gradient(circle, rgba(255, 190, 120, 0.45), rgba(255, 190, 120, 0) 70%); }
  .d2 { width: 26px; height: 26px; left: 290px; top: 180px; }
  .d3 { width: 90px; height: 90px; left: 420px; top: 260px; background: radial-gradient(circle, rgba(150, 255, 200, 0.28), rgba(150, 255, 200, 0) 70%); }
  .f-hex {
    width: 44px;
    height: 44px;
    left: 340px;
    top: 212px;
    border-radius: 0 !important;
    clip-path: polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0 50%);
    background: rgba(160, 220, 255, 0.35);
  }

  .blob {
    position: absolute;
    border-radius: 50%;
    animation: floaty 9s ease-in-out infinite;
  }
  .b1 {
    width: 150px;
    height: 150px;
    right: 7%;
    top: 9%;
    background: radial-gradient(circle at 32% 28%, #fff 0 7%, rgba(255, 255, 255, 0.6) 12%, rgba(58, 169, 214, 0.75) 42%, rgba(8, 86, 140, 0.9) 100%);
    box-shadow: inset -10px -14px 30px rgba(0, 40, 80, 0.35), 0 20px 40px rgba(20, 90, 140, 0.25);
  }
  .b2 {
    width: 84px;
    height: 84px;
    left: 5%;
    top: 58%;
    animation-delay: -3s;
    background: radial-gradient(circle at 32% 28%, #fff 0 8%, rgba(255, 220, 180, 0.7) 14%, rgba(255, 138, 30, 0.85) 48%, rgba(190, 70, 0, 0.95) 100%);
    box-shadow: inset -6px -8px 18px rgba(120, 40, 0, 0.35), 0 14px 26px rgba(200, 90, 20, 0.25);
  }
  .b3 {
    width: 58px;
    height: 58px;
    right: 12%;
    bottom: 22%;
    animation-delay: -5s;
    background: radial-gradient(circle at 32% 28%, #fff 0 8%, rgba(230, 255, 190, 0.75) 14%, rgba(140, 214, 40, 0.85) 48%, rgba(60, 130, 10, 0.95) 100%);
    box-shadow: inset -5px -6px 14px rgba(30, 70, 0, 0.35);
  }
  .b4 {
    width: 110px;
    height: 110px;
    left: 14%;
    top: 20%;
    animation-delay: -7s;
    background: radial-gradient(circle at 32% 28%, #fff 0 10%, #e6edf2 22%, #9aabbb 52%, #3d4f61 86%, #8fa2b3 100%);
    box-shadow: inset -8px -10px 20px rgba(0, 20, 40, 0.3), 0 18px 30px rgba(30, 60, 90, 0.22);
  }
  @keyframes floaty {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -18px, 0); }
  }
  .chrome-ring {
    position: absolute;
    width: 300px;
    height: 300px;
    right: -60px;
    bottom: 8%;
    border-radius: 50%;
    border: 16px solid transparent;
    background: conic-gradient(from 20deg, #fff, #8ea2b5, #f4f8fb, #56697d, #eaf1f6, #9fb2c3, #fff) border-box;
    -webkit-mask: linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0) border-box;
    mask: linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0) border-box;
    transform: rotateX(68deg) rotateZ(-20deg);
    opacity: 0.85;
  }
  .spark {
    position: absolute;
    width: 22px;
    height: 22px;
    background: #fff;
    clip-path: polygon(50% 0, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0 50%, 40% 40%);
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.9));
    animation: twinkle 2.6s ease-in-out infinite;
  }
  .s1 { left: 22%; top: 12%; }
  .s2 { right: 21%; top: 34%; width: 16px; height: 16px; animation-delay: -0.8s; }
  .s3 { left: 8%; bottom: 30%; width: 14px; height: 14px; animation-delay: -1.6s; }
  .s4 { right: 30%; top: 6%; width: 18px; height: 18px; animation-delay: -2.1s; }
  @keyframes twinkle {
    0%, 100% { transform: scale(0.4) rotate(0deg); opacity: 0.2; }
    50% { transform: scale(1) rotate(45deg); opacity: 1; }
  }

  .chrome-dark {
    font-family: 'Michroma', 'Eurostile', 'Arial Black', sans-serif;
    font-weight: 400;
    color: #0e2c48;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .chrome-light {
    font-family: 'Michroma', 'Eurostile', 'Arial Black', sans-serif;
    font-weight: 400;
    color: #e6f1f8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  @supports ((-webkit-background-clip: text) or (background-clip: text)) {
    .chrome-dark {
      background: linear-gradient(180deg, #365a7b 0%, #16395a 40%, #041829 52%, #1d4466 70%, #365a7b 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.95));
    }
    .chrome-light {
      background: linear-gradient(180deg, #ffffff 0%, #e6f1f8 38%, #9fb6c8 50%, #d6e6f2 62%, #ffffff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 2px 0 rgba(0, 10, 25, 0.8));
    }
  }

  .splash {
    position: absolute;
    inset: 0 0 96px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    padding: 24px 16px;
  }
  .splash.leaving { animation: splashOut 0.56s cubic-bezier(0.6, 0, 0.8, 0.4) forwards; pointer-events: none; }
  @keyframes splashOut {
    to { opacity: 0; transform: scale(1.35); filter: blur(6px); }
  }
  .splash-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    max-width: 100%;
  }
  .splash-logo { filter: drop-shadow(0 16px 24px rgba(10, 60, 100, 0.3)); }
  .splash-name {
    margin: 4px 0 0;
    font-size: clamp(22px, 4vw, 40px);
    line-height: 1.2;
    animation: nameIn 0.9s cubic-bezier(0.2, 0.9, 0.3, 1) 0.55s both;
  }
  @keyframes nameIn {
    from { opacity: 0; letter-spacing: 0.6em; }
    to { opacity: 1; letter-spacing: 0.06em; }
  }
  .splash-role {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    color: #123a5a;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    animation: fadeUp 0.6s ease 0.95s both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }
  .loader {
    margin-top: 18px;
    width: min(320px, 80vw);
    animation: fadeUp 0.5s ease 0.7s both;
  }
  .trough {
    height: 16px;
    border-radius: 10px;
    padding: 3px;
    background: linear-gradient(180deg, #8c9cab, #eef3f7 60%, #ffffff);
    box-shadow: inset 0 2px 3px rgba(0, 20, 40, 0.45), 0 1px 0 #fff;
  }
  .fill {
    height: 100%;
    border-radius: 7px;
    background:
      repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.28) 0 6px, transparent 6px 12px),
      linear-gradient(180deg, #9ee0ff 0%, #2a9fd6 50%, #0d74ad 51%, #3fb4e6 100%);
    background-size: 17px 17px, 100% 100%;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    animation: stripes 0.6s linear infinite;
  }
  @keyframes stripes {
    to { background-position: 17px 0, 0 0; }
  }
  .load-label {
    margin: 8px 0 0;
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 16px;
    color: var(--ink);
    letter-spacing: 0.08em;
  }
  .splash-actions {
    margin-top: 14px;
    min-height: 96px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .skip {
    appearance: none;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(11, 42, 68, 0.3);
    border-radius: 12px;
    padding: 5px 12px;
    font: inherit;
    font-size: 13px;
    color: #0b3a5c;
    text-decoration: underline;
    cursor: pointer;
  }
  .skip:hover { background: rgba(255, 255, 255, 0.85); }

  .mono .orbit { stroke-linecap: round; }
  .mono.animated .o1 { stroke-dasharray: 100; animation: draw 1.1s cubic-bezier(0.3, 0.8, 0.3, 1) 0.1s both; }
  .mono.animated .o2 { animation: fadeIn 0.6s ease 0.6s both; }
  .mono.animated .disc { transform-origin: 100px 100px; animation: discIn 0.8s cubic-bezier(0.2, 1.4, 0.4, 1) both; }
  .mono.animated .letters { transform-origin: 100px 104px; animation: lettersIn 0.7s cubic-bezier(0.2, 1.2, 0.4, 1) 0.4s both; }
  .mono .glint { transform: skewX(-20deg); }
  .mono.animated .glint { animation: glint 2.8s ease-in-out 1.1s infinite; }
  @keyframes draw {
    from { stroke-dashoffset: 100; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes discIn {
    from { transform: scale(0.2) rotate(-90deg); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
  @keyframes lettersIn {
    from { transform: scale(2.2); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
  @keyframes glint {
    0% { transform: translateX(0) skewX(-20deg); }
    45%, 100% { transform: translateX(300px) skewX(-20deg); }
  }

  .gel {
    --g-hi: #6fb3ec;
    --g-base: #1560b3;
    --g-deep: #0a4c96;
    --g-rim: #07396f;
    position: relative;
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    border: 1px solid var(--g-rim);
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
    text-decoration: none;
    color: #fff;
    --gloss: 8px;
    background: linear-gradient(180deg, var(--g-hi) 0%, var(--g-base) 20%, var(--g-deep) 52%, var(--g-base) 100%);
    box-shadow: inset 0 -3px 5px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 3px 6px rgba(0, 30, 60, 0.35);
    overflow: hidden;
    isolation: isolate;
    transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
  }
  .gel::before {
    content: '';
    position: absolute;
    left: 10%;
    right: 10%;
    top: 1px;
    height: var(--gloss);
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.12));
    pointer-events: none;
    z-index: -1;
  }
  .gel::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: -40%;
    width: 30%;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
    transform: skewX(-20deg) translateX(0);
    opacity: 0;
    pointer-events: none;
  }
  .gel:hover::after {
    opacity: 1;
    transition: transform 0.6s ease;
    transform: skewX(-20deg) translateX(560%);
  }
  .gel:active { transform: translateY(1px) scale(0.985); filter: brightness(0.95); }
  .gel-label { text-shadow: 0 1px 1px rgba(0, 0, 0, 0.45); }
  .flavor-blueberry { --g-hi: #6fb3ec; --g-base: #1560b3; --g-deep: #0a4c96; --g-rim: #07396f; }
  .flavor-tangerine { --g-hi: #ffae6b; --g-base: #c2410c; --g-deep: #a33406; --g-rim: #7a2604; }
  .flavor-lime { --g-hi: #a6e05a; --g-base: #3b7a0c; --g-deep: #2f6508; --g-rim: #214a04; }
  .flavor-grape { --g-hi: #b98ae8; --g-base: #6b2aa6; --g-deep: #57208a; --g-rim: #3f1566; }
  .flavor-strawberry { --g-hi: #ff8fb5; --g-base: #bc1b55; --g-deep: #9c1446; --g-rim: #730e33; }

  .gel:focus-visible,
  .skip:focus-visible,
  .lcd:focus-visible,
  .sound:focus-visible {
    outline: 3px solid var(--navy);
    outline-offset: 3px;
  }

  .gel-enter {
    --gloss: 12px;
    padding: 14px 42px;
    font-family: 'Michroma', Verdana, sans-serif;
    font-size: 17px;
    letter-spacing: 0.12em;
    animation: enterIn 0.45s cubic-bezier(0.2, 1.4, 0.4, 1) both, enterPulse 2s ease-in-out 0.5s infinite;
  }
  @keyframes enterIn {
    from { opacity: 0; transform: scale(0.6); }
    to { opacity: 1; transform: none; }
  }
  @keyframes enterPulse {
    0%, 100% { box-shadow: inset 0 -3px 6px rgba(255, 255, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 3px 6px rgba(0, 30, 60, 0.35), 0 0 0 0 rgba(58, 169, 214, 0.55); }
    50% { box-shadow: inset 0 -3px 6px rgba(255, 255, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 3px 6px rgba(0, 30, 60, 0.35), 0 0 0 12px rgba(58, 169, 214, 0); }
  }

  .stage {
    position: absolute;
    inset: 20px 24px 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  .console {
    position: relative;
    width: min(960px, 100%);
    height: min(600px, 100%);
    box-sizing: border-box;
    padding: 14px;
    border-radius: 36px;
    background:
      linear-gradient(180deg, #ffffff 0%, #cfd8e0 14%, #f1f5f8 30%, #8f9cab 50%, #dbe3ea 66%, #a5b2be 86%, #f5f8fa 100%);
    box-shadow:
      0 0 0 1px #5f6f7f,
      inset 0 2px 1px #fff,
      inset 0 -2px 3px rgba(0, 0, 0, 0.3),
      0 34px 60px rgba(8, 50, 90, 0.35),
      0 8px 18px rgba(8, 50, 90, 0.25);
  }
  .console.boot { animation: powerOn 0.8s cubic-bezier(0.2, 0.9, 0.3, 1.15) both; }
  .console.boot .screen::before { animation: crtOn 0.9s ease-out 0.15s both; }
  @keyframes powerOn {
    from { opacity: 0; transform: scale(0.86) translateY(20px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes crtOn {
    0% { opacity: 1; transform: scaleY(0.01); }
    40% { opacity: 1; transform: scaleY(1); }
    100% { opacity: 0; transform: scaleY(1); }
  }
  .screw {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fff, #b9c4ce 45%, #5d6b79 100%);
    box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.8);
    z-index: 2;
  }
  .screw::after {
    content: '';
    position: absolute;
    left: 1px;
    right: 1px;
    top: 4px;
    height: 2px;
    background: #445362;
    transform: rotate(45deg);
    border-radius: 1px;
  }
  .sc1 { left: 2px; top: 25%; }
  .sc2 { left: 2px; bottom: 25%; }
  .sc3 { right: 2px; top: 25%; }
  .sc4 { right: 2px; bottom: 25%; }

  .shell {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    border-radius: 24px;
    padding: 12px;
    display: grid;
    grid-template-columns: 196px minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-areas: 'head head' 'side screen' 'foot foot';
    gap: 12px;
    background:
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0 1px, transparent 1px 5px),
      linear-gradient(180deg, rgba(128, 212, 242, 0.94) 0%, rgba(62, 172, 216, 0.94) 45%, rgba(40, 150, 200, 0.95) 100%);
    box-shadow: inset 0 0 0 1px rgba(0, 60, 100, 0.5), inset 0 3px 10px rgba(255, 255, 255, 0.55), inset 0 -8px 20px rgba(0, 50, 90, 0.35);
    overflow: hidden;
  }
  .shell::before {
    content: '';
    position: absolute;
    left: 3%;
    right: 3%;
    top: 3px;
    height: 46px;
    border-radius: 22px 22px 60% 60% / 22px 22px 100% 100%;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
    pointer-events: none;
    z-index: 0;
  }

  .head {
    grid-area: head;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 14px;
    border-radius: 16px;
    background:
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.35) 0 1px, rgba(0, 0, 0, 0.015) 1px 3px),
      linear-gradient(180deg, #fbfdfe 0%, #e7eef3 45%, #dbe4eb 55%, #f2f6f9 100%);
    box-shadow: inset 0 1px 0 #fff, inset 0 -1px 0 rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 40, 70, 0.3);
  }
  .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .brand-logo { flex: 0 0 auto; display: flex; }
  .brand-text { min-width: 0; }
  .brand-name { margin: 0; font-size: 20px; line-height: 1.25; white-space: nowrap; }
  .brand-role { margin: 2px 0 0; font-size: 13px; font-weight: bold; color: #24425f; letter-spacing: 0.14em; text-transform: uppercase; }

  .instruments { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
  .lcd {
    appearance: none;
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 10px;
    align-items: baseline;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #0a2234;
    background: linear-gradient(180deg, #0a2a3a, #103c50);
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.6), 0 1px 0 #fff;
    color: #9ff5d8;
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
  }
  .lcd-date, .lcd-time { font-variant-numeric: tabular-nums; }
  .lcd-flag { grid-column: 1 / -1; color: #7fe9ff; font-size: 13px; letter-spacing: 0.04em; }
  .lcd.bugged { color: #ffb4b4; }
  .lcd.bugged .lcd-flag { color: #ffd166; }
  .lcd.bugged .lcd-date { animation: glitch 0.18s steps(2, end) infinite; }
  @keyframes glitch {
    0% { transform: translateX(0); }
    50% { transform: translateX(2px); }
    100% { transform: translateX(-1px); }
  }
  .counter { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .odo {
    display: flex;
    gap: 2px;
    padding: 3px;
    border-radius: 6px;
    background: linear-gradient(180deg, #f7fafc, #9aa9b7 50%, #e3e9ee);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.35), 0 1px 0 #fff;
  }
  .digit {
    width: 13px;
    padding: 2px 0;
    text-align: center;
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 13px;
    color: #fff;
    border-radius: 3px;
    background: linear-gradient(180deg, #2a3e52 0%, #0d1c2b 50%, #000 51%, #1b2d40 100%);
  }
  .counter-label { font-size: 13px; color: #24425f; }
  .sound {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 12px;
    border-radius: 999px;
    border: 1px solid #6c7b8a;
    background: linear-gradient(180deg, #ffffff, #d5dee6 50%, #c3cfd9 51%, #eef3f7);
    box-shadow: inset 0 1px 0 #fff, 0 2px 3px rgba(0, 30, 60, 0.3);
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 13px;
    color: var(--ink);
    cursor: pointer;
  }
  .sound-led {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #fff, #8b99a6 60%, #56626e);
  }
  .sound.on .sound-led {
    background: radial-gradient(circle at 35% 30%, #fff, #4dff88 45%, #0a9a3c);
    box-shadow: 0 0 8px #4dff88;
  }

  .side {
    grid-area: side;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 0;
    gap: 12px;
  }
  .tabs { display: flex; flex-direction: column; gap: 10px; }
  .tab {
    width: 100%;
    padding: 9px 14px 9px 9px;
    font-family: 'Michroma', Verdana, sans-serif;
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
    border-color: rgba(6, 36, 61, 0.45);
    background: linear-gradient(180deg, #ffffff 0%, #eaf6fc 46%, #d6edf8 54%, #f3fafd 100%);
    box-shadow: inset 0 1px 0 #fff, inset 0 -2px 4px rgba(0, 60, 100, 0.12), 0 2px 4px rgba(0, 40, 70, 0.3);
  }
  .tab .gel-label { text-shadow: none; }
  .tab::before { opacity: 0.6; }
  .tab:hover { filter: brightness(1.03); transform: translateX(2px); }
  .tab.active {
    color: #fff;
    border-color: var(--g-rim);
    background: linear-gradient(180deg, var(--g-hi) 0%, var(--g-base) 20%, var(--g-deep) 52%, var(--g-base) 100%);
    box-shadow: inset 0 -3px 5px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 0 14px color-mix(in srgb, var(--g-base) 55%, transparent), 0 3px 6px rgba(0, 30, 60, 0.35);
    transform: translateX(6px);
  }
  .tab.active .gel-label { text-shadow: 0 1px 1px rgba(0, 0, 0, 0.45); }
  .tab-dot {
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 12px;
    line-height: 1;
    color: #fff;
    background: radial-gradient(circle at 35% 25%, var(--g-base) 0 25%, var(--g-deep) 70%);
    box-shadow: inset 0 2px 1px -1px rgba(255, 255, 255, 0.75), inset 0 -2px 3px rgba(0, 0, 0, 0.25), 0 1px 1px rgba(0, 0, 0, 0.3);
  }
  .tab.active .tab-dot {
    background: radial-gradient(circle at 35% 30%, #fff, #eef6fb 70%, #d7e6f0);
    color: var(--g-deep);
  }

  .cdrom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 6px 8px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.18);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 50, 90, 0.2);
  }
  .disc-cd {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background:
      radial-gradient(circle, #6fb8d8 0 9%, #eef4f8 10% 12%, rgba(255, 255, 255, 0) 13%),
      conic-gradient(from 0deg, #dfe8ef, #ffd9ef, #d4f6ff, #fff6c8, #e2d6ff, #cfffe6, #dfe8ef);
    -webkit-mask: radial-gradient(circle, transparent 0 8%, #000 8.5%);
    mask: radial-gradient(circle, transparent 0 8%, #000 8.5%);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8), 0 4px 10px rgba(0, 40, 70, 0.3);
    animation: spin 5s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .cd-label { font-family: 'Silkscreen', 'Courier New', monospace; font-size: 13px; color: var(--navy); }

  .screen {
    grid-area: screen;
    position: relative;
    z-index: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 18px;
    border: 3px solid transparent;
    background:
      radial-gradient(130% 90% at 50% 0%, #0f3a60 0%, #082541 55%, #04172b 100%) padding-box,
      linear-gradient(180deg, #f6f9fb, #7b8b9a 50%, #dfe6ec) border-box;
    box-shadow: inset 0 4px 16px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.6);
    overflow: hidden;
    color: var(--screen-fg);
  }
  .screen::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #eaffff;
    opacity: 0;
    pointer-events: none;
    z-index: 5;
  }
  .screen::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    background:
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.028) 0 1px, transparent 1px 3px),
      linear-gradient(rgba(111, 227, 255, 0.05) 1px, transparent 1px) 0 0 / 32px 32px,
      linear-gradient(90deg, rgba(111, 227, 255, 0.05) 1px, transparent 1px) 0 0 / 32px 32px;
  }
  .glare {
    position: absolute;
    right: -10%;
    top: -30%;
    width: 60%;
    height: 70%;
    background: linear-gradient(200deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0) 60%);
    transform: rotate(-12deg);
    pointer-events: none;
    z-index: 4;
  }
  .screen-bar {
    flex: 0 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid rgba(111, 227, 255, 0.25);
    background: linear-gradient(180deg, rgba(111, 227, 255, 0.12), rgba(111, 227, 255, 0.02));
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 13px;
    color: var(--cyan);
    position: relative;
    z-index: 2;
  }
  .panel {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 16px 20px 30px;
    position: relative;
    z-index: 2;
    -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 26px), transparent);
    mask-image: linear-gradient(180deg, #000 calc(100% - 26px), transparent);
    scrollbar-width: thin;
    scrollbar-color: #9fb6c8 rgba(111, 227, 255, 0.08);
  }
  .panel::-webkit-scrollbar { width: 12px; }
  .panel::-webkit-scrollbar-track { background: rgba(111, 227, 255, 0.08); border-radius: 6px; }
  .panel::-webkit-scrollbar-thumb {
    border-radius: 6px;
    border: 2px solid transparent;
    background: linear-gradient(90deg, #f6f9fb, #8a9aa9 50%, #dfe6ec) padding-box;
  }
  .panel:focus-visible { outline: 2px solid var(--cyan); outline-offset: -4px; border-radius: 12px; }
  .fx-zoom { animation: fxZoom 0.42s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .fx-wipe { animation: fxWipe 0.45s cubic-bezier(0.7, 0, 0.3, 1) both; }
  .fx-scan { animation: fxScan 0.45s cubic-bezier(0.5, 0, 0.3, 1) both; }
  @keyframes fxZoom {
    from { opacity: 0; transform: scale(1.12); filter: blur(4px) brightness(1.6); }
    to { opacity: 1; transform: none; filter: none; }
  }
  @keyframes fxWipe {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0 0 0); }
  }
  @keyframes fxScan {
    from { clip-path: inset(0 0 100% 0); filter: brightness(1.8); }
    to { clip-path: inset(0 0 0 0); filter: none; }
  }
  .scanline {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 3px;
    z-index: 6;
    background: linear-gradient(90deg, transparent, #bff6ff, #fff, #bff6ff, transparent);
    box-shadow: 0 0 16px 4px rgba(111, 227, 255, 0.6);
    opacity: 0;
    pointer-events: none;
    animation: sweep 0.5s ease-out both;
  }
  @keyframes sweep {
    0% { top: 0; opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  .panel-title {
    margin: 0 0 12px;
    font-size: 22px;
    line-height: 1.3;
  }
  .profile { display: flex; align-items: center; gap: 18px; margin-bottom: 12px; }
  .porthole {
    flex: 0 0 auto;
    width: 96px;
    height: 96px;
    border-radius: 50%;
    padding: 5px;
    background: conic-gradient(from 30deg, #fff, #8ea2b5, #f4f8fb, #56697d, #eaf1f6, #9fb2c3, #fff);
    box-shadow: 0 0 0 1px #0b2338, 0 6px 16px rgba(0, 0, 0, 0.5);
    position: relative;
  }
  .porthole img { width: 100%; height: 100%; border-radius: 50%; display: block; object-fit: cover; }
  .porthole::after {
    content: '';
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    background: radial-gradient(60% 40% at 38% 22%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 70%);
    pointer-events: none;
  }
  .role-line {
    margin: 0 0 6px;
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 14px;
    color: var(--cyan);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .tagline { margin: 0; font-size: 16px; line-height: 1.5; font-weight: bold; color: var(--screen-fg); }
  .summary { margin: 0 0 14px; font-size: 13px; line-height: 1.6; color: var(--screen-fg); }
  .stats { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .stats li {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 6px;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(111, 227, 255, 0.16), rgba(111, 227, 255, 0.04));
    border: 1px solid rgba(111, 227, 255, 0.35);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .stat-num { font-family: 'Michroma', Verdana, sans-serif; font-size: 22px; line-height: 1.2; color: #fff; text-shadow: 0 0 12px rgba(111, 227, 255, 0.7); }
  .stat-label { font-size: 13px; color: var(--screen-soft); text-align: center; }

  .jobs { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  .job {
    padding: 12px 14px;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(111, 227, 255, 0.28);
    border-left: 4px solid var(--cyan);
  }
  .job-roots { border-left-color: #ffae6b; }
  .job-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
  .job-title { margin: 0; font-size: 14px; line-height: 1.4; color: #fff; }
  .job-at { font-weight: normal; color: var(--screen-soft); }
  .period {
    flex: 0 0 auto;
    padding: 2px 8px;
    border-radius: 999px;
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 13px;
    white-space: nowrap;
    color: #04172b;
    background: linear-gradient(180deg, #d9f7ff, #7fe3ff 50%, #5fd3f5 51%, #a6ecff);
  }
  .job-desc { margin: 8px 0 10px; font-size: 13px; line-height: 1.6; color: var(--screen-fg); }
  .chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
  .chip {
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 13px;
    color: #dff7ff;
    background: linear-gradient(180deg, rgba(111, 227, 255, 0.24), rgba(111, 227, 255, 0.08));
    border: 1px solid rgba(111, 227, 255, 0.45);
  }

  .skill-grid, .edu-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .module {
    padding: 12px 14px;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(111, 227, 255, 0.28);
  }
  .module-wide { grid-column: 1 / -1; }
  .module-title {
    margin: 0 0 10px;
    font-family: 'Michroma', Verdana, sans-serif;
    font-weight: 400;
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cyan);
  }
  .rows { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
  .rows li { display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
  .row-main { font-weight: bold; font-size: 13px; color: #fff; }
  .row-sub { font-size: 13px; color: var(--screen-soft); line-height: 1.5; }
  .confs { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; }
  .confs li { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  .contacts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; max-width: 560px; }
  .contact {
    width: 100%;
    box-sizing: border-box;
    --gloss: 8px;
    padding: 10px 18px;
    justify-content: flex-start;
    gap: 14px;
  }
  .contact:focus-visible { outline-color: var(--cyan); }
  .c-key {
    flex: 0 0 auto;
    min-width: 76px;
    font-family: 'Silkscreen', 'Courier New', monospace;
    font-size: 13px;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.45);
  }
  .c-val { font-size: 14px; font-weight: bold; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.45); overflow-wrap: anywhere; }
  .location { margin: 16px 0 0; font-size: 14px; color: var(--screen-fg); }
  .c-key-plain { font-family: 'Silkscreen', 'Courier New', monospace; color: var(--cyan); margin-right: 8px; }

  .foot {
    grid-area: foot;
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .leds { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }
  .led { width: 10px; height: 10px; border-radius: 50%; box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.3); }
  .led-power { background: radial-gradient(circle at 35% 30%, #fff, #4dff88 45%, #0a9a3c); box-shadow: 0 0 8px #4dff88; }
  .led-net { background: radial-gradient(circle at 35% 30%, #fff, #ffb347 45%, #c25e00); box-shadow: 0 0 8px #ffb347; animation: blink 1.4s steps(2, jump-none) infinite; }
  @keyframes blink {
    50% { opacity: 0.35; box-shadow: none; }
  }
  .led-label { font-family: 'Silkscreen', 'Courier New', monospace; font-size: 13px; color: var(--navy); margin-right: 6px; }
  .ticker {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    padding: 6px 0;
    border-radius: 10px;
    background: linear-gradient(180deg, #03111c, #0a2232);
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.7), 0 1px 0 rgba(255, 255, 255, 0.6);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
  }
  .ticker-track { display: flex; width: max-content; animation: ticker 60s linear infinite; }
  .ticker:hover .ticker-track { animation-play-state: paused; }
  .ticker-run { display: flex; flex: 0 0 auto; }
  .tick-item {
    padding: 0 22px;
    white-space: nowrap;
    font-size: 13px;
    color: #7fe9ff;
  }
  @keyframes ticker {
    to { transform: translateX(-50%); }
  }
  .best { margin: 0; flex: 0 0 auto; font-size: 13px; font-style: italic; color: #021424; }

  @media (max-width: 959px) and (min-width: 760px) {
    .shell { grid-template-columns: 172px minmax(0, 1fr); }
    .instruments .counter { display: none; }
    .best { display: none; }
  }
  @media (max-height: 640px) and (min-width: 760px) {
    .cdrom { display: none; }
  }

  @media (max-width: 759px) {
    .y2k { overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; }
    .sky { position: fixed; }
    .splash { position: fixed; inset: 56px 0 110px 0; }
    .stage { position: relative; inset: auto; display: block; padding: 62px 10px 170px; }
    .console { width: 100%; height: auto; padding: 8px; border-radius: 26px; }
    .shell {
      height: auto;
      padding: 10px;
      border-radius: 20px;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto auto auto;
      grid-template-areas: 'head' 'side' 'screen' 'foot';
    }
    .head { flex-direction: column; align-items: stretch; gap: 10px; padding: 10px; }
    .brand-name { white-space: normal; font-size: 17px; }
    .instruments { justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .side { flex-direction: row; }
    .tabs {
      flex-direction: row;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 4px 2px 6px;
      margin: 0 -2px;
      gap: 8px;
      scroll-snap-type: x proximity;
    }
    .tabs::-webkit-scrollbar { display: none; }
    .tab { width: auto; flex: 0 0 auto; scroll-snap-align: center; }
    .tab:hover { transform: none; }
    .tab.active { transform: none; }
    .cdrom { display: none; }
    .screen { min-height: 0; }
    .panel { overflow: visible; padding: 14px; -webkit-mask-image: none; mask-image: none; }
    .panel-title { font-size: 19px; }
    .profile { flex-direction: column; align-items: flex-start; }
    .stats { grid-template-columns: minmax(0, 1fr); }
    .stats li { flex-direction: row; justify-content: flex-start; gap: 12px; }
    .job-head { flex-direction: column; gap: 6px; }
    .skill-grid, .edu-grid, .confs { grid-template-columns: minmax(0, 1fr); }
    .foot { flex-wrap: wrap; }
    .ticker { order: 3; flex-basis: 100%; }
    .best { margin-left: auto; }
    .contact { flex-direction: column; align-items: flex-start; gap: 2px; border-radius: 22px; padding: 12px 18px 10px; }
    .c-val { font-size: 13px; }
    .b2 { top: auto; bottom: 16%; left: -18px; }
    .b3 { bottom: 34%; }
  }

  @media (prefers-reduced-motion: reduce) {
    .grid-floor,
    .blob,
    .spark,
    .disc-cd,
    .led-net,
    .fill,
    .ticker-track,
    .lcd.bugged .lcd-date,
    .gel-enter,
    .mono.animated .glint { animation: none; }
    .fx-zoom, .fx-wipe, .fx-scan, .scanline, .console.boot, .console.boot .screen::before, .splash.leaving { animation: none; }
    .scanline { display: none; }
    .ticker-track { width: auto; }
    .ticker-run { flex-wrap: wrap; }
    .ticker-run[aria-hidden='true'] { display: none; }
    .tick-item { white-space: normal; padding: 2px 14px; }
    .ticker { -webkit-mask-image: none; mask-image: none; }
    .gel, .tab { transition: none; }
    .gel:hover::after { transition: none; opacity: 0; }
    .tab:hover { transform: none; }
  }
</style>
