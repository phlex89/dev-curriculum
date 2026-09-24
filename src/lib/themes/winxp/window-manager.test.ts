import { describe, expect, it } from 'vitest';
import {
  bringToFront,
  clampOpenWindows,
  clampToViewport,
  closeWindow,
  minimizeWindow,
  openWindow,
  taskbarClick,
  toggleMaximize,
  TASKBAR_HEIGHT,
  TITLEBAR_CLEARANCE,
  VIEWPORT_MARGIN,
  WINDOW_WIDTH,
  type WindowRect
} from './window-manager';

function win(overrides: Partial<WindowRect> & { id: string }): WindowRect {
  return {
    isOpen: false,
    minimized: false,
    maximized: false,
    zIndex: 10,
    x: 80,
    y: 56,
    ...overrides
  };
}

describe('clampToViewport', () => {
  it('lascia intatta una finestra già dentro i bordi', () => {
    const w = win({ id: 'a', x: 100, y: 100 });
    const clamped = clampToViewport(w, { width: 1200, height: 800 });
    expect(clamped.x).toBe(100);
    expect(clamped.y).toBe(100);
  });

  it('riporta dentro una finestra con coordinate negative', () => {
    const w = win({ id: 'a', x: -50, y: -50 });
    const clamped = clampToViewport(w, { width: 1200, height: 800 });
    expect(clamped.x).toBe(VIEWPORT_MARGIN);
    expect(clamped.y).toBe(VIEWPORT_MARGIN);
  });

  it('riporta dentro una finestra oltre il bordo destro/basso', () => {
    const w = win({ id: 'a', x: 5000, y: 5000 });
    const clamped = clampToViewport(w, { width: 1200, height: 800 });
    expect(clamped.x).toBe(1200 - WINDOW_WIDTH - VIEWPORT_MARGIN);
    expect(clamped.y).toBe(800 - TASKBAR_HEIGHT - TITLEBAR_CLEARANCE);
  });

  it('su un viewport più piccolo della finestra, clampa comunque al margine minimo', () => {
    const w = win({ id: 'a', x: 300, y: 300 });
    const clamped = clampToViewport(w, { width: 200, height: 100 });
    expect(clamped.x).toBe(VIEWPORT_MARGIN);
    expect(clamped.y).toBe(VIEWPORT_MARGIN);
  });
});

describe('openWindow', () => {
  it('apre la finestra e la porta in primo piano', () => {
    const windows = [win({ id: 'a', zIndex: 10 }), win({ id: 'b', zIndex: 10 })];
    const result = openWindow(windows, 'a', 10);
    expect(result.opened).toBe(true);
    const a = result.windows.find((w) => w.id === 'a')!;
    expect(a.isOpen).toBe(true);
    expect(a.minimized).toBe(false);
    expect(a.zIndex).toBe(11);
    expect(result.topZIndex).toBe(11);
  });

  it('riapre una finestra minimizzata azzerando minimized e portandola avanti', () => {
    const windows = [win({ id: 'a', isOpen: true, minimized: true, zIndex: 15 })];
    const result = openWindow(windows, 'a', 20);
    const a = result.windows[0];
    expect(a.minimized).toBe(false);
    expect(a.isOpen).toBe(true);
    expect(a.zIndex).toBe(21);
  });

  it('applica il clamp del viewport quando fornito', () => {
    const windows = [win({ id: 'a', x: 5000, y: 5000 })];
    const result = openWindow(windows, 'a', 10, { width: 1200, height: 800 });
    const a = result.windows[0];
    expect(a.x).toBe(1200 - WINDOW_WIDTH - VIEWPORT_MARGIN);
    expect(a.y).toBe(800 - TASKBAR_HEIGHT - TITLEBAR_CLEARANCE);
  });

  it('non applica il clamp quando il viewport è assente (mobile)', () => {
    const windows = [win({ id: 'a', x: 5000, y: 5000 })];
    const result = openWindow(windows, 'a', 10);
    const a = result.windows[0];
    expect(a.x).toBe(5000);
    expect(a.y).toBe(5000);
  });

  it('non fa nulla se la finestra non esiste', () => {
    const windows = [win({ id: 'a' })];
    const result = openWindow(windows, 'ghost', 10);
    expect(result.opened).toBe(false);
    expect(result.windows).toBe(windows);
    expect(result.topZIndex).toBe(10);
  });
});

