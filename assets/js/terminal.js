/*
 * The terminal on kumavolt.dev works: after the irb transcript there's a shell prompt with a
 * small pretend home folder. ls, cd, cat, open, Tab completion, history (↑/↓), Ctrl+C, Ctrl+L.
 * To add a folder or file, add it to HOME below.
 */
(function () {
  var body = document.querySelector('.terminal-body');
  var input = document.getElementById('term-input');
  var out = document.getElementById('term-out');
  var cwdLabel = document.getElementById('term-cwd');
  if (!body || !input || !out) return;

  var site = function (url, medium) {
    return url + '?utm_source=kumavolt.dev&utm_medium=terminal' + (medium ? '&utm_content=' + medium : '');
  };

  var dir = function (children, extra) { return Object.assign({ type: 'dir', children: children }, extra || {}); };
  var file = function (text) { return { type: 'file', text: text }; };
  var link = function (url, label) { return { type: 'link', url: url, label: label }; };

  var HOME = dir({
    'about.txt': file(
      'Miquel de la Fuente, aka KumaVolt.\n' +
      'Application developer at Brightness Group in Hoofddorp since 2017.\n' +
      'Builds open-source apps in Rust outside of work: GitChrono and Encheo.\n' +
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
    }),
    links: dir({
      github: link('https://github.com/KumaVolt', 'github.com/KumaVolt'),
      linkedin: link('https://www.linkedin.com/in/miquel-de-la-fuente/', 'linkedin.com/in/miquel-de-la-fuente'),
      email: link('mailto:mfuente@kumavolt.dev', 'mfuente@kumavolt.dev'),
    }),
    '.secret': file('↑ ↑ ↓ ↓ ← → ← → B A\n(somewhere on this page, not in here)'),
  });

  var COMMANDS = {
    help: 'show this list',
    ls: 'list a folder (ls -a shows hidden files)',
    cd: 'change folder',
    pwd: 'show the current folder',
    cat: 'show a file',
    open: 'open a project, link or file',
    clear: 'clear the screen',
    whoami: 'who you are here',
    echo: 'print text',
  };
  var HIDDEN_COMMANDS = ['sudo', 'exit', 'irb', 'rm', 'vim', 'nano', 'history'];

  var cwd = [];               // path from ~, e.g. ['projects', 'encheo']
  var history = [];
  var historyAt = 0;

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

  var run = function (raw) {
    var text = raw.trim();
    echoPrompt(raw);
    if (!text) return;
    history.push(text);
    historyAt = history.length;
    var args = text.split(/\s+/);
    var cmd = args.shift();
    if (window.dataLayer) window.dataLayer.push({ event: 'terminal_command', terminal_command: cmd.slice(0, 20) });

    switch (cmd) {
      case 'help':
        line('Commands:');
        Object.keys(COMMANDS).forEach(function (c) { line('  ', span((c + '        ').slice(0, 8), 'key'), COMMANDS[c]); });
        line(span('Tab completes names, ↑ and ↓ go through what you typed.', 'dim'));
        break;
      case 'ls': {
        var showHidden = args.indexOf('-a') >= 0 || args.indexOf('-la') >= 0 || args.indexOf('-al') >= 0;
        var target = args.filter(function (a) { return a.charAt(0) !== '-'; })[0];
        var node = nodeAt(resolve(target));
        if (!node) line('ls: ' + target + ': No such file or directory');
        else if (node.type !== 'dir') line(target);
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
      case 'cat': {
        if (!args[0]) { line('cat: which file? Try ', span('cat about.txt', 'key')); break; }
        var f = nodeAt(resolve(args[0]));
        if (!f) line('cat: ' + args[0] + ': No such file or directory');
        else if (f.type === 'dir') line('cat: ' + args[0] + ': Is a directory');
        else if (f.type === 'link') line(anchor(f.url, f.label));
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
      case 'echo':
        line(args.join(' '));
        break;
      case 'history':
        history.forEach(function (h, i) { line('  ' + (i + 1) + '  ' + h); });
        break;
      case 'sudo':
        line('Nice try. This incident will be reported.');
        break;
      case 'rm':
        line('rm: not in my home folder, you don\'t.');
        break;
      case 'vim': case 'nano':
        line('Good news: you can\'t get stuck in ' + cmd + ' here.');
        break;
      case 'exit':
        line('There\'s no leaving. Try ', span('open encheo', 'key'), ' instead.');
        break;
      case 'irb':
        line('Already did that one. Scroll up.');
        break;
      default:
        line('zsh: command not found: ' + cmd + '. Type ', span('help', 'key'), ' for the list.');
    }
  };

  // ---------- Tab completion ----------
  var commonPrefix = function (words) {
    return words.reduce(function (a, b) { var i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });
  };
  var complete = function () {
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

  // A click anywhere in the terminal (except on a link, or while selecting text) types there.
  body.addEventListener('click', function (e) {
    if (e.target.closest('a') || String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });
  fit();
})();
