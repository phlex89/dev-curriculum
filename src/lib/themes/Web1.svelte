<script lang="ts">
  import { onMount } from 'svelte';
  import { cvData } from '$lib/cv-data';
  import { web1Modem } from '$lib/audio';

  // Web 1.0 / HTML puro (mid-'90s): a GeoCities personal homepage served from a
  // static server in 1996, framed inside a maximised Netscape Navigator 3 window.
  // Times New Roman everywhere, <table> layout, beveled chrome, a tiled starfield
  // background, hit counter, 88×31 badges, a webring, a working guestbook gag and a
  // sparkle cursor trail. The era *chrome* is period kitsch; the CV content itself
  // comes verbatim from the single source of truth (cv-data.ts) — nothing invented.

  const DEFAULT_STATUS =
    'Welcome to Stefano Tedeschi’s Home Page · Best viewed with Netscape Navigator 3.0 at 800×600 · Don’t forget to sign my guestbook!';

  const counterDigits = ['0', '0', '1', '3', '3', '3', '7'];

  // Visitor "guestbook" — a period gimmick (invents no CV data). Seeded with a few
  // vintage entries; the visitor can add their own.
  interface GuestEntry {
    name: string;
    msg: string;
    date: string;
    fresh?: boolean;
  }
  let entries = $state<GuestEntry[]>([
    { name: 'Webmaster_of_CoolSite95', msg: 'AWESOME page!!! Check out my site too!! ~*~ keep surfin’ ~*~', date: 'Oct 2, 1996' },
    { name: 'netscape_navigator_fan', msg: 'Cool homepage dude. Added you to my bookmarks :-)', date: 'Sep 28, 1996' },
    { name: 'Tanja_97', msg: 'Nice to meet you on the World Wide Web! Sign mine too!', date: 'Sep 19, 1996' }
  ]);
  let nameInput = $state('');
  let msgInput = $state('');

  // Fake "[JavaScript Application]" alert modal — used by the guestbook & easter eggs.
  let alertMsg = $state<string | null>(null);
  function showAlert(m: string) {
    alertMsg = m;
  }
  function closeAlert() {
    alertMsg = null;
  }

  // Status-bar message (the bottom of the Netscape chrome).
  let statusText = $state(DEFAULT_STATUS);
  let statusTimer: ReturnType<typeof setTimeout> | null = null;
  function flashStatus(m: string, revertMs = 2600) {
    statusText = m;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (statusText = DEFAULT_STATUS), revertMs);
  }

  // Sparkle cursor trail — the quintessential '90s JS gimmick. Only on fine pointers
  // with motion allowed; recycled, capped and self-clearing so it stays light.
  let canSparkle = $state(false);
  let sparkles = $state<{ id: number; x: number; y: number }[]>([]);
  let sid = 0;
  let lastSpark = 0;
  function onMove(e: MouseEvent) {
    if (!canSparkle) return;
    const now = performance.now();
    if (now - lastSpark < 45) return;
    lastSpark = now;
    const id = sid++;
    sparkles = [...sparkles, { id, x: e.clientX, y: e.clientY }].slice(-14);
    setTimeout(() => (sparkles = sparkles.filter((s) => s.id !== id)), 700);
  }

  let scroller: HTMLDivElement;
  function prefersReduced() {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function scrollToSection(e: Event, id: string) {
    e.preventDefault(); // don't pollute the URL hash (it carries the era deep-link)
    const el = scroller?.querySelector('#' + id);
    el?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
  }
  function toTop() {
    scroller?.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
  }

  function signGuestbook(e: SubmitEvent) {
    e.preventDefault();
    const name = nameInput.trim() || 'Anonymous Coward';
    const msg = msgInput.trim() || '(no message)';
    entries = [{ name, msg, date: 'Just now', fresh: true }, ...entries];
    nameInput = '';
    msgInput = '';
    showAlert(`Thanks for signing my guestbook, ${name}!\nYou are a valued visitor of the World Wide Web. :-)`);
  }

  // Netscape throbber → "dial up" the modem.
  function onThrobber() {
    web1Modem();
    flashStatus('Connecting to www.geocities.com… ☄');
  }

  // Toolbar buttons — mostly flavour. A couple genuinely act (Home/Reload).
  function toolbar(label: string) {
    switch (label) {
      case 'Home':
        toTop();
        flashStatus('Going Home…');
        break;
      case 'Reload':
        flashStatus('Transferring data from www.geocities.com… 45% of 12K', 1800);
        web1Modem();
        break;
      case 'Back':
        flashStatus('Can’t go back — this is where the Web begins.');
        break;
      case 'Stop':
        flashStatus('Transfer stopped.');
        break;
      case 'Images':
        flashStatus('Auto Load Images: ON (all 256 colors!)');
        break;
      case 'Print':
        flashStatus('Hint: try File › Print… (just kidding, it’s 1996)');
        break;
      default:
        flashStatus(label + '…');
    }
  }

  function onPrize() {
    showAlert('Just kidding! :-)\nThere is no prize — but thanks for visiting my homepage and surfing the Web!');
  }
  function onWebring(dir: string) {
    flashStatus(`WebRing: ${dir}… 404 Not Found (this ring isn’t active anymore).`);
  }

  onMount(() => {
    canSparkle =
      !prefersReduced() && typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  });
</script>

<svelte:window onkeydown={(e) => alertMsg && e.key === 'Escape' && closeAlert()} />

<!-- ░░ Maximised Netscape Navigator 3 window ░░ -->
<div
  class="nn-browser"
  role="presentation"
  onmousemove={onMove}
>
  <!-- Title bar -->
  <div class="nn-titlebar">
    <span class="nn-title">Stefano Tedeschi&rsquo;s Home Page &mdash; Netscape</span>
    <span class="nn-winbtns" aria-hidden="true"><i>_</i><i>&#9633;</i><i>&times;</i></span>
  </div>

  <!-- Menu bar (decorative) -->
  <div class="nn-menubar" aria-hidden="true">
    {#each ['File', 'Edit', 'View', 'Go', 'Bookmarks', 'Options', 'Directory', 'Window', 'Help'] as m}
      <span class="nn-menu"><u>{m.charAt(0)}</u>{m.slice(1)}</span>
    {/each}
  </div>

  <!-- Toolbar + throbber -->
  <div class="nn-toolbar">
    <div class="nn-tb-buttons">
      {#each [['Back', '◀'], ['Forward', '▶'], ['Reload', '↻'], ['Home', '⌂'], ['Images', '▦'], ['Open', '▤'], ['Print', '⎙'], ['Find', '⚲'], ['Stop', '✕']] as [label, glyph]}
        <button class="nn-tb-btn" class:nn-disabled={label === 'Back' || label === 'Forward'} onclick={() => toolbar(label)} title={label}>
          <span class="nn-tb-ico" aria-hidden="true">{glyph}</span>
          <span class="nn-tb-lab">{label}</span>
        </button>
      {/each}
    </div>
    <button class="nn-throbber" onclick={onThrobber} title="Connect" aria-label="Netscape — connetti al modem">
      <span class="nn-n">N</span>
      <span class="nn-comet" aria-hidden="true"></span>
    </button>
  </div>

  <!-- Location bar -->
  <div class="nn-location">
    <span class="nn-loc-label">Location:</span>
    <span class="nn-loc-field">http://www.geocities.com/SiliconValley/Heights/2600/stedeschi/index.html</span>
  </div>

  <!-- ░░ The page itself (scrollable content area) ░░ -->
  <div class="nn-content" bind:this={scroller}>
    <!-- Top scrolling announcement (CSS marquee) -->
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <span>&#9733; WELCOME TO MY HOMEPAGE!!! &nbsp;&#9733;&nbsp; THANKS FOR STOPPING BY!!! &nbsp;&#9733;&nbsp; DON&rsquo;T FORGET TO SIGN MY GUESTBOOK!!! &nbsp;&#9733;&nbsp; THIS PAGE IS BEST VIEWED IN NETSCAPE!!! &nbsp;&#9733;&nbsp;</span>
        <span>&#9733; WELCOME TO MY HOMEPAGE!!! &nbsp;&#9733;&nbsp; THANKS FOR STOPPING BY!!! &nbsp;&#9733;&nbsp; DON&rsquo;T FORGET TO SIGN MY GUESTBOOK!!! &nbsp;&#9733;&nbsp; THIS PAGE IS BEST VIEWED IN NETSCAPE!!! &nbsp;&#9733;&nbsp;</span>
      </div>
    </div>

    <div class="page">
      <!-- ░ HEADER ░ -->
      <header class="hdr" id="top">
        <h1 class="rainbow">{cvData.name}&rsquo;s Home Page</h1>
        <p class="hdr-sub">
          ~*~ Welcome to my little corner of the <b>World Wide Web</b>! ~*~
        </p>

        <div class="construction">
          <span class="cone" aria-hidden="true">&#128679;</span>
          <span class="blink">UNDER CONSTRUCTION</span>
          <span class="cone" aria-hidden="true">&#128679;</span>
        </div>

        <hr class="hr3d" />

        <!-- Hit counter + prize gag -->
        <div class="counter-row">
          <span class="counter-label">You are visitor number</span>
          <span class="counter" aria-label="visitatore numero 0013337">
            {#each counterDigits as d}<span class="digit">{d}</span>{/each}
          </span>
          <span class="counter-label">since Oct 1996</span>
        </div>

        <button class="prize blink" onclick={onPrize}>
          &#11088; CONGRATULATIONS! You are the 1,000,000th visitor &mdash; CLICK HERE to claim your PRIZE!!! &#11088;
        </button>

        <!-- 88×31 badges -->
        <div class="badges">
          <span class="badge bg-netscape"><b>Netscape</b><br />NOW! <i class="blip"></i></span>
          <span class="badge bg-notepad">Made with<br /><b>NOTEPAD</b></span>
          <span class="badge bg-html">HTML 3.2<br /><b>CHECKED!</b></span>
          <span class="badge bg-res"><b>BEST VIEWED</b><br />800&times;600</span>
          <span class="badge bg-lynx"><b>Lynx</b><br />Enhanced</span>
          <span class="badge bg-y2k"><b>Y2K</b><br />READY</span>
        </div>

        <hr class="hr3d" />
      </header>

      <!-- ░ MAIN LAYOUT: nav column + content column ░ -->
      <table class="layout" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <!-- LEFT NAV -->
            <td class="nav-col">
              <div class="nav-box">
                <div class="nav-title">~ Site Map ~</div>
                <ul class="ball-list">
                  <li><a href="#about" onclick={(e) => scrollToSection(e, 'about')}>About Me</a></li>
                  <li>
                    <a href="#resume" onclick={(e) => scrollToSection(e, 'resume')}>My Resum&eacute;</a>
                    <span class="new blink">NEW!</span>
                  </li>
                  <li><a href="#skills" onclick={(e) => scrollToSection(e, 'skills')}>Computer Skills</a></li>
                  <li><a href="#edu" onclick={(e) => scrollToSection(e, 'edu')}>Education &amp; Awards</a></li>
                  <li><a href="#links" onclick={(e) => scrollToSection(e, 'links')}>Cool Links</a></li>
                  <li>
                    <a href="#guestbook" onclick={(e) => scrollToSection(e, 'guestbook')}>Sign Guestbook</a>
                    <span class="new blink">NEW!</span>
                  </li>
                  <li><a href="mailto:{cvData.contact.email}">E-mail Me!</a></li>
                </ul>
              </div>

              <!-- Webring widget -->
              <div class="webring">
                <div class="webring-title">Frontend Developers<br />WebRing</div>
                <div class="webring-nav">
                  <button onclick={() => onWebring('Prev')}>&laquo; Prev</button>
                  <button onclick={() => onWebring('Random')}>Random</button>
                  <button onclick={() => onWebring('Next')}>Next &raquo;</button>
                </div>
                <p class="webring-owner">This site owned by<br /><b>{cvData.name}</b></p>
              </div>

              <!-- Now playing (decoration) -->
              <div class="nowplaying" aria-hidden="true">
                <span class="note">&#9835;</span> Now Playing:<br /><tt>canyon.mid</tt>
              </div>
            </td>

            <!-- RIGHT CONTENT -->
            <td class="content-col">
              <!-- ABOUT -->
              <section class="card" id="about">
                <div class="card-bar">&#128075; About Me</div>
                <div class="card-body">
                  <p>
                    Hi! My name is <b>{cvData.name}</b> and I am a <b>{cvData.role}</b> from {cvData.contact.location}.
                    This is my homepage on the Information Superhighway!
                  </p>
                  <p class="quote">&ldquo;{cvData.tagline}&rdquo;</p>
                  <p>{cvData.summary}</p>
                </div>
              </section>

              <!-- RESUME / EXPERIENCE -->
              <section class="card" id="resume">
                <div class="card-bar">&#128188; My Work Experience</div>
                <div class="card-body">
                  {#each cvData.experience as exp}
                    <div class="job">
                      <div class="job-head">
                        <b class="job-title">{exp.title}</b>
                        <span class="job-period">{exp.period}</span>
                      </div>
                      <div class="job-company">
                        <a href="#resume" onclick={(e) => e.preventDefault()}>{exp.company}</a>
                        &nbsp;&middot;&nbsp;{exp.location}{#if exp.sector}&nbsp;&middot;&nbsp;<i>{exp.sector}</i>{/if}
                      </div>
                      <p class="job-desc">{exp.description}</p>
                      <ul class="ball-list dense">
                        {#each exp.highlights as h}<li>{h}</li>{/each}
                      </ul>
                      <p class="tech"><b>Tech:</b> {exp.technologies.join(' · ')}</p>
                    </div>
                  {/each}

                  <div class="job early">
                    <div class="job-head">
                      <b class="job-title">{cvData.earlyCareer.title}</b>
                      <span class="job-period">{cvData.earlyCareer.period}</span>
                    </div>
                    <p class="job-desc">{cvData.earlyCareer.description}</p>
                    <ul class="ball-list dense">
                      {#each cvData.earlyCareer.highlights as h}<li>{h}</li>{/each}
                    </ul>
                    <p class="tech"><b>Tech:</b> {cvData.earlyCareer.technologies.join(' · ')}</p>
                  </div>
                </div>
              </section>

              <!-- SKILLS -->
              <section class="card" id="skills">
                <div class="card-bar">&#128187; My Computer Skills</div>
                <div class="card-body">
                  <table class="skill-table" cellspacing="0" cellpadding="0">
                    <tbody>
                      {#each cvData.skillGroups as group}
                        <tr>
                          <td class="skill-cat">{group.label}</td>
                          <td class="skill-items">{group.items.join(' · ')}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                  <p class="lang-line">
                    <b>Languages I speak:</b>
                    {#each cvData.languages as lang, i}{lang.name} ({lang.level}){i < cvData.languages.length - 1 ? ', ' : ''}{/each}
                  </p>
                </div>
              </section>

              <!-- EDUCATION & AWARDS -->
              <section class="card" id="edu">
                <div class="card-bar">&#127891; Education &amp; Awards</div>
                <div class="card-body two-up">
                  <div>
                    <p class="mini-h">Education</p>
                    <ul class="ball-list dense">
                      {#each cvData.education as edu}
                        <li><b>{edu.title}</b><br /><span class="muted">{edu.institute}, {edu.location} &middot; {edu.period}</span></li>
                      {/each}
                    </ul>
                  </div>
                  <div>
                    <p class="mini-h">&#127908; Conferences Attended</p>
                    <ul class="ball-list dense">
                      {#each cvData.conferences as conf}
                        <li>{conf.name} <span class="muted">&middot; {conf.location} &rsquo;{conf.year.slice(-2)}</span></li>
                      {/each}
                    </ul>
                  </div>
                </div>
              </section>

              <!-- COOL LINKS -->
              <section class="card" id="links">
                <div class="card-bar">&#128279; Cool Links</div>
                <div class="card-body">
                  <ul class="ball-list">
                    <li>
                      <a href={cvData.contact.linkedin} target="_blank" rel="noopener">My LinkedIn Profile</a>
                      <span class="hot" aria-hidden="true">&#128293;</span>
                    </li>
                    <li><a href={cvData.contact.website} target="_blank" rel="noopener">{cvData.contact.website.replace('https://', '')}</a> &mdash; my company</li>
                    <li><a href="mailto:{cvData.contact.email}">Send me electronic mail</a></li>
                    <li><a href="tel:{cvData.contact.phone.replace(/\s/g, '')}">Call my telephone</a> <span class="muted">{cvData.contact.phone}</span></li>
                  </ul>
                </div>
              </section>

              <!-- GUESTBOOK -->
              <section class="card" id="guestbook">
                <div class="card-bar">&#9999;&#65039; Sign My Guestbook!</div>
                <div class="card-body">
                  <p>Drop me a line and let me know you were here! <span class="blink mailheart" aria-hidden="true">&#10084;</span></p>
                  <form class="gb-form" onsubmit={signGuestbook}>
                    <label for="gb-name">Your Name: <input id="gb-name" name="name" type="text" bind:value={nameInput} maxlength="40" placeholder="CoolSurfer97" /></label>
                    <label for="gb-msg">Message: <textarea id="gb-msg" name="message" bind:value={msgInput} rows="2" maxlength="160" placeholder="Great homepage!!!"></textarea></label>
                    <button type="submit" class="gb-submit">Sign Guestbook</button>
                  </form>
                  <div class="gb-entries">
                    {#each entries as g}
                      <div class="gb-entry" class:fresh={g.fresh}>
                        <span class="gb-name">{g.name}</span>
                        <span class="gb-date">{g.date}</span>
                        <p class="gb-msg">&ldquo;{g.msg}&rdquo;</p>
                      </div>
                    {/each}
                  </div>
                </div>
              </section>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- ░ FOOTER ░ -->
      <footer class="ftr">
        <hr class="hr3d" />
        <p>
          <a href="#top" onclick={(e) => scrollToSection(e, 'top')}>[ Back to Top ]</a>
          &nbsp;|&nbsp;
          <a href="mailto:{cvData.contact.email}">[ E-mail the Webmaster ]</a>
        </p>
        <p class="ftr-meta">This page was last updated on <b>October 12, 1996</b>.</p>
        <p class="ftr-meta">&copy; 1996 {cvData.name}. All Rights Reserved. Made with <b>Notepad</b> on a Pentium&reg; 133MHz.</p>
        <p class="ftr-meta">This site is best experienced with <b>Netscape Navigator 3.0</b> at 800&times;600 resolution.</p>
      </footer>
    </div>
  </div>

  <!-- Status bar -->
  <div class="nn-statusbar">
    <span class="nn-meteor" aria-hidden="true">&#9728;</span>
    <span class="nn-status-text"><span class="nn-status-scroll">{statusText}</span></span>
    <span class="nn-progress" aria-hidden="true"></span>
    <span class="nn-doc">Document: Done</span>
    <span class="nn-lock" aria-hidden="true" title="Insecure">&#128275;</span>
  </div>
</div>

<!-- Sparkle cursor trail -->
{#if canSparkle}
  <div class="sparkles" aria-hidden="true">
    {#each sparkles as s (s.id)}
      <span class="sparkle" style="left:{s.x}px; top:{s.y}px;">&#10022;</span>
    {/each}
  </div>
{/if}

<!-- [JavaScript Application] alert modal -->
{#if alertMsg}
  <div class="js-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && closeAlert()}>
    <div class="js-alert" role="alertdialog" aria-modal="true" aria-label="JavaScript Application" tabindex="-1">
      <div class="js-titlebar">[JavaScript Application]</div>
      <div class="js-body">
        <span class="js-icon" aria-hidden="true">&#9888;</span>
        <p class="js-msg">{alertMsg}</p>
      </div>
      <div class="js-foot">
        <!-- svelte-ignore a11y_autofocus -->
        <button class="js-ok" onclick={closeAlert} autofocus>OK</button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* ══ NETSCAPE NAVIGATOR 3 CHROME ══ */
  .nn-browser {
    --face: #c0c0c0;
    --hi: #ffffff;
    --lo: #808080;
    --lolo: #404040;
    --link: #0000ee;
    --visited: #551a8b;
    --navy: #000080;
    --teal: #008080;
    --maroon: #800000;
    --paper: #fffdf2; /* cream content background */
    --ink: #111111;

    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    background: var(--face);
    font-family: 'Times New Roman', Times, Georgia, serif;
    color: var(--ink);
    overflow: hidden;
    -webkit-font-smoothing: none;
  }

  /* Beveled helper look (raised) */
  .nn-titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(90deg, #000080, #1084d0);
    color: #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 0.8rem;
    padding: 3px 4px 3px 8px;
    flex: none;
  }
  .nn-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nn-winbtns { display: flex; gap: 3px; }
  .nn-winbtns i {
    width: 18px; height: 16px;
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--face); color: #000;
    border: 2px outset var(--hi);
    font-style: normal; font-size: 0.7rem; line-height: 1;
  }

  .nn-menubar {
    display: flex;
    gap: 2px;
    background: var(--face);
    border-bottom: 1px solid var(--lo);
    padding: 2px 4px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.78rem;
    flex: none;
  }
  .nn-menu { padding: 1px 7px; cursor: default; }
  .nn-menu u { text-decoration: underline; }
  .nn-menu:hover { background: var(--navy); color: #fff; }

  .nn-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--face);
    border-bottom: 2px groove var(--hi);
    padding: 3px 6px;
    flex: none;
  }
  .nn-tb-buttons { display: flex; gap: 2px; flex-wrap: wrap; }
  .nn-tb-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    min-width: 42px;
    padding: 3px 5px 2px;
    background: var(--face);
    border: 2px outset var(--hi);
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.62rem;
    color: #000;
    cursor: pointer;
  }
  .nn-tb-btn:active { border-style: inset; }
  .nn-tb-btn:hover { background: #d4d0c8; }
  .nn-tb-btn.nn-disabled { color: var(--lo); }
  .nn-tb-ico { font-size: 0.95rem; line-height: 1; color: var(--navy); }
  .nn-tb-btn.nn-disabled .nn-tb-ico { color: var(--lo); }
  .nn-tb-btn:focus-visible { outline: 1px dotted #000; outline-offset: 1px; }

  /* Throbber: the famous Netscape "N" with a meteor */
  .nn-throbber {
    position: relative;
    width: 38px; height: 38px;
    border: 2px outset var(--hi);
    background: radial-gradient(circle at 50% 35%, #2a4d8f, #061029 70%);
    cursor: pointer;
    overflow: hidden;
    flex: none;
    padding: 0;
  }
  .nn-n {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 800; font-size: 1.5rem; font-style: italic;
    color: #6fb7ff;
    text-shadow: 0 0 4px rgba(120, 190, 255, 0.8);
  }
  .nn-comet {
    position: absolute;
    width: 4px; height: 4px; border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.9);
    top: 50%; left: 50%;
    transform-origin: -10px -10px;
    animation: comet 1.6s linear infinite;
  }
  @keyframes comet {
    0% { transform: rotate(0deg) translate(13px, 0); opacity: 1; }
    100% { transform: rotate(360deg) translate(13px, 0); opacity: 1; }
  }
  .nn-throbber:focus-visible { outline: 1px dotted #fff; outline-offset: 1px; }

  .nn-location {
    display: flex;
    align-items: center;
    gap: 7px;
    background: var(--face);
    border-bottom: 2px groove var(--hi);
    padding: 3px 8px 5px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.74rem;
    flex: none;
  }
  .nn-loc-label { font-weight: 700; }
  .nn-loc-field {
    flex: 1;
    background: #fff;
    border: 2px inset var(--hi);
    padding: 2px 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #000;
  }

  .nn-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    border: 2px inset var(--hi);
    /* ░ Tiled starfield background ░ */
    background-color: #00001e;
    background-image:
      radial-gradient(1.5px 1.5px at 20px 30px, #ffffff, transparent),
      radial-gradient(1px 1px at 70px 80px, #cfe3ff, transparent),
      radial-gradient(1.5px 1.5px at 110px 50px, #ffffff, transparent),
      radial-gradient(1px 1px at 44px 104px, #9fb8ff, transparent),
      radial-gradient(2px 2px at 92px 18px, #ffffff, transparent),
      radial-gradient(1px 1px at 10px 70px, #bcd0ff, transparent);
    background-size: 130px 130px;
  }

  /* ░ Status bar ░ */
  .nn-statusbar {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--face);
    border-top: 2px groove var(--hi);
    padding: 2px 6px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.7rem;
    flex: none;
  }
  .nn-meteor { color: var(--maroon); animation: spin 2.2s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .nn-status-text {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    border: 1px inset var(--hi);
    padding: 1px 6px;
    background: var(--face);
  }
  .nn-status-scroll { display: inline-block; }
  .nn-progress {
    width: 70px; height: 11px;
    border: 1px inset var(--hi);
    background:
      repeating-linear-gradient(90deg, #000080 0 6px, transparent 6px 9px);
    background-size: 9px 100%;
    animation: progress 1s linear infinite;
  }
  @keyframes progress { to { background-position: 9px 0; } }
  .nn-doc { white-space: nowrap; }
  .nn-lock { font-size: 0.8rem; }

  /* ══ MARQUEE ══ */
  .marquee {
    overflow: hidden;
    white-space: nowrap;
    background: #000;
    color: #ffff00;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 0.82rem;
    border-bottom: 2px solid var(--teal);
    padding: 4px 0;
  }
  .marquee-track { display: inline-flex; animation: marquee 22s linear infinite; will-change: transform; }
  .marquee-track span { padding-right: 0; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* ══ PAGE ══ */
  .page {
    max-width: 800px;
    margin: 0 auto;
    padding: 18px 14px 90px;
    text-align: center;
    font-size: 1.02rem;
    line-height: 1.5;
  }

  /* ░ HEADER ░ */
  .hdr { margin-bottom: 8px; }
  .rainbow {
    font-size: clamp(2rem, 7vw, 3.4rem);
    font-weight: 700;
    line-height: 1.05;
    margin: 4px 0 6px;
    background: linear-gradient(90deg, #ff0000, #ff8c00, #ffd700, #00c000, #00bfff, #4b0082, #ee00ee, #ff0000);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
    animation: rainbow 6s linear infinite;
  }
  @keyframes rainbow { to { background-position: 200% 0; } }
  .hdr-sub { color: #ffe9a8; font-size: 1.05rem; margin: 0 0 10px; }
  .hdr-sub b { color: #fff; }

  .construction {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: repeating-linear-gradient(45deg, #ffcc00 0 14px, #1a1a1a 14px 28px);
    border: 3px solid #000;
    padding: 6px 16px;
    margin: 4px 0 12px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 800;
    color: #000;
    text-shadow: 0 0 3px #ffcc00, 1px 1px 0 #fff;
    letter-spacing: 0.05em;
  }
  .construction .cone { filter: drop-shadow(0 0 1px #000); }

  .blink { animation: blink 1.1s steps(1) infinite; }
  @keyframes blink { 50% { opacity: 0; } }

  .hr3d {
    border: none;
    border-top: 2px solid var(--lo);
    border-bottom: 2px solid #fff;
    height: 0;
    margin: 14px auto;
    width: 92%;
  }

  /* Hit counter (odometer on black) */
  .counter-row {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    margin: 10px 0;
  }
  .counter-label { color: #cfe3ff; font-size: 0.95rem; }
  .counter { display: inline-flex; gap: 2px; padding: 3px; background: #000; border: 2px inset #888; }
  .digit {
    display: inline-block;
    min-width: 16px;
    padding: 2px 3px;
    background: #111;
    color: #33ff33;
    font-family: 'Courier New', Courier, monospace;
    font-weight: 700;
    font-size: 1.1rem;
    text-align: center;
    border: 1px solid #2a2a2a;
    text-shadow: 0 0 4px rgba(51, 255, 51, 0.7);
  }

  .prize {
    display: inline-block;
    max-width: 96%;
    margin: 8px auto 14px;
    background: linear-gradient(180deg, #ff2a2a, #b00000);
    color: #ffff00;
    border: 3px ridge #ffd700;
    padding: 7px 16px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 800;
    font-size: 0.86rem;
    cursor: pointer;
    text-shadow: 1px 1px 0 #000;
  }
  .prize:hover { background: linear-gradient(180deg, #ff4040, #c80000); }
  .prize:focus-visible { outline: 2px dotted #fff; outline-offset: 2px; }

  /* 88×31 badges */
  .badges { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 10px 0; }
  .badge {
    width: 88px; height: 31px;
    box-sizing: border-box;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 1px solid #000;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8px;
    line-height: 1.05;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    overflow: hidden;
    position: relative;
  }
  .badge b { font-size: 9px; }
  .bg-netscape { background: linear-gradient(180deg, #2b39ff, #000080); color: #fff; }
  .bg-netscape .blip { position: absolute; top: 3px; right: 4px; width: 5px; height: 5px; border-radius: 50%; background: #33ff33; box-shadow: 0 0 4px #33ff33; animation: blink 0.8s steps(1) infinite; }
  .bg-notepad { background: #efefef; color: #000080; }
  .bg-html { background: #fff; color: #cc0000; }
  .bg-res { background: #000; color: #33ff33; }
  .bg-lynx { background: #003300; color: #b6ffb6; }
  .bg-y2k { background: linear-gradient(180deg, #ffd700, #d40000); color: #000; }

  /* ░ LAYOUT TABLE ░ */
  .layout { width: 100%; border-collapse: collapse; text-align: left; }
  .nav-col { width: 168px; vertical-align: top; padding-right: 12px; }
  .content-col { vertical-align: top; }

  /* Left nav boxes */
  .nav-box, .webring, .nowplaying {
    background: var(--paper);
    border: 2px outset #fff;
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5);
    margin-bottom: 14px;
  }
  .nav-title, .webring-title {
    background: var(--teal);
    color: #fff;
    font-weight: 700;
    text-align: center;
    padding: 4px;
    border-bottom: 1px solid #004c4c;
  }
  .nav-box ul { margin: 0; padding: 8px 8px 10px 8px; }

  /* Bulleted lists with coloured "ball" GIFs (recreated in CSS) */
  .ball-list { list-style: none; margin: 0; padding: 0; }
  .ball-list li { position: relative; padding: 4px 0 4px 20px; line-height: 1.4; }
  .ball-list li::before {
    content: '';
    position: absolute; left: 2px; top: 0.55em;
    width: 9px; height: 9px; border-radius: 50%;
    background: radial-gradient(circle at 32% 30%, #9fd0ff, #0033cc 70%);
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.4);
  }
  .ball-list li:nth-child(3n+2)::before { background: radial-gradient(circle at 32% 30%, #ffd0d0, #cc0000 70%); }
  .ball-list li:nth-child(3n)::before { background: radial-gradient(circle at 32% 30%, #d0ffd0, #009900 70%); }
  .ball-list.dense li { padding-top: 2px; padding-bottom: 2px; }

  .webring-nav { display: flex; flex-wrap: wrap; gap: 3px; justify-content: center; padding: 6px; }
  .webring-nav button {
    background: var(--face);
    border: 2px outset #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.66rem;
    padding: 2px 5px;
    cursor: pointer;
  }
  .webring-nav button:active { border-style: inset; }
  .webring-owner { margin: 0; padding: 0 6px 8px; text-align: center; font-size: 0.78rem; }
  .nowplaying { text-align: center; padding: 8px; font-size: 0.8rem; }
  .nowplaying .note { color: var(--maroon); }
  .nowplaying tt { font-size: 0.82rem; }

  /* Content cards (section tables) */
  .card {
    background: var(--paper);
    border: 2px outset #fff;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.55);
    margin-bottom: 18px;
    scroll-margin-top: 10px;
  }
  .card-bar {
    background: linear-gradient(180deg, #0aa0a0, var(--teal));
    color: #fff;
    font-weight: 700;
    font-size: 1.18rem;
    padding: 6px 12px;
    border-bottom: 2px solid #004c4c;
    text-shadow: 1px 1px 0 #004c4c;
  }
  .card-body { padding: 12px 16px 16px; }
  .card-body p { margin: 0 0 10px; }
  .quote { color: var(--maroon); font-style: italic; font-size: 1.08rem; border-left: 4px solid var(--teal); padding-left: 12px; }

  /* Experience */
  .job { padding: 10px 0; border-bottom: 1px dashed #b9b29a; }
  .job:last-child { border-bottom: none; }
  .job-head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px; }
  .job-title { color: var(--navy); font-size: 1.12rem; }
  .job-period { font-family: 'Courier New', monospace; font-size: 0.82rem; color: #555; white-space: nowrap; }
  .job-company { font-size: 0.95rem; margin-bottom: 4px; }
  .job-company a { color: var(--link); }
  .job-desc { font-style: italic; }
  .tech { font-size: 0.86rem; color: #333; margin-top: 6px; }
  .early .job-title { color: var(--maroon); }

  /* Skills table */
  .skill-table { width: 100%; border-collapse: collapse; }
  .skill-table td { border: 1px solid #c9c2aa; padding: 5px 8px; vertical-align: top; }
  .skill-cat { background: #eef3d8; font-weight: 700; color: var(--navy); width: 38%; white-space: nowrap; }
  .skill-items { font-size: 0.94rem; }
  .lang-line { margin-top: 12px; }

  /* Education two columns */
  .two-up { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .mini-h { font-weight: 700; color: var(--teal); border-bottom: 1px solid var(--teal); margin: 0 0 6px; padding-bottom: 2px; }
  .two-up .mini-h:not(:first-child) { margin-top: 12px; }
  .muted { color: #555; font-size: 0.88rem; }

  .hot { font-size: 0.9rem; }

  /* Guestbook */
  .mailheart { color: #cc0000; }
  .gb-form { display: flex; flex-direction: column; gap: 8px; background: #fff7d6; border: 1px solid #d9cf8a; padding: 12px; margin-bottom: 14px; }
  .gb-form label { display: flex; flex-direction: column; gap: 3px; font-weight: 700; font-size: 0.9rem; text-align: left; }
  .gb-form input, .gb-form textarea {
    font-family: 'Times New Roman', Times, serif;
    font-size: 1rem;
    border: 2px inset #fff;
    padding: 4px 6px;
    background: #fff;
    resize: vertical;
  }
  .gb-submit {
    align-self: flex-start;
    background: var(--face);
    border: 2px outset #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 700;
    font-size: 0.86rem;
    padding: 4px 16px;
    cursor: pointer;
  }
  .gb-submit:active { border-style: inset; }
  .gb-submit:focus-visible { outline: 1px dotted #000; outline-offset: 2px; }
  .gb-entries { display: flex; flex-direction: column; gap: 8px; }
  .gb-entry { border: 1px solid #cdc6ac; background: #fffef7; padding: 7px 10px; text-align: left; }
  .gb-entry.fresh { border-color: var(--teal); background: #eafafa; }
  .gb-name { font-weight: 700; color: var(--link); }
  .gb-date { float: right; font-family: 'Courier New', monospace; font-size: 0.76rem; color: #777; }
  .gb-msg { margin: 4px 0 0; font-style: italic; }

  /* Footer */
  .ftr { text-align: center; color: #cfe3ff; margin-top: 14px; }
  .ftr a, .ftr a:link, .ftr a:visited { color: #ffe14d; }
  .ftr-meta { font-size: 0.84rem; margin: 4px 0; color: #aebfe8; }
  .ftr-meta b { color: #fff; }

  /* Links (period blue/purple) */
  .nn-content a { color: var(--link); text-decoration: underline; }
  .nn-content a:visited { color: var(--visited); }
  .nav-box a, .card-body a { font-weight: 400; }
  .nn-content a:hover { color: #cc0000; }

  .new {
    background: #cc0000; color: #ffff00;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.6rem; font-weight: 800;
    padding: 0 3px; margin-left: 4px;
    vertical-align: middle;
  }

  /* ══ SPARKLE CURSOR TRAIL ══ */
  .sparkles { position: fixed; inset: 0; pointer-events: none; z-index: 9991; }
  .sparkle {
    position: fixed;
    transform: translate(-50%, -50%);
    color: #fff8b0;
    font-size: 14px;
    text-shadow: 0 0 5px #ffe066, 0 0 9px #fff;
    animation: sparkle 0.7s ease-out forwards;
  }
  @keyframes sparkle {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1.1) rotate(0deg); }
    100% { opacity: 0; transform: translate(-50%, 10px) scale(0.2) rotate(90deg); }
  }

  /* ══ [JavaScript Application] ALERT ══ */
  .js-backdrop {
    position: fixed; inset: 0; z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0, 0, 32, 0.25);
  }
  .js-alert {
    min-width: 290px; max-width: 90vw;
    background: var(--face, #c0c0c0);
    border: 2px outset #fff;
    box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.5);
    font-family: Arial, Helvetica, sans-serif;
  }
  .js-titlebar {
    background: linear-gradient(90deg, #000080, #1084d0);
    color: #fff; font-weight: 700; font-size: 0.8rem;
    padding: 3px 8px;
  }
  .js-body { display: flex; gap: 12px; padding: 16px 16px 8px; align-items: flex-start; }
  .js-icon { font-size: 1.8rem; color: #d4a017; flex: none; }
  .js-msg { margin: 0; font-size: 0.9rem; white-space: pre-line; line-height: 1.4; color: #000; }
  .js-foot { display: flex; justify-content: center; padding: 6px 16px 16px; }
  .js-ok {
    min-width: 80px;
    background: var(--face, #c0c0c0);
    border: 2px outset #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 0.84rem;
    padding: 4px 18px;
    cursor: pointer;
  }
  .js-ok:active { border-style: inset; }
  .js-ok:focus-visible { outline: 1px dotted #000; outline-offset: 2px; }

  /* ══ RESPONSIVE (mobile: collapse the chrome, stack the table) ══ */
  @media (max-width: 720px) {
    .nn-menubar { display: none; }
    .nn-tb-lab { display: none; }
    .nn-tb-btn { min-width: 0; padding: 4px 7px; }
    .layout, .layout tbody, .layout tr, .nav-col, .content-col { display: block; width: auto; }
    .nav-col { padding-right: 0; }
    .two-up { grid-template-columns: 1fr; }
  }
  @media (max-width: 460px) {
    .nn-tb-btn:nth-child(n+6) { display: none; } /* keep Back/Fwd/Reload/Home/Images */
    .nn-doc { display: none; }
    .page { padding: 14px 8px 90px; }
    .badge { width: 76px; }
  }

  /* ══ REDUCED MOTION — silence every period animation ══ */
  @media (prefers-reduced-motion: reduce) {
    .marquee-track { animation: none; transform: translateX(0); }
    .rainbow { animation: none; background-position: 0 0; }
    .blink, .bg-netscape .blip { animation: none; opacity: 1; }
    .nn-comet { animation: none; opacity: 0; }
    .nn-meteor { animation: none; }
    .nn-progress { animation: none; }
  }
</style>
