/* Demonstração do sorteio de evento.
   Reproduz no navegador, sem servidor, a lógica do sistema: o cadastro no celular valida os campos com as
   mesmas regras e mensagens (CPF pelo dígito verificador, um cadastro por CPF e por registro, consentimento
   obrigatório) e o painel sorteia, por categoria, só entre quem ainda não foi sorteado. Os termos do
   formulário são os neutros das capturas (Profissional, Registro). Os inscritos ficam só na memória da
   página: nada é enviado e tudo some ao recarregar. Script clássico, para funcionar aberto direto do disco. */
(function () {
  'use strict';

  var raiz = document.querySelector('[data-demo-sorteio]');
  if (!raiz) return;

  var UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
  var TIPOS = { profissional: 'Profissional', estudante: 'Estudante' };
  var PLURAIS = { profissional: 'Profissionais', estudante: 'Estudantes' };
  var PREFIXOS = { profissional: 'PRO', estudante: 'EST' };
  var DDDS = ['11', '31', '41', '51', '21', '62', '48', '71', '81', '61', '27', '85'];
  // UF e DDD misturados de propósito: os dados de exemplo não apontam para uma região
  var PESSOAS = [
    ['profissional', 'Adriana Moreira Lopes', '48213', 'SP'], ['profissional', 'Bruno Carvalho Dias', '51907', 'MG'],
    ['estudante', 'Camila Figueiredo Ramos'], ['profissional', 'Daniel Azevedo Pinto', '37742', 'PR'],
    ['estudante', 'Eduarda Nogueira Sales'], ['profissional', 'Fábio Monteiro Queiroz', '62015', 'RS'],
    ['profissional', 'Gabriela Tavares Rezende', '45588', 'RJ'], ['estudante', 'Henrique Bastos Vieira'],
    ['profissional', 'Isabela Cordeiro Matos', '70364', 'SP'], ['estudante', 'João Pedro Siqueira'],
    ['profissional', 'Karina Peixoto Andrade', '33890', 'GO'], ['profissional', 'Leonardo Freitas Barros', '58126', 'SC'],
    ['estudante', 'Mariana Couto Teles'], ['profissional', 'Natália Brito Cavalcanti', '64479', 'MG'],
    ['estudante', 'Otávio Rangel Macedo'], ['profissional', 'Paula Sampaio Guimarães', '29951', 'PR'],
    ['estudante', 'Rafaela Drummond Assis'], ['profissional', 'Sérgio Pacheco Leal', '41203', 'RJ']
  ];
  var EXEMPLOS = ['Lívia Prado Antunes', 'Marcelo Duarte Fonseca', 'Renata Campos Vidal', 'Tiago Lacerda Brandt',
    'Beatriz Amaral Coelho', 'Gustavo Lins Pereira', 'Helena Viana Sobral', 'Caio Mendes Lacerda'];

  /* ---------- regras do sistema ---------- */
  function digitos(v) { return String(v || '').replace(/\D/g, ''); }
  function cpfValido(d) {
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    return [9, 10].every(function (n) {
      var soma = 0;
      for (var i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
      return (soma * 10) % 11 % 10 === Number(d[n]);
    });
  }
  // CPF com dígitos verificadores válidos, montado a partir de nove dígitos quaisquer
  function completarCpf(base) {
    var d = base.split('').map(Number);
    [9, 10].forEach(function (n) {
      var soma = 0;
      for (var i = 0; i < n; i++) soma += d[i] * (n + 1 - i);
      d.push(soma * 10 % 11 % 10);
    });
    return d.join('');
  }
  function sortearInteiro(max) {
    // crypto quando houver: cada participante disponível tem a mesma chance
    if (window.crypto && window.crypto.getRandomValues) {
      var limite = Math.floor(4294967296 / max) * max, x = new Uint32Array(1);
      do { window.crypto.getRandomValues(x); } while (x[0] >= limite);
      return x[0] % max;
    }
    return Math.floor(Math.random() * max);
  }
  var mascaras = {
    cpf: function (d) {
      return d.slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    },
    telefone: function (d) {
      return d.slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
  };
  function cpfFormatado(c) { return c.slice(0, 3) + '.' + c.slice(3, 6) + '.' + c.slice(6, 9) + '-' + c.slice(9); }
  function emailDe(nome) {
    var p = nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/);
    return p[0] + '.' + p[p.length - 1] + '@exemplo.com';
  }
  function hora(d) { return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }

  /* ---------- "servidor": os inscritos em memória ---------- */
  var inscritos = [], proximoId = 1, aoMudar = function () {};
  function inscrever(dados) {
    var p = {
      id: proximoId++, tipo: dados.tipo, nome: dados.nome, registro: dados.registro || null,
      email: dados.email, cpf: dados.cpf, whatsapp: dados.whatsapp, sorteadoEm: null, voce: !!dados.voce
    };
    p.codigo = PREFIXOS[p.tipo] + '-' + ('000' + p.id).slice(-4);
    inscritos.push(p);
    aoMudar();
    return p;
  }
  function cpfUsado(cpf) { return inscritos.some(function (p) { return p.cpf === cpf; }); }
  function registroUsado(reg) { return inscritos.some(function (p) { return p.registro === reg; }); }
  function sortear(tipo) {
    var livres = inscritos.filter(function (p) { return p.tipo === tipo && !p.sorteadoEm; });
    if (!livres.length) return null;
    var p = livres[sortearInteiro(livres.length)];
    p.sorteadoEm = new Date();
    return p;
  }
  function resetar(tipo) {
    var n = 0;
    inscritos.forEach(function (p) { if (p.tipo === tipo && p.sorteadoEm) { p.sorteadoEm = null; n++; } });
    aoMudar();
    return n;
  }
  PESSOAS.forEach(function (x, n) {
    inscrever({
      tipo: x[0], nome: x[1], registro: x[2] ? x[2] + '-' + x[3] : null, email: emailDe(x[1]),
      cpf: completarCpf(String(100200300 + n * 7919).slice(-9)),
      whatsapp: '(' + DDDS[n % DDDS.length] + ') 9' + ('0000' + (8100 + n * 37)).slice(-4) + '-' + ('000' + (n * 263 % 10000)).slice(-4)
    });
  });

  /* ---------- confete ---------- */
  var CORES = ['#2553B7', '#5B82D6', '#9DB7EA', '#7EBC38', '#A9D57A', '#3F7A1C'];
  function confete(alvo) {
    var camada = document.createElement('div');
    camada.className = 'ds-confete';
    camada.style.setProperty('--queda', ((alvo.clientHeight || 400) + 48) + 'px');
    for (var i = 0; i < 60; i++) {
      var s = document.createElement('span');
      s.style.left = Math.random() * 100 + '%';
      s.style.background = CORES[Math.floor(Math.random() * CORES.length)];
      s.style.animationDelay = Math.random() * 0.45 + 's';
      s.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
      s.style.setProperty('--deriva', (Math.random() * 160 - 80).toFixed(0) + 'px');
      s.style.setProperty('--giro', (Math.random() * 900 + 300).toFixed(0) + 'deg');
      if (Math.random() > 0.5) s.className = 'redondo';
      camada.appendChild(s);
    }
    alvo.appendChild(camada);
    setTimeout(function () { camada.remove(); }, 4200);
  }

  /* ---------- celular: cadastro ---------- */
  var form = raiz.querySelector('#ds-form');
  var telaForm = raiz.querySelector('[data-tela="cadastro"]');
  var telaOk = raiz.querySelector('[data-tela="confirmacao"]');
  var rolagem = raiz.querySelector('.ds-tela');
  var alerta = raiz.querySelector('#ds-alerta');
  var aviso = raiz.querySelector('#ds-aviso');
  var campos = {
    nome: form.querySelector('#ds-nome'), registro: form.querySelector('#ds-registro'), uf: form.querySelector('#ds-uf'),
    cpf: form.querySelector('#ds-cpf'), email: form.querySelector('#ds-email'), whatsapp: form.querySelector('#ds-whatsapp'),
    consentimento: form.querySelector('#ds-consentimento')
  };
  UFS.forEach(function (uf) { var o = document.createElement('option'); o.value = o.textContent = uf; campos.uf.appendChild(o); });
  function tipoEscolhido() { var r = form.querySelector('input[name="tipo"]:checked'); return r ? r.value : ''; }
  function mostrarRegistro() {
    var prof = tipoEscolhido() === 'profissional';
    form.querySelector('.ds-so-profissional').hidden = !prof;
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'tipo') { mostrarRegistro(); marcar('tipo', ''); } });
  mostrarRegistro();

  [['cpf', 'cpf'], ['whatsapp', 'telefone']].forEach(function (par) {
    var campo = campos[par[0]];
    campo.addEventListener('input', function () { campo.value = mascaras[par[1]](digitos(campo.value)); });
  });

  // as mesmas mensagens do sistema; '' quando o valor está certo
  var validadores = {
    nome: function (v) { v = v.trim(); return !v ? 'Informe o nome.' : v.length < 3 || v.length > 120 ? 'O nome deve ter entre 3 e 120 caracteres.' : ''; },
    registro: function (v) { return !v.trim() ? 'Informe o número do registro.' : /^\d{4,10}$/.test(v.trim()) ? '' : 'O registro deve ter de 4 a 10 números, sem a UF.'; },
    uf: function (v) { return UFS.indexOf(v) < 0 ? 'Selecione a UF do registro.' : ''; },
    cpf: function (v) {
      var d = digitos(v);
      if (!d) return 'Informe o CPF.';
      if (!cpfValido(d)) return 'Este CPF não é válido. Confira os 11 números.';
      if (cpfUsado(d)) return 'Este CPF já está participando do sorteio. Não é preciso se cadastrar de novo.';
      return '';
    },
    email: function (v) { return !v.trim() ? 'Informe o e-mail.' : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) ? '' : 'Confira o e-mail, por exemplo nome@gmail.com.'; },
    whatsapp: function (v) { return !v.trim() ? 'Informe o WhatsApp.' : digitos(v).length >= 10 && /^[0-9()\-+\s]{10,20}$/.test(v.trim()) ? '' : 'Informe o WhatsApp com DDD, por exemplo (11) 99999-0000.'; },
    consentimento: function () { return campos.consentimento.checked ? '' : 'Para participar, autorize o uso dos dados no sorteio.'; }
  };
  function marcar(nome, mensagem) {
    var campo = nome === 'tipo' ? form.querySelector('.ds-tipos') : campos[nome];
    var id = 'ds-' + nome + '-erro', erro = document.getElementById(id);
    if (mensagem && !erro) {
      erro = document.createElement('p');
      erro.className = 'ds-erro';
      erro.id = id;
      (nome === 'tipo' || nome === 'consentimento' ? campo.parentNode : campo.parentNode).appendChild(erro);
    }
    if (mensagem) erro.textContent = mensagem; else if (erro) erro.remove();
    if (nome === 'tipo') return;
    campo.classList.toggle('ds-invalido', !!mensagem);
    campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    var ajuda = document.getElementById('ds-' + nome + '-ajuda');
    var desc = [ajuda && ajuda.id, mensagem && id].filter(Boolean).join(' ');
    if (desc) campo.setAttribute('aria-describedby', desc); else campo.removeAttribute('aria-describedby');
  }
  // validação ao sair do campo; depois de um erro, revalida enquanto a pessoa corrige
  ['nome', 'registro', 'cpf', 'email', 'whatsapp'].forEach(function (nome) {
    var campo = campos[nome];
    campo.addEventListener('blur', function () {
      var msg = campo.value.trim() ? validadores[nome](campo.value) : '';
      marcar(nome, msg);
      if (msg) aviso.textContent = campo.labels[0].textContent.replace('*', '').trim() + ': ' + msg;
    });
    campo.addEventListener('input', function () { if (campo.classList.contains('ds-invalido')) marcar(nome, validadores[nome](campo.value)); });
  });
  campos.consentimento.addEventListener('change', function () { if (campos.consentimento.checked) marcar('consentimento', ''); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alerta.hidden = true;
    var tipo = tipoEscolhido(), primeiro = null;
    marcar('tipo', tipo ? '' : 'Selecione a categoria.');
    if (!tipo) primeiro = form.querySelector('input[name="tipo"]');
    var nomes = ['nome'].concat(tipo === 'profissional' ? ['registro', 'uf'] : [], ['cpf', 'email', 'whatsapp', 'consentimento']);
    nomes.forEach(function (n) {
      var msg = validadores[n](campos[n].value);
      marcar(n, msg);
      if (msg && !primeiro) primeiro = campos[n];
    });
    ['registro', 'uf'].forEach(function (n) { if (tipo !== 'profissional') marcar(n, ''); });
    var registro = tipo === 'profissional' && !primeiro ? campos.registro.value.trim() + '-' + campos.uf.value : null;
    if (registro && registroUsado(registro)) {
      marcar('registro', 'Este registro já está participando do sorteio. Não é preciso se cadastrar de novo.');
      primeiro = campos.registro;
    }
    if (primeiro) { primeiro.focus(); return; }
    var p = inscrever({
      tipo: tipo, nome: campos.nome.value.trim(), registro: registro, email: campos.email.value.trim().toLowerCase(),
      cpf: digitos(campos.cpf.value), whatsapp: campos.whatsapp.value.trim(), voce: true
    });
    telaOk.querySelector('[data-campo="titulo"]').textContent = 'Pronto, ' + p.nome.split(/\s+/)[0] + '! Você está no sorteio.';
    telaOk.querySelector('[data-campo="categoria"]').textContent = 'Inscrição registrada na categoria ' + TIPOS[p.tipo] + '.';
    telaOk.querySelector('[data-campo="codigo"]').textContent = p.codigo;
    telaForm.hidden = true;
    telaOk.hidden = false;
    rolagem.scrollTop = 0;
    telaOk.querySelector('h3').focus();
    confete(telaOk);
  });

  raiz.querySelector('[data-acao="outra"]').addEventListener('click', function () {
    form.reset();
    ['tipo', 'nome', 'registro', 'uf', 'cpf', 'email', 'whatsapp', 'consentimento'].forEach(function (n) { marcar(n, ''); });
    mostrarRegistro();
    telaOk.hidden = true;
    telaForm.hidden = false;
    rolagem.scrollTop = 0;
    form.querySelector('input[name="tipo"]').focus();
  });

  var nExemplo = 0;
  raiz.querySelector('[data-acao="exemplo"]').addEventListener('click', function () {
    var nome = EXEMPLOS[nExemplo % EXEMPLOS.length], cpf;
    nExemplo++;
    do { cpf = completarCpf(String(sortearInteiro(900000000) + 100000000)); } while (cpfUsado(cpf) || !cpfValido(cpf));
    var prof = nExemplo % 2 === 1;
    form.querySelector('input[name="tipo"][value="' + (prof ? 'profissional' : 'estudante') + '"]').checked = true;
    mostrarRegistro();
    campos.nome.value = nome;
    if (prof) {
      var reg, uf = ['MG', 'SP', 'PR', 'RS', 'BA', 'GO'][nExemplo % 6];
      do { reg = String(sortearInteiro(90000) + 10000); } while (registroUsado(reg + '-' + uf));
      campos.registro.value = reg;
      campos.uf.value = uf;
    }
    campos.cpf.value = mascaras.cpf(cpf);
    campos.email.value = emailDe(nome);
    campos.whatsapp.value = mascaras.telefone(DDDS[(nExemplo * 5) % DDDS.length] + '9' + String(sortearInteiro(90000000) + 10000000));
    campos.consentimento.checked = true;
    ['tipo', 'nome', 'registro', 'uf', 'cpf', 'email', 'whatsapp', 'consentimento'].forEach(function (n) { marcar(n, ''); });
    form.querySelector('.ds-enviar').focus();
  });

  /* ---------- painel de sorteio ---------- */
  var painel = raiz.querySelector('.ds-painel');
  var corpo = painel.querySelector('tbody');
  var contagem = painel.querySelector('.ds-contagem');
  function desenharPainel() {
    var por = { profissional: 0, estudante: 0 }, sorteados = 0;
    inscritos.forEach(function (p) { por[p.tipo]++; if (p.sorteadoEm) sorteados++; });
    painel.querySelector('[data-n="total"]').textContent = inscritos.length;
    painel.querySelector('[data-n="profissional"]').textContent = por.profissional;
    painel.querySelector('[data-n="estudante"]').textContent = por.estudante;
    painel.querySelector('[data-n="sorteados"]').textContent = sorteados;
    contagem.textContent = inscritos.length + ' registro(s) encontrado(s).';
    corpo.textContent = '';
    inscritos.slice().reverse().forEach(function (p) {
      var tr = document.createElement('tr');
      if (p.voce) tr.className = 'ds-voce';
      var c1 = document.createElement('td'), cod = document.createElement('span');
      cod.className = 'ds-codigo'; cod.textContent = p.codigo; c1.appendChild(cod);
      var c2 = document.createElement('td'); c2.textContent = p.nome;
      if (p.voce) { var m = document.createElement('span'); m.className = 'ds-voce-marca'; m.textContent = '(você)'; c2.appendChild(m); }
      var c3 = document.createElement('td'); c3.textContent = TIPOS[p.tipo];
      var c4 = document.createElement('td');
      if (p.sorteadoEm) { var s = document.createElement('span'); s.className = 'ds-sorteado'; s.textContent = hora(p.sorteadoEm); c4.appendChild(s); }
      else c4.textContent = '-';
      [c1, c2, c3, c4].forEach(function (c) { tr.appendChild(c); });
      corpo.appendChild(tr);
    });
  }
  aoMudar = desenharPainel;
  desenharPainel();

  var modal = painel.querySelector('.ds-modal');
  var caixa = modal.querySelector('.ds-modal-caixa');
  var suspense = modal.querySelector('[data-etapa="suspense"]');
  var falha = modal.querySelector('[data-etapa="erro"]');
  var resultado = modal.querySelector('[data-etapa="resultado"]');
  var botoes = painel.querySelectorAll('[data-sortear]');
  var origem = null, espera = null;
  function etapa(nome) { suspense.hidden = nome !== 'suspense'; falha.hidden = nome !== 'erro'; resultado.hidden = nome !== 'resultado'; }
  function fechar() {
    clearTimeout(espera);
    modal.hidden = true;
    botoes.forEach(function (b) { b.disabled = false; });
    desenharPainel();
    if (origem) origem.focus();
  }
  modal.querySelector('.ds-fechar').addEventListener('click', fechar);
  modal.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) fechar(); });

  botoes.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var tipo = botao.getAttribute('data-sortear');
      origem = botao;
      botoes.forEach(function (b) { b.disabled = true; });
      etapa('suspense');
      modal.hidden = false;
      modal.querySelector('.ds-fechar').focus();
      // o sistema também segura o resultado por 2,4 s: o suspense faz parte do sorteio ao vivo
      var p = sortear(tipo);
      espera = setTimeout(function () {
        if (p) {
          resultado.querySelectorAll('[data-campo]').forEach(function (el) {
            var c = el.getAttribute('data-campo');
            el.textContent = c === 'tipo' ? TIPOS[p.tipo] : c === 'cpf' ? cpfFormatado(p.cpf) : c === 'registro' ? (p.registro || '-') : p[c];
          });
          resultado.querySelector('[data-voce]').hidden = !p.voce;
          etapa('resultado');
          confete(caixa);
        } else {
          falha.textContent = 'Nenhum ' + TIPOS[tipo].toLowerCase() + ' disponível para sorteio.';
          etapa('erro');
        }
        botoes.forEach(function (b) { b.disabled = false; });
      }, 2400);
    });
  });

  painel.querySelectorAll('[data-resetar]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var tipo = botao.getAttribute('data-resetar');
      if (!window.confirm('Liberar novamente todos os ' + PLURAIS[tipo].toLowerCase() + ' já sorteados?')) return;
      var n = resetar(tipo);
      contagem.textContent = n + ' ' + TIPOS[tipo].toLowerCase() + '(s) liberado(s) para um novo sorteio.';
    });
  });
})();
