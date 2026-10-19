// Theme switch (button top right, or T): remembered per browser; ?theme=light forces it. index.html sets it before paint.
(() => {
    const root = document.documentElement, KEY = 'rm-deck-theme';
    const set = t => { root.dataset.theme = t; try { localStorage.setItem(KEY, t); } catch {} };
    set(new URLSearchParams(location.search).get('theme') || localStorage.getItem(KEY) || 'dark');
    const flip = () => set(root.dataset.theme === 'light' ? 'dark' : 'light');
    document.getElementById('themeToggle').addEventListener('click', e => { e.stopPropagation(); flip(); e.currentTarget.blur(); });
    addEventListener('keydown', e => { if ((e.key === 't' || e.key === 'T') && !e.metaKey && !e.ctrlKey) flip(); });
})();
