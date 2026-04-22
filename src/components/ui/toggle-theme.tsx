import { SunIcon, MoonStarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  { icon: SunIcon, value: 'light' as const },
  { icon: MoonStarIcon, value: 'dark' as const },
];

function resolveActive(theme: string): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme as 'light' | 'dark';
}

export function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const active = resolveActive(theme);

  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-md border border-gray-200 bg-gray-100/80 dark:border-slate-600 dark:bg-slate-700/80"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={cn(
            'relative flex size-7 cursor-pointer items-center justify-center rounded-md transition-all',
            active === option.value
              ? 'text-gray-900 dark:text-gray-100'
              : 'text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200',
          )}
          role="radio"
          aria-checked={active === option.value}
          aria-label={`Switch to ${option.value} theme`}
          onClick={() => setTheme(option.value)}
        >
          {active === option.value && (
            <motion.div
              layoutId="theme-option"
              transition={{ type: 'spring', bounce: 0.1, duration: 0.75 }}
              className="absolute inset-0 rounded-md border border-gray-300 dark:border-gray-500"
            />
          )}
          <option.icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
