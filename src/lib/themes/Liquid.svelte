<script lang="ts">
  import { getCvData, getUi } from '$lib/i18n';

  const cvData = getCvData();
  const t = getUi().liquid;

  type TabId = 'profile' | 'path' | 'skills' | 'more';

  const TABS: { id: TabId; icon: string; label: string }[] = [
    { id: 'profile', icon: '◍', label: t.tabs.profile },
    { id: 'path', icon: '⌁', label: t.tabs.path },
    { id: 'skills', icon: '◈', label: t.tabs.skills },
    { id: 'more', icon: '⋯', label: t.tabs.more }
  ];

  let active = $state<TabId>('profile');

  const reduced =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
</script>

<div class="liquid-wrapper wp-{wallpaper}">
  <button
    type="button"
    class="wallpaper-btn"
    onclick={cycleWallpaper}
    aria-label={t.changeWallpaper}
    title={t.currentWallpaper(t.wallpapers[wallpaper])}
  >
    <span aria-hidden="true">◐</span>
  </button>

  <header class="bars">
    <div class="identity">
      <span class="who">{cvData.name}</span>
      <span class="what">{cvData.role}</span>
    </div>
    <nav class="tabbar" role="tablist" aria-label={t.tabsNav}>
      {#each TABS as tab (tab.id)}
        <button
          type="button"
          class="tab-btn"
          class:active={active === tab.id}
          onclick={() => (active = tab.id)}
        >
          <span class="tab-icon" aria-hidden="true">{tab.icon}</span>
          <span class="tab-label">{tab.label}</span>
        </button>
      {/each}
    </nav>
  </header>

  <div class="screen-scroll">
    <section class="screen" role="tabpanel" hidden={active !== 'profile'}>
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
        <a class="pill" href={cvData.contact.linkedin} target="_blank" rel="noopener">
          <span class="pill-icon">in</span> LinkedIn
        </a>
        <a class="pill" href="mailto:{cvData.contact.email}">
          <span class="pill-icon">@</span> Email
        </a>
      </div>

      <h2 class="screen-title">{t.profile}</h2>
      <p class="summary">{cvData.summary}</p>
    </section>

    <section class="screen" role="tabpanel" hidden={active !== 'path'}>
      <h2 class="screen-title">{t.experience}</h2>
      <div class="path-list">
        {#each cvData.experience as exp}
          <article class="path-item">
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
      <article class="path-item">
        <div class="path-head">
          <h3>{cvData.earlyCareer.title}</h3>
          <span class="path-period">{cvData.earlyCareer.period}</span>
        </div>
        <p class="path-desc">{cvData.earlyCareer.description}</p>
        <div class="chip-row">
          {#each cvData.earlyCareer.technologies as tech}<span class="chip">{tech}</span>{/each}
        </div>
      </article>
    </section>

    <section class="screen" role="tabpanel" hidden={active !== 'skills'}>
      <h2 class="screen-title">{t.skills}</h2>
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

      <h2 class="screen-title">{t.languages}</h2>
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

    <section class="screen" role="tabpanel" hidden={active !== 'more'}>
      <h2 class="screen-title">{t.education}</h2>
      <div class="edu-list">
        {#each cvData.education as edu}
          <div class="edu-item">
            <strong>{edu.title}</strong>
            <span class="edu-meta">{edu.institute} · {edu.period}</span>
          </div>
        {/each}
      </div>

      <h2 class="screen-title">{t.conferences}</h2>
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
  }

  .bars {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid rgba(128, 128, 128, 0.3);
  }

  .identity {
    display: flex;
    flex-direction: column;
    padding: 16px 20px 8px;
  }

  .who {
    font-weight: 600;
    font-size: 1.1rem;
  }

  .what {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .tabbar {
    display: flex;
  }

  .tab-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 8px 4px 12px;
    background: none;
    border: none;
    font: inherit;
    cursor: pointer;
    opacity: 0.6;
  }

  .tab-btn.active {
    opacity: 1;
    font-weight: 600;
  }

  .tab-icon {
    font-size: 1.15rem;
  }

  .tab-label {
    font-size: 0.7rem;
  }

  .screen-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 24px 20px 130px;
  }

  .screen-title {
    margin: 28px 0 12px;
    font-size: 1rem;
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
    border: 1px solid rgba(128, 128, 128, 0.4);
    border-radius: 999px;
    text-decoration: none;
    color: inherit;
    font-size: 0.85rem;
  }

  .path-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
    border-radius: 999px;
    border: 1px solid rgba(128, 128, 128, 0.35);
    font-size: 0.75rem;
  }

  .skill-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
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
