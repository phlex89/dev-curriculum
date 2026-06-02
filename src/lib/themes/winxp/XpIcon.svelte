<script lang="ts">
  // Flat XP/Luna-flavoured SVG icons, replacing the modern emoji glyphs.
  let { name, size = 32 }: { name: string; size?: number } = $props();
</script>

<svg viewBox="0 0 48 48" width={size} height={size} class="xp-icon" aria-hidden="true">
  {#if name === 'doc'}
    <!-- Text document -->
    <path d="M12 3h17l9 9v31a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#fff" stroke="#5a82b8" stroke-width="1.5" />
    <path d="M29 3v9h9z" fill="#cfe0f5" stroke="#5a82b8" stroke-width="1.5" />
    <g stroke="#3a6ea5" stroke-width="2.4" stroke-linecap="round">
      <line x1="16" y1="20" x2="32" y2="20" />
      <line x1="16" y1="26" x2="32" y2="26" />
      <line x1="16" y1="32" x2="26" y2="32" />
    </g>
  {:else if name === 'folder'}
    <!-- Manila folder -->
    <path d="M5 11h11l4 4h21a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2z" fill="#e3a92b" stroke="#b3781a" stroke-width="1.4" />
    <path d="M3 19l4-2h40l-3 22a2 2 0 0 1-2 1.8H5a2 2 0 0 1-2-2z" fill="#ffd35e" stroke="#d99f24" stroke-width="1.2" />
  {:else if name === 'folder-docs'}
    <!-- My Documents: folder with a sheet -->
    <path d="M5 11h11l4 4h21a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13a2 2 0 0 1 2-2z" fill="#e3a92b" stroke="#b3781a" stroke-width="1.4" />
    <rect x="16" y="9" width="18" height="22" rx="1.5" fill="#fff" stroke="#7a98c4" stroke-width="1.3" />
    <g stroke="#3a6ea5" stroke-width="2" stroke-linecap="round"><line x1="20" y1="15" x2="30" y2="15" /><line x1="20" y1="20" x2="30" y2="20" /></g>
    <path d="M3 21l4-2h40l-3 20a2 2 0 0 1-2 1.8H5a2 2 0 0 1-2-2z" fill="#ffd35e" stroke="#d99f24" stroke-width="1.2" />
  {:else if name === 'gear'}
    <!-- Settings / skills -->
    <path d="M24 6l2.5 4.6 5.2-1.1 0.6 5.3 5 1.8-2.6 4.6 2.6 4.6-5 1.8-0.6 5.3-5.2-1.1L24 42l-2.5-4.6-5.2 1.1-0.6-5.3-5-1.8 2.6-4.6L8.7 23.3l5-1.8 0.6-5.3 5.2 1.1z" fill="#7fa8e0" stroke="#3a6ea5" stroke-width="1.4" stroke-linejoin="round" />
    <circle cx="24" cy="24" r="6.5" fill="#fff" stroke="#3a6ea5" stroke-width="1.6" />
  {:else if name === 'cap'}
    <!-- Graduation cap -->
    <path d="M24 9 4 18l20 9 20-9z" fill="#2b3a55" stroke="#16233c" stroke-width="1.2" />
    <path d="M14 23v9c0 2.8 4.5 5 10 5s10-2.2 10-5v-9l-10 4.5z" fill="#3a4d70" stroke="#16233c" stroke-width="1.2" />
    <line x1="44" y1="18" x2="44" y2="30" stroke="#16233c" stroke-width="1.6" />
    <circle cx="44" cy="31" r="2" fill="#e3a92b" />
  {:else if name === 'contacts'}
    <!-- Address card -->
    <rect x="4" y="10" width="40" height="28" rx="3" fill="#fff" stroke="#5a82b8" stroke-width="1.5" />
    <rect x="4" y="10" width="40" height="8" rx="3" fill="#5a82b8" />
    <circle cx="16" cy="27" r="5" fill="#7fa8e0" stroke="#3a6ea5" stroke-width="1.2" />
    <path d="M9 36c0-4 3.5-6 7-6s7 2 7 6z" fill="#7fa8e0" stroke="#3a6ea5" stroke-width="1.2" />
    <g stroke="#9aa7bd" stroke-width="2.4" stroke-linecap="round"><line x1="28" y1="26" x2="39" y2="26" /><line x1="28" y1="32" x2="39" y2="32" /></g>
  {:else if name === 'trash'}
    <!-- Recycle bin -->
    <path d="M12 16h24l-2.5 26a2 2 0 0 1-2 1.8H16.5a2 2 0 0 1-2-1.8z" fill="#c9d3dc" stroke="#7d8a98" stroke-width="1.4" />
    <path d="M12 16h24l-2.5 26a2 2 0 0 1-2 1.8H16.5a2 2 0 0 1-2-1.8z" fill="url(#binGrad)" opacity="0.5" />
    <ellipse cx="24" cy="16" rx="12" ry="3.4" fill="#e4ebf1" stroke="#7d8a98" stroke-width="1.4" />
    <g fill="none" stroke="#3c9a3c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 24l-3 5 5 1" /><path d="M28 24l3 5-5 1" /><path d="M22 36l2-5 4 2" />
    </g>
    <defs>
      <linearGradient id="binGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0.8" /><stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>
  {:else if name === 'computer'}
    <!-- My Computer (CRT monitor) -->
    <rect x="6" y="8" width="36" height="26" rx="2.5" fill="#dfe6ee" stroke="#7d8a98" stroke-width="1.5" />
    <rect x="9" y="11" width="30" height="20" rx="1" fill="#2f6db5" />
    <rect x="9" y="11" width="30" height="20" rx="1" fill="url(#scrGrad)" />
    <path d="M18 34h12l2 6H16z" fill="#c9d3dc" stroke="#7d8a98" stroke-width="1.3" />
    <rect x="13" y="40" width="22" height="3.5" rx="1.5" fill="#aeb9c6" stroke="#7d8a98" stroke-width="1.1" />
    <defs>
      <linearGradient id="scrGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#6fb3ff" /><stop offset="1" stop-color="#2f6db5" />
      </linearGradient>
    </defs>
  {:else if name === 'control'}
    <!-- Control panel -->
    <rect x="5" y="9" width="38" height="30" rx="3" fill="#eef2f7" stroke="#7d8a98" stroke-width="1.4" />
    <g stroke="#3a6ea5" stroke-width="3" stroke-linecap="round"><line x1="11" y1="18" x2="37" y2="18" /><line x1="11" y1="30" x2="37" y2="30" /></g>
    <circle cx="19" cy="18" r="4" fill="#7fa8e0" stroke="#3a6ea5" stroke-width="1.4" />
    <circle cx="30" cy="30" r="4" fill="#e3a92b" stroke="#b3781a" stroke-width="1.4" />
  {:else if name === 'linkedin'}
    <rect x="6" y="6" width="36" height="36" rx="5" fill="#0a66c2" />
    <text x="24" y="33" text-anchor="middle" font-family="Tahoma, sans-serif" font-weight="700" font-size="22" fill="#fff">in</text>
  {:else if name === 'start'}
    <!-- Windows wavy flag -->
    <g>
      <path d="M5 12c6-3 10-3 16-1v13c-6-2-10-2-16 1z" fill="#e84d3d" />
      <path d="M21 11c6 2 10 2 16-1v13c-6 3-10 3-16 1z" fill="#43b34a" />
      <path d="M5 25c6-3 10-3 16-1v13c-6-2-10-2-16 1z" fill="#3aa0e0" />
      <path d="M21 24c6 2 10 2 16-1v13c-6 3-10 3-16 1z" fill="#f4c238" />
    </g>
  {/if}
</svg>

<style>
  .xp-icon {
    display: block;
    filter: drop-shadow(1px 1px 1.5px rgba(0, 0, 0, 0.25));
  }
</style>
