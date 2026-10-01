---
name: Portfólio de Rafael Brandão
description: Registro calmo e confiante dos sistemas que ele construiu, com as telas reais em primeiro plano.
colors:
  navy-0: "#070F1C"
  navy: "#0B1A2E"
  navy-2: "#10284A"
  fundo: "#FFFFFF"
  fundo-suave: "#F8FAFC"
  tinta: "#0F1E30"
  texto-2: "#4F5E70"
  no-escuro: "#E6EDF6"
  no-escuro-2: "#A9BDD5"
  acao: "#2563EB"
  acao-forte: "#1D4ED8"
  destaque: "#7CB7FF"
  borda: "#E2E8F0"
  etiqueta-fundo: "#E8F0FB"
  etiqueta-tinta: "#1E3A5F"
  codigo-fundo: "#EEF2F7"
  borda-no-escuro: "rgba(255,255,255,.38)"
typography:
  display:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "60px"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.032em"
  display-inicio:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(34px, 5.4vw, 76px)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.036em"
  lead-inicio:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(17px, 1.5vw, 21px)"
    fontWeight: 400
    lineHeight: 1.6
  link-descer:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.6
  headline:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "38px"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.026em"
  title:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  subtitle:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.6
  label-small:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.6
  caption:
    fontFamily: "'Manrope', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.6
  mono:
    fontFamily: "ui-monospace, 'Cascadia Code', Consolas, monospace"
    fontSize: "0.88em"
    fontWeight: 400
rounded:
  codigo: "4px"
  etiqueta: "6px"
  link-nav: "8px"
  botao: "10px"
  janela: "12px"
  tablet: "22px"
  celular: "26px"
  celular-tela: "19px"
spacing:
  margem-lateral: "24px"
  entre-blocos: "48px"
  titulo-de-secao: "44px"
  entre-projetos: "96px"
  secao: "104px"
components:
  button-primary:
    backgroundColor: "{colors.acao}"
    textColor: "{colors.fundo}"
    rounded: "{rounded.botao}"
    padding: "0 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.acao-forte}"
  button-secondary:
    textColor: "{colors.no-escuro}"
    rounded: "{rounded.botao}"
    padding: "0 22px"
    height: "48px"
  tag:
    backgroundColor: "{colors.etiqueta-fundo}"
    textColor: "{colors.etiqueta-tinta}"
    rounded: "{rounded.etiqueta}"
    padding: "3px 10px"
  nav-link:
    textColor: "{colors.fundo}"
    rounded: "{rounded.link-nav}"
    padding: "8px 12px"
  janela:
    backgroundColor: "{colors.fundo-suave}"
    rounded: "{rounded.janela}"
  janela-barra:
    backgroundColor: "#EDF1F6"
    textColor: "{colors.texto-2}"
    typography: "{typography.caption}"
    height: "30px"
  tablet:
    backgroundColor: "{colors.tinta}"
    rounded: "{rounded.tablet}"
    padding: "10px"
  celular:
    backgroundColor: "{colors.tinta}"
    rounded: "{rounded.celular}"
    padding: "7px"
---

# Design System: Portfólio de Rafael Brandão

## Overview

**Creative North Star: "O Diário de Obra"**

O site é o registro do que foi construído e por quê. Cada projeto entra como uma obra entregue: primeiro a tela real do sistema, depois o problema, o funcionamento e as decisões anotadas uma a uma, na ordem em que um colega gostaria de ouvir. O visual existe para sustentar esse registro, e não para competir com ele.

O tom é calmo e confiante. As páginas respiram: seções altas, uma ideia por faixa, texto em colunas estreitas e fáceis de ler. A confiança vem de mostrar o trabalho de verdade, e não de efeitos: cada tela aparece inteira, reduzida dentro do aparelho em que o sistema roda, e abre no tamanho real quando clicada. Os componentes são claros e convidativos: fica óbvio o que é clicável e para onde leva, sem que os botões disputem a atenção com as telas.

