<script lang="ts">
  import { onMount } from 'svelte';
  import type LenisType from 'lenis';
  import { getCvData, getUi } from '$lib/i18n';
  import { magnetic } from '$lib/actions/interactive';
  import { currentTheme } from '$lib/store';

  const cvData = getCvData();
  const t = getUi().parallax;

  // ──────────────────────────────────────────────────────────────────────────
  // Parallax / Immersive Scroll — the premium "craft web" era (~2018–today).
  // The page stops being a document and becomes a cinematic thing you SCROLL:
  // smooth-scroll with inertia (Lenis, lazy), multi-plane parallax against the
  // background, content that reveals gradually with choreographed timing. The
  // aesthetic is the protagonist — content is a curated subset of cv-data.ts.
  // References: synthesis.capital (light/editorial) + tresmarescapital.com.
  //
  // Everything degrades to a clean static vertical scroll under reduced-motion:
  // no Lenis, no parallax, no custom cursor, no auto-scroll — content always
  // present and reachable (progressive enhancement: the `motion` class gates it).
  // ──────────────────────────────────────────────────────────────────────────

  // ── Curated content (source of truth stays cv-data.ts — we select, never invent) ──
  const heroKicker = t.heroKicker(cvData.role);
  const profileStatement = cvData.summary.split('. ')[0] + '.';
  const experiences = cvData.experience; // editorial "index" rows (no bullet lists)
  const skillsRowA = cvData.skills.filter((_, i) => i % 2 === 0);
  const skillsRowB = cvData.skills.filter((_, i) => i % 2 === 1);

  // Words emphasised (terracotta) inside the big serif statements. Presentation
  // over real copy — not invented data.
  const HL = new Set(t.highlightWords);
  const isHL = (w: string) => HL.has(w.toLowerCase().replace(/[.,;:—–()]/g, ''));

  // ── Animated key figures (all derived from cv-data.ts) ──
  const START_YEAR = cvData.keyFigures.startYear;
  const targetYears = (typeof Date !== 'undefined' ? new Date().getFullYear() : 2026) - START_YEAR;
  const targetProducts = cvData.keyFigures.products;
  const targetSectors = cvData.keyFigures.sectors;

  const sectionNames = t.sectionNames;

  // ── element refs / reactive UI state ──
  let root = $state<HTMLElement>();
  let scroller = $state<HTMLElement>();
  let content = $state<HTMLElement>();
  let cursorEl = $state<HTMLElement>();
  let sectionEls = $state<HTMLElement[]>([]);

  let progress = $state(0);
  let active = $state(0);
  let motion = $state(false); // true only when JS runs AND motion isn't reduced
  let cursorActive = $state(false);
  let auto = $state(false);
  let canAuto = $state(false);

  let statYears = $state(0);
  let statProducts = $state(0);
  let statSectors = $state(0);

  // Lenis lives at component scope so toggleAuto()/goTo() can reach it.
  let lenis: LenisType | null = null;

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toggleAuto() {
    if (!canAuto || !lenis || !scroller) return;
    auto = !auto;
    if (auto) {
      const limit = scroller.scrollHeight - scroller.clientHeight;
      const remaining = limit - scroller.scrollTop;
      const vh = scroller.clientHeight || 1;
      const duration = Math.max(6, (remaining / vh) * 7); // ~7s per viewport, gentle
      lenis.scrollTo(limit, { duration, easing: (t: number) => t, onComplete: () => (auto = false) });
    } else {
      lenis.scrollTo(scroller.scrollTop, { immediate: true, force: true });
    }
  }

  function goTo(i: number) {
    const el = sectionEls[i];
    if (!el) return;
    auto = false;
    if (lenis) lenis.scrollTo(el, { duration: 1.1 });
    else el.scrollIntoView({ behavior: motion ? 'smooth' : 'auto' });
  }

  onMount(() => {
    const reduced = prefersReduced();
    motion = !reduced;
    canAuto = !reduced;

    // ── Reveal-on-scroll (masked lines / staggered words add `.in`) ──
    let io: IntersectionObserver | null = null;
    if (motion && 'IntersectionObserver' in window && content) {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries)
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io!.unobserve(e.target);
            }
        },
        { threshold: 0.2, rootMargin: '0px 0px -8% 0px', root: scroller }
      );
      content.querySelectorAll('[data-reveal]').forEach((el) => io!.observe(el));
    }

    // ── Key-figure counters (run once when the stats scene enters) ──
    let statsDone = false;
    const runStats = () => {
      if (statsDone) return;
      statsDone = true;
      if (!motion) {
        statYears = targetYears;
        statProducts = targetProducts;
        statSectors = targetSectors;
        return;
      }
      const t0 = performance.now();
      const dur = 1500;
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
        statYears = Math.round(targetYears * e);
        statProducts = Math.round(targetProducts * e);
        statSectors = Math.round(targetSectors * e);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    let statsIO: IntersectionObserver | null = null;
    if (!motion) {
      runStats();
    } else if ('IntersectionObserver' in window && sectionEls[3]) {
      statsIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries)
            if (e.isIntersecting) {
              runStats();
              statsIO!.disconnect();
            }
        },
        { threshold: 0.35, root: scroller }
      );
      statsIO.observe(sectionEls[3]);
    } else {
      runStats();
    }

    // ── Parallax layer cache (measured offsets, recomputed on resize) ──
    let layers: { el: HTMLElement; speed: number; center: number }[] = [];
    const measure = () => {
      if (!scroller || !content) return;
      const wrapTop = scroller.getBoundingClientRect().top;
      const sc = scroller.scrollTop;
      layers = Array.from(content.querySelectorAll<HTMLElement>('[data-parallax]')).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          speed: parseFloat(el.dataset.parallax || '0.1'),
          center: r.top - wrapTop + sc + r.height / 2
        };
      });
    };

    // ── Unified scroll handler: progress + active section + parallax ──
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!scroller) return;
        const sc = scroller.scrollTop;
        const vh = scroller.clientHeight;
        const limit = scroller.scrollHeight - vh;
        progress = limit > 0 ? Math.min(1, sc / limit) : 0;

        const mid = sc + vh * 0.4;
        let idx = 0;
        for (let i = 0; i < sectionEls.length; i++) {
          const el = sectionEls[i];
          if (el && el.offsetTop <= mid) idx = i;
        }
        active = idx;

        if (motion) {
          const c = sc + vh / 2;
          for (const l of layers) l.el.style.setProperty('--py', ((l.center - c) * l.speed).toFixed(1) + 'px');
        }
      });
    };

    scroller?.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => {
      lenis?.resize();
      measure();
      onScroll();
    };
    window.addEventListener('resize', onResize);

    // ── Lenis smooth-scroll (lazy, like Three in the 3D era) ──
    let rafId = 0;
    (async () => {
      if (motion && scroller && content) {
        try {
          const Lenis = (await import('lenis')).default;
          lenis = new Lenis({
            wrapper: scroller,
            content,
            lerp: 0.085,
            wheelMultiplier: 1,
            touchMultiplier: 1.5,
            smoothWheel: true
          });
          const raf = (t: number) => {
            lenis!.raf(t);
            rafId = requestAnimationFrame(raf);
          };
          rafId = requestAnimationFrame(raf);

          // Any manual input cancels the cinematic auto-scroll and halts the tween.
          const cancelAuto = () => {
            if (auto) {
              auto = false;
              lenis?.scrollTo(scroller!.scrollTop, { immediate: true, force: true });
            }
          };
          scroller.addEventListener('wheel', cancelAuto, { passive: true });
          scroller.addEventListener('touchstart', cancelAuto, { passive: true });
        } catch {
          /* Lenis chunk failed — native scroll still works fine. */
        }
      }
      // Measure after layout (and once more after the display font swaps in).
      measure();
      onScroll();
      setTimeout(() => {
        measure();
        onScroll();
      }, 360);
    })();

    // ── Custom cursor (lagging dot + ring; pointer-fine only) ──
    let cleanupCursor = () => {};
    if (motion && cursorEl && window.matchMedia('(pointer: fine)').matches) {
      cursorActive = true;
      let cx = window.innerWidth / 2;
      let cy = window.innerHeight / 2;
      let tx = cx;
      let ty = cy;
      let raf2 = 0;
      const loop = () => {
        raf2 = 0;
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        cursorEl!.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) raf2 = requestAnimationFrame(loop);
      };
      const move = (e: MouseEvent) => {
        tx = e.clientX;
        ty = e.clientY;
        if (!raf2) raf2 = requestAnimationFrame(loop);
      };
      const over = (e: MouseEvent) => {
        const t = e.target as HTMLElement;
        cursorEl!.classList.toggle('hover', !!t.closest('a, button, [data-cursor]'));
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseover', over);
      cleanupCursor = () => {
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseover', over);
        if (raf2) cancelAnimationFrame(raf2);
      };
    }

    return () => {
      io?.disconnect();
      statsIO?.disconnect();
      scroller?.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cleanupCursor();
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  });
</script>

