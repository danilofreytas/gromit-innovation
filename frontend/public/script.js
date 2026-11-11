(function () {
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
  var lastY = window.scrollY;
  var onScroll = function () {
    var y = window.scrollY, root = document.documentElement;
    root.classList.toggle('scrolled', y > 20);
    // Esconde o menu ao descer (para não cobrir o conteúdo) e mostra ao subir
    if (y > 140 && y > lastY + 4) root.classList.add('nav-hide');
    else if (y < lastY - 4 || y <= 140) root.classList.remove('nav-hide');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      '<span class="ok">✔</span> observabilidade  <span class="ok">✔</span> pipelines  <span class="ok">✔</span> backups',
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
    var stageTop = function () { return proto.getBoundingClientRect().top + window.scrollY; };
    var onProto = function () {
      var r = proto.getBoundingClientRect();
      var span = proto.offsetHeight - window.innerHeight * 0.6;
      var p = Math.min(Math.max((-r.top + 96) / Math.max(span, 1), 0), 0.9999);
      setStage(Math.floor(p * total));
    };
    window.addEventListener('scroll', onProto, { passive: true });
    window.addEventListener('resize', onProto);
    btns.forEach(function (b, k) {
      b.addEventListener('click', function () {
        var span = proto.offsetHeight - window.innerHeight * 0.6;
        var y = stageTop() - 96 + (k + 0.5) / total * span;
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        setStage(k);
      });
    });
  }

  // Formulário: pré-seleciona a frente vinda de /contato/?frente=infra|dev
  var sel = document.getElementById('frente');
  if (sel) {
    try {
      var f = new URLSearchParams(window.location.search).get('frente');
      if (f) {
        for (var j = 0; j < sel.options.length; j++) {
          if (sel.options[j].getAttribute('data-key') === f) { sel.selectedIndex = j; break; }
        }
      }
    } catch (e) {}
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
