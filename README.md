# Portfólio — Rafael Brandão

Site estático (HTML, CSS e JavaScript puros, sem build) com a apresentação e os estudos de caso dos meus projetos.

## Estrutura

```
index.html                     página inicial: apresentação, projetos, tecnologias, contato
projetos/
  sistema-gestao-ti.html       estudo de caso do sistema de gestão de T.I
  timer-estacoes.html          estudo de caso do timer de estações
  sorteio-evento.html          estudo de caso do sorteio de evento
assets/
  css/estilo.css               estilos de todas as páginas (cores, tipografia, nav, rodapé, tela ampliada)
  css/estudo.css               estilos dos estudos de caso (ficha, passo a passo, decisões, galeria)
  js/site.js                   menu, destaque da seção atual, copiar e-mail e tela ampliada
  icones/                      ícone da aba e da tela inicial do celular
  fontes/                      Manrope (local, funciona offline) e a licença dela
  img/<projeto>/               capturas de cada projeto (nome.png), os recortes do sorteio (cadastro-foco, vencedor-cartao)
                               e as versões menores e nítidas de todas (nome-320.webp ... nome-1920.webp)
ferramentas/
  capturar_telas.py            gera as capturas de todos os projetos (não faz parte do site)
  gerar_compartilhamento.py    gera o ícone e as imagens de prévia de link (assets/img/compartilhar/)
```

Para ver localmente, abra o `index.html` no navegador. Nada precisa ser instalado.

## Antes de publicar

Procure por `a-definir` nos arquivos `.html`: é a marca usada para conteúdo pendente, e não deve sobrar nenhuma.

Hoje não há nenhuma. As tags de prévia de link (`og:url` e `og:image`), no `<head>` de cada página, apontam para `https://rbrafazin.github.io/portfolio/`; WhatsApp, LinkedIn e afins só mostram a imagem de prévia com o endereço completo. Se o site mudar de endereço (um domínio próprio, por exemplo), troque nas quatro páginas.

## Adicionar um projeto

1. Copie um dos arquivos de `projetos/` com o nome do novo projeto e troque o conteúdo. O menu é o mesmo em todos (Projetos, Como funciona, Decisões, Telas, Contato); tire só o item da seção que a página não tiver.
2. Coloque as capturas em `assets/img/<nome-do-projeto>/`, e gere as versões menores com `python ferramentas/capturar_telas.py --so-reduzir`. Cada tela entra num aparelho (janela, tablet ou celular).
3. Adicione um bloco `<a class="projeto">` com a `.capa` do projeto dentro de `.projetos`, no `index.html`. A capa alterna de lado sozinha; componha-a diferente das outras.
4. No fim de cada estudo de caso, o link "Próximo projeto" forma um ciclo: aponte o do último projeto para o novo, e o do novo para o primeiro. Troque também o assunto do e-mail (`?subject=`) pelo nome do projeto.

## Projetos anônimos

Os três projetos são internos de uma instituição e aparecem sem nome, logo, setores, e-mails ou endereços de rede dela. Os textos também não citam o ramo de atuação. Todos os dados das capturas são fictícios, com UF e DDD misturados para não apontar uma região.

- **Sistema de gestão de T.I**: só entra a área de conteúdo das telas, sem a barra do topo e o menu lateral.
- **Timer de estações**: a logo é escondida e o endereço dos tablets vira `servidor.local`.
- **Sorteio de evento**: o evento recebe um nome genérico, o cabeçalho, que leva a logo, fica de fora, e os termos da app que revelariam o ramo são trocados na tela antes de cada captura (as "trocas" de `ferramentas/sorteio.local.json`): as categorias viram "Profissional" e "Estudante", o código vira PRO- e o registro profissional vira "Registro".

Ao trocar uma captura, confira de novo que ela não mostra nada que identifique a instituição.

## Refazer as capturas

`ferramentas/capturar_telas.py` abre cada projeto rodando na sua máquina e salva as imagens em `assets/img/`. Requer Python com `playwright`, `python-socketio[client]` e `pillow`, e o Chromium do Playwright (`playwright install chromium`).

Cada projeto roda em uma cópia separada, para não tocar nos dados nem nos servidores de uso. Os comandos abaixo partem da pasta de cada repositório.

