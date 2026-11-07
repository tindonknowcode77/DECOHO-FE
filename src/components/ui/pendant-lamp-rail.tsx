"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";

export interface PendantLamp {
  id: string;
  /** Accessible name, caption and detail title. */
  name: string;
  description?: string;
  /** Switched-off photo: a transparent cut-out on a 2:3 portrait canvas whose cord starts at the top edge. Every lamp in a set should share the same canvas and scale. */
  image: string;
  /** Switched-on photo with the same framing, cross-faded in as the lamp lights. */
  imageOn?: string;
  /** Cord length between 0.55 and 1. Longer cords hang lower and swing more slowly. */
  drop?: number;
  /** Colour of the light (any CSS colour). Defaults to a warm mix of the chart tokens. */
  glow?: string;
  /** Short price or size tag. */
  tag?: string;
  /** Short facts listed in the detail view. */
  details?: string[];
  /** Real product ID in DECOHO catalog. */
  productId?: string;
  /** Real product image thumbnail from Cloudinary. */
  productImage?: string;
  /** Direct Shopee affiliate buy link. */
  productLink?: string;
}

export interface PendantLampRailLabels {
  close: string;
  dimmer: string;
  open: string;
}

export interface PendantLampRailProps extends React.ComponentProps<"section"> {
  items: PendantLamp[];
  eyebrow?: string;
  heading?: string;
  /** Shown under the track while no lamp is lit. */
  caption?: string;
  /** Call to action rendered under the caption. */
  action?: React.ReactNode;
  /** Lights the pendants one by one until the visitor interacts. */
  autoplay?: boolean;
  /** Milliseconds each pendant stays lit during autoplay. */
  interval?: number;
  /** Controlled lit pendant. Leave undefined to let the component keep its own state. */
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  onOpenChange?: (index: number | null) => void;
  labels?: PendantLampRailLabels;
}

const ASPECT = 2 / 3;
const MAX_H = 230;
const MIN_WIDE_H = 78;
const CAROUSEL_H = 224;
const FIT = 1.1;
const SPREAD = 1.65;
const SHADE = 0.88;
const CORD = 0.7;
/* Fallback cord thickness (fraction of the 2:3 frame width) when no photo is available. */
const CORD_W = 0.02;
/* The cord above the photo is the photo's own cord: its topmost rows (BAND_H of the photo height, about five rows) mirrored and
   stretched over the gap, so the row that meets the photo is the photo's first row and five rows average out the braid. */
const BAND_H = 0.0055;
const SHADE_TOP = 0.32;
const MOUTH = 0.74;
const REACH = 0.55;
const METRES = 0.5;
const GRAVITY = 9.8;
const DAMPING = 2;
const COUPLING = 0.15;
const MAX_SWING = 14;
const AMBIENT = 0.12;
const FADE = 0.1;
const SWAY = 26;
const NUDGE = 14;
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const DEFAULT_LABELS: PendantLampRailLabels = { close: "Close", dimmer: "Dimmer", open: "Lift to dim" };

/* Light, blend and shadow strengths per theme. Chart 4 is warm in the light palette and chart 3 in the dark one. */
const THEME =
  "[--lamp-glow:color-mix(in_oklab,var(--color-chart-4)_68%,white)] [--lamp-accent:var(--color-chart-1)] [--pool-k:0.85] [--beam-k:0.42] [--bloom-k:0.22] [--shadow-k:0.13] [--blend:normal] dark:[--lamp-glow:color-mix(in_oklab,var(--color-chart-3)_58%,white)] dark:[--lamp-accent:var(--color-chart-3)] dark:[--pool-k:1] dark:[--beam-k:0.46] dark:[--bloom-k:0.8] dark:[--shadow-k:0.5] dark:[--blend:screen]";

const METAL_X = "linear-gradient(to right, color-mix(in oklab, var(--color-muted-foreground) 55%, white), var(--color-muted-foreground) 55%, color-mix(in oklab, var(--color-muted-foreground) 60%, black))";
const TRACK_BG = "linear-gradient(to bottom, color-mix(in oklab, var(--color-muted-foreground) 35%, white) 0%, white 16%, color-mix(in oklab, var(--color-muted-foreground) 70%, white) 36%, var(--color-muted-foreground) 64%, color-mix(in oklab, var(--color-muted-foreground) 55%, black) 100%)";
const BRUSHED = "repeating-linear-gradient(90deg, transparent 0 2px, color-mix(in oklab, white 40%, transparent) 2px 3px, transparent 3px 7px)";
/* Fallback cord (failed photo, or the far end of the detail cord): shaded like the photographed cords (mean luminance across the cord
   at 2-5% of the canvas height in the 16 demo photos). It spans the frame and is scaled down, because a 2-3px wide box would be
   snapped to whole pixels and look thinner than the photo. */
const CORD_BG = "linear-gradient(to right, color-mix(in oklab, black 73%, white), color-mix(in oklab, black 69%, white) 10%, color-mix(in oklab, black 69%, white) 20%, color-mix(in oklab, black 72.5%, white) 30%, color-mix(in oklab, black 80%, white) 40%, color-mix(in oklab, black 85.5%, white) 50%, color-mix(in oklab, black 85%, white) 60%, color-mix(in oklab, black 81%, white) 70%, color-mix(in oklab, black 77%, white) 80%, color-mix(in oklab, black 76%, white) 90%, color-mix(in oklab, black 77%, white))";
const POOL_BG = "radial-gradient(closest-side, color-mix(in oklab, var(--lamp-glow) 88%, transparent), color-mix(in oklab, var(--lamp-glow) 36%, transparent) 48%, transparent)";
const BEAM_GLOW = "color-mix(in oklab, var(--lamp-glow) 72%, transparent)";

type LampShape = "dome" | "globe" | "cone" | "drum";

