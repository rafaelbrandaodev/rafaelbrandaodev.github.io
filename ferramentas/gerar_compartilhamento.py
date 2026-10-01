"""Gera o ícone do site e as imagens de prévia de link (Open Graph).

- assets/icones/icone.svg, icone-32.png e icone-180.png: monograma "RB" com o
  desenho real da Manrope (as letras viram curvas, então o ícone não
  depende da fonte estar instalada);
- assets/img/compartilhar/*.png: 1200x630, a imagem que aparece quando o link é
  colado no WhatsApp, LinkedIn etc. Uma para a página inicial e uma por projeto,
  montadas com o próprio CSS do site e a capa de cada projeto.

Requer Playwright com Chromium e fontTools com brotli:
    pip install playwright fonttools brotli
Uso:
    python ferramentas/gerar_compartilhamento.py
"""
import pathlib

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ICONES = RAIZ / "assets" / "icones"
PREVIAS = RAIZ / "assets" / "img" / "compartilhar"
NAVY, DESTAQUE = "#0B1A2E", "#7CB7FF"


def monograma():
    """Caminho SVG de "RB" em peso 800, centralizado num quadro de 64x64."""
    fonte = instantiateVariableFont(TTFont(RAIZ / "assets/fontes/manrope.woff2"), {"wght": 800})
    glifos = fonte.getGlyphSet()
    cmap = fonte.getBestCmap()
    nomes = [cmap[ord(c)] for c in "RB"]
    aperto = -20  # unidades da fonte: letras mais juntas, como nos títulos do site
    # limites reais do desenho, para centralizar pelo que se vê e não pela caixa da fonte
    limites, x = BoundsPen(glifos), 0
    for nome in nomes:
        glifos[nome].draw(TransformPen(limites, (1, 0, 0, 1, x, 0)))
        x += glifos[nome].width + aperto
    x0, y0, x1, y1 = limites.bounds
    # cabe em 44x32 dentro do quadro de 64: sobra margem para o ícone respirar
    escala = min(44 / (x1 - x0), 32 / (y1 - y0))
    dx = (64 - (x1 - x0) * escala) / 2 - x0 * escala
    dy = (64 + (y1 - y0) * escala) / 2 + y0 * escala
    caminho, x = SVGPathPen(glifos), 0
    for nome in nomes:
        glifos[nome].draw(TransformPen(caminho, (escala, 0, 0, -escala, dx + x * escala, dy)))
        x += glifos[nome].width + aperto
    return caminho.getCommands()


def icone_svg():
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        f'<rect width="64" height="64" rx="14" fill="{NAVY}"/>'
        f'<path fill="{DESTAQUE}" d="{monograma()}"/>'
        "</svg>\n"
    )


# página inicial e cada projeto: título, subtítulo e a capa da página inicial do site
PREVIAS_PAGINAS = [
    ("inicio", "Rafael Brandão", "Sistemas que nascem de necessidades reais", "sistema-gestao-ti.html"),
    ("sistema-gestao-ti", "Sistema de gestão de T.I", "Chamados, inventário, almoxarifado e patrimônio em Django", "sistema-gestao-ti.html"),
    ("timer-estacoes", "Timer de estações", "Cronômetros sincronizados em tempo real para avaliações em várias salas", "timer-estacoes.html"),
    ("sorteio-evento", "Sorteio de evento", "Cadastro por QR Code e sorteio ao vivo, em Flask", "sorteio-evento.html"),
]

MOLDE = """<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<link rel="stylesheet" href="{css}">
<style>
  html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
  body{{background:linear-gradient(160deg,var(--navy-0) 0%,var(--navy) 55%,var(--navy-2) 100%);color:#fff;
       display:grid;grid-template-columns:480px 1fr;align-items:center;gap:40px;padding:0 64px 0 72px}}
  .texto h1{{font-size:{tamanho}px;font-weight:800;line-height:1.04;letter-spacing:-.032em;text-wrap:balance}}
  .texto p{{margin-top:22px;font-size:26px;line-height:1.35;color:var(--destaque);font-weight:600;text-wrap:balance}}
  .texto .autor{{margin-top:40px;font-size:20px;font-weight:600;color:var(--no-escuro-2)}}
  .capa{{width:100%}}
  .capa :is(.janela,.tablet,.celular){{box-shadow:0 2px 4px rgba(7,15,28,.3),0 40px 80px -32px rgba(0,0,0,.7)}}
</style></head><body>
<div class="texto"><h1>{titulo}</h1><p>{sub}</p>{autor}</div>
{capa}
</body></html>"""


def main():
    ICONES.mkdir(parents=True, exist_ok=True)
    PREVIAS.mkdir(parents=True, exist_ok=True)
    svg = icone_svg()
    (ICONES / "icone.svg").write_text(svg, encoding="utf-8")
    print("  OK assets/icones/icone.svg")

    inicio = (RAIZ / "index.html").read_text(encoding="utf-8")
    with sync_playwright() as p:
        b = p.chromium.launch()
        for lado in (32, 180):
            pg = b.new_page(viewport={"width": lado, "height": lado})
            # o ícone de 180 (tela inicial do iPhone) vai sem cantos: o sistema já arredonda
            fundo = svg if lado == 32 else svg.replace('rx="14" ', "")
            pg.set_content(f'<html><body style="margin:0">{fundo.replace("<svg ", f"<svg width={lado} height={lado} ")}</body></html>')
            destino = ICONES / f"icone-{lado}.png"
            pg.screenshot(path=str(destino), omit_background=True)
            print(f"  OK {destino.relative_to(RAIZ).as_posix()}")
            pg.close()

        for nome, titulo, sub, projeto in PREVIAS_PAGINAS:
            # a capa é a mesma da página inicial; os caminhos passam a ser absolutos
            href = f'href="projetos/{projeto}"'
            bloco = inicio[inicio.index(href):]
            # a capa é o primeiro <span> do link (pode levar atributos antes da classe)
            capa = bloco[bloco.index("<span"):bloco.index("</span>\n        <div>")] + "</span>"
            capa = capa.replace(' aria-hidden="true"', "")
            capa = capa.replace('src="assets/', f'src="{(RAIZ / "assets").as_uri()}/').replace(' loading="lazy"', "")
            html = MOLDE.format(css=(RAIZ / "assets/css/estilo.css").as_uri(), titulo=titulo, sub=sub, capa=capa,
                                tamanho=64 if nome == "inicio" else 56,
                                autor="" if nome == "inicio" else '<p class="autor">Rafael Brandão · estudo de caso</p>')
            pagina = RAIZ / f"_previa-{nome}.html"  # precisa estar na pasta do site para achar a fonte
            pagina.write_text(html, encoding="utf-8")
            pg = b.new_page(viewport={"width": 1200, "height": 630})
            pg.goto(pagina.as_uri())
            pg.evaluate("document.fonts.ready")
            pg.wait_for_load_state("networkidle")
            pg.wait_for_timeout(300)
            destino = PREVIAS / f"{nome}.png"
            pg.screenshot(path=str(destino))
            pg.close()
            pagina.unlink()
            print(f"  OK {destino.relative_to(RAIZ).as_posix()} ({destino.stat().st_size // 1024} KB)")
        b.close()


if __name__ == "__main__":
    main()