A estrutura é de faixas: o topo em azul-marinho profundo abre cada página, as seções claras alternam entre branco e um cinza-azulado quase branco, e o fechamento volta ao marinho. Dentro dessa moldura, os aparelhos com as telas dos sistemas são os únicos objetos que se destacam do plano.

**Key Characteristics:**
- As telas reais dos sistemas são o conteúdo principal, cada uma na janela, no tablet ou no celular em que roda; o site é a moldura.
- Faixas horizontais alternadas (marinho, branco, cinza-azulado) no lugar de cartões.
- Uma única família tipográfica, com hierarquia por peso e tamanho.
- Um só azul de ação, reservado ao que é clicável.
- Tudo local e estático: nenhuma fonte, script ou imagem vem de fora.

## Colors

Uma paleta de azuis frios em torno de um marinho profundo, com um único azul vivo para ação.

### Primary
- **Azul de Ação** (`acao`): o que pode ser clicado em fundo claro ou como preenchimento: botão principal, "Ver estudo de caso", foco do teclado, cursor de texto. Também é a cor de `accent-color`.
- **Azul de Ação Firme** (`acao-forte`): o mesmo azul no hover.

### Secondary
- **Azul de Destaque** (`destaque`): a ênfase sobre o marinho, onde o Azul de Ação não teria contraste. Aparece no foco dentro de regiões escuras, na seta do próximo projeto e na seleção de texto. O título do topo é todo branco.

### Neutral
- **Marinho Noturno** (`navy-0`): o tom mais escuro; início do degradê do topo, rodapé e barra de navegação depois da rolagem.
- **Marinho** (`navy`): o corpo do topo e a faixa de fechamento de cada página.
- **Marinho Claro** (`navy-2`): fim do degradê do topo.
- **Papel** (`fundo`): fundo das seções de leitura.
- **Papel Frio** (`fundo-suave`): fundo das faixas que exibem telas e o fundo interno das janelas. É igual ao fundo das telas dos sistemas.
- **Tinta** (`tinta`): títulos e texto principal em fundo claro.
- **Tinta Secundária** (`texto-2`): parágrafos de apoio, legendas e descrições.
- **Névoa** (`no-escuro`): texto principal sobre o marinho.
- **Névoa Azulada** (`no-escuro-2`): texto de apoio sobre o marinho.
- **Linha** (`borda`): divisórias de 1px entre faixas.
- **Contorno sobre o Marinho** (`borda-no-escuro`): a borda dos controles em fundo escuro (botão secundário, botão do menu, botões da tela ampliada). Branco a 38%, o mínimo que dá 3:1 contra o marinho.
- **Etiqueta** (`etiqueta-fundo` com `etiqueta-tinta`): as etiquetas de tecnologia.
- **Fundo de Código** (`codigo-fundo`): trechos de código dentro das decisões técnicas.

### Named Rules
**A Regra do Azul Único.** O Azul de Ação marca só o que é clicável. Não entra em fundo decorativo, ícone ilustrativo nem título. Sobre o marinho, a ênfase é do Azul de Destaque.

**A Regra do Contraste Anotado.** Toda cor de texto carrega, ao lado da variável, o contraste medido contra o seu fundo. Mudou a cor, refaz a conta e atualiza a anotação. Texto de apoio sobre o marinho é azulado, nunca cinza.

## Typography

**Display Font:** Manrope (com `-apple-system`, `Segoe UI`, Roboto, `Helvetica Neue`, Arial)
**Body Font:** Manrope
**Label/Mono Font:** `ui-monospace`, `Cascadia Code`, Consolas, só para código

**Character:** Uma família só, geométrica e amigável, escolhida pelo autor entre seis opções. Servida do próprio site em um arquivo variável (pesos de 200 a 800). Os títulos são pesados e compactos, com o espaçamento apertado; o texto corrido é aberto e tranquilo. O contraste entre título e texto é o que dá o tom confiante sem precisar de uma segunda fonte. O "I" maiúsculo é uma haste simples, mas tem a altura das maiúsculas, então "T.I" continua legível.

