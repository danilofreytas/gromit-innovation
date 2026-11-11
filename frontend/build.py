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
VERSION = "18"  # aumente para forçar recarregar CSS/JS no navegador

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

NAV = [("/servicos/", "Serviços"), ("/quem-somos/", "Quem somos"), ("/produtos/", "Produtos")]

LAYOUT = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="canonical" href="{canonical}">
  <meta name="theme-color" content="#0b0f14">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="Gromit Innovation">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{canonical}">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css?v={v}">
</head>
<body>

<div class="bg" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>

<header class="nav">
  <div class="pill">
    <a class="logo" href="/"><i></i>Gromit Innovation</a>
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
    <span>© <span id="y">2026</span> Gromit Innovation</span>
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
        )
        out = DIST / url.strip("/") / "index.html" if url != "/" else DIST / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print("ok", url)
    write_seo_files()


if __name__ == "__main__":
    main()
