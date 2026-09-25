<script lang="ts">
  import { onMount } from 'svelte';
  import type * as THREE_NS from 'three';
  import { prefersReduced } from '$lib/motion';
  import { getCvData } from '$lib/i18n';
  import {
    blobVertex,
    blobFragment,
    dustVertex,
    dustFragment,
    nodeVertex,
    nodeFragment,
    lineVertex,
    lineFragment,
    paletteAt
  } from './threed/shaders';

  type ThreeNS = typeof THREE_NS;
  type Mode = 'full' | 'lite' | 'static' | 'nogl';

  interface Pose {
    x: number;
    y: number;
    z: number;
    sc: number;
    amp: number;
    dim: number;
    vL: number;
    vB: number;
  }

  const cvData = getCvData();
  const CHAPTERS = ['Intro', 'About', 'Path', 'Skills', 'Contact'];
  const nameParts = cvData.name.split(' ');
  const monogram = nameParts.map((p) => p[0]).join('');
  const words = cvData.summary.split(/\s+/);
  let letterCounter = 0;
  const nameWords = nameParts.map((p) => [...p].map((c) => ({ c, k: letterCounter++ })));
  const LETTERS = letterCounter;

  const isOngoing = (period: string) => !/\d\s*$/.test(period.trim());
  const current = cvData.experience.find((e) => isOngoing(e.period));

  const pathItems = [
    {
      heading: cvData.earlyCareer.title,
      role: '',
      period: cvData.earlyCareer.period,
      description: cvData.earlyCareer.description,
      technologies: cvData.earlyCareer.technologies,
      now: false
    },
    ...[...cvData.experience].reverse().map((e) => ({
      heading: e.company,
      role: e.title,
      period: e.period,
      description: e.description,
      technologies: e.technologies,
      now: e === current
    }))
  ];
  const nowIdx = pathItems.findIndex((p) => p.now);

  let rowCounter = 0;
  const skillGroups = cvData.skillGroups.map((g) => ({
    label: g.label,
    items: g.items.map((name) => ({ name, i: rowCounter++ }))
  }));

  const POSES: Pose[] = [
    { x: 0, y: 0.12, z: -6, sc: 0.95, amp: 0.3, dim: 1, vL: 0, vB: 1 },
    { x: 2.4, y: -0.05, z: -6.6, sc: 0.9, amp: 0.26, dim: 1, vL: 1, vB: 0 },
    { x: -10, y: 3.6, z: -34, sc: 2.2, amp: 0.34, dim: 0.5, vL: 0, vB: 0 },
    { x: 2.9, y: -0.2, z: -6.4, sc: 0.92, amp: 0.28, dim: 0.95, vL: 1, vB: 0 },
    { x: 0, y: 0.5, z: -6, sc: 0.9, amp: 0.33, dim: 1, vL: 0, vB: 1 }
  ];
  const FINALE = { x: -1.6, y: 0.05, z: -15, sc: 1.4, dim: 1, amp: 0.24 };
  const SPRING_K = 44;
  const SPRING_C = 6.4;
  const POSES_NARROW: Pose[] = [
    { x: 0, y: 0.55, z: -6, sc: 0.82, amp: 0.26, dim: 1, vL: 0, vB: 1 },
    { x: 0.9, y: 1.7, z: -7.5, sc: 0.8, amp: 0.22, dim: 0.75, vL: 1, vB: 0 },
    { x: -0.7, y: 1.5, z: -8, sc: 0.75, amp: 0.26, dim: 0.6, vL: 1, vB: 0 },
    { x: 0.9, y: 1.6, z: -7.5, sc: 0.78, amp: 0.24, dim: 0.7, vL: 1, vB: 0 },
    { x: 0, y: 0.7, z: -6, sc: 0.86, amp: 0.32, dim: 1, vL: 0, vB: 1 }
  ];

  let wrap: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let scroller: HTMLDivElement;
  let pathSticky: HTMLDivElement;
  let veilSide: HTMLDivElement;
  let veilBottom: HTMLDivElement;
  let progEl: HTMLSpanElement;
  const sectionEls: HTMLElement[] = $state([]);
  const labelEls: HTMLLIElement[] = $state([]);
  const letterEls: HTMLSpanElement[] = $state([]);
  const rowEls: HTMLLIElement[] = $state([]);
  const rowNameEls: HTMLSpanElement[] = $state([]);

  let mode = $state<Mode>('full');
  let narrow = $state(false);
  let rm = $state(true);
  let loading = $state(true);
  let exiting = $state(false);
  let ready = $state(false);
  let counter = $state('000');
  let chapter = $state(0);
  let active = $state(0);
  let seen = $state([true, false, false, false, false]);
  let glLive = $state(false);

  const projected = $derived(mode === 'full' && !narrow);
  const animated = $derived(mode === 'full' || mode === 'lite');

  let THREE: ThreeNS;
  let renderer: THREE_NS.WebGLRenderer | null = null;
  let scene: THREE_NS.Scene;
  let camera: THREE_NS.PerspectiveCamera;
  let blob: THREE_NS.Mesh;
  let blobMat: THREE_NS.ShaderMaterial;
  let dustLayers: THREE_NS.Points[] = [];
  let dustMats: THREE_NS.ShaderMaterial[] = [];
  let pathGroup: THREE_NS.Group;
  let lineMat: THREE_NS.ShaderMaterial;
  let nodeMat: THREE_NS.ShaderMaterial;
  let nodeOn: THREE_NS.BufferAttribute;
  let curve: THREE_NS.CatmullRomCurve3;
  let nodePos: THREE_NS.Vector3[] = [];
  let nodeT: number[] = [];
  const disposables: { dispose: () => void }[] = [];

  let raf = 0;
  let disposed = false;
  let last = 0;
  let time = 0;
  let st = 0;
  let vh = 1;
  let vw = 1;
  let tops: number[] = [0, 0, 0, 0, 0];
  let heights: number[] = [1, 1, 1, 1, 1];
  let maxScroll = 1;

  let mx = 0;
  let my = 0;
  let cmx = 0;
  let cmy = 0;
  let px = -1e5;
  let py = -1e5;
  let energy = 0;
  let en = 0;
  let kick = 0;
  let hueTarget = 0;
  let hue = 0;
  let rail = 0;
  let fine = $state(false);
  let clock = 0;

  let sx = 0;
  let sy = 0;
  let svx = 0;
  let svy = 0;
  let rx = 0;
  let ry = 0;
  let rvx = 0;
  let rvy = 0;
  let hov = 0;
  let hovered = false;
  let warm = 0;
  let prox = 0;
  let ripSlot = 0;
  let lastEmit = -10;
  let movedSinceEmit = false;

  const lx = new Float32Array(LETTERS);
  const ly = new Float32Array(LETTERS);
  const lp = new Float32Array(LETTERS);
  const lv = new Float32Array(LETTERS);
  const lShown = new Float32Array(LETTERS);
  let lSigma = 80;
  let measureCtx: CanvasRenderingContext2D | null = null;
  let lettersMeasured = false;
  let lettersSettled = true;
  let pointerDirty = false;

  const cur: Pose & { path: number } = { ...POSES[0], path: 0 };

  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const smooth = (e0: number, e1: number, v: number) => {
    const t = clamp((v - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;

  function enter(k: number) {
    return smooth(0, 1, (st - (tops[k] - vh)) / vh);
  }

  function measure() {
    if (!scroller) return;
    vh = wrap.clientHeight || window.innerHeight;
    vw = wrap.clientWidth || window.innerWidth;
    sectionEls.forEach((el, k) => {
      tops[k] = el.offsetTop;
      heights[k] = el.offsetHeight;
    });
    maxScroll = Math.max(1, scroller.scrollHeight - vh);
  }

  function pathProgress() {
    const span = Math.max(1, heights[2] - vh);
    return clamp((st - tops[2]) / span, 0, 1);
  }

  function railTarget() {
    if (!nodeT.length) return 0;
    const n = nodeT.length - 1;
    const p = pathProgress() * n;
    const k = Math.min(n - 1, Math.floor(p));
    const f = p - k;
    const eased = f * f * f * (f * (f * 6 - 15) + 10);
    return mix(nodeT[k], nodeT[k + 1], eased);
  }

  function targetPose(): Pose & { path: number } {
    const set = narrow ? POSES_NARROW : POSES;
    const out = { ...set[0], path: 0 };
    for (let k = 1; k < set.length; k++) {
      const w = enter(k);
      if (w <= 0) continue;
      (Object.keys(set[k]) as (keyof Pose)[]).forEach((key) => {
        out[key] = mix(out[key], set[k][key], w);
      });
    }
    out.path = projected ? enter(2) * (1 - enter(3)) : 0;
    if (!projected) out.vL = Math.max(out.vL, enter(1) * (1 - enter(4)));
    return out;
  }

  function trackChapter() {
    let k = 0;
    for (let i = 0; i < tops.length; i++) if (tops[i] <= st + vh * 0.5) k = i;
    if (k !== chapter) chapter = k;
    for (let i = 1; i < 5; i++) {
      if (!seen[i] && enter(i) > 0.35) seen[i] = true;
    }
    if (progEl) progEl.style.transform = `scaleX(${clamp(st / maxScroll, 0, 1)})`;
  }

  function applyVeils(p: { vL: number; vB: number }) {
    if (veilSide) veilSide.style.opacity = p.vL.toFixed(3);
    if (veilBottom) veilBottom.style.opacity = p.vB.toFixed(3);
  }

  function onScroll() {
    st = scroller.scrollTop;
    pointerDirty = true;
    trackChapter();
    if (!animated) applyVeils(targetPose());
  }

  function onPointer(e: PointerEvent) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    energy = Math.min(1, energy + Math.hypot(nx - mx, ny - my) * 1.5);
    mx = nx;
    my = ny;
    px = e.clientX;
    py = e.clientY;
    pointerDirty = true;
    movedSinceEmit = true;
  }

  function onPointerOut(e: PointerEvent) {
    if (e.relatedTarget) return;
    px = -1e5;
    py = -1e5;
    pointerDirty = true;
  }

  function skillEnter(i: number) {
    kick = 1;
    hueTarget = 0.12 + (i % 6) * 0.075;
  }
  function skillLeave() {
    hueTarget = 0;
  }

  function kern(root: ParentNode | null) {
    if (!root) return;
    const letters = [...root.querySelectorAll<HTMLElement>('.lt')];
    if (!letters.length) return;
    measureCtx ??= document.createElement('canvas').getContext('2d');
    const ctx = measureCtx;
    if (!ctx) return;
    const cs = getComputedStyle(letters[0]);
    ctx.font = `400 ${cs.fontSize} ${cs.fontFamily}`;
    letters.forEach((el, i) => {
      const next = letters[i + 1];
      if (!next || next.parentElement !== el.parentElement) {
        el.style.marginRight = '';
        return;
      }
      const a = el.textContent ?? '';
      const b = next.textContent ?? '';
      const k = ctx.measureText(a + b).width - ctx.measureText(a).width - ctx.measureText(b).width;
      el.style.marginRight = Math.abs(k) < 0.05 ? '' : `${k.toFixed(2)}px`;
    });
  }

  function writeLetter(i: number, v: number) {
    const el = letterEls[i];
    if (!el) return;
    el.style.transform =
      Math.abs(v) < 0.001 ? '' : `translateY(${(-v * 0.09).toFixed(4)}em) scale(${(1 + v * 0.05).toFixed(4)}, ${(1 + v * 0.1).toFixed(4)})`;
  }

  function measureLetters() {
    if (!fine || !animated || !letterEls.length) return;
    const first = letterEls[0];
    if (!first) return;
    letterEls.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const line = (el.closest('.line') as HTMLElement).getBoundingClientRect();
      lx[i] = r.left + r.width / 2;
      ly[i] = line.top + line.height / 2 + st;
    });
    lSigma = parseFloat(getComputedStyle(first).fontSize) * 0.62;
    lettersMeasured = true;
    pointerDirty = true;
  }

  function measureRows() {
    if (!rowNameEls.length) return;
    rowNameEls.forEach((el) => (el.style.whiteSpace = 'nowrap'));
    const widths = rowNameEls.map((el) => el.getBoundingClientRect().width);
    rowNameEls.forEach((el, i) => {
      el.style.whiteSpace = '';
      const row = rowEls[i];
      const idx = row.lastElementChild as HTMLElement;
      const fs = parseFloat(getComputedStyle(row).fontSize);
      const room = row.clientWidth - idx.offsetWidth - 20 - fs * 0.4 - 6;
      const chars = Math.max(1, (el.textContent ?? '').length);
      const extra = clamp((room - widths[i]) / chars, 0, fs * 0.04);
      row.style.setProperty('--trk', `${(-0.02 * fs + extra).toFixed(2)}px`);
      row.classList.toggle('wrap', widths[i] > room + fs * 0.4);
    });
  }

  function measureType() {
    measureRows();
    wrap.querySelectorAll('.split').forEach((el) => kern(el));
    measureLetters();
  }

  function updateLetters(dt: number) {
    if (!lettersMeasured || (!pointerDirty && lettersSettled)) return;
    pointerDirty = false;
    const inView = st < vh;
    const inv = 1 / (2 * lSigma * lSigma);
    let settled = true;
    for (let i = 0; i < LETTERS; i++) {
      let tgt = 0;
      if (inView && px > -1e4) {
        const dx = px - lx[i];
        const dy = py - (ly[i] - st);
        tgt = Math.exp(-(dx * dx + dy * dy * 0.45) * inv);
      }
      lv[i] += (120 * (tgt - lp[i]) - 13 * lv[i]) * dt;
      lp[i] += lv[i] * dt;
      if (Math.abs(tgt - lp[i]) < 0.002 && Math.abs(lv[i]) < 0.01) {
        lp[i] = tgt;
        lv[i] = 0;
      } else {
        settled = false;
      }
      if (Math.abs(lp[i] - lShown[i]) > 0.0015 || (lp[i] === tgt && lShown[i] !== tgt)) {
        lShown[i] = lp[i];
        writeLetter(i, lp[i]);
      }
    }
    lettersSettled = settled;
  }

  function spring(dt: number) {
    const inside = fine && px > -1e4;
    const tx = inside ? mx * 0.34 : 0;
    const ty = inside ? -my * 0.22 : 0;
    const tRy = inside ? mx * 0.42 : 0;
    const tRx = inside ? my * 0.3 : 0;
    svx += (SPRING_K * (tx - sx) - SPRING_C * svx) * dt;
    svy += (SPRING_K * (ty - sy) - SPRING_C * svy) * dt;
    rvy += (SPRING_K * 0.7 * (tRy - ry) - SPRING_C * 0.85 * rvy) * dt;
    rvx += (SPRING_K * 0.7 * (tRx - rx) - SPRING_C * 0.85 * rvx) * dt;
    sx += svx * dt;
    sy += svy * dt;
    ry += rvy * dt;
    rx += rvx * dt;
  }

  function emitRipple(dir: THREE_NS.Vector3) {
    const slot = ripSlot ? blobMat.uniforms.uRip1.value : blobMat.uniforms.uRip0.value;
    slot.set(dir.x, dir.y, dir.z, clock);
    ripSlot ^= 1;
    lastEmit = clock;
    movedSinceEmit = false;
  }

  function pointerOnBlob(k: number, amp: number) {
    const u = blobMat.uniforms;
    if (!fine) {
      u.uMouseDir.value.set(cmx * 0.9, -cmy * 0.9, 0.75).normalize();
      u.uMouseAmp.value = 0.1 + en * 0.22;
      return;
    }
    let hit = false;
    if (px > -1e4 && v3.d && v3.e && qInv) {
      const tanH = Math.tan((camera.fov * Math.PI) / 360);
      const D = v3.d.set(mx * tanH * camera.aspect, -my * tanH, -1).normalize();
      const C = blob.position;
      const R = blob.scale.x * (1 + amp * 0.55);
      const b = D.dot(C);
      const disc = b * b - (C.lengthSq() - R * R);
      hit = b > 0 && disc > 0;
      const dir = v3.e.copy(D).multiplyScalar(hit ? b - Math.sqrt(disc) : b).sub(C);
      const ratio = dir.length() / R;
      if (ratio < 1e-4) dir.set(0, 0, 1);
      dir.normalize().applyQuaternion(qInv.copy(blob.quaternion).invert());
      u.uMouseDir.value.lerp(dir, Math.min(1, k * 1.8)).normalize();
      prox = mix(prox, 1 - smooth(1, 2.4, ratio), k);
      if (hit && clock - lastEmit > 0.45 && (!hovered || (movedSinceEmit && clock - lastEmit > 1.3))) emitRipple(dir);
    } else {
      prox = mix(prox, 0, k);
    }
    hovered = hit;
    hov = mix(hov, hit ? 1 : 0, k * 0.9);
    warm = mix(warm, hit ? 1 : 0, k * (hit ? 0.5 : 0.28));
    u.uMouseAmp.value = 0.06 + prox * 0.16 + hov * 0.08 + en * 0.2;
  }

  function finaleWeight() {
    const n = nodeT.length;
    if (nowIdx < 1 || nowIdx !== n - 1) return 0;
    return smooth(mix(nodeT[n - 2], nodeT[n - 1], 0.3), nodeT[n - 1], rail);
  }

  function railCamera(s: number) {
    const c = curve.getPointAt(clamp(s, 0, 1));
    const ahead = curve.getPointAt(clamp(s + 0.06, 0, 1));
    camera.position.set(c.x * 0.32, c.y * 0.32 + 0.35, c.z + 5.4);
    camera.lookAt(ahead.x * 0.18 + cmx * 0.25, ahead.y * 0.18 - cmy * 0.18, ahead.z - 3);
  }

  function applyPose(p: Pose & { path: number }, k = 1) {
    const f = p.path * finaleWeight();
    blob.position.set(mix(p.x, FINALE.x, f) + sx, mix(p.y, FINALE.y, f) + sy, mix(p.z, FINALE.z, f));
    blob.scale.setScalar(mix(p.sc, FINALE.sc, f) * 1.55);
    blob.rotation.set(rx, ry, 0);
    const amp = mix(p.amp, FINALE.amp, f) + kick * 0.2 + en * 0.12;
    const u = blobMat.uniforms;
    u.uAmp.value = amp;
    u.uFreq.value = 0.95 + en * 0.28;
    u.uDim.value = mix(p.dim, FINALE.dim, f);
    u.uHue.value = hue;
    u.uScroll.value = st / maxScroll;
    pointerOnBlob(k, amp);
    u.uWarm.value = Math.min(1, warm + en * 0.35);
    u.uTime.value = time;
    u.uClock.value = clock;
    pathGroup.visible = p.path > 0.002;
    lineMat.uniforms.uOpacity.value = p.path * 0.5;
    nodeMat.uniforms.uOpacity.value = p.path;
    applyVeils(p);
  }

  function updateDust() {
    const factors = [0.25, 0.6, 1.1];
    dustLayers.forEach((layer, i) => {
      const f = factors[i];
      layer.position.x = -cmx * 0.6 * f;
      layer.position.y = cmy * 0.4 * f + (st / vh) * 0.55 * f;
      layer.rotation.z = time * 0.012 * (i % 2 ? -1 : 1) * f;
      dustMats[i].uniforms.uTime.value = time;
    });
  }

  const v3 = {
    a: null as THREE_NS.Vector3 | null,
    b: null as THREE_NS.Vector3 | null,
    d: null as THREE_NS.Vector3 | null,
    e: null as THREE_NS.Vector3 | null
  };
  let qInv: THREE_NS.Quaternion | null = null;

  const labelFade: number[] = [];

  function projectLabels() {
    if (!v3.a || !v3.b || !pathSticky) return;
    const rect = pathSticky.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const W = rect.width;
    const H = wrapRect.height;
    const offY = rect.top - wrapRect.top;
    let best = 0;
    let bestD = Infinity;
    nodeT.forEach((t, i) => {
      const d = Math.abs(t - rail);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best !== active) active = best;
    const order = [best, ...nodePos.map((_, i) => i).filter((i) => i !== best)];
    let box: [number, number, number, number] | null = null;
    order.forEach((i) => {
      const el = labelEls[i];
      if (!el) return;
      const pos = nodePos[i];
      const dist = -v3.a!.copy(pos).applyMatrix4(camera.matrixWorldInverse).z;
      const b = v3.b!.copy(pos).project(camera);
      let x = (b.x * 0.5 + 0.5) * W;
      let y = (-b.y * 0.5 + 0.5) * H - offY;
      const isOn = i === best;
      const sc = isOn ? 1 : clamp(5.5 / Math.max(dist, 0.1), 0.62, 0.9);
      const w = el.offsetWidth * sc;
      const h = el.offsetHeight * sc;
      let side: 'r' | 'l' = x + 22 + w <= W - 24 ? 'r' : 'l';
      if (side === 'l' && x - 22 - w < 24) side = 'r';
      if (isOn) {
        y = clamp(y, 200 + h / 2, H - 190 - h / 2);
        x = clamp(x, 24, W - 24);
      }
      const left = side === 'r' ? x + 22 : x - 22 - w;
      const top = y - h / 2;
      let vis = 1;
      if (isOn) {
        box = [left - 24, top - 24, left + w + 24, top + h + 24];
      } else if (box) {
        const [l0, t0, r0, b0] = box;
        if (left < r0 && left + w > l0 && top < b0 && top + h > t0) vis = 0;
      }
      if (y + offY < 190 || y + offY > H - 170) vis = 0;
      labelFade[i] = mix(labelFade[i] ?? 0, vis, 0.14);
      const depth = (1 - smooth(8, 24, dist)) * smooth(1.2, 3.2, dist);
      const op = cur.path * labelFade[i] * (isOn ? smooth(0.6, 2.2, dist) : depth * 0.6);
      el.dataset.side = side;
      el.style.opacity = op.toFixed(3);
      el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
      el.style.transform =
        side === 'r'
          ? `translate3d(${(x + 22).toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%) scale(${sc.toFixed(3)})`
          : `translate3d(${(x - 22).toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-100%, -50%) scale(${sc.toFixed(3)})`;
    });
  }

  function clearLabels() {
    labelEls.forEach((el) => {
      if (!el) return;
      el.style.transform = '';
      el.style.opacity = '';
      el.style.visibility = '';
      delete el.dataset.side;
    });
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    const k = 1 - Math.pow(1 - 0.08, dt * 60);
    clock += dt;
    energy *= Math.pow(0.965, dt * 60);
    en = mix(en, energy, 1 - Math.pow(1 - 0.12, dt * 60));
    time += dt * (0.55 + en * 1.1);
    kick *= Math.pow(0.95, dt * 60);
    cmx = mix(cmx, mx, k * 0.75);
    cmy = mix(cmy, my, k * 0.75);
    hue = mix(hue, hueTarget, k * 0.6);

    const tgt = targetPose();
    (Object.keys(tgt) as (keyof typeof tgt)[]).forEach((key) => {
      cur[key] = mix(cur[key], tgt[key], k);
    });
    rail = mix(rail, projected ? railTarget() : nodeT[0] ?? 0, k);
    railCamera(rail);
    if (fine) spring(dt);
    applyPose(cur, k);
    updateDust();
    if (fine) updateLetters(dt);
    if (nodeOn) {
      for (let i = 0; i < nodeOn.count; i++) {
        const on = nodeOn.getX(i);
        nodeOn.setX(i, mix(on, i === active ? 1 : 0, k));
      }
      nodeOn.needsUpdate = true;
    }
    renderer!.render(scene, camera);
    if (projected) projectLabels();
  }

  function renderStill() {
    if (!renderer) return;
    Object.assign(cur, { ...POSES[0], ...(narrow ? POSES_NARROW[0] : {}), path: 0 });
    rail = nodeT[0] ?? 0;
    time = 3.2;
    railCamera(rail);
    applyPose(cur);
    applyVeils(targetPose());
    updateDust();
    renderer.render(scene, camera);
  }

  function start() {
    if (disposed || raf || !renderer || mode === 'static' || mode === 'nogl') return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  function onResize() {
    measure();
    st = scroller.scrollTop;
    measureType();
    if (renderer && camera) {
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      renderer.setSize(vw, vh);
      if (mode === 'static') renderStill();
    }
    trackChapter();
    if (!animated) applyVeils(targetPose());
  }

  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  }

  function buildScene(lowPower: boolean) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, vw / vh, 0.1, 120);
    scene.add(camera);

    const blobGeo = new THREE.IcosahedronGeometry(1, lowPower ? 22 : 56);
    blobMat = new THREE.ShaderMaterial({
      vertexShader: blobVertex,
      fragmentShader: blobFragment,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.26 },
        uFreq: { value: 0.95 },
        uMouseDir: { value: new THREE.Vector3(0, 0, 1) },
        uMouseAmp: { value: 0.1 },
        uMouseSharp: { value: 3 },
        uRip0: { value: new THREE.Vector4(0, 0, 1, -100) },
        uRip1: { value: new THREE.Vector4(0, 0, 1, -100) },
        uRipAmp: { value: 0.055 },
        uClock: { value: 0 },
        uWarm: { value: 0 },
        uHue: { value: 0 },
        uDim: { value: 1 },
        uScroll: { value: 0 }
      }
    });
    blob = new THREE.Mesh(blobGeo, blobMat);
    camera.add(blob);
    disposables.push(blobGeo, blobMat);

    const pr = renderer!.getPixelRatio();
    const layers = [
      { count: 520, size: 0.9, opacity: 0.34 },
      { count: 240, size: 1.5, opacity: 0.42 },
      { count: 90, size: 2.4, opacity: 0.5 }
    ];
    layers.forEach((l) => {
      const count = Math.round(l.count * (lowPower ? 0.5 : 1));
      const pos = new Float32Array(count * 3);
      const seed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 30;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        pos[i * 3 + 2] = 6 - Math.random() * 70;
        seed[i] = Math.random();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: dustVertex,
        fragmentShader: dustFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uSize: { value: l.size },
          uPixelRatio: { value: pr },
          uTime: { value: 0 },
          uOpacity: { value: l.opacity }
        }
      });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      dustLayers.push(pts);
      dustMats.push(mat);
      disposables.push(geo, mat);
    });

    const n = pathItems.length;
    nodePos = Array.from({ length: n }, (_, i) => {
      if (i === nowIdx && i === n - 1) return new THREE.Vector3(0.6, 0.15, -i * 8 - 2);
      const a = i * 1.15 + 0.4;
      return new THREE.Vector3(Math.cos(a) * 2.5, Math.sin(a) * 1.45, -i * 8);
    });
    const lead = new THREE.Vector3(nodePos[0].x * 0.4, nodePos[0].y * 0.4, 7);
    const tail = nodePos[n - 1].clone().add(new THREE.Vector3(-0.9, -0.1, -10));
    curve = new THREE.CatmullRomCurve3([lead, ...nodePos, tail], false, 'centripetal');
    const samples = 800;
    const pts = curve.getSpacedPoints(samples);
    nodeT = nodePos.map((p) => {
      let bi = 0;
      let bd = Infinity;
      pts.forEach((q, j) => {
        const d = q.distanceToSquared(p);
        if (d < bd) {
          bd = d;
          bi = j;
        }
      });
      return bi / samples;
    });

    pathGroup = new THREE.Group();
    const colors = new Float32Array(pts.length * 3);
    pts.forEach((_, j) => {
      const [r, g, b] = paletteAt(0.1 + (j / pts.length) * 0.8);
      const fade = 0.55 + 0.45 * (1 - j / pts.length);
      colors[j * 3] = mix(0.9, r, 0.6) * fade;
      colors[j * 3 + 1] = mix(0.9, g, 0.6) * fade;
      colors[j * 3 + 2] = mix(0.95, b, 0.6) * fade;
    });
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    lineGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    lineMat = new THREE.ShaderMaterial({
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      transparent: true,
      depthWrite: false,
      uniforms: { uOpacity: { value: 0 } }
    });
    pathGroup.add(new THREE.Line(lineGeo, lineMat));

    const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodePos);
    nodeOn = new THREE.BufferAttribute(new Float32Array(n), 1);
    nodeGeo.setAttribute('aOn', nodeOn);
    nodeGeo.setAttribute('aBig', new THREE.BufferAttribute(Float32Array.from(pathItems, (p) => (p.now ? 1 : 0)), 1));
    nodeMat = new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uSize: { value: 5.5 },
        uPixelRatio: { value: pr },
        uOpacity: { value: 0 }
      }
    });
    pathGroup.add(new THREE.Points(nodeGeo, nodeMat));
    pathGroup.visible = false;
    scene.add(pathGroup);
    disposables.push(lineGeo, lineMat, nodeGeo, nodeMat);

    v3.a = new THREE.Vector3();
    v3.b = new THREE.Vector3();
    v3.d = new THREE.Vector3();
    v3.e = new THREE.Vector3();
    qInv = new THREE.Quaternion();
  }

  function toFallback() {
    stop();
    glLive = false;
    mode = 'nogl';
    applyVeils(targetPose());
  }

  function onContextLost(e: Event) {
    e.preventDefault();
    toFallback();
  }

  function finishLoading() {
    if (disposed || !loading) return;
    if (!animated) {
      loading = false;
      ready = true;
      return;
    }
    exiting = true;
    setTimeout(() => {
      if (!disposed) ready = true;
    }, 280);
    setTimeout(() => {
      if (!disposed) loading = false;
    }, 1100);
  }

  function runCounter(progress: () => number, done: () => boolean) {
    const t0 = performance.now();
    let shown = 0;
    const step = (now: number) => {
      if (disposed) return;
      const cap = Math.min(progress(), (now - t0) / 900);
      shown = mix(shown, cap, 0.12);
      if (cap - shown < 0.004) shown = cap;
      counter = String(Math.round(shown * 100)).padStart(3, '0');
      if (shown >= 1 && done()) {
        counter = '100';
        setTimeout(finishLoading, 160);
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  onMount(() => {
    rm = prefersReduced();
    const mql = window.matchMedia('(max-width: 899px), (pointer: coarse)');
    const fineMql = window.matchMedia('(pointer: fine) and (hover: hover)');
    narrow = mql.matches;
    fine = !rm && fineMql.matches;
    const gl = hasWebGL();
    mode = !gl ? 'nogl' : rm ? 'static' : narrow ? 'lite' : 'full';

    measure();
    st = scroller.scrollTop;
    trackChapter();
    applyVeils(targetPose());

    if (!animated) {
      loading = false;
      ready = true;
    }

    const onMql = () => {
      narrow = mql.matches;
      fine = !rm && fineMql.matches;
      if (!projected) clearLabels();
      measure();
      measureType();
    };
    mql.addEventListener('change', onMql);
    fineMql.addEventListener('change', onMql);
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerout', onPointerOut, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    const ro = new ResizeObserver(() => {
      measure();
      trackChapter();
    });
    ro.observe(scroller.firstElementChild as Element);

    let progress = 0.08;
    let firstFrame = false;
    if (animated) runCounter(() => progress, () => firstFrame);

    const fontsReady = (document.fonts?.ready ?? Promise.resolve()).then(() => {
      progress += 0.22;
      if (!disposed) measureType();
    });

    if (mode !== 'nogl') {
      import('three')
        .then(async (mod) => {
          if (disposed) return;
          THREE = mod;
          progress += 0.55;
          try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, narrow ? 1.5 : 2));
            renderer.setClearColor(0x07070a, 1);
            renderer.setSize(vw, vh);
            buildScene(narrow);
            canvas.addEventListener('webglcontextlost', onContextLost);
          } catch {
            renderer?.dispose();
            renderer = null;
            toFallback();
            progress = 1;
            firstFrame = true;
            return;
          }
          await fontsReady;
          if (disposed) return;
          measure();
          if (mode === 'static') {
            renderStill();
          } else {
            Object.assign(cur, targetPose());
            rail = nodeT[0];
            start();
          }
          glLive = true;
          progress = 1;
          requestAnimationFrame(() => (firstFrame = true));
        })
        .catch(() => {
          if (disposed) return;
          toFallback();
          progress = 1;
          firstFrame = true;
        });
    } else {
      progress = 1;
      firstFrame = true;
    }

    return () => {
      disposed = true;
      stop();
      mql.removeEventListener('change', onMql);
      fineMql.removeEventListener('change', onMql);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
      canvas?.removeEventListener('webglcontextlost', onContextLost);
      disposables.forEach((d) => d.dispose());
      disposables.length = 0;
      renderer?.dispose();
      renderer = null;
    };
  });
