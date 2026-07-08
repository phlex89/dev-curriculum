<script lang="ts">
  import { onMount } from 'svelte';
  import { cvData } from '$lib/cv-data';
  import { reveal } from '$lib/actions/interactive';

  // Era 2014–2017: the "great flattening". Google Material Design + iOS 7 wipe out
  // skeuomorphic texture. Depth is no longer an imitation of the real world but a
  // formal system: shadows = elevation (z-index), motion = meaning. Signature cues
  // here: Roboto type scale, an indigo app bar, flat white cards lifted by crisp
  // elevation shadows, a sliding tab ink-bar, the touch ripple, and an accent FAB.
  // Roboto is self-hosted (latin subset) in fonts.css — the only Material webfont.

  const prefersReduced = () =>
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** The Material touch ripple — a circle that expands from the pointer and fades.
   *  Skipped (but the element stays fully clickable) under reduced-motion. */
  function ripple(node: HTMLElement) {
    function down(e: PointerEvent) {
      if (prefersReduced()) return;
      const r = node.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const ink = document.createElement('span');
      ink.className = 'ripple-ink';
      ink.style.width = ink.style.height = `${size}px`;
      ink.style.left = `${e.clientX - r.left - size / 2}px`;
      ink.style.top = `${e.clientY - r.top - size / 2}px`;
      node.appendChild(ink);
      ink.addEventListener('animationend', () => ink.remove());
    }
    node.addEventListener('pointerdown', down);
    return {
      destroy() {
        node.removeEventListener('pointerdown', down);
      }
    };
  }

  const initials = cvData.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Company monogram for the experience-card leading avatar.
  const monogram = (company: string) =>
    company
      .replace(/[^A-Za-zÀ-ÿ ]/g, ' ')
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  // A small palette of Material 500 hues so each experience reads as a distinct card.
  const AVATAR_HUES = ['#3f51b5', '#00897b', '#e64a19', '#5e35b1', '#0277bd', '#c2185b'];

  // Map a language proficiency string to a determinate LinearProgress fill.
  const langPct = (level: string): number => {
    const l = level.toLowerCase();
    if (l.includes('madre')) return 100;
    if (l.includes('c2')) return 95;
    if (l.includes('c1')) return 85;
    if (l.includes('b2')) return 70;
    if (l.includes('b1')) return 55;
    return 50;
  };

  let avatarFailed = $state(false);

  // ── Tabs: sliding ink-bar + scroll-spy ───────────────────────────────────────
  const SECTIONS = [
    { id: 'about', label: 'Profilo' },
    { id: 'experience', label: 'Esperienza' },
    { id: 'skills', label: 'Competenze' },
    { id: 'education', label: 'Studi' },
    { id: 'contact', label: 'Contatti' }
  ];

  const TAB_H = 48; // sticky tab-strip height, used as the scroll offset

  let root = $state<HTMLElement>();
  let scroller = $state<HTMLElement>();
  let activeId = $state('about');
  let ink = $state({ left: 0, width: 0 });
  let sectionEls: Record<string, HTMLElement> = {};
  let tabEls: Record<string, HTMLButtonElement> = {};

  function moveInk() {
    const el = tabEls[activeId];
    if (!el) return;
    ink = { left: el.offsetLeft, width: el.offsetWidth };
    // Scrollable tabs (mobile): keep the active tab — and thus the ink-bar — in view.
    const strip = el.parentElement;
    if (strip && strip.scrollWidth > strip.clientWidth) {
      const behavior: ScrollBehavior = prefersReduced() ? 'auto' : 'smooth';
      if (el.offsetLeft < strip.scrollLeft) {
        strip.scrollTo({ left: el.offsetLeft - 12, behavior });
      } else if (el.offsetLeft + el.offsetWidth > strip.scrollLeft + strip.clientWidth) {
        strip.scrollTo({ left: el.offsetLeft + el.offsetWidth - strip.clientWidth + 12, behavior });
      }
    }
  }

  function selectTab(id: string) {
    activeId = id;
    moveInk();
    const sec = sectionEls[id];
    const scr = scroller;
    if (sec && scr) {
      const top = sec.getBoundingClientRect().top - scr.getBoundingClientRect().top + scr.scrollTop - TAB_H;
      scr.scrollTo({ top, behavior: prefersReduced() ? 'auto' : 'smooth' });
    }
  }

  onMount(() => {
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => (sectionEls[el.dataset.section!] = el));
    root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((el) => (tabEls[el.dataset.tab!] = el));
    moveInk();

    // Scroll-spy: highlight the tab whose section sits just under the sticky strip.
    const atBottom = () => {
      const scr = scroller;
      return !!scr && scr.scrollTop + scr.clientHeight >= scr.scrollHeight - 4;
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (atBottom()) return; // the bottom handler owns the final tab
        for (const e of entries) {
          if (e.isIntersecting && e.target instanceof HTMLElement && e.target.dataset.section) {
            activeId = e.target.dataset.section;
            moveInk();
          }
        }
      },
      { root: scroller, rootMargin: `-${TAB_H + 8}px 0px -62% 0px`, threshold: 0 }
    );
    Object.values(sectionEls).forEach((el) => io.observe(el));

    // The last section can't always scroll high enough to reach the spy band, so
    // when the scroller bottoms out we force the final tab active (rAF-throttled).
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (atBottom()) {
          const last = SECTIONS[SECTIONS.length - 1].id;
          if (activeId !== last) {
            activeId = last;
            moveInk();
          }
        }
      });
    };
    scroller?.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => moveInk();
    window.addEventListener('resize', onResize);
    return () => {
      io.disconnect();
      scroller?.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  });

  // Inline Material icon set (24×24 filled paths).
  const ICON = {
    email:
      'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
    public:
      'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
    linkedin:
      'M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z',
    place:
      'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
    work: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
    school: 'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3 1 9l11 6 9-4.91V17h2V9L12 3z',
    check: 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    verified:
      'M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z',
    language:
      'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z',
    mic: 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z',
    person:
      'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
  };

  const contacts = [
    { label: 'LinkedIn', icon: ICON.linkedin, href: cvData.contact.linkedin, ext: true },
    { label: 'Email', icon: ICON.email, href: `mailto:${cvData.contact.email}`, ext: false },
    { label: 'Sito web', icon: ICON.public, href: cvData.contact.website, ext: true }
  ];
