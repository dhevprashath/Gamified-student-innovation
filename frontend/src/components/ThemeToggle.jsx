import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = ({ className = '' }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = (e) => {
      if (!localStorage.getItem('theme')) {
        const next = e.matches ? 'dark' : 'light';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
      }
    };
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className={`p-2 rounded-xl bg-surface border border-border text-muted hover:text-primary hover:border-primary/50 shadow-warm cursor-pointer ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      id="theme-toggle"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0,  opacity: 1, scale: 1 }}
            exit={{   rotate:  90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="block"
          >
            <Sun className="w-4 h-4 text-reward-deep" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0,  opacity: 1, scale: 1 }}
            exit={{   rotate: -90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="block"
          >
            <Moon className="w-4 h-4 text-primary-deep" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