**Sistema de gestão de T.I** — banco só de demonstração, na porta 8001:

```bash
docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "CREATE DATABASE portfolio_demo"'
docker compose run -d --name ti_portfolio_demo -p 8001:8000 \
  -e DB_NAME=portfolio_demo -e SEED_ADMIN_PASS=<senha> -e SEED_USER_PASS=<senha> \
  -e EMAIL_HOST=localhost -e EMAIL_PORT=1 -e DEBUG=True \
  web sh -c "python manage.py migrate --noinput && python manage.py seed_data && python manage.py runserver 0.0.0.0:8000"
```

`EMAIL_HOST=localhost` e `EMAIL_PORT=1` impedem o envio dos avisos de chamado durante o seed. Ao terminar: `docker rm -f ti_portfolio_demo` e `DROP DATABASE portfolio_demo`.

**Timer de estações** — outro servidor, na porta 3011 (o estado fica em memória):

```bash
PORT=3011 python server/server.py
```

**Sorteio de evento** — banco SQLite vazio, na porta 5011:

```bash
SECRET_KEY=demo ADMIN_USERNAME=admin ADMIN_PASSWORD=<senha> \
DATABASE_URL=sqlite:///C:/caminho/sorteio_demo.db EVENT_NAME="Congresso 2026" \
SORTEIO_INFO="O sorteio acontece ao fim do evento, aqui no local. Esteja presente!" \
PUBLIC_BASE_URL=https://sorteio.exemplo.com.br \
.venv/Scripts/python -m flask --app wsgi run -p 5011
```

O roteiro cadastra os participantes pelo formulário, então o banco precisa estar vazio a cada execução.

Os termos reais do formulário (o valor da categoria profissional, o campo do registro e os textos que são trocados nas capturas) ficam em `ferramentas/sorteio.local.json`, que fica fora do git porque revelaria o ramo da instituição. Numa máquina nova, crie esse arquivo antes de capturar o sorteio, com as chaves `tipo_profissional`, `campo_registro` e `trocas` (uma lista de pares `["texto da app", "texto neutro"]`).

**Capturar**, na pasta do portfólio:

```bash
TI_SENHA=<senha> SORTEIO_SENHA=<senha> python ferramentas/capturar_telas.py            # tudo
python ferramentas/capturar_telas.py timer-estacoes --apenas painel                    # só uma
```

Depois de capturar, o roteiro gera versões de cada captura em 320, 480, 640, 960, 1280 e 1920 px de largura, reduzidas com Lanczos e um leve reforço de nitidez. O `srcset` de cada imagem lista essas versões e o `sizes` informa a largura em que ela aparece; assim o navegador baixa uma versão do tamanho certo em vez de encolher a captura inteira, o que borra o texto das telas. Se o layout mudar a largura de uma imagem, ajuste o `sizes` dela. Se a captura mudar de tamanho, atualize o `width` e o `height` da `<img>` e as larguras do `srcset`.

## Publicar

Qualquer hospedagem de site estático serve. No GitHub Pages:

1. O repositório é `https://github.com/rbrafazin/portfolio`, **público**, criado vazio (sem README, sem `.gitignore`, sem licença).
2. Na pasta do portfólio:
   ```bash
   git remote add origin https://github.com/rbrafazin/portfolio.git
   git push -u origin main
   ```
   Na primeira vez o Git abre o navegador para você entrar na conta do GitHub.
3. No repositório, **Settings → Pages → Build and deployment**: em *Source* escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve. Em um ou dois minutos o site fica em `https://rbrafazin.github.io/portfolio/`.

O arquivo `.nojekyll` na raiz faz o GitHub Pages servir os arquivos como estão, sem processá-los.

Para conferir a prévia de link depois de publicado, cole o endereço no [Post Inspector do LinkedIn](https://www.linkedin.com/post-inspector/). Se mudar a imagem de prévia, rode `python ferramentas/gerar_compartilhamento.py`.

## Créditos

Fonte [Manrope](https://github.com/googlefonts/manrope), dos autores do projeto Manrope, sob a licença SIL Open Font License 1.1 (texto em `assets/fontes/OFL.txt`). O site usa o subconjunto latino da versão variável.
