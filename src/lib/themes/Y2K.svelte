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

  const gels = [
    { id: 'bondi', glow: '#d4f7ff', mid: '#3aa9d6', deep: '#0b6c9e', edge: '#053f66' },
    { id: 'tangerine', glow: '#ffe7b0', mid: '#ff8a1f', deep: '#d0520a', edge: '#862e00' },
    { id: 'lime', glow: '#f3ffc9', mid: '#92d83a', deep: '#4c9611', edge: '#2a5f05' },
    { id: 'grape', glow: '#f2dcff', mid: '#9d62d8', deep: '#5d2b9c', edge: '#351260' }
  ];
  const floorRays = Array.from({ length: 81 }, (_, i) => `M500 0L${500 + (i - 40) * 72} 1000`).join('');
  const floorLines = Array.from({ length: 36 }, (_, i) => i);
  const amber = '255 196 120';
  const cyan = '130 228 255';
  const ghosts = [
    { t: 0.2, d: 2.4, kind: 'disc', c: amber, a: 0.55 },
    { t: 0.33, d: 5.1, kind: 'hex', c: cyan, a: 0.5 },
    { t: 0.44, d: 1.3, kind: 'disc', c: '255 255 255', a: 0.8 },
    { t: 0.56, d: 8.9, kind: 'ring', c: cyan, a: 0.45 },
    { t: 0.64, d: 3.1, kind: 'disc', c: amber, a: 0.45 },
    { t: 1.42, d: 13.3, kind: 'ring', c: '255 200 130', a: 0.35 },
    { t: 1.54, d: 4, kind: 'hex', c: cyan, a: 0.5 },
    { t: 1.7, d: 7.1, kind: 'disc', c: '190 170 255', a: 0.3 },
    { t: 1.86, d: 2.2, kind: 'disc', c: cyan, a: 0.6 }
  ];
  const depth = [-3, -5, -8, -15, 6];
  const planes: (HTMLElement | undefined)[] = $state([]);

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

    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let praf = 0;
    const paint = () =>
      planes.forEach((el, i) => {
        if (el) el.style.transform = `translate3d(${(px * depth[i]).toFixed(2)}px, ${(py * depth[i] * 0.6).toFixed(2)}px, 0)`;
      });
    const glide = () => {
      px += (tx - px) * 0.07;
      py += (ty - py) * 0.07;
      const done = Math.abs(tx - px) < 0.002 && Math.abs(ty - py) < 0.002;
      if (done) {
        px = tx;
        py = ty;
      }
      paint();
      praf = done ? 0 : requestAnimationFrame(glide);
    };
    const aim = (x: number, y: number) => {
      tx = x;
      ty = y;
      if (!praf) praf = requestAnimationFrame(glide);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || narrow) return;
      aim((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLeave = () => aim(0, 0);
    const parallax = !reduced && window.matchMedia('(pointer: fine)').matches;
    if (parallax) {
      window.addEventListener('pointermove', onPointer, { passive: true });
      document.documentElement.addEventListener('mouseleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(praf);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('mouseleave', onLeave);
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

{#snippet star(cls: string)}
  <svg class={cls} viewBox="-1 -1 2 2" aria-hidden="true" focusable="false">
    <path d="M0 -1C0.09 -0.2 0.2 -0.09 1 0C0.2 0.09 0.09 0.2 0 1C-0.09 0.2 -0.2 0.09 -1 0C-0.2 -0.09 -0.09 -0.2 0 -1Z" fill="#fff" />
    <path d="M0 -1C0.09 -0.2 0.2 -0.09 1 0C0.2 0.09 0.09 0.2 0 1C-0.09 0.2 -0.2 0.09 -1 0C-0.2 -0.09 -0.09 -0.2 0 -1Z" fill="#dff8ff" transform="rotate(45) scale(0.46)" />
    <circle r="0.15" fill="#fff" />
  </svg>
{/snippet}

<div class="y2k" class:narrow>
  <div class="sky" class:with-console={entered || leaving} aria-hidden="true">
    <svg class="sky-defs" width="0" height="0" focusable="false">
      <defs>
        <linearGradient id="{uid}-cr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#082f6e" />
          <stop offset="0.12" stop-color="#1c63b4" />
          <stop offset="0.27" stop-color="#5eaee8" />
          <stop offset="0.4" stop-color="#c4e9fd" />
          <stop offset="0.5" stop-color="#ffffff" />
        </linearGradient>
        <linearGradient id="{uid}-cr-gnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0a1b2e" />
          <stop offset="0.05" stop-color="#1b3854" />
          <stop offset="0.16" stop-color="#4c6f93" />
          <stop offset="0.27" stop-color="#a0c0da" />
          <stop offset="0.36" stop-color="#eaf5fc" />
        </linearGradient>
        <radialGradient id="{uid}-cr-edge" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.68" stop-color="#06203a" stop-opacity="0" />
          <stop offset="0.93" stop-color="#06203a" stop-opacity="0.3" />
          <stop offset="1" stop-color="#06203a" stop-opacity="0.55" />
        </radialGradient>
        <linearGradient id="{uid}-rim" x1="0.2" y1="0.04" x2="0.8" y2="0.96">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="0.38" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="0.72" stop-color="#c8f5ff" stop-opacity="0" />
          <stop offset="1" stop-color="#c8f5ff" stop-opacity="0.95" />
        </linearGradient>
        <radialGradient id="{uid}-spec" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="0.42" stop-color="#ffffff" stop-opacity="0.55" />
          <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="{uid}-gel-hl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.3" />
          <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <clipPath id="{uid}-ball"><circle cx="50" cy="50" r="50" /></clipPath>
        <clipPath id="{uid}-gnd"><ellipse cx="50" cy="120" rx="94" ry="68" /></clipPath>
        <symbol id="{uid}-chrome-ball" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="50" fill="url(#{uid}-cr-sky)" />
          <g clip-path="url(#{uid}-ball)">
            <path d="M9 27Q50 11 91 27L89 31Q50 17 11 31Z" fill="#fff" opacity="0.32" />
            <ellipse cx="50" cy="120" rx="94" ry="68" fill="url(#{uid}-cr-gnd)" />
            <g clip-path="url(#{uid}-gnd)" fill="none" stroke="#9fdcff" stroke-opacity="0.36" stroke-width="0.7">
              <ellipse cx="50" cy="120" rx="80" ry="58" />
              <ellipse cx="50" cy="120" rx="63" ry="45" />
              <ellipse cx="50" cy="120" rx="44" ry="31" />
              <path d="M50 52L-16 100M50 52L10 100M50 52L34 100M50 52L66 100M50 52L90 100M50 52L116 100" />
            </g>
            <ellipse cx="50" cy="120" rx="94" ry="68" fill="none" stroke="#fff" stroke-width="1.3" />
          </g>
          <circle cx="50" cy="50" r="50" fill="url(#{uid}-cr-edge)" />
          <ellipse cx="34" cy="24" rx="17" ry="10" transform="rotate(-34 34 24)" fill="url(#{uid}-spec)" />
          <ellipse cx="32" cy="22" rx="5.5" ry="3.2" transform="rotate(-34 32 22)" fill="#fff" />
          <circle cx="50" cy="50" r="49.2" fill="none" stroke="url(#{uid}-rim)" stroke-width="1.6" />
        </symbol>
        {#each gels as g (g.id)}
          <radialGradient id="{uid}-{g.id}-body" cx="0.56" cy="0.64" r="0.62" fx="0.6" fy="0.8">
            <stop offset="0" stop-color={g.glow} />
            <stop offset="0.34" stop-color={g.mid} />
            <stop offset="0.8" stop-color={g.deep} />
            <stop offset="1" stop-color={g.edge} />
          </radialGradient>
          <radialGradient id="{uid}-{g.id}-caus" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0.85" />
            <stop offset="0.35" stop-color={g.glow} stop-opacity="0.7" />
            <stop offset="1" stop-color={g.glow} stop-opacity="0" />
          </radialGradient>
          <radialGradient id="{uid}-{g.id}-edge" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.72" stop-color={g.edge} stop-opacity="0" />
            <stop offset="0.95" stop-color={g.edge} stop-opacity="0.5" />
            <stop offset="1" stop-color={g.edge} stop-opacity="0.85" />
          </radialGradient>
          <symbol id="{uid}-{g.id}-ball" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="url(#{uid}-{g.id}-body)" fill-opacity="0.96" />
            <ellipse cx="58" cy="80" rx="28" ry="13" fill="url(#{uid}-{g.id}-caus)" />
            <circle cx="50" cy="50" r="50" fill="url(#{uid}-{g.id}-edge)" />
            <ellipse cx="46" cy="26" rx="31" ry="18" fill="url(#{uid}-gel-hl)" />
            <ellipse cx="32" cy="19" rx="5.5" ry="3" transform="rotate(-30 32 19)" fill="#fff" />
            <circle cx="50" cy="50" r="49.3" fill="none" stroke="url(#{uid}-rim)" stroke-width="1.2" opacity="0.8" />
          </symbol>
        {/each}
      </defs>
    </svg>

    <div class="sun">
      <span class="f-glow"></span>
      <span class="f-rays"></span>
      <span class="f-halo"></span>
      <span class="f-streak-soft"></span>
      <span class="f-streak"></span>
      <span class="f-core"></span>
    </div>

    <div class="floor">
      <span class="floor-sun"></span>
      <div class="grid">
        <svg class="rays" viewBox="0 0 1000 1000" preserveAspectRatio="none" focusable="false">
          <path d={floorRays} vector-effect="non-scaling-stroke" />
        </svg>
        {#each floorLines as i (i)}<span class="fl" style="animation-delay: {(-i * 2.4).toFixed(1)}s"></span>{/each}
      </div>
    </div>
    <span class="haze"></span>
    <span class="horizon-line"></span>
    <span class="c-shadow"></span>
    <span class="c-reflect"></span>

    <div class="plane far" bind:this={planes[0]}>
      <span class="orb o-ice"><span class="lift"><svg class="ball" viewBox="0 0 100 100"><use href="#{uid}-bondi-ball" /></svg></span></span>
      <span class="orb o-top"><span class="lift"><svg class="ball" viewBox="0 0 100 100"><use href="#{uid}-chrome-ball" /></svg></span></span>
      <span class="orb o-grape"><span class="lift"><svg class="ball" viewBox="0 0 100 100"><use href="#{uid}-grape-ball" /></svg></span></span>
    </div>

    <div class="plane swoosh" bind:this={planes[1]}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <linearGradient id="{uid}-sw-a" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="0.1" stop-color="#ffffff" stop-opacity="0.85" />
            <stop offset="0.42" stop-color="#d4f6ff" stop-opacity="0.4" />
            <stop offset="0.78" stop-color="#7fe6ff" stop-opacity="0.5" />
            <stop offset="1" stop-color="#7fe6ff" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="{uid}-sw-b" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="0.12" stop-color="#f4f8fb" stop-opacity="0.85" />
            <stop offset="0.48" stop-color="#c3d3e0" stop-opacity="0.6" />
            <stop offset="0.82" stop-color="#eef5f9" stop-opacity="0.6" />
            <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="{uid}-sw-c" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0" stop-color="#9ff0ff" stop-opacity="0" />
            <stop offset="0.2" stop-color="#9ff0ff" stop-opacity="0.8" />
            <stop offset="0.62" stop-color="#ffffff" stop-opacity="0.75" />
            <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="M-40 716C380 664 960 540 1480 150L1480 178C990 580 390 744-40 772Z" fill="url(#{uid}-sw-a)" />
        <path d="M-40 716C380 664 960 540 1480 150" fill="none" stroke="#fff" stroke-opacity="0.8" stroke-width="1.4" />
        <path d="M-40 800C420 760 1000 640 1480 250L1480 262C1010 660 420 784-40 822Z" fill="url(#{uid}-sw-b)" />
        <path d="M-40 250C260 120 760 40 1480 110L1480 118C760 54 262 134-40 262Z" fill="url(#{uid}-sw-c)" />
      </svg>
    </div>

    <div class="plane mid" bind:this={planes[2]}>
      <span class="orb o-lime"><span class="lift"><svg class="ball" viewBox="0 0 100 100"><use href="#{uid}-lime-ball" /></svg></span></span>
      <span class="orb o-tang">
        <span class="shadow"></span>
        <span class="lift"><svg class="ball" viewBox="0 0 100 100"><use href="#{uid}-tangerine-ball" /></svg>{@render star('glint on-orb')}</span>
      </span>
    </div>

    <div class="plane near" bind:this={planes[3]}>
      <span class="orb o-chrome">
        <span class="lift">
          <svg class="ball" viewBox="0 0 100 100">
            <use href="#{uid}-chrome-ball" />
            <g opacity="0.7">
              <path d="M3.5 37Q11 32.5 21 33L22 61Q12 63.5 4.5 59.5Q1.8 48 3.5 37Z" fill="#e4edf3" />
              <path d="M6.5 39.5Q12.5 36.5 19.5 37L20 57.5Q13 59.5 7.5 57Q5.4 48 6.5 39.5Z" fill="#0d3a60" />
              <path d="M7 40Q12.5 37.5 19.5 38" fill="none" stroke="#8fd8ff" stroke-width="0.7" opacity="0.7" />
            </g>
          </svg>
          {@render star('glint on-orb')}
        </span>
      </span>
      <span class="orb o-bondi">
        <span class="shadow"></span>
        <span class="lift"><svg class="ball" viewBox="0 0 100 100"><use href="#{uid}-bondi-ball" /></svg>{@render star('glint on-orb')}</span>
      </span>
    </div>

    <div class="ghosts" bind:this={planes[4]}>
      {#each ghosts as g, i (i)}<span class="gh gh-{g.kind}" style="--t: {g.t}; --d: {g.d}cqmin; --c: {g.c}; --a: {g.a}; animation-delay: {-i * 1.3}s"></span>{/each}
    </div>
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

  {#if entered}
    <div class="glints" aria-hidden="true">
      {@render star('glint cg1')}
      {@render star('glint cg2')}
      {@render star('glint cg3')}
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

  .sky,
  .glints {
    --cw: min(960px, 100cqw - 48px);
    --ch: min(600px, 100cqh - 140px);
    --cl: calc(50cqw - var(--cw) / 2);
    --cr: calc(50cqw + var(--cw) / 2);
    --ct: calc(20px + (100cqh - 140px - var(--ch)) / 2);
    --cb: calc(var(--ct) + var(--ch));
    --sx: max(26px, calc(var(--cl) * 0.5));
    --sy: max(22px, calc(var(--ct) * 0.62));
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    container-type: size;
  }
  .sky {
    background:
      radial-gradient(ellipse var(--bloom-w, 50%) 22% at 50% 43%, rgba(242, 251, 255, 0.86), rgba(242, 251, 255, 0.62) 55%, rgba(242, 251, 255, 0) 100%),
      radial-gradient(ellipse 52% 36% at 50% 46%, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2) 55%, rgba(255, 255, 255, 0) 100%),
      linear-gradient(180deg, #0a3783 0%, #145aae 11%, #2b83d2 23%, #62b3ec 34%, #a2d9f9 44%, #d6f1ff 53%, #f4fbff 59.6%, #f4fbff 100%);
  }
  .glints { z-index: 3; }
  .sky-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
  .sky span { position: absolute; display: block; }

  .sun,
  .ghosts {
    position: absolute;
    inset: 0;
    mix-blend-mode: screen;
  }
  .sun > span {
    left: calc(var(--sx) - var(--r));
    top: calc(var(--sy) - var(--r));
    width: calc(var(--r) * 2);
    height: calc(var(--r) * 2);
    border-radius: 50%;
  }
  .f-glow {
    --r: 320px;
    background: radial-gradient(closest-side, rgba(255, 246, 222, 0.95), rgba(255, 226, 178, 0.6) 9%, rgba(160, 214, 255, 0.34) 30%, rgba(110, 180, 255, 0.1) 60%, rgba(110, 180, 255, 0));
    animation: sunBreathe 7s ease-in-out infinite alternate;
  }
  .f-rays {
    --r: 200px;
    background:
      repeating-conic-gradient(from 4deg, rgba(255, 255, 255, 0.3) 0deg 0.9deg, rgba(255, 255, 255, 0) 1.6deg 15deg),
      repeating-conic-gradient(from 11deg, rgba(255, 240, 210, 0.18) 0deg 0.6deg, rgba(255, 240, 210, 0) 1.2deg 22.5deg);
    -webkit-mask-image: radial-gradient(closest-side, #000 6%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%);
    mask-image: radial-gradient(closest-side, #000 6%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 100%);
    animation: sunSpin 140s linear infinite;
  }
  .f-halo {
    --r: 134px;
    background: radial-gradient(closest-side, rgba(255, 255, 255, 0) 80%, rgba(255, 214, 150, 0.22) 86%, rgba(150, 230, 255, 0.3) 92%, rgba(150, 230, 255, 0) 98%);
  }
  .f-core {
    --r: 36px;
    background: radial-gradient(closest-side, #fff 0 28%, rgba(255, 242, 206, 0.92) 42%, rgba(255, 210, 140, 0.35) 66%, rgba(255, 210, 140, 0));
  }
  .sun > .f-streak,
  .sun > .f-streak-soft {
    left: calc(var(--sx) - var(--rx));
    top: calc(var(--sy) - var(--ry));
    width: calc(var(--rx) * 2);
    height: calc(var(--ry) * 2);
  }
  .f-streak {
    --rx: 420px;
    --ry: 1px;
    border-radius: 0;
    background: linear-gradient(90deg, rgba(150, 225, 255, 0), rgba(150, 225, 255, 0.6) 36%, #fff 50%, rgba(150, 225, 255, 0.6) 64%, rgba(150, 225, 255, 0));
  }
  .f-streak-soft {
    --rx: 520px;
    --ry: 16px;
    background: radial-gradient(closest-side, rgba(150, 215, 255, 0.4), rgba(150, 215, 255, 0.12) 60%, rgba(150, 215, 255, 0));
  }
  @keyframes sunBreathe {
    from { transform: scale(0.94); opacity: 0.86; }
    to { transform: scale(1.04); opacity: 1; }
  }
  @keyframes sunSpin {
    to { transform: rotate(360deg); }
  }

  .gh {
    width: var(--d);
    height: var(--d);
    left: calc(var(--sx) + var(--t) * (50cqw - var(--sx)) - var(--d) / 2);
    top: calc(var(--sy) + var(--t) * (50cqh - var(--sy)) - var(--d) / 2);
    border-radius: 50%;
    opacity: var(--a);
    animation: ghostPulse 7s ease-in-out infinite alternate;
  }
  .gh-disc { background: radial-gradient(closest-side, rgb(var(--c) / 0.6), rgb(var(--c) / 0.22) 70%, rgb(var(--c) / 0)); }
  .gh-ring { background: radial-gradient(closest-side, rgb(var(--c) / 0.06) 0 62%, rgb(var(--c) / 0.5) 86%, rgb(var(--c) / 0.12) 94%, rgb(var(--c) / 0)); }
  .gh-hex {
    border-radius: 0;
    clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%);
    background: linear-gradient(150deg, rgb(var(--c) / 0.46), rgb(var(--c) / 0.1));
  }
  @keyframes ghostPulse {
    from { opacity: calc(var(--a) * 0.7); }
    to { opacity: var(--a); }
  }

  .floor {
    position: absolute;
    left: 0;
    right: 0;
    top: 60%;
    bottom: 0;
    overflow: hidden;
    container-type: size;
    background:
      radial-gradient(ellipse var(--fg-w, 22%) 46% at 50% 8%, rgba(248, 253, 255, 0.74), rgba(248, 253, 255, 0.4) 55%, rgba(248, 253, 255, 0)),
      linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0) 10%),
      linear-gradient(180deg, #eaf8ff 0%, #c4e8fb 16%, #97d0f2 50%, #6fbae8 100%);
  }
  .grid {
    position: absolute;
    inset: 0;
    -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 12%, #000 44%);
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 12%, #000 44%);
  }
  .rays {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .rays path { fill: none; stroke: rgba(20, 116, 184, 0.46); stroke-width: 1; }
  .floor .fl {
    left: 0;
    right: 0;
    top: -1px;
    height: 2px;
    background: linear-gradient(90deg, rgba(20, 116, 184, 0.3), rgba(20, 116, 184, 0.62) 20% 80%, rgba(20, 116, 184, 0.3));
    animation: floorRun 86.4s linear infinite;
  }
  @keyframes floorRun {
    0% { transform: translateY(11.2cqh) scaleY(0.35); opacity: 0; }
    25% { transform: translateY(14.4cqh) scaleY(0.4); opacity: 0.35; }
    50% { transform: translateY(20.16cqh) scaleY(0.48); opacity: 0.6; }
    62.5% { transform: translateY(25.2cqh) scaleY(0.55); opacity: 0.7; }
    75% { transform: translateY(33.56cqh) scaleY(0.64); opacity: 0.8; }
    81.25% { transform: translateY(40.2cqh) scaleY(0.72); opacity: 0.86; }
    87.5% { transform: translateY(50.25cqh) scaleY(0.8); opacity: 0.9; }
    91.67% { transform: translateY(60.2cqh) scaleY(0.88); opacity: 0.94; }
    94.44% { transform: translateY(69.4cqh) scaleY(0.94); opacity: 0.97; }
    97.22% { transform: translateY(81.98cqh) scaleY(1); opacity: 1; }
    100% { transform: translateY(100cqh) scaleY(1.1); opacity: 1; }
  }
  .floor-sun {
    left: calc(var(--sx) - 90px);
    width: 180px;
    top: 0;
    height: 80%;
    background: radial-gradient(50% 100% at 50% 0%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.16) 45%, rgba(255, 255, 255, 0));
  }
  .haze {
    left: 0;
    right: 0;
    top: 44%;
    height: 24%;
    background: linear-gradient(180deg, rgba(240, 250, 255, 0) 0%, rgba(240, 250, 255, 0.5) 50%, rgba(250, 253, 255, 0.86) 66.6%, rgba(236, 248, 255, 0.3) 80%, rgba(236, 248, 255, 0) 100%);
  }
  .horizon-line {
    left: 0;
    right: 0;
    top: calc(60% - 0.5px);
    height: 1px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0), #fff 18% 82%, rgba(255, 255, 255, 0));
  }
  .horizon-line::after {
    content: '';
    position: absolute;
    left: 10%;
    right: 10%;
    top: -7px;
    height: 15px;
    background: radial-gradient(closest-side, rgba(255, 255, 255, 0.95), rgba(210, 244, 255, 0.4) 55%, rgba(210, 244, 255, 0));
  }
  .c-shadow,
  .c-reflect {
    opacity: 0;
    transition: opacity 0.9s ease 0.3s;
  }
  .with-console .c-shadow,
  .with-console .c-reflect { opacity: 1; }
  .c-shadow {
    left: calc(var(--cl) + 30px);
    width: calc(var(--cw) - 60px);
    top: calc(var(--cb) - 18px);
    height: 38px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(6, 40, 72, 0.34), rgba(6, 40, 72, 0.12) 60%, rgba(6, 40, 72, 0));
  }
  .c-reflect {
    left: calc(var(--cl) + 26px);
    width: calc(var(--cw) - 52px);
    top: calc(var(--cb) + 3px);
    height: max(0px, min(110px, 100cqh - var(--cb) - 3px));
    background: linear-gradient(180deg, rgba(248, 251, 253, 0.55), rgba(34, 104, 158, 0.24) 12%, rgba(210, 228, 240, 0.18) 36%, rgba(210, 228, 240, 0) 100%);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 12% 88%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 12% 88%, transparent);
  }

  .plane {
    position: absolute;
    inset: 0;
  }
  .swoosh svg {
    position: absolute;
    inset: -2% -3%;
    width: 106%;
    height: 104%;
    animation: swooshDrift 32s ease-in-out infinite alternate;
  }
  @keyframes swooshDrift {
    from { transform: translate3d(-12px, 4px, 0); }
    to { transform: translate3d(12px, -4px, 0); }
  }

  .orb {
    width: var(--s);
    height: var(--s);
    left: calc(var(--x) - var(--s) / 2);
    top: calc(var(--y) - var(--s) / 2);
  }
  .orb .lift {
    inset: 0;
    animation: orbBob var(--bob, 10s) ease-in-out var(--dl, 0s) infinite;
  }
  .ball {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .orb .shadow {
    left: -8%;
    width: 116%;
    top: calc(100% + var(--s) * 0.14);
    height: 24%;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(3, 36, 66, 0.44), rgba(3, 36, 66, 0.16) 58%, rgba(3, 36, 66, 0));
    animation: orbShade var(--bob, 10s) ease-in-out var(--dl, 0s) infinite;
  }
  @keyframes orbBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-7%); }
  }
  @keyframes orbShade {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.86); opacity: 0.7; }
  }
  .far .ball {
    filter: blur(0.8px) saturate(0.55) brightness(1.06);
    opacity: 0.78;
  }
  .o-chrome { --s: min(172px, var(--cl) - 26px); --x: calc(100cqw - var(--cl) / 2); --y: calc(var(--ct) + var(--ch) * 0.25); --bob: 11s; --dl: -2s; }
  .o-bondi { --s: min(138px, var(--cl) - 34px); --x: calc(var(--cl) / 2); --y: calc(var(--ct) + var(--ch) * 0.73); --bob: 9s; --dl: -5s; }
  .o-lime { --s: min(74px, var(--cl) - 40px); --x: calc(var(--cl) * 0.56); --y: calc(var(--ct) + var(--ch) * 0.3); --bob: 8s; --dl: -1s; }
  .o-tang { --s: min(92px, var(--cl) - 36px); --x: calc(100cqw - var(--cl) * 0.46); --y: calc(var(--ct) + var(--ch) * 0.7); --bob: 10s; --dl: -7s; }
  .o-grape { --s: min(34px, var(--cl) - 44px); --x: calc(100cqw - var(--cl) * 0.7); --y: calc(var(--ct) + var(--ch) * 0.5); --bob: 13s; --dl: -4s; }
  .o-ice { --s: min(26px, var(--cl) - 44px); --x: calc(var(--cl) * 0.25); --y: calc(var(--ct) + var(--ch) * 0.5); --bob: 12s; --dl: -9s; }
  .o-top { --s: max(0px, min(30px, var(--ct) - 46px)); --x: 70cqw; --y: calc(var(--ct) / 2); --bob: 14s; --dl: -6s; }

  .glint {
    position: absolute;
    overflow: visible;
    filter: drop-shadow(0 0 3px rgba(200, 244, 255, 0.95));
    animation: twinkle 3.6s ease-in-out var(--tw, 0s) infinite;
  }
  .glint.on-orb {
    width: calc(var(--s) * 0.34);
    height: calc(var(--s) * 0.34);
    left: calc(32% - var(--s) * 0.17);
    top: calc(22% - var(--s) * 0.17);
  }
  .o-chrome .glint { --tw: -0.4s; }
  .o-bondi .glint { --tw: -2.1s; left: calc(32% - var(--s) * 0.17); top: calc(19% - var(--s) * 0.17); }
  .o-tang .glint { --tw: -1.3s; top: calc(19% - var(--s) * 0.17); }
  .glint.cg1 { --tw: -0.9s; width: 44px; height: 44px; left: calc(var(--cl) + 11px - 22px); top: calc(var(--ct) + 11px - 22px); }
  .glint.cg2 { --tw: -2.6s; width: 22px; height: 22px; left: calc(var(--cr) - 11px - 11px); top: calc(var(--ct) + 11px - 11px); }
  .glint.cg3 { --tw: -1.7s; width: 16px; height: 16px; left: calc(var(--cl) + 3px - 8px); top: calc(var(--ct) + var(--ch) * 0.3 - 8px); }
  @keyframes twinkle {
    0%, 100% { transform: scale(0.5) rotate(0deg); opacity: 0.5; }
    42% { transform: scale(1.08) rotate(18deg); opacity: 1; }
    58% { transform: scale(0.92) rotate(26deg); opacity: 0.92; }
  }

  @media (min-width: 760px) and (max-width: 1079px) {
    .o-chrome, .o-bondi, .o-lime, .o-tang, .o-grape, .o-ice { display: none; }
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
  @media (max-height: 720px) and (min-width: 760px) {
    .splash { inset: 0 0 150px 0; padding-top: 12px; }
    .splash-inner { gap: 8px; }
    .splash-logo { transform: scale(0.72); margin: -26px 0 -30px; }
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
    .sky { --sx: 22px; --sy: 20px; --bloom-w: 80%; --fg-w: 44%; }
    .plane, .ghosts { transform: none !important; }
    .plane.mid, .plane.far, .o-chrome .glint, .gh:nth-child(n+6), .c-shadow, .c-reflect, .f-rays { display: none; }
    .sun { transform: scale(0.55); transform-origin: var(--sx) var(--sy); }
    .o-chrome { --s: 32px; --x: 38cqw; --y: 31px; }
    .o-bondi { --s: 42px; --x: 40px; --y: calc(100cqh - 126px); }
    .glints { display: none; }
  }

  @media (prefers-reduced-motion: reduce) {
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
    .floor .fl { animation-play-state: paused; }
    .orb .lift, .orb .shadow, .glint, .f-glow, .f-rays, .gh, .swoosh svg { animation: none; }
    .c-shadow, .c-reflect { transition: none; }
  }
</style>
