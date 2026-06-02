// Shared pointer-driven micro-interactions used by the modern themes.
// All effects bow out gracefully when the user prefers reduced motion.

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface TiltOptions {
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** Scale applied while hovering. */
  scale?: number;
  /** Emit a cursor-following spotlight via --mx / --my / --spot CSS vars. */
  spotlight?: boolean;
  /** Perspective distance in px. */
  perspective?: number;
}

/**
 * 3D tilt towards the cursor + an optional spotlight.
 * The spotlight is exposed as CSS custom properties so each theme can style it:
 *   --mx / --my  → cursor position (%), --spot → 0|1 opacity gate.
 */
export function tilt(node: HTMLElement, options: TiltOptions = {}) {
  let opts = { max: 3, scale: 1, spotlight: true, perspective: 1000, ...options };
  const reduce = prefersReducedMotion();

  function onMove(e: MouseEvent) {
    const r = node.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    if (opts.spotlight) {
      node.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
      node.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);
      node.style.setProperty('--spot', '1');
    }

    if (!reduce && opts.max > 0) {
      const ry = (px - 0.5) * 2 * opts.max;
      const rx = (0.5 - py) * 2 * opts.max;
      node.style.transform = `perspective(${opts.perspective}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${opts.scale})`;
    }
  }

  function onLeave() {
    node.style.setProperty('--spot', '0');
    if (!reduce && opts.max > 0) {
      node.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    }
  }

  node.addEventListener('mousemove', onMove);
  node.addEventListener('mouseleave', onLeave);

  return {
    update(next: TiltOptions) {
      opts = { max: 3, scale: 1, spotlight: true, perspective: 1000, ...next };
    },
    destroy() {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    }
  };
}

interface RevealOptions {
  /** Stagger delay in ms. */
  delay?: number;
  /** Vertical offset to rise from, in px. */
  y?: number;
}

/**
 * Reveal an element when it scrolls into view (IntersectionObserver).
 * Elements already on screen at load reveal immediately with their stagger.
 */
export function reveal(node: HTMLElement, options: RevealOptions = {}) {
  const { delay = 0, y = 28 } = options;

  if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
    return {};
  }

  node.style.opacity = '0';
  node.style.transform = `translateY(${y}px)`;
  node.style.transition = `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`;
  node.style.willChange = 'opacity, transform';

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.style.opacity = '1';
          node.style.transform = 'translateY(0)';
          io.unobserve(node);
          // Clear inline styles once settled so other transforms (tilt) can take over.
          window.setTimeout(() => {
            node.style.willChange = '';
            node.style.transform = '';
            node.style.transition = '';
          }, 750 + delay);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  io.observe(node);

  return {
    destroy() {
      io.disconnect();
    }
  };
}