const ART = {
  dome: { cap: "M88,82 L112,82 L117,100 L83,100 Z", shade: "M100,96 C64,98 38,126 22,210 C58,224 142,224 178,210 C162,126 136,98 100,96 Z", mouth: [100, 212, 74, 9] },
  globe: { cap: "M90,82 L110,82 L112,104 L88,104 Z", shade: "M100,98 C138,98 166,128 166,162 C166,196 138,224 100,224 C62,224 34,196 34,162 C34,128 62,98 100,98 Z", mouth: [100, 214, 26, 5] },
  cone: { cap: "M94,80 L106,80 L108,92 L92,92 Z", shade: "M92,90 L108,90 L170,220 C130,230 70,230 30,220 Z", mouth: [100, 222, 68, 8] },
  drum: { cap: "M90,82 L110,82 L114,104 L86,104 Z", shade: "M52,104 L148,104 L148,206 C120,214 80,214 52,206 Z", mouth: [100, 208, 46, 7] },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function shapeOf(item: PendantLamp): LampShape {
  const key = `${item.id} ${item.name}`.toLowerCase();
  if (/globe|lantern|sphere|orb|ball/.test(key)) return "globe";
  if (/fluted|drum|cylinder|tube/.test(key)) return "drum";
  if (/cone|spot/.test(key)) return "cone";
  return "dome";
}

type Geometry = {
  h: number; w: number; width: number; carousel: boolean;
  track: number; trackTop: number; adapter: number; pivot: number;
  cords: number[]; reach: number[]; metres: number[]; overlap: boolean[];
  foot: number; height: number; inset: number; min: number; max: number;
  poolW: number; poolH: number; beamW: number; cordW: number;
};

function geometry(h: number, width: number, carousel: boolean, drops: number[]): Geometry {
  const w = h * ASPECT;
  const track = Math.round(clamp(h * 0.05, 6, 12));
  const trackTop = 8;
  const adapter = Math.round(clamp(h * 0.075, 8, 17));
  const pivot = trackTop + Math.round(track * 0.6) + adapter;
  const cords = drops.map((drop) => Math.round(h * CORD * drop));
  const reach = cords.map((cord) => cord + h * REACH);
  const metres = reach.map((r) => (r / h) * METRES);
  const overlap = cords.map((cord, i) => i < cords.length - 1 && Math.abs(cord - (cords[i + 1] ?? 0)) < h * (MOUTH - SHADE_TOP));
  const lowest = Math.max(0, ...cords) + h * 0.8;
  const inset = 0;
  const foot = w * SHADE;
  return {
    h, w, width, carousel, track, trackTop, adapter, pivot, cords, reach, metres, overlap, foot,
    height: Math.round(pivot + lowest + h * 0.12),
    inset, min: inset + foot / 2, max: width - inset - foot / 2,
    poolW: w * 2.4, poolH: h * 0.95, beamW: w * 3, cordW: Math.max(1.2, w * CORD_W),
  };
}

function restTargets(g: Geometry, count: number, front: number | null, swipe: number) {
  if (g.carousel) {
    const gap = g.w * 1.08;
    const centre = front ?? 0;
    return Array.from({ length: count }, (_, i) => g.width / 2 + (i - centre) * gap + swipe);
  }
  const edge = Math.max(16, g.w * 0.3);
  const spacing = clamp((g.width - edge * 2) / Math.max(1, count), g.foot * 1.04, g.w * SPREAD);
  const start = (g.width - spacing * count) / 2 + spacing / 2;
  return Array.from({ length: count }, (_, i) => start + i * spacing);
}

type Sim = {
  x: number[]; vx: number[]; pv: number[]; tx: number[];
  swing: number[]; vswing: number[]; lit: number[]; tlit: number[];
  drag: number; dragX: number; grab: number; free: number; last: number; raf: number;
};

function emptySim(): Sim {
  return { x: [], vx: [], pv: [], tx: [], swing: [], vswing: [], lit: [], tlit: [], drag: -1, dragX: 0, grab: 0, free: 0, last: 0, raf: 0 };
}

/* Canopies share one track: neighbours are pushed along it shade-width apart and stop at the end caps. */
function constrain(s: Sim, n: number, gap: number, min: number, max: number) {
  const anchor = s.drag;
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n - 1; i++) {
      const a = s.x[i] ?? 0;
      const b = s.x[i + 1] ?? 0;
      const overlap = gap - (b - a);
      if (overlap <= 0) continue;
      if (i === anchor) s.x[i + 1] = b + overlap;
      else if (i + 1 === anchor) s.x[i] = a - overlap;
      else { s.x[i] = a - overlap / 2; s.x[i + 1] = b + overlap / 2; }
      const va = s.vx[i] ?? 0;
      const vb = s.vx[i + 1] ?? 0;
      if (va > vb) {
        const shared = (va + vb) / 2;
        if (i !== anchor) s.vx[i] = shared;
        if (i + 1 !== anchor) s.vx[i + 1] = shared;
      }
    }
  }
  if ((s.x[n - 1] ?? 0) > max) { s.x[n - 1] = max; s.vx[n - 1] = -Math.abs(s.vx[n - 1] ?? 0) * 0.3; }
  for (let i = n - 2; i >= 0; i--) {
    const limit = (s.x[i + 1] ?? 0) - gap;
    if ((s.x[i] ?? 0) > limit) { s.x[i] = limit; s.vx[i] = Math.min(s.vx[i] ?? 0, s.vx[i + 1] ?? 0); }
  }
  if ((s.x[0] ?? 0) < min) { s.x[0] = min; s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3; }
  for (let i = 1; i < n; i++) {
    const limit = (s.x[i - 1] ?? 0) + gap;
    if ((s.x[i] ?? 0) < limit) { s.x[i] = limit; s.vx[i] = Math.max(s.vx[i] ?? 0, s.vx[i - 1] ?? 0); }
  }
}

/* Shades that swing into each other knock apart: overlap is split between the two cords and the closing speed bounces back. */
function knock(s: Sim, n: number, g: Geometry) {
  for (let i = 0; i < n - 1; i++) {
    if (!g.overlap[i]) continue;
    const li = g.reach[i] ?? 1;
    const lj = g.reach[i + 1] ?? 1;
    const ai = (s.swing[i] ?? 0) * RAD;
    const aj = (s.swing[i + 1] ?? 0) * RAD;
    const xi = (s.x[i] ?? 0) - li * Math.sin(ai);
    const xj = (s.x[i + 1] ?? 0) - lj * Math.sin(aj);
    const pen = g.foot - (xj - xi);
    if (pen <= 0) continue;
    s.swing[i] = clamp((s.swing[i] ?? 0) + (pen / 2 / li) * DEG, -MAX_SWING, MAX_SWING);
    s.swing[i + 1] = clamp((s.swing[i + 1] ?? 0) - (pen / 2 / lj) * DEG, -MAX_SWING, MAX_SWING);
    const ui = (s.vx[i] ?? 0) - li * Math.cos(ai) * (s.vswing[i] ?? 0) * RAD;
    const uj = (s.vx[i + 1] ?? 0) - lj * Math.cos(aj) * (s.vswing[i + 1] ?? 0) * RAD;
    if (ui > uj) {
      const d = (1.35 * (ui - uj)) / 2;
      s.vswing[i] = (s.vswing[i] ?? 0) + (d / (li * Math.cos(ai))) * DEG;
      s.vswing[i + 1] = (s.vswing[i] ?? 0) - (d / (lj * Math.cos(aj))) * DEG;
    }
  }
}