### Hierarchy
- **Display** (800, 60px, 1.04, -0.032em): o título do topo de cada página. Na página inicial ele é a imagem do topo: cresce com a tela, de 34px a 76px (`clamp(34px, 5.4vw, 76px)`), com entrelinha de 1 e espaçamento de -0,036em. Cai para 40px abaixo de 800px de largura. Largura máxima de 15ch nos estudos de caso e 22ch na página inicial, onde o título é uma frase.
- **Headline** (800, 38px, 1.12, -0.026em): o título de cada seção. 30px no celular.
- **Title** (800, 30px, 1.15, -0.025em): o nome de cada projeto na página inicial.
- **Subtitle** (700, 21 a 22px, 1.3, -0.015em): os passos do fluxo e o nome de cada decisão técnica.
- **Lead** (400, 18 a 19px, 1.6): a frase de abertura do topo e o subtítulo das seções. Largura máxima de 58 a 62ch.
- **Body** (400, 17px, 1.6): texto corrido, em colunas de até 68ch. 16px no celular.
- **Label** (600, 15px): navegação e legendas de captura.
- **Label pequeno** (500, 14px): etiquetas de tecnologia e rótulos da ficha.
- **Mono** (0,88em): trechos de código dentro das decisões técnicas.
- **Caption** (600, 12px): o nome da tela na barra de cada janela.

### Named Rules
**A Regra de Uma Família.** A hierarquia vem de peso e tamanho, nunca de uma segunda fonte. A fonte monoespaçada aparece só onde há código de verdade.

**A Regra do Título Equilibrado.** Títulos usam `text-wrap: balance` e parágrafos usam `text-wrap: pretty`. Nenhum título fica com uma palavra sozinha na última linha.

## Layout

Coluna central de até 1160px com 24px de margem lateral. As páginas são uma sequência de faixas de largura total, cada uma com uma ideia: cada seção tem 104px de respiro em cima e 96px embaixo (76 e 68 no celular), e o título de seção fica a 44px do conteúdo.

Na página inicial o topo ocupa a primeira tela inteira, com o título e o parágrafo centralizados na vertical e o convite "Ver os 3 projetos" (18px) no pé da faixa. É escolha do autor: o fundo azul cobre a tela toda e os projetos só aparecem quando a pessoa desce. A seta do convite oscila devagar e para com movimento reduzido. O fundo é liso, só o degradê marinho: o autor experimentou uma grade de planta técnica com brilho e preferiu sem.

As composições de duas colunas são assimétricas, sempre em frações de doze: capa em 7 e texto em 5 na lista de projetos. Na lista de projetos a captura alterna de lado a cada item, e os projetos ficam a 96px um do outro.

Abaixo de 880px tudo vira uma coluna só. Na lista de projetos a captura vem antes do texto; nos passos do fluxo, o título do passo vem antes da captura que ele descreve. Abaixo de 800px a navegação recolhe em um botão e a tipografia desce um degrau.

No topo dos estudos de caso, a capa do projeto (até 920px de largura) atravessa a divisa entre o marinho e a seção clara: fica dois terços sobre o escuro e um terço sobre o claro.

Os estudos de caso são resumidos de propósito, para serem lidos de passagem (escolha do autor): seções mais baixas (80px em cima, 72 embaixo), o que o sistema precisava resolver (em quatro itens com marcador quadrado em Tinta, `.objetivos`), o passo a passo em três colunas com a tela embaixo de cada passo, três decisões à vista, em três colunas, e as outras recolhidas em "Ver mais N decisões", e as telas extras em uma grade de miniaturas (três por linha; os tablets do timer, quatro). No sistema de T.I são 12 telas do mesmo tamanho, cada uma com o nome da tela na barra da janela e na legenda, num carrossel (escolha do autor, para não mostrar as 12 de uma vez). O clique em qualquer miniatura abre a tela no tamanho real. Os passos do sistema de T.I e do sorteio levam `.iguais`: toda janela da grade tem a mesma proporção (16:10), e a tela entra inteira, sem corte, alinhada pelo topo. A sobra fica com a cor do fundo das telas e some na janela. No sorteio, o par de celulares do passo do meio ocupa 87% da coluna, para ter a mesma altura das janelas ao lado. Os tablets do timer já têm todos a mesma proporção. Um estudo de caso cabe em umas 4 telas de rolagem; o do sistema de T.I, em umas 5,5.

