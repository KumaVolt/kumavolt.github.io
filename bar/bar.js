/*
 * The KumaVolt bar: one thin bar across the top of every KumaVolt site (kumavolt.dev,
 * gitchrono.com, encheo.kumavolt.dev) with a switcher to the others.
 *
 * A site adds it with:
 *   <kumavolt-bar style="display:block;height:44px;background:#141416"></kumavolt-bar>
 *   <script src="https://kumavolt.dev/bar/bar.js" defer></script>
 * (the inline style keeps the space so the page doesn't jump when the script arrives).
 *
 * To add a project, add it to PRODUCTS. Links carry utm_source=kumavoltbar and
 * utm_medium=card<n>+<site it was clicked on>, so analytics can tell which card sent a visitor.
 * The bar sets no cookies and loads nothing else.
 */
(() => {
  if (customElements.get('kumavolt-bar')) return;

  const PRODUCTS = [
    {
      name: 'KumaVolt',
      host: 'kumavolt.dev',
      url: 'https://kumavolt.dev/',
      line: 'Who makes these, and what else is in the works',
      icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#ff554d"/><path d="M9 11l5 5-5 5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 22H23" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
    },
    {
      name: 'GitChrono',
      host: 'gitchrono.com',
      url: 'https://gitchrono.com/',
      line: 'A fast, native Git client for macOS, Windows and Linux',
      icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#16191f"/><path d="M12 9v14" stroke="#15a0bf" stroke-width="2.4" stroke-linecap="round"/><path d="M12 9h4.5a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H12" fill="none" stroke="#9b4fe0" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="9" r="3.4" fill="#15a0bf" stroke="#16191f" stroke-width="1.2"/><circle cx="19.5" cy="16" r="3.4" fill="#9b4fe0" stroke="#16191f" stroke-width="1.2"/><circle cx="12" cy="23" r="3.4" fill="#2f7df6" stroke="#16191f" stroke-width="1.2"/></svg>',
    },
    {
      name: 'Encheo',
      host: 'encheo.kumavolt.dev',
      url: 'https://encheo.kumavolt.dev/',
      line: 'One player for Plex, Jellyfin, Emby and the files on your network',
      icon: '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="22" fill="#1c1c1f"/><g transform="translate(-2.75 1.75)"><rect x="24" y="24" width="38" height="12" rx="6" fill="#f5a33b"/><path d="M66 22 L80 30 L66 38 Z" fill="#f5a33b" stroke="#f5a33b" stroke-width="3" stroke-linejoin="round"/><rect x="24" y="44" width="40" height="12" rx="6" fill="#bf8134"/><rect x="24" y="64" width="52" height="12" rx="6" fill="#88602d"/></g></svg>',
    },
  ];

  const here = location.hostname.replace(/^www\./, '');

  const link = (p, i) => {
    const u = new URL(p.url);
    u.searchParams.set('utm_source', 'kumavoltbar');
    u.searchParams.set('utm_medium', `card${i + 1}+${here || 'local'}`);
    return u.toString();
  };

  const css = `
    :host { display: block; height: 44px; background: #141416; color: #e9e9ec;
      font: 500 14px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      position: relative; z-index: 2147483000; -webkit-font-smoothing: antialiased; }
    * { box-sizing: border-box; }
    a { color: inherit; text-decoration: none; }
    .bar { height: 44px; display: flex; align-items: center; gap: 4px; padding: 0 12px;
      border-bottom: 1px solid #26262b; }
    button.switch { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 8px 0 6px;
      border: 0; border-radius: 8px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
    button.switch:hover, button.switch[aria-expanded="true"] { background: #222226; }
    .mark { width: 22px; height: 22px; display: grid; place-items: center; }
    .mark svg { width: 18px; height: 18px; }
    .word { font-weight: 650; letter-spacing: -0.01em; }
    .chev { width: 12px; height: 12px; color: #8d8d95; transition: transform .15s ease; }
    button.switch[aria-expanded="true"] .chev { transform: rotate(180deg); }
    .sep { width: 1px; height: 18px; background: #2e2e34; margin: 0 8px; }
    .current { color: #a7a7ae; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gh { margin-left: auto; display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px;
      border-radius: 8px; color: #a7a7ae; }
    .gh:hover { background: #222226; color: #e9e9ec; }
    .gh svg { width: 16px; height: 16px; }
    :focus-visible { outline: 2px solid #8ab4ff; outline-offset: 2px; }

    .panel { position: absolute; top: 44px; left: 8px; width: min(640px, calc(100vw - 16px));
      background: #1a1a1d; border: 1px solid #2c2c32; border-radius: 0 0 14px 14px; border-top: 0;
      padding: 14px; box-shadow: 0 18px 40px rgba(0, 0, 0, .45);
      opacity: 0; transform: translateY(-6px); pointer-events: none; visibility: hidden;
      transition: opacity .14s ease, transform .14s ease, visibility 0s linear .14s; }
    .panel.open { opacity: 1; transform: none; pointer-events: auto; visibility: visible;
      transition: opacity .14s ease, transform .14s ease; }
    .panel p { margin: 2px 4px 12px; color: #8d8d95; font-size: 13px; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    li a { display: flex; flex-direction: column; gap: 10px; height: 100%; padding: 12px; border-radius: 10px;
      background: #202024; border: 1px solid transparent; }
    li a:hover { background: #26262b; border-color: #34343b; }
    li a[aria-current="page"] { border-color: #3a3a42; }
    .ic svg { width: 36px; height: 36px; display: block; }
    .name { font-weight: 650; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .tag { font-size: 11px; font-weight: 600; color: #141416; background: #c9c9cf; border-radius: 999px; padding: 1px 7px; }
    .line { color: #a7a7ae; font-size: 13px; font-weight: 400; }
    .host { color: #75757d; font-size: 12px; margin-top: auto; }
    @media (max-width: 640px) {
      .panel { left: 0; width: 100vw; border-radius: 0 0 12px 12px; border-left: 0; border-right: 0; }
      ul { grid-template-columns: 1fr; }
      li a { flex-direction: row; align-items: center; }
      .host { display: none; }
      .current { display: none; }
      .sep { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { .panel, .panel.open, .chev { transition: none; } }
  `;

  const bolt = '<svg viewBox="0 0 24 24"><path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.6z" fill="#f2f2f4"/></svg>';
  const chev = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const github = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/></svg>';

  class KumaVoltBar extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: 'open' });
      const mine = PRODUCTS.find((p) => p.host === here);
      const cards = PRODUCTS.map((p, i) => `
        <li><a href="${link(p, i)}"${p === mine ? ' aria-current="page"' : ''}>
          <span class="ic">${p.icon}</span>
          <span>
            <span class="name">${p.name}${p === mine ? '<span class="tag">You\'re here</span>' : ''}</span>
            <span class="line">${p.line}</span>
          </span>
          <span class="host">${p.host}</span>
        </a></li>`).join('');
      root.innerHTML = `
        <style>${css}</style>
        <div class="bar">
          <button class="switch" type="button" aria-expanded="false" aria-controls="kv-panel">
            <span class="mark">${bolt}</span><span class="word">KumaVolt</span>${chev}
          </button>
          ${mine && mine.host !== 'kumavolt.dev' ? `<span class="sep"></span><span class="current">${mine.name}</span>` : ''}
          <a class="gh" href="https://github.com/KumaVolt">${github}<span>GitHub</span></a>
        </div>
        <nav class="panel" id="kv-panel" aria-label="KumaVolt projects">
          <p>Open-source apps by KumaVolt</p>
          <ul>${cards}</ul>
        </nav>`;

      const button = root.querySelector('.switch');
      const panel = root.querySelector('.panel');
      const setOpen = (open) => {
        button.setAttribute('aria-expanded', String(open));
        panel.classList.toggle('open', open);
        if (open) panel.querySelector('a').focus({ preventScroll: true });
      };
      button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
      document.addEventListener('click', (e) => { if (!e.composedPath().includes(this)) setOpen(false); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); }
      });
    }
  }

  customElements.define('kumavolt-bar', KumaVoltBar);
})();