describe('closeWindow', () => {
  it('chiude la finestra e resetta minimized/maximized', () => {
    const windows = [win({ id: 'a', isOpen: true, minimized: true, maximized: true })];
    const result = closeWindow(windows, 'a');
    expect(result.closed).toBe(true);
    const a = result.windows[0];
    expect(a.isOpen).toBe(false);
    expect(a.minimized).toBe(false);
    expect(a.maximized).toBe(false);
  });

  it('segnala closed=false se la finestra non esiste', () => {
    const windows = [win({ id: 'a' })];
    const result = closeWindow(windows, 'ghost');
    expect(result.closed).toBe(false);
  });
});

describe('minimizeWindow', () => {
  it('minimizza solo la finestra indicata', () => {
    const windows = [win({ id: 'a', isOpen: true }), win({ id: 'b', isOpen: true })];
    const result = minimizeWindow(windows, 'a');
    expect(result.find((w) => w.id === 'a')!.minimized).toBe(true);
    expect(result.find((w) => w.id === 'b')!.minimized).toBe(false);
  });
});

describe('toggleMaximize', () => {
  it('alterna maximized e porta la finestra in primo piano', () => {
    const windows = [win({ id: 'a', isOpen: true, maximized: false, zIndex: 10 })];
    const first = toggleMaximize(windows, 'a', 10);
    expect(first.windows[0].maximized).toBe(true);
    expect(first.windows[0].zIndex).toBe(11);
    expect(first.topZIndex).toBe(11);

    const second = toggleMaximize(first.windows, 'a', first.topZIndex);
    expect(second.windows[0].maximized).toBe(false);
    expect(second.windows[0].zIndex).toBe(12);
  });
});

describe('bringToFront (z-order dopo più aperture)', () => {
  it('assegna z-index crescenti a ogni chiamata, indipendentemente dallo z-index iniziale', () => {
    const windows = [win({ id: 'a', zIndex: 10 }), win({ id: 'b', zIndex: 10 }), win({ id: 'c', zIndex: 100 })];
    let state = bringToFront(windows, 'a', 10);
    expect(state.windows.find((w) => w.id === 'a')!.zIndex).toBe(11);
    state = bringToFront(state.windows, 'b', state.topZIndex);
    expect(state.windows.find((w) => w.id === 'b')!.zIndex).toBe(12);
    state = bringToFront(state.windows, 'a', state.topZIndex);
    expect(state.windows.find((w) => w.id === 'a')!.zIndex).toBe(13);
    expect(state.topZIndex).toBe(13);
  });
});

describe('taskbarClick', () => {
  it('restaura una finestra minimizzata e la porta in primo piano', () => {
    const windows = [win({ id: 'a', isOpen: true, minimized: true, zIndex: 10 })];
    const result = taskbarClick(windows, 'a', 10);
    expect(result.windows[0].minimized).toBe(false);
    expect(result.windows[0].zIndex).toBe(11);
  });

  it('minimizza una finestra già in primo piano', () => {
    const windows = [win({ id: 'a', isOpen: true, zIndex: 12 })];
    const result = taskbarClick(windows, 'a', 12);
    expect(result.windows[0].minimized).toBe(true);
    expect(result.topZIndex).toBe(12);
  });

  it('porta in primo piano una finestra visibile ma non in cima', () => {
    const windows = [win({ id: 'a', isOpen: true, zIndex: 10 }), win({ id: 'b', isOpen: true, zIndex: 12 })];
    const result = taskbarClick(windows, 'a', 12);
    expect(result.windows.find((w) => w.id === 'a')!.zIndex).toBe(13);
    expect(result.topZIndex).toBe(13);
  });

  it('non fa nulla se la finestra non esiste', () => {
    const windows = [win({ id: 'a' })];
    const result = taskbarClick(windows, 'ghost', 10);
    expect(result.windows).toBe(windows);
    expect(result.topZIndex).toBe(10);
  });
});

describe('clampOpenWindows', () => {
  it('clampa solo le finestre aperte e non massimizzate', () => {
    const windows = [
      win({ id: 'open', isOpen: true, maximized: false, x: 5000, y: 5000 }),
      win({ id: 'closed', isOpen: false, x: 5000, y: 5000 }),
      win({ id: 'maxed', isOpen: true, maximized: true, x: 5000, y: 5000 })
    ];
    const result = clampOpenWindows(windows, { width: 1200, height: 800 });
    expect(result.find((w) => w.id === 'open')!.x).toBe(1200 - WINDOW_WIDTH - VIEWPORT_MARGIN);
    expect(result.find((w) => w.id === 'closed')!.x).toBe(5000);
    expect(result.find((w) => w.id === 'maxed')!.x).toBe(5000);
  });
});
