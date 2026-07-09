<script lang="ts">
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { draggable } from '$lib/actions/draggable';
  import { getCvData, getUi } from '$lib/i18n';
  import XpIcon from './winxp/XpIcon.svelte';

  const cvData = getCvData();
  const t = getUi().winxp;

  type WindowContent = 'about' | 'experiences' | 'skills' | 'contact' | 'education' | 'error' | 'clippy';

  interface WindowState {
    id: string;
    title: string;
    content: WindowContent;
    isOpen: boolean;
    minimized: boolean;
    maximized: boolean;
    zIndex: number;
    x: number;
    y: number;
    icon: string;
  }

  // Scattered start positions so each folder lands in its own spot on the desktop
  // (not a tidy diagonal cascade). Kept within a safe envelope — x ≤ ~560, y ≤ ~180 —
  // so a 450px-wide window stays mostly on screen even on smaller desktops.
  let windows = $state<WindowState[]>([
    { id: 'about', title: 'About Me', content: 'about', isOpen: false, minimized: false, maximized: false, zIndex: 10, x: 80, y: 56, icon: 'doc' },
    { id: 'skills', title: 'Skills', content: 'skills', isOpen: false, minimized: false, maximized: false, zIndex: 10, x: 470, y: 44, icon: 'gear' },
    { id: 'exp', title: t.expLabel, content: 'experiences', isOpen: false, minimized: false, maximized: false, zIndex: 10, x: 250, y: 168, icon: 'folder' },
    { id: 'edu', title: t.eduLabel, content: 'education', isOpen: false, minimized: false, maximized: false, zIndex: 10, x: 560, y: 138, icon: 'cap' },
    { id: 'contact', title: t.contactLabel, content: 'contact', isOpen: false, minimized: false, maximized: false, zIndex: 10, x: 360, y: 92, icon: 'contacts' },
    { id: 'error', title: t.errorTitle, content: 'error', isOpen: false, minimized: false, maximized: false, zIndex: 100, x: 330, y: 176, icon: '' }
  ]);

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Window open / close / minimize / restore animation (scale + fade toward the taskbar)
  function windowPop(_node: HTMLElement, { duration = 190 } = {}) {
    if (prefersReduced()) return { duration: 0 };
    return {
      duration,
      easing: cubicOut,
      css: (t: number) => `transform: scale(${0.8 + 0.2 * t}) translateY(${(1 - t) * 24}px); opacity: ${t};`
    };
  }

  let startMenuOpen = $state(false);
  let topZIndex = $state(10);
  let bsodActive = $state(false);
  let rebooting = $state(false);
  let bsodTimeout: ReturnType<typeof setTimeout>;
  let rebootTimeout: ReturnType<typeof setTimeout>;
  let clickCount = $state(0);
  let selectedIcon = $state<string | null>(null);

  // On phones the desktop metaphor breaks down: windows open maximised and the
  // free drag is disabled so nothing can be lost off-screen.
  let isMobile = $state(false);

  // Single click selects a desktop icon (real Windows behaviour); double click opens.
  function selectIcon(e: MouseEvent, id: string) {
    e.stopPropagation();
    selectedIcon = id;
  }

  // Keep a freshly-opened window fully inside the viewport. On mid-size screens
  // (e.g. a Galaxy Fold unfolded, wider than the 600px mobile breakpoint but
  // narrower than a desktop) the scattered start coords would otherwise push a
  // 450px window off the right/bottom edge.
  function clampToViewport(win: WindowState) {
    if (typeof window === 'undefined') return;
    const margin = 8;
    const winW = 450; // matches .window width
    const taskbar = 30; // reserved bottom bar
    const maxX = Math.max(margin, window.innerWidth - winW - margin);
    const maxY = Math.max(margin, window.innerHeight - taskbar - 80); // keep the titlebar above the taskbar
    win.x = Math.min(Math.max(margin, win.x), maxX);
    win.y = Math.min(Math.max(margin, win.y), maxY);
  }

  function openWindow(id: string) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.isOpen = true;
      win.minimized = false;
      if (!isMobile) clampToViewport(win);
      bringToFront(id);
    }
    startMenuOpen = false;
  }

  function closeWindow(id: string) {
    const win = windows.find(w => w.id === id);
    if (win) {
      win.isOpen = false;
      win.minimized = false;
      win.maximized = false;
    }
  }

  function minimizeWindow(id: string) {
    const win = windows.find(w => w.id === id);
    if (win) win.minimized = true;
  }

  function toggleMaximize(id: string) {
    const win = windows.find(w => w.id === id);
    if (win) win.maximized = !win.maximized;
    bringToFront(id);
  }

  function bringToFront(id: string) {
    topZIndex++;
    const win = windows.find(w => w.id === id);
    if (win) win.zIndex = topZIndex;
  }

  // Clicking the taskbar item: restore if minimized, otherwise minimize if it's already on top, else bring to front
  function taskbarClick(id: string) {
    const win = windows.find(w => w.id === id);
    if (!win) return;
    if (win.minimized) {
      win.minimized = false;
      bringToFront(id);
    } else if (win.zIndex === topZIndex) {
      win.minimized = true;
    } else {
      bringToFront(id);
    }
  }

  function toggleStartMenu() {
    startMenuOpen = !startMenuOpen;
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape') return;
    if (startMenuOpen) {
      startMenuOpen = false;
      return;
    }
    const openWindows = windows.filter(w => w.isOpen && !w.minimized);
    if (openWindows.length === 0) return;
    const topWin = openWindows.reduce((a, b) => (b.zIndex > a.zIndex ? b : a));
    closeWindow(topWin.id);
  }

  function handleDesktopClick() {
    clickCount++;
    if (clickCount > 8) {
      triggerBSOD();
    }
    startMenuOpen = false;
    selectedIcon = null;
  }

  // Crash → fake reboot (XP boot screen) → back to the desktop: closes the
  // narrative loop instead of the BSOD just vanishing.
  function triggerBSOD() {
    bsodActive = true;
    clickCount = 0;
    if (bsodTimeout) clearTimeout(bsodTimeout);
    if (rebootTimeout) clearTimeout(rebootTimeout);
    bsodTimeout = setTimeout(() => {
      bsodActive = false;
      rebooting = true;
      rebootTimeout = setTimeout(() => {
        rebooting = false;
      }, 3200);
    }, 2800);
  }

  let timeStr = $state('');
  onMount(() => {
    const updateTime = () => {
      const now = new Date();
      timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const mq = window.matchMedia('(max-width: 600px)');
    const updateMobile = () => (isMobile = mq.matches);
    updateMobile();
    mq.addEventListener('change', updateMobile);

    // A shrinking viewport can leave an already-open window hanging off-screen;
    // pull any free (non-maximised) windows back inside.
    const onResize = () => {
      if (isMobile) return; // maximised on mobile, nothing to clamp
      for (const w of windows) if (w.isOpen && !w.maximized) clampToViewport(w);
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearInterval(interval);
      mq.removeEventListener('change', updateMobile);
      window.removeEventListener('resize', onResize);
      if (bsodTimeout) clearTimeout(bsodTimeout);
      if (rebootTimeout) clearTimeout(rebootTimeout);
    };
  });
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

{#if bsodActive}
  <div class="bsod">
    <div class="bsod-text">
      A problem has been detected and Windows has been shut down to prevent damage to your computer.<br><br>
      DRIVER_IRQL_NOT_LESS_OR_EQUAL<br><br>
      If this is the first time you've seen this Stop error screen, restart your computer. If this screen appears again, follow these steps:<br><br>
      Check to make sure any new hardware or software is properly installed.<br>
      If this is a new installation, ask your hardware or software manufacturer for any Windows updates you might need.<br><br>
      Technical information:<br>
      *** STOP: 0x000000D1 (0x00000000, 0x00000002, 0x00000000, 0xF73120AE)<br>
      *** GV3.SYS - Address F73120AE base at F7312000, DateStamp 3dd991eb<br><br>
      Beginning dump of physical memory<br>
      Physical memory dump complete.<br>
      Contact your system administrator or technical support group for further assistance.
    </div>
  </div>
{:else if rebooting}
  <!-- Classic XP boot splash with the animated marquee loader -->
  <div class="xp-boot">
    <div class="boot-logo">
      <div class="boot-flag">
        <span class="flag-q tl"></span><span class="flag-q tr"></span>
        <span class="flag-q bl"></span><span class="flag-q br"></span>
      </div>
      <div class="boot-title">
        <span class="boot-brand">Microsoft</span>
        <span class="boot-product">Windows<span class="boot-xp">xp</span></span>
      </div>
    </div>
    <div class="boot-loader" aria-label={t.startingUp}>
      <div class="boot-blocks"><i></i><i></i><i></i></div>
    </div>
    <div class="boot-copy">Copyright © Stefano Tedeschi</div>
  </div>
{:else}
  <div class="xp-desktop" onclick={handleDesktopClick}>
    <div class="desktop-icons">
      <button type="button" class="desktop-icon" class:selected={selectedIcon === 'about'} onclick={(e) => { selectIcon(e, 'about'); openWindow('about'); }} ondblclick={(e) => { e.stopPropagation(); openWindow('about'); }}>
        <div class="icon-emoji"><XpIcon name="doc" size={40} /></div>
        <span>{t.cvResources}</span>
      </button>
      <button type="button" class="desktop-icon" class:selected={selectedIcon === 'skills'} onclick={(e) => { selectIcon(e, 'skills'); openWindow('skills'); }} ondblclick={(e) => { e.stopPropagation(); openWindow('skills'); }}>
        <div class="icon-emoji"><XpIcon name="gear" size={40} /></div>
        <span>Skills</span>
      </button>
      <button type="button" class="desktop-icon" class:selected={selectedIcon === 'exp'} onclick={(e) => { selectIcon(e, 'exp'); openWindow('exp'); }} ondblclick={(e) => { e.stopPropagation(); openWindow('exp'); }}>
        <div class="icon-emoji"><XpIcon name="folder" size={40} /></div>
        <span>{t.expLabel}</span>
      </button>
      <button type="button" class="desktop-icon" class:selected={selectedIcon === 'edu'} onclick={(e) => { selectIcon(e, 'edu'); openWindow('edu'); }} ondblclick={(e) => { e.stopPropagation(); openWindow('edu'); }}>
        <div class="icon-emoji"><XpIcon name="cap" size={40} /></div>
        <span>{t.eduLabel}</span>
      </button>
      <button type="button" class="desktop-icon" class:selected={selectedIcon === 'contact'} onclick={(e) => { selectIcon(e, 'contact'); openWindow('contact'); }} ondblclick={(e) => { e.stopPropagation(); openWindow('contact'); }}>
        <div class="icon-emoji"><XpIcon name="contacts" size={40} /></div>
        <span>{t.contactLabel}</span>
      </button>
      <button type="button" class="desktop-icon" class:selected={selectedIcon === 'trash'} onclick={(e) => { selectIcon(e, 'trash'); triggerBSOD(); }} ondblclick={(e) => { e.stopPropagation(); triggerBSOD(); }}>
        <div class="icon-emoji"><XpIcon name="trash" size={40} /></div>
        <span>{t.trash}</span>
      </button>
    </div>

    <!-- Finestre -->
    {#each windows as win (win.id)}
      {#if win.isOpen && !win.minimized}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="window"
          class:maximized={win.maximized || isMobile}
          style={win.maximized || isMobile ? `z-index: ${win.zIndex};` : `top: ${win.y}px; left: ${win.x}px; z-index: ${win.zIndex};`}
          use:draggable={{ handle: '.titlebar', disabled: isMobile, onMove: (x, y) => { win.x = x; win.y = y; } }}
          onmousedown={() => bringToFront(win.id)}
          transition:windowPop
        >
          <div class="titlebar" ondblclick={() => toggleMaximize(win.id)}>
            <div class="title-text">{#if win.icon}<span class="win-icon"><XpIcon name={win.icon} size={16} /></span>{/if} {win.title}</div>
            <div class="title-buttons">
              <button class="win-btn min-btn" aria-label={t.minimize} title={t.minimize} onclick={() => minimizeWindow(win.id)}>
                <svg viewBox="0 0 10 10" width="10" height="10"><rect x="1" y="7" width="8" height="2" fill="currentColor"/></svg>
              </button>
              {#if !isMobile}
                <button class="win-btn max-btn" aria-label={t.maximize} title={t.maximize} onclick={() => toggleMaximize(win.id)}>
                  {#if win.maximized}
                    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="1.5" width="6" height="6"/><rect x="1.5" y="3.5" width="6" height="6" fill="#3268d6"/></svg>
                  {:else}
                    <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="2" width="9" height="8"/><line x1="1.5" y1="3.5" x2="10.5" y2="3.5" stroke-width="2"/></svg>
                  {/if}
                </button>
              {/if}
              <button class="win-btn close-btn" aria-label={t.close} title={t.close} onclick={() => closeWindow(win.id)}>
                <svg viewBox="0 0 10 10" width="10" height="10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="1.5" y1="1.5" x2="8.5" y2="8.5"/><line x1="8.5" y1="1.5" x2="1.5" y2="8.5"/></svg>
              </button>
            </div>
          </div>
          <div class="window-content">
            {#if win.content === 'about'}
              <div class="about-content">
                <h2>{cvData.name}</h2>
                <p><strong>Role:</strong> {cvData.role}</p>
                <p><strong>Location:</strong> {cvData.contact.location}</p>
                <p class="tagline">{cvData.tagline}</p>
                <p>{cvData.summary}</p>
                <h3 class="sub">{t.languages}</h3>
                <ul class="lang-list">
                  {#each cvData.languages as lang}
                    <li><strong>{lang.name}:</strong> {lang.level}{lang.note ? ` — ${lang.note}` : ''}</li>
                  {/each}
                </ul>
              </div>
            {:else if win.content === 'experiences'}
              <div class="exp-content">
                {#each cvData.experience as exp}
                  <div class="exp-item">
                    <h3>{exp.title}</h3>
                    <p class="company-name">{exp.company} | {exp.period}</p>
                    <p>{exp.description}</p>
                    <ul class="highlights">
                      {#each exp.highlights as hl}
                        <li>{hl}</li>
                      {/each}
                    </ul>
                    <p class="tech"><strong>Tech:</strong> {exp.technologies.join(', ')}</p>
                  </div>
                {/each}
                <div class="exp-item early">
                  <h3>{cvData.earlyCareer.title}</h3>
                  <p class="company-name">{cvData.earlyCareer.period}</p>
                  <p>{cvData.earlyCareer.description}</p>
                  <ul class="highlights">
                    {#each cvData.earlyCareer.highlights as hl}
                      <li>{hl}</li>
                    {/each}
                  </ul>
                  <p class="tech"><strong>Tech:</strong> {cvData.earlyCareer.technologies.join(', ')}</p>
                </div>
              </div>
            {:else if win.content === 'skills'}
              <div class="skills-content">
                {#each cvData.skillGroups as group}
                  <div class="skill-group">
                    <h3 class="sub">{group.label}</h3>
                    <ul class="skills-list">
                      {#each group.items as skill}
                        <li>{skill}</li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              </div>
            {:else if win.content === 'education'}
              <div class="edu-content">
                {#each cvData.education as edu}
                  <div class="edu-item">
                    <h3>{edu.title}</h3>
                    <p>{edu.institute}</p>
                    <p class="period">{edu.period}</p>
                  </div>
                {/each}
                <h3 class="sub">{t.conferences}</h3>
                <ul class="plain-list">
                  {#each cvData.conferences as conf}
                    <li>{conf.name} — {conf.location} <span class="muted">({conf.year})</span></li>
                  {/each}
                </ul>
              </div>
            {:else if win.content === 'contact'}
              <div class="contact-content">
                <p><strong>Email:</strong> <a href="mailto:{cvData.contact.email}">{cvData.contact.email}</a></p>
                <p><strong>Phone:</strong> {cvData.contact.phone}</p>
                <p><strong>LinkedIn:</strong> <a href="{cvData.contact.linkedin}" target="_blank">{t.linkedinProfile}</a></p>
                <p><strong>Website:</strong> <a href="{cvData.contact.website}" target="_blank">{cvData.contact.website}</a></p>
              </div>
            {:else if win.content === 'error'}
              <div class="error-content">
                <div class="error-icon">❌</div>
                <div class="error-text">{t.errorMessage}</div>
                <button class="xp-button" onclick={() => closeWindow('error')}>OK</button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    {/each}

    <!-- Clippy (Easter Egg) -->
    <button
      type="button"
      class="clippy-container"
      onclick={(e) => { e.stopPropagation(); window.location.href = `mailto:${cvData.contact.email}?subject=${encodeURIComponent(t.mailSubject)}`; }}
      title={t.mailMe}
      aria-label={t.mailMe}
    >
      <div class="clippy-balloon">
        {t.clippyText}<br><strong>{t.clippyCta}</strong> ✉️
      </div>
      <svg class="clippy-svg" viewBox="0 0 140 190" xmlns="http://www.w3.org/2000/svg" aria-label="Clippy">
        <defs>
          <linearGradient id="clip-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fdfdff" />
            <stop offset="35%" stop-color="#c9d2dc" />
            <stop offset="60%" stop-color="#8794a4" />
            <stop offset="100%" stop-color="#d7dee7" />
          </linearGradient>
          <filter id="clip-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="3" stdDeviation="2.5" flood-color="#000" flood-opacity="0.35" />
          </filter>
        </defs>

        <g filter="url(#clip-shadow)" fill="none" stroke="url(#clip-metal)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round">
          <!-- outer paperclip wire -->
          <path d="M44 178 L44 58 C44 30 64 16 86 16 C108 16 120 32 120 56 L120 150 C120 168 106 178 90 178 C72 178 62 166 62 148 L62 70 C62 58 70 52 80 52 C90 52 96 60 96 70 L96 132" />
        </g>
        <!-- highlight pass -->
        <g fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-opacity="0.5">
          <path d="M48 168 L48 60 C48 36 64 22 84 22" />
        </g>

        <!-- Eyebrows -->
        <path class="clippy-brow" d="M56 24 Q66 14 78 20" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round" />
        <path class="clippy-brow" d="M88 22 Q100 14 110 22" fill="none" stroke="#2b2b2b" stroke-width="4" stroke-linecap="round" />

        <!-- Eyes -->
        <g class="clippy-eyes">
          <ellipse cx="68" cy="40" rx="13" ry="16" fill="#fff" stroke="#2b2b2b" stroke-width="3" />
          <ellipse cx="98" cy="40" rx="13" ry="16" fill="#fff" stroke="#2b2b2b" stroke-width="3" />
          <circle cx="71" cy="43" r="6" fill="#1a1a1a" />
          <circle cx="101" cy="43" r="6" fill="#1a1a1a" />
          <circle cx="73" cy="40" r="2" fill="#fff" />
          <circle cx="103" cy="40" r="2" fill="#fff" />
        </g>
      </svg>
    </button>

    <!-- Taskbar -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="taskbar" onclick={(e) => e.stopPropagation()}>
      <button class="start-btn" onclick={toggleStartMenu}>
        <span class="start-logo"><XpIcon name="start" size={18} /></span>
        <span>start</span>
      </button>

      <div class="taskbar-windows">
        {#each windows.filter(w => w.isOpen) as win}
          <button type="button" class="taskbar-item {win.zIndex === topZIndex && !win.minimized ? 'active' : ''}" onclick={() => taskbarClick(win.id)}>
            {#if win.icon}<span class="tb-icon"><XpIcon name={win.icon} size={16} /></span>{/if} {win.title}
          </button>
        {/each}
      </div>

      <div class="tray">
        <span class="time">{timeStr}</span>
      </div>

      <!-- Start Menu -->
      {#if startMenuOpen}
        <div class="start-menu">
          <div class="start-header">
            <div class="avatar"><img src="/avatar.svg" alt={cvData.name} /></div>
            <span class="username">{cvData.name}</span>
          </div>
          <div class="start-body">
            <div class="left-panel">
              <button type="button" class="prog-item" onclick={() => openWindow('about')}><span class="icon"><XpIcon name="doc" size={22} /></span> About Me</button>
              <button type="button" class="prog-item" onclick={() => openWindow('skills')}><span class="icon"><XpIcon name="gear" size={22} /></span> Skills</button>
              <button type="button" class="prog-item" onclick={() => openWindow('exp')}><span class="icon"><XpIcon name="folder" size={22} /></span> {t.expLabel}</button>
              <button type="button" class="prog-item" onclick={() => openWindow('edu')}><span class="icon"><XpIcon name="cap" size={22} /></span> {t.eduLabel}</button>
              <button type="button" class="prog-item" onclick={() => openWindow('contact')}><span class="icon"><XpIcon name="contacts" size={22} /></span> {t.contactLabel}</button>
              <div class="separator"></div>
              <button type="button" class="prog-item" onclick={() => window.open(cvData.contact.linkedin, '_blank')}><span class="icon"><XpIcon name="linkedin" size={22} /></span> LinkedIn</button>
            </div>
            <div class="right-panel">
              <button type="button" class="prog-item" onclick={() => openWindow('about')}><span class="icon"><XpIcon name="computer" size={22} /></span> {t.myComputer}</button>
              <button type="button" class="prog-item" onclick={() => openWindow('exp')}><span class="icon"><XpIcon name="folder-docs" size={22} /></span> {t.recentDocs}</button>
              <button type="button" class="prog-item" onclick={() => openWindow('skills')}><span class="icon"><XpIcon name="control" size={22} /></span> {t.controlPanel}</button>
            </div>
          </div>
          <div class="start-footer">
            <button class="logout-btn">Log Off</button>
            <button class="shutdown-btn">Turn Off</button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  :root {
    --xp-blue: #0058e6;
    --xp-light-blue: #2561e1;
    --xp-dark-blue: #003db3;
    --xp-green: #3c812d;
    --xp-light-green: #4cb033;
    --xp-silver: #ece9d8;
  }

  .xp-desktop {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background-image: url('/wallpapers/bliss-1366x768.jpg'); /* fallback for no image-set() */
    background-image: image-set(
      url('/wallpapers/bliss-1366x768.avif') type('image/avif'),
      url('/wallpapers/bliss-1366x768.webp') type('image/webp'),
      url('/wallpapers/bliss-1366x768.jpg') type('image/jpeg')
    );
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-color: #3f86d2; /* sky-blue fallback while the image loads */
    position: relative;
    overflow: hidden;
    font-family: Tahoma, 'Segoe UI', Verdana, sans-serif;
    user-select: none;
  }

  /* Serve the wallpaper that best fits the viewport (and high-DPI screens).
     Browsers only download the background-image whose media query matches. */
  @media (min-width: 1367px), (min-resolution: 1.5dppx) {
    .xp-desktop {
      background-image: url('/wallpapers/bliss-1920x1080.jpg');
      background-image: image-set(
        url('/wallpapers/bliss-1920x1080.avif') type('image/avif'),
        url('/wallpapers/bliss-1920x1080.webp') type('image/webp'),
        url('/wallpapers/bliss-1920x1080.jpg') type('image/jpeg')
      );
    }
  }
  @media (min-width: 1921px), (min-width: 1100px) and (min-resolution: 2dppx) {
    .xp-desktop {
      background-image: url('/wallpapers/bliss-2560x1440.jpg');
      background-image: image-set(
        url('/wallpapers/bliss-2560x1440.avif') type('image/avif'),
        url('/wallpapers/bliss-2560x1440.webp') type('image/webp'),
        url('/wallpapers/bliss-2560x1440.jpg') type('image/jpeg')
      );
    }
  }
  @media (min-width: 2561px), (min-width: 1500px) and (min-resolution: 2dppx) {
    .xp-desktop {
      background-image: url('/wallpapers/bliss-3840x2160.jpg');
      background-image: image-set(
        url('/wallpapers/bliss-3840x2160.avif') type('image/avif'),
        url('/wallpapers/bliss-3840x2160.webp') type('image/webp'),
        url('/wallpapers/bliss-3840x2160.jpg') type('image/jpeg')
      );
    }
  }

  .bsod {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background-color: #000082;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    padding: 50px;
    box-sizing: border-box;
  }

  .desktop-icons {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .desktop-icon {
    appearance: none;
    background: none;
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80px;
    cursor: pointer;
    text-align: center;
  }

  .desktop-icon:focus-visible {
    outline: 1px dotted #fff;
    outline-offset: 2px;
  }

  .desktop-icon span {
    color: white;
    font-size: 12px;
    margin-top: 5px;
    text-shadow: 1px 1px 2px black;
    font-weight: 500;
    padding: 1px 3px;
    border: 1px dotted transparent;
  }

  /* Selected state (single click) — classic XP blue label highlight */
  .desktop-icon.selected span {
    background: #0a246a;
    border: 1px dotted #cdd6ec;
    text-shadow: none;
  }
  .desktop-icon.selected .icon-emoji {
    filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.5));
    opacity: 0.75;
  }

  .icon-emoji {
    font-size: 32px;
    filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.5));
  }

  .window {
    position: absolute;
    width: 450px;
    background-color: var(--xp-silver);
    border: 3px solid var(--xp-blue);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .window.maximized {
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: calc(100% - 30px) !important; /* leave the taskbar visible */
    border-radius: 0;
    border-width: 2px;
  }

  .window.maximized .window-content {
    max-height: none;
    flex: 1;
  }

  .titlebar {
    background: linear-gradient(to right, var(--xp-dark-blue), var(--xp-light-blue));
    color: white;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
    cursor: default;
  }

  .title-text {
    font-weight: bold;
    font-size: 14px;
    text-shadow: 1px 1px 1px black;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .win-icon { display: inline-flex; align-items: center; }
  .win-icon :global(svg) { filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4)); }

  .title-buttons {
    display: flex;
    gap: 2px;
  }

  .win-btn {
    width: 22px;
    height: 22px;
    border: 1px solid rgba(255, 255, 255, 0.85);
    border-radius: 3px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
  }
  .win-btn svg { display: block; }

  .close-btn { background: linear-gradient(to bottom, #f08a70, #e24933 50%, #c5391f); }
  .close-btn:hover { background: linear-gradient(to bottom, #ffa88f, #f05a44 50%, #d2492f); }
  .min-btn, .max-btn { background: linear-gradient(to bottom, #5a8cf0, #2561e1 50%, #1f54c6); }
  .min-btn:hover, .max-btn:hover { background: linear-gradient(to bottom, #79a4f5, #3a76ec 50%, #2a64d6); }
  .win-btn:active { box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.4); }

  .window-content {
    padding: 15px;
    max-height: 400px;
    overflow-y: auto;
    font-size: 13px;
    background: white;
    border: 1px solid #7f9db9;
    margin: 5px;
    color: black;
  }

  .exp-item, .edu-item {
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
  }
  h3 { margin: 0 0 5px 0; color: var(--xp-blue); font-size: 14px; }
  h3.sub { margin: 14px 0 6px 0; font-size: 12px; border-bottom: 1px solid #d6e3f3; padding-bottom: 3px; }
  .company-name { font-weight: bold; margin: 0 0 5px 0; }
  .period { color: #666; font-size: 11px; margin-bottom: 5px; }
  .tech { font-size: 11px; background: #eee; padding: 3px; border-radius: 3px; display: inline-block; margin-top: 6px; margin-bottom: 5px;}

  .about-content .tagline { font-style: italic; color: #444; margin: 0 0 8px 0; }

  .highlights { margin: 6px 0 6px 0; padding-left: 18px; }
  .highlights li { margin-bottom: 4px; line-height: 1.4; }

  .exp-item.early { opacity: 0.9; }

  .lang-list { margin: 4px 0; padding-left: 18px; }
  .lang-list li { margin-bottom: 3px; }

  .plain-list { margin: 4px 0 8px 0; padding-left: 18px; }
  .plain-list li { margin-bottom: 4px; line-height: 1.4; }
  .muted { color: #888; }

  .skill-group { margin-bottom: 4px; }
  .skills-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 10px;
    padding-left: 20px;
    margin: 4px 0;
  }

  .contact-content a { color: var(--xp-blue); text-decoration: none; }
  .contact-content a:hover { text-decoration: underline; }

  .error-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    text-align: center;
    padding: 20px;
  }

  .xp-button {
    background: linear-gradient(to bottom, #f2f2f2, #ebebeb);
    border: 1px solid #003c74;
    border-radius: 3px;
    padding: 5px 20px;
    cursor: pointer;
    box-shadow: inset -1px -1px 2px rgba(0,0,0,0.1);
  }
  .xp-button:active {
    background: #e0e0e0;
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.2);
  }

  .taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: linear-gradient(to bottom, #245edb, #336bed 5%, #245edb 15%, #003db3);
    display: flex;
    align-items: center;
    z-index: 1000;
  }

  .start-btn {
    background: linear-gradient(to bottom, #4cb033, #3c812d);
    color: white;
    border: none;
    height: 100%;
    padding: 0 20px;
    font-weight: bold;
    font-style: italic;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
    box-shadow: inset -2px 0 3px rgba(0,0,0,0.2);
  }
  .start-btn:hover { background: linear-gradient(to bottom, #5cc043, #4c913d); }
  .start-logo { display: inline-flex; align-items: center; }

  .taskbar-windows {
    flex-grow: 1;
    display: flex;
    gap: 2px;
    padding: 0 10px;
    height: 100%;
    align-items: center;
  }

  .taskbar-item {
    appearance: none;
    font: inherit;
    margin: 0;
    text-align: inherit;
    background: linear-gradient(to bottom, #3b74e6, #2d65d9);
    border: 1px solid #1449b8;
    border-radius: 2px;
    color: white;
    padding: 2px 10px;
    font-size: 12px;
    width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .tb-icon { display: inline-flex; align-items: center; }
  .taskbar-item.active {
    background: linear-gradient(to bottom, #1d4bb8, #1842a6);
    box-shadow: inset 1px 1px 3px rgba(0,0,0,0.3);
  }
  .taskbar-item:focus-visible {
    outline: 1px dotted #fff;
    outline-offset: -4px;
  }

  .tray {
    background: linear-gradient(to bottom, #119eea, #0981c2);
    height: 100%;
    padding: 0 15px;
    display: flex;
    align-items: center;
    color: white;
    font-size: 11px;
    border-left: 1px solid #003db3;
    box-shadow: inset 1px 0 1px #33a9f0;
  }

  .start-menu {
    position: absolute;
    bottom: 30px;
    left: 0;
    width: 350px;
    height: 450px;
    background-color: white;
    border: 2px solid var(--xp-blue);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    display: flex;
    flex-direction: column;
    box-shadow: 2px -2px 10px rgba(0,0,0,0.3);
  }

  .start-header {
    background: linear-gradient(to right, var(--xp-dark-blue), var(--xp-light-blue));
    color: white;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    background-color: #fff;
    border: 2px solid white;
    border-radius: 3px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }

  .username {
    font-weight: bold;
    font-size: 16px;
    text-shadow: 1px 1px 2px black;
  }

  .start-body {
    flex-grow: 1;
    display: flex;
    color: black;
  }

  .left-panel {
    flex: 1;
    background: white;
    padding: 5px 0;
  }
  .right-panel {
    flex: 1;
    background: #d3e5fa;
    border-left: 1px solid #95bcee;
    padding: 5px 0;
  }

  .prog-item {
    appearance: none;
    background: none;
    border: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    text-align: inherit;
    width: 100%;
    padding: 8px 10px;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .prog-item:hover {
    background-color: var(--xp-blue);
    color: white;
  }
  .prog-item:focus-visible {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }
  
  .separator {
    height: 1px;
    background: linear-gradient(to right, transparent, #ccc 20%, #ccc 80%, transparent);
    margin: 5px 0;
  }

  .start-footer {
    background: linear-gradient(to right, #417be1, #3065d6);
    padding: 10px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .start-footer button {
    background: none;
    border: none;
    color: white;
    font-size: 12px;
    cursor: pointer;
  }

  .clippy-container {
    appearance: none;
    background: none;
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    text-align: inherit;
    position: absolute;
    bottom: 50px;
    right: 30px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    animation: bounce 2s infinite;
    cursor: pointer;
  }
  .clippy-container:hover .clippy-svg { transform: scale(1.06); }
  .clippy-container:focus-visible { outline: 1px dotted #fff; outline-offset: 4px; }

  .clippy-balloon {
    background: #ffffcc;
    border: 1px solid #000;
    padding: 13px 15px;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.45;
    max-width: 250px;
    margin-bottom: 12px;
    color: black;
    box-shadow: 2px 2px 6px rgba(0,0,0,0.25);
    position: relative;
  }
  .clippy-container:hover .clippy-balloon { background: #ffffe0; }
  .clippy-balloon::after {
    content: '';
    position: absolute;
    bottom: -10px;
    right: 20px;
    border-width: 10px 10px 0 0;
    border-style: solid;
    border-color: #ffffcc transparent transparent transparent;
  }

  .clippy-svg {
    width: 140px;
    height: auto;
    transform-origin: bottom center;
    transition: transform 0.25s ease;
  }

  .clippy-eyes {
    transform-box: fill-box;
    transform-origin: center;
    animation: clippyBlink 4.5s infinite;
  }

  .clippy-brow {
    transform-box: fill-box;
    transform-origin: center bottom;
    animation: clippyBrow 4.5s infinite;
  }

  @keyframes clippyBlink {
    0%, 92%, 100% { transform: scaleY(1); }
    95% { transform: scaleY(0.1); }
  }

  @keyframes clippyBrow {
    0%, 40%, 100% { transform: translateY(0); }
    20% { transform: translateY(-3px); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0) rotate(-2deg); }
    50% { transform: translateY(-12px) rotate(2deg); }
  }

  /* ---- XP boot splash (shown after the BSOD, before returning to desktop) ---- */
  .xp-boot {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: #000;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 46px;
    font-family: Tahoma, 'Segoe UI', sans-serif;
    animation: bootFade 0.4s ease;
  }
  @keyframes bootFade { from { opacity: 0; } to { opacity: 1; } }

  .boot-logo { display: flex; align-items: center; gap: 16px; }

  .boot-flag {
    width: 46px;
    height: 46px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 3px;
    transform: perspective(120px) rotateY(-18deg);
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.25));
  }
  .flag-q { border-radius: 2px 4px 2px 4px; }
  .flag-q.tl { background: #f64f3b; }
  .flag-q.tr { background: #6cc24a; }
  .flag-q.bl { background: #3b8ff6; }
  .flag-q.br { background: #ffc20e; }

  .boot-title { display: flex; flex-direction: column; line-height: 1; }
  .boot-brand { font-size: 13px; letter-spacing: 0.5px; color: #cfcfcf; }
  .boot-product { font-size: 34px; font-weight: 700; font-style: italic; letter-spacing: -0.5px; }
  .boot-xp {
    color: #ff9b1f;
    font-size: 22px;
    vertical-align: super;
    margin-left: 3px;
    font-style: normal;
  }

  .boot-loader {
    width: 150px;
    height: 14px;
    border: 1px solid #4a4a6a;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    background: #000;
  }
  .boot-blocks {
    display: flex;
    gap: 4px;
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    animation: bootSlide 2s linear infinite;
  }
  .boot-blocks i {
    width: 12px;
    height: 8px;
    border-radius: 2px;
    background: linear-gradient(to right, #1b3fae, #5a8cf0);
  }
  @keyframes bootSlide {
    0% { transform: translate(-60px, -50%); }
    100% { transform: translate(160px, -50%); }
  }

  .boot-copy { font-size: 11px; color: #8a8a9a; position: absolute; bottom: 28px; }

  @media (prefers-reduced-motion: reduce) {
    .boot-blocks { animation: none; }
    .xp-boot { animation: none; }
  }

  /* ---- Mobile: the desktop metaphor adapts ---- */
  @media (max-width: 600px) {
    .desktop-icons {
      flex-direction: row;
      flex-wrap: wrap;
      gap: 14px 6px;
      top: 10px;
      left: 10px;
      right: 10px;
    }
    .desktop-icon { width: 72px; }

    /* Windows are forced maximised in markup; make the chrome touch-friendly.
       The volume toggle lives bottom-right on mobile, so the close [X] is free. */
    .window.maximized .titlebar { height: 36px; }
    .win-btn { width: 28px; height: 28px; }
    .window-content { max-height: none; font-size: 14px; }

    .start-menu {
      width: 100vw;
      left: 0;
      height: auto;
      max-height: calc(100dvh - 30px);
      overflow-y: auto;
    }

    .taskbar-windows { padding: 0 4px; }
    .taskbar-item { width: auto; min-width: 0; flex: 1; max-width: 130px; }

    /* Clippy is charming but it eats a small screen — shrink and tuck it away. */
    .clippy-container { bottom: 38px; right: 10px; transform: scale(0.62); transform-origin: bottom right; }
    .clippy-balloon { max-width: 180px; font-size: 12px; }
  }
</style>
