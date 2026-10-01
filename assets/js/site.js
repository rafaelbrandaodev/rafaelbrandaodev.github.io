// nav: fundo sólido ao rolar + menu no celular
var nav = document.getElementById('nav');
function atualizarNav() { nav.classList.toggle('rolado', window.scrollY > 24); }
window.addEventListener('scroll', atualizarNav, { passive: true });
atualizarNav();

var toggle = document.getElementById('nav-toggle');
var links = document.getElementById('nav-links');
var toggleIcone = toggle.querySelector('path');
var ICONE_MENU = toggleIcone.getAttribute('d');
var ICONE_FECHAR = 'M6 6l12 12M18 6L6 18';
function abrirMenu(aberto) {
  links.classList.toggle('aberto', aberto);
  toggle.setAttribute('aria-expanded', aberto);
  toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  toggleIcone.setAttribute('d', aberto ? ICONE_FECHAR : ICONE_MENU);
}
toggle.addEventListener('click', function () { abrirMenu(!links.classList.contains('aberto')); });
links.addEventListener('click', function (e) { if (e.target.closest('a')) abrirMenu(false); });
document.addEventListener('click', function (e) {
  if (links.classList.contains('aberto') && !nav.contains(e.target)) abrirMenu(false);
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && links.classList.contains('aberto')) { abrirMenu(false); toggle.focus(); }
});
nav.addEventListener('focusout', function (e) {
  if (links.classList.contains('aberto') && e.relatedTarget && !nav.contains(e.relatedTarget)) abrirMenu(false);
});

// destaca no menu a seção visível (só links para âncoras desta página)
var linksSecao = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
if (linksSecao.length) {
  var secaoObs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      linksSecao.forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(function (s) { secaoObs.observe(s); });
}

// copiar o e-mail; o rótulo do botão confirma, e volta depois de um instante
document.addEventListener('click', function (e) {
  var botao = e.target.closest('[data-copiar]');
  if (!botao) return;
  var texto = botao.getAttribute('data-copiar');
  var rotulo = botao.getAttribute('data-rotulo') || botao.textContent;
  botao.setAttribute('data-rotulo', rotulo);
  function confirmar(ok) {
    botao.textContent = ok ? 'Endereço copiado' : 'Selecione e copie o endereço';
    setTimeout(function () { botao.textContent = rotulo; }, 2400);
  }
  function copiarPelaSelecao() {
    var campo = document.createElement('textarea');
    campo.value = texto;
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (erro) { ok = false; }
    campo.remove();
    botao.focus();
    confirmar(ok);
  }
  // a área de transferência moderna só existe em contexto seguro; aberto do disco, cai no outro caminho
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(texto).then(function () { confirmar(true); }, copiarPelaSelecao);
  } else {
    copiarPelaSelecao();
  }
});

var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// entrada ao rolar: só o que começa abaixo da primeira tela, para nada piscar ao carregar;
// blocos irmãos entram em sequência, com um pequeno atraso entre eles
if (!menosMovimento && 'IntersectionObserver' in window) {
  var revelarObs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      revelarObs.unobserve(e.target);
      e.target.classList.add('visivel');
      // terminada a entrada, o bloco volta ao normal (sem atraso nas transições dele)
      setTimeout(function () {
        e.target.classList.remove('revelar', 'visivel');
        e.target.style.transitionDelay = '';
      }, 1200);
    });
  }, { rootMargin: '0px 0px -40px 0px' });
  var vistos = [];
  document.querySelectorAll('main .titulo-sec, .projeto, .passos > div, .objetivos, .decisoes-grade > li, .carrossel, .miniaturas.quatro > figure, .tecnologias > div, .fim .email, .fim .acoes, .proximo').forEach(function (el) {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    var ordem = vistos.filter(function (v) { return v.parentNode === el.parentNode; }).length;
    vistos.push(el);
    el.style.transitionDelay = Math.min(ordem, 3) * 90 + 'ms';
    el.classList.add('revelar');
    revelarObs.observe(el);
  });
}

