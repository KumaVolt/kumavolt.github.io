/*
 * The terminal on kumavolt.dev works: after the irb transcript there's a shell prompt with a
 * small pretend home folder. ls, cd, cat, open, Tab completion, history (↑/↓), Ctrl+C, Ctrl+L.
 * To add a folder or file, add it to HOME below.
 *
 * It's also full of easter eggs (EGGS below; `eggs` shows what a visitor has found). Commands
 * that take a while run as a job: the prompt hides until the job ends, and q, Esc, Ctrl+C or a
 * click stops it. The full-window ones (sl, cmatrix, aafire, hollywood, telnet) draw on a canvas
 * laid over the output. The three window buttons close, minimize and full-screen the terminal.
 */
(function () {
  var body = document.querySelector('.terminal-body');
  var input = document.getElementById('term-input');
  var out = document.getElementById('term-out');
  var cwdLabel = document.getElementById('term-cwd');
  if (!body || !input || !out) return;
  var term = body.closest('.terminal');
  var termLine = body.querySelector('.term-line');
  var titleEl = term.querySelector('.terminal-title');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var site = function (url, medium) {
    return url + '?utm_source=kumavolt.dev&utm_medium=terminal' + (medium ? '&utm_content=' + medium : '');
  };

  var dir = function (children, extra) { return Object.assign({ type: 'dir', children: children }, extra || {}); };
  var file = function (text, extra) { return Object.assign({ type: 'file', text: text }, extra || {}); };
  var link = function (url, label) { return { type: 'link', url: url, label: label }; };

  var HOME = dir({
    'about.txt': file(
      'Miquel de la Fuente, aka KumaVolt.\n' +
      'Application developer at Brightness Group in Hoofddorp since 2017.\n' +
      'Builds open-source apps outside of work: GitChrono, Encheo and OpenCookie.\n' +
      'Likes code, anime, music, games, making games and cinematography.'),
    projects: dir({
      gitchrono: dir({
        'README.md': file(
          '# GitChrono\n' +
          'A fast, native Git client for macOS, Windows and Linux. A colorful commit\n' +
          'graph, line-by-line staging and diffs, GPU-rendered with gpui.\n\n' +
          'open website   gitchrono.com\n' +
          'open source    github.com/KumaVolt/GitChrono'),
        website: link(site('https://gitchrono.com/', 'gitchrono'), 'gitchrono.com'),
        source: link('https://github.com/KumaVolt/GitChrono', 'github.com/KumaVolt/GitChrono'),
      }, { url: site('https://gitchrono.com/', 'gitchrono'), label: 'gitchrono.com' }),
      encheo: dir({
        'README.md': file(
          '# Encheo\n' +
          'One media player for Plex, Jellyfin, Emby and the files on your network,\n' +
          'on Windows, macOS, Linux, Android and Google TV. Plays every file as it is,\n' +
          'up to 4K HDR.\n\n' +
          'open website   encheo.kumavolt.dev\n' +
          'open source    github.com/KumaVolt/encheo'),
        website: link(site('https://encheo.kumavolt.dev/', 'encheo'), 'encheo.kumavolt.dev'),
        source: link('https://github.com/KumaVolt/encheo', 'github.com/KumaVolt/encheo'),
      }, { url: site('https://encheo.kumavolt.dev/', 'encheo'), label: 'encheo.kumavolt.dev' }),
      opencookie: dir({
        'README.md': file(
          '# OpenCookie\n' +
          'A cookie banner, cookie scanner and consent log you host yourself, for as\n' +
          'many sites as you like. One Docker container, rules per country, no banner\n' +
          'when a site sets no cookies that need consent.\n\n' +
          'open website   opencookie.kumavolt.dev\n' +
          'open source    github.com/KumaVolt/opencookie'),
        website: link(site('https://opencookie.kumavolt.dev/', 'opencookie'), 'opencookie.kumavolt.dev'),
        source: link('https://github.com/KumaVolt/opencookie', 'github.com/KumaVolt/opencookie'),
      }, { url: site('https://opencookie.kumavolt.dev/', 'opencookie'), label: 'opencookie.kumavolt.dev' }),
    }),
    links: dir({
      github: link('https://github.com/KumaVolt', 'github.com/KumaVolt'),
      linkedin: link('https://www.linkedin.com/in/miquel-de-la-fuente/', 'linkedin.com/in/miquel-de-la-fuente'),
      email: link('mailto:mfuente@kumavolt.dev', 'mfuente@kumavolt.dev'),
    }),
    'todo.txt': file(
      '[x] learn Rust\n' +
      '[x] ship GitChrono\n' +
      '[x] ship Encheo\n' +
      '[x] ship OpenCookie\n' +
      '[ ] stop starting new side projects\n' +
      '[ ] exit vim\n' +
      '[ ] sleep', { date: 'Nov 25 23:59' }),
    '.secret': file('↑ ↑ ↓ ↓ ← → ← → B A\n(somewhere on this page, not in here)',
      { perms: '-rw-------', date: 'Jan  1  1970' }),
    '.zshrc': file(
      '# ~/.zshrc\n' +
      'export EDITOR=vim                # good luck\n' +
      'alias ll=\'ls -la\'\n' +
      'alias please=\'sudo\'\n' +
      'alias matrix=\'cmatrix\'\n' +
      'alias hack=\'hollywood\'\n' +
      'alias fire=\'aafire\'\n\n' +
      '# commands that are not on the help list:\n' +
      '#   sl, fortune, neofetch, apt moo, telnet towel.blinkenlights.nl, ...', { date: 'Nov 26 09:12' }),
    '.ssh': dir({
      'id_ed25519': file('', { perms: '-rw-------', secret: true, size: 411, date: 'Mar 14  2023' }),
      'known_hosts': file('github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5… (the usual)', { date: 'Nov 26 09:41' }),
    }, { perms: 'drwx------', date: 'Mar 14  2023' }),
  });

  var COMMANDS = {
    help: 'show this list',
    ls: 'list a folder (ls -la shows everything)',
    cd: 'change folder',
    pwd: 'show the current folder',
    cat: 'show a file',
    open: 'open a project, link or file',
    tail: 'read the system log (tail -n 100, tail -f)',
    df: 'disk usage (df -h)',
    ping: 'ping a host',
    date: 'show the date',
    eggs: 'how many easter eggs you have found',
    clear: 'clear the screen',
    whoami: 'who you are here',
    echo: 'print text',
  };
  var HIDDEN_COMMANDS = ['sudo', 'exit', 'irb', 'rm', 'vim', 'nano', 'history', 'sl', 'apt', 'cmatrix', 'aafire',
    'hollywood', 'telnet', 'neofetch', 'fortune', 'cowsay', 'git', 'cargo', 'make', 'brew', 'uname', 'uptime',
    'hostname', 'id', 'man', 'weather'];

  // Each easter egg and the hint `eggs` gives while it's still hidden.
  var EGGS = {
    sl: 'Mistype the most common command there is.',
    moo: 'Debian\'s package manager has super cow powers.',
    cmatrix: 'Follow the white rabbit.',
    aafire: 'Light a fire. In ASCII art.',
    hollywood: 'Look busy, like a movie hacker.',
    telnet: 'Telnet to a famous towel.',
    neofetch: 'Show off the system specs.',
    fortune: 'Ask what the future holds.',
    cowsay: 'Let an animal say something.',
    blame: 'Ask git who wrote this.',
    make: 'make something a compiler can\'t.',
    coffee: 'Brew a hot drink.',
    xyzzy: 'A magic word from a very old cave adventure.',
    forkbomb: ':(){ … };:',
    sudo: 'Ask for superpowers.',
    sandwich: 'Ask for a sandwich. Then ask with authority.',
    rm: 'Delete everything. What could go wrong?',
    vim: 'Open an editor and try to get out again.',
    exit: 'Try to leave.',
    konami: 'Read the hidden file in the home folder.',
    window: 'Those three colored dots work.',
    ssh: 'Look at a private key.',
  };
  var EGG_IDS = Object.keys(EGGS);

  var cwd = [];               // path from ~, e.g. ['projects', 'encheo']
  var history = [];
  var historyAt = 0;
  var job = null;             // the command that's running, if any

  // ---------- paths ----------
  var nodeAt = function (parts) {
    var node = HOME;
    for (var i = 0; i < parts.length; i++) {
      if (!node || node.type !== 'dir' || !Object.prototype.hasOwnProperty.call(node.children, parts[i])) return null;
      node = node.children[parts[i]];
    }
    return node;
  };
  var resolve = function (path) {
    if (path === undefined || path === '') return cwd.slice();
    var parts = path.charAt(0) === '/' || path.charAt(0) === '~' ? [] : cwd.slice();
    path.replace(/^~\/?/, '').split('/').forEach(function (p) {
      if (!p || p === '.') return;
      if (p === '..') parts.pop(); else parts.push(p);
    });
    return parts;
  };
  var pretty = function (parts) { return parts.length ? '~/' + parts.join('/') : '~'; };

  // ---------- output ----------
  // The window keeps the height it opened with: new output scrolls inside it instead of
  // pushing the rest of the page down.
  var lockHeight = function () {
    if (!body.style.height) body.style.height = getComputedStyle(body).height;
  };
  var scrollDown = function () { body.scrollTop = body.scrollHeight; };
  var span = function (text, cls) {
    var s = document.createElement('span');
    if (cls) s.className = cls;
    s.textContent = text;
    return s;
  };
  var line = function () {
    var l = document.createElement('span');
    l.className = 'term-printed';
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      l.appendChild(typeof a === 'string' ? document.createTextNode(a) : a);
    }
    l.appendChild(document.createTextNode('\n'));
    out.appendChild(l);
    return l;
  };
  var lines = function (text, cls) { text.split('\n').forEach(function (t) { line(cls ? span(t, cls) : t); }); };
  var echoPrompt = function (cmd) {
    line(span('miquel@kumavolt', 'user'), ' ', span(pretty(cwd), 'path'), ' % ', cmd);
  };
  var anchor = function (url, text) {
    var a = document.createElement('a');
    a.href = url;
    a.textContent = text;
    if (url.indexOf('mailto:') !== 0) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  };
  var pad = function (s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; };
  var padEnd = function (s, n) { s = String(s); while (s.length < n) s += ' '; return s; };
  var pick = function (list) { return list[Math.floor(Math.random() * list.length)]; };
  var hex = function (n) { var s = ''; while (s.length < n) s += Math.floor(Math.random() * 16).toString(16); return s; };

  var listing = function (node, showHidden) {
    var names = Object.keys(node.children).filter(function (n) { return showHidden || n.charAt(0) !== '.'; }).sort();
    if (showHidden) names = ['.', '..'].concat(names);
    var l = document.createElement('span');
    l.className = 'term-printed';
    names.forEach(function (n, i) {
      var child = node.children[n];
      var isDir = n === '.' || n === '..' || child.type === 'dir';
      l.appendChild(span(isDir ? n + '/' : n, isDir ? 'path' : child.type === 'link' ? 'str' : null));
      if (i < names.length - 1) l.appendChild(document.createTextNode('  '));
    });
    l.appendChild(document.createTextNode('\n'));
    out.appendChild(l);
  };

  // ls -l: permissions, owner, size and date, like macOS prints them.
  var stat = function (node) {
    var kids = node.type === 'dir' ? Object.keys(node.children) : [];
    return {
      perms: node.perms || (node.type === 'dir' ? 'drwxr-xr-x' : node.type === 'link' ? 'lrwxr-xr-x' : '-rw-r--r--'),
      links: node.type === 'dir' ? 2 + kids.filter(function (k) { return node.children[k].type === 'dir'; }).length : 1,
      owner: node.owner || 'miquel',
      size: node.size || (node.type === 'dir' ? 64 + 32 * kids.length : node.type === 'link' ? node.label.length : node.text.length),
      date: node.date || 'Nov 26 09:41',
    };
  };
  var longListing = function (node, parts, showHidden) {
    var rows = Object.keys(node.children).filter(function (n) { return showHidden || n.charAt(0) !== '.'; }).sort()
      .map(function (n) { return { name: n, node: node.children[n] }; });
    if (showHidden) {
      var parent = parts.length ? nodeAt(parts.slice(0, -1))
        : dir({ Shared: dir({}), miquel: dir({}), guest: dir({}) }, { owner: 'root', date: 'Feb  1  2017' });
      rows = [{ name: '.', node: node }, { name: '..', node: parent }].concat(rows);
    }
    var stats = rows.map(function (r) { return stat(r.node); });
    var w = Math.max.apply(null, stats.map(function (s) { return String(s.size).length; }));
    line('total ' + rows.length * 8);
    rows.forEach(function (r, i) {
      var s = stats[i];
      var t = r.node.type;
      var parts2 = [s.perms + pad(s.links, 4) + ' ' + padEnd(s.owner, 7) + ' staff  ' + pad(s.size, w) + ' ' + s.date + ' ',
        span(r.name, t === 'dir' ? 'path' : t === 'link' ? 'str' : null)];
      if (t === 'link') parts2.push(' -> ', anchor(r.node.url, r.node.label));
      line.apply(null, parts2);
    });
  };

  // ---------- window title: "miquel — zsh — 80×24" with the real size ----------
  var cell = null;
  var measure = function () {
    var ctx = document.createElement('canvas').getContext('2d');
    var cs = getComputedStyle(body);
    ctx.font = cs.fontSize + ' ' + cs.fontFamily;
    cell = { w: ctx.measureText('M').width, h: parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.6 };
  };
  var title = function (name) {
    if (!cell) measure();
    var cs = getComputedStyle(body);
    var cols = Math.floor((body.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / cell.w);
    var rows = Math.floor(body.clientHeight / cell.h);
    titleEl.textContent = 'miquel — ' + name + ' — ' + cols + '×' + rows;
  };
  window.addEventListener('resize', function () { measure(); if (!job) title('zsh'); });

  // ---------- easter eggs ----------
  var eggsFound = [];
  try { eggsFound = JSON.parse(localStorage.getItem('kumavolt.eggs')) || []; } catch (e) { eggsFound = []; }
  var found = function (id) {
    if (eggsFound.indexOf(id) >= 0) return;
    eggsFound.push(id);
    try { localStorage.setItem('kumavolt.eggs', JSON.stringify(eggsFound)); } catch (e) { /* private mode */ }
    line(span('🥚 Easter egg found (' + eggsFound.length + '/' + EGG_IDS.length + '). Type eggs to see your progress.', 'egg'));
    if (window.dataLayer) window.dataLayer.push({ event: 'terminal_egg', terminal_egg: id });
  };
  document.addEventListener('konami', function () { found('konami'); scrollDown(); });

  // ---------- jobs ----------
  var startJob = function (name, opts) {
    job = Object.assign({ name: name, timers: [], stop: null, after: null, keys: null, uninterruptible: false }, opts || {});
    termLine.hidden = true;
    title(name);
    term.focus({ preventScroll: true });
    return job;
  };
  var endJob = function () {
    if (!job) return;
    var j = job;
    job = null;
    j.timers.forEach(clearTimeout);
    if (j.stop) j.stop();
    if (j.after) j.after();
    termLine.hidden = false;
    title('zsh');
    if (!term.hidden) input.focus({ preventScroll: true });
    scrollDown();
  };
  var interrupt = function () {
    if (!job || job.uninterruptible) return;
    line('^C');
    endJob();
  };
  // Runs fn after ms, unless the job was stopped by then.
  var later = function (ms, fn) {
    var j = job;
    j.timers.push(setTimeout(function () { if (job === j) { fn(); scrollDown(); } }, ms));
  };
  // Prints the steps one after another ([delay, text or function]) and ends the job.
  var play = function (name, steps, after) {
    startJob(name, { after: after });
    var at = 0;
    steps.forEach(function (s) {
      at += s[0];
      later(at, typeof s[1] === 'function' ? s[1] : function () { lines(s[1]); });
    });
    later(at + 10, endJob);
  };

  // ---------- full-window animations ----------
  var canvas = document.createElement('canvas');
  canvas.className = 'term-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  term.appendChild(canvas);
  canvas.addEventListener('click', function () { interrupt(); });

  // opts: frame(g) draws one frame and returns false when done; setup(g) runs first; fps;
  // still(g) draws the one frame shown when the visitor prefers reduced motion.
  var animate = function (name, opts) {
    lockHeight();
    startJob(name, { uninterruptible: !!opts.uninterruptible && !reducedMotion, after: opts.after });
    var w = body.clientWidth;
    var h = body.clientHeight;
    var dpr = window.devicePixelRatio || 1;
    canvas.style.top = body.offsetTop + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cs = getComputedStyle(body);
    var fs = parseFloat(cs.fontSize);
    var font = fs + 'px ' + cs.fontFamily;
    ctx.font = font;
    ctx.textBaseline = 'top';
    var cw = ctx.measureText('M').width;
    var ch = Math.round(fs * 1.35);
    var g = {
      ctx: ctx, w: w, h: h, cw: cw, ch: ch, font: font, t: 0, n: 0,
      cols: Math.floor(w / cw), rows: Math.floor(h / ch),
      clear: function (color) { ctx.fillStyle = color || '#0c0c0c'; ctx.fillRect(0, 0, w, h); },
      text: function (s, col, row, color) { ctx.fillStyle = color || '#e6e6e6'; ctx.fillText(s, col * cw, row * ch); },
    };
    g.clear();
    if (opts.setup) opts.setup(g);
    canvas.classList.add('on');

    var raf = 0;
    var running = true;
    job.stop = function () { running = false; cancelAnimationFrame(raf); canvas.classList.remove('on'); };
    if (reducedMotion) {
      g.t = 1;
      g.n = 1;
      (opts.still || opts.frame)(g);
      g.text('Animation paused because reduced motion is on. Press q to quit.', 1, g.rows - 1, '#8a8a8a');
      return;
    }
    var start = 0;
    var last = 0;
    var tick = function (now) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (!start) start = now;
      if (now - last < 1000 / (opts.fps || 30)) return;
      last = now;
      g.t = (now - start) / 1000;
      g.n++;
      if (opts.frame(g) === false) endJob();
    };
    raf = requestAnimationFrame(tick);
  };

  // sl: the steam locomotive you get for typing ls backwards. Ctrl+C doesn't stop it.
  var TRAIN = [
    '         ||                                                    ',
    '  _______||_____        _______________      _______________   ',
    ' |  ____        |  ___ |  []  []  []  |    |  []  []  []  |   ',
    ' | | KV |  ___  |_|   ||               |____|               |   ',
    ' |_|____|_|___|_______||_______________|____|_______________|   ',
    '   (W)  (W)  (W)  (W)    (W)       (W)        (W)       (W)     ',
  ];
  var SMOKE = [
    ['          (@@)   (  )    (@)   ( )    (@@)', '         (  )  (@)', '          (@)'],
    ['          (  )   (@@)    ( )   (@)    (  )', '         (@@)  ( )', '          ( )'],
  ];
  var drawTrain = function (g, x) {
    var top = Math.max(0, Math.floor((g.rows - TRAIN.length - 3) / 2));
    var smoke = SMOKE[Math.floor(g.n / 4) % 2];
    var wheel = '|/-\\'.charAt(g.n % 4);
    smoke.forEach(function (s, i) { g.text(s, x, top + i, '#8a8a8a'); });
    TRAIN.forEach(function (s, i) { g.text(s.replace(/W/g, wheel), x, top + 3 + i, '#e6e6e6'); });
  };
  var sl = function () {
    animate('sl', {
      fps: 24,
      uninterruptible: true,
      setup: function (g) { g.x = g.cols; },
      frame: function (g) {
        g.clear();
        drawTrain(g, g.x);
        g.x -= 1;
        return g.x > -TRAIN[0].length;
      },
      still: function (g) { g.clear(); drawTrain(g, Math.max(0, Math.floor((g.cols - TRAIN[0].length) / 2))); },
      after: function () { found('sl'); },
    });
  };

  // cmatrix: falling green characters.
  var MATRIX = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789KUMAVOLT';
  var cmatrix = function () {
    animate('cmatrix', {
      fps: 22,
      setup: function (g) {
        g.drops = [];
        g.speed = [];
        for (var i = 0; i < g.cols; i++) { g.drops.push(-Math.random() * g.rows * 1.5); g.speed.push(0.4 + Math.random() * 0.8); }
      },
      frame: function (g) {
        g.ctx.fillStyle = 'rgba(12, 12, 12, 0.16)';
        g.ctx.fillRect(0, 0, g.w, g.h);
        for (var i = 0; i < g.cols; i++) {
          var y = Math.floor(g.drops[i]);
          if (y >= 0) {
            g.ctx.fillStyle = '#0c0c0c';
            g.ctx.fillRect(i * g.cw, (y - 1) * g.ch, g.cw, g.ch * 2);
            g.text(MATRIX.charAt(Math.floor(Math.random() * MATRIX.length)), i, y - 1, '#22c55e');
            g.text(MATRIX.charAt(Math.floor(Math.random() * MATRIX.length)), i, y, '#dcffe4');
          }
          g.drops[i] += g.speed[i];
          if (g.drops[i] > g.rows + 4 && Math.random() > 0.9) g.drops[i] = -Math.random() * 8;
        }
      },
      still: function (g) {
        g.clear();
        for (var i = 0; i < g.cols; i += 2) {
          for (var y = 0; y < g.rows; y++) {
            if (Math.random() > 0.55) g.text(MATRIX.charAt(Math.floor(Math.random() * MATRIX.length)), i, y, '#16803c');
          }
        }
      },
      after: function () { found('cmatrix'); },
    });
  };

  // aafire: the classic fire effect, drawn in ASCII.
  var FIRE_CHARS = ' .:-=+*#%@';
  var FIRE_COLORS = [];
  for (var fi = 0; fi <= 36; fi++) {
    var ft = fi / 36;
    FIRE_COLORS.push('rgb(' + Math.round(Math.min(1, ft * 3) * 255) + ',' +
      Math.round(Math.max(0, Math.min(1, ft * 3 - 1)) * 255) + ',' +
      Math.round(Math.max(0, Math.min(1, ft * 3 - 2)) * 255) + ')');
  }
  var spreadFire = function (g) {
    var W = g.cols;
    for (var x = 0; x < W; x++) {
      for (var y = 1; y < g.rows; y++) {
        var src = y * W + x;
        var p = g.fire[src];
        var r = Math.floor(Math.random() * 3);
        var dst = src - r + 1 - W;
        if (dst < 0) continue;
        g.fire[dst] = p ? Math.max(0, p - Math.floor(Math.random() * (2 * g.decay + 1))) : 0;
      }
    }
  };
  var drawFire = function (g) {
    g.clear('#000');
    for (var i = 0; i < g.fire.length; i++) {
      var p = g.fire[i];
      if (p < 2) continue;
      g.text(FIRE_CHARS.charAt(Math.min(FIRE_CHARS.length - 1, Math.floor(p / 36 * FIRE_CHARS.length))),
        i % g.cols, Math.floor(i / g.cols), FIRE_COLORS[p]);
    }
  };
  var aafire = function () {
    animate('aafire', {
      fps: 24,
      setup: function (g) {
        g.fire = [];
        for (var i = 0; i < g.cols * g.rows; i++) g.fire.push(i >= (g.rows - 1) * g.cols ? 36 : 0);
        g.decay = 36 / (g.rows * 0.9) / 1.6;
        if (reducedMotion) for (var k = 0; k < g.rows * 2; k++) spreadFire(g);
      },
      frame: function (g) { spreadFire(g); drawFire(g); },
      still: drawFire,
      after: function () { found('aafire'); },
    });
  };

  // hollywood: four panes of very serious hacking.
  var CODE = [
    'fn bypass_firewall(target: &Host) -> Result<Shell, Error> {',
    '    let key = brute_force(&target.hash, 0x%h)?;',
    '    match decrypt(&payload, &key) {',
    '        Ok(data) => upload(data).await?,',
    '        Err(e) => retry_with_more_coffee(e),',
    '    }',
    '}',
    '',
    'impl Mainframe for KumaVolt {',
    '    fn enhance(&mut self) { self.pixels *= 2; }',
    '    unsafe { ptr::write(0x%h as *mut u8, 0x42) }',
    '}',
    'for node in proxy_chain.iter().rev() { node.reroute()?; }',
    'let entropy = rand::random::<u128>() ^ 0x%h;',
    '#[derive(Debug, Stealth)]',
    'struct Payload<\'a> { bytes: &\'a [u8], encrypted: bool }',
    '// TODO: delete before anyone reads this',
    'println!("{}", "ACCESS GRANTED");',
  ];
  var TASKS = ['bypassing firewall', 'decrypting mainframe', 'compiling GitChrono', 'downloading more RAM',
    'enhancing image', 'rerouting proxies', 'reversing the polarity', 'cracking wifi', 'brewing coffee',
    'deleting the logs', 'tracing IP address'];
  var BLOCKS = '▁▂▃▄▅▆▇█';
  var hollywood = function () {
    animate('hollywood', {
      fps: 12,
      setup: function (g) {
        var hc = Math.floor(g.cols / 2);
        var hr = Math.floor(g.rows / 2);
        g.panes = [
          { x: 0, y: 0, w: hc, h: hr }, { x: hc, y: 0, w: g.cols - hc, h: hr },
          { x: 0, y: hr, w: hc, h: g.rows - hr }, { x: hc, y: hr, w: g.cols - hc, h: g.rows - hr },
        ];
        g.code = [];
        g.dump = [];
        g.tasks = [];
        g.cpu = [[], [], [], []];
        g.ci = 0;
      },
      frame: function (g) {
        var ctx = g.ctx;
        g.clear();
        var pane = function (p, name, rows, color) {
          ctx.strokeStyle = '#3a3a3a';
          ctx.strokeRect(p.x * g.cw + 4, p.y * g.ch + g.ch / 2, p.w * g.cw - 8, p.h * g.ch - g.ch / 2 - 2);
          ctx.fillStyle = '#0c0c0c';
          ctx.fillRect((p.x + 2) * g.cw, p.y * g.ch, (name.length + 2) * g.cw, g.ch);
          g.text(' ' + name + ' ', p.x + 2, p.y, '#8a8a8a');
          var max = p.h - 2;
          rows = rows.slice(-max);
          for (var r = 0; r < rows.length; r++) {
            var row = rows[r];
            g.text((row.text || row).slice(0, p.w - 4), p.x + 2, p.y + 1 + r, row.color || color);
          }
        };

        g.code.push(CODE[g.ci++ % CODE.length].replace('%h', hex(8)));
        pane(g.panes[0], 'src/mainframe.rs', g.code, '#9fe870');

        var bytes = [];
        var ascii = '';
        for (var b = 0; b < 8; b++) {
          var v = Math.floor(Math.random() * 256);
          bytes.push((v < 16 ? '0' : '') + v.toString(16));
          ascii += v > 32 && v < 127 ? String.fromCharCode(v) : '.';
        }
        g.dump.push('0x' + hex(8) + '  ' + bytes.join(' ') + '  |' + ascii + '|');
        pane(g.panes[1], 'memory', g.dump, '#6cb6ff');

        while (g.tasks.length < g.panes[2].h - 2) g.tasks.push({ name: pick(TASKS), p: 0 });
        g.tasks.forEach(function (t, i) {
          if (t.p >= 100) { if (Math.random() > 0.9) g.tasks[i] = { name: pick(TASKS), p: 0 }; return; }
          t.p = Math.min(100, t.p + Math.random() * 7);
        });
        var barW = Math.max(6, Math.min(20, g.panes[2].w - 36));
        pane(g.panes[2], 'jobs', g.tasks.map(function (t) {
          var filled = Math.round(t.p / 100 * barW);
          return {
            text: padEnd(t.name, 24) + '[' + new Array(filled + 1).join('#') + new Array(barW - filled + 1).join('.') + '] ' + pad(Math.floor(t.p), 3) + '%',
            color: t.p >= 100 ? '#22c55e' : '#e6e6e6',
          };
        }), '#e6e6e6');

        var sparkW = Math.max(8, g.panes[3].w - 12);
        g.cpu.forEach(function (c) { c.push(Math.floor(Math.random() * BLOCKS.length)); if (c.length > sparkW) c.shift(); });
        var mon = g.cpu.map(function (c, i) {
          return { text: 'cpu' + i + '  ' + c.map(function (v) { return BLOCKS.charAt(v); }).join(''), color: '#f0a35e' };
        });
        mon.push('');
        mon.push('net   ↑ ' + (Math.random() * 99).toFixed(2) + ' Gb/s  ↓ ' + (Math.random() * 99).toFixed(2) + ' Gb/s');
        mon.push('target  kumavolt.dev');
        mon.push({ text: 'status  ' + (g.n % 8 < 5 ? 'INFILTRATING' : ''), color: '#ff5f57' });
        pane(g.panes[3], 'system', mon, '#e6e6e6');

        if (g.t % 8 > 6) {
          var msg = 'ACCESS GRANTED';
          ctx.font = 'bold ' + Math.round(g.ch * 1.6) + 'px ' + g.font.replace(/^[\d.]+px /, '');
          var mw = ctx.measureText(msg).width;
          var bx = (g.w - mw) / 2 - 24;
          var by = g.h / 2 - g.ch * 1.6;
          ctx.fillStyle = '#0c0c0c';
          ctx.fillRect(bx, by, mw + 48, g.ch * 3.2);
          ctx.strokeStyle = '#22c55e';
          ctx.strokeRect(bx, by, mw + 48, g.ch * 3.2);
          ctx.fillStyle = '#22c55e';
          ctx.fillText(msg, bx + 24, by + g.ch * 0.8);
          ctx.font = g.font;
        }
      },
      after: function () { found('hollywood'); },
    });
  };

  // telnet towel.blinkenlights.nl: an (original) opening crawl.
  var CRAWL = [
    'EPISODE XVII', 'THE BORROW CHECKER STRIKES BACK', '',
    'Deep in the Netherlands, a lone', 'developer builds tools in Rust', 'long after office hours.', '',
    'A Git client that draws 85,000', 'commits without breaking a sweat.', 'A media player that plays',
    'everything, everywhere, in 4K HDR.', 'A cookie banner that knows', 'when to stay quiet.', '',
    'But the borrow checker is never', 'satisfied. Lifetimes clash,', 'traits go unimplemented, and', 'the coffee is running',
    'dangerously low....',
  ];
  var drawCrawl = function (g, offset) {
    g.clear('#000');
    g.stars.forEach(function (s) { g.text('.', s[0], s[1], '#555'); });
    CRAWL.forEach(function (text, i) {
      var y = g.rows - offset + i * 1.4;
      if (y < -1 || y > g.rows) return;
      g.ctx.globalAlpha = Math.max(0, Math.min(1, y / 4));
      g.ctx.fillStyle = '#ffe81f';
      g.ctx.fillText(text, (g.w - g.ctx.measureText(text).width) / 2, y * g.ch);
    });
    g.ctx.globalAlpha = 1;
  };
  var telnet = function () {
    animate('telnet', {
      fps: 30,
      setup: function (g) {
        g.stars = [];
        for (var i = 0; i < g.cols * g.rows / 40; i++) g.stars.push([Math.floor(Math.random() * g.cols), Math.floor(Math.random() * g.rows)]);
      },
      frame: function (g) {
        if (g.t < 4) {
          g.clear('#000');
          var intro = 'A long time ago, in a browser far, far away....';
          g.ctx.globalAlpha = Math.min(1, g.t, 4 - g.t);
          g.ctx.fillStyle = '#4bd5ee';
          g.ctx.fillText(intro, (g.w - g.ctx.measureText(intro).width) / 2, g.h / 2 - g.ch);
          g.ctx.globalAlpha = 1;
          return;
        }
        var offset = (g.t - 4) * 1.6;
        drawCrawl(g, offset);
        return g.rows - offset + CRAWL.length * 1.4 > -1;
      },
      still: function (g) { drawCrawl(g, g.rows * 0.8); },
      after: function () { line('Connection closed by foreign host.'); found('telnet'); },
    });
  };

  // ---------- vim: easy to get into ----------
  var vimBox = document.createElement('div');
  vimBox.className = 'term-vim';
  vimBox.hidden = true;
  term.appendChild(vimBox);
  var vim = function (name) {
    var node = name ? nodeAt(resolve(name)) : null;
    var text = node && node.type === 'file' && !node.secret ? node.text : '';
    var content = text ? text.split('\n') : [''];
    var status = name ? '"' + name + '" ' + (node ? content.length + 'L, ' + text.length + 'B' : '[New]') : '';
    var cmd = null;
    var insert = false;
    var z = false;
    lockHeight();
    startJob('vim');
    vimBox.style.top = body.offsetTop + 'px';
    vimBox.style.height = body.clientHeight + 'px';
    vimBox.hidden = false;
    var rows = Math.max(6, Math.floor((body.clientHeight - 32) / (cell ? cell.h : 22)) - 1);
    var render = function () {
      vimBox.textContent = '';
      for (var r = 0; r < rows; r++) {
        vimBox.appendChild(r < content.length ? document.createTextNode(content[r]) : span('~', 'tilde'));
        vimBox.appendChild(document.createTextNode('\n'));
      }
      vimBox.appendChild(cmd !== null ? document.createTextNode(':' + cmd) : span(insert ? '-- INSERT --' : status, insert ? 'bold' : null));
    };
    var quit = function () {
      vimBox.hidden = true;
      job.after = function () { line('You got out of vim. Not everyone does.'); found('vim'); };
      endJob();
    };
    var exec = function (c) {
      c = c.trim();
      cmd = null;
      if (/^(q|q!|qa|qa!|wq|wq!|x|x!|wqa|qall)$/.test(c)) return quit();
      if (c === 'w' || c === 'w!') status = 'E45: \'readonly\' option is set (this is a website)';
      else if (c === 'help') status = 'E149: Sorry, no help here. You are on your own.';
      else if (c === '') status = '';
      else status = 'E492: Not an editor command: ' + c;
      render();
    };
    job.keys = function (e) {
      var k = e.key;
      if (k === 'Shift' || k === 'Meta' || k === 'Alt' || k === 'Control') return;
      e.preventDefault();
      if (e.ctrlKey && (k === 'c' || k === 'C')) {
        cmd = null;
        insert = false;
        status = 'Type  :qa!  and press <Enter> to abandon all changes and exit Vim';
      } else if (cmd !== null) {
        if (k === 'Escape') cmd = null;
        else if (k === 'Enter') return exec(cmd);
        else if (k === 'Backspace') { if (cmd) cmd = cmd.slice(0, -1); else cmd = null; }
        else if (k.length === 1) cmd += k;
      } else if (insert) {
        if (k === 'Escape') { insert = false; status = ''; }
      } else if (k === ':') {
        cmd = '';
      } else if (k === 'i' || k === 'a' || k === 'o') {
        insert = true;
      } else if (k === 'Z') {
        if (z) return quit();
        z = true;
        return;
      }
      z = false;
      render();
    };
    render();
  };
  // On a phone there's no Esc key: a tap gets you out.
  vimBox.addEventListener('click', function () {
    if (!job || !job.keys) return;
    vimBox.hidden = true;
    job.after = function () { line('Tapped your way out of vim. That counts.'); found('vim'); };
    endJob();
  });

  // ---------- ASCII art ----------
  var MOO = [
    '           ^__^',
    '   _______/ oo \\',
    '  /      (  ..  )',
    ' / |      \\____/',
    '*  ||----||',
    '   ^^    ^^',
    '...."Have you mooed today?"...',
  ];
  var BEAR = [
    '  ()_____()  ',
    ' /  o   o  \\ ',
    '(     ^     )',
    ' \\  \\___/  / ',
    '  \\_______/  ',
    '  /       \\  ',
    ' (_/     \\_) ',
  ];
  var bearSay = function (text) {
    var words = text.split(/\s+/);
    var rows = [''];
    words.forEach(function (w) {
      if ((rows[rows.length - 1] + ' ' + w).trim().length > 36) rows.push(w);
      else rows[rows.length - 1] = (rows[rows.length - 1] + ' ' + w).trim();
    });
    var width = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    line(' ' + new Array(width + 3).join('_'));
    rows.forEach(function (r, i) {
      var l = rows.length === 1 ? '<>' : i === 0 ? '/\\' : i === rows.length - 1 ? '\\/' : '||';
      line(l.charAt(0) + ' ' + padEnd(r, width) + ' ' + l.charAt(1));
    });
    line(' ' + new Array(width + 3).join('-'));
    line('     \\');
    line('      \\');
    BEAR.forEach(function (b) { line('       ' + b); });
  };
  var FORTUNES = [
    'The borrow checker is not your enemy. It is a very strict friend.',
    'A commit a day keeps the merge conflicts away. Mostly.',
    'It compiled on the first try. Be suspicious.',
    'You will find a bug today. It will be yours.',
    'Today is a good day to delete code.',
    'Your next side project will be "just a small one".',
    'Not every easter egg on this site is on the help list.',
    'git push --force is a lifestyle choice. A bad one.',
    'Weekend forecast: 100% chance of side projects.',
    'Rewrite it in Rust? Already done.',
  ];

  // ---------- the system log, for tail ----------
  var LOG = [
    function (r) { return 'gitchrono[2231]: drew the commit graph (' + (84000 + Math.floor(r * 9000)) + ' commits) in ' + (8 + Math.floor(r * 9)) + ' ms'; },
    function () { return 'encheo[3108]: direct play: 4K HDR, no transcoding'; },
    function () { return 'opencookie[1312]: no cookies that need consent, banner skipped'; },
    function (r) { return 'rustc[' + (4000 + Math.floor(r * 999)) + ']: warning: unused variable: `sleep`'; },
    function (r) { return 'borrowck[' + (4000 + Math.floor(r * 999)) + ']: error[E0499]: cannot borrow `time` as mutable more than once'; },
    function (r) { return 'coffee[42]: mug refilled (' + (1 + Math.floor(r * 6)) + ' today)'; },
    function () { return 'kernel[0]: brain: caffeine low, throttling to 80%'; },
    function (r) { return 'cargo[' + (4000 + Math.floor(r * 999)) + ']: Finished `release` profile [optimized] in ' + (r * 40).toFixed(2) + 's'; },
    function () { return 'git[5150]: pushed 1 commit to origin/main'; },
    function () { return 'anime[777]: next episode starts in 5 seconds'; },
    function (r) { return 'brain[1]: new side project idea queued (#' + (100 + Math.floor(r * 900)) + ')'; },
    function () { return 'cron[88]: reminder: drink some water'; },
    function () { return 'konami[1987]: still waiting for ↑ ↑ ↓ ↓ ← → ← → B A'; },
    function () { return 'gitchrono[2231]: fetched origin in 0.3s'; },
  ];
  var logTotal = 4242;
  var seeded = function (i, k) { var x = Math.sin(i * 9301 + k * 49297) * 233280; return x - Math.floor(x); };
  var logLine = function (i) {
    var d = new Date(Date.now() - (logTotal - i) * 23000);
    var stamp = d.toLocaleDateString('en-US', { month: 'short' }) + ' ' + pad(d.getDate(), 2) + ' ' + d.toLocaleTimeString('en-GB', { hour12: false });
    return stamp + ' kumavolt ' + LOG[Math.floor(seeded(i, 1) * LOG.length)](seeded(i, 2));
  };

  // ---------- commands ----------
  var openNode = function (node, name) {
    var url = node.url;
    if (!url) {
      if (node.type === 'file') return line(span(node.text));
      return line('open: ' + name + ': nothing to open here. Try ', span('ls ' + name, 'key'), '.');
    }
    line('Opening ', anchor(url, node.label || url), ' …');
    if (url.indexOf('mailto:') === 0) location.href = url; else window.open(url, '_blank', 'noopener');
  };

  var distance = function (a, b) {
    var d = [];
    for (var i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (var j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[a.length][b.length];
  };

  var rmEverything = function () {
    var paths = ['/Applications', '/Library', '/System', '/Users/miquel/projects/gitchrono', '/Users/miquel/projects/encheo',
      '/Users/miquel/projects/opencookie', '/Users/miquel/.ssh', '/Users/miquel/todo.txt', '/bin/zsh'];
    var steps = paths.map(function (p) { return [140, 'removed ' + p]; });
    steps.push([900, function () { line(span('rm: /: Permission denied', 'sym')); }]);
    steps.push([500, 'Just kidding. It\'s a website. Nothing was harmed.']);
    play('rm', steps, function () { found('rm'); });
  };

  var run = function (raw) {
    lockHeight();
    var text = raw.trim();
    echoPrompt(raw);
    if (!text) return;
    history.push(text);
    historyAt = history.length;
    var args = text.split(/\s+/);
    var cmd = args.shift();
    if (window.dataLayer) window.dataLayer.push({ event: 'terminal_command', terminal_command: cmd.slice(0, 20) });

    if (text.replace(/\s/g, '') === ':(){:|:&};:') {
      line('zsh: fork failed: resource temporarily unavailable');
      line(span('Nice try. This browser tab can only take so much.', 'dim'));
      return found('forkbomb');
    }
    if (/^make me a sandwich$/i.test(text)) return line('What? Make it yourself.');
    if (/^sudo make me a sandwich$/i.test(text)) { line('Okay.'); return found('sandwich'); }

    var aliases = { please: 'sudo', matrix: 'cmatrix', hack: 'hollywood', fire: 'aafire', vi: 'vim', nvim: 'vim', fastfetch: 'neofetch', 'apt-get': 'apt' };
    if (aliases[cmd]) cmd = aliases[cmd];

    switch (cmd) {
      case 'help':
        line('Commands:');
        Object.keys(COMMANDS).forEach(function (c) { line('  ', span((c + '        ').slice(0, 8), 'key'), COMMANDS[c]); });
        line(span('Tab completes names, ↑ and ↓ go through what you typed.', 'dim'));
        line(span('There are also ' + EGG_IDS.length + ' easter eggs that aren\'t on this list. Happy hunting.', 'egg'));
        break;
      case 'ls': case 'll': case 'la': {
        var flags = args.filter(function (a) { return a.charAt(0) === '-'; }).join('') + (cmd === 'll' ? 'la' : cmd === 'la' ? 'a' : '');
        var showHidden = /[aA]/.test(flags);
        var target = args.filter(function (a) { return a.charAt(0) !== '-'; })[0];
        var node = nodeAt(resolve(target));
        if (!node) line('ls: ' + target + ': No such file or directory');
        else if (node.type !== 'dir') line(target);
        else if (flags.indexOf('l') >= 0) longListing(node, resolve(target), showHidden);
        else listing(node, showHidden);
        break;
      }
      case 'cd': {
        var parts = resolve(args[0] || '~');
        var to = nodeAt(parts);
        if (!to) line('cd: no such file or directory: ' + args[0]);
        else if (to.type !== 'dir') line('cd: not a directory: ' + args[0]);
        else { cwd = parts; cwdLabel.textContent = pretty(cwd); }
        break;
      }
      case 'pwd':
        line('/Users/miquel' + (cwd.length ? '/' + cwd.join('/') : ''));
        break;
      case 'cat': case 'less': case 'more': {
        if (!args[0]) { line(cmd + ': which file? Try ', span('cat about.txt', 'key')); break; }
        var f = nodeAt(resolve(args[0]));
        if (!f) line(cmd + ': ' + args[0] + ': No such file or directory');
        else if (f.type === 'dir') line(cmd + ': ' + args[0] + ': Is a directory');
        else if (f.type === 'link') line(anchor(f.url, f.label));
        else if (f.secret) { line(cmd + ': ' + args[0] + ': Permission denied'); line(span('Nice try. 😏', 'dim')); found('ssh'); }
        else line(span(f.text));
        break;
      }
      case 'open': {
        var name = args[0] || '.';
        var n = nodeAt(resolve(name));
        // "open encheo" works from anywhere.
        if (!n && HOME.children.projects.children[name]) n = HOME.children.projects.children[name];
        if (!n) line('The file ' + name + ' does not exist.');
        else openNode(n, name);
        break;
      }
      case 'clear':
        out.textContent = '';
        body.querySelectorAll('.term-history').forEach(function (el) { el.hidden = true; });
        break;
      case 'whoami':
        line('guest. Miquel is the one in ', span('about.txt', 'key'), '.');
        break;
      case 'id':
        line('uid=501(guest) gid=20(staff) groups=20(staff),12(everyone),1337(easter-eggs)');
        break;
      case 'echo':
        line(args.join(' ').replace(/\$(USER|HOME|SHELL|PWD|EDITOR)\b/g, function (m, v) {
          return { USER: 'guest', HOME: '/Users/miquel', SHELL: '/bin/zsh', PWD: '/Users/miquel' + (cwd.length ? '/' + cwd.join('/') : ''), EDITOR: 'vim' }[v];
        }));
        break;
      case 'history':
        history.forEach(function (h, i) { line('  ' + (i + 1) + '  ' + h); });
        break;
      case 'date': {
        var d = new Date();
        line(d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short' }) + ' ' +
          pad(d.getDate(), 2) + ' ' + d.toLocaleTimeString('en-GB', { hour12: false }) + ' ' + d.getFullYear());
        break;
      }
      case 'uptime': {
        var days = Math.floor((Date.now() - new Date(2017, 1, 1)) / 864e5);
        line(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + '  up ' + days +
          ' days (coding since February 2017), 1 user, load averages: 4.20 1.33 0.42');
        break;
      }
      case 'uname':
        line(args[0] === '-a' ? 'Darwin kumavolt.dev 25.1.0 Darwin Kernel Version 25.1.0: KumaVolt Edition; root:xnu/RELEASE_ARM64 arm64' : 'Darwin');
        break;
      case 'hostname':
        line('kumavolt.dev');
        break;
      case 'df':
        [['Filesystem', 'Size', 'Used', 'Avail', 'Capacity', 'Mounted on'],
          ['/dev/brain', '128Gi', '127Gi', '1.0Gi', '99%', '/'],
          ['/dev/coffee', '500ml', '470ml', '30ml', '94%', '/Volumes/Mug'],
          ['/dev/ideas', '∞', '42Ti', '∞', '0%', '/Users/miquel/ideas'],
          ['/dev/projects', '3', '3', '0', '100%', '/Users/miquel/projects'],
          ['/dev/tabs', '512', '511', '1', '99%', '/Applications/Browser'],
          ['/dev/sleep', '8.0h', '5.5h', '2.5h', '69%', '/night'],
        ].forEach(function (r, i) {
          var full = i > 0 && parseInt(r[4], 10) >= 90;
          line(padEnd(r[0], 15) + pad(r[1], 6) + pad(r[2], 7) + pad(r[3], 7) + '  ', span(pad(r[4], 8), full ? 'sym' : null), '    ' + r[5]);
        });
        break;
      case 'tail': {
        var count = 10;
        var follow = false;
        var path = null;
        for (var i = 0; i < args.length; i++) {
          var a = args[i];
          if (/^-[fF]$/.test(a)) follow = true;
          else if (a === '-n') count = parseInt(args[++i], 10);
          else if (/^-n\d+$/.test(a)) count = parseInt(a.slice(2), 10);
          else if (/^-\d+$/.test(a)) count = parseInt(a.slice(1), 10);
          else if (/^-[fn]+$/.test(a)) { follow = true; count = parseInt(args[++i], 10); }
          else path = a;
        }
        if (isNaN(count) || count < 0) { line('tail: illegal offset -- ' + args.join(' ')); break; }
        if (path && !/(^|\/)kumavolt\.log$|^\/var\/log\/system\.log$/.test(path)) {
          var tf = nodeAt(resolve(path));
          if (!tf) { line('tail: ' + path + ': No such file or directory'); break; }
          if (tf.type === 'dir') { line('tail: ' + path + ': Is a directory'); break; }
          if (tf.secret) { line('tail: ' + path + ': Permission denied'); found('ssh'); break; }
          lines(tf.type === 'link' ? tf.label : tf.text.split('\n').slice(-count).join('\n'));
          if (follow) startJob('tail');
          break;
        }
        if (!path) line(span('==> /var/log/kumavolt.log <==', 'dim'));
        var shown = Math.min(count, 5000);
        for (var k = logTotal - shown; k < logTotal; k++) line(logLine(k));
        if (follow) {
          startJob('tail');
          var tick = function () {
            later(500 + Math.random() * 1400, function () { line(logLine(logTotal++)); tick(); });
          };
          tick();
        }
        break;
      }
      case 'ping': {
        var host = args.filter(function (x) { return x.charAt(0) !== '-'; })[0];
        if (!host) { line('usage: ping host'); break; }
        var local = /^(localhost|127\.0\.0\.1)$/.test(host);
        var ip = local ? '127.0.0.1' : host === 'kumavolt.dev' ? '185.199.108.153'
          : [0, 1, 2, 3].map(function (s) { return 1 + Math.floor(seeded(host.length * 31 + host.charCodeAt(0), s) * 253); }).join('.');
        var sent = 0;
        var times = [];
        line('PING ' + host + ' (' + ip + '): 56 data bytes');
        startJob('ping', {
          after: function () {
            line('');
            line('--- ' + host + ' ping statistics ---');
            line(sent + ' packets transmitted, ' + sent + ' packets received, 0.0% packet loss');
            if (sent) {
              var avg = times.reduce(function (s, t) { return s + t; }, 0) / sent;
              line('round-trip min/avg/max = ' + Math.min.apply(null, times).toFixed(3) + '/' + avg.toFixed(3) + '/' + Math.max.apply(null, times).toFixed(3) + ' ms');
            }
          },
        });
        var pingOnce = function () {
          var ms = local ? 0.04 + Math.random() * 0.05 : 9 + Math.random() * 12;
          times.push(ms);
          line('64 bytes from ' + ip + ': icmp_seq=' + sent++ + ' ttl=' + (local ? 64 : 57) + ' time=' + ms.toFixed(3) + ' ms');
          if (sent < 5) later(1000, pingOnce); else later(10, endJob);
        };
        later(200, pingOnce);
        break;
      }
      case 'eggs': {
        if (args[0] === 'reset') {
          eggsFound = [];
          try { localStorage.removeItem('kumavolt.eggs'); } catch (e) { /* private mode */ }
          line('Easter eggs hidden again.');
          break;
        }
        var got = eggsFound.length;
        var barLen = 22;
        line('Easter eggs: ' + got + '/' + EGG_IDS.length + '  [', span(new Array(got + 1).join('#'), 'egg'), new Array(barLen - Math.round(got / EGG_IDS.length * barLen) + 1).join('.') + ']');
        if (got) line(span('Found: ' + eggsFound.join(', '), 'dim'));
        var next = EGG_IDS.filter(function (id) { return eggsFound.indexOf(id) < 0; });
        if (next.length) line('Hint: ' + EGGS[pick(next)]);
        else line(span('You found every single one. Respect. 🏆', 'egg'));
        break;
      }

      // ---------- the easter eggs ----------
      case 'sl':
        sl();
        break;
      case 'apt':
        if (args[0] === 'moo') { lines(MOO.join('\n')); found('moo'); }
        else if (!args.length) line('apt 2.9.8 (arm64)\nThis APT has Super Cow Powers.');
        else line('E: Could not open lock file. This is macOS, try brew.');
        break;
      case 'cmatrix':
        cmatrix();
        break;
      case 'aafire':
        aafire();
        break;
      case 'hollywood':
        hollywood();
        break;
      case 'telnet': {
        var to2 = (args[0] || '').toLowerCase();
        if (!to2) { line('usage: telnet host [port]'); break; }
        line('Trying ' + to2 + '...');
        if (/^towel(\.blinkenlights\.nl)?$/.test(to2)) {
          line('Connected to towel.blinkenlights.nl.');
          line('Escape character is \'^]\'.');
          telnet();
        } else {
          line('telnet: connect to address ' + to2 + ': Connection refused');
          line('telnet: Unable to connect to remote host');
        }
        break;
      }
      case 'neofetch': {
        var days2 = Math.floor((Date.now() - new Date(2017, 1, 1)) / 864e5);
        var info = [
          ['', 'guest@kumavolt'], ['', '--------------'],
          ['OS', 'KumaOS 26 (Rust edition)'], ['Host', 'kumavolt.dev'], ['Kernel', 'borrowck 1.0'],
          ['Uptime', Math.floor(days2 / 365) + ' years, ' + Math.floor(days2 % 365 / 30) + ' months'],
          ['Shell', 'zsh 5.9'], ['Resolution', window.innerWidth + 'x' + window.innerHeight],
          ['Terminal', 'terminal.js'], ['CPU', '1 brain @ 3 coffees/day'],
          ['Languages', 'Rust, PHP, TypeScript, C++'], ['Projects', 'GitChrono, Encheo, OpenCookie'],
          ['Easter eggs', (eggsFound.length + (eggsFound.indexOf('neofetch') < 0 ? 1 : 0)) + '/' + EGG_IDS.length],
        ];
        for (var r = 0; r < Math.max(BEAR.length, info.length + 2); r++) {
          var row = [span(padEnd(BEAR[r] || '', 16), 'user')];
          var it = info[r];
          if (it) row.push(it[0] ? span(it[0] + ': ', 'key') : '', it[0] ? it[1] : span(it[1], r === 0 ? 'user' : null));
          if (r === info.length + 1) {
            ['#1e1e1e', '#ff5f57', '#28c840', '#febc2e', '#6cb6ff', '#c678dd', '#56b6c2', '#e6e6e6'].forEach(function (c) {
              var blk = span('   ');
              blk.style.backgroundColor = c;
              row.push(blk);
            });
          }
          line.apply(null, row);
        }
        found('neofetch');
        break;
      }
      case 'fortune':
        line(pick(FORTUNES));
        found('fortune');
        break;
      case 'cowsay': case 'kumasay':
        if (cmd === 'cowsay') line(span('The cows are on holiday. A bear is filling in.', 'dim'));
        bearSay(args.join(' ') || 'Moo? I mean: grr.');
        found('cowsay');
        break;
      case 'git':
        if (args[0] === 'status') lines('On branch main\nYour branch is up to date with \'origin/main\'.\n\nnothing to commit, working tree clean');
        else if (args[0] === 'log') {
          [['5f3af4d', 'Hide even more easter eggs'], ['0924566', 'fix: typo'], ['e77d05b', 'fix: actually fix the typo'],
            ['392c983', 'Rewrite it in Rust (the website is still HTML)'], ['c902d81', 'Remove console.log("here")'],
            ['0f61b88', 'Initial commit']].forEach(function (c, i) {
            line(span(c[0], 'sym'), i === 0 ? ' (' : ' ', i === 0 ? span('HEAD -> main', 'key') : '', i === 0 ? ') ' : '', c[1]);
          });
        } else if (args[0] === 'blame') {
          line(span('^0f61b88', 'sym'), ' (Miquel 2017-02-01 09:00:00 +0100 1) It was me. It\'s always me.');
          found('blame');
        } else if (args[0] === 'push') line(/(-f|--force)/.test(args.join(' ')) ? 'Rejected: not on a Friday.' : 'Everything up-to-date');
        else if (args[0] === 'commit') line('nothing to commit, working tree clean');
        else if (!args[0]) line('usage: git [status | log | blame | push | commit]');
        else line('git: \'' + args[0] + '\' is not a git command. See \'git --help\'.');
        break;
      case 'cargo':
        if (args[0] === 'run' || args[0] === 'build') {
          var steps = [[300, '   Compiling kumavolt v1.0.0 (/Users/miquel/kumavolt)'],
            [1400, '    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.42s']];
          if (args[0] === 'run') steps.push([200, '     Running `target/debug/kumavolt`'], [200, 'Hello, world!']);
          play('cargo', steps);
        } else line('usage: cargo run');
        break;
      case 'rustc':
        line(args[0] === '--version' || args[0] === '-V' ? 'rustc 1.91.1 (stable)' : 'error: no input filename given');
        break;
      case 'npm': case 'npx': case 'yarn': case 'pnpm': case 'node':
        line(cmd + ': this is a Rust household. Try ', span('cargo run', 'key'), '.');
        break;
      case 'make':
        if (args[0] === 'love') { line('make: *** No rule to make target `love\'.  Stop.'); found('make'); }
        else if (args[0] === 'coffee') { line('HTTP/1.1 418 I\'m a teapot'); found('coffee'); }
        else line('make: *** No targets specified and no makefile found.  Stop.');
        break;
      case 'coffee': case 'brew':
        if (cmd === 'brew' && !/coffee|tea/.test(args.join(' '))) {
          line(args[1] ? 'Error: No available formula with the name "' + args[1] + '".' : 'Example usage:\n  brew install coffee');
          break;
        }
        lines('HTTP/1.1 418 I\'m a teapot\n\n      _\n   __( )__\n  /  ___  \\=\n | (_____) |\n  \\_______/\n\nI can only make tea.');
        found('coffee');
        break;
      case 'xyzzy':
        line('Nothing happens.');
        found('xyzzy');
        break;
      case 'sudo':
        if (!args.length) line('usage: sudo command');
        else if (args[0] === 'rm' && /-\w*r\w*f|-\w*f\w*r/.test(args.join(' '))) rmEverything();
        else { line('guest is not in the sudoers file. This incident will be reported.'); found('sudo'); }
        break;
      case 'rm':
        if (/-\w*r\w*f|-\w*f\w*r/.test(args.join(' ')) && /^(\/\*?|~\/?|\*|\.|\/Users\/miquel)$/.test(args[args.length - 1])) rmEverything();
        else line('rm: not in my home folder, you don\'t.');
        break;
      case 'vim':
        vim(args[0]);
        break;
      case 'nano': case 'emacs':
        line(cmd + '? Opening vim instead.');
        vim(args[0]);
        break;
      case 'exit': case 'logout':
        line('logout');
        line('');
        line('[Process completed]');
        found('exit');
        setTimeout(closeTerminal, 900);
        break;
      case 'irb':
        line('Already did that one. Scroll up.');
        break;
      case 'man':
        line(args[0] ? 'No manual entry for ' + args[0] + '. You\'re on your own.' : 'What manual page do you want?');
        break;
      case 'weather':
        line('Hoofddorp: 11°C and light rain. It\'s the Netherlands, it\'s always light rain.');
        break;
      case 'hello': case 'hi': case 'hey':
        line('Hi there! 👋 Type ', span('help', 'key'), ' to see what you can do here.');
        break;
      case '42':
        line('Yes, but what was the question?');
        break;
      default: {
        var known = Object.keys(COMMANDS).concat(HIDDEN_COMMANDS);
        var best = known.map(function (c) { return { c: c, d: distance(cmd, c) }; })
          .sort(function (x, y) { return x.d - y.d; })[0];
        if (cmd.length > 2 && best && best.d <= 2) line('zsh: command not found: ' + cmd + '. Did you mean ', span(best.c, 'key'), '?');
        else line('zsh: command not found: ' + cmd + '. Type ', span('help', 'key'), ' for the list.');
      }
    }
  };

  // ---------- Tab completion ----------
  var commonPrefix = function (words) {
    return words.reduce(function (a, b) { var i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });
  };
  var complete = function () {
    lockHeight();
    var value = input.value;
    var tokens = value.split(' ');
    var last = tokens[tokens.length - 1];
    var candidates, base, prefix = '';

    if (tokens.length === 1) {
      candidates = Object.keys(COMMANDS).filter(function (c) { return c.indexOf(last) === 0; });
      base = last;
      candidates = candidates.map(function (c) { return { name: c, full: c + ' ' }; });
    } else {
      var slash = last.lastIndexOf('/');
      prefix = slash >= 0 ? last.slice(0, slash + 1) : '';
      base = slash >= 0 ? last.slice(slash + 1) : last;
      var where = nodeAt(resolve(prefix));
      if (!where || where.type !== 'dir') return;
      var names = Object.keys(where.children).filter(function (n) {
        return n.indexOf(base) === 0 && (n.charAt(0) !== '.' || base.charAt(0) === '.');
      }).sort();
      // "open enc" also finds the project from anywhere.
      if (!names.length && tokens[0] === 'open' && !prefix) {
        names = Object.keys(HOME.children.projects.children).filter(function (n) { return n.indexOf(base) === 0; });
        where = HOME.children.projects;
      }
      candidates = names.map(function (n) {
        return { name: n, full: prefix + n + (where.children[n].type === 'dir' ? '/' : ' ') };
      });
    }
    if (!candidates.length) return;
    tokens.pop();
    var head = tokens.length ? tokens.join(' ') + ' ' : '';
    if (candidates.length === 1) {
      input.value = head + candidates[0].full;
    } else {
      var shared = commonPrefix(candidates.map(function (c) { return c.name; }));
      if (shared.length > base.length) {
        input.value = head + prefix + shared;
      } else {
        echoPrompt(value);
        line(candidates.map(function (c) { return c.full.trim(); }).join('  '));
      }
    }
    fit();
    scrollDown();
  };

  // ---------- input ----------
  var fit = function () { input.style.width = Math.max(1, input.value.length + 1) + 'ch'; };
  input.addEventListener('input', fit);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      run(input.value);
      input.value = '';
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
      return;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (!history.length) return;
      e.preventDefault();
      historyAt = Math.max(0, Math.min(history.length, historyAt + (e.key === 'ArrowUp' ? -1 : 1)));
      input.value = history[historyAt] || '';
    } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      lockHeight();
      echoPrompt(input.value + '^C');
      input.value = '';
    } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      run('clear');
    } else {
      return;
    }
    fit();
    scrollDown();
  });

  // While a job runs the terminal itself has focus: q, Esc or Ctrl+C stops it (vim has its own keys).
  term.tabIndex = -1;
  term.addEventListener('keydown', function (e) {
    if (!job) {
      if (e.key === 'Escape' && term.classList.contains('fullscreen')) toggleFullscreen();
      return;
    }
    // The Enter that started the job bubbles up from the prompt; it isn't meant to stop it.
    if (e.target === input) return;
    if (job.keys) return job.keys(e);
    var k = e.key;
    if (k === 'q' || k === 'Q' || k === 'Escape' || k === 'Enter' || (e.ctrlKey && (k === 'c' || k === 'C'))) {
      e.preventDefault();
      interrupt();
    }
  });

  // A click anywhere in the terminal (except on a link, or while selecting text) types there.
  // While a job runs, a click (or a tap on a phone) stops it.
  body.addEventListener('click', function (e) {
    if (e.target.closest('a') || String(window.getSelection())) return;
    if (job) return interrupt();
    input.focus({ preventScroll: true });
  });

  // ---------- the three window buttons ----------
  var reopen = document.createElement('button');
  reopen.type = 'button';
  reopen.className = 'term-reopen';
  reopen.textContent = '>_  Reopen terminal';
  reopen.hidden = true;
  term.parentNode.insertBefore(reopen, term.nextSibling);
  var toggleFullscreen = function () {
    var on = term.classList.toggle('fullscreen');
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) found('window');
    measure();
    if (!job) title('zsh');
    scrollDown();
  };
  var closeTerminal = function () {
    endJob();
    if (term.classList.contains('fullscreen')) toggleFullscreen();
    term.hidden = true;
    reopen.hidden = false;
  };
  reopen.addEventListener('click', function () {
    term.hidden = false;
    reopen.hidden = true;
    var d = new Date();
    line(span('Last login: ' + d.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' + d.toLocaleDateString('en-US', { month: 'short' }) +
      ' ' + d.getDate() + ' ' + d.toLocaleTimeString('en-GB', { hour12: false }) + ' on ttys002', 'dim'));
    input.focus({ preventScroll: true });
    scrollDown();
  });
  var light = function (cls, fn) {
    var b = term.querySelector('.light.' + cls);
    if (b) b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
  };
  light('close', function () { found('window'); closeTerminal(); });
  light('min', function () { term.classList.toggle('minimized'); found('window'); });
  light('max', toggleFullscreen);

  fit();
  title('zsh');
})();
