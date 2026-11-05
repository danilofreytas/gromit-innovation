#!/usr/bin/env python3
"""Verificações do site gerado em frontend/dist (rodar depois de build.py).

Falha (exit 1) se encontrar:
  - página sem lang, <title>, meta description ou canonical absoluto;
  - títulos ou descrições repetidos entre páginas;
  - link/recurso interno que não existe no dist;
  - <img> sem alt; link target=_blank sem rel="noopener";
  - telefone, e-mail ou termo proibido (ex.: empregador atual) no HTML (regra de conteúdo);
  - link para repositório privado (retornaria 404 ao visitante);
  - página fora do sitemap.xml.
Só usa a biblioteca padrão do Python.
"""
from __future__ import annotations

import html as htmllib
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

DIST = Path(__file__).parent / "dist"
SITE_URL = "https://gromit.com.br"

FORBIDDEN = {
    "e-mail": re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+"),
    "telefone": re.compile(r"(\(\d{2}\)\s?|\b\d{2}\s)9?\d{4}[-\s]?\d{4}\b"),
    "marcador sem substituir": re.compile(r"\{\{[A-Z_]+\}\}"),
    "repositório privado": re.compile(r"github\.com/danilofreytas/(Budget-Bunny|ursolandia)", re.I),
}


def forbidden_terms():
    """Termos proibidos (ex.: empregadores atuais) ficam FORA do repositório público.

    Vêm da variável de ambiente FORBIDDEN_TERMS (no CI: variável do repositório) ou do
    arquivo local frontend/.forbidden-terms (ignorado pelo git). Separe por vírgula ou linha.
    """
    raw = os.environ.get("FORBIDDEN_TERMS", "")
    local = Path(__file__).parent / ".forbidden-terms"
    if not raw.strip() and local.is_file():
        raw = local.read_text(encoding="utf-8")
    terms = [t.strip() for t in re.split(r"[,\n]", raw) if t.strip()]
    return re.compile("|".join(re.escape(t) for t in terms), re.I) if terms else None


class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.lang = ""
        self.title = ""
        self.description = ""
        self.canonical = ""
        self.links: list[str] = []
        self.errors: list[str] = []
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang") or ""
        elif tag == "title":
            self._in_title = True
        elif tag == "meta" and a.get("name") == "description":
            self.description = (a.get("content") or "").strip()
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href") or ""
        if tag in ("a", "link") and a.get("href"):
            self.links.append(a["href"])
        if tag in ("img", "script", "source") and a.get("src"):
            self.links.append(a["src"])
        if tag == "img" and "alt" not in a:
            self.errors.append("<img> sem alt: " + (a.get("src") or "?"))
        if tag == "a" and a.get("target") == "_blank" and "noopener" not in (a.get("rel") or ""):
            self.errors.append('target="_blank" sem rel="noopener": ' + (a.get("href") or "?"))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def target_exists(link: str) -> bool:
    path = unquote(urlparse(link).path)
    candidate = DIST / path.lstrip("/")
    if path.endswith("/") or candidate.is_dir():
        candidate = candidate / "index.html"
    return candidate.is_file()


def main() -> int:
    if not DIST.is_dir():
        print("dist/ não existe: rode python3 frontend/build.py antes.")
        return 1
    errors: list[str] = []
    terms = forbidden_terms()
    if terms is None:
        print("aviso: FORBIDDEN_TERMS não configurado; a regra de termos proibidos está desativada.")
    titles: dict[str, str] = {}
    descriptions: dict[str, str] = {}
    pages = sorted(DIST.rglob("index.html"))

    for f in pages:
        rel = "/" + f.parent.relative_to(DIST).as_posix().strip(".") + ("/" if f.parent != DIST else "")
        rel = rel.replace("//", "/")
        html = f.read_text(encoding="utf-8")
        p = Page()
        p.feed(html)
        where = f"[{rel}] "
        if not p.lang:
            errors.append(where + "falta lang no <html>")
        if not p.title.strip():
            errors.append(where + "falta <title>")
        if not p.description:
            errors.append(where + "falta meta description")
        if not p.canonical.startswith(SITE_URL + "/"):
            errors.append(where + f"canonical inválido: {p.canonical!r}")
        if p.title.strip() in titles:
            errors.append(where + f"título repetido com {titles[p.title.strip()]}")
        titles[p.title.strip()] = rel
        if p.description and p.description in descriptions:
            errors.append(where + f"descrição repetida com {descriptions[p.description]}")
        descriptions[p.description] = rel
        errors += [where + e for e in p.errors]
        for link in p.links:
            if link.startswith(("http://", "https://", "mailto:", "tel:", "#", "//")):
                continue
            if link.startswith("/") and not target_exists(link):
                errors.append(where + f"link interno quebrado: {link}")
        for label, rx in FORBIDDEN.items():
            m = rx.search(html)
            if m:
                errors.append(where + f"{label} no HTML: {m.group(0)!r}")
        if terms is not None:
            m = terms.search(htmllib.unescape(html))
            if m:
                errors.append(where + "termo proibido no HTML (veja FORBIDDEN_TERMS)")

    sitemap = (DIST / "sitemap.xml").read_text(encoding="utf-8") if (DIST / "sitemap.xml").exists() else ""
    for f in pages:
        rel = "/" + f.parent.relative_to(DIST).as_posix() + "/" if f.parent != DIST else "/"
        if f"<loc>{SITE_URL}{rel}</loc>" not in sitemap:
            errors.append(f"[{rel}] fora do sitemap.xml")
    for needed in ("robots.txt", "favicon.svg", "CNAME"):
        if not (DIST / needed).exists():
            errors.append(f"falta {needed} no dist")

    print(f"{len(pages)} páginas verificadas.")
    if errors:
        print(f"{len(errors)} problema(s):")
        for e in errors:
            print(" -", e)
        return 1
    print("tudo certo.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