// capas da página inicial em camadas: ao rolar, a peça anda um pouco mais que a tela principal;
// com mouse, a capa inclina seguindo o cursor
var capas = Array.prototype.slice.call(document.querySelectorAll('.projeto .capa'));
if (capas.length && !menosMovimento) {
  var camadaAgendada = false;
  function camadas() {
    camadaAgendada = false;
    var altura = window.innerHeight;
    capas.forEach(function (c) {
      var r = c.getBoundingClientRect();
      var desloc = ((r.top + r.height / 2) - altura / 2) / altura;
      // até 28px para cima ou para baixo, em px inteiros para o texto da captura não borrar
      c.style.setProperty('--desloc', Math.round(Math.max(-1, Math.min(1, desloc)) * 28) + 'px');
    });
  }
  window.addEventListener('scroll', function () {
    if (camadaAgendada) return;
    camadaAgendada = true;
    requestAnimationFrame(camadas);
  }, { passive: true });
  camadas();

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    capas.forEach(function (c) {
      var projeto = c.closest('.projeto');
      projeto.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        var x = Math.max(-.5, Math.min(.5, (e.clientX - r.left) / r.width - .5));
        var y = Math.max(-.5, Math.min(.5, (e.clientY - r.top) / r.height - .5));
        c.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
        c.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg');
      });
      projeto.addEventListener('mouseleave', function () {
        c.style.setProperty('--ry', '0deg');
        c.style.setProperty('--rx', '0deg');
      });
    });
  }
}

// carrossel: a rolagem lateral já funciona sem script; aqui entram as setas e um ponto por página
document.querySelectorAll('[data-carrossel]').forEach(function (carrossel) {
  var trilho = carrossel.querySelector('.carrossel-trilho');
  var itens = Array.prototype.slice.call(trilho.children);
  var suave = menosMovimento ? 'auto' : 'smooth';
  var controles = document.createElement('div');
  controles.className = 'carrossel-controles';
  controles.innerHTML = '<div class="carrossel-pontos"></div><div class="carrossel-setas">' +
    '<button type="button" aria-label="Telas anteriores"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
    '<button type="button" aria-label="Próximas telas"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></div>';
  carrossel.appendChild(controles);
  carrossel.classList.add('ativo');
  var pontos = controles.querySelector('.carrossel-pontos');
  var setas = controles.querySelectorAll('.carrossel-setas button');
  var porPagina = 1;
  var paginas = 1;

  function inicio(i) { return itens[i].offsetLeft - itens[0].offsetLeft; }
  function paginaAtual() {
    if (trilho.scrollLeft >= trilho.scrollWidth - trilho.clientWidth - 2) return paginas - 1;
    return Math.min(paginas - 1, Math.round(trilho.scrollLeft / (inicio(1) * porPagina)));
  }
  function irPara(pagina) {
    pagina = Math.max(0, Math.min(paginas - 1, pagina));
    trilho.scrollTo({ left: inicio(pagina * porPagina), behavior: suave });
  }
  function atualizar() {
    var atual = paginaAtual();
    pontos.querySelectorAll('button').forEach(function (b, i) { b.setAttribute('aria-current', i === atual); });
    var contador = pontos.querySelector('.carrossel-contador');
    if (contador) contador.textContent = (atual + 1) + ' de ' + paginas;
    // o esmaecimento da borda direita indica que a faixa continua; some no fim
    carrossel.classList.toggle('no-fim', atual === paginas - 1);
    setas[0].disabled = atual === 0;
    setas[1].disabled = atual === paginas - 1;
  }
  // quantas telas cabem inteiras na faixa muda com a largura da janela
  function montar() {
    var antes = porPagina;
    porPagina = Math.max(1, Math.floor((trilho.clientWidth + 1) / inicio(1)));
    paginas = Math.ceil(itens.length / porPagina);
    // só refaz os pontos quando o número de telas por página muda
    if (porPagina === antes && pontos.childElementCount) { atualizar(); return; }
    pontos.innerHTML = '';
    // com muitas páginas (no celular, uma tela por vez) os pontos quebrariam a linha: vira um contador
    if (paginas > 6) {
      pontos.innerHTML = '<span class="carrossel-contador"></span>';
      atualizar();
      return;
    }
    for (var i = 0; i < paginas; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Telas ' + (i * porPagina + 1) + ' a ' + Math.min(itens.length, (i + 1) * porPagina) + ' de ' + itens.length);
      b.addEventListener('click', irPara.bind(null, i));
      pontos.appendChild(b);
    }
    atualizar();
  }
  setas[0].addEventListener('click', function () { irPara(paginaAtual() - 1); });
  setas[1].addEventListener('click', function () { irPara(paginaAtual() + 1); });
  var agendado = false;
  trilho.addEventListener('scroll', function () {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () { agendado = false; atualizar(); });
  }, { passive: true });
  window.addEventListener('resize', montar);
  montar();
});

