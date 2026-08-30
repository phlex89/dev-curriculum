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
</script>

<div class="liquid-wrapper">
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
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;
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
</style>
