"""Captura as telas dos projetos para o portfólio (assets/img/<projeto>/).

Cada projeto precisa estar rodando localmente com dados fictícios; veja o README.
Requer Playwright com Chromium, o cliente Socket.IO (para o timer) e o Pillow
(para as versões menores das imagens):
    pip install playwright "python-socketio[client]" pillow
    playwright install chromium

Uso:
    python ferramentas/capturar_telas.py                 # todos os projetos
    python ferramentas/capturar_telas.py sistema-ti      # só um
    python ferramentas/capturar_telas.py sistema-ti --apenas painel chamado-detalhe

As capturas saem em densidade 2x e sem nada que identifique a instituição: no
sistema de T.I só entra a área de conteúdo (sem a barra do topo e o menu
lateral); no timer a logo é escondida; no sorteio o cabeçalho fica de fora.

Depois de capturar, o roteiro gera versões menores e nítidas de cada captura
(nome-320.webp, nome-480.webp ... até 1920), usadas pelo srcset das páginas.
Para refazer só essas versões:
    python ferramentas/capturar_telas.py --so-reduzir
"""
import argparse
import json
import os
import pathlib
import re
import unicodedata

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
IMG = RAIZ / "assets" / "img"
ESCALA = 2


class Captura:
    """Abre páginas e salva recortes em assets/img/<projeto>/."""

    def __init__(self, browser, projeto, apenas=None):
        self.browser = browser
        self.pasta = IMG / projeto
        self.pasta.mkdir(parents=True, exist_ok=True)
        self.apenas = set(apenas) if apenas else None
        self.feitas = 0

    def quer(self, nome):
        return self.apenas is None or nome in self.apenas

    def pagina(self, largura, altura, **opcoes):
        contexto = self.browser.new_context(
            viewport={"width": largura, "height": altura},
            device_scale_factor=ESCALA, locale="pt-BR", **opcoes)
        return contexto.new_page()

    def salvar(self, page, nome, clip=None):
        arquivo = self.pasta / f"{nome}.png"
        page.mouse.move(0, 0)  # senão a linha sob o cursor sai com o realce de hover
        page.wait_for_timeout(150)
        if clip:
            page.screenshot(path=str(arquivo), full_page=True, clip=clip)
        else:
            page.screenshot(path=str(arquivo))
        self.feitas += 1
        print(f"  OK {arquivo.relative_to(RAIZ)} ({arquivo.stat().st_size // 1024} KB)")

    def elemento(self, page, nome, seletor, margem=0, altura_max=None):
        """Recorta um elemento da página, com uma margem em volta."""
        caixa = page.locator(seletor).first.bounding_box()
        rolagem = page.evaluate("[window.scrollX, window.scrollY]")
        altura = caixa["height"] + 2 * margem
        if altura_max:
            altura = min(altura, altura_max)
        self.salvar(page, nome, clip={
            "x": max(caixa["x"] + rolagem[0] - margem, 0),
            "y": max(caixa["y"] + rolagem[1] - margem, 0),
            "width": caixa["width"] + 2 * margem,
            "height": altura,
        })


# Larguras das versões menores. O navegador escolhe pelo srcset a menor que cobre
# o espaço da imagem na tela; reduzir aqui, com Lanczos e um leve reforço de
# nitidez, deixa o texto das telas bem mais firme do que a redução do navegador.
LARGURAS = (160, 240, 320, 480, 640, 960, 1280, 1920)


# Recortes que aparecem no lugar da tela inteira: arquivo de origem, nome do
# recorte e a região em px CSS (x0, y0, x1, y1). No sorteio, o cadastro é uma tela
# muito alta para um celular e o vencedor fica melhor sem o fundo da janela; no
# sistema de T.I, o histórico do chamado é a peça legível da capa da página inicial.
RECORTES = {
    "sistema-ti": [
        ("chamado-detalhe", "historico-foco", (850, 170, 1250, 420)),
    ],
    "sorteio-evento": [
        ("cadastro", "cadastro-foco", (0, 0, 412, 740)),
        ("vencedor", "vencedor-cartao", (40, 39, 540, 406)),
    ],
}


def recortar(pasta):
    """Gera os RECORTES do projeto desta pasta, em PNG 2x (a escada de tamanhos vem depois)."""
    from PIL import Image

    for origem, nome, (x0, y0, x1, y1) in RECORTES.get(pasta.name, []):
        with Image.open(pasta / f"{origem}.png") as img:
            img.crop((x0 * ESCALA, y0 * ESCALA, x1 * ESCALA, y1 * ESCALA)).save(pasta / f"{nome}.png", optimize=True)
        print(f"  OK {(pasta / nome).relative_to(RAIZ)}.png")