## Elevation & Depth

O site é plano. A separação entre áreas vem da troca de fundo entre faixas e de linhas de 1px, não de sombra. A única exceção são os aparelhos com as telas dos sistemas, que flutuam levemente sobre a página para se distinguirem dela.

### Shadow Vocabulary
- **Aparelho em repouso** (`box-shadow: 0 1px 3px rgba(15,30,48,.1), 0 14px 32px -14px rgba(15,30,48,.28)`): toda janela, tablet e celular.
- **Capa sob o cursor**: na página inicial, a capa inteira de um projeto sobe 4px, inclina até 8° seguindo o mouse e a peça sobreposta avança para a frente; as sombras continuam as de repouso.
- **Aparelho do topo** (`box-shadow: 0 2px 4px rgba(7,15,28,.2), 0 40px 80px -32px rgba(7,15,28,.55)`): os aparelhos da capa de um estudo de caso, sobre o marinho.

### Named Rules
**A Regra de Só o Aparelho Flutua.** Sombra é exclusiva dos aparelhos com as telas dos sistemas. Botões, etiquetas, faixas e blocos de texto não têm sombra.

**A Regra da Tela Inteira.** Cada aparelho mostra a tela completa do sistema, reduzida para caber, sem corte. O detalhe fica para a ampliação: clicar abre a tela no tamanho real. É escolha do autor, que preferiu mostrar tudo a mostrar legível. Exceções: no sorteio, o cartão do vencedor aparece sem o fundo da janela e o celular mostra o começo do cadastro, que inteiro é alto demais para um celular; e nas capas da página inicial a peça sobreposta é sempre legível (o histórico do chamado no sistema de T.I, o tablet no timer, o cadastro no sorteio), porque ali ninguém clicou ainda. Clicar abre a tela completa.

## Motion

Movimento a serviço da leitura, pedido pelo autor para deixar o site mais vivo. Tudo é feito com CSS e o `site.js`, sem biblioteca, e some por completo com `prefers-reduced-motion: reduce`. A curva padrão é `cubic-bezier(.16,1,.3,1)`, que desacelera no fim.

- **Entrada ao rolar** (`.revelar` → `.visivel`): títulos de seção, projetos, passos, itens de decisão, o carrossel, as tecnologias e o fecho surgem com fade e sobem 16px, uma vez só. Só o que começa abaixo da primeira tela recebe o efeito, para nada piscar ao carregar; blocos irmãos entram com 90ms de diferença (até o quarto). As decisões recolhidas entram quando o "Ver mais" é aberto.
- **Capa em camadas** (página inicial): ao rolar, a peça sobreposta anda até 28px a mais que a tela principal, em px inteiros e na hora, sem transição (com transição ela ficaria correndo atrás da página). No computador, a capa inclina até 8° seguindo o cursor e a peça avança 56px para a frente. Em repouso a peça fica no plano da tela, porque à frente ela seria ampliada e o texto da captura borraria.
- **Abertura do estudo de caso**: a tela principal da capa sobe 32px com fade (0,9s), e a peça desliza para o lugar dela 0,35s depois.

**A Regra do Texto Nítido.** Nenhum efeito pode deixar borrado, em repouso, o texto de uma captura: deslocamentos em px inteiros e nada de escala ou profundidade fora da interação.

## Shapes

Cantos suavemente arredondados, em cinco degraus conforme o tamanho do objeto: trechos de código (4px), etiquetas (6px), links da navegação (8px), botões (10px), janelas (12px), tablets (22px) e celulares (26px). As únicas formas circulares são os botões da tela ampliada e a lupa das capturas.

Bordas são sempre de 1px e de baixo contraste. A única linha forte do site é o traço de 2px em Tinta que abre cada coluna da lista de tecnologias.

## Components

Claros e convidativos: o que é clicável tem forma própria e resposta ao cursor, mas nada concorre com as telas dos sistemas.

