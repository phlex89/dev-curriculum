<script lang="ts">
  import { onMount } from 'svelte';
  import { quintOut } from 'svelte/easing';
  import type * as THREE_NS from 'three';
  import { cvData } from '$lib/cv-data';
  import { tilt } from '$lib/actions/interactive';

  // `three` (and its post-processing add-ons) are loaded dynamically so the
  // ~150KB WebGL bundle is only fetched when a visitor actually enters this era.
  type ThreeNS = typeof THREE_NS;
  let THREE: ThreeNS;

  let canvas: HTMLCanvasElement;
  let mounted = $state(false);
  let sceneReady = $state(false); // gates the canvas fade-in once the first frame is drawn

  const prefersReduced = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Staggered, "spatial" card entrance: a slow, graceful rise + soft de-blur + fade.
  function spaceIn(_node: HTMLElement, { delay = 0, duration = 1150 } = {}) {
    if (prefersReduced()) return { duration: 0 };
    return {
      delay,
      duration,
      easing: quintOut,
      css: (t: number, u: number) =>
        `opacity: ${t}; transform: translateY(${u * 26}px) scale(${0.985 + 0.015 * t}); filter: blur(${u * 5}px);`
    };
  }

  // Three.js variables
  let scene: THREE_NS.Scene;
  let camera: THREE_NS.PerspectiveCamera;
  let renderer: THREE_NS.WebGLRenderer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let composer: any = null; // EffectComposer (only created when bloom is enabled)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bloomPass: any = null;
  let knot: THREE_NS.Mesh;
  let knotMat: THREE_NS.MeshBasicMaterial;
  let shapes: THREE_NS.Mesh[] = [];
  let pointClouds: THREE_NS.Points[] = [];
  let animationId = 0;
  let mouseX = 0;
  let mouseY = 0;

  let reduced = false;
  let useBloom = false;
  let disposed = false;

  // Scene "liveness": UI events (e.g. hovering a card) inject energy that decays,
  // briefly brightening the bloom, speeding the drift and warming the colours.
  let energy = 0;
  function pulseScene(amount = 1) {
    energy = Math.min(1.4, energy + amount);
  }

  function handlePointer(e: MouseEvent) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  }

  function onVisibility() {
    if (typeof document === 'undefined') return;
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
      animationId = 0;
    } else if (!animationId && renderer && !disposed) {
      animate();
    }
  }

  function handleResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer?.setSize(window.innerWidth, window.innerHeight);
  }

  function teardown() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
    window.removeEventListener('mousemove', handlePointer);
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', onVisibility);
    composer?.dispose?.();
    if (renderer) renderer.dispose();
  }

  onMount(() => {
    start();
    // Reveal cards on the next frame so the entrance transition plays.
    requestAnimationFrame(() => (mounted = true));
    return () => {
      disposed = true;
      teardown();
    };
  });

  async function start() {
    THREE = await import('three');
    if (disposed || !canvas) return;

    reduced = prefersReduced();
    // Bloom is GPU-heavy: only on roomy viewports and when motion is allowed.
    useBloom = !reduced && window.innerWidth > 760;

    initThreeJS();

    if (useBloom) {
      try {
        const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
          import('three/examples/jsm/postprocessing/EffectComposer.js'),
          import('three/examples/jsm/postprocessing/RenderPass.js'),
          import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
          import('three/examples/jsm/postprocessing/OutputPass.js')
        ]);
        if (disposed) return;
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        // Gentle bloom: a higher threshold + lower strength keep the centre from
        // blowing out to a harsh white flash, preserving the cyan/violet palette.
        bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.42, 0.4, 0.24);
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());
        composer.setSize(window.innerWidth, window.innerHeight);
      } catch {
        useBloom = false; // fall back to direct rendering if add-ons fail to load
      }
    }

    window.addEventListener('mousemove', handlePointer);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', onVisibility);
    animate();
  }

  // Soft round glow sprite (so particles are luminous dots, not squares)
  function makeGlowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    // Softer core (no pure-white hotspot) so the tint colour stays visible.
    g.addColorStop(0, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.5)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function makePointCloud(count: number, spread: number, size: number, color: number, opacity: number, tex: THREE_NS.Texture) {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * spread;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size,
      color,
      map: tex,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return pts;
  }

  function initThreeJS() {
    if (!canvas) return;

    scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(0x070317, 0.034);

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const glow = makeGlowTexture();

    // Layered glowing particle nebula — fills the whole volume at any screen size
    // More saturated tints + lower opacity on the dense layer so additive overlap
    // trends toward coloured glow instead of a white core.
    const c = reduced ? 0.5 : 1;
    pointClouds = [
      makePointCloud(Math.round(2000 * c), 72, 0.55, 0x3ad6ff, 0.55, glow),
      makePointCloud(Math.round(1300 * c), 60, 0.8, 0x9a6cff, 0.62, glow),
      makePointCloud(Math.round(700 * c), 46, 1.15, 0xff7ad9, 0.6, glow)
    ];

    // Dynamic centrepiece: a rotating wireframe torus knot
    knotMat = new THREE.MeshBasicMaterial({ color: 0x9d8cff, wireframe: true, transparent: true, opacity: 0.3 });
    knot = new THREE.Mesh(new THREE.TorusKnotGeometry(2.8, 0.55, 140, 18), knotMat);
    // Off-centre (upper-right) so the bright focal element doesn't sit behind the
    // content in the middle of the screen.
    knot.position.set(9.5, 4, -7);
    scene.add(knot);

    // Floating wireframe accents + orbiting energy rings
    const defs: { geo: THREE_NS.BufferGeometry; color: number; pos: [number, number, number]; ring?: boolean }[] = [
      { geo: new THREE.IcosahedronGeometry(3.2, 1), color: 0x7df9ff, pos: [-8, 2.5, -6] },
      { geo: new THREE.TorusGeometry(2.6, 0.08, 12, 90), color: 0x7df9ff, pos: [7.5, -3, -7], ring: true },
      { geo: new THREE.TorusGeometry(3.4, 0.06, 12, 100), color: 0xff7ad9, pos: [-7, -4, -8], ring: true },
      { geo: new THREE.OctahedronGeometry(1.9, 0), color: 0xff7ad9, pos: [7, 4.5, -9] }
    ];

    shapes = defs.map((d, i) => {
      const mat = new THREE.MeshBasicMaterial({
        color: d.color,
        wireframe: true,
        transparent: true,
        opacity: d.ring ? 0.45 : 0.3
      });
      const mesh = new THREE.Mesh(d.geo, mat);
      mesh.position.set(d.pos[0], d.pos[1], d.pos[2]);
      mesh.userData.sx = 0.0014 + i * 0.0006;
      mesh.userData.sy = 0.0021 + i * 0.0005;
      mesh.userData.bob = 0.6 + i * 0.15;
      mesh.userData.baseY = d.pos[1];
      mesh.userData.phase = i * 1.7;
      scene.add(mesh);
      return mesh;
    });
  }

  let t = 0;
  const knotColor = { h: 0.72, s: 0.55, l: 0.62 }; // base purple, hue drifts over time

  function animate() {
    animationId = requestAnimationFrame(animate);
    t += reduced ? 0 : 0.006;

    // Energy injected by UI events decays back to rest. It only nudges motion
    // speed — never brightness/bloom — so rapid hovering near a box edge can't
    // produce a flash on the background.
    energy *= 0.92;
    if (energy < 0.001) energy = 0;
    const boost = 1 + energy * 0.3;

    // Swirling nebula drift (very slightly accelerated by scene energy)
    pointClouds[0].rotation.y += 0.0005 * boost;
    pointClouds[0].rotation.x = Math.sin(t * 0.25) * 0.08;
    pointClouds[1].rotation.y -= 0.0007 * boost;
    pointClouds[2].rotation.x += 0.0004 * boost;
    pointClouds[2].rotation.z = Math.cos(t * 0.2) * 0.1;

    // Torus knot: rotate + gentle pulse + slow hue "breathing" (time-based only)
    knot.rotation.x += 0.0024 * boost;
    knot.rotation.y += 0.0032 * boost;
    const s = 1 + Math.sin(t) * 0.04;
    knot.scale.set(s, s, s);
    const hue = (knotColor.h + Math.sin(t * 0.05) * 0.04 + 1) % 1;
    knotMat.color.setHSL(hue, knotColor.s, knotColor.l);
    knotMat.opacity = 0.3;

    // Accents rotate and bob
    for (const m of shapes) {
      m.rotation.x += m.userData.sx * boost;
      m.rotation.y += m.userData.sy * boost;
      m.position.y = m.userData.baseY + Math.sin(t * m.userData.bob + m.userData.phase) * 0.6;
    }

    // Gentle camera parallax following the cursor
    camera.position.x += (mouseX * 2.2 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 2.2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -4);

    // Bloom is constant — no energy modulation, so no flashing.
    if (bloomPass) bloomPass.strength = 0.42;

    if (composer) composer.render();
    else renderer.render(scene, camera);

    if (!sceneReady) sceneReady = true; // first frame drawn → fade the canvas in
  }