def reduzir(pasta):
    """Gera nome-<largura>.webp para cada captura, nas LARGURAS menores que ela."""
    from PIL import Image, ImageFilter

    for antigo in pasta.glob("*-*.webp"):
        if re.fullmatch(r".+-(p|\d+)", antigo.stem):
            antigo.unlink()
    for arquivo in sorted(pasta.glob("*.png")):
        with Image.open(arquivo) as img:
            img = img.convert("RGB")
            feitas = []
            for largura in LARGURAS:
                if largura >= img.width:
                    break
                menor = img.resize((largura, round(img.height * largura / img.width)), Image.LANCZOS)
                if img.width / largura >= 1.5:
                    menor = menor.filter(ImageFilter.UnsharpMask(radius=0.8, percent=70, threshold=2))
                menor.save(arquivo.with_name(f"{arquivo.stem}-{largura}.webp"), quality=92, method=6)
                feitas.append(largura)
        print(f"  OK {arquivo.relative_to(RAIZ)} -> {', '.join(map(str, feitas)) or 'nenhuma (já é pequena)'}")


# ---------- sistema de gestão de T.I ----------
# Rodando com o seed_data num banco só de demonstração (README).
TI_URL = os.environ.get("TI_URL", "http://localhost:8001")
TI_SENHA = os.environ.get("TI_SENHA", "")


def ti_entrar(cap, usuario, caminho, largura=1520, altura=900):
    page = cap.pagina(largura, altura)
    page.goto(f"{TI_URL}/accounts/login/", wait_until="load")
    page.fill("#id_username", usuario)
    page.fill("#id_password", TI_SENHA)
    page.click("button[type='submit']")
    page.wait_for_load_state("load")
    if "/accounts/login/" in page.url:
        raise SystemExit(f"Login falhou para '{usuario}'. Defina TI_SENHA com a senha do seed.")
    ti_abrir(page, caminho)
    return page


def ti_abrir(page, caminho):
    page.goto(f"{TI_URL}/{caminho}", wait_until="load")
    page.wait_for_timeout(1500)  # gráficos e buscas ao vivo


def ti_conteudo(cap, page, nome, altura):
    """Área de conteúdo de uma tela da equipe: sem o menu lateral e a barra do topo."""
    x, y, largura, total = page.evaluate("""() => {
        const main = document.querySelector('#conteudo').getBoundingClientRect();
        const topo = document.querySelector('.navbar-top').getBoundingClientRect();
        return [main.left, topo.bottom, window.innerWidth - main.left,
                document.documentElement.scrollHeight];
    }""")
    y += 3  # a barra do topo deixa uma linha de sombra no começo do conteúdo
    cap.salvar(page, nome, clip={"x": x, "y": y, "width": largura, "height": min(altura, total - y)})


def sistema_ti(cap):
    # as telas de "Mais telas" ficam em assets/img/sistema-ti/telas/: são capturas
    # manuais do autor, e este roteiro não grava nessa pasta (veja o CLAUDE.md)
    telas = [
        # nome, usuário, caminho, altura do recorte, largura da janela
        ("chamados-fila", "admin", "chamados/", 640, 1520),
    ]
    for nome, usuario, caminho, altura, largura in telas:
        if not cap.quer(nome):
            continue
        page = ti_entrar(cap, usuario, caminho, largura)
        ti_conteudo(cap, page, nome, altura)
        page.context.close()

    if cap.quer("chamado-detalhe"):
        page = ti_entrar(cap, "admin", "chamados/")
        page.locator("tr", has_text="Internet lenta no atendimento").locator("a").first.click()
        page.wait_for_load_state("load")
        page.wait_for_timeout(800)
        ti_conteudo(cap, page, "chamado-detalhe", 690)
        page.context.close()

    if cap.quer("portal-abrir"):
        page = ti_entrar(cap, "portal", "portal/", 1280)
        page.fill("#id_titulo", "Monitor não liga depois da troca de mesa")
        page.fill("#id_descricao", "Mudei de mesa ontem e hoje o monitor não dá imagem. "
                                   "O computador liga normalmente e a luz do monitor fica piscando.")
        page.locator("body").click(position={"x": 5, "y": 400})  # tira o foco do campo
        cap.elemento(page, "portal-abrir", ".content-card >> nth=0", margem=12)
        page.context.close()


