'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (saved !== 'light' && prefersDark);
    setIsDark(dark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-full bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors backdrop-blur-sm"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
