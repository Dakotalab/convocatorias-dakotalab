/* theme.js - Toggle de modo oscuro / claro */

function initTheme() {
    const saved = localStorage.getItem(LS + 'theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);

  document.getElementById('theme-toggle').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next    = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(LS + 'theme', next);
        updateThemeIcon(next);
  });
}

function updateThemeIcon(theme) {
    document.getElementById('theme-toggle').textContent = theme === 'dark' ? 'S' : 'N';
}
