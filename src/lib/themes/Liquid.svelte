<script lang="ts">
  import { onMount } from 'svelte';
  import { getCvData, getUi } from '$lib/i18n';
  import { buildDisplacementMap, supportsBackdropLens } from './liquid/lens';

  const cvData = getCvData();
  const t = getUi().liquid;

  const LENS_SCALE = 28;
  const LENS_RADIUS = 30;
  const LENS_STRENGTH = 0.9;
  const LENS_MAP_W = 256;
  const LENS_MARGIN = 40;

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
  let wrapEl = $state<HTMLElement | undefined>();

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
    const host = wrapEl;
    if (!el || !host) return;
    const on = lensOn;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!collapsed) host.style.setProperty('--bars-h', `${height}px`);
      if (on) regenerateMap(width, height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<div class="liquid-wrapper wp-{wallpaper}" class:lens-on={lensOn && mapUrl !== ''} bind:this={wrapEl}>
  {#if mapUrl}
    <svg class="lens-defs" aria-hidden="true" focusable="false">
      <filter
        id="liquid-lens"
        filterUnits="userSpaceOnUse"
        x={-LENS_MARGIN}
        y={-LENS_MARGIN}
        width={lensW + LENS_MARGIN * 2}
        height={lensH + LENS_MARGIN * 2}
        color-interpolation-filters="sRGB"
      >
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
    <div class="screen screen--profile" role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" tabindex="0" hidden={active !== 'profile'}>
      <div class="hero-card glass-surface glass-surface--light">
        <div class="avatar-wrap">
          {#if avatarFailed}
            <div class="avatar-fallback">ST</div>
          {:else}
            <img class="avatar-img" src="/avatar.svg" alt={cvData.name} onerror={() => (avatarFailed = true)} />
          {/if}
        </div>
        <h1>{cvData.name}</h1>
        <p class="role">{cvData.role}</p>
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

      <section class="block glass-surface glass-surface--light">
        <h2 class="block-title">{t.profile}</h2>
        <p class="tagline">{cvData.tagline}</p>
        <p class="summary">{cvData.summary}</p>
      </section>
    </div>

    <div class="screen" role="tabpanel" id="panel-path" aria-labelledby="tab-path" tabindex="0" hidden={active !== 'path'}>
      <section class="block glass-surface glass-surface--light">
        <h2 class="block-title">{t.experience}</h2>
        <div class="path-list">
          {#each cvData.experience as exp}
            <article class="path-item">
              <div class="path-head">
                <h3>{exp.company}</h3>
                <span class="path-period">{exp.period}</span>
              </div>
              <div class="path-body">
                <p class="path-role">{exp.title}</p>
                <p class="path-desc">{exp.description}</p>
                <div class="chip-row">
                  {#each exp.technologies as tech}<span class="chip">{tech}</span>{/each}
                </div>
              </div>
            </article>
          {/each}
        </div>
      </section>

      <section class="block glass-surface glass-surface--light">
        <h2 class="block-title">{t.earlyCareer}</h2>
        <article class="path-item">
          <div class="path-head">
            <h3>{cvData.earlyCareer.title}</h3>
            <span class="path-period">{cvData.earlyCareer.period}</span>
          </div>
          <div class="path-body">
            <p class="path-desc">{cvData.earlyCareer.description}</p>
            <div class="chip-row">
              {#each cvData.earlyCareer.technologies as tech}<span class="chip">{tech}</span>{/each}
            </div>
          </div>
        </article>
      </section>
    </div>

    <div class="screen" role="tabpanel" id="panel-skills" aria-labelledby="tab-skills" tabindex="0" hidden={active !== 'skills'}>
      <section class="block glass-surface glass-surface--light">
        <h2 class="block-title">{t.skills}</h2>
        <div class="skill-groups">
          {#each cvData.skillGroups as group}
            <div class="skill-group">
              <span class="skill-group-name">{group.label}</span>
              <div class="chip-row">
                {#each group.items as item}<span class="chip">{item}</span>{/each}
              </div>
            </div>
          {/each}
        </div>
      </section>

      <section class="block glass-surface glass-surface--light">
        <h2 class="block-title">{t.languages}</h2>
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
    </div>

    <div class="screen" role="tabpanel" id="panel-more" aria-labelledby="tab-more" tabindex="0" hidden={active !== 'more'}>
      <section class="block glass-surface glass-surface--light">
        <h2 class="block-title">{t.education}</h2>
        <div class="row-list">
          {#each cvData.education as edu}
            <div class="row-item">
              <strong class="row-name">{edu.title}</strong>
              <span class="row-meta">{edu.institute} · {edu.period}</span>
            </div>
          {/each}
        </div>
      </section>

      <section class="block glass-surface glass-surface--light">
        <h2 class="block-title">{t.conferences}</h2>
        <div class="row-list">
          {#each cvData.conferences as conf}
            <div class="row-item">
              <strong class="row-name">{conf.name}</strong>
              <span class="row-meta">{conf.location} · {conf.year}</span>
            </div>
          {/each}
        </div>
      </section>
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

  .liquid-wrapper::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 19;
    background: var(--l-bg);
    clip-path: inset(0 0 calc(100% - 14px) 0);
    pointer-events: none;
  }

  .wp-aurora {
    --l-accent: #7aa2ff;
    --l-accent-soft: #d7e2ff;
    --l-bg:
      radial-gradient(60% 55% at 12% 18%, #3b2fd6 0%, transparent 60%),
      radial-gradient(55% 50% at 85% 12%, #c02fb8 0%, transparent 62%),
      radial-gradient(70% 60% at 60% 95%, #1a6be0 0%, transparent 65%),
      linear-gradient(160deg, #14103a 0%, #241650 55%, #0d1030 100%);
  }

  .wp-sunset {
    --l-accent: #ffb37a;
    --l-accent-soft: #ffe2cd;
    --l-bg:
      radial-gradient(58% 52% at 20% 88%, #ff6a3d 0%, transparent 62%),
      radial-gradient(52% 48% at 82% 20%, #ff3d8b 0%, transparent 60%),
      radial-gradient(65% 55% at 50% 45%, #6d3bd6 0%, transparent 68%),
      linear-gradient(155deg, #2a1038 0%, #4a1740 50%, #1b0d2c 100%);
  }

  .wp-deep {
    --l-accent: #5fe3d0;
    --l-accent-soft: #cdf6ef;
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

  .wallpaper-btn span {
    display: block;
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .wallpaper-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .wallpaper-btn:hover span {
    transform: rotate(180deg);
  }

  .wallpaper-btn:focus-visible {
    outline: 2px solid var(--l-accent);
    outline-offset: 3px;
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

  .glass-surface--light {
    background: rgba(6, 10, 22, 0.34);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
    backdrop-filter: blur(16px) saturate(150%);
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
    align-items: center;
    padding: 14px 20px 4px;
    text-align: center;
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
    font-size: 1.05rem;
    letter-spacing: -0.02em;
  }

  .what {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.62;
  }

  .tabbar-nav {
    width: min(430px, 100%);
    margin: 0 auto 12px;
    padding: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
    transform-origin: top;
    transition:
      transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.22s ease;
  }

  .bars.collapsed .tabbar-nav {
    transform: scaleY(0);
    opacity: 0;
    height: 0;
    margin: 0 auto;
    padding: 0;
    overflow: hidden;
    pointer-events: none;
    transition:
      transform 0.26s ease-in,
      opacity 0.18s ease,
      height 0s linear 0.26s,
      padding 0s linear 0.26s,
      margin 0s linear 0.26s;
  }

  .tabbar {
    position: relative;
    display: flex;
  }

  .tab-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 6px 4px 7px;
    background: none;
    border: none;
    border-radius: 999px;
    font: inherit;
    font-weight: 500;
    color: inherit;
    cursor: pointer;
    opacity: 0.72;
    transition: opacity 0.24s ease;
  }

  .tab-btn.active {
    opacity: 1;
    font-weight: 600;
  }

  .tab-btn:hover {
    opacity: 1;
  }

  .tab-btn:focus-visible {
    outline: 2px solid var(--l-accent);
    outline-offset: 2px;
  }

  .tab-icon {
    font-size: 1.05rem;
    transition: transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .tab-btn.active .tab-icon {
    transform: translateY(-1px) scale(1.08);
  }

  .tab-label {
    font-size: 0.68rem;
    letter-spacing: 0.01em;
  }

  .tab-pill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    width: calc(var(--pill-base, 0) * 1px);
    background: rgba(255, 255, 255, 0.22);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.3),
      0 4px 14px rgba(0, 0, 0, 0.18);
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
    padding: calc(12px + var(--bars-h, 128px) + 26px) 20px 130px;
  }

  .screen {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
  }

  .screen[hidden] {
    display: none;
  }

  .screen:not([hidden]) > * {
    animation: liquid-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .screen:not([hidden]) > *:nth-child(2) {
    animation-delay: 0.08s;
  }

  @keyframes liquid-rise {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.99);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  .block {
    padding: 26px 28px 28px;
  }

  .block-title {
    margin: 0 0 16px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    opacity: 0.62;
  }

  .hero-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 30px 28px;
  }

  .avatar-wrap {
    width: 104px;
    height: 104px;
    margin-bottom: 18px;
    padding: 3px;
    border-radius: 50%;
    background: linear-gradient(150deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.15) 55%, rgba(255, 255, 255, 0.5));
    box-shadow:
      0 12px 34px rgba(0, 0, 0, 0.38),
      0 0 0 1px rgba(255, 255, 255, 0.18);
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .avatar-wrap:hover {
    transform: scale(1.04) rotate(-2deg);
  }

  .avatar-img,
  .avatar-fallback {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    background: rgba(10, 14, 30, 0.55);
  }

  .hero-card h1 {
    margin: 0;
    font-size: clamp(1.85rem, 3.4vw, 2.5rem);
    font-weight: 600;
    letter-spacing: -0.035em;
    line-height: 1.04;
  }

  .role {
    margin: 8px 0 0;
    font-size: 0.98rem;
    font-weight: 500;
    letter-spacing: -0.005em;
    color: var(--l-accent-soft);
  }

  .location {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 14px 0 0;
    font-size: 0.76rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0.62;
  }

  .location .dot {
    font-size: 0.6rem;
  }

  .contact-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 22px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.16);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.32);
    border-radius: 999px;
    text-decoration: none;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: -0.005em;
    transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pill:hover {
    transform: translateY(-2px);
  }

  .pill:focus-visible {
    outline: 2px solid var(--l-accent);
    outline-offset: 3px;
  }

  .pill-icon {
    opacity: 0.7;
    font-weight: 500;
  }

  .tagline {
    max-width: 44ch;
    margin: 0;
    font-size: 1.16rem;
    font-weight: 500;
    letter-spacing: -0.018em;
    line-height: 1.42;
  }

  .summary {
    max-width: 70ch;
    margin: 18px 0 0;
    font-size: 0.94rem;
    font-weight: 400;
    line-height: 1.72;
    opacity: 0.88;
  }

  .path-list {
    display: flex;
    flex-direction: column;
    gap: 26px;
  }

  .path-item + .path-item {
    padding-top: 26px;
    border-top: 1px solid rgba(255, 255, 255, 0.13);
  }

  .path-head h3 {
    margin: 0;
    font-size: 1.14rem;
    font-weight: 600;
    letter-spacing: -0.025em;
  }

  .path-period {
    font-size: 0.76rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    opacity: 0.6;
    white-space: nowrap;
  }

  .path-role {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 600;
    letter-spacing: -0.005em;
    color: var(--l-accent-soft);
  }

  .path-desc {
    max-width: 68ch;
    margin: 10px 0 0;
    font-size: 0.9rem;
    line-height: 1.68;
    opacity: 0.84;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 14px;
  }

  .chip {
    padding: 4px 11px;
    background: rgba(255, 255, 255, 0.11);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.005em;
    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .chip:hover {
    transform: translateY(-2px);
  }

  .skill-groups {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .skill-group-name {
    display: block;
    margin-bottom: 4px;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: -0.015em;
  }

  .lang-list,
  .row-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .lang-item + .lang-item,
  .row-item + .row-item {
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.11);
  }

  .lang-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }

  .lang-name {
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: -0.015em;
  }

  .lang-level {
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--l-accent-soft);
    white-space: nowrap;
  }

  .lang-note {
    display: block;
    margin-top: 3px;
    font-size: 0.82rem;
    line-height: 1.5;
    opacity: 0.68;
  }

  .row-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .row-name {
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: -0.015em;
  }

  .row-meta {
    font-size: 0.82rem;
    letter-spacing: 0.01em;
    opacity: 0.66;
  }

  @media (min-width: 760px) {
    .path-item {
      display: grid;
      grid-template-columns: 172px minmax(0, 1fr);
      gap: 30px;
    }

    .path-head {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }

  @media (max-width: 759px) {
    .path-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 8px;
    }
  }

  @media (min-width: 900px) {
    .screen--profile {
      display: grid;
      grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
      align-items: start;
      align-content: center;
      min-height: 100%;
      gap: 22px;
    }
  }

  @media (max-width: 899px) {
    .screen--profile {
      justify-content: center;
      min-height: 100%;
    }
  }

  @media (max-width: 720px) {
    .wallpaper-btn {
      top: 14px;
      left: 14px;
      right: auto;
    }

    .identity {
      padding-left: 62px;
      padding-right: 62px;
    }

    .screen-scroll {
      padding-left: 14px;
      padding-right: 14px;
    }

    .block {
      padding: 22px 20px 24px;
    }

    .hero-card {
      padding: 24px 20px;
    }

    .tagline {
      font-size: 1.06rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .liquid-wrapper {
      transition: none;
    }

    .identity,
    .tabbar-nav,
    .tab-pill,
    .mini-tab,
    .tab-btn,
    .tab-icon,
    .pill,
    .chip,
    .avatar-wrap,
    .wallpaper-btn span {
      transition: none;
    }

    .screen:not([hidden]) > * {
      animation: none;
    }

    .avatar-wrap:hover,
    .pill:hover,
    .chip:hover,
    .wallpaper-btn:hover span {
      transform: none;
    }
  }
</style>
