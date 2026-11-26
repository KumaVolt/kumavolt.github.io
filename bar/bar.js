/*
 * The KumaVolt bar: one thin bar across the top of every KumaVolt site (kumavolt.dev,
 * gitchrono.com, encheo.kumavolt.dev, opencookie.kumavolt.dev) with a switcher to the others.
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
    {
      name: 'OpenCookie',
      host: 'opencookie.kumavolt.dev',
      url: 'https://opencookie.kumavolt.dev/',
      line: 'A cookie banner, scanner and consent log you host yourself',
      icon: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#231b15"/><path d="M16 6.5a9.5 9.5 0 1 0 9.4 10.9 3.2 3.2 0 0 1-3.9-3.4 3.2 3.2 0 0 1-3.6-3.9A3.2 3.2 0 0 1 16 6.5Z" fill="#f4c542"/><circle cx="12.4" cy="13.6" r="1.5" fill="#231b15"/><circle cx="17.6" cy="20" r="1.5" fill="#231b15"/><circle cx="12" cy="19.6" r="1.1" fill="#231b15"/></svg>',
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

    /* The switcher: a drawer from the left, with one row per project sliding in after the
       one above it. */
    .scrim { position: fixed; inset: 0; background: rgba(8, 8, 10, .55); opacity: 0; visibility: hidden;
      transition: opacity .2s ease, visibility 0s linear .2s; }
    .drawer { position: fixed; top: 0; left: 0; bottom: 0; width: min(380px, 100vw); overflow-y: auto;
      background: #17171a; border-right: 1px solid #2a2a30; box-shadow: 24px 0 60px rgba(0, 0, 0, .45);
      transform: translateX(-100%); visibility: hidden;
      transition: transform .28s cubic-bezier(.2, .8, .2, 1), visibility 0s linear .28s; }
    .open .scrim { opacity: 1; visibility: visible; transition: opacity .2s ease; }
    .open .drawer { transform: none; visibility: visible; transition: transform .28s cubic-bezier(.2, .8, .2, 1); }
    .head { height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px 0 18px; }
    .head .brandline { display: inline-flex; align-items: center; gap: 8px; font-weight: 650; font-size: 15px; }
    .close { width: 38px; height: 38px; border-radius: 10px; border: 0; background: #232328; color: #d8d8dc;
      display: grid; place-items: center; cursor: pointer; }
    .close:hover { background: #2c2c32; }
    .close svg { width: 16px; height: 16px; }
    .drawer p { margin: 0 18px 12px; color: #8d8d95; font-size: 13px; }
    ul { list-style: none; margin: 0; padding: 0 12px 18px; display: flex; flex-direction: column; gap: 8px; }
    li { opacity: 0; transform: translateX(-18px); }
    .open li { opacity: 1; transform: none;
      transition: opacity .3s ease, transform .38s cubic-bezier(.2, .8, .2, 1);
      transition-delay: calc(90ms + var(--i) * 70ms); }
    li a { display: flex; align-items: center; gap: 14px; padding: 12px 12px; border-radius: 12px;
      background: #1f1f23; border: 1px solid transparent; }
    li a:hover { background: #26262b; border-color: #34343b; }
    li a[aria-current="page"] { border-color: #3a3a42; }
    .ic { flex: none; }
    .ic svg { width: 44px; height: 44px; display: block; }
    .txt { display: flex; flex-direction: column; min-width: 0; }
    .name { font-weight: 650; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .tag { font-size: 11px; font-weight: 600; color: #141416; background: #c9c9cf; border-radius: 999px; padding: 1px 7px; }
    .line { color: #a7a7ae; font-size: 13px; font-weight: 400; }
    .host { color: #75757d; font-size: 12px; font-weight: 400; }
    @media (max-width: 640px) {
      .current, .sep { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .scrim, .drawer, .open .drawer, li, .open li, .chev { transition: none; }
      li { transform: none; }
    }
  `;

  const bolt = '<svg viewBox="0 0 24 24"><path d="M13.5 2 4 13.5h6.5L9.5 22 20 9.5h-6.6z" fill="#f2f2f4"/></svg>';
  const chev = '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const cross = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9m0-9-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const github = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"/></svg>';

  class KumaVoltBar extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: 'open' });
      const mine = PRODUCTS.find((p) => p.host === here);
      const cards = PRODUCTS.map((p, i) => `
        <li style="--i:${i}"><a href="${link(p, i)}"${p === mine ? ' aria-current="page"' : ''}>
          <span class="ic">${p.icon}</span>
          <span class="txt">
            <span class="name">${p.name}${p === mine ? '<span class="tag">You\'re here</span>' : ''}</span>
            <span class="line">${p.line}</span>
            <span class="host">${p.host}</span>
          </span>
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
        <div class="layer">
          <div class="scrim"></div>
          <nav class="drawer" id="kv-panel" aria-label="KumaVolt projects">
            <div class="head">
              <span class="brandline"><span class="mark">${bolt}</span>KumaVolt</span>
              <button class="close" type="button" aria-label="Close">${cross}</button>
            </div>
            <p>Open-source apps by KumaVolt</p>
            <ul>${cards}</ul>
          </nav>
        </div>`;

      const button = root.querySelector('.switch');
      const layer = root.querySelector('.layer');
      const close = root.querySelector('.close');
      const isOpen = () => layer.classList.contains('open');
      const setOpen = (open) => {
        if (open === isOpen()) return;
        button.setAttribute('aria-expanded', String(open));
        layer.classList.toggle('open', open);
        document.documentElement.style.overflow = open ? 'hidden' : '';
        if (open) setTimeout(() => close.focus({ preventScroll: true }), 50);
        else button.focus({ preventScroll: true });
      };
      button.addEventListener('click', () => setOpen(!isOpen()));
      close.addEventListener('click', () => setOpen(false));
      root.querySelector('.scrim').addEventListener('click', () => setOpen(false));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }
  }

  customElements.define('kumavolt-bar', KumaVoltBar);
})();
