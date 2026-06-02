/* ═══════════════════════════════════════════════════════════════
   Emmerican Adventure — Light / Dark Mode Toggle
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'ea-theme';

function getTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  updateButtons(theme);
}

function updateButtons(theme) {
  document.querySelectorAll('#themeToggle').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Apply immediately to prevent flash
applyTheme(getTheme());

// Wire up buttons after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  updateButtons(getTheme());
  document.querySelectorAll('#themeToggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
});

// Also wire up immediately in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  updateButtons(getTheme());
  document.querySelectorAll('#themeToggle').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
}