<!-- Masked, staggered reveal of a text run, split into words. Each word rides up
     from behind an overflow mask; the stagger is driven by --i. Under reduced
     motion (no `.motion` on root) the words simply render in place. -->
{#snippet maskText(text: string, extraClass: string)}
  <span class="mask {extraClass}" data-reveal>
    {#each text.split(' ') as word, i}
      <span class="mw"><span class="mi" class:hl={isHL(word)} style="--i:{i}">{word}</span></span>{' '}
    {/each}
  </span>
{/snippet}

<div
  class="px-root"
  class:motion
  class:cursor-custom={cursorActive}
  bind:this={root}
>
  <!-- Scroll progress rail (left edge) -->
  <div class="px-progress" aria-hidden="true"><i style="transform: scaleY({progress})"></i></div>

  <!-- Section index dots (clickable — smooth-scroll to the scene) -->
  <div class="px-side-nav">
    <nav class="px-dots" aria-label={t.sectionsNavLabel}>
      {#each sectionNames as name, i}
        <button
          class="px-dot"
          class:active={active === i}
          onclick={() => goTo(i)}
          aria-label={name}
          aria-current={active === i ? 'true' : undefined}
        ><span></span></button>
      {/each}
    </nav>
    <button type="button" class="px-full-cv" onclick={() => currentTheme.set('bento')}>
      {t.fullCv} <span class="px-full-cv-arrow" aria-hidden="true">→</span>
    </button>
  </div>

  <!-- Cinematic auto-scroll toggle (hidden under reduced motion) -->
  {#if canAuto}
    <div class="px-controls">
      <button class="px-play" onclick={toggleAuto} aria-pressed={auto}>
        <span class="px-play-ico" aria-hidden="true">{auto ? '❚❚' : '▶'}</span>
        {auto ? t.pause : t.play}
      </button>
    </div>
  {/if}

  <!-- Custom cursor -->
  {#if cursorActive}
    <div class="px-cursor" bind:this={cursorEl} aria-hidden="true">
      <span class="cur-dot"></span>
      <span class="cur-ring"></span>
    </div>
  {/if}

  <div class="px-scroller" bind:this={scroller}>
    <div class="px-content" bind:this={content}>
      <!-- Fixed atmospheric layers: a slow drifting gradient mesh + filmic grain. -->
      <div class="px-mesh" aria-hidden="true">
        <span class="m m1"></span>
        <span class="m m2"></span>
        <span class="m m3"></span>
        <span class="m m4"></span>
      </div>
      <!-- Abstract decor scattered down the WHOLE scroll: crisp outlined shapes,
           orbs, dots and marks at varied parallax depths. They drift past as you
           scroll, tying every scene into one continuous space (the mesh above is
           the soft fixed atmosphere; these are the foreground shapes that move).
           Picked up automatically by the parallax engine via [data-parallax]. -->
      <div class="px-decor" aria-hidden="true">
        <!-- Big interweaving shapes: large outlined rings, sweeping arcs, long
             crossing hairlines and soft orbs. Each rides its own parallax depth,
             so on scroll they slide THROUGH one another (the intertwining). -->
        <span class="dx orb o1" data-parallax="0.14"></span>
        <span class="dx ring r1" data-parallax="0.07"></span>
        <span class="dx ring r2" data-parallax="0.24"></span>
        <span class="dx line ln1" data-parallax="0.32"></span>
        <span class="dx dot dt1" data-parallax="0.4"></span>

        <span class="dx orb o2" data-parallax="0.1"></span>
        <span class="dx ring r3" data-parallax="0.09"></span>
        <span class="dx arc a1" data-parallax="0.26"></span>
        <span class="dx line ln2" data-parallax="0.34"></span>
        <span class="dx plus px1" data-parallax="0.38">+</span>

        <span class="dx orb o3" data-parallax="0.15"></span>
        <span class="dx ring r4" data-parallax="0.1"></span>
        <span class="dx ring r5" data-parallax="0.28"></span>
        <span class="dx arc a2" data-parallax="0.18"></span>
        <span class="dx dot dt2" data-parallax="0.36"></span>

        <span class="dx ring r6" data-parallax="0.13"></span>
        <span class="dx arc a3" data-parallax="0.3"></span>
        <span class="dx line ln3" data-parallax="0.34"></span>
      </div>
      <div class="px-grain" aria-hidden="true"></div>

      <!-- ── SCENE 1 · HERO ─────────────────────────────────────────────── -->
      <section class="scene hero" bind:this={sectionEls[0]}>
        <!-- Refined abstract header composition: layered, slowly-animated original
             shapes at different parallax depths — concentric orbit rings, a spinning
             diamond, a soft pulsing orb, drifting dots and twinkling plus-marks. -->
        <div class="hero-art" aria-hidden="true">
          <div class="ha-layer l1" data-parallax="0.08">
            <svg class="ha-rings" viewBox="0 0 440 440" fill="none">
              <circle cx="220" cy="220" r="216" stroke="currentColor" stroke-width="1" opacity="0.5" />
              <circle cx="220" cy="220" r="168" stroke="currentColor" stroke-width="1" stroke-dasharray="2 10" opacity="0.7" />
              <circle cx="220" cy="220" r="118" stroke="currentColor" stroke-width="1" opacity="0.4" />
              <circle class="ha-ring-dot" cx="220" cy="4" r="4" stroke="none" />
            </svg>
          </div>
          <div class="ha-layer l2" data-parallax="0.18">
            <span class="ha-diamond"></span>
          </div>
          <div class="ha-layer l3" data-parallax="0.3">
            <span class="ha-orb"></span>
            <span class="ha-dot d1"></span>
            <span class="ha-dot d2"></span>
            <span class="ha-dot d3"></span>
          </div>
          <span class="ha-plus p1">+</span>
          <span class="ha-plus p2">+</span>
          <span class="ha-plus p3">+</span>
        </div>
        <div class="hero-inner">
          <p class="kicker" data-reveal>{heroKicker}</p>
          <h1 class="display hero-name">
            {@render maskText(cvData.name, 'huge')}
          </h1>
          <p class="hero-manifesto">
            {@render maskText(cvData.tagline, 'lede')}
          </p>
        </div>
        <div class="scroll-hint" data-reveal>
          <span class="sh-label">{t.scrollHint}</span>
          <span class="sh-line" aria-hidden="true"></span>
        </div>
      </section>

      <!-- ── SCENE 2 · PROFILO / MANIFESTO ──────────────────────────────── -->
      <section class="scene statement-scene" bind:this={sectionEls[1]}>
        <span class="scene-no" data-parallax="0.22" aria-hidden="true">01</span>
        <p class="kicker center" data-reveal>{t.profileKicker}</p>
        <h2 class="display statement">
          {@render maskText(profileStatement, '')}
        </h2>
        <span class="draw-line" data-reveal aria-hidden="true"></span>
      </section>

      <!-- ── SCENE 3 · PERCORSO (editorial index, no bullets) ────────────── -->
      <section class="scene exp-scene" bind:this={sectionEls[2]}>
        <div class="scene-head">
          <span class="scene-no inline" aria-hidden="true">02</span>
          <p class="kicker" data-reveal>{t.journeyKicker}</p>
        </div>
        <ul class="exp-index">
          {#each experiences as exp, i}
            <li class="exp-row" class:from-right={i % 2 === 1} data-reveal style="--i:{i}" data-cursor>
              <div class="exp-main">
                <span class="exp-company display">{exp.company}</span>
                <span class="exp-role">{exp.title}</span>
              </div>
              <div class="exp-meta">
                <span class="exp-period">{exp.period}</span>
                {#if exp.sector}<span class="exp-sector">{exp.sector}</span>{/if}
              </div>
              <p class="exp-detail">{exp.description}</p>
            </li>
          {/each}
        </ul>
      </section>

      <!-- ── SCENE 4 · IN CIFRE (pinned, animated counters) ─────────────── -->
      <section class="scene stats-scene" bind:this={sectionEls[3]}>
        <div class="stats-pin">
          <span class="scene-no ghost" data-parallax="0.3" aria-hidden="true">03</span>
          <div class="stats-grid">
            <div class="stat" data-reveal style="--i:0">
              <span class="stat-num display">{statYears}</span>
              <span class="stat-label">{t.statYearsLabel}</span>
              <span class="stat-sub">{t.statYearsSub(START_YEAR)}</span>
            </div>
            <div class="stat" data-reveal style="--i:1">
              <span class="stat-num display">{statProducts}</span>
              <span class="stat-label">{t.statProductsLabel}</span>
              <span class="stat-sub">{t.statProductsSub}</span>
            </div>
            <div class="stat" data-reveal style="--i:2">
              <span class="stat-num display">{statSectors}</span>
              <span class="stat-label">{t.statSectorsLabel}</span>
              <span class="stat-sub">{t.statSectorsSub}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── SCENE 5 · COMPETENZE (kinetic keyword wall) ─────────────────── -->
      <section class="scene skills-scene" bind:this={sectionEls[4]}>
        <div class="scene-head">
          <span class="scene-no inline" aria-hidden="true">04</span>
          <p class="kicker" data-reveal>{t.skillsKicker}</p>
        </div>
        <div class="marquee" aria-hidden="true">
          <div class="mq-track a">
            {#each [...skillsRowA, ...skillsRowA] as s}<span class="mq-item">{s}</span><span class="mq-dot">•</span>{/each}
          </div>
        </div>
        <div class="marquee" aria-hidden="true">
          <div class="mq-track b">
            {#each [...skillsRowB, ...skillsRowB] as s}<span class="mq-item ghost">{s}</span><span class="mq-dot">•</span>{/each}
          </div>
        </div>
        <!-- Accessible, non-animated list of the same skills for AT / reduced motion. -->
        <ul class="skills-static">
          {#each cvData.skills as s}<li>{s}</li>{/each}
        </ul>
      </section>

      <!-- ── SCENE 6 · RITRATTO (treated avatar + quote) ─────────────────── -->
      <section class="scene portrait-scene" bind:this={sectionEls[5]}>
        <div class="portrait" data-parallax="0.12">
          <img class="portrait-img" src="/avatar.svg" alt={cvData.name} loading="lazy" />
          <span class="portrait-duotone" aria-hidden="true"></span>
        </div>
        <blockquote class="portrait-quote display" data-reveal>
          {@render maskText(cvData.tagline, 'quote')}
        </blockquote>
      </section>

      <!-- ── SCENE 7 · CONTATTI (CTA + magnetic buttons) ────────────────── -->
      <section class="scene cta-scene" bind:this={sectionEls[6]}>
        <p class="kicker center" data-reveal>{t.ctaKicker}</p>
        <h2 class="display cta-title">
          {@render maskText(t.ctaTitle, 'huge')}
        </h2>
        <p class="cta-loc" data-reveal><span class="dot">◍</span> {cvData.contact.location}</p>
        <div class="cta-actions" data-reveal>
          <a class="cta-btn primary" href="mailto:{cvData.contact.email}" use:magnetic={{ strength: 0.35 }} data-cursor>
            <span class="cta-btn-in">{t.ctaEmail}</span>
          </a>
          <a class="cta-btn" href={cvData.contact.linkedin} target="_blank" rel="noopener" use:magnetic={{ strength: 0.35 }} data-cursor>
            <span class="cta-btn-in">{t.ctaLinkedin}</span>
          </a>
          <a class="cta-btn" href={cvData.contact.website} target="_blank" rel="noopener" use:magnetic={{ strength: 0.35 }} data-cursor>
            <span class="cta-btn-in">{t.ctaWebsite}</span>
          </a>
        </div>
        <p class="cta-email" data-reveal>{cvData.contact.email}</p>
      </section>
    </div>
  </div>
</div>

<style>
  /* ════════════════════════════════════════════════════════════════════════
     PARALLAX / IMMERSIVE SCROLL — cream editorial palette, high-contrast serif.
     ════════════════════════════════════════════════════════════════════════ */
  .px-root {
    --bg: #f3efe7;
    --bg-warm: #f6f1e7;
    --bg-deep: #ece5d8;
    --ink: #1a1714;
    --ink-soft: #4a443c;
    --muted: #6a6154;
    --line: rgba(26, 23, 20, 0.14);
    --accent: #7d7a4f; /* desaturated olive */
    --accent-2: #b0744f; /* terracotta */
    --serif: 'Fraunces', 'Georgia', 'Times New Roman', serif;
    --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

    position: absolute;
    inset: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }
  .display {
    font-family: var(--serif);
    font-optical-sizing: auto;
    font-weight: 380;
    letter-spacing: -0.012em;
  }

  /* Hide the native cursor only when our custom one is live (and only inside the
     era — the Timeline / audio FAB keep their normal cursor). */
  .px-root.cursor-custom,
  .px-root.cursor-custom * {
    cursor: none;
  }

  /* ── Scroll container (the era scrolls internally; body stays overflow:hidden) ── */
  .px-scroller {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }
  .px-scroller::-webkit-scrollbar {
    width: 0;
  }
  .px-content {
    position: relative;
  }
  :global(.lenis.lenis-smooth) {
    scroll-behavior: auto !important;
  }
  :global(.lenis.lenis-stopped) {
    overflow: hidden;
  }

  /* ── Atmospheric background: drifting gradient mesh ── */
  .px-mesh {
    position: fixed;
    inset: -15%;
    z-index: 0;
    pointer-events: none;
    filter: blur(8px);
  }
  .m {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
    opacity: 0.55;
    will-change: transform;
  }
  .m1 { width: 52vw; height: 52vw; left: -12vw; top: -8vw; background: radial-gradient(circle, #cfd2ab, transparent 68%); animation: drift1 34s ease-in-out infinite; }
  .m2 { width: 44vw; height: 44vw; right: -10vw; top: 6vh; background: radial-gradient(circle, #e8c7ad, transparent 68%); animation: drift2 40s ease-in-out infinite; }
  .m3 { width: 48vw; height: 48vw; left: 18vw; bottom: -16vw; background: radial-gradient(circle, #c9d6cf, transparent 68%); animation: drift3 37s ease-in-out infinite; }
  .m4 { width: 36vw; height: 36vw; right: 8vw; bottom: 4vh; background: radial-gradient(circle, #ddd0bb, transparent 68%); animation: drift1 44s ease-in-out infinite reverse; }

  @keyframes drift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(5vw, 4vh) scale(1.1); } }
  @keyframes drift2 { 0%, 100% { transform: translate(0, 0) scale(1.05); } 50% { transform: translate(-4vw, 6vh) scale(0.92); } }
  @keyframes drift3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(4vw, -5vh) scale(1.08); } }

  /* ── Filmic grain overlay (tiled SVG noise) ── */
  .px-grain {
    position: fixed;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    opacity: 0.5;
    mix-blend-mode: soft-light;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
    background-size: 150px 150px;
  }

  /* ── Scrolling abstract decor — big interweaving parallax shapes ──
     Container is absolute/inset:0 so it never adds scroll height; oversized
     shapes bleeding past the edges are simply clipped. Each shape carries its
     parallax translate on the host; ::before draws ring outlines so nothing
     fights the transform. Sizes are large on purpose — they read as a system. */
  .px-decor {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .dx {
    position: absolute;
    transform: translate3d(0, var(--py, 0), 0);
    will-change: transform;
  }
  /* Large thin outlined rings (outline on ::before; host carries only parallax) */
  .dx.ring { border-radius: 50%; }
  .dx.ring::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1.5px solid currentColor;
  }
  .r1 { width: 82vw; max-width: 1000px; aspect-ratio: 1; top: 30vh;  left: -26vw;  color: var(--accent);   opacity: 0.26; }
  .r2 { width: 56vw; max-width: 660px;  aspect-ratio: 1; top: 92vh;  right: -20vw; color: var(--accent-2); opacity: 0.24; }
  .r3 { width: 98vw; max-width: 1200px; aspect-ratio: 1; top: 198vh; left: -34vw;  color: var(--accent);   opacity: 0.2; }
  .r4 { width: 72vw; max-width: 860px;  aspect-ratio: 1; top: 346vh; right: -28vw; color: var(--accent-2); opacity: 0.22; }
  .r5 { width: 50vw; max-width: 580px;  aspect-ratio: 1; top: 398vh; left: 4vw;    color: var(--accent);   opacity: 0.22; }
  .r6 { width: 88vw; max-width: 1060px; aspect-ratio: 1; top: 496vh; right: -32vw; color: var(--accent);   opacity: 0.2; }
  /* Large soft blurred orbs (only opacity breathes — no transform conflict) */
  .dx.orb { border-radius: 50%; filter: blur(54px); }
  .o1 { width: 50vw; height: 50vw; top: 50vh;  right: -10vw; background: radial-gradient(circle, var(--accent-2), transparent 68%); opacity: 0.34; animation: dxBreathe 18s ease-in-out infinite; }
  .o2 { width: 58vw; height: 58vw; top: 234vh; left: -14vw;  background: radial-gradient(circle, var(--accent),   transparent 68%); opacity: 0.3;  animation: dxBreathe 23s ease-in-out infinite 3s; }
  .o3 { width: 52vw; height: 52vw; top: 424vh; right: -16vw; background: radial-gradient(circle, var(--accent-2), transparent 68%); opacity: 0.3;  animation: dxBreathe 20s ease-in-out infinite 1.5s; }
  /* Big tilted arcs (two adjacent sides of a ring border) */
  .dx.arc { aspect-ratio: 1; border-radius: 50%; border: 1.5px solid transparent; }
  .a1 { width: 66vw; max-width: 780px; top: 162vh; right: -12vw; border-top-color: var(--accent-2); border-right-color: var(--accent-2); opacity: 0.36; transform: translate3d(0, var(--py, 0), 0) rotate(20deg); }
  .a2 { width: 76vw; max-width: 900px; top: 368vh; left: -16vw;  border-bottom-color: var(--accent); border-left-color: var(--accent);  opacity: 0.32; transform: translate3d(0, var(--py, 0), 0) rotate(-34deg); }
  .a3 { width: 60vw; max-width: 720px; top: 528vh; left: 0;      border-top-color: var(--accent-2); border-left-color: var(--accent-2); opacity: 0.32; transform: translate3d(0, var(--py, 0), 0) rotate(118deg); }
  /* Long crossing hairlines */
  .dx.line { width: 1px; background: linear-gradient(var(--accent), transparent); transform-origin: top center; }
  .ln1 { height: 82vh; top: 22vh;  left: 33vw;  opacity: 0.5;  transform: translate3d(0, var(--py, 0), 0) rotate(15deg); }
  .ln2 { height: 98vh; top: 210vh; right: 36vw; opacity: 0.45; transform: translate3d(0, var(--py, 0), 0) rotate(-21deg); }
  .ln3 { height: 74vh; top: 492vh; left: 42vw;  opacity: 0.45; transform: translate3d(0, var(--py, 0), 0) rotate(26deg); }
  /* Sparse accent details */
  .dx.dot { border-radius: 50%; }
  .dt1 { width: 14px; height: 14px; top: 76vh;  right: 16vw; background: var(--accent-2); }
  .dt2 { width: 11px; height: 11px; top: 446vh; left: 20vw;  background: var(--accent); opacity: 0.8; }
  .dx.plus { font-family: var(--sans); font-weight: 300; line-height: 1; color: var(--muted); opacity: 0.42; }
  .px1 { font-size: 2.4rem; top: 296vh; left: 10vw; }
  @keyframes dxBreathe { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.13; } }

  /* ── Scenes ── */
  .scene {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    max-width: 1180px;
    margin: 0 auto;
    padding: 14vh 8vw;
  }

  /* ── Kicker (uppercase spaced label) ── */
  .kicker {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .kicker.center { text-align: center; }

  /* ── Masked, staggered word reveal ── */
  .mask {
    display: inline;
  }
  .mw {
    display: inline-flex;
    overflow: hidden;
    vertical-align: top;
    padding: 0.14em 0.03em;
    margin: -0.14em 0;
  }
  .mi {
    display: inline-block;
    transform: translateY(0);
    will-change: transform;
  }
  .mi.hl {
    color: var(--accent-2);
    font-style: italic;
  }
  /* Hidden + animated ONLY when motion is enabled (progressive enhancement). */
  .px-root.motion .mask .mi {
    transform: translateY(115%);
  }
  .px-root.motion .mask.in .mi {
    transform: translateY(0);
    transition: transform 0.95s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--i, 0) * 42ms);
  }

  /* Generic reveal for non-masked blocks (rows, lines, buttons). */
  .px-root.motion [data-reveal]:not(.mask) {
    opacity: 0;
    transform: translateY(34px);
  }
  .px-root.motion [data-reveal]:not(.mask).in {
    opacity: 1;
    transform: none;
    transition: opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1), transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: calc(var(--i, 0) * 80ms);
  }

  /* ── Hero ── */
  .hero {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 12vh;
  }
  .hero-inner { position: relative; z-index: 1; }
  .hero-name {
    margin: 0.28em 0 0;
    font-size: clamp(3.2rem, 13vw, 11rem);
    line-height: 0.94;
    font-weight: 340;
  }
  .hero-name .mask.huge { display: block; }
  .hero-manifesto {
    margin: 0.8em 0 0;
    max-width: 22ch;
    font-size: clamp(1.2rem, 2.4vw, 2rem);
    line-height: 1.32;
    color: var(--ink-soft);
  }
  .hero-manifesto .mask.lede { font-weight: 360; }

  .scroll-hint {
    position: absolute;
    bottom: 5vh;
    left: 8vw;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.72rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .sh-line {
    display: block;
    width: 60px;
    height: 1px;
    background: var(--muted);
    transform-origin: left;
    animation: shLine 2.4s ease-in-out infinite;
  }
  @keyframes shLine {
    0%, 100% { transform: scaleX(0.3); opacity: 0.5; }
    50% { transform: scaleX(1); opacity: 1; }
  }

  /* ── Refined abstract header composition (multi-layer, parallax + animated) ── */
  .hero-art {
    position: absolute;
    z-index: 0;
    top: 50%;
    right: -6vw;
    width: 46vw;
    max-width: 620px;
    aspect-ratio: 1 / 1;
    transform: translateY(-50%);
    pointer-events: none;
  }
  /* Each layer carries one parallax depth; its children carry the animation, so
     the two transforms never fight (layer = translate, child = rotate/drift). */
  .ha-layer {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate3d(0, var(--py, 0), 0);
    will-change: transform;
  }
  .ha-rings {
    width: 100%;
    height: 100%;
    color: var(--muted);
    opacity: 0.7;
    animation: haSpin 64s linear infinite;
  }
  @keyframes haSpin { to { transform: rotate(360deg); } }
  .ha-ring-dot { fill: var(--accent-2); }
  .ha-diamond {
    width: 30%;
    height: 30%;
    border: 1px solid var(--accent);
    opacity: 0.5;
    animation: haSpinRev 52s linear infinite;
  }
  @keyframes haSpinRev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
  .ha-orb {
    position: absolute;
    width: 44%;
    height: 44%;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, var(--accent), transparent 70%);
    opacity: 0.16;
    filter: blur(6px);
    animation: haPulse 13s ease-in-out infinite;
  }
  @keyframes haPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.16); } }
  .ha-dot {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--accent-2);
  }
  .ha-dot.d1 { top: 13%; left: 62%; animation: haDrift1 15s ease-in-out infinite; }
  .ha-dot.d2 { bottom: 18%; left: 28%; width: 6px; height: 6px; background: var(--accent); animation: haDrift2 18s ease-in-out infinite; }
  .ha-dot.d3 { top: 52%; right: 5%; width: 8px; height: 8px; opacity: 0.7; animation: haDrift1 22s ease-in-out infinite reverse; }
  @keyframes haDrift1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-16px, 20px); } }
  @keyframes haDrift2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(18px, -14px); } }
  .ha-plus {
    position: absolute;
    color: var(--muted);
    font-family: var(--sans);
    font-weight: 300;
    font-size: 1.6rem;
    line-height: 1;
    opacity: 0.4;
  }
  .ha-plus.p1 { top: 6%; left: 10%; animation: haTwinkle 6s ease-in-out infinite; }
  .ha-plus.p2 { bottom: 12%; right: 20%; font-size: 1.1rem; animation: haTwinkle 7.5s ease-in-out infinite 1s; }
  .ha-plus.p3 { top: 62%; left: 2%; font-size: 1.3rem; animation: haTwinkle 9s ease-in-out infinite 2s; }
  @keyframes haTwinkle { 0%, 100% { opacity: 0.15; transform: scale(0.85); } 50% { opacity: 0.55; transform: scale(1); } }

  /* ── Statement scene ── */
  .statement-scene {
    min-height: 92vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
  }
  .scene-no {
    font-family: var(--serif);
    color: var(--line);
    font-weight: 350;
  }
  .statement-scene .scene-no {
    position: absolute;
    top: 8vh;
    font-size: clamp(8rem, 30vw, 26rem);
    line-height: 1;
    transform: translate3d(0, var(--py, 0), 0);
    z-index: 0;
  }
  .statement {
    position: relative;
    z-index: 1;
    margin: 0.5em 0 0;
    max-width: 16ch;
    font-size: clamp(2rem, 5.4vw, 4.4rem);
    line-height: 1.12;
    font-weight: 360;
  }
  .draw-line {
    display: block;
    width: 1px;
    height: 0;
    margin-top: 6vh;
    background: var(--accent);
  }
  .px-root.motion .draw-line.in {
    height: 70px;
    transition: height 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
  }
  .px-root:not(.motion) .draw-line { height: 70px; }

  /* ── Experience index ── */
  .scene-head {
    display: flex;
    align-items: baseline;
    gap: 18px;
    margin-bottom: 6vh;
  }
  .scene-no.inline {
    font-size: 1rem;
    font-weight: 500;
    color: var(--accent);
    font-family: var(--sans);
    letter-spacing: 0.1em;
  }
  .exp-index {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .exp-row {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: baseline;
    gap: 10px 24px;
    padding: 3.4vh 0;
    border-top: 1px solid var(--line);
    transition: padding-left 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .exp-row:last-child { border-bottom: 1px solid var(--line); }
  .exp-company {
    display: block;
    font-size: clamp(1.7rem, 4.4vw, 3.4rem);
    line-height: 1.05;
    font-weight: 360;
    transition: color 0.4s ease;
  }
  .exp-role {
    display: block;
    margin-top: 6px;
    font-size: 0.95rem;
    color: var(--ink-soft);
  }
  .exp-meta {
    text-align: right;
    white-space: nowrap;
  }
  .exp-period {
    display: block;
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--ink);
  }
  .exp-sector {
    display: block;
    margin-top: 4px;
    font-size: 0.74rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .exp-detail {
    grid-column: 1 / -1;
    margin: 0;
    max-width: 62ch;
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--ink-soft);
    /* Hidden detail that opens on hover (desktop) — the editorial "micro-reveal". */
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.5s ease, opacity 0.4s ease, margin-top 0.4s ease;
  }
  .px-root.motion .exp-row:hover {
    padding-left: 22px;
  }
  .px-root.motion .exp-row:hover .exp-company { color: var(--accent-2); }
  .px-root.motion .exp-row:hover .exp-detail {
    max-height: 100px;
    opacity: 1;
    margin-top: 14px;
  }
  /* Under reduced motion the detail is simply always visible. */
  .px-root:not(.motion) .exp-detail {
    max-height: none;
    opacity: 1;
    margin-top: 12px;
  }
  /* Each experience row slides in from an alternating side as it scrolls into view
     (even → from the left, odd → from the right). Higher specificity than the
     generic reveal so the horizontal entrance wins; padding-left stays in the
     transition list so the hover micro-reveal still eases. */
  .px-root.motion .exp-row[data-reveal]:not(.mask) {
    opacity: 0;
    transform: translateX(-72px);
    transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
      padding-left 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .px-root.motion .exp-row.from-right[data-reveal]:not(.mask) {
    transform: translateX(72px);
  }
  .px-root.motion .exp-row[data-reveal]:not(.mask).in {
    opacity: 1;
    transform: none;
  }

  /* ── Stats (pinned) ── */
  .stats-scene {
    min-height: 200vh;
    padding: 0 8vw;
  }
  .stats-pin {
    position: sticky;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .stats-scene .scene-no.ghost {
    position: absolute;
    top: 12vh;
    font-size: clamp(7rem, 26vw, 22rem);
    line-height: 1;
    color: rgba(26, 23, 20, 0.05);
    transform: translate3d(0, var(--py, 0), 0);
  }
  .stats-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6vw;
    width: 100%;
    max-width: 980px;
  }
  .stat {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stat-num {
    font-size: clamp(4rem, 12vw, 9rem);
    line-height: 1;
    font-weight: 340;
    color: var(--ink);
  }
  .stat-label {
    margin-top: 0.4em;
    font-size: 1rem;
    font-weight: 600;
    color: var(--ink);
  }
  .stat-sub {
    margin-top: 6px;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── Skills marquee ── */
  .skills-scene {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-bottom: 16vh;
  }
  .px-root:not(.motion) .skills-scene { min-height: auto; display: block; }
  .marquee {
    overflow: hidden;
    margin: 0 -8vw;
    padding: 1.4vh 0;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  }
  .mq-track {
    display: inline-flex;
    align-items: center;
    gap: 0;
    white-space: nowrap;
    will-change: transform;
  }
  .mq-track.a { animation: marqueeA 38s linear infinite; }
  .mq-track.b { animation: marqueeB 46s linear infinite; }
  @keyframes marqueeA { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes marqueeB { from { transform: translateX(-50%); } to { transform: translateX(0); } }
  .mq-item {
    font-family: var(--serif);
    font-size: clamp(1.6rem, 4vw, 3rem);
    font-weight: 360;
    color: var(--ink);
    padding: 0 0.3em;
  }
  .mq-item.ghost {
    color: transparent;
    -webkit-text-stroke: 1px var(--muted);
  }
  .mq-dot {
    color: var(--accent-2);
    font-size: 1.4rem;
    padding: 0 0.2em;
  }
  /* Static accessible skills list (shown only under reduced motion). */
  .skills-static {
    display: none;
    list-style: none;
    flex-wrap: wrap;
    gap: 10px 14px;
    padding: 0;
    margin: 4vh 0 0;
  }
  .skills-static li {
    font-size: 0.95rem;
    color: var(--ink-soft);
    padding: 6px 14px;
    border: 1px solid var(--line);
    border-radius: 999px;
  }

  /* ── Portrait ── */
  .portrait-scene {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6vh;
  }
  .portrait {
    position: relative;
    width: clamp(180px, 26vw, 320px);
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    transform: translate3d(0, var(--py, 0), 0);
    will-change: transform;
    box-shadow: 0 30px 70px rgba(40, 38, 34, 0.22);
  }
  .portrait-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Duotone treatment: desaturate + warm it into the cream/olive palette. */
    filter: grayscale(1) contrast(1.04) sepia(0.42) saturate(0.85) brightness(1.02);
  }
  .portrait-duotone {
    position: absolute;
    inset: 0;
    background: linear-gradient(150deg, rgba(125, 122, 79, 0.42), rgba(176, 116, 79, 0.32));
    mix-blend-mode: multiply;
  }
  .portrait-quote {
    max-width: 18ch;
    text-align: center;
    font-size: clamp(1.5rem, 3.6vw, 3rem);
    line-height: 1.18;
    font-weight: 360;
    color: var(--ink);
  }

  /* ── CTA ── */
  .cta-scene {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .cta-title {
    margin: 0.2em 0 0;
    font-size: clamp(3rem, 12vw, 9rem);
    line-height: 0.96;
    font-weight: 340;
  }
  .cta-loc {
    margin: 1.4em 0 0;
    font-size: 0.9rem;
    color: var(--muted);
  }
  .cta-loc .dot { color: var(--accent); }
  .cta-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-top: 2.4em;
  }
  .cta-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 16px 34px;
    border: 1px solid var(--ink);
    border-radius: 999px;
    color: var(--ink);
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    overflow: hidden;
    transition: color 0.4s ease, border-color 0.4s ease;
    will-change: transform;
  }
  .cta-btn-in { position: relative; z-index: 1; }
  .cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--ink);
    transform: translateY(101%);
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .cta-btn:hover { color: var(--bg); }
  .cta-btn:hover::before { transform: translateY(0); }
  .cta-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--bg);
  }
  .cta-btn.primary::before { background: var(--accent-2); }
  .cta-btn.primary:hover { color: #fff; }
  .cta-btn:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; }
  .cta-email {
    margin-top: 2em;
    font-size: 0.86rem;
    letter-spacing: 0.04em;
    color: var(--muted);
  }

  /* ── Scroll progress rail ── */
  .px-progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    z-index: 5;
    background: rgba(26, 23, 20, 0.06);
  }
  .px-progress i {
    display: block;
    width: 100%;
    height: 100%;
    transform-origin: top;
    transform: scaleY(0);
    background: linear-gradient(180deg, var(--accent), var(--accent-2));
  }

  /* ── Section dots + full-CV escape hatch ── */
  .px-side-nav {
    position: absolute;
    right: 22px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
  }
  .px-dots {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .px-dot {
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .px-dot span {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(26, 23, 20, 0.22);
    transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .px-dot:hover span { background: var(--accent); }
  .px-dot.active span {
    background: var(--accent-2);
    transform: scale(1.5);
    box-shadow: 0 0 0 4px rgba(176, 116, 79, 0.16);
  }
  .px-dot:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 2px; border-radius: 50%; }

  /* ── Full-CV escape hatch ── */
  .px-full-cv {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: 1px solid var(--accent-2);
    border-radius: 999px;
    background: rgba(243, 239, 231, 0.78);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    color: var(--accent-2);
    font-family: var(--sans);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
  }
  .px-full-cv:hover { background: var(--accent-2); color: var(--bg); transform: translateY(-1px); }
  .px-full-cv:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 3px; }
  .px-full-cv-arrow { display: inline-block; transition: transform 0.3s ease; }
  .px-full-cv:hover .px-full-cv-arrow { transform: translateX(3px); }

  /* ── Play / Pause control ── */
  .px-controls {
    position: absolute;
    top: 22px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 6;
  }
  .px-play {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 9px 18px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: rgba(243, 239, 231, 0.78);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
  }
  .px-play:hover { border-color: var(--accent); transform: translateY(-1px); }
  .px-play:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 2px; }
  .px-play-ico { color: var(--accent-2); font-size: 0.7rem; }

  /* ── Custom cursor ── */
  .px-cursor {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 60;
    pointer-events: none;
    will-change: transform;
  }
  .cur-dot,
  .cur-ring {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
  .cur-dot {
    width: 7px;
    height: 7px;
    background: var(--accent-2);
  }
  .cur-ring {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(26, 23, 20, 0.4);
    transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background 0.3s ease;
  }
  .px-cursor:global(.hover) .cur-ring {
    width: 58px;
    height: 58px;
    border-color: var(--accent-2);
    background: rgba(176, 116, 79, 0.08);
  }
  .px-cursor:global(.hover) .cur-dot { opacity: 0; }

  /* ════════════════════════════════════════════════════════════════════════
     REDUCED MOTION — the era's flaw (parallax/auto-scroll = motion sickness) is
     resolved by collapsing to a clean static vertical scroll: no inertia, no
     parallax, no auto-scroll, no custom cursor, marquee → wrapped list. All
     content stays present and reachable.
     ════════════════════════════════════════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    .m,
    .sh-line,
    .mq-track.a,
    .mq-track.b {
      animation: none !important;
    }
    .scroll-hint { display: none; }
    .marquee { display: none; }
    .skills-static { display: flex; }
    .skills-scene { min-height: auto; display: block; }
    .stats-scene { min-height: auto; }
    .stats-pin { position: static; height: auto; padding: 14vh 0; }
    .portrait, .ha-layer, .scene-no { transform: none !important; }
    .hero-art .ha-rings, .ha-diamond, .ha-orb, .ha-dot, .ha-plus { animation: none !important; }
    .dx, .dx::before { animation: none !important; }
  }
  /* Belt-and-braces: if the component never gained `.motion` (JS off / reduced),
     show the static skills list and drop the kinetic marquee. */
  .px-root:not(.motion) .marquee { display: none; }
  .px-root:not(.motion) .skills-static { display: flex; }
  .px-root:not(.motion) .scroll-hint { display: none; }
  .px-root:not(.motion) .stats-scene { min-height: auto; }
  .px-root:not(.motion) .stats-pin { position: static; height: auto; padding: 14vh 0; }
  .px-root:not(.motion) .dx,
  .px-root:not(.motion) .dx::before { animation: none !important; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .stats-grid { grid-template-columns: 1fr; gap: 7vh; }
    .stats-scene { min-height: auto; padding: 12vh 8vw; }
    .stats-pin { position: static; height: auto; }
    .stats-scene .scene-no.ghost { position: static; display: block; text-align: center; margin-bottom: 4vh; }
    .exp-row { grid-template-columns: 1fr; }
    .exp-meta { text-align: left; }
    .px-side-nav { right: 12px; }
  }
  @media (max-width: 600px) {
    .scene { padding: 12vh 7vw; }
    .scroll-hint { left: 7vw; }
    .px-side-nav { right: 8px; gap: 14px; }
    .px-dots { gap: 8px; }
    .px-dot { width: 16px; height: 16px; }
    .px-dot span { width: 5px; height: 5px; }
    .px-full-cv { padding: 0 12px; min-height: 44px; min-width: 44px; font-size: 0.6rem; }
    .px-controls { top: 14px; left: auto; right: 14px; transform: none; }
    .hero-manifesto { max-width: 100%; }
    .cta-actions { gap: 12px; }
    .cta-btn { padding: 14px 26px; }
  }
</style>