// tela ampliada; a <img> e os botões de passo são criados aqui porque só fazem sentido com script
var lightbox = document.getElementById('lightbox');
if (lightbox) {
  var todos = Array.prototype.slice.call(document.querySelectorAll('.ampliavel'));
  function chave(g) { return g.getAttribute('data-ampliada') || g.querySelector('img').getAttribute('src'); }
  // gatilhos: um por tela; ao fechar, o foco volta para o botão de onde a pessoa abriu, se ainda é a mesma tela
  var gatilhos = todos.filter(function (g, i) {
    return todos.findIndex(function (h) { return chave(h) === chave(g); }) === i;
  });
  var atual = 0;
  var origem = null;
  var lbImg = document.createElement('img');
  var lbLegenda = lightbox.querySelector('figcaption');
  lightbox.querySelector('figure').prepend(lbImg);

  // quem usa leitor de tela ouve a descrição da imagem e, em seguida, o que o botão faz
  todos.forEach(function (g) {
    var aviso = document.createElement('span');
    aviso.className = 'so-leitor';
    aviso.textContent = ' (ampliar)';
    g.appendChild(aviso);
  });

  function botaoPasso(classe, rotulo, caminho, passo) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'passo ' + classe;
    b.setAttribute('aria-label', rotulo);
    b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + caminho + '"/></svg>';
    b.addEventListener('click', function () { mostrar(atual + passo); });
    lightbox.appendChild(b);
    return b;
  }
  var passos = gatilhos.length > 1 ? [
    botaoPasso('anterior', 'Tela anterior', 'M15 6l-6 6 6 6', -1),
    botaoPasso('seguinte', 'Próxima tela', 'M9 6l6 6-6 6', 1)
  ] : [];

  function mostrar(indice) {
    atual = (indice + gatilhos.length) % gatilhos.length;
    var gatilho = gatilhos[atual];
    var img = gatilho.querySelector('img');
    // data-ampliada permite abrir uma imagem diferente da que aparece na página
    lbImg.src = gatilho.getAttribute('data-ampliada') || img.getAttribute('src');
    lbImg.alt = img.alt;
    // metade da largura em pixels: as capturas são feitas em densidade 2x (data-densidade="1" nas que não são)
    var largura = gatilho.getAttribute('data-largura') || img.getAttribute('width');
    var densidade = Number(gatilho.getAttribute('data-densidade')) || 2;
    lbImg.style.setProperty('--largura-natural', Math.round(largura / densidade) + 'px');
    var titulo = gatilhos[atual].getAttribute('data-titulo') || '';
    lbLegenda.textContent = gatilhos.length > 1 ? titulo + ' · ' + (atual + 1) + ' de ' + gatilhos.length : titulo;
    lightbox.scrollTo(0, 0);
  }

  document.addEventListener('click', function (e) {
    var gatilho = e.target.closest('.ampliavel');
    if (!gatilho) return;
    if (!lightbox.showModal) { window.open(gatilho.getAttribute('data-ampliada') || gatilho.querySelector('img').getAttribute('src'), '_blank'); return; }
    origem = gatilho;
    mostrar(gatilhos.findIndex(function (g) { return chave(g) === chave(gatilho); }));
    lightbox.showModal();
  });
  lightbox.addEventListener('click', function (e) {
    // no celular a figura ocupa a janela inteira: tocar fora da imagem também fecha
    if (e.target === lightbox || e.target.tagName === 'FIGURE' || e.target.closest('.fechar')) lightbox.close();
  });
  lightbox.addEventListener('keydown', function (e) {
    if (!passos.length) return;
    if (e.key === 'ArrowLeft') mostrar(atual - 1);
    if (e.key === 'ArrowRight') mostrar(atual + 1);
  });
  // ao fechar, o foco volta para a captura que está sendo vista, não para a que abriu
  lightbox.addEventListener('close', function () {
    (origem && chave(origem) === chave(gatilhos[atual]) ? origem : gatilhos[atual]).focus();
  });
}
