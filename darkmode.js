/* ═══════════════════════════════════════════════════════════════
   Emmerican Adventure — Light / Dark Mode Toggle
   Saves preference to localStorage, respects system preference
   ═══════════════════════════════════════════════════════════════ */

(function() {
  const STORAGE_KEY = 'ea-theme';
  const root = document.documentElement;

  // ── Determine initial theme ─────────────────────────────────
  function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // ── Apply theme to <html> ───────────────────────────────────
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ── Apply immediately to avoid flash ───────────────────────
  applyTheme(getInitialTheme());

  // ── Toggle on button click ──────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  });
})();
