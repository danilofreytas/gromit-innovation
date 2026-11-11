#!/usr/bin/env python3
"""Gera o site estático em frontend/dist a partir de src/*.html e public/.

Uso:  python3 build.py
Cada arquivo em src/ começa com comentários <!--title:-->, <!--desc:--> e
define o conteúdo de <main>. Menu e rodapé ficam só aqui.
"""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).parent
SRC = ROOT / "src"
PUBLIC = ROOT / "public"   # arquivos estáticos copiados como estão (css, js, logos, CV, CNAME)
DIST = ROOT / "dist"       # saída do build; não é versionada
SITE_URL = "https://gromit.com.br"
VERSION = "33"  # aumente para forçar recarregar CSS/JS no navegador

# arquivo em src/  ->  URL final
PAGES = {
    "index.html": "/",
    "servicos.html": "/servicos/",
    "quem-somos.html": "/quem-somos/",
    "quem-somos-danilo.html": "/quem-somos/daniloreis/",
    "quem-somos-priscilla.html": "/quem-somos/priscillacorrea/",
    "produtos.html": "/produtos/",
    "produtos-budget-bunny.html": "/produtos/budget-bunny/",
    "produtos-ursolandia.html": "/produtos/ursolandia/",
    "contato.html": "/contato/",
    "privacidade.html": "/privacidade/",
}

# Endereço público de cada produto. Deixe None enquanto não estiver no ar:
# o botão aparece desativado ("Acesso em breve"). Quando existir, informe a URL
# e rode o build de novo.
PRODUCT_LINKS = {
    "budget-bunny": "https://budgetbunny.gromit.com.br",
    "ursolandia": None,
}


import random

def _logo_svg(cls):
    svg = (PUBLIC / "brand" / "logo-horizontal-reversed.svg").read_text(encoding="utf-8")
    svg = svg.replace("<svg ", f'<svg class="{cls}" role="img" aria-label="Gromit Innovation" ', 1)
    # o primeiro traço Azure é o cursor >_ , que pisca na versão animada
    return svg.replace('fill="#38BDF8"', 'class="lg-cur" fill="#38BDF8"', 1)


def _starfield():
    """Campo de estrelas e arcos de órbita (elementos de apoio do manual da marca)."""
    rnd = random.Random(7)
    out = []
    for cx, cy, r, w, o in ((1560, -10, 400, 10, .07), (90, 860, 330, 8, .05)):
        out.append(f'<circle class="orb" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#FFFFFF" stroke-opacity="{o}" '
                   f'stroke-width="{w}" stroke-dasharray="{int(r * 4.2)} {int(r * 1.3)}" style="transform-origin:{cx}px {cy}px"/>')
    stars = []
    for i in range(58):
        x, y = rnd.uniform(0, 1440), rnd.uniform(0, 900)
        r = rnd.choice((.7, 1.0, 1.4, 1.8))
        accent = i % 17 == 0
        fill = "#38BDF8" if accent else "#FFFFFF"
        op = 1 if accent else rnd.choice((.18, .28, .4))
        stars.append(f'<circle class="st s{i % 5}" cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" fill-opacity="{op}"/>')
    out.append('<g class="stars">' + "".join(stars) + '</g>')
    return ('<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'
            + "".join(out) + "</svg>")


NAV = [("/servicos/", "Serviços"), ("/quem-somos/", "Quem somos"), ("/produtos/", "Produtos")]

LAYOUT = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#060C1C">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Gromit Innovation">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{canonical}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/favicon.ico?v={v}" sizes="48x48">
  <link rel="icon" href="/favicon.svg?v={v}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png?v={v}">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v={v}">
</head>
<body>

<div class="bg" aria-hidden="true">{starfield}</div>

<header class="nav">
  <div class="pill">
    <a class="logo" href="/" aria-label="Gromit Innovation, página inicial">{logo}</a>
    <ul>
{nav}
    </ul>
    <a class="cta" href="/contato/">Contato</a>
  </div>
</header>

<main id="top">
{content}
</main>

<footer>
  <div class="wrap">
    <span class="fbrand">{flogo}<small>© <span id="y">2026</span> Gromit Innovation</small></span>
    <span class="flinks"><a href="/servicos/">Serviços</a><a href="/quem-somos/">Quem somos</a><a href="/produtos/">Produtos</a><a href="/contato/">Contato</a><a href="https://www.linkedin.com/company/gromit-innovation" target="_blank" rel="noopener">LinkedIn</a><a href="/privacidade/">Privacidade</a></span>
    <span class="tm">Logotipos e marcas citados pertencem aos respectivos proprietários e são usados apenas para identificar experiências e certificações.</span>
  </div>
</footer>

<script src="/script.js?v={v}"></script>
</body>
</html>
"""


def meta(text, key):
    m = re.search(rf"<!--\s*{key}:\s*(.*?)\s*-->", text)
    return m.group(1) if m else ""


def write_seo_files():
    urls = "\n".join(f"  <url><loc>{SITE_URL}{u}</loc></url>" for u in PAGES.values())
    (DIST / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "\n</urlset>\n",
        encoding="utf-8")
    (DIST / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n", encoding="utf-8")
    print("ok sitemap.xml, robots.txt")


def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    shutil.copytree(PUBLIC, DIST)
    for fname, url in PAGES.items():
        text = (SRC / fname).read_text(encoding="utf-8")
        title = meta(text, "title")
        full_title = title if url == "/" else f"{title} | Gromit Innovation"
        content = re.sub(r"<!--\s*(title|desc):.*?-->\s*", "", text)
        for key, link in PRODUCT_LINKS.items():
            if url == f"/produtos/{key}/":
                btn = (
                    f'<a class="btn primary" href="{link}" target="_blank" rel="noopener">Acessar o app ↗</a>'
                    if link else
                    '<span class="btn disabled" aria-disabled="true">Acesso em breve</span>'
                )
                content = content.replace("<!--product-link-->", btn)
        nav = "\n".join(
            f'      <li><a href="{h}"{" class=\"on\"" if url.startswith(h) else ""}>{t}</a></li>'
            for h, t in NAV
        )
        html = LAYOUT.format(
            title=full_title, desc=meta(text, "desc"), canonical=SITE_URL + url,
            nav=nav, content=content.strip(), v=VERSION,
            logo=_logo_svg("lg"), flogo=_logo_svg("lg lg-foot"), starfield=_starfield(),
        )
        out = DIST / url.strip("/") / "index.html" if url != "/" else DIST / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print("ok", url)
    write_seo_files()


if __name__ == "__main__":
    main()
