export interface LensMapOptions {
  width: number;
  height: number;
  radius: number;
  strength: number;
}

export interface EngineEnv {
  vendor: string;
  supports(prop: string, value: string): boolean;
}

export function roundedRectSdf(
  x: number,
  y: number,
  halfW: number,
  halfH: number,
  radius: number
): number {
  const r = Math.min(radius, Math.min(halfW, halfH));
  const qx = Math.abs(x) - (halfW - r);
  const qy = Math.abs(y) - (halfH - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside - r;
}

export function buildDisplacementMap(opts: LensMapOptions): Uint8ClampedArray {
  const { width, height, radius, strength } = opts;
  const data = new Uint8ClampedArray(width * height * 4);
  const halfW = width / 2;
  const halfH = height / 2;
  const falloff = Math.max(radius, 1);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cx = x - halfW + 0.5;
      const cy = y - halfH + 0.5;
      const d = roundedRectSdf(cx, cy, halfW, halfH, radius);
      const ramp = Math.max(0, Math.min(1, 1 + d / falloff));
      const eased = ramp * ramp;
      const len = Math.hypot(cx, cy) || 1;
      const amount = eased * strength * 127;

      const i = (y * width + x) * 4;
      data[i] = 128 + (cx / len) * amount;
      data[i + 1] = 128 + (cy / len) * amount;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  return data;
}

export function supportsBackdropLens(env: EngineEnv): boolean {
  if (env.vendor === 'Apple Computer, Inc.') return false;
  if (env.supports('-moz-appearance', 'none')) return false;
  return env.vendor === 'Google Inc.';
}