</script>

<div class="threed-wrapper">
  <!-- Three.js Canvas (full-page particle + wireframe scene) -->
  <canvas bind:this={canvas} class="webgl-canvas" class:ready={sceneReady}></canvas>
  <div class="vignette"></div>

  <!-- Glassmorphism UI overlay -->
  <div class="ui-layer">
    {#if mounted}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="glass-card header-card" use:tilt={{ max: 7, scale: 1.01, perspective: 1200 }} onmouseenter={() => pulseScene(0.8)} in:spaceIn={{ delay: 120 }}>
      <div class="glass-content">
        <h1>{cvData.name}</h1>
        <h2>{cvData.role}</h2>
        <p class="tagline">{cvData.tagline}</p>
        <div class="contact-line">
          <a href="mailto:{cvData.contact.email}">{cvData.contact.email}</a> • 
          <a href={cvData.contact.linkedin} target="_blank">LinkedIn</a>
        </div>
        <div class="tags">
          {#each cvData.skills.slice(0, 6) as skill}
            <span class="tag">{skill}</span>
          {/each}
        </div>
      </div>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="glass-card about-card" use:tilt={{ max: 7, scale: 1.01, perspective: 1200 }} onmouseenter={() => pulseScene(0.8)} in:spaceIn={{ delay: 360 }}>
      <div class="glass-content">
        <h3>System Prompt</h3>
        <p>{cvData.summary}</p>
        
        <h3 style="margin-top: 30px;">Languages</h3>
        {#each cvData.languages as lang}
          <div class="lang-row">
            <strong>{lang.name}</strong>
            <span class="lang-level">{lang.level}</span>
          </div>
        {/each}

        <h3 style="margin-top: 30px;">Education</h3>
        {#each cvData.education as edu}
          <div style="margin-bottom: 10px;">
            <strong>{edu.title}</strong><br>
            <span style="color: #a5b4fc; font-size: 0.9rem;">{edu.institute} ({edu.period})</span>
          </div>
        {/each}

        <h3 style="margin-top: 30px;">Certifications</h3>
        {#each cvData.certifications as cert}
          <div class="mini-row">
            <span>{cert.name}</span>
            <span class="muted">{cert.issuer}</span>
          </div>
        {/each}

        <h3 style="margin-top: 30px;">Conferences</h3>
        {#each cvData.conferences as conf}
          <div class="mini-row">
            <span>{conf.name} · {conf.location}</span>
            <span class="muted">{conf.year}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="glass-card exp-card" use:tilt={{ max: 6, scale: 1.008, perspective: 1300 }} onmouseenter={() => pulseScene(0.8)} in:spaceIn={{ delay: 560 }}>
      <div class="glass-content">
        <h3>Timeline Logs</h3>
        <div class="exp-list">
          {#each cvData.experience as exp}
            <div class="exp-row">
              <div class="exp-glow"></div>
              <div class="exp-details">
                <strong>{exp.company}</strong>
                <span class="role">{exp.title}</span>
                <span class="exp-desc">{exp.description}</span>
                <span class="tech-stack">{exp.technologies.join(' • ')}</span>
              </div>
              <div class="exp-year">{exp.period}</div>
            </div>
          {/each}
          <div class="exp-row early">
            <div class="exp-glow"></div>
            <div class="exp-details">
              <strong>{cvData.earlyCareer.title}</strong>
              <span class="exp-desc">{cvData.earlyCareer.description}</span>
              <span class="tech-stack">{cvData.earlyCareer.technologies.join(' • ')}</span>
            </div>
            <div class="exp-year">{cvData.earlyCareer.period}</div>
          </div>
        </div>
      </div>
    </div>
    {/if}

  </div>
</div>

<style>
  .threed-wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background:
      radial-gradient(ellipse 80% 65% at 82% 22%, #1d0f43 0%, #0c0726 48%, #050313 100%),
      #050313;
    overflow: hidden;
    color: white;
    font-family: 'Space Grotesk', 'Inter', sans-serif;
  }

  .webgl-canvas {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 1;
    pointer-events: none;
    opacity: 0; /* fades in from black once the first frame is rendered */
    transition: opacity 1.1s ease;
  }
  .webgl-canvas.ready { opacity: 1; }

  @media (prefers-reduced-motion: reduce) {
    .webgl-canvas { transition: none; }
  }

  /* Soft depth vignette so card text always stays readable over the scene */
  .vignette {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background: radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(5, 3, 19, 0.55) 100%);
  }

  .ui-layer {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 10;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 30px;
    padding: 40px;
    padding-bottom: 100px; /* Leave space for timeline */
    box-sizing: border-box;
    overflow-y: auto;
  }

  /* Hide scrollbar */
  .ui-layer::-webkit-scrollbar { display: none; }
  .ui-layer { -ms-overflow-style: none; scrollbar-width: none; }

  .glass-card {
    position: relative;
    background: rgba(255, 255, 255, 0.045);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    padding: 30px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform-style: preserve-3d;
    will-change: transform;
  }

  /* Neon cursor spotlight (driven by the tilt action's CSS vars) */
  .glass-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--spot, 0);
    transition: opacity 0.3s ease;
    background: radial-gradient(
      320px circle at var(--mx, 50%) var(--my, 50%),
      rgba(125, 249, 255, 0.16),
      transparent 60%
    );
  }

  .glass-content { transform: translateZ(40px); pointer-events: none; position: relative; z-index: 1; }
  .glass-content a { pointer-events: auto; color: #a5b4fc; text-decoration: none; }
  .glass-content a:hover { text-decoration: underline; }

  .header-card { grid-column: 1 / -1; display: flex; flex-direction: column; align-items: flex-start; }

  h1 { font-family: 'Orbitron', 'Space Grotesk', sans-serif; font-size: 2.8rem; font-weight: 700; letter-spacing: 1px; margin: 0 0 8px 0; background: linear-gradient(to right, #fff, #a5b4fc); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  h2 { font-size: 1.15rem; margin: 0 0 10px 0; color: #a5b4fc; font-weight: 400; letter-spacing: 0.5px; }
  .tagline { margin: 0 0 16px 0; font-size: 0.95rem; font-style: italic; color: rgba(255, 255, 255, 0.82); line-height: 1.5; max-width: 640px; }
  .contact-line { margin-bottom: 15px; font-size: 0.9rem; }
  .lang-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; }
  .lang-row .lang-level { color: #a5b4fc; font-size: 0.85rem; }
  .mini-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 7px; font-size: 0.9rem; }
  .mini-row .muted { color: rgba(190, 200, 255, 0.88); font-size: 0.8rem; white-space: nowrap; }

  .tags { display: flex; gap: 10px; flex-wrap: wrap; }
  .tag { background: rgba(255, 255, 255, 0.1); padding: 5px 15px; border-radius: 20px; font-size: 0.85rem; border: 1px solid rgba(255, 255, 255, 0.2); }

  .about-card { grid-column: 1 / 2; }
  .exp-card { grid-column: 2 / -1; }

  h3 { font-family: 'Orbitron', 'Space Grotesk', sans-serif; margin-top: 0; font-size: 1.1rem; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: #fff; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px; margin-bottom: 20px; }

  .exp-list { display: flex; flex-direction: column; gap: 15px; }

  .exp-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 15px; background: rgba(0, 0, 0, 0.2); border-radius: 12px;
    position: relative; overflow: hidden;
  }
  .exp-glow { position: absolute; left: 0; top: 0; width: 4px; height: 100%; background: #00ffff; box-shadow: 0 0 10px #00ffff; }

  .exp-details { display: flex; flex-direction: column; padding-left: 15px; }
  .exp-details strong { font-size: 1.1rem; color: #fff; }
  .exp-details .role { font-size: 0.9rem; color: #a5b4fc; }
  .exp-details .exp-desc { font-size: 0.85rem; color: rgba(255, 255, 255, 0.82); margin-top: 6px; line-height: 1.45; }
  .exp-details .tech-stack { font-size: 0.8rem; color: #aab4e8; margin-top: 6px; }
  .exp-row.early { opacity: 0.9; }
  .exp-row.early .exp-glow { background: #b98cff; box-shadow: 0 0 10px #b98cff; }

  .exp-year { font-family: monospace; color: rgba(255, 255, 255, 0.72); white-space: nowrap; margin-left: 10px; }

  @media (max-width: 900px) {
    .ui-layer { grid-template-columns: 1fr; }
    .about-card, .exp-card { grid-column: 1 / -1; }
  }
</style>
