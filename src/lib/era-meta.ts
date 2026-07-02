import type { Theme } from './store';

export type EraMeta = { id: Theme; label: string; year: string; icon: string };

export const ERA_META: EraMeta[] = [
  { id: 'terminal', label: 'Terminal', year: '1980s', icon: '⌨️' },
  { id: 'teletext', label: 'Televideo', year: '1984', icon: '📺' },
  { id: 'pixel', label: 'Pixel Art', year: '1988', icon: '🎮' },
  { id: 'web1', label: 'Web 1.0', year: '1996', icon: '🌐' },
  { id: 'winxp', label: 'Win XP', year: '2001', icon: '🪟' },
  { id: 'skeuo', label: 'Skeuomorph', year: '2010', icon: '💎' },
  { id: 'material', label: 'Material', year: '2014', icon: '📐' },
  { id: 'bento', label: 'Modern Flat', year: '2015', icon: '📱' },
  { id: 'brutalism', label: 'Brutalism', year: '2017', icon: '🧱' },
  { id: 'parallax', label: 'Parallax', year: '2018', icon: '🎬' },
  { id: 'glass', label: 'Glass', year: '2020', icon: '🧊' },
  { id: 'threed', label: 'Future 3D', year: '2026', icon: '🌌' }
];
