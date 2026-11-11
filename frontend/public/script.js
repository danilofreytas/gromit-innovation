(function () {
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
  var lastY = window.scrollY, anchorLock = false;
  var onScroll = function () {
    var y = window.scrollY, root = document.documentElement;
    root.classList.toggle('scrolled', y > 20);
    if (anchorLock) { lastY = y; return; }
    // Esconde o menu ao descer (para não cobrir o conteúdo) e mostra ao subir
    if (y > 140 && y > lastY + 4) root.classList.add('nav-hide');
    else if (y < lastY - 4 || y <= 140) root.classList.remove('nav-hide');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Clique em âncora da própria página: esconde o menu durante a rolagem para o título não ficar sob ele
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"], a[href^="/#"]');
    if (!a) return;
    var id = a.getAttribute('href').replace(/^\/?#/, '');
    if (!id || !document.getElementById(id)) return;
    anchorLock = true; document.documentElement.classList.add('nav-hide');
    clearTimeout(window.__anchorT);
    window.__anchorT = setTimeout(function () { anchorLock = false; }, reduce ? 200 : 1300);
  });

  // Faixa de tecnologias (somente na home)
  var track = document.getElementById('track');
  if (track) {
    var infra = ['AWS', 'GCP', 'Azure', 'Kubernetes', 'Terraform', 'Ansible', 'Docker', 'Helm',
      'GitLab CI', 'GitHub Actions', 'Prometheus', 'Grafana', 'Datadog', 'Linux', 'PostgreSQL'];
    var dev = ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind', 'React Native', 'Flutter', 'Figma',
      'Python', 'PowerShell', 'SharePoint', 'Power Platform', 'APIs REST', 'GitHub Copilot'];
    var stack = [];
    for (var q = 0; q < Math.max(infra.length, dev.length); q++) {
      if (infra[q]) stack.push('<span>' + infra[q] + '</span>');
      if (dev[q]) stack.push('<span class="d">' + dev[q] + '</span>');
    }
    track.innerHTML = stack.concat(stack).join('');
  }

  // Terminal animado (somente na home)
  var el = document.getElementById('term');
  if (el) {
    var lines = [
      '<span class="p">$</span> terraform apply -auto-approve',
      '<span class="dim">Apply complete! Resources: 12 added.</span>',
      '<span class="p">$</span> kubectl get pods -n prod',
      '<span class="k">api-7c9d</span>     <span class="ok">Running</span>   3/3',
      '<span class="k">worker-5b2f</span>  <span class="ok">Running</span>   2/2',
      '<span class="p">$</span> gromit status',
      '<span class="ok"><svg class=\"chk\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg></span> observabilidade  <span class="ok"><svg class=\"chk\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg></span> pipelines  <span class="ok"><svg class=\"chk\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg></span> backups',
      '<span class="w">tudo saudável.</span> <span class="cursor"></span>'
    ];
    if (reduce) {
      el.innerHTML = lines.join('\n');
    } else {
      var i = 0, out = [];
      (function next() {
        if (i >= lines.length) return;
        out.push(lines[i++]);
        el.innerHTML = out.join('\n');
        setTimeout(next, i % 3 === 1 ? 900 : 450);
      })();
    }
  }

  // Interface sendo montada (somente na home)
  var ui = document.getElementById('ui');
  if (ui) {
    var steps = ui.querySelectorAll('[data-s]');
    var ty = document.getElementById('uty'), btn = ui.querySelector('.u-btn');
    var text = 'Ana Souza';
    if (reduce) {
      ty.textContent = text;
    } else {
      ui.classList.add('anim');
      var k = 0;
      var show = function () {
        if (k >= steps.length) return;
        var s = steps[k++];
        s.classList.add('on');
        if (s.contains(ty)) {
          var c = 0;
          (function type() {
            ty.textContent = text.slice(0, ++c);
            if (c < text.length) setTimeout(type, 70); else setTimeout(show, 450);
          })();
        } else if (s === btn) {
          setTimeout(function () { btn.classList.add('press'); setTimeout(function () { btn.classList.remove('press'); }, 180); }, 350);
          setTimeout(show, 700);
        } else {
          setTimeout(show, 500);
        }
      };
      setTimeout(show, 400);
    }
  }

  // Protótipo "do código à produção": acompanha a rolagem e aceita clique
  var proto = document.getElementById('proto');
  if (proto) {
    var pans = proto.querySelectorAll('.pp'), btns = proto.querySelectorAll('.proto-steps button');
    var pframe = document.getElementById('pframe'), pcnt = document.getElementById('pcnt');
    var pbar = document.getElementById('pbar'), purl = document.getElementById('purl');
    var total = pans.length, cur = -1;
    var setStage = function (i) {
      if (i === cur) return; cur = i;
      pans.forEach(function (p, k) { p.classList.toggle('on', k === i); });
      btns.forEach(function (b, k) {
        b.parentNode.classList.toggle('on', k === i);
        if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      pframe.className = 'proto-frame front-' + pans[i].getAttribute('data-f');
      pcnt.textContent = (i + 1) + '/' + total;
      pbar.style.width = ((i + 1) / total * 100) + '%';
      purl.textContent = pans[i].getAttribute('data-url');
    };
    setStage(0);
    proto.classList.add('js');
    var sticky = proto.querySelector('.proto-sticky');
    var pinned = function () { return getComputedStyle(sticky).position === 'sticky'; };
    var topOff = function () { return Math.max(88, Math.round((window.innerHeight - sticky.offsetHeight) / 2)); };
    var range = function () { return Math.max(proto.offsetHeight - sticky.offsetHeight, 1); };
    var fit = function () {
      // em telas baixas o bloco não cabe: sem fixar, só clique
      var tooTall = sticky.offsetHeight > window.innerHeight - 100;
      proto.classList.toggle('nopin', tooTall);
      sticky.style.top = topOff() + 'px';   // em telas altas o bloco fica centralizado
      // comprimento da rolagem = altura do bloco + 38% da tela por etapa
      proto.style.height = tooTall ? '' : (sticky.offsetHeight + total * window.innerHeight * 0.38) + 'px';
    };
    var onProto = function () {
      fit();
      if (!pinned()) return;
      var r = proto.getBoundingClientRect();
      var p = Math.min(Math.max((-r.top + topOff()) / range(), 0), 0.9999);
      setStage(Math.floor(p * total));
    };
    window.addEventListener('scroll', onProto, { passive: true });
    window.addEventListener('resize', onProto);
    onProto();
    btns.forEach(function (b, k) {
      b.addEventListener('click', function () {
        setStage(k);
        if (!pinned()) return;
        var top = proto.getBoundingClientRect().top + window.scrollY;
        var y = top - topOff() + (k + 0.5) / total * range();
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  }

  // Contato: realça a frente vinda de /contato/?frente=infra|dev
  var chans = document.querySelectorAll('[data-front]');
  if (chans.length) {
    try {
      var f = new URLSearchParams(window.location.search).get('frente');
      chans.forEach(function (el) { el.classList.toggle('hl', el.getAttribute('data-front') === f); });
    } catch (e) {}
  }

  // Movimento reduzido: as cenas dos cabeçalhos ficam paradas
  if (reduce) document.querySelectorAll('.wide-art animateMotion, .wide-art animate').forEach(function (n) { n.remove(); });

  // Menu: destaca a seção que está na tela (landing)
  var spyLinks = document.querySelectorAll('.nav ul a[href^="/#"]');
  if (spyLinks.length && document.getElementById('servicos') && 'IntersectionObserver' in window) {
    var byId = {};
    spyLinks.forEach(function (a) { byId[a.getAttribute('href').slice(2)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        spyLinks.forEach(function (a) { a.classList.remove('on'); });
        if (byId[e.target.id]) byId[e.target.id].classList.add('on');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
  }

  // Revelar ao rolar
  var items = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (n, idx) { n.style.transitionDelay = (idx % 3) * 80 + 'ms'; io.observe(n); });
  } else {
    items.forEach(function (n) { n.classList.add('in'); });
  }

  // Brilho que segue o mouse nos cartões
  document.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();
