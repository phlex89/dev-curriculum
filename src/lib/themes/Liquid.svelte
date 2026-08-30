<script lang="ts">
  import { onMount } from 'svelte';
  import { getCvData, getUi } from '$lib/i18n';
  import { buildDisplacementMap, supportsBackdropLens } from './liquid/lens';

  const cvData = getCvData();
  const t = getUi().liquid;

  const LENS_SCALE = 46;
  const LENS_RADIUS = 30;
  const LENS_STRENGTH = 0.9;
  const LENS_MAP_W = 256;

  type TabId = 'profile' | 'path' | 'skills' | 'more';

  const TABS: { id: TabId; icon: string; label: string }[] = [
    { id: 'profile', icon: '◍', label: t.tabs.profile },
    { id: 'path', icon: '⌁', label: t.tabs.path },
    { id: 'skills', icon: '◈', label: t.tabs.skills },
    { id: 'more', icon: '⋯', label: t.tabs.more }
  ];

  let active = $state<TabId>('profile');
  const activeTab = $derived(TABS.find((tab) => tab.id === active) ?? TABS[0]);

  const reduced =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let tabButtons = $state<HTMLButtonElement[]>([]);

  function onTabKey(e: KeyboardEvent, index: number) {
    let next = index;
    switch (e.key) {
      case 'ArrowRight':
        next = (index + 1) % TABS.length;
        break;
      case 'ArrowLeft':
        next = (index - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = TABS.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    active = TABS[next].id;
    tabButtons[next]?.focus();
  }

  let tabbar = $state<HTMLElement | undefined>();

  function positionPill(bar: HTMLElement, stretch: boolean) {
    const el = bar.querySelector<HTMLElement>(`#tab-${active}`);
    if (!el) return;
    const x = el.offsetLeft;
    const w = el.offsetWidth;
    const base = bar.querySelector<HTMLElement>('.tab-btn')?.offsetWidth || w;
    const prev = parseFloat(bar.style.getPropertyValue('--pill-x') || String(x));
    const dir = Math.sign(x - prev);
    bar.style.setProperty('--pill-x', String(x));
    bar.style.setProperty('--pill-base', String(base));
    bar.style.setProperty('--pill-scale', String(w / base));
    if (stretch && dir !== 0 && !reduced) {
      bar.style.setProperty('--pill-stretch', '1.12');
      return setTimeout(() => bar.style.setProperty('--pill-stretch', '1'), 180);
    }
  }

  $effect(() => {
    const bar = tabbar;
    if (!bar) return;
    active;
    const id = positionPill(bar, true);
    return () => clearTimeout(id);
  });

  $effect(() => {
    const bar = tabbar;
    if (!bar) return;
    const observer = new ResizeObserver(() => positionPill(bar, false));
    observer.observe(bar);
    return () => observer.disconnect();
  });

  let collapsed = $state(false);
  let scroller = $state<HTMLElement | undefined>();

  $effect(() => {
    const el = scroller;
    if (!el || reduced) return;
    let idle: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      collapsed = el.scrollTop > 40;
      clearTimeout(idle);
      idle = setTimeout(() => (collapsed = false), 600);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(idle);
      el.removeEventListener('scroll', onScroll);
    };
  });

  let avatarFailed = $state(false);

  const WALLPAPERS = ['aurora', 'sunset', 'deep'] as const;
  type WallpaperId = (typeof WALLPAPERS)[number];

  const readWallpaper = (): WallpaperId => {
    if (typeof localStorage === 'undefined') return 'aurora';
    try {
      const saved = localStorage.getItem('cv_liquid_wallpaper');
      return WALLPAPERS.includes(saved as WallpaperId) ? (saved as WallpaperId) : 'aurora';
    } catch {
      return 'aurora';
    }
  };

  let wallpaper = $state<WallpaperId>(readWallpaper());

  const cycleWallpaper = () => {
    wallpaper = WALLPAPERS[(WALLPAPERS.indexOf(wallpaper) + 1) % WALLPAPERS.length];
    try {
      localStorage.setItem('cv_liquid_wallpaper', wallpaper);
    } catch {
      /* storage blocked */
    }
  };

  let lensOn = $state(false);
  let mapUrl = $state('');
  let lensW = $state(0);
  let lensH = $state(0);
  let barsEl = $state<HTMLElement | undefined>();

  onMount(() => {
    lensOn = supportsBackdropLens({
      vendor: navigator.vendor ?? '',
      supports: (p, v) => CSS.supports(p, v)
    });
  });

  function regenerateMap(w: number, h: number) {
    if (!lensOn || w < 2 || h < 2) return;
    const mw = LENS_MAP_W;
    const mh = Math.max(2, Math.round((h / w) * mw));
    const canvas = document.createElement('canvas');
    canvas.width = mw;
    canvas.height = mh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = buildDisplacementMap({
      width: mw,
      height: mh,
      radius: (LENS_RADIUS / w) * mw,
      strength: LENS_STRENGTH
    });
    const image = ctx.createImageData(mw, mh);
    image.data.set(data);
    ctx.putImageData(image, 0, 0);
    lensW = w;
    lensH = h;
    mapUrl = canvas.toDataURL();
  }

  $effect(() => {
    const el = barsEl;
    if (!el || !lensOn) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      regenerateMap(width, height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<div class="liquid-wrapper wp-{wallpaper}" class:lens-on={lensOn && mapUrl !== ''}>
  {#if mapUrl}
    <svg class="lens-defs" aria-hidden="true" focusable="false">
      <filter id="liquid-lens" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feImage href={mapUrl} x="0" y="0" width={lensW} height={lensH} preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={LENS_SCALE * 1.06} xChannelSelector="R" yChannelSelector="G" result="dr" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={LENS_SCALE} xChannelSelector="R" yChannelSelector="G" result="dg" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale={LENS_SCALE * 0.94} xChannelSelector="R" yChannelSelector="G" result="db" />
        <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feBlend in="r" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b" mode="screen" />
      </filter>
    </svg>
  {/if}

  <button
    type="button"
    class="wallpaper-btn"
    onclick={cycleWallpaper}
    aria-label={t.currentWallpaper(t.wallpapers[wallpaper])}
    title={t.changeWallpaper}
  >
    <span aria-hidden="true">◐</span>
  </button>

  <header class="bars glass-surface" class:collapsed bind:this={barsEl}>
    <div class="identity">
      <span class="who">{cvData.name}</span>
      <span class="what">{cvData.role}</span>
    </div>
    <nav class="tabbar-nav" aria-label={t.tabsNav}>
      <div class="tabbar" role="tablist" bind:this={tabbar}>
        {#each TABS as tab, i (tab.id)}
          <button
            type="button"
            class="tab-btn"
            class:active={active === tab.id}
            role="tab"
            id="tab-{tab.id}"
            aria-selected={active === tab.id}
            aria-controls="panel-{tab.id}"
            tabindex={active === tab.id ? 0 : -1}
            bind:this={tabButtons[i]}
            onclick={() => (active = tab.id)}
            onkeydown={(e) => onTabKey(e, i)}
          >
            <span class="tab-icon" aria-hidden="true">{tab.icon}</span>
            <span class="tab-label">{tab.label}</span>
          </button>
        {/each}
        <span class="tab-pill" aria-hidden="true"></span>
      </div>
    </nav>
    <div class="mini-tab" aria-hidden="true">
      <span class="tab-icon">{activeTab.icon}</span>
      <span class="tab-label">{activeTab.label}</span>
    </div>
  </header>

  <div class="screen-scroll" bind:this={scroller}>
    <div class="screen" role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" tabindex="0" hidden={active !== 'profile'}>
      <div class="profile-hero glass-surface glass-surface--light">
        <div class="avatar-wrap">
          {#if avatarFailed}
            <div class="avatar-fallback">ST</div>
          {:else}
            <img class="avatar-img" src="/avatar.svg" alt={cvData.name} onerror={() => (avatarFailed = true)} />
          {/if}
        </div>
        <h1>{cvData.name}</h1>
        <p class="role">{cvData.role}</p>
        <p class="tagline">{cvData.tagline}</p>
        <p class="location"><span class="dot">◍</span> {cvData.contact.location}</p>
        <div class="contact-pills">
          <a class="pill glass-surface glass-surface--light" href={cvData.contact.linkedin} target="_blank" rel="noopener">
            <span class="pill-icon">in</span> LinkedIn
          </a>
          <a class="pill glass-surface glass-surface--light" href="mailto:{cvData.contact.email}">
            <span class="pill-icon">@</span> Email
          </a>
        </div>
      </div>

      <h2 class="screen-title">{t.profile}</h2>
      <div class="bio-card glass-surface glass-surface--light">
        <p class="summary">{cvData.summary}</p>
      </div>
    </div>

    <div class="screen" role="tabpanel" id="panel-path" aria-labelledby="tab-path" tabindex="0" hidden={active !== 'path'}>
      <h2 class="screen-title">{t.experience}</h2>
      <div class="path-list">
        {#each cvData.experience as exp}
          <article class="path-item glass-surface glass-surface--light">
            <div class="path-head">
              <h3>{exp.company}</h3>
              <span class="path-period">{exp.period}</span>
            </div>
            <p class="path-role">{exp.title}</p>
            <p class="path-desc">{exp.description}</p>
            <div class="chip-row">
              {#each exp.technologies as tech}<span class="chip">{tech}</span>{/each}
            </div>
          </article>
        {/each}
      </div>

      <h2 class="screen-title">{t.earlyCareer}</h2>
      <article class="path-item glass-surface glass-surface--light">
        <div class="path-head">
          <h3>{cvData.earlyCareer.title}</h3>
          <span class="path-period">{cvData.earlyCareer.period}</span>
        </div>
        <p class="path-desc">{cvData.earlyCareer.description}</p>
        <div class="chip-row">
          {#each cvData.earlyCareer.technologies as tech}<span class="chip">{tech}</span>{/each}
        </div>
      </article>
    </div>

    <div class="screen" role="tabpanel" id="panel-skills" aria-labelledby="tab-skills" tabindex="0" hidden={active !== 'skills'}>
      <h2 class="screen-title">{t.skills}</h2>
      <div class="skill-groups glass-surface glass-surface--light">
        {#each cvData.skillGroups as group}
          <div class="skill-group">
            <span class="skill-group-name">{group.label}</span>
            <div class="chip-row">
              {#each group.items as item}<span class="chip">{item}</span>{/each}
            </div>
          </div>
        {/each}
      </div>

      <h2 class="screen-title">{t.languages}</h2>
      <div class="lang-list glass-surface glass-surface--light">
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
    </div>

    <div class="screen" role="tabpanel" id="panel-more" aria-labelledby="tab-more" tabindex="0" hidden={active !== 'more'}>
      <h2 class="screen-title">{t.education}</h2>
      <div class="edu-list glass-surface glass-surface--light">
        {#each cvData.education as edu}
          <div class="edu-item">
            <strong>{edu.title}</strong>
            <span class="edu-meta">{edu.institute} · {edu.period}</span>
          </div>
        {/each}
      </div>

      <h2 class="screen-title">{t.conferences}</h2>
      <div class="talk-list glass-surface glass-surface--light">
        {#each cvData.conferences as conf}
          <div class="talk-item">
            <span class="talk-name">{conf.name}</span>
            <span class="talk-meta">{conf.location} · {conf.year}</span>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .liquid-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;
    background: var(--l-bg);
    color: #fff;
    font-family: -apple-system, 'SF Pro Display', system-ui, 'Segoe UI Variable', 'Segoe UI', sans-serif;
    letter-spacing: -0.01em;
    transition: background 0.6s ease;
  }

  .wp-aurora {
    --l-accent: #7aa2ff;
    --l-bg:
      radial-gradient(60% 55% at 12% 18%, #3b2fd6 0%, transparent 60%),
      radial-gradient(55% 50% at 85% 12%, #c02fb8 0%, transparent 62%),
      radial-gradient(70% 60% at 60% 95%, #1a6be0 0%, transparent 65%),
      linear-gradient(160deg, #14103a 0%, #241650 55%, #0d1030 100%);
  }

  .wp-sunset {
    --l-accent: #ffb37a;
    --l-bg:
      radial-gradient(58% 52% at 20% 88%, #ff6a3d 0%, transparent 62%),
      radial-gradient(52% 48% at 82% 20%, #ff3d8b 0%, transparent 60%),
      radial-gradient(65% 55% at 50% 45%, #6d3bd6 0%, transparent 68%),
      linear-gradient(155deg, #2a1038 0%, #4a1740 50%, #1b0d2c 100%);
  }

  .wp-deep {
    --l-accent: #5fe3d0;
    --l-bg:
      radial-gradient(60% 55% at 15% 25%, #0e7f8c 0%, transparent 62%),
      radial-gradient(55% 50% at 88% 78%, #1b3fb0 0%, transparent 60%),
      radial-gradient(70% 60% at 55% 10%, #12a58c 0%, transparent 65%),
      linear-gradient(165deg, #04141c 0%, #072634 55%, #03101a 100%);
  }

  .wallpaper-btn {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 50;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.15);
    color: var(--l-accent);
    font-size: 1.1rem;
    cursor: pointer;
  }

  .wallpaper-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .wallpaper-btn:focus-visible {
    outline: 2px solid var(--l-accent);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .liquid-wrapper {
      transition: none;
    }

    .identity,
    .tabbar-nav,
    .tab-pill,
    .mini-tab {
      transition: none;
    }
  }

  .glass-surface {
    position: relative;
    background: rgba(255, 255, 255, 0.12);
    -webkit-backdrop-filter: blur(18px) saturate(180%);
    backdrop-filter: blur(18px) saturate(180%);
    border-radius: 30px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.45),
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 18px 50px rgba(0, 0, 0, 0.35);
  }

  .glass-surface::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: conic-gradient(
      from 210deg,
      rgba(255, 255, 255, 0.7),
      rgba(120, 220, 255, 0.35) 25%,
      rgba(255, 255, 255, 0.15) 45%,
      rgba(255, 150, 230, 0.35) 70%,
      rgba(255, 255, 255, 0.7)
    );
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .glass-surface::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: inherit;
    padding: 5px;
    -webkit-backdrop-filter: blur(2px) brightness(1.08) saturate(1.4);
    backdrop-filter: blur(2px) brightness(1.08) saturate(1.4);
    transform: scale(1.015);
    box-shadow:
      inset 1px 0 6px rgba(90, 220, 255, 0.28),
      inset -1px 0 6px rgba(255, 120, 220, 0.28);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .pill.glass-surface::after {
    padding: 2px;
  }

  .glass-surface--light {
    background: rgba(255, 255, 255, 0.18);
    -webkit-backdrop-filter: blur(10px) saturate(160%);
    backdrop-filter: blur(10px) saturate(160%);
  }

  .lens-defs {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }

  .lens-on .bars.glass-surface {
    -webkit-backdrop-filter: url(#liquid-lens) blur(6px) saturate(180%);
    backdrop-filter: url(#liquid-lens) blur(6px) saturate(180%);
  }

  .lens-on .bars.glass-surface::after {
    display: none;
  }

  .bars {
    position: absolute;
    top: 12px;
    right: 12px;
    left: 12px;
    z-index: 20;
    display: flex;
    flex-direction: column;
  }

  .bars.collapsed {
    min-height: 52px;
    transition: min-height 0s linear 0.3s;
  }

  .identity {
    display: flex;
    flex-direction: column;
    padding: 16px 20px 8px;
    transform-origin: top;
    transition:
      transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.22s ease;
  }

  .bars.collapsed .identity {
    transform: scaleY(0);
    opacity: 0;
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
    overflow: hidden;
    pointer-events: none;
    transition:
      transform 0.26s ease-in,
      opacity 0.18s ease,
      height 0s linear 0.26s,
      padding 0s linear 0.26s;
  }

  .who {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .what {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .tabbar-nav {
    transform-origin: top;
    transition:
      transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.22s ease;
  }

  .bars.collapsed .tabbar-nav {
    transform: scaleY(0);
    opacity: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
    transition:
      transform 0.26s ease-in,
      opacity 0.18s ease,
      height 0s linear 0.26s;
  }

  .tabbar {
    position: relative;
    display: flex;
    padding: 0 14px;
  }

  .tab-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px 12px;
    background: none;
    border: none;
    border-radius: 999px;
    font: inherit;
    font-weight: 500;
    color: inherit;
    cursor: pointer;
    opacity: 0.78;
  }

  .tab-btn.active {
    opacity: 1;
    font-weight: 700;
  }

  .tab-btn:focus-visible {
    outline: 2px solid var(--l-accent);
    outline-offset: 2px;
  }

  .tab-icon {
    font-size: 1.15rem;
  }

  .tab-label {
    font-size: 0.7rem;
  }

  .tab-pill {
    position: absolute;
    top: 4px;
    bottom: 8px;
    left: 0;
    z-index: 0;
    width: calc(var(--pill-base, 0) * 1px);
    background: rgba(255, 255, 255, 0.24);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    transform-origin: left center;
    transform: translateX(calc(var(--pill-x, 0) * 1px)) scaleX(calc(var(--pill-scale, 1) * var(--pill-stretch, 1)));
    transition: transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .mini-tab {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: auto;
    width: fit-content;
    height: 36px;
    padding: 0 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.24);
    border: 1px solid rgba(255, 255, 255, 0.3);
    opacity: 0;
    transform: scale(0.7);
    pointer-events: none;
    transition:
      transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.22s ease 0.1s;
  }

  .bars.collapsed .mini-tab {
    opacity: 1;
    transform: scale(1);
  }

  .mini-tab .tab-icon {
    font-size: 1rem;
  }

  .mini-tab .tab-label {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .screen-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 154px 20px 130px;
  }

  .screen-title {
    margin: 28px 0 12px;
    font-size: 1rem;
  }

  .profile-hero,
  .bio-card {
    padding: 24px 22px;
  }

  .avatar-wrap {
    width: 96px;
    height: 96px;
    margin-bottom: 12px;
  }

  .avatar-img,
  .avatar-fallback {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    background: rgba(128, 128, 128, 0.25);
  }

  .role {
    opacity: 0.8;
  }

  .location .dot {
    opacity: 0.6;
  }

  .contact-pills {
    display: flex;
    gap: 10px;
    margin-top: 12px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(8, 10, 24, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 999px;
    text-decoration: none;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .path-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .path-item {
    padding: 18px 20px;
  }

  .path-head {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    align-items: baseline;
  }

  .path-period {
    font-size: 0.8rem;
    opacity: 0.7;
    white-space: nowrap;
  }

  .path-role {
    font-weight: 600;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  .chip {
    padding: 3px 10px;
    background: rgba(8, 10, 24, 0.4);
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.32);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .skill-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }

  .skill-group-name {
    display: block;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .lang-list,
  .edu-list,
  .talk-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
  }

  .lang-top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .lang-note {
    display: block;
    font-size: 0.8rem;
    opacity: 0.7;
  }

  .edu-item,
  .talk-item {
    display: flex;
    flex-direction: column;
  }

  .edu-meta,
  .talk-meta {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  @media (max-width: 720px) {
    .wallpaper-btn {
      top: 14px;
      left: 14px;
      right: auto;
    }

    .identity {
      padding-left: 60px;
    }
  }
</style>