### Buttons
- **Shape:** cantos de 10px, 48px de altura mínima, 22px de respiro lateral, texto de 16px em peso 600.
- **Primary:** preenchido com o Azul de Ação e texto branco. É um por grupo de ações.
- **Secondary:** sem preenchimento, texto em Névoa e borda de 1px em Contorno sobre o Marinho. Só existe sobre o marinho.
- **Hover / Focus:** o principal escurece para o Azul de Ação Firme; o secundário clareia a borda e ganha um véu branco de 5%. O foco do teclado é um anel de 2px afastado 3px, em Azul de Ação nas áreas claras e Azul de Destaque nas escuras, incluindo a navegação, o rodapé e a tela ampliada.

### Chips
- **Style:** fundo azul muito claro, texto em azul-marinho, cantos de 6px, 14px em peso 500.
- **State:** são informativas, não clicáveis. Listam tecnologias e, quando existe, o número de testes.

### Cards / Containers
- **Janela:** o aparelho das telas de computador. Cantos de 12px, borda de 1px, sombra de aparelho e uma barra de 30px com três pontos neutros e o nome da tela (Caption, Tinta Secundária sobre `#EDF1F6`). O nome na barra é o que dá contexto à tela; nunca leva endereço nem nome da instituição.
- **Tablet e celular:** moldura escura em Tinta, com 10px e 7px de borda, cantos de 22px e 26px (a tela dentro deles, 8px e 19px) e um fio branco a 14% para se destacar sobre o marinho. O timer aparece em tablets e o cadastro do sorteio em celulares, porque é onde rodam.
- **Capa:** a composição que abre cada projeto, na página inicial e no topo do estudo de caso. Uma tela principal (80% da largura) e uma peça sobreposta no canto, diferente em cada projeto: o histórico do chamado sobre a fila no sistema de T.I, o tablet sobre o painel no timer e o celular ao lado do vencedor no sorteio. As três capas não podem parecer iguais. Na página inicial a capa inteira é decorativa para o leitor de tela (`aria-hidden`), porque o link já tem o nome e o texto do projeto.
- **Tela ampliável:** um aparelho que é um botão. Leva uma lupa circular em marinho a 84%, que fica Azul de Ação no hover e no foco: na janela, de 24px, fica na barra, como um controle da própria janela; no tablet e no celular, de 36px, no canto inferior direito. A lupa avisa que a tela abre inteira, porque no toque não há cursor. A ampliação abre a mesma tela no tamanho real.
- **Projeto:** o bloco inteiro da página inicial é um único link. Não tem borda nem fundo; o que responde ao cursor é a capa, que sobe, e o "Ver estudo de caso", que sublinha. As imagens da capa têm texto alternativo vazio, porque o nome do projeto já dá nome ao link.

### Navigation
- **Style:** barra fixa e transparente sobre o topo marinho; depois de 24px de rolagem ganha fundo Marinho Noturno a 97%, sem desfoque (ele não apareceria com esse fundo e pesaria na rolagem). Links de 15px em peso 500, brancos a 80%.
- **States:** no hover e na seção atual, o link fica branco com um véu de 8%.
- **Mobile:** abaixo de 800px os links recolhem em um botão de 44px e abrem em coluna, com alvos de toque altos. O botão troca de ícone e de rótulo ("Abrir menu" e "Fechar menu"), e o menu fecha com Esc ou com um toque fora.
- **Estudos de caso:** o menu é o mesmo em todos: Projetos, Como funciona, Decisões, Telas e Contato. Some só o item cuja seção não existe na página, e os itens seguem a ordem das seções. No sistema de T.I, "Mais telas" vem logo depois do passo a passo (escolha do autor); por isso Telas vem antes de Decisões no menu, e as duas seções trocam de fundo para as faixas continuarem alternando.

### Ficha do projeto
Dois dados no topo de cada estudo de caso, tecnologias e ano (escolha do autor), lado a lado e separados do resumo por uma linha branca a 14%. Rótulo de 14px em Névoa Azulada e valor de 16px em branco. As tecnologias aparecem como etiquetas na versão para o escuro: texto branco, fundo branco a 8% e borda branca a 16%. No celular os dois dados ficam um embaixo do outro.

