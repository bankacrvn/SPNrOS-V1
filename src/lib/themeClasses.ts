import { CmsPrimaryColor, CmsBorderRadius, CmsThemeConfig } from '../types';

export interface ThemeClasses {
  accent: string;
  bg: string;
  bgHover: string;
  text: string;
  border: string;
  lightBg: string;
  badge: string;
  button: string;
  gradient: string;
  ring: string;
  cardRadius: string;
  buttonRadius: string;
  inputRadius: string;
  badgeRadius: string;
}

export const PRIMARY_COLOR_MAP: Record<CmsPrimaryColor, {
  accent: string;
  bg: string;
  bgHover: string;
  text: string;
  border: string;
  lightBg: string;
  badge: string;
  button: string;
  gradient: string;
  ring: string;
  hex: string;
  name: string;
}> = {
  indigo: {
    accent: 'indigo-500',
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    lightBg: 'bg-indigo-500/10',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25',
    gradient: 'from-sky-500 via-indigo-600 to-violet-600',
    ring: 'focus:ring-indigo-500',
    hex: '#4F46E5',
    name: 'Modern Indigo',
  },
  emerald: {
    accent: 'emerald-500',
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    lightBg: 'bg-emerald-500/10',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25',
    gradient: 'from-teal-500 via-emerald-600 to-green-600',
    ring: 'focus:ring-emerald-500',
    hex: '#059669',
    name: 'Fresh Emerald',
  },
  rose: {
    accent: 'rose-500',
    bg: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    lightBg: 'bg-rose-500/10',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25',
    gradient: 'from-pink-500 via-rose-600 to-red-600',
    ring: 'focus:ring-rose-500',
    hex: '#E11D48',
    name: 'Ruby Rose',
  },
  amber: {
    accent: 'amber-500',
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    lightBg: 'bg-amber-500/10',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/25',
    gradient: 'from-orange-500 via-amber-600 to-yellow-500',
    ring: 'focus:ring-amber-500',
    hex: '#D97706',
    name: 'Warm Amber',
  },
};

export const BORDER_RADIUS_MAP: Record<CmsBorderRadius, {
  card: string;
  button: string;
  input: string;
  badge: string;
  name: string;
}> = {
  none: {
    card: 'rounded-none',
    button: 'rounded-none',
    input: 'rounded-none',
    badge: 'rounded-none',
    name: 'Sharp (0px)',
  },
  md: {
    card: 'rounded-xl',
    button: 'rounded-lg',
    input: 'rounded-lg',
    badge: 'rounded-md',
    name: 'Clean (8px)',
  },
  xl: {
    card: 'rounded-3xl',
    button: 'rounded-2xl',
    input: 'rounded-xl',
    badge: 'rounded-xl',
    name: 'Soft (16px)',
  },
  full: {
    card: 'rounded-3xl',
    button: 'rounded-full',
    input: 'rounded-full',
    badge: 'rounded-full',
    name: 'Pill / Full',
  },
};

export function getThemeClasses(theme: CmsThemeConfig): ThemeClasses {
  const color = PRIMARY_COLOR_MAP[theme?.primaryColor || 'indigo'] || PRIMARY_COLOR_MAP.indigo;
  const radius = BORDER_RADIUS_MAP[theme?.borderRadius || 'xl'] || BORDER_RADIUS_MAP.xl;

  return {
    accent: color.accent,
    bg: color.bg,
    bgHover: color.bgHover,
    text: color.text,
    border: color.border,
    lightBg: color.lightBg,
    badge: color.badge,
    button: color.button,
    gradient: color.gradient,
    ring: color.ring,
    cardRadius: radius.card,
    buttonRadius: radius.button,
    inputRadius: radius.input,
    badgeRadius: radius.badge,
  };
}