export function PendantLampRail({
  items,
  eyebrow,
  heading,
  caption,
  action,
  autoplay = false,
  interval = 2600,
  active: activeProp,
  onActiveChange,
  onOpenChange,
  labels = DEFAULT_LABELS,
  className,
  onPointerLeave,
  ...rest
}: PendantLampRailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const controlled = activeProp !== undefined;
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const slots = React.useRef([] as (HTMLButtonElement | null)[]);
  const pendulums = React.useRef([] as (HTMLSpanElement | null)[]);
  const photos = React.useRef([] as (HTMLSpanElement | null)[]);
  const pools = React.useRef([] as (HTMLSpanElement | null)[]);
  const beams = React.useRef([] as (HTMLSpanElement | null)[]);
  const sim = React.useRef(emptySim());
  const [size, setSize] = React.useState({ width: 0, h: 150, carousel: false });
  const [innerActive, setInnerActive] = React.useState(null as number | null);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [openIndex, setOpenIndex] = React.useState(null as number | null);
  const [reduced, setReduced] = React.useState(false);
  const [playing, setPlaying] = React.useState(autoplay);
  const [lifted, setLifted] = React.useState(null as number | null);
  const [dims, setDims] = React.useState([] as number[]);
  const [failed, setFailed] = React.useState([] as boolean[]);
  const returnFocus = React.useRef(null as number | null);
  const opener = React.useRef(null as HTMLElement | null);
  const pendingOpen = React.useRef(-1);
  const pointer = React.useRef({ id: -1, index: -1, x: 0, y: 0, moved: false, kind: "", swipe: 0, lastX: 0, lastT: 0, v: 0 });
  const hover = React.useRef({ x: 0, t: 0, v: 0 });

  const requested = controlled ? activeProp : innerActive;
  const active = requested !== null && requested !== undefined && requested >= 0 && requested < count ? requested : null;
  const drops = React.useMemo(() => items.map((item) => clamp(item.drop ?? 0.75, 0.3, 1.2)), [items]);
  const geo = React.useMemo(() => geometry(size.h, size.width, size.carousel, drops), [size, drops]);
  const live = React.useRef({ active: null as number | null, geo, reduced, count, openIndex: null as number | null, carouselIndex: 0, controlled, onActiveChange, onOpenChange });
  live.current = { ...live.current, active, geo, reduced, count, openIndex, controlled, onActiveChange, onOpenChange };

  const front = size.carousel ? (active ?? live.current.carouselIndex) : null;
  const litIndex = active ?? front;
  const current = litIndex === null ? null : (items[litIndex] ?? null);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  React.useEffect(() => { setPlaying(autoplay); }, [autoplay]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = (width: number) => {
      const fit = (width - 32) / (Math.max(1, count) * ASPECT * FIT);
      const carousel = count > 1 && fit < MIN_WIDE_H;
      const h = Math.round((carousel ? Math.min(CAROUSEL_H, Math.max(170, width * 0.56)) : Math.min(MAX_H, Math.max(60, fit))) * 10) / 10;
      setSize((old) => (Math.abs(old.width - width) < 0.5 && old.carousel === carousel && Math.abs(old.h - h) < 0.5 ? old : { width, h, carousel }));
    };
    measure(stage.clientWidth);
    const observer = new ResizeObserver((entries) => { const box = entries[0]; if (box) measure(box.contentRect.width); });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [count]);

  /* Last value written per pendant and property. Cleared after every React commit so a re-render never leaves a stale frame. */
  const painted = React.useRef([] as string[][]);
  React.useLayoutEffect(() => { painted.current = []; });

  const paint = React.useCallback((i: number) => {
    const s = sim.current;
    const g = live.current.geo;
    const slot = slots.current[i];
    if (!slot) return;
    const x = s.x[i] ?? 0;
    const swing = s.swing[i] ?? 0;
    const lit = (s.lit[i] ?? AMBIENT).toFixed(3);
    const a = swing * RAD;
    const reach = (g.cords[i] ?? 0) + g.h * (MOUTH + 0.04);
    const spill = 0.1 * Math.max(s.lit[i - 1] ?? 0, s.lit[i + 1] ?? 0);
    const memo = painted.current[i] ?? (painted.current[i] = []);
    /* Only touch the DOM when a value changed: a swinging cord rewrites one transform, not every custom property. */
    const put = (k: number, el: HTMLElement | null | undefined, prop: string, value: string) => {
      if (!el || memo[k] === value) return;
      memo[k] = value;
      el.style.setProperty(prop, value);
    };
    const beam = beams.current[i];
    const pool = pools.current[i];
    put(0, slot, "transform", `translate3d(${(x - g.w / 2).toFixed(2)}px,0,0)`);
    put(1, slot, "--lit", lit);
    put(2, pendulums.current[i], "transform", `rotate(${swing.toFixed(3)}deg)`);
    put(3, beam, "transform", `translate3d(${(x - g.beamW / 2).toFixed(2)}px,0,0) rotate(${swing.toFixed(3)}deg)`);
    put(4, beam, "--lit", lit);
    put(5, pool, "transform", `translate3d(${(x - Math.sin(a) * reach - g.poolW / 2).toFixed(1)}px,${(g.pivot + Math.cos(a) * reach - g.poolH / 2).toFixed(1)}px,0) rotate(${(swing * 0.5).toFixed(2)}deg)`);
    put(6, pool, "--lit", lit);
    put(7, pool, "--pool", Math.min(1, (s.lit[i] ?? 0) + spill).toFixed(3));
  }, []);

  const step = React.useCallback((now: number) => {
    const s = sim.current;
    const { count: n, geo: g } = live.current;
    const dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 1 / 60;
    s.last = now;
    const fade = 1 - Math.exp(-dt / FADE);
    for (let i = 0; i < n; i++) s.lit[i] = (s.lit[i] ?? 0) + ((s.tlit[i] ?? 0) - (s.lit[i] ?? 0)) * fade;
    /* Fixed small sub-steps keep the springs stable when frames arrive late (busy page, slow device), so the motion stays real-time. */
    const sub = Math.max(3, Math.ceil(dt / 0.011));
    const h = dt / sub;
    const couple = (COUPLING * METRES * DEG) / Math.max(1, g.h);
    const restoring = now > s.free;
    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < n; i++) {
        const v = s.vx[i] ?? 0;
        s.pv[i] = v;
        if (i === s.drag) s.vx[i] = v + (-900 * ((s.x[i] ?? 0) - s.dragX) - 60 * v) * h;
        else if (restoring) s.vx[i] = v + (-130 * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) - 2 * Math.sqrt(130) * 0.86 * v) * h;
        else s.vx[i] = v * Math.exp(-6 * h);
        s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
      }
      if (!g.carousel && n > 0) constrain(s, n, g.foot, g.min, g.max);
      for (let i = 0; i < n; i++) {
        const accel = clamp(((s.vx[i] ?? 0) - (s.pv[i] ?? 0)) / h, -12000, 12000);
        const metres = g.metres[i] ?? 0.6;
        const sa = -(GRAVITY / metres) * (s.swing[i] ?? 0) - DAMPING * (s.vswing[i] ?? 0) + (accel * couple) / metres;
        s.vswing[i] = (s.vswing[i] ?? 0) + sa * h;
        const next = (s.swing[i] ?? 0) + (s.vswing[i] ?? 0) * h;
        if (Math.abs(next) > MAX_SWING) { s.swing[i] = Math.sign(next) * MAX_SWING; s.vswing[i] = -(s.vswing[i] ?? 0) * 0.2; }
        else s.swing[i] = next;
      }
      knock(s, n, g);
    }
    let busy = s.drag >= 0 || now < s.free;
    for (let i = 0; i < n; i++) {
      paint(i);
      if (busy) continue;
      if (Math.abs(s.vx[i] ?? 0) > 0.5 || Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25 || Math.abs(s.swing[i] ?? 0) > 0.02 || Math.abs(s.vswing[i] ?? 0) > 0.05 || Math.abs((s.lit[i] ?? 0) - (s.tlit[i] ?? 0)) > 0.002) busy = true;
    }
    if (busy) { s.raf = requestAnimationFrame(step); return; }
    s.raf = 0;
    s.last = 0;
    for (let i = 0; i < n; i++) { s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0; s.swing[i] = 0; s.vswing[i] = 0; s.lit[i] = s.tlit[i] ?? 0; paint(i); }
  }, [paint]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (live.current.reduced) {
      for (let i = 0; i < live.current.count; i++) { s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0; s.swing[i] = 0; s.vswing[i] = 0; s.lit[i] = s.tlit[i] ?? AMBIENT; paint(i); }
      return;
    }
    if (!s.raf) { s.last = 0; s.raf = requestAnimationFrame(step); }
  }, [paint, step]);

  const impulse = React.useCallback((i: number, amount: number) => {
    const s = sim.current;
    if (live.current.reduced || i < 0 || i >= live.current.count) return;
    s.vswing[i] = (s.vswing[i] ?? 0) + amount;
    kick();
  }, [kick]);

  React.useLayoutEffect(() => {
    if (!size.width) return;
    const s = sim.current;
    const xs = restTargets(geo, count, front, size.carousel ? pointer.current.swipe : 0);
    const fresh = s.x.length !== count;
    for (let i = 0; i < count; i++) {
      s.tx[i] = xs[i] ?? 0;
      if (fresh || reduced) { s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0; s.swing[i] = s.swing[i] ?? 0; s.vswing[i] = s.vswing[i] ?? 0; }
    }
    for (const list of [s.x, s.vx, s.pv, s.tx, s.swing, s.vswing]) list.length = count;
    for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [size.width, size.carousel, geo, count, front, reduced, paint, kick]);

  React.useLayoutEffect(() => {
    const s = sim.current;
    for (let i = 0; i < count; i++) {
      s.tlit[i] = (i === litIndex ? 1 : AMBIENT) * (dims[i] ?? 1);
      if (reduced || s.lit[i] === undefined) s.lit[i] = s.tlit[i] ?? AMBIENT;
    }
    s.lit.length = count;
    s.tlit.length = count;
    for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [litIndex, dims, count, reduced, paint, kick]);

  const swayed = React.useRef(false);
  React.useEffect(() => {
    if (!size.width || swayed.current || reduced || count === 0) return;
    const timers = items.map((_, i) => window.setTimeout(() => { swayed.current = true; impulse(i, -SWAY); }, 90 + i * 70));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [size.width, reduced, items, count, impulse]);

  React.useEffect(() => () => { cancelAnimationFrame(sim.current.raf); sim.current.raf = 0; }, []);

  React.useLayoutEffect(() => {
    if (openIndex !== null || lifted !== null || returnFocus.current === null) return;
    const index = returnFocus.current;
    returnFocus.current = null;
    /* Back to whatever opened the detail (the pendant or the open button), or the pendant when that element is gone. */
    const target = opener.current?.isConnected ? opener.current : slots.current[index];
    opener.current = null;
    target?.focus({ preventScroll: true });
  }, [openIndex, lifted]);

  const choose = React.useCallback((index: number | null, brush = 0) => {
    if (live.current.active === index) return;
    live.current.active = index;
    if (index !== null) {
      impulse(index - 1, NUDGE);
      impulse(index + 1, -NUDGE);
      if (brush) impulse(index, brush);
      live.current.carouselIndex = index;
    }
    if (!live.current.controlled) setInnerActive(index);
    live.current.onActiveChange?.(index);
  }, [impulse]);

  const stop = React.useCallback(() => setPlaying(false), []);

  React.useEffect(() => {
    if (!playing || reduced || openIndex !== null || count === 0 || !size.width) return;
    let timer = window.setTimeout(function advance() {
      const now = live.current.active;
      const first = live.current.geo.carousel ? Math.min(live.current.count - 1, live.current.carouselIndex + 1) : 0;
      choose(now === null ? first : (now + 1) % live.current.count);
      timer = window.setTimeout(advance, interval);
    }, active === null ? 1100 : interval);
    return () => window.clearTimeout(timer);
  }, [playing, reduced, openIndex, count, interval, size.width, choose, active]);

  const open = React.useCallback((index: number) => {
    const from = document.activeElement;
    opener.current = from instanceof HTMLElement && from !== document.body ? from : null;
    stop();
    choose(index);
    setOpenIndex(index);
    live.current.onOpenChange?.(index);
  }, [choose, stop]);

  const closeDetail = React.useCallback(() => {
    const index = live.current.openIndex;
    if (index === null) return;
    returnFocus.current = index;
    setOpenIndex(null);
    live.current.onOpenChange?.(null);
    impulse(index, (index % 2 ? 1 : -1) * 30);
  }, [impulse]);

  const sourceRect = React.useCallback(() => {
    const index = live.current.openIndex;
    return index === null ? null : (photos.current[index]?.getBoundingClientRect() ?? null);
  }, []);
  const onLift = React.useCallback((lift: boolean) => setLifted(lift ? live.current.openIndex : null), []);
  const onDim = React.useCallback((value: number) => {
    const index = live.current.openIndex;
    if (index === null) return;
    setDims((old) => {
      const next = Array.from({ length: live.current.count }, (_, i) => old[i] ?? 1);
      next[index] = clamp(value, 0, 1);
      return next;
    });
  }, []);
  const markFailed = React.useCallback((index: number) => {
    setFailed((old) => (old[index] ? old : Array.from({ length: live.current.count }, (_, i) => (i === index ? true : (old[i] ?? false)))));
  }, []);

  function nearest(clientX: number, clientY: number) {
    const stage = stageRef.current;
    if (!stage) return null;
    const box = stage.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const g = live.current.geo;
    if (y < 0 || y > g.height + 24) return null;
    const s = sim.current;
    let best = null as number | null;
    let distance = Infinity;
    let held = Infinity;
    for (let i = 0; i < live.current.count; i++) {
      const tip = (s.x[i] ?? 0) - Math.sin((s.swing[i] ?? 0) * RAD) * (g.reach[i] ?? 0);
      const d = Math.abs(x - tip);
      if (i === live.current.active) held = d;
      if (d < g.w * 0.7 && d < distance) { best = i; distance = d; }
    }
    if (best !== null && best !== live.current.active && held < g.w * 0.7 && distance + 8 > held) return live.current.active;
    return best;
  }

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pointer.current;
    const s = sim.current;
    const stage = stageRef.current;
    const now = performance.now();
    if (p.id === event.pointerId && stage) {
      const dx = event.clientX - p.x;
      if (!p.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - p.y)) {
        p.moved = true;
        stop();
        if (stage.isConnected) stage.setPointerCapture(event.pointerId);
        if (!live.current.geo.carousel && p.index >= 0) {
          s.drag = p.index;
          s.grab = event.clientX - stage.getBoundingClientRect().left - (s.x[p.index] ?? 0);
        }
      }
      if (p.moved) {
        const v = (event.clientX - p.lastX) / Math.max(1, now - p.lastT);
        p.v = p.v * 0.6 + v * 0.4;
        p.lastX = event.clientX;
        p.lastT = now;
        if (s.drag >= 0) {
          s.dragX = event.clientX - stage.getBoundingClientRect().left - s.grab;
          s.free = now + 900;
          kick();
        } else if (live.current.geo.carousel) {
          p.swipe = dx;
          const xs = restTargets(live.current.geo, live.current.count, live.current.active ?? live.current.carouselIndex, dx);
          for (let i = 0; i < live.current.count; i++) s.tx[i] = xs[i] ?? 0;
          kick();
        }
      }
      return;
    }
    const last = hover.current;
    const v = last.t ? (event.clientX - last.x) / Math.max(1, now - last.t) : 0;
    hover.current = { x: event.clientX, t: now, v: last.v * 0.5 + v * 0.5 };
    if (event.pointerType !== "mouse" || live.current.geo.carousel || live.current.openIndex !== null) return;
    const hit = nearest(event.clientX, event.clientY);
    if (hit !== null && hit !== live.current.active) {
      stop();
      choose(hit, clamp(-hover.current.v * 16, -22, 22));
    }
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    const hit = nearest(event.clientX, event.clientY);
    const now = performance.now();
    pendingOpen.current = -1;
    pointer.current = { id: event.pointerId, index: hit ?? -1, x: event.clientX, y: event.clientY, moved: false, kind: event.pointerType, swipe: 0, lastX: event.clientX, lastT: now, v: 0 };
  };

  const finishPointer = (event: React.PointerEvent, cancelled: boolean) => {
    const p = pointer.current;
    if (p.id !== event.pointerId) return;
    const s = sim.current;
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    pointer.current = { ...p, id: -1 };
    const now = performance.now();
    if (s.drag >= 0) {
      s.vx[s.drag] = now - p.lastT > 90 ? 0 : clamp(p.v * 1000, -2500, 2500);
      s.drag = -1;
      s.free = now + 350;
      kick();
      return;
    }
    if (p.moved && live.current.geo.carousel) {
      const dx = event.clientX - p.x;
      const from = live.current.active ?? live.current.carouselIndex;
      const shift = Math.abs(dx) > 40 || Math.abs(p.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
      pointer.current.swipe = 0;
      const next = clamp(from + shift, 0, live.current.count - 1);
      if (next === from) {
        const xs = restTargets(live.current.geo, live.current.count, from, 0);
        for (let i = 0; i < live.current.count; i++) s.tx[i] = xs[i] ?? 0;
        kick();
      }
      choose(next);
      return;
    }
    if (cancelled || p.moved || p.index < 0) return;
    stop();
    if (p.kind !== "mouse" && live.current.active !== p.index) choose(p.index);
    else pendingOpen.current = p.index;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    stop();
    const from = active ?? focusIndex;
    const next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : clamp(from + (event.key === "ArrowRight" ? 1 : -1), 0, count - 1);
    setFocusIndex(next);
    choose(next);
    slots.current[next]?.focus({ preventScroll: true });
  };

  const trackLeft = geo.carousel ? -4 : geo.inset;
  const carouselIndex = size.carousel ? front : null;
  const adapterW = Math.round(clamp(geo.w * 0.2, 12, 28));

  return (
    <section
      {...rest}
      data-slot="pendant-lamp-rail"
      data-mode={size.carousel ? "carousel" : "rail"}
      data-active={active ?? ""}
      aria-roledescription="lighting track"
      className={`relative isolate w-full overflow-hidden bg-background text-foreground ${THEME} ${className ?? ""}`}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        /* Leaving the whole section, not just the stage, switches the lamp back off: the pointer can travel down to the open button. */
        if (event.pointerType === "mouse" && pointer.current.id < 0 && !size.carousel && live.current.openIndex === null && !document.activeElement?.matches("[data-lamp]:focus-visible")) choose(null);
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(62% 48% at 50% 46%, color-mix(in oklab, var(--color-foreground) 4%, transparent), transparent)" }} />
      {(eyebrow || heading) && (
        <header className="relative z-10 flex flex-col items-center gap-2 px-6 pt-8 text-center">
          {eyebrow && <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">{eyebrow}</p>}
          {heading && <h2 className="text-balance text-2xl font-medium tracking-tight sm:text-3xl">{heading}</h2>}
        </header>
      )}

      <div
        ref={stageRef}
        data-stage
        role="group"
        aria-label={heading ?? "Pendant lamps"}
        className="relative mt-3 w-full touch-pan-y select-none"
        style={{ height: geo.height, overflowX: "clip" }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onKeyDown={onKeyDown}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ visibility: size.width ? undefined : "hidden" }}>
          {items.map((item, i) => {
            const cord = geo.cords[i] ?? 0;
            const apex = cord + geo.h * 0.3;
            const hidden = lifted === i ? "hidden" : undefined;
            return (
              <React.Fragment key={item.id}>
                <span
                  ref={(node) => { beams.current[i] = node; }}
                  data-beam={i}
                  className="absolute left-0 will-change-transform [mix-blend-mode:var(--blend)]"
                  style={{
                    top: geo.pivot,
                    width: geo.beamW,
                    height: cord + geo.h * 1.5,
                    transformOrigin: "50% 0",
                    visibility: hidden,
                    opacity: "calc(var(--lit, 0) * var(--beam-k))",
                    background: `conic-gradient(from 140deg at 50% ${apex.toFixed(1)}px, transparent 0deg, ${BEAM_GLOW} 24deg, ${BEAM_GLOW} 56deg, transparent 80deg)`,
                    WebkitMaskImage: `linear-gradient(to bottom, transparent ${(cord + geo.h * (MOUTH - 0.04)).toFixed(1)}px, black ${(cord + geo.h * (MOUTH + 0.14)).toFixed(1)}px, black ${(cord + geo.h * 0.98).toFixed(1)}px, transparent)`,
                    maskImage: `linear-gradient(to bottom, transparent ${(cord + geo.h * (MOUTH - 0.04)).toFixed(1)}px, black ${(cord + geo.h * (MOUTH + 0.14)).toFixed(1)}px, black ${(cord + geo.h * 0.98).toFixed(1)}px, transparent)`,
                    ["--lamp-glow" as string]: item.glow,
                  }}
                />
                <span
                  ref={(node) => { pools.current[i] = node; }}
                  data-pool={i}
                  className="absolute left-0 top-0 rounded-full will-change-transform [mix-blend-mode:var(--blend)]"
                  style={{ width: geo.poolW, height: geo.poolH, visibility: hidden, opacity: "calc(var(--pool, 0) * var(--pool-k))", background: POOL_BG, ["--lamp-glow" as string]: item.glow }}
                />
              </React.Fragment>
            );
          })}
        </div>

        <div aria-hidden="true" data-track className="pointer-events-none absolute z-[1]" style={{ left: trackLeft, right: trackLeft, top: geo.trackTop, height: geo.track, visibility: size.width ? undefined : "hidden" }}>
          <div className="absolute inset-x-0 h-3 rounded-full bg-foreground/10 blur-[5px] dark:bg-black/60" style={{ top: geo.track + 1 }} />
          <div className="absolute inset-0 rounded-[3px]" style={{ background: TRACK_BG, boxShadow: "0 1px 0 color-mix(in oklab, var(--color-foreground) 18%, transparent)" }} />
          <div className="absolute inset-0 rounded-[3px] opacity-40 mix-blend-overlay" style={{ background: BRUSHED }} />
          <div className="absolute inset-x-1 bottom-[18%] h-px bg-black/40" />
          {!geo.carousel && [0, 1].map((side) => (
            <div key={side} className="absolute top-1/2 -translate-y-1/2 rounded-[3px]" style={{ [side ? "right" : "left"]: -2, width: Math.max(10, geo.track * 1.3), height: geo.track * 1.9, background: METAL_X, boxShadow: "0 3px 6px color-mix(in oklab, var(--color-foreground) 18%, transparent)" }}>
              <span className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/35" />
            </div>
          ))}
        </div>

        {items.map((item, i) => {
          const lit = litIndex === i;
          const cord = geo.cords[i] ?? 0;
          return (
            <button
              key={item.id}
              ref={(node) => { slots.current[i] = node; }}
              type="button"
              data-lamp={i}
              data-lit={lit ? "true" : "false"}
              tabIndex={i === (active ?? focusIndex) ? 0 : -1}
              aria-label={item.name}
              aria-describedby={`${uid}-caption`}
              aria-pressed={lit}
              className="group absolute left-0 cursor-pointer outline-none"
              style={{
                top: geo.pivot - geo.adapter,
                width: geo.w,
                height: geo.adapter + cord + geo.h * 0.82,
                zIndex: lit ? 20 : 10,
                visibility: lifted === i || !size.width ? "hidden" : undefined,
                transform: `translate3d(${((sim.current.x[i] ?? 0) - geo.w / 2).toFixed(2)}px,0,0)`,
                ["--lit" as string]: (sim.current.lit[i] ?? AMBIENT).toFixed(3),
                ["--lamp-glow" as string]: item.glow,
              }}
              onFocus={() => { setFocusIndex(i); if (pointer.current.id < 0) { stop(); choose(i); } }}
              onClick={(event) => { const pending = pendingOpen.current; pendingOpen.current = -1; if (event.detail === 0 || pending === i) open(i); }}
            >
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-b-[4px] rounded-t-[2px]" style={{ width: adapterW, height: geo.adapter, background: METAL_X, boxShadow: "0 2px 4px color-mix(in oklab, var(--color-foreground) 20%, transparent)" }}>
                <span className="absolute inset-x-[18%] top-[30%] h-px bg-white/45" />
              </span>
              <span
                ref={(node) => { pendulums.current[i] = node; }}
                data-pendulum
                className="pointer-events-none absolute inset-x-0 bottom-0 will-change-transform"
                style={{ top: geo.adapter, transformOrigin: "50% 0", transform: `rotate(${(sim.current.swing[i] ?? 0).toFixed(3)}deg)` }}
              >
                <span aria-hidden="true" className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-[1px]" style={{ width: Math.max(3, geo.cordW * 2.4), height: Math.max(3, geo.adapter * 0.45), background: METAL_X }} />
                <span aria-hidden="true" data-cord className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: cord }}>
                  <span className="absolute inset-0 origin-top" style={{ background: CORD_BG, transform: `scaleX(${CORD_W})` }} />
                </span>
                <span
                  ref={(node) => { photos.current[i] = node; }}
                  data-photo
                  className="absolute inset-x-0"
                  style={{ top: cord, height: geo.h, ["--bloom-r" as string]: `${(geo.w * 0.08).toFixed(1)}px` }}
                >
                  <LampPhoto item={item} failed={!!failed[i]} onFail={() => markFailed(i)} shadow />
                  <span aria-hidden="true" data-focus-ring className="absolute rounded-[42%] opacity-0 ring-2 ring-ring ring-offset-2 ring-offset-background transition-opacity group-focus-visible:opacity-100 motion-reduce:transition-none" style={{ left: "2%", right: "2%", top: `${(SHADE_TOP - 0.05) * 100}%`, bottom: `${(1 - MOUTH - 0.07) * 100}%` }} />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {size.carousel && count > 1 && (
        <div aria-hidden="true" className="relative z-10 mt-1 flex justify-center gap-1.5">
          {items.map((item, i) => (
            <button key={item.id} type="button" tabIndex={-1} data-dot={i} aria-current={carouselIndex === i} onClick={() => { stop(); choose(i); }} className={`h-1.5 rounded-full outline-none transition-[width,background-color] duration-300 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${carouselIndex === i ? "w-6 bg-[var(--lamp-accent)]" : "w-1.5 bg-foreground/25 hover:bg-foreground/45"}`} />
          ))}
        </div>
      )}

      {(caption || action) && (
        <div className="relative z-10 flex flex-col items-center gap-3.5 px-6 pb-8 pt-3 text-center">
          {caption && (
            <p id={`${uid}-caption`} className="pt-1 text-sm font-medium text-muted-foreground">
              {caption}
            </p>
          )}
          {action && <div className="flex flex-wrap items-center justify-center gap-2.5">{action}</div>}
        </div>
      )}

      {openIndex !== null && items[openIndex] && (
        <Detail
          uid={uid}
          item={items[openIndex]}
          index={openIndex}
          total={count}
          labels={labels}
          reduced={reduced}
          dim={dims[openIndex] ?? 1}
          failed={!!failed[openIndex]}
          onFail={() => markFailed(openIndex)}
          onDim={onDim}
          source={sourceRect}
          onLift={onLift}
          onClose={closeDetail}
        />
      )}
    </section>
  );
}

/* The cord between the track and the photo is the photo's own cord: the topmost band of the photo, mirrored and stretched over the gap.
   Same image, same box width and the same object-fit as the photo, so the browser places it on exactly the same pixels and the join
   does not show — a drawn line of the same width lands up to half a pixel off, because the photo's position is snapped differently.
   The band ends flush with the photo: an overlap would draw the soft edges twice and leave a dark collar at the join. */
function CordPhoto({ item, height, shift, stretch }: { item: PendantLamp; height: number | string; shift: string; stretch: number }) {
  const hide = (event: { currentTarget: HTMLImageElement }) => { event.currentTarget.style.display = "none"; };
  const className = "pointer-events-none absolute inset-x-0 top-0 w-full max-w-none select-none object-contain object-top";
  const style = { height, transformOrigin: "50% 0", transform: `translateY(${shift}) scaleY(${(-stretch).toFixed(2)})` };
  return (
    <>
      <img src={item.image} alt="" draggable={false} className={className} style={style} onError={hide} />
      {item.imageOn && <img src={item.imageOn} alt="" draggable={false} className={className} style={{ ...style, opacity: "var(--lit, 0)" }} onError={hide} />}
    </>
  );
}

function LampPhoto({ item, failed, onFail, shadow }: { item: PendantLamp; failed: boolean; onFail: () => void; shadow: boolean }) {
  if (failed) return <LampArt shape={shapeOf(item)} />;
  const hide = (event: { currentTarget: HTMLImageElement }) => { event.currentTarget.style.display = "none"; };
  const photo = "pointer-events-none absolute inset-0 size-full select-none object-contain object-top";
  const mask = `url("${item.image}") top center / contain no-repeat`;
  return (
    <>
      {shadow && <span aria-hidden="true" data-shadow className="pointer-events-none absolute inset-0 bg-black blur-[3px]" style={{ opacity: "var(--shadow-k)", transform: "translate(5%, 2.5%)", clipPath: "inset(30% 0 0 0)", WebkitMask: mask, mask }} />}
      {item.imageOn && <img data-bloom src={item.imageOn} alt="" aria-hidden="true" draggable={false} className={photo} style={{ opacity: "calc(var(--lit, 0) * var(--bloom-k))", filter: "blur(var(--bloom-r, 10px)) saturate(1.35) brightness(1.1)" }} onError={hide} />}
      <img data-off src={item.image} alt="" draggable={false} className={photo} onError={onFail} />
      {item.imageOn && <img data-on src={item.imageOn} alt="" draggable={false} className={photo} style={{ opacity: "var(--lit, 0)" }} onError={hide} />}
    </>
  );
}

function LampArt({ shape }: { shape: LampShape }) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const art = ART[shape];
  const [cx, cy, rx, ry] = art.mouth;
  return (
    <svg data-fallback={shape} aria-hidden="true" viewBox="0 0 200 300" preserveAspectRatio="xMidYMin meet" className="pointer-events-none absolute inset-0 size-full overflow-visible">
      <defs>
        <linearGradient id={`${id}-v`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0.3" />
          <stop offset="0.35" stopColor="white" stopOpacity="0.06" />
          <stop offset="0.75" stopColor="black" stopOpacity="0.12" />
          <stop offset="1" stopColor="black" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect x={100 - 100 * CORD_W} y="0" width={200 * CORD_W} height="90" style={{ fill: "color-mix(in oklab, black 80%, white)" }} />
      <path d={art.cap} style={{ fill: "color-mix(in oklab, var(--color-muted-foreground) 70%, var(--color-foreground))" }} />
      <path d={art.shade} style={{ fill: "color-mix(in oklab, var(--color-foreground) 64%, var(--color-background))" }} />
      <path d={art.shade} fill={`url(#${id}-v)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} style={{ fill: "var(--lamp-glow)", opacity: "calc(0.25 + var(--lit, 0) * 0.75)" }} />
    </svg>
  );
}

type DetailProps = {
  uid: string;
  item: PendantLamp;
  index: number;
  total: number;
  labels: PendantLampRailLabels;
  reduced: boolean;
  dim: number;
  failed: boolean;
  onFail: () => void;
  onDim: (value: number) => void;
  source: () => DOMRect | null;
  onLift: (lifted: boolean) => void;
  onClose: () => void;
};

function Detail({ uid, item, index, total, labels, reduced, dim, failed, onFail, onDim, source, onLift, onClose }: DetailProps) {
  const dialogRef = React.useRef(null as HTMLDivElement | null);
  const figureRef = React.useRef(null as HTMLDivElement | null);
  const swayRef = React.useRef(null as HTMLDivElement | null);
  const rangeRef = React.useRef(null as HTMLInputElement | null);
  const [shown, setShown] = React.useState(false);
  const closing = React.useRef(false);
  const titleId = `${uid}-detail-title`;
  const rangeId = `${uid}-dimmer`;
  const percent = Math.round(dim * 100);

  React.useLayoutEffect(() => {
    const figure = figureRef.current;
    const from = source();
    rangeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let flight = null as Animation | null;
    let sway = null as Animation | null;
    if (figure && from && !reduced && from.width > 0) {
      const to = figure.getBoundingClientRect();
      const scale = from.height / to.height;
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top - to.top;
      const lift = Math.min(90, Math.abs(dy) * 0.25 + 30);
      onLift(true);
      flight = figure.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - lift}px) scale(${((scale + 1) / 2) * 1.03}) rotate(${dx > 0 ? -2.5 : 2.5}deg)`, offset: 0.5 },
        { transform: "none" },
      ], { duration: 680, easing: "cubic-bezier(.22,.85,.3,1)" });
      sway = swayRef.current?.animate([
        { transform: "rotate(0deg)" },
        { transform: `rotate(${dx > 0 ? 2.2 : -2.2}deg)`, offset: 0.22 },
        { transform: `rotate(${dx > 0 ? -1.3 : 1.3}deg)`, offset: 0.5 },
        { transform: `rotate(${dx > 0 ? 0.6 : -0.6}deg)`, offset: 0.76 },
        { transform: "rotate(0deg)" },
      ], { duration: 1700, delay: 560, easing: "ease-in-out" }) ?? null;
    }
    const raf = requestAnimationFrame(() => setShown(true));
    return () => { cancelAnimationFrame(raf); flight?.cancel(); sway?.cancel(); document.body.style.overflow = overflow; onLift(false); };
  }, [source, reduced, onLift]);

  const dismiss = React.useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    setShown(false);
    const figure = figureRef.current;
    const to = source();
    if (!figure || !to || reduced || to.width === 0) { onClose(); return; }
    const from = figure.getBoundingClientRect();
    const scale = to.height / from.height;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top - from.top;
    const animation = figure.animate([
      { transform: "none" },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 30}px) scale(${(scale + 1) / 2})`, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
    ], { duration: 560, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" });
    animation.onfinish = () => onClose();
  }, [source, reduced, onClose]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(event.target as Node)) return;
      if (event.key === "Escape") { event.preventDefault(); dismiss(); }
      else if (event.key === "Tab") { const first = dialog.querySelector("button, input"); if (first instanceof HTMLElement) { event.preventDefault(); first.focus(); } }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dismiss]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); dismiss(); return; }
    if (event.key !== "Tab") return;
    const controls = [...(dialogRef.current?.querySelectorAll("button, input") ?? [])].filter((node): node is HTMLElement => node instanceof HTMLElement && !(node as HTMLButtonElement).disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  return createPortal(
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} data-slot="pendant-lamp-detail" className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-6 text-foreground ${THEME}`} onKeyDown={onKeyDown}>
      <div aria-hidden="true" className={`absolute inset-0 bg-background/90 backdrop-blur-xl transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`} onClick={dismiss} />
      <button type="button" onClick={dismiss} className={`absolute right-5 top-5 z-10 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground outline-none transition-[opacity,color] duration-300 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}>
        {labels.close}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
      <div className="relative grid w-full max-w-4xl items-center gap-6 pt-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:gap-12">
        <div data-dimmer-scene className="relative flex justify-center" style={{ ["--dim" as string]: dim.toFixed(2), ["--lit" as string]: dim.toFixed(2), ["--lamp-glow" as string]: item.glow }}>
          <div ref={figureRef} data-figure className="relative aspect-[2/3] h-[min(40vh,300px)] origin-top sm:h-[min(60vh,440px)]">
            <span aria-hidden="true" data-cord className="pointer-events-none absolute inset-x-0 origin-top" style={{ top: "-60vh", height: "calc(60vh + 2px)", background: CORD_BG, transform: `scaleX(${CORD_W})` }} />
            <span aria-hidden="true" data-detail-pool className="pointer-events-none absolute rounded-full [mix-blend-mode:var(--blend)]" style={{ left: "-48%", width: "196%", top: "40%", height: "96%", background: POOL_BG, opacity: "calc(var(--dim) * var(--pool-k))" }} />
            <span aria-hidden="true" data-detail-beam className="pointer-events-none absolute [mix-blend-mode:var(--blend)]" style={{ left: "-100%", width: "300%", top: "30%", height: "150%", opacity: "calc(var(--dim) * var(--beam-k))", background: `conic-gradient(from 140deg at 50% 0%, transparent 0deg, ${BEAM_GLOW} 24deg, ${BEAM_GLOW} 56deg, transparent 80deg)`, WebkitMaskImage: "linear-gradient(to bottom, transparent 27%, black 40%, black 62%, transparent)", maskImage: "linear-gradient(to bottom, transparent 27%, black 40%, black 62%, transparent)" }} />
            <div ref={swayRef} className="absolute inset-0 origin-top" style={{ ["--bloom-r" as string]: "18px" }}>
              <LampPhoto item={item} failed={failed} onFail={onFail} shadow={false} />
            </div>
          </div>
        </div>
        <div className={`flex flex-col gap-4 text-center transition-[opacity,transform] delay-150 duration-500 motion-reduce:transition-none sm:text-left ${shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</p>
          <div className="flex flex-col gap-2">
            <h3 id={titleId} className="text-2xl font-medium tracking-tight sm:text-3xl">{item.name}</h3>
            {item.description && <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
          </div>
          {item.details && item.details.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {item.details.map((detail) => <li key={detail} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">{detail}</li>)}
            </ul>
          )}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/60 p-4 text-left">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor={rangeId} className="font-medium text-muted-foreground">{labels.dimmer}</label>
              <span data-dim-value className="font-mono tabular-nums text-foreground">{percent}%</span>
            </div>
            <input
              ref={rangeRef}
              id={rangeId}
              type="range"
              min={0}
              max={100}
              step={1}
              value={percent}
              aria-label={labels.dimmer}
              aria-valuetext={`${percent}%`}
              onChange={(event) => onDim(Number(event.currentTarget.value) / 100)}
              className="h-5 w-full cursor-pointer rounded-full outline-none [accent-color:var(--lamp-accent)] focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {item.tag && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-bold tabular-nums text-card-foreground shadow-sm">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--lamp-accent)]" />
                {item.tag}
              </span>
              {item.productId && (
                <Link
                  href={`/products/${item.productId}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#2f6f5e] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#245b4c]"
                >
                  <span>Xem chi tiết sản phẩm</span>
                </Link>
              )}
              {item.productLink && (
                <a
                  href={item.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#2f6f5e]/30 bg-white px-4 py-1.5 text-xs font-semibold text-[#2f6f5e] shadow-sm transition hover:bg-[#eef2e7]"
                >
                  <span>Mua ngay trên Shopee ↗</span>
                </a>
              )}
            </div>
          )}
          {item.productImage && (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-3 text-left">
              <img
                src={item.productImage}
                alt={item.name}
                className="size-14 shrink-0 rounded-xl border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Ảnh sản phẩm thực tế
                </p>
                <p className="truncate text-xs font-bold text-foreground">
                  {item.name}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* 1. ĐÈN ĐÁM MÂY KHI TẮT:
   Dây xuất phát từ y=0 khớp hoàn toàn với CORD_BG (rộng 8px trên khung 400x600).
   Cụm mây bông màu trắng ngà 3D nhiều lớp tạo độ phồng từ y=180..410. */
const CLOUD_OFF_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <defs>
    <filter id="cloudSoftness" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise"/>
      <feDisplacementMap in="blur" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="cordGrad" x1="196" y1="0" x2="204" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="38%" stop-color="#5c5c5c"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
    <radialGradient id="cloudPuff" cx="45%" cy="38%" r="58%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="62%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
  </defs>

  <!-- Dây treo nối thẳng từ y=0 xuống đỉnh đèn mây (y=205) -->
  <rect x="196" y="0" width="8" height="205" fill="url(#cordGrad)" />

  <!-- Khối đèn đám mây bông xốp đa tầng -->
  <g filter="url(#cloudSoftness)">
    <!-- Lớp bóng đổ chân mây -->
    <ellipse cx="200" cy="340" rx="135" ry="56" fill="#94a3b8" opacity="0.38"/>
    <ellipse cx="120" cy="328" rx="82" ry="48" fill="#94a3b8" opacity="0.32"/>
    <ellipse cx="280" cy="328" rx="84" ry="48" fill="#94a3b8" opacity="0.32"/>

    <!-- Lớp thân bông trắng mềm -->
    <circle cx="118" cy="302" r="76" fill="url(#cloudPuff)"/>
    <circle cx="282" cy="302" r="76" fill="url(#cloudPuff)"/>
    <circle cx="158" cy="260" r="72" fill="url(#cloudPuff)"/>
    <circle cx="242" cy="260" r="72" fill="url(#cloudPuff)"/>
    <circle cx="200" cy="240" r="64" fill="url(#cloudPuff)"/>
    <ellipse cx="200" cy="312" rx="142" ry="66" fill="url(#cloudPuff)"/>
  </g>
</svg>
`)}`;

/* 2. ĐÈN ĐÁM MÂY KHI BẬT SÁNG:
   Ánh sáng ấm xuyên qua lõi mây bông, phát tán ánh vàng rực rỡ và phát quang ra xung quanh. */
const CLOUD_ON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
  <defs>
    <filter id="cloudSoftnessOn" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise"/>
      <feDisplacementMap in="blur" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="cordGradOn" x1="196" y1="0" x2="204" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#262626"/>
      <stop offset="38%" stop-color="#5c5c5c"/>
      <stop offset="100%" stop-color="#1c1c1c"/>
    </linearGradient>
    <radialGradient id="cloudWarmPuff" cx="50%" cy="48%" r="58%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="55%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </radialGradient>
    <radialGradient id="lightCore" cx="50%" cy="55%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="30%" stop-color="#fff8db" stop-opacity="0.95"/>
      <stop offset="70%" stop-color="#ffd573" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2"/>
    </radialGradient>
    <filter id="bloomGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
    </filter>
  </defs>

  <!-- Dây treo giữ tông đồng bộ -->
  <rect x="196" y="0" width="8" height="205" fill="url(#cordGradOn)" />

  <!-- Lớp bông mây ấm sáng khi bật đèn -->
  <g filter="url(#cloudSoftnessOn)">
    <ellipse cx="200" cy="340" rx="135" ry="56" fill="#f59e0b" opacity="0.38"/>
    <ellipse cx="120" cy="328" rx="82" ry="48" fill="#f59e0b" opacity="0.32"/>
    <ellipse cx="280" cy="328" rx="84" ry="48" fill="#f59e0b" opacity="0.32"/>
    <circle cx="118" cy="302" r="76" fill="url(#cloudWarmPuff)"/>
    <circle cx="282" cy="302" r="76" fill="url(#cloudWarmPuff)"/>
    <circle cx="158" cy="260" r="72" fill="url(#cloudWarmPuff)"/>
    <circle cx="242" cy="260" r="72" fill="url(#cloudWarmPuff)"/>
    <circle cx="200" cy="240" r="64" fill="url(#cloudWarmPuff)"/>
    <ellipse cx="200" cy="312" rx="142" ry="66" fill="url(#cloudWarmPuff)"/>
  </g>

  <!-- Quầng sáng ấm phát ra từ trong lòng mây -->
  <g filter="url(#bloomGlow)">
    <circle cx="200" cy="295" r="105" fill="url(#lightCore)"/>
    <ellipse cx="200" cy="312" rx="150" ry="80" fill="url(#lightCore)"/>
    <circle cx="135" cy="302" r="82" fill="url(#lightCore)"/>
    <circle cx="265" cy="302" r="82" fill="url(#lightCore)"/>
  </g>
</svg>
`)}`;

export const LAMP_DEMO_ITEMS: PendantLamp[] = [
  {
    id: "dome-enamel",
    productId: "6ae33590f9df260a0b6cfb65",
    name: "Đèn Thả Trần Bàn Ăn Bauhaus",
    tag: "685.420 ₫",
    drop: 0.62,
    description: "Đèn thả trần phong cách Bauhaus tối giản, tạo điểm nhấn ấm cúng cho bàn ăn & phòng khách.",
    details: ["Danh mục: Đèn thả trần", "Ánh sáng ấm dịu", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1793275239/decoho/products/ougldq7lrvx7fk8d9wn0.webp",
    productLink: "https://s.shopee.vn/6VOtBHsYbE",
    image: "https://cdn.21st.dev/assets/mirror/fc/fcfdfbf3d62f14d97eb23453aa9fe6772f7c09b521226442621e4f187d79b4d6.webp",
    imageOn: "https://cdn.21st.dev/assets/mirror/2d/2d2990c7f5d56e69848237695a204baf6a366d180facb94c62b78cdc3e37dd13.webp",
  },
  {
    id: "cloud-pendant",
    productId: "6ad983abb0c4d04dfb65f9f9",
    name: "Đèn Mây Treo",
    tag: "210.000 ₫",
    drop: 0.85,
    glow: "#ffecb3",
    description: "Đèn thả trần hình đám mây bông bồng bềnh, tạo ánh sáng khuếch tán dịu nhẹ và ấm áp như hoàng hôn trong phòng.",
    details: ["Danh mục: Đèn trần", "Chất liệu bông tơ polymer tán sáng", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1792639905/decoho/products/gqr1j3ownrpfi4hhwao7.webp",
    productLink: "https://s.shopee.vn/5q98YM4rnF",
    image: CLOUD_OFF_SVG,
    imageOn: CLOUD_ON_SVG,
  },
  {
    id: "glass-globe",
    productId: "6ae3304df9df260a0b6cfada",
    name: "Đèn trần cổ điển",
    tag: "863.000 ₫",
    drop: 0.9,
    description: "Đèn trần phong cách cổ điển sang trọng, ánh sáng vàng ấm tôn lên đường nét nội thất.",
    details: ["Danh mục: Đèn trần", "Thủy tinh & kim loại", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1793273898/decoho/products/dwglcdh098anxy2asljx.webp",
    productLink: "https://s.shopee.vn/3VlHbm3ygR",
    image: "https://cdn.21st.dev/assets/mirror/ba/ba2f12a44156865baeb4c1173a7d320384edc5156dcaf1d4e44e684ae780ba57.webp",
    imageOn: "https://cdn.21st.dev/assets/mirror/a5/a55502eb9cf6cac0bd52969eb61bb546a478e861f3568aad6875e4dad5c03f6e.webp",
  },
  {
    id: "cone-brass",
    productId: "6adb6a48a448fd9321cf428d",
    name: "Đèn treo thả trần phong cách cổ điển",
    tag: "249.000 ₫",
    drop: 0.74,
    description: "Đèn treo thả trần kiểu dáng cổ điển, gom vùng sáng ấm áp cho góc đọc sách và bàn trà.",
    details: ["Danh mục: Đèn treo thả trần", "Thiết kế cổ điển", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1792764462/decoho/products/wkh7trbzipxxpwdnoto0.webp",
    productLink: "https://s.shopee.vn/3g4YFNYVm2",
    image: "https://cdn.21st.dev/assets/mirror/96/968b92c5f3adc4a3f45d627f339fa2c4017a70a0d57f7c68b8a0c5b4ace6aef3.webp",
    imageOn: "https://cdn.21st.dev/assets/mirror/cc/cc2aa1c7f32e04bc950f63274f28986c573a8ad2c27f84eef148191a1178d424.webp",
  },
  {
    id: "rattan-weave",
    productId: "6ad97ca4b0c4d04dfb65f7ac",
    name: "Đèn Deco Đám Mây",
    tag: "142.000 ₫",
    drop: 1,
    description: "Đèn decor thủ công tự nhiên, tạo hiệu ứng ánh sáng đan xen mộc mạc, gần gũi.",
    details: ["Danh mục: Đèn decor", "Ánh sáng ấm áp", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1792638111/decoho/products/czy7csyrsdtzi2c3mmfp.webp",
    productLink: "https://s.shopee.vn/6q1fi5En8u",
    image: "https://cdn.21st.dev/assets/mirror/12/1237597f711ee8334bad09432954cf04fe8cc104877dece6d0986441e59030a9.webp",
    imageOn: "https://cdn.21st.dev/assets/mirror/39/394b02f1dff0096ebace53699c42c4d817dfffd5aff943d888454a83036ce1fb.webp",
  },
  {
    id: "paper-lantern",
    productId: "6adb6694a448fd9321cf41b3",
    name: "Đèn Nấm - Đèn thả trần tre tròn 2 lớp",
    tag: "300.000 ₫",
    drop: 0.68,
    description: "Đèn thả trần khung tre tròn 2 lớp dáng nấm, tán sáng mềm mại cho phòng ngủ & phòng khách.",
    details: ["Danh mục: Đèn thả trần", "Khung tre 2 lớp", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1792763531/decoho/products/ykk3a0ap12uedjr4i3jo.webp",
    productLink: "https://s.shopee.vn/50ZvppTR4A",
    image: "https://cdn.21st.dev/assets/mirror/dd/dd85e367f381884fa9147495c1025af4faed8a2f7ec1bc3cd82bbdc9a3c2815b.webp",
    imageOn: "https://cdn.21st.dev/assets/mirror/a9/a9e6b40b11b3abca1a39acd32489b66f6094f3ecb5361862c16a1d36599ad60c.webp",
  },
  {
    id: "concrete-cone",
    productId: "6adaca4d0d8c75708ef6758b",
    name: "Đèn Nấm Thả Trần",
    tag: "200.000 ₫",
    drop: 0.86,
    description: "Đèn thả trần dáng nấm hiện đại, phom chao rộng giúp phân bổ ánh sáng êm dịu.",
    details: ["Danh mục: Đèn thả trần", "Thiết kế tối giản", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1792723530/decoho/products/eopuyehfxngvevan8ybf.webp",
    productLink: "https://s.shopee.vn/6AltDyOzhl",
    image: "https://cdn.21st.dev/assets/mirror/a8/a89caec23d33213a849f40b76789ead7c88f0c2d91eb7e91e60987c72e566032.webp",
    imageOn: "https://cdn.21st.dev/assets/mirror/b1/b17f53b4eb8ff9d544bc2ce66802e46c7134d760cd225f9059aec2f7799ffbb7.webp",
  },
  {
    id: "copper-bell",
    productId: "6ae853fa9b2181304066c2a9",
    name: "Đèn Cây Đứng Hình Nấm",
    tag: "440.000 ₫",
    drop: 0.8,
    description: "Đèn decor chao vòm hình nấm sang trọng, mang lại bầu không khí ấm áp cho góc sofa.",
    details: ["Danh mục: Đèn decor", "Chao vòm phản quang", "Có sẵn trên DECOHO & Shopee"],
    productImage: "https://res.cloudinary.com/djzzwjznn/image/upload/v1793610743/decoho/products/hqdq0rbavm5jpoesesig.webp",
    productLink: "https://s.shopee.vn/9V2inio8nJ",
    image: "https://cdn.21st.dev/assets/mirror/3d/3d6d7c813c8d408fff25a92204f49cfcfa3cdf445e27b21b350c666177380c47.webp",
    imageOn: "https://cdn.21st.dev/assets/mirror/bf/bf643df2bd7d8eb4af9aeeffa53c5ff6dca49f702b88bde2a584697ca82aa862.webp",
  },
];

export default PendantLampRail;