</script>

{#snippet title(text: string)}
  <span class="sr">{text}</span>
  <span class="split" aria-hidden="true">{#each [...text] as c, j}<span class="lt" style="--j:{j}">{c}</span>{/each}</span>
{/snippet}

<div
  class="wgl"
  class:anim={animated}
  class:ready
  class:projected
  class:narrow
  class:nogl={mode === 'nogl'}
  class:still={!animated}
  class:fine
  bind:this={wrap}
>
  <canvas bind:this={canvas} class="stage" class:live={glLive} aria-hidden="true"></canvas>
  <div class="blob-css" aria-hidden="true"></div>
  <div class="veil veil-side" bind:this={veilSide} aria-hidden="true"></div>
  <div class="veil veil-bottom" bind:this={veilBottom} aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

  <div class="scroller" bind:this={scroller} onscroll={onScroll}>
    <div class="track">
      <section class="ch hero" bind:this={sectionEls[0]} aria-label="Intro">
        <h1 class="name">
          <span class="sr">{cvData.name}</span>
          {#each nameWords as word, i}
            <span class="line split" aria-hidden="true"><span class="word" style="--d:{i}">{#each word as l}<span class="lt" bind:this={letterEls[l.k]}>{l.c}</span>{/each}</span></span>
          {/each}
        </h1>
        <div class="hero-foot">
          <div class="hero-id">
            <p class="role">{cvData.role}</p>
            <p class="tagline">{cvData.tagline}</p>
          </div>
          <div class="hint" aria-hidden="true">
            <span>Scroll to explore</span>
            <i class="hint-line"></i>
          </div>
          <div class="hero-side">
            {#if current}
              <p class="now-line"><span class="now-tag"><i class="now-dot" aria-hidden="true"></i>Now<span class="now-sep">—</span></span><span class="nw">{current.title}</span><span class="nw">@ {current.company}</span></p>
            {/if}
            <p class="loc">{cvData.contact.location}</p>
          </div>
        </div>
      </section>

      <section class="ch about" class:in={seen[1]} bind:this={sectionEls[1]}>
        <div class="about-inner">
          <h2 class="kicker"><span class="k-idx" aria-hidden="true">02</span><span class="k-title">{@render title('About')}</span></h2>
          <p class="words">
            {#each words as w, i}<span class="w" style="--i:{i}">{w}</span>{' '}{/each}
          </p>
        </div>
      </section>

      <section class="ch path" class:in={seen[2]} bind:this={sectionEls[2]} style="--n:{pathItems.length}">
        <div class="path-sticky" bind:this={pathSticky}>
          <h2 class="kicker path-kicker"><span class="k-idx" aria-hidden="true">03</span><span class="k-title">{@render title('Path')}</span></h2>
          <ol class="nodes">
            {#each pathItems as item, i}
              <li class="node" class:on={!projected || i === active} class:now={item.now} bind:this={labelEls[i]}>
                <span class="n-idx">{String(i + 1).padStart(2, '0')}{#if item.now}<span class="n-now"><i class="now-dot" aria-hidden="true"></i>Now</span>{/if}</span>
                <h3 class="n-head">{item.heading}</h3>
                <p class="n-meta">
                  {#if item.role}<span class="n-role">{item.role}</span>{/if}
                  <span class="n-per">{item.period}</span>
                </p>
                <div class="n-more">
                  <div>
                    <p class="n-desc">{item.description}</p>
                    <p class="n-tech">{item.technologies.join(' / ')}</p>
                  </div>
                </div>
              </li>
            {/each}
          </ol>
        </div>
      </section>

      <section class="ch skills" class:in={seen[3]} bind:this={sectionEls[3]}>
        <h2 class="kicker"><span class="k-idx" aria-hidden="true">04</span><span class="k-title">{@render title('Skills')}</span></h2>
        <div class="skill-groups">
          {#each skillGroups as g}
            <div class="sg">
              <h3 class="sg-label">{g.label}</h3>
              <ul class="rows">
                {#each g.items as item}
                  <li
                    class="row"
                    style="--i:{item.i}"
                    bind:this={rowEls[item.i]}
                    onpointerenter={() => skillEnter(item.i)}
                    onpointerleave={skillLeave}
                  >
                    <span class="row-name" bind:this={rowNameEls[item.i]}>{item.name}</span>
                    <span class="row-idx" aria-hidden="true">{String(item.i + 1).padStart(2, '0')}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
        <div class="meta">
          <div class="meta-col">
            <h3>Languages</h3>
            <ul>
              {#each cvData.languages as l}
                <li>
                  <span class="m-main">{l.name}</span>
                  <span class="m-sub">{l.level}</span>
                  {#if l.note}<span class="m-sub">{l.note}</span>{/if}
                </li>
              {/each}
            </ul>
          </div>
          <div class="meta-col">
            <h3>Education</h3>
            <ul>
              {#each cvData.education as e}
                <li>
                  <span class="m-main">{e.title}</span>
                  <span class="m-sub">{e.institute} · {e.period}</span>
                </li>
              {/each}
            </ul>
          </div>
          <div class="meta-col">
            <h3>Conferences</h3>
            <ul>
              {#each cvData.conferences as c}
                <li>
                  <span class="m-main">{c.name}</span>
                  <span class="m-sub">{c.location} · {c.year}</span>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </section>

      <section class="ch contact" class:in={seen[4]} bind:this={sectionEls[4]}>
        <h2 class="contact-title">{@render title('Contact')}</h2>
        <div class="contact-foot">
          <a class="c-link c-mail" href="mailto:{cvData.contact.email}">{cvData.contact.email}</a>
          <div class="c-row">
            <a class="c-link" href={cvData.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a class="c-link" href="tel:{cvData.contact.phone.replace(/\s+/g, '')}">{cvData.contact.phone}</a>
            <span class="c-loc">{cvData.contact.location}</span>
          </div>
        </div>
      </section>
    </div>
  </div>

  <header class="hud" aria-hidden="true">
    <div class="hud-l">
      <span class="mark">{monogram}</span>
      <span class="hud-role">{cvData.role}</span>
    </div>
    <div class="hud-r">
      <span class="hud-count">{String(chapter + 1).padStart(2, '0')} / {String(CHAPTERS.length).padStart(2, '0')}</span>
      <span class="hud-bar"><span bind:this={progEl}></span></span>
      <span class="hud-chap">{CHAPTERS[chapter]}</span>
    </div>
  </header>

  {#if loading}
    <div class="pre" class:out={exiting} aria-hidden="true">
      <span class="pre-label">Loading</span>
      <span class="pre-count">{counter}</span>
      <span class="pre-line" style="transform: scaleX({Number(counter) / 100})"></span>
    </div>
  {/if}
</div>

<style>
  .wgl {
    --bg: #07070a;
    --fg: #f4f3ef;
    --muted: #a4a3ab;
    --faint: rgba(244, 243, 239, 0.14);
    --mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
    --display: 'Boldonse', 'Inter', system-ui, sans-serif;
    --ease: cubic-bezier(0.19, 1, 0.22, 1);
    --pad: clamp(20px, 5vw, 72px);
    position: relative;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    background: var(--bg);
    color: var(--fg);
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
  .lt {
    display: inline-block;
  }

  .stage {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: block;
    opacity: 0;
    transition: opacity 1.4s ease;
  }
  .stage.live {
    opacity: 1;
  }
  .wgl:not(.anim) .stage {
    transition: none;
  }
  .nogl .stage {
    display: none;
  }

  .blob-css {
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    width: min(62vmin, 560px);
    aspect-ratio: 1;
    transform: translate(-50%, -52%);
    border-radius: 50%;
    background:
      radial-gradient(circle at 34% 30%, rgba(210, 205, 255, 0.28), transparent 42%),
      conic-gradient(from 210deg, #2a1d4a, #1b3f52, #4a3a2c, #3a1f45, #1c2d52, #2a1d4a);
    box-shadow:
      inset 0 0 60px 18px rgba(7, 7, 10, 0.85),
      0 0 120px 20px rgba(120, 110, 200, 0.12);
    filter: blur(6px);
  }
  .nogl .blob-css {
    display: block;
  }

  .veil {
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0;
  }
  .veil-side {
    background: linear-gradient(90deg, rgba(7, 7, 10, 0.92) 0%, rgba(7, 7, 10, 0.82) 42%, rgba(7, 7, 10, 0.2) 70%, transparent 88%);
  }
  .narrow .veil-side,
  .still .veil-side {
    background: rgba(7, 7, 10, 0.8);
  }
  .veil-bottom {
    background: linear-gradient(to top, rgba(7, 7, 10, 0.94) 0%, rgba(7, 7, 10, 0.8) 26%, transparent 52%);
  }

  .grain {
    position: fixed;
    inset: -50%;
    pointer-events: none;
    opacity: 0.055;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 0 0 0 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .anim .grain {
    animation: grain 0.9s steps(6) infinite;
  }
  @keyframes grain {
    0% { transform: translate(0, 0); }
    20% { transform: translate(-3%, 2%); }
    40% { transform: translate(2%, -4%); }
    60% { transform: translate(-4%, -1%); }
    80% { transform: translate(3%, 3%); }
    100% { transform: translate(0, 0); }
  }

  .scroller {
    position: absolute;
    inset: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    -webkit-mask-image: linear-gradient(to bottom, transparent 0, transparent 64px, #000 150px, #000 calc(100% - 140px), transparent calc(100% - 56px));
    mask-image: linear-gradient(to bottom, transparent 0, transparent 64px, #000 150px, #000 calc(100% - 140px), transparent calc(100% - 56px));
  }
  .scroller::-webkit-scrollbar {
    display: none;
  }

  .ch {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 0 var(--pad);
    box-sizing: border-box;
  }

  .kicker {
    display: flex;
    align-items: center;
    gap: 18px;
    margin: 0 0 clamp(28px, 4.5vh, 52px);
    font-weight: 400;
    color: var(--fg);
  }
  .k-idx {
    font-family: var(--mono);
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    color: var(--muted);
  }
  .k-title {
    padding-top: 0.14em;
    font-family: var(--display);
    font-size: clamp(1.3rem, 2.1vw, 2rem);
    font-weight: 400;
    font-synthesis: none;
    line-height: 1.1;
    white-space: nowrap;
  }
  .k-title .split {
    display: inline-block;
    letter-spacing: -0.01em;
  }
  .kicker::after {
    content: '';
    flex: 0 0 56px;
    height: 1px;
    background: var(--faint);
  }
  .anim .k-title .split {
    transition: letter-spacing 1.5s var(--ease);
  }
  .anim .k-title .lt {
    transition: opacity 0.9s ease, transform 1.2s var(--ease);
    transition-delay: calc(var(--j) * 55ms);
  }
  .anim .ch:not(.in) .k-title .split {
    letter-spacing: 0.42em;
  }
  .anim .ch:not(.in) .k-title .lt {
    opacity: 0;
    transform: translateY(0.45em);
  }

  .hero {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .name {
    margin: 0;
    padding-bottom: 8vh;
    text-align: center;
    font-family: var(--display);
    font-size: clamp(2.4rem, 7.2vw, 7.25rem);
    font-weight: 400;
    font-synthesis: none;
    line-height: 1.26;
    letter-spacing: -0.02em;
    color: #fff;
    mix-blend-mode: difference;
  }
  .name .line {
    display: block;
    overflow: hidden;
    margin: -0.36em 0 -0.1em;
    padding: 0.36em 0.08em 0.1em;
  }
  .name .word {
    display: inline-block;
  }
  .name .lt {
    transform-origin: 50% 100%;
  }
  .fine .name .lt {
    will-change: transform;
  }
  .anim .name .word {
    transform: translateY(130%);
    transition: transform 1.3s var(--ease);
    transition-delay: calc(var(--d) * 110ms);
  }
  .anim.ready .name .word {
    transform: none;
  }

  .hero-foot {
    position: absolute;
    left: var(--pad);
    right: var(--pad);
    bottom: 150px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: end;
    gap: 24px;
  }
  .hero-id {
    max-width: 30rem;
  }
  .hero-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    justify-self: end;
    text-align: right;
  }
  .now-line {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: baseline;
    gap: 6px 10px;
    margin: 0;
    font-family: var(--mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .now-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--fg);
  }
  .now-sep {
    margin-left: 2px;
    color: var(--muted);
  }
  .nw {
    white-space: nowrap;
  }
  .now-dot {
    position: relative;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a7f4e3;
    box-shadow: 0 0 10px rgba(167, 244, 227, 0.55);
  }
  .anim .now-dot::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1px solid rgba(167, 244, 227, 0.6);
    animation: now-pulse 2.4s var(--ease) infinite;
  }
  @keyframes now-pulse {
    0% { transform: scale(0.4); opacity: 1; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  .role {
    margin: 0 0 8px;
    font-family: var(--mono);
    font-size: 0.74rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--fg);
  }
  .tagline {
    margin: 0;
    font-size: 0.98rem;
    line-height: 1.5;
    color: var(--muted);
  }
  .loc {
    margin: 0;
    font-family: var(--mono);
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .hint-line {
    position: relative;
    width: 1px;
    height: 56px;
    overflow: hidden;
    background: var(--faint);
  }
  .hint-line::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 100%;
    background: var(--fg);
    transform: translateY(-100%);
  }
  .anim .hint-line::after {
    animation: hint 2.2s var(--ease) infinite;
  }
  @keyframes hint {
    0% { transform: translateY(-100%); }
    55% { transform: translateY(0); }
    100% { transform: translateY(100%); }
  }
  .anim .hero-foot {
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 1s ease 0.5s, transform 1.2s var(--ease) 0.5s;
  }
  .anim.ready .hero-foot {
    opacity: 1;
    transform: none;
  }

  .about {
    display: flex;
    align-items: center;
    padding-top: 120px;
    padding-bottom: 150px;
  }
  .about-inner {
    max-width: min(40rem, 52vw);
  }
  .words {
    margin: 0;
    font-size: clamp(1.2rem, 1.9vw, 1.72rem);
    font-weight: 400;
    line-height: 1.42;
    letter-spacing: -0.012em;
    color: var(--fg);
  }
  .w {
    display: inline-block;
  }
  .anim .about .w {
    opacity: 0;
    transform: translateY(0.5em);
    transition: opacity 0.9s ease, transform 1s var(--ease);
    transition-delay: calc(var(--i) * 12ms);
  }
  .anim .about.in .w {
    opacity: 1;
    transform: none;
  }

  .path {
    padding: 0;
  }
  .projected .path {
    height: calc(100dvh + var(--n) * 70vh);
  }
  .path-sticky {
    position: relative;
    padding: 120px var(--pad) 150px;
    box-sizing: border-box;
  }
  .projected .path-sticky {
    position: sticky;
    top: 0;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    padding: 0;
  }
  .projected .path-kicker {
    position: absolute;
    top: 128px;
    left: var(--pad);
    z-index: 1;
  }

  .nodes {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .node {
    position: relative;
  }
  .n-idx {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 8px;
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    color: var(--muted);
  }
  .n-now {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px 4px 9px;
    border: 1px solid transparent;
    border-radius: 999px;
    background:
      linear-gradient(#0d0d12, #0d0d12) padding-box,
      linear-gradient(115deg, #8b48b5, #f4ac9f 40%, #a7f4e3 75%, #3e91f9) border-box;
    font-size: 0.64rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--fg);
  }
  .projected .node:global([data-side='l']) .n-idx {
    justify-content: flex-end;
  }
  .n-head {
    margin: 0;
    font-size: clamp(1.25rem, 1.8vw, 1.6rem);
    font-weight: 600;
    line-height: 1.12;
    letter-spacing: -0.02em;
  }
  .n-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin: 8px 0 0;
    font-family: var(--mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .n-role {
    color: var(--fg);
  }
  .n-more {
    display: grid;
    grid-template-rows: 1fr;
  }
  .n-more > div {
    overflow: hidden;
  }
  .n-desc {
    margin: 14px 0 0;
    font-size: 0.95rem;
    line-height: 1.55;
    color: #d9d8d3;
  }
  .n-tech {
    margin: 12px 0 0;
    font-family: var(--mono);
    font-size: 0.68rem;
    line-height: 1.7;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .wgl:not(.projected) .nodes {
    position: relative;
    max-width: 44rem;
    padding-left: 30px;
  }
  .wgl:not(.projected) .nodes::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 6px;
    bottom: 6px;
    width: 1px;
    background: linear-gradient(to bottom, rgba(244, 243, 239, 0.4), rgba(244, 243, 239, 0.08));
  }
  .wgl:not(.projected) .node {
    padding-bottom: 44px;
  }
  .wgl:not(.projected) .node:last-child {
    padding-bottom: 0;
  }
  .wgl:not(.projected) .node::after {
    content: '';
    position: absolute;
    left: -30px;
    top: 3px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--fg);
    box-shadow: 0 0 0 4px rgba(7, 7, 10, 1), 0 0 14px 2px rgba(190, 180, 255, 0.45);
  }
  .wgl:not(.projected) .node.now::after {
    left: -34px;
    top: 4px;
    width: 17px;
    height: 17px;
    background: radial-gradient(circle at 35% 35%, #fff, #f4ac9f 45%, #8b48b5);
    box-shadow: 0 0 0 5px rgba(7, 7, 10, 1), 0 0 26px 6px rgba(244, 172, 159, 0.4);
  }
  .node.now .n-head {
    font-family: var(--display);
    font-weight: 400;
    font-synthesis: none;
    font-size: clamp(1.35rem, 2vw, 1.85rem);
    line-height: 1.32;
    letter-spacing: -0.01em;
  }
  .wgl:not(.projected) .node.now .n-desc {
    color: var(--fg);
  }

  .projected .nodes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .projected .node {
    position: absolute;
    left: 0;
    top: 0;
    width: min(360px, 34vw);
    opacity: 0;
    transform-origin: left center;
    will-change: transform, opacity;
  }
  .projected .node:global([data-side='l']) {
    transform-origin: right center;
    text-align: right;
  }
  .projected .node:global([data-side='l']) .n-meta {
    justify-content: flex-end;
  }
  .projected .node::before {
    content: '';
    position: absolute;
    inset: -48px -64px;
    z-index: -1;
    background: radial-gradient(closest-side, rgba(7, 7, 10, 0.97), rgba(7, 7, 10, 0.94) 62%, rgba(7, 7, 10, 0.6) 82%, transparent);
    pointer-events: none;
  }
  .projected .node .n-more {
    grid-template-rows: 0fr;
    opacity: 0;
    transition: grid-template-rows 0.7s var(--ease), opacity 0.5s ease;
  }
  .projected .node.on .n-more {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .projected .node.on .n-head {
    font-size: clamp(1.5rem, 2.3vw, 2.1rem);
  }
  .projected .node.now {
    width: min(440px, 38vw);
  }
  .projected .node.now.on .n-head {
    font-size: clamp(1.45rem, 2.2vw, 2.05rem);
  }
  .projected .n-head {
    transition: font-size 0.6s var(--ease);
  }

  .skills {
    padding-top: 120px;
    padding-bottom: 150px;
  }
  .skill-groups {
    max-width: min(62rem, 60vw);
  }
  .sg + .sg {
    margin-top: clamp(36px, 6vh, 64px);
  }
  .sg-label {
    margin: 0 0 10px;
    font-family: var(--mono);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--faint);
  }
  .row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    padding: 0.3em 0;
    border-bottom: 1px solid var(--faint);
    font-size: clamp(1.4rem, 2.7vw, 2.55rem);
    font-weight: 500;
    line-height: 1.12;
    letter-spacing: -0.02em;
    transition: color 0.4s ease, padding 0.6s var(--ease);
  }
  .row-name {
    white-space: nowrap;
    transition: letter-spacing 0.7s var(--ease);
  }
  .row:global(.wrap) .row-name {
    white-space: normal;
  }
  .anim .row:hover {
    padding-left: 0.4em;
  }
  .anim .row:hover .row-name {
    letter-spacing: var(--trk, -0.01em);
  }
  .row-idx {
    font-family: var(--mono);
    font-size: 0.7rem;
    font-weight: 400;
    letter-spacing: 0.14em;
    color: var(--muted);
  }
  .anim .skills .row {
    opacity: 0;
    transform: translateY(18px);
    transition: opacity 0.8s ease, transform 1s var(--ease), padding 0.6s var(--ease);
    transition-delay: calc(var(--i) * 28ms);
  }
  .anim .skills.in .row {
    opacity: 1;
    transform: none;
  }
  .anim .skills.in .row:hover {
    transition-delay: 0s;
  }

  .meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 32px;
    max-width: min(62rem, 60vw);
    margin-top: clamp(56px, 10vh, 110px);
    font-family: var(--mono);
  }
  .meta h3 {
    margin: 0 0 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--faint);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--fg);
  }
  .meta ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .meta li {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 14px;
  }
  .m-main {
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--fg);
  }
  .m-sub {
    font-size: 0.72rem;
    line-height: 1.45;
    color: var(--muted);
  }

  .contact {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 150px;
  }
  .contact-title {
    margin: 0 0 12vh;
    font-family: var(--display);
    font-size: clamp(2.6rem, 8.2vw, 8.25rem);
    font-weight: 400;
    font-synthesis: none;
    line-height: 1.26;
    color: #fff;
    white-space: nowrap;
    mix-blend-mode: difference;
  }
  .contact-title .split {
    display: inline-block;
    letter-spacing: -0.02em;
  }
  .anim .contact-title .split {
    transition: letter-spacing 1.8s var(--ease);
  }
  .anim .contact-title .lt {
    transition: opacity 1s ease, transform 1.4s var(--ease);
    transition-delay: calc(var(--j) * 60ms);
  }
  .anim .contact:not(.in) .contact-title .split {
    letter-spacing: 0.24em;
  }
  .anim .contact:not(.in) .contact-title .lt {
    opacity: 0;
    transform: translateY(0.35em);
  }
  .contact-foot {
    position: absolute;
    left: var(--pad);
    right: var(--pad);
    bottom: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    text-align: center;
  }
  .c-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px 32px;
    font-family: var(--mono);
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .c-loc {
    color: var(--muted);
  }
  .c-link {
    position: relative;
    color: var(--fg);
    text-decoration: none;
  }
  .c-link::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -4px;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right center;
    transition: transform 0.6s var(--ease);
  }
  .c-link:hover::after,
  .c-link:focus-visible::after {
    transform: scaleX(1);
    transform-origin: left center;
  }
  .c-mail {
    font-size: clamp(1.25rem, 3vw, 2.5rem);
    font-weight: 500;
    letter-spacing: -0.025em;
    overflow-wrap: anywhere;
  }
  .c-link:focus-visible {
    outline: 1px solid var(--fg);
    outline-offset: 8px;
  }
  .wgl:not(.anim) .c-link::after {
    transition: none;
  }

  .hud {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 28px var(--pad);
    pointer-events: none;
    font-family: var(--mono);
    font-size: 0.68rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    background: linear-gradient(to bottom, rgba(7, 7, 10, 0.94) 0%, rgba(7, 7, 10, 0.72) 55%, transparent);
    padding-bottom: 44px;
  }
  .hud-l,
  .hud-r {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 1px solid rgba(244, 243, 239, 0.5);
    border-radius: 50%;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--fg);
  }
  .hud-role,
  .hud-chap {
    color: var(--muted);
  }
  .hud-count {
    color: var(--fg);
    font-variant-numeric: tabular-nums;
  }
  .hud-bar {
    position: relative;
    width: 56px;
    height: 1px;
    background: var(--faint);
    overflow: hidden;
  }
  .hud-bar span {
    position: absolute;
    inset: 0;
    background: var(--fg);
    transform: scaleX(0);
    transform-origin: left center;
  }
  .hud-chap {
    min-width: 5.5em;
  }

  .pre {
    position: absolute;
    inset: 0;
    z-index: 5;
    background: var(--bg);
    font-family: var(--mono);
    color: var(--fg);
  }
  .pre.out {
    transform: translateY(-100%);
    transition: transform 1.05s cubic-bezier(0.77, 0, 0.18, 1);
  }
  .pre-label {
    position: absolute;
    left: var(--pad);
    bottom: calc(50% + 18px);
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .pre-count {
    position: absolute;
    right: var(--pad);
    bottom: calc(50% + 10px);
    font-size: clamp(3rem, 9vw, 7.5rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.04em;
    font-variant-numeric: tabular-nums;
  }
  .pre-line {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: var(--fg);
    transform-origin: left center;
    transition: transform 0.2s linear;
  }
  .pre.out .pre-line {
    top: auto;
    bottom: 0;
  }

  @media (max-width: 899px) {
    .about-inner,
    .skill-groups,
    .meta {
      max-width: none;
    }
    .meta {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .hero-foot {
      grid-template-columns: 1fr;
      bottom: 130px;
    }
    .hint,
    .loc {
      display: none;
    }
    .hero-side {
      order: -1;
      justify-self: start;
      align-items: flex-start;
      text-align: left;
    }
    .now-line {
      justify-content: flex-start;
    }
  }

  @media (max-width: 720px) {
    .hud {
      padding: 18px 16px;
    }
    .hud-r {
      position: absolute;
      left: 64px;
      top: 26px;
      gap: 10px;
    }
    .hud-role,
    .hud-bar {
      display: none;
    }
    .ch {
      padding-left: 16px;
      padding-right: 16px;
    }
    .path-sticky {
      padding-left: 16px;
      padding-right: 16px;
    }
    .hero-foot,
    .contact-foot {
      left: 16px;
      right: 16px;
      bottom: 200px;
    }
    .contact-title {
      margin-bottom: 22vh;
    }
    .about,
    .skills,
    .path-sticky {
      padding-top: 96px;
      padding-bottom: 120px;
    }
    .row {
      font-size: 1.35rem;
    }
    .name {
      font-size: min(14.6vw, 4.2rem);
    }
    .contact-title {
      font-size: min(13vw, 3.6rem);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .grain,
    .hint-line::after,
    .now-dot::after {
      animation: none !important;
    }
    .pre,
    .pre-line,
    .stage {
      transition: none !important;
    }
  }
</style>