### Decisões
Grade (`.decisoes-grade`): as três principais em três colunas e as recolhidas em duas (`.duas`). Cada item abre com um fio de 2px em Tinta, como as tecnologias da página inicial, e tem quatro partes alinhadas entre as colunas por subgrid: o tema numa etiqueta (13px), o nome da decisão (20px, 700), uma frase em linguagem simples que diz o que a decisão garante (`.na-pratica`, 17px, 500, em Tinta) e o detalhe técnico (15px, em Tinta Secundária). Assim, quem não é da área lê só a frase, e quem é encontra o detalhe logo embaixo. Abaixo de 880px vira uma coluna.

### Carrossel
Uma faixa de miniaturas que rola para o lado e encaixa em cada tela (`scroll-snap`). No computador mostra três telas e a ponta da quarta, esmaecida na borda direita para indicar que a faixa continua; no celular, uma tela e a ponta da seguinte. Embaixo, à esquerda, um ponto por página (8px, Tinta no atual, cinza-azulado nos outros), que vira um contador "2 de 12" quando passaria de seis; à direita, duas setas circulares de 44px com contorno, que desativam nas pontas. Sem script, a faixa continua deslizando e mostra a barra de rolagem.

### Contato
O endereço de e-mail aparece como texto grande, branco e selecionável, seguido de duas ações: o botão principal, que abre o programa de e-mail, e o secundário, que copia o endereço e confirma no próprio rótulo. Nos estudos de caso, o e-mail já sai com o nome do projeto no assunto.

### Próximo projeto
O fecho de cada estudo de caso: uma linha separada por um fio branco a 14%, com a tela principal do próximo projeto em uma janela pequena, o texto "Próximo projeto:" em Névoa Azulada e o nome em branco, e uma seta em Azul de Destaque. A miniatura sobe 4px no hover.

### Tela ampliada
Um `<dialog>` com fundo quase preto a 88%, a imagem limitada a 84% da altura da janela e a legenda embaixo, com a posição ("3 de 12"). Botões circulares de 44px para fechar e para passar à tela anterior ou à próxima; as setas do teclado também passam. Fecha no botão, no clique fora e no Esc, e o foco volta para a captura que estava sendo vista. Enquanto está aberta, a página atrás não rola.

Abaixo de 800px a tela ampliada ocupa a janela inteira e a imagem abre no tamanho em que o texto dá para ler (até 1100px de largura), para ser arrastada em vez de encolhida.

## Do's and Don'ts

### Do:
- **Do** abrir cada projeto pela tela real do sistema, inteira, dentro do aparelho em que roda, e ampliável.
- **Do** usar as faixas (marinho, Papel, Papel Frio) para separar ideias, com 1px de Linha na divisa quando os dois fundos são claros.
- **Do** manter as colunas em frações de doze (7 e 5, 4 e 7) e a captura antes do texto no celular.
- **Do** reservar o Azul de Ação ao que é clicável e o Azul de Destaque à ênfase sobre o marinho.
- **Do** declarar `width`, `height` e `alt` em toda imagem, `loading="lazy"` nas que ficam abaixo da primeira tela, e o `srcset` com as versões nítidas (320 a 1920) junto de um `sizes` fiel à largura exibida.
- **Do** respeitar `prefers-reduced-motion`: a rolagem suave desliga.

### Don't:
- **Don't** carregar fonte, script, ícone ou imagem de fora. O site precisa funcionar aberto do disco e sem internet.
- **Don't** pôr sombra em nada que não seja um aparelho com a tela de um sistema.
- **Don't** cortar as telas: elas entram inteiras, e o clique mostra o detalhe.
- **Don't** usar o Azul de Ação como texto sobre o marinho; ali a ênfase é do Azul de Destaque.
- **Don't** trazer uma segunda família tipográfica. A monoespaçada é só para código.
- **Don't** mostrar nada que identifique a instituição dos projetos: nome, logo, setores, e-mails ou endereços de rede.
