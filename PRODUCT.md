# Product

## Platform

web

## Users

**Em aberto.** O autor ainda não definiu quem é o visitante principal (recrutador, líder técnico ou cliente em potencial) nem o que espera que essa pessoa faça depois da visita. Hoje o objetivo declarado é só apresentar o trabalho, sem mencionar o que ele procura.

Enquanto isso não for decidido, não presuma um público: não escreva texto de venda, de candidatura a vaga nem de oferta de serviço.

## Product Purpose

Portfólio pessoal de Rafael Brandão. Apresenta os sistemas que ele desenvolveu e, para cada um, um estudo de caso com o problema, o funcionamento e as decisões técnicas. O único caminho de contato é o e-mail `rbrandaodev@gmail.com`, visível em todas as páginas; nos estudos de caso a mensagem já sai com o nome do projeto no assunto.

## Positioning

Rafael se descreve como um profissional de T.I que desenvolve: além de infraestrutura e suporte, ele constrói os sistemas internos da instituição onde trabalha, sozinho e de ponta a ponta, do modelo de dados ao deploy.

Os três projetos são ferramentas em uso real, feitas para problemas concretos do dia a dia de uma instituição, e não exercícios ou clones.

O título da página inicial, escolhido pelo autor, é "Sistemas que nascem de necessidades reais", e a frase de abertura fala em pensar além do código: nos processos, nas pessoas e nos problemas a resolver.

## Operating Context

- Cada estudo de caso segue a mesma ordem: o que o sistema precisava resolver, como funciona (com capturas) e as decisões técnicas.
- As capturas são de telas reais dos sistemas, com dados fictícios, e podem ser ampliadas.
- O visitante chega à página inicial, escolhe um projeto e pode voltar à lista ou ir ao contato a partir de qualquer estudo de caso.

## Capabilities and Constraints

- **Site estático**: HTML, CSS e JavaScript puros, sem build e sem dependências. Precisa funcionar aberto direto do disco e sem internet; nada de CDN nem fonte remota.
- **Tudo anônimo**: os projetos são internos de uma instituição e aparecem sem nome, logo, setores, e-mails ou endereços de rede dela. Vale para textos, capturas e para qualquer arquivo do repositório, que é público.
- **Dados fictícios** em todas as capturas, com UF e DDD misturados para não apontar uma região. Nem os textos nem as telas citam o ramo de atuação da instituição: no sorteio as categorias aparecem como "Profissional" e "Estudante" (código PRO-) e o registro profissional como "Registro"; no timer, o endereço dos tablets é genérico.
- **Português do Brasil**, inclusive nomes de classes e variáveis. Não há versão em outro idioma prevista.
- **A lista de projetos vai crescer**: a página inicial e a estrutura de estudos de caso precisam acomodar projetos novos sem redesenho.
- **Publicação** prevista em hospedagem estática (GitHub Pages). Ainda não publicado.
- **Em aberto**: links de perfil (GitHub, LinkedIn). Hoje não há nenhum, por decisão do autor.

## Brand Commitments

- Nome: Rafael Brandão. Não há logo nem marca própria.
- Voz: primeira pessoa, direta e concreta. Os textos explicam o que o sistema faz e por que cada decisão foi tomada, sem adjetivos de autopromoção.

## Evidence on Hand

- Três projetos, cada um com estudo de caso em `projetos/` e capturas em `assets/img/<projeto>/`:
  - **Sistema de gestão de T.I**: Python, Django, PostgreSQL, Docker; 11 módulos e 115 testes.
  - **Timer de estações**: Python, Flask, Socket.IO, React; um painel e até 12 salas.
  - **Sorteio de evento**: Python, Flask, PostgreSQL; 10 rotas e 28 testes.
- As decisões técnicas descritas nos estudos de caso foram conferidas no código de cada sistema.
- As capturas são reproduzíveis por `ferramentas/capturar_telas.py`.

Não existem, e não devem ser inventados: depoimentos, nomes de clientes ou da instituição, números de uso ou de resultado (usuários, tempo economizado, chamados atendidos), certificações, formação ou tempo de experiência. Os itens de "O que o sistema precisava resolver" e os resumos do topo de cada estudo de caso foram escritos pelo autor.

## Product Principles

1. **O trabalho fala primeiro.** Telas reais e decisões concretas vêm antes de qualquer descrição do autor.
2. **Só o que é verdade e verificável.** Nenhum número, resultado ou elogio que não possa ser conferido no código ou confirmado pelo autor.
3. **O anonimato não é negociável.** Na dúvida sobre um detalhe identificar a instituição, ele fica de fora.
4. **Explicar o porquê.** O que diferencia cada projeto é a decisão por trás dele, não a lista de tecnologias.
5. **Crescer sem refazer.** Um projeto novo entra seguindo o mesmo molde dos existentes.

## Accessibility & Inclusion

Não há um padrão formal exigido. O site já anota e mantém o contraste das cores de texto, tem foco visível, texto alternativo em todas as imagens e respeita a preferência por movimento reduzido; trabalhos futuros devem preservar isso.