</script>

<div class="mat-wrapper" bind:this={root}>
  <div class="mat-scroll" bind:this={scroller}>
    <!-- ── Extended app bar (indigo, elevation 4dp) ───────────────────────── -->
    <header class="app-bar">
      <div class="app-bar-inner">
        <div class="avatar">
          {#if avatarFailed}
            <span class="avatar-initials">{initials}</span>
          {:else}
            <img src="/avatar.svg" alt={cvData.name} onerror={() => (avatarFailed = true)} />
          {/if}
        </div>
        <div class="app-bar-text">
          <h1 class="display">{cvData.name}</h1>
          <p class="subhead">{cvData.role}</p>
          <p class="tagline">{cvData.tagline}</p>
          <span class="place-chip">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.place} /></svg>
            {cvData.contact.location}
          </span>
        </div>
        <nav class="app-bar-actions" aria-label="Contatti rapidi">
          {#each contacts as c}
            <a
              class="icon-btn ripple"
              href={c.href}
              target={c.ext ? '_blank' : undefined}
              rel={c.ext ? 'noopener' : undefined}
              aria-label={c.label}
              title={c.label}
              use:ripple
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={c.icon} /></svg>
            </a>
          {/each}
        </nav>
      </div>
    </header>

    <!-- Sticky tab bar with sliding ink-bar (pinned to the top of the scroller).
         The outer bar is the full-bleed elevated surface; the inner strip holds the
         (horizontally scrollable on mobile) tabs. These navigate to in-page sections,
         so it's a nav landmark with aria-current, not a tab/tabpanel widget. -->
    <div class="tab-bar">
      <nav class="tab-strip" aria-label="Sezioni del curriculum">
        {#each SECTIONS as s}
          <button
            class="tab ripple"
            class:active={activeId === s.id}
            aria-current={activeId === s.id ? 'true' : undefined}
            data-tab={s.id}
            onclick={() => selectTab(s.id)}
            use:ripple
          >
            {s.label}
          </button>
        {/each}
        <span class="tab-ink" style="transform: translateX({ink.left}px); width: {ink.width}px"></span>
      </nav>
    </div>

    <!-- ── Content surface (#fafafa) with elevated cards ──────────────────── -->
    <main class="mat-content">
      <!-- Profilo -->
      <section id="about" data-section="about" class="card" use:reveal={{ delay: 0 }}>
        <h2 class="card-head"><span class="head-rule"></span>Profilo</h2>
        <p class="body-text">{cvData.summary}</p>
      </section>

      <!-- Esperienza -->
      <section id="experience" data-section="experience" class="block">
        <h2 class="section-title">Esperienza</h2>
        <div class="exp-list">
          {#each cvData.experience as exp, i}
            <article class="card exp-card" use:reveal={{ delay: Math.min(i * 60, 240) }}>
              <div class="exp-top">
                <span class="company-avatar" style="background: {AVATAR_HUES[i % AVATAR_HUES.length]}">
                  {monogram(exp.company)}
                </span>
                <div class="exp-head">
                  <h3 class="title">{exp.title}</h3>
                  <p class="company">{exp.company}</p>
                  <p class="meta">{exp.location}{#if exp.sector} · {exp.sector}{/if}</p>
                </div>
                <span class="period">{exp.period}</span>
              </div>
              <p class="body-text">{exp.description}</p>
              <ul class="highlights">
                {#each exp.highlights as h}
                  <li>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.check} /></svg>
                    <span>{h}</span>
                  </li>
                {/each}
              </ul>
              <div class="chips">
                {#each exp.technologies as t}<span class="chip">{t}</span>{/each}
              </div>
            </article>
          {/each}

          <article class="card exp-card early" use:reveal={{ delay: 120 }}>
            <div class="exp-top">
              <span class="company-avatar" style="background: {AVATAR_HUES[5]}">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.work} /></svg>
              </span>
              <div class="exp-head">
                <h3 class="title">{cvData.earlyCareer.title}</h3>
                <p class="company">Le origini</p>
              </div>
              <span class="period">{cvData.earlyCareer.period}</span>
            </div>
            <p class="body-text">{cvData.earlyCareer.description}</p>
            <ul class="highlights">
              {#each cvData.earlyCareer.highlights as h}
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.check} /></svg>
                  <span>{h}</span>
                </li>
              {/each}
            </ul>
            <div class="chips">
              {#each cvData.earlyCareer.technologies as t}<span class="chip">{t}</span>{/each}
            </div>
          </article>
        </div>
      </section>

      <!-- Competenze -->
      <section id="skills" data-section="skills" class="card" use:reveal={{ delay: 0 }}>
        <h2 class="card-head"><span class="head-rule"></span>Competenze</h2>
        <div class="skill-groups">
          {#each cvData.skillGroups as group}
            <div class="skill-group">
              <span class="group-label">{group.label}</span>
              <div class="chips">
                {#each group.items as item}<span class="chip tonal">{item}</span>{/each}
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Studi: istruzione + lingue + conferenze -->
      <section id="education" data-section="education" class="block">
        <h2 class="section-title">Studi &amp; competenze trasversali</h2>
        <div class="two-col">
          <article class="card" use:reveal={{ delay: 0 }}>
            <h2 class="card-head"><svg class="head-ico" viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.school} /></svg>Istruzione</h2>
            {#each cvData.education as edu}
              <div class="list-item">
                <strong>{edu.title}</strong>
                <span class="meta">{edu.institute} · {edu.location} · {edu.period}</span>
              </div>
            {/each}
          </article>

          <article class="card" use:reveal={{ delay: 80 }}>
            <h2 class="card-head"><svg class="head-ico" viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.language} /></svg>Lingue</h2>
            {#each cvData.languages as lang}
              <div class="lang-row">
                <div class="lang-top">
                  <span class="lang-name">{lang.name}</span>
                  <span class="meta">{lang.level}</span>
                </div>
                <div class="progress" role="progressbar" aria-valuenow={langPct(lang.level)} aria-valuemin="0" aria-valuemax="100" aria-label={lang.name}>
                  <span class="progress-fill" style="width: {langPct(lang.level)}%"></span>
                </div>
              </div>
            {/each}
            <h3 class="sub-head">Conferenze</h3>
            <ul class="conf-list">
              {#each cvData.conferences as conf}
                <li>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.mic} /></svg>
                  <span>{conf.name}<span class="meta"> · {conf.location} {conf.year}</span></span>
                </li>
              {/each}
            </ul>
          </article>
        </div>
      </section>

      <!-- Contatti -->
      <section id="contact" data-section="contact" class="card" use:reveal={{ delay: 0 }}>
        <h2 class="card-head"><span class="head-rule"></span>Contatti</h2>
        <div class="contact-grid">
          {#each contacts as c}
            <a
              class="contact-btn ripple"
              href={c.href}
              target={c.ext ? '_blank' : undefined}
              rel={c.ext ? 'noopener' : undefined}
              use:ripple
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={c.icon} /></svg>
              <span>{c.label}</span>
            </a>
          {/each}
          <a class="contact-btn ripple" href="tel:{cvData.contact.phone.replace(/\s+/g, '')}" use:ripple>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.person} /></svg>
            <span>{cvData.contact.phone}</span>
          </a>
        </div>
      </section>

      <footer class="mat-footer">{cvData.name} · {cvData.role}</footer>
    </main>
  </div>

  <!-- Floating Action Button (accent, 6dp → 12dp on hover) — primary action: write me. -->
  <a class="fab ripple" href="mailto:{cvData.contact.email}" aria-label="Scrivimi una email" title="Scrivimi" use:ripple>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICON.email} /></svg>
  </a>
</div>

<style>
  .mat-wrapper {
    --primary: #3f51b5;
    --primary-dark: #303f9f;
    --primary-light: #c5cae9;
    --accent: #ff4081;
    --accent-dark: #f50057;
    --bg: #fafafa;
    --surface: #ffffff;
    --on-primary: #ffffff;
    --text: rgba(0, 0, 0, 0.87);
    --text-2: rgba(0, 0, 0, 0.6);
    --text-3: rgba(0, 0, 0, 0.6);
    --divider: rgba(0, 0, 0, 0.12);
    /* Material elevation shadows (dp) */
    --elev-2: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    --elev-4: 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12);
    --elev-6: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12);
    --elev-8: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
    --elev-12: 0 7px 8px -4px rgba(0, 0, 0, 0.2), 0 12px 17px 2px rgba(0, 0, 0, 0.14), 0 5px 22px 4px rgba(0, 0, 0, 0.12);

    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  .mat-scroll {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ── App bar ──────────────────────────────────────────────────────────────── */
  .app-bar {
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: var(--on-primary);
    position: relative;
    z-index: 5;
  }
  .app-bar-inner {
    max-width: 920px;
    margin: 0 auto;
    padding: 28px 24px 22px;
    display: flex;
    align-items: center;
    gap: 22px;
  }
  .avatar {
    flex: 0 0 auto;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.18);
    box-shadow: var(--elev-4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .avatar-initials {
    font-size: 2rem;
    font-weight: 500;
    color: #fff;
  }
  .app-bar-text {
    flex: 1 1 auto;
    min-width: 0;
  }
  .display {
    margin: 0;
    font-size: 2rem;
    font-weight: 500;
    letter-spacing: 0.2px;
    line-height: 1.1;
  }
  .subhead {
    margin: 4px 0 0;
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.92);
  }
  .tagline {
    margin: 8px 0 0;
    font-size: 0.875rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.78);
    max-width: 560px;
    line-height: 1.45;
  }
  .place-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 12px;
    padding: 4px 12px 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    font-size: 0.78rem;
    font-weight: 500;
  }
  .place-chip svg {
    width: 16px;
    height: 16px;
    fill: rgba(255, 255, 255, 0.9);
  }
  .app-bar-actions {
    flex: 0 0 auto;
    display: flex;
    gap: 4px;
    align-self: flex-start;
  }
  .icon-btn {
    position: relative;
    overflow: hidden;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #fff;
    transition: background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .icon-btn:hover {
    background: rgba(255, 255, 255, 0.14);
  }
  .icon-btn svg {
    width: 22px;
    height: 22px;
    fill: #fff;
  }

  /* ── Sticky tab bar with sliding ink-bar ────────────────────────────────────── */
  /* Outer bar: full-bleed elevated surface that pins to the top of the scroller. */
  .tab-bar {
    position: sticky;
    top: 0;
    z-index: 6;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.22);
  }
  /* Inner strip: centered, and horizontally scrollable only when the tabs overflow
     (mobile). Kept separate from the full-bleed bar so its overflow never breaks
     the bar's centering/elevation. */
  .tab-strip {
    position: relative;
    max-width: 920px;
    margin: 0 auto;
    display: flex;
    align-items: stretch;
    height: 48px;
    padding: 0 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tab-strip::-webkit-scrollbar {
    display: none;
  }
  .tab {
    position: relative;
    overflow: hidden;
    flex: 0 0 auto;
    border: none;
    background: none;
    color: rgba(255, 255, 255, 0.74);
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0 18px;
    cursor: pointer;
    transition: color 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .tab:hover {
    color: rgba(255, 255, 255, 0.92);
  }
  .tab.active {
    color: #fff;
  }
  .tab:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.7);
    outline-offset: -3px;
  }
  .tab-ink {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 3px;
    background: var(--accent);
    border-radius: 3px 3px 0 0;
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
  }

  /* ── Content surface ────────────────────────────────────────────────────────── */
  .mat-content {
    max-width: 920px;
    margin: 0 auto;
    padding: 24px 24px 120px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .block {
    display: flex;
    flex-direction: column;
    gap: 16px;
    scroll-margin-top: 56px;
  }
  .section-title {
    margin: 8px 4px 0;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--primary);
  }

  /* ── Cards (flat surface lifted by elevation) ───────────────────────────────── */
  .card {
    background: var(--surface);
    border-radius: 8px;
    padding: 24px 26px;
    box-shadow: var(--elev-2);
    scroll-margin-top: 56px;
    transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card:hover {
    box-shadow: var(--elev-8);
    transform: translateY(-2px);
  }
  .card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 14px;
    font-size: 1.3rem;
    font-weight: 500;
    color: var(--text);
  }
  .head-rule {
    width: 4px;
    height: 22px;
    border-radius: 2px;
    background: var(--accent);
  }
  .head-ico {
    width: 24px;
    height: 24px;
    fill: var(--primary);
  }
  .sub-head {
    margin: 22px 0 12px;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-2);
  }
  .body-text {
    margin: 0;
    font-size: 0.94rem;
    line-height: 1.62;
    color: var(--text-2);
  }

  /* ── Experience cards ───────────────────────────────────────────────────────── */
  .exp-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .exp-top {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 12px;
  }
  .company-avatar {
    flex: 0 0 auto;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    box-shadow: var(--elev-2);
  }
  .company-avatar svg {
    width: 24px;
    height: 24px;
    fill: #fff;
  }
  .exp-head {
    flex: 1 1 auto;
    min-width: 0;
  }
  .title {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 500;
    color: var(--text);
    line-height: 1.25;
  }
  .company {
    margin: 2px 0 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--primary);
  }
  .meta {
    font-size: 0.8rem;
    color: var(--text-3);
    font-weight: 400;
  }
  .exp-head .meta {
    display: block;
    margin-top: 2px;
  }
  .period {
    flex: 0 0 auto;
    font-size: 0.72rem;
    font-weight: 500;
    color: var(--text-2);
    background: rgba(0, 0, 0, 0.06);
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .highlights {
    list-style: none;
    margin: 14px 0 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 9px;
  }
  .highlights li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--text-2);
  }
  .highlights svg {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    margin-top: 2px;
    fill: var(--accent);
  }
  .early {
    opacity: 0.92;
  }

  /* ── Chips ──────────────────────────────────────────────────────────────────── */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-2);
    background: rgba(0, 0, 0, 0.06);
    padding: 6px 12px;
    border-radius: 999px;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .chip:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  .chip.tonal {
    color: var(--primary-dark);
    background: var(--primary-light);
  }
  .chip.tonal:hover {
    background: #b3bae0;
  }
  /* ── Skills ─────────────────────────────────────────────────────────────────── */
  .skill-groups {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .group-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--text-3);
    margin-bottom: 10px;
  }

  /* ── Two-column (studies / languages) ───────────────────────────────────────── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: start;
  }
  .list-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 0;
    border-bottom: 1px solid var(--divider);
  }
  .list-item:last-of-type {
    border-bottom: none;
  }
  .list-item strong {
    font-size: 0.94rem;
    font-weight: 500;
    color: var(--text);
  }

  /* Languages — determinate LinearProgress */
  .lang-row {
    margin-bottom: 16px;
  }
  .lang-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 7px;
  }
  .lang-name {
    font-size: 0.92rem;
    font-weight: 500;
    color: var(--text);
  }
  .progress {
    height: 4px;
    border-radius: 2px;
    background: var(--primary-light);
    overflow: hidden;
  }
  .progress-fill {
    display: block;
    height: 100%;
    border-radius: 2px;
    background: var(--primary);
  }

  .conf-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 11px;
  }
  .conf-list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.88rem;
    color: var(--text);
  }
  .conf-list svg {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    margin-top: 1px;
    fill: var(--primary);
  }

  /* ── Contacts ───────────────────────────────────────────────────────────────── */
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .contact-btn {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 8px;
    text-decoration: none;
    color: var(--primary-dark);
    background: var(--primary-light);
    font-size: 0.9rem;
    font-weight: 500;
    transition: box-shadow 0.2s ease, background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .contact-btn:hover {
    background: #b3bae0;
    box-shadow: var(--elev-2);
  }
  .contact-btn svg {
    width: 22px;
    height: 22px;
    fill: var(--primary);
  }

  .mat-footer {
    margin-top: 12px;
    text-align: center;
    font-size: 0.76rem;
    color: var(--text-3);
  }

  /* ── FAB ────────────────────────────────────────────────────────────────────── */
  .fab {
    position: fixed;
    right: 24px;
    bottom: 88px;
    z-index: 9000;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
    color: #fff;
    box-shadow: var(--elev-6);
    transition: box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .fab:hover {
    background: var(--accent-dark);
    box-shadow: var(--elev-12);
    transform: scale(1.05);
  }
  .fab:active {
    transform: scale(0.97);
  }
  .fab:focus-visible {
    outline: 3px solid rgba(255, 64, 129, 0.4);
    outline-offset: 3px;
  }
  .fab svg {
    width: 26px;
    height: 26px;
    fill: #fff;
  }

  /* ── Ripple ink (appended by the ripple action) ─────────────────────────────── */
  :global(.mat-wrapper .ripple-ink) {
    position: absolute;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.28;
    transform: scale(0);
    pointer-events: none;
    animation: rippleExpand 0.56s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  @keyframes rippleExpand {
    to {
      transform: scale(1);
      opacity: 0;
    }
  }

  /* ── Responsive ─────────────────────────────────────────────────────────────── */
  @media (max-width: 760px) {
    .app-bar-inner {
      flex-direction: column;
      text-align: center;
      gap: 14px;
      padding-top: 24px;
    }
    .app-bar-actions {
      align-self: center;
    }
    .tagline {
      margin-left: auto;
      margin-right: auto;
    }
    .place-chip {
      margin-left: auto;
      margin-right: auto;
    }
    .two-col {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 520px) {
    .mat-content {
      padding: 16px 14px 120px;
    }
    .card {
      padding: 20px 18px;
    }
    .exp-top {
      flex-wrap: wrap;
    }
    .period {
      order: 3;
    }
    .contact-grid {
      grid-template-columns: 1fr;
    }
    .fab {
      right: 16px;
      bottom: 84px;
    }
  }

  /* ── Reduced motion: keep elevation, drop the movement ──────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .card,
    .fab,
    .tab-ink,
    .contact-btn {
      transition: none;
    }
    .card:hover {
      transform: none;
    }
    .fab:hover {
      transform: none;
    }
  }
</style>