# ---------- timer de estações ----------
# Servidor próprio para a captura (PORT=3011 python server/server.py): o estado
# fica em memória e este roteiro apaga e recria os cronômetros.
TIMER_URL = os.environ.get("TIMER_URL", "http://localhost:3011")
TIMER_SEM_MARCA = ".brand-logo, .brand-divider, .tablet-logo { display: none !important; }"


def timer_pagina(cap, caminho, largura, altura):
    page = cap.pagina(largura, altura)
    page.goto(f"{TIMER_URL}{caminho}", wait_until="load")
    page.add_style_tag(content=TIMER_SEM_MARCA)
    page.wait_for_timeout(600)
    return page


def timer_estacoes(cap):
    import socketio  # pip install "python-socketio[client]"

    sio = socketio.Client()
    sio.connect(TIMER_URL)
    sio.emit("central:join")

    def enviar(evento, *dados):
        sio.emit(evento, *dados)
        sio.sleep(0.15)

    # volta ao estado inicial (só o auditório 1, parado) e monta oito salas
    for n in range(1, 13):
        enviar("auditorio:reset", n)
    for n in range(12, 1, -1):
        enviar("auditorio:remove", n)
    for _ in range(7):
        enviar("auditorio:add")
    duracoes = {1: 600, 2: 420, 3: 480, 4: 600, 5: 30, 6: 900, 7: 50, 8: 300}
    for n, segundos in duracoes.items():
        enviar("auditorio:setDuration", {"id": n, "seconds": segundos})

    # tablets abertos nas salas 1, 2, 3, 5 e 7; a 6 roda sem tablet de propósito
    tablets = {n: timer_pagina(cap, f"/tablet/{n}", 1280, 800) for n in (1, 2, 3, 5, 7)}
    for page in tablets.values():
        page.mouse.click(640, 400)  # o toque que ativa o som
    for n in (5, 1, 2, 3, 6):
        enviar("auditorio:start", n)
    sio.sleep(33)               # a sala 5 (30 s) chega em "Tempo esgotado"
    enviar("auditorio:pause", 3)
    enviar("auditorio:start", 7)
    sio.sleep(24)               # a sala 7 (50 s) entra nos últimos 30 segundos

    painel = timer_pagina(cap, "/", 1200, 750)
    # o rodapé mostra os IPs reais da máquina: entra um endereço de exemplo
    painel.wait_for_selector(".addresses-primary code")
    painel.evaluate("""() => {
        document.querySelector('.addresses-primary code').innerHTML =
            'http://servidor.local:3001/tablet/<strong>N</strong>';
        const outros = document.querySelector('.addresses-others');
        if (outros) outros.remove();
    }""")
    if cap.quer("painel"):
        cap.salvar(painel, "painel")
    for nome, n in (("tablet-aviso", 7), ("tablet-andamento", 1),
                    ("tablet-pausado", 3), ("tablet-esgotado", 5)):
        if cap.quer(nome):
            cap.salvar(tablets[n], nome)

    painel.context.close()
    for page in tablets.values():
        page.context.close()
    sio.disconnect()


# ---------- sorteio de evento ----------
# App rodando com um banco vazio e EVENT_NAME genérico (README); este roteiro
# cadastra os participantes fictícios pelo próprio formulário.
SORTEIO_URL = os.environ.get("SORTEIO_URL", "http://localhost:5011")
SORTEIO_SENHA = os.environ.get("SORTEIO_SENHA", "")

# Os termos reais do formulário (o valor da categoria profissional, o campo do registro e
# os textos trocados nas capturas) ficam em ferramentas/sorteio.local.json, fora do git:
# eles revelariam o ramo da instituição. Veja o README.
SORTEIO_LOCAL = pathlib.Path(__file__).resolve().parent / "sorteio.local.json"


def sorteio_local():
    if not SORTEIO_LOCAL.exists():
        raise SystemExit(f"Falta {SORTEIO_LOCAL.name} em ferramentas/ (termos reais do formulário; veja o README).")
    return json.loads(SORTEIO_LOCAL.read_text(encoding="utf-8"))


