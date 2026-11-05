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
    var stack = ['AWS', 'GCP', 'Azure', 'Kubernetes', 'Terraform', 'Ansible', 'Docker', 'Helm',
      'GitLab CI', 'GitHub Actions', 'Prometheus', 'Grafana', 'Datadog', 'Linux', 'PostgreSQL', 'Python'];
    track.innerHTML = stack.concat(stack).map(function (s) { return '<span>' + s + '</span>'; }).join('');
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
