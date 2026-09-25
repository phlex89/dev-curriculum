const noise = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const palette = `
vec3 pal(float t) {
  vec3 a = vec3(0.60, 0.62, 0.80);
  vec3 b = vec3(0.36, 0.34, 0.20);
  vec3 c = vec3(1.00, 1.00, 1.00);
  vec3 d = vec3(0.60, 0.40, 0.20);
  return a + b * cos(6.28318 * (c * t + d));
}
`;

export const blobVertex = `
uniform float uTime;
uniform float uClock;
uniform float uAmp;
uniform float uFreq;
uniform vec3 uMouseDir;
uniform float uMouseAmp;
uniform float uMouseSharp;
uniform vec4 uRip0;
uniform vec4 uRip1;
uniform float uRipAmp;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${noise}

float field(vec3 p) {
  float n = snoise(p * uFreq + vec3(0.0, uTime * 0.16, uTime * 0.11));
  n += 0.22 * snoise(p * uFreq * 2.0 - vec3(uTime * 0.08));
  return n;
}

float ripple(vec3 dir, vec4 r) {
  float age = uClock - r.w;
  float env = smoothstep(0.0, 0.14, age) * (1.0 - smoothstep(0.9, 2.6, age));
  if (env <= 0.0) return 0.0;
  float ang = acos(clamp(dot(dir, r.xyz), -1.0, 1.0));
  float x = ang - age * 1.3;
  return sin(x * 10.0) * exp(-x * x * 4.5) * env;
}

vec3 displace(vec3 p, out float n) {
  vec3 dir = normalize(p);
  float pull = pow(max(dot(dir, uMouseDir), 0.0), uMouseSharp) * uMouseAmp;
  float rip = (ripple(dir, uRip0) + ripple(dir, uRip1)) * uRipAmp;
  n = field(p);
  return dir * (1.0 + n * (uAmp + pull * 0.6) + pull * 0.5 + rip);
}

void main() {
  vec3 n0 = normalize(position);
  vec3 t = normalize(abs(n0.y) > 0.98 ? cross(n0, vec3(1.0, 0.0, 0.0)) : cross(n0, vec3(0.0, 1.0, 0.0)));
  vec3 b = normalize(cross(n0, t));
  float e = 0.012;
  float n, na, nb;
  vec3 d0 = displace(n0, n);
  vec3 d1 = displace(normalize(n0 + t * e), na);
  vec3 d2 = displace(normalize(n0 + b * e), nb);
  vec3 nn = normalize(cross(d1 - d0, d2 - d0));
  if (dot(nn, n0) < 0.0) nn = -nn;
  vNoise = n;
  vec4 mv = modelViewMatrix * vec4(d0, 1.0);
  vView = -mv.xyz;
  vNormal = normalize(normalMatrix * nn);
  gl_Position = projectionMatrix * mv;
}
`;

export const blobFragment = `
uniform float uHue;
uniform float uWarm;
uniform float uDim;
uniform float uScroll;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${palette}

void main() {
  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(vView);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float edge = smoothstep(0.0, 0.2, ndv);
  float fres = pow(1.0 - ndv, 2.6) * edge;
  float t = vNoise * 0.22 + fres * 0.5 + uHue + uScroll * 0.35;
  vec3 irid = pal(t);
  vec3 warm = irid * vec3(1.24, 0.95, 0.72);
  vec3 lw = vec3(0.2126, 0.7152, 0.0722);
  warm *= dot(irid, lw) / max(dot(warm, lw), 0.001);
  irid = mix(irid, warm, uWarm * 0.75);
  vec3 L = normalize(vec3(-0.5, 0.75, 0.55));
  float diff = max(dot(N, L), 0.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 60.0);
  vec3 base = vec3(0.020, 0.019, 0.030);
  vec3 col = base;
  vec3 body = mix(vec3(dot(irid, vec3(0.3, 0.59, 0.11))), irid, 0.5);
  col += body * (0.03 + 0.15 * diff * diff);
  col += irid * fres * 1.25;
  col += vec3(0.95, 0.93, 1.0) * spec * 0.22 * edge;
  col *= uDim;
  col = col / (1.0 + col * 0.35);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const dustVertex = `
attribute float aSeed;
uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;
varying float vTwinkle;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(uSize * uPixelRatio * (7.0 / max(-mv.z, 0.1)), 0.0, 6.0 * uPixelRatio);
  vTwinkle = 0.55 + 0.45 * sin(uTime * (0.4 + aSeed) + aSeed * 40.0);
  gl_Position = projectionMatrix * mv;
}
`;

export const dustFragment = `
uniform float uOpacity;
varying float vTwinkle;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(vec3(0.86, 0.85, 0.92), a * a * uOpacity * vTwinkle);
}
`;

export const lineVertex = `
attribute vec3 aColor;
varying vec3 vColor;
varying float vFade;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vColor = aColor;
  vFade = smoothstep(2.2, 5.2, -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

export const lineFragment = `
uniform float uOpacity;
varying vec3 vColor;
varying float vFade;
void main() {
  gl_FragColor = vec4(vColor, uOpacity * vFade);
}
`;

export const nodeVertex = `
attribute float aOn;
attribute float aBig;
uniform float uSize;
uniform float uPixelRatio;
varying float vOn;
varying float vBig;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vOn = aOn;
  vBig = aBig;
  gl_PointSize = uSize * (1.0 + aOn * 1.4) * (1.0 + aBig * (0.6 + aOn * 0.5)) * uPixelRatio * (6.0 / max(-mv.z, 0.1));
  gl_Position = projectionMatrix * mv;
}
`;

export const nodeFragment = `
uniform float uOpacity;
varying float vOn;
varying float vBig;
${palette}
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float core = smoothstep(0.22 - vBig * 0.06, 0.0, d);
  float halo = pow(max(1.0 - d, 0.0), 3.0 - vBig * 0.8) * (0.35 + vOn * 0.5 + vBig * 0.25);
  vec3 tint = mix(vec3(0.92, 0.92, 1.0), pal(0.15 + d * 0.4 + vBig * 0.2), 0.55 + vBig * 0.2);
  vec3 col = mix(tint, vec3(1.0), core);
  gl_FragColor = vec4(col, (core + halo) * uOpacity);
}
`;

export const paletteAt = (t: number): [number, number, number] => {
  const a = [0.6, 0.62, 0.8];
  const b = [0.36, 0.34, 0.2];
  const d = [0.6, 0.4, 0.2];
  return [0, 1, 2].map((k) => a[k] + b[k] * Math.cos(6.28318 * (t + d[k]))) as [number, number, number];
};