# UF e DDD misturados de propósito: os dados não podem apontar para uma região.
SORTEIO_PESSOAS = [
    # categoria, nome, registro profissional, UF
    ("profissional", "Adriana Moreira Lopes", "48213", "SP"),
    ("profissional", "Bruno Carvalho Dias", "51907", "MG"),
    ("estudante", "Camila Figueiredo Ramos", "", ""),
    ("profissional", "Daniel Azevedo Pinto", "37742", "PR"),
    ("estudante", "Eduarda Nogueira Sales", "", ""),
    ("profissional", "Fábio Monteiro Queiroz", "62015", "RS"),
    ("profissional", "Gabriela Tavares Rezende", "45588", "RJ"),
    ("estudante", "Henrique Bastos Vieira", "", ""),
    ("profissional", "Isabela Cordeiro Matos", "70364", "SP"),
    ("estudante", "João Pedro Siqueira", "", ""),
    ("profissional", "Karina Peixoto Andrade", "33890", "GO"),
    ("profissional", "Leonardo Freitas Barros", "58126", "SC"),
    ("estudante", "Mariana Couto Teles", "", ""),
    ("profissional", "Natália Brito Cavalcanti", "64479", "MG"),
    ("estudante", "Otávio Rangel Macedo", "", ""),
    ("profissional", "Paula Sampaio Guimarães", "29951", "PR"),
    ("estudante", "Rafaela Drummond Assis", "", ""),
    ("profissional", "Sérgio Pacheco Leal", "41203", "RJ"),
    ("estudante", "Tainá Ribeiro Fontes", "", ""),
    ("profissional", "Vinícius Aguiar Moura", "55670", "RS"),
    ("estudante", "Yasmin Falcão Borges", "", ""),
    ("profissional", "Wagner Esteves Paiva", "38817", "SP"),
]


def cpf_ficticio(n):
    """CPF com dígitos verificadores válidos, montado a partir de um número qualquer."""
    base = [int(d) for d in f"{100200300 + n * 7919:09d}"[-9:]]
    for tamanho in (9, 10):
        soma = sum(d * (tamanho + 1 - i) for i, d in enumerate(base[:tamanho]))
        base.append(soma * 10 % 11 % 10)
    return "".join(map(str, base))


# o fundo da app é quase o do portfólio; igualar evita a emenda em volta dos recortes
SORTEIO_FUNDO = "body { background: #F8FAFC !important; }"
# a janela do vencedor sozinha, sem o painel escurecido atrás
SORTEIO_SO_JANELA = (SORTEIO_FUNDO + " header, main > *:not(.modal) { visibility: hidden !important; }"
                     " .modal-backdrop { opacity: 0 !important; }")


def sorteio_tipo(local, categoria):
    """Valor que o formulário usa para a categoria ("profissional" vem do arquivo local)."""
    return local["tipo_profissional"] if categoria == "profissional" else categoria


def sorteio_preencher(page, n, local):
    categoria, nome, registro, uf = SORTEIO_PESSOAS[n]
    page.goto(f"{SORTEIO_URL}/", wait_until="load")
    page.check(f"input[name='tipo'][value='{sorteio_tipo(local, categoria)}']")
    page.fill("#nome", nome)
    if categoria == "profissional":
        page.fill(local["campo_registro"], registro)
        page.select_option("#uf", uf)
    page.fill("#cpf", cpf_ficticio(n))
    partes = unicodedata.normalize("NFD", nome.lower()).encode("ascii", "ignore").decode().split()
    page.fill("#email", f"{partes[0]}.{partes[-1]}@exemplo.com")
    page.fill("#whatsapp", f"119000000{n:02d}")
    page.check("#consentimento")


def sorteio_neutro(page, local):
    """Troca, no texto visível da página, os termos da app pelos neutros ("trocas" do arquivo
    local), para as telas não revelarem o ramo da instituição. A ordem das trocas importa: as
    expressões mais longas vêm antes das partes que elas contêm."""
    page.evaluate("""trocas => {
        const andar = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let no = andar.nextNode(); no; no = andar.nextNode()) {
            let t = no.nodeValue;
            for (const [de, para] of trocas) t = t.split(de).join(para);
            if (t !== no.nodeValue) no.nodeValue = t;
        }
        // textos de exemplo dos campos também aparecem na tela
        document.querySelectorAll('[placeholder]').forEach(el => {
            let t = el.placeholder;
            for (const [de, para] of trocas) t = t.split(de).join(para);
            el.placeholder = t;
        });
    }""", local["trocas"])


def sorteio_conteudo(cap, page, nome):
    """A página sem o cabeçalho, que leva a logo do evento."""
    cap.elemento(page, nome, "main")


