/* Consentimento de cookies (LGPD) + Google Analytics 4 + Microsoft Clarity.
 *
 * Nada de analytics é carregado antes de a pessoa aceitar. A escolha fica em
 * localStorage ("gromit-consent" = "granted" | "denied") e pode ser revista pelo
 * link "Preferências de cookies" do rodapé (qualquer elemento com data-consent-open).
 *
 * Arquivo externo de propósito: a CSP do site (Cloudflare) não permite script inline.
 */
(function () {
  'use strict';

  var GA_ID = 'G-Q37JPJ3B47';
  var CLARITY_ID = 'zd1g1bde9k';
  var KEY = 'gromit-consent';
  var loaded = false;

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* modo privado: vale só nesta visita */ }
  }

  function loadScript(src) {
    var s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;

    // Google Analytics 4
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    loadScript('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);

    // Microsoft Clarity (mapa de calor e gravações de sessão)
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    loadScript('https://www.clarity.ms/tag/' + CLARITY_ID);
    window.clarity('consent');
  }

  function track(name, params) {
    if (loaded && window.gtag) window.gtag('event', name, params || {});
    if (loaded && window.clarity) window.clarity('event', name);
  }

  // Leads: o contato é feito por e-mail ou LinkedIn, então medimos o clique nesses canais.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    var card = a.closest('[data-front]');
    var front = card ? card.getAttribute('data-front') : 'geral';
    if (href.indexOf('mailto:') === 0) {
      track('generate_lead', { method: 'email', front: front });
    } else if (/linkedin\.com\//.test(href)) {
      track('generate_lead', { method: 'linkedin', front: front });
    } else if (/github\.com\//.test(href)) {
      track('click_github', { front: front });
    }
  });

  // Banner
  var banner;
  function hideBanner() {
    if (banner) banner.hidden = true;
  }
  function showBanner() {
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'consent';
      banner.setAttribute('role', 'dialog');
      banner.setAttribute('aria-live', 'polite');
      banner.setAttribute('aria-label', 'Preferências de cookies');
      banner.innerHTML =
        '<p>Usamos cookies de medição (Google Analytics e Microsoft Clarity) para entender como o site é usado e melhorá-lo. ' +
        'Eles só são ativados se você aceitar. <a href="/privacidade/#cookies">Saiba mais</a>.</p>' +
        '<div class="consent-btns">' +
        '<button type="button" class="btn" data-choice="denied">Recusar</button>' +
        '<button type="button" class="btn primary" data-choice="granted">Aceitar</button>' +
        '</div>';
      banner.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-choice]');
        if (!b) return;
        var v = b.getAttribute('data-choice');
        var before = getChoice();
        setChoice(v);
        hideBanner();
        if (v === 'granted') {
          loadAnalytics();
        } else if (before === 'granted') {
          // Revogou: recarrega a página para descarregar os scripts e limpa os cookies de medição.
          document.cookie.split(';').forEach(function (c) {
            var n = c.split('=')[0].trim();
            if (/^(_ga|_gid|_gat|_clck|_clsk|CLID|MUID)/.test(n)) {
              ['', '; domain=.gromit.com.br', '; domain=gromit.com.br'].forEach(function (d) {
                document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
              });
            }
          });
          location.reload();
        }
      });
      document.body.appendChild(banner);
    }
    banner.hidden = false;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-consent-open]');
    if (!t) return;
    e.preventDefault();
    showBanner();
  });

  var choice = getChoice();
  if (choice === 'granted') loadAnalytics();
  else if (choice !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
    else showBanner();
  }
})();
