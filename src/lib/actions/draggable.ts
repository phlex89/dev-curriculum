type DragParam = string | { handle?: string; disabled?: boolean };

export function draggable(node: HTMLElement, param: DragParam = {}) {
  let handle: string | undefined;
  let disabled = false;

  function apply(p: DragParam) {
    if (typeof p === 'string') {
      handle = p;
      disabled = false;
    } else {
      handle = p?.handle;
      disabled = !!p?.disabled;
    }
  }
  apply(param);

  let x = 0;
  let y = 0;

  function handleMousedown(event: MouseEvent) {
    if (disabled) return; // e.g. on mobile, where windows are fixed/maximised

    if (handle) {
      const el = node.querySelector(handle);
      if (el && !el.contains(event.target as Node)) {
        return;
      }
    }

    x = event.clientX;
    y = event.clientY;

    window.addEventListener('mousemove', handleMousemove);
    window.addEventListener('mouseup', handleMouseup);
  }

  function handleMousemove(event: MouseEvent) {
    const dx = event.clientX - x;
    const dy = event.clientY - y;

    x = event.clientX;
    y = event.clientY;

    const style = window.getComputedStyle(node);
    const top = parseInt(style.top, 10) || 0;
    const left = parseInt(style.left, 10) || 0;

    // Constrain to the viewport so a window can never be dragged fully off-screen
    // and lost: the title bar must always stay reachable.
    const margin = 60; // px of the window that must remain visible horizontally
    const taskbar = 30; // bottom bar height reserved for WinXP
    const minLeft = margin - node.offsetWidth;
    const maxLeft = window.innerWidth - margin;
    const minTop = 0; // never let the title bar go above the top edge
    const maxTop = window.innerHeight - taskbar - 30; // keep the title bar above the taskbar

    const nextLeft = Math.min(Math.max(left + dx, minLeft), maxLeft);
    const nextTop = Math.min(Math.max(top + dy, minTop), maxTop);

    node.style.top = `${nextTop}px`;
    node.style.left = `${nextLeft}px`;
  }

  function handleMouseup() {
    window.removeEventListener('mousemove', handleMousemove);
    window.removeEventListener('mouseup', handleMouseup);
  }

  node.addEventListener('mousedown', handleMousedown);

  return {
    update(p: DragParam) {
      apply(p);
    },
    destroy() {
      node.removeEventListener('mousedown', handleMousedown);
      handleMouseup();
    }
  };
}