def sorteio_evento(cap):
    local = sorteio_local()
    # o público chega pelo QR Code, no celular
    celular = cap.pagina(412, 860, is_mobile=True, has_touch=True)
    for n in range(len(SORTEIO_PESSOAS)):
        sorteio_preencher(celular, n, local)
        ultimo = n == len(SORTEIO_PESSOAS) - 1
        if ultimo and cap.quer("cadastro"):
            celular.add_style_tag(content=SORTEIO_FUNDO)
            celular.locator("h1").click()  # tira o foco do último campo
            sorteio_neutro(celular, local)
            sorteio_conteudo(cap, celular, "cadastro")
        celular.click("#enviar")
        celular.wait_for_load_state("load")
        if "/confirmacao" not in celular.url:
            raise SystemExit(f"Cadastro {n} recusado: use um banco vazio (README).")
    celular.add_style_tag(content=SORTEIO_FUNDO)
    celular.wait_for_timeout(6000)  # espera o confete assentar: ele cobre o texto
    sorteio_neutro(celular, local)
    if cap.quer("confirmacao"):
        cap.elemento(celular, "confirmacao", "#confirmationCard", margem=16)
    celular.context.close()

    page = cap.pagina(1366, 860)
    page.goto(f"{SORTEIO_URL}/qrcode", wait_until="load")
    page.add_style_tag(content=SORTEIO_FUNDO)
    if cap.quer("qrcode"):
        sorteio_conteudo(cap, page, "qrcode")

    page.goto(f"{SORTEIO_URL}/admin/login", wait_until="load")
    page.fill("#usuario", "admin")
    page.fill("#senha", SORTEIO_SENHA)
    page.click("button[type='submit']")
    page.wait_for_load_state("load")
    if "/admin/login" in page.url:
        raise SystemExit("Login do painel falhou. Defina SORTEIO_SENHA.")

    sorteios = ["profissional", "estudante", "profissional"]
    for i, categoria in enumerate(sorteios):
        page.click(f".draw-button[data-tipo='{sorteio_tipo(local, categoria)}']")
        page.wait_for_selector("#drawResult:not([hidden])")
        if i == len(sorteios) - 1 and cap.quer("vencedor"):
            page.wait_for_timeout(6000)  # espera o confete assentar: ele cobre o nome
            estilo = page.add_style_tag(content=SORTEIO_SO_JANELA)
            sorteio_neutro(page, local)
            cap.elemento(page, "vencedor", "#winnerModal .modal-content", margem=40)
            estilo.evaluate("e => e.remove()")
        page.wait_for_timeout(600)
        page.click("#winnerModal .btn-close")
        page.wait_for_load_state("load")  # o painel recarrega ao fechar
        page.wait_for_timeout(600)
    if cap.quer("painel"):
        # abaixo de 992 px a coluna de e-mail some e a tabela cabe inteira; o recorte
        # em 16:10 termina logo depois do cabeçalho da lista, sem cortar uma linha ao meio
        page.set_viewport_size({"width": 944, "height": 860})
        page.add_style_tag(content=SORTEIO_FUNDO)
        page.wait_for_timeout(1500)
        sorteio_neutro(page, local)
        cap.elemento(page, "painel", "main", altura_max=590)
    page.context.close()


PROJETOS = {
    "sistema-ti": sistema_ti,
    "timer-estacoes": timer_estacoes,
    "sorteio-evento": sorteio_evento,
}


def main():
    parser = argparse.ArgumentParser(description="Captura as telas dos projetos do portfólio.")
    parser.add_argument("projeto", nargs="?", choices=sorted(PROJETOS), help="Padrão: todos.")
    parser.add_argument("--apenas", nargs="*", help="Nomes das capturas (ex.: painel tarefas).")
    parser.add_argument("--so-reduzir", action="store_true",
                        help="Não captura nada; só refaz as versões menores das imagens.")
    args = parser.parse_args()
    if args.so_reduzir:
        for nome in ([args.projeto] if args.projeto else PROJETOS):
            print(nome)
            recortar(IMG / nome)
            reduzir(IMG / nome)
        return

    with sync_playwright() as p:
        # o Chromium completo (channel) traz os idiomas; o headless shell só tem inglês
        browser = p.chromium.launch(channel="chromium", args=["--lang=pt-BR"])
        for nome in ([args.projeto] if args.projeto else PROJETOS):
            print(nome)
            cap = Captura(browser, nome, args.apenas)
            PROJETOS[nome](cap)
            print(f"  {cap.feitas} imagem(ns)")
            recortar(cap.pasta)
            reduzir(cap.pasta)
        browser.close()


if __name__ == "__main__":
    main()
