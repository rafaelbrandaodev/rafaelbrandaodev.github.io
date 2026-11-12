/* Demonstração do timer de estações.
   Reproduz no navegador, sem servidor, a lógica do sistema: o "servidor" (aqui, a página do estudo de caso)
   é a única fonte da verdade e conta o tempo; o painel só manda comandos e cada tablet só mostra o estado
   da própria sala, que recebe do servidor como receberia pelo canal da sala no Socket.IO.
   As regras de cada comando seguem as do servidor do sistema: limites de duração, aviso dos 30 segundos,
   o que vale em cada fase. Script clássico (sem módulo) para funcionar aberto direto do disco. */
(function () {
  'use strict';

  var SEM_SINAL_MS = 2500;    // o servidor manda o estado a cada segundo: nada nesse intervalo, a conexão caiu
  var PARADO_MS = 3000;       // como no sistema: quedas curtas não alarmam a sala
  var ROTULO_PAINEL = { idle: 'Aguardando', running: 'Em andamento', paused: 'Pausado', finished: 'Tempo esgotado' };
  var ROTULO_TABLET = {
    idle: 'Aguardando início', running: 'Em andamento', warning: 'Últimos 30 segundos',
    last10: 'Últimos 10 segundos', paused: 'Pausado', finished: 'Tempo esgotado', stale: 'Sem conexão'
  };
  var DURACOES = [30, 60, 120, 300];

  function formatar(s) {
    var m = Math.floor(s / 60), r = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }
  function formatarDuracao(s) { return s < 60 ? s + ' s' : (s / 60) + ' min'; }
  function criar(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }
  function copiar(t) { return { id: t.id, duration: t.duration, timeLeft: t.timeLeft, phase: t.phase }; }

  /* ---------- sons: os mesmos do sistema, sintetizados (sem arquivo de áudio) ---------- */
  var som = (function () {
    var ctx = null, ativos = [], ligado = false;
    function contexto() {
      if (!ctx) {
        var C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        ctx = new C();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tom(freq, ini, dur, vol) {
      var c = contexto();
      if (!c) return;
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime + ini;
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
      ativos.push(o);
      o.onended = function () { var i = ativos.indexOf(o); if (i > -1) ativos.splice(i, 1); };
    }
    function parar() {
      ativos.forEach(function (o) { try { o.stop(); } catch (e) { /* já parado */ } });
      ativos.length = 0;
    }
    function sino(ini, vol, dur) { tom(660, ini, dur, vol); tom(1760, ini, dur * 0.6, vol * 0.5); }
    return {
      // precisa vir de um clique: o navegador só libera o áudio a partir de um gesto
      ligar: function () { ligado = true; contexto(); tom(880, 0, 0.12, 0.25); },
      desligar: function () { ligado = false; parar(); },
      ligado: function () { return ligado; },
      parar: parar,
      aviso: function () {
        if (!ligado) return;
        parar();
        tom(440, 0, 0.18, 0.5); tom(440, 0.25, 0.18, 0.5); tom(440, 0.5, 0.18, 0.5);
      },
      fim: function () {
        if (!ligado) return;
        parar();
        for (var i = 0; i < 5; i++) sino(i * 0.6, 0.8, 1.4);
        sino(3.5, 0.8, 3);
      }
    };
  })();

  /* ---------- servidor: conta o tempo e distribui o estado ---------- */
  function Servidor() {
    var self = this;
    this.salas = {};
    [[1, 60], [2, 120], [3, 300]].forEach(function (p) {
      // escolhida: a duração da lista; o +30 s aumenta só a rodada atual (duration)
      self.salas[p[0]] = { id: p[0], duration: p[1], escolhida: p[1], timeLeft: 0, phase: 'idle', warned30s: false };
    });
    this.tablets = [];
    this.aoMudar = function () {};
    this.ultimo = Date.now();
    // o relógio confere a hora real: numa aba em segundo plano o navegador atrasa os timers,
    // e a contagem recupera os segundos perdidos em vez de atrasar
    setInterval(function () { self.tique(); }, 250);
  }
  // cada tablet só recebe a própria sala, como os canais do Socket.IO no sistema
  Servidor.prototype.enviar = function (sala, msg) {
    msg.sala = sala;
    this.tablets.forEach(function (t) { if (t.sala === sala && t.online) t.receber(msg); });
  };
  Servidor.prototype.estado = function (sala) {
    this.enviar(sala, { tipo: 'estado', timer: copiar(this.salas[sala]) });
  };
  Servidor.prototype.conectar = function (tablet) {
    if (this.tablets.indexOf(tablet) < 0) this.tablets.push(tablet);
    if (tablet.online) this.estado(tablet.sala);  // a cada conexão, o tablet recebe o estado atual
    this.aoMudar();
  };
  Servidor.prototype.contarTablets = function (sala) {
    var n = 0;
    this.tablets.forEach(function (t) { if (t.sala === sala && t.online) n++; });
    return n;
  };
  Servidor.prototype.avisarSeFor = function (t) {
    if (t.phase === 'running' && t.timeLeft > 0 && t.timeLeft <= 30 && !t.warned30s) {
      t.warned30s = true;
      this.enviar(t.id, { tipo: 'aviso' });
    }
  };
  Servidor.prototype.tique = function () {
    var self = this, agora = Date.now();
    var passos = Math.min(Math.floor((agora - this.ultimo) / 1000), 3600);
    if (passos < 1) return;
    this.ultimo = agora - ((agora - this.ultimo) % 1000);
    for (var i = 0; i < passos; i++) {
      Object.keys(this.salas).forEach(function (k) {
        var t = self.salas[k];
        if (t.phase !== 'running') return;
        t.timeLeft -= 1;
        if (t.timeLeft <= 0) {
          t.timeLeft = 0;
          t.phase = 'finished';
          self.enviar(t.id, { tipo: 'fim' });
        } else if (t.timeLeft <= 30) {
          self.avisarSeFor(t);
        }
      });
    }
    // todo segundo cada sala recebe o estado: além da contagem, é o sinal de que o servidor está lá
    Object.keys(this.salas).forEach(function (k) { self.estado(Number(k)); });
    this.aoMudar();
  };
  Servidor.prototype.comando = function (nome, sala, valor) {
    var t = this.salas[sala];
    if (!t) return;
    if (nome === 'iniciar') {
      if (t.phase === 'running') return;
      if (t.phase === 'idle' || t.phase === 'finished') { t.duration = t.escolhida; t.timeLeft = t.duration; t.warned30s = false; }
      t.phase = 'running';
      this.avisarSeFor(t);
    } else if (nome === 'pausar') {
      if (t.phase !== 'running') return;
      t.phase = 'paused';
    } else if (nome === 'retomar') {
      if (t.phase !== 'paused' || t.timeLeft <= 0) return;
      t.phase = 'running';
      this.avisarSeFor(t);
    } else if (nome === 'reiniciar') {
      // diferente do sistema, que mantém a duração aumentada: na demonstração, reiniciar volta ao valor da lista
      t.phase = 'idle'; t.timeLeft = 0; t.warned30s = false; t.duration = t.escolhida;
    } else if (nome === 'mais') {
      if (t.phase === 'idle' || t.phase === 'finished') return;
      t.timeLeft += Math.min(Math.max(valor, 5), 3600);
      if (t.timeLeft > 30) t.warned30s = false;
      t.duration = Math.max(t.duration, t.timeLeft);
      this.avisarSeFor(t);
    } else if (nome === 'duracao') {
      var d = Math.min(Math.max(valor, 10), 3600);
      if (t.phase === 'idle') t.timeLeft = 0;
      else { t.timeLeft = d; t.warned30s = false; }
      t.duration = t.escolhida = d;
      this.avisarSeFor(t);
    }
    this.estado(sala);
    this.aoMudar();
  };

  /* ---------- tablet: só exibe o que recebe ---------- */
  function Tablet(tela, sala) {
    var self = this;
    this.tela = tela;
    this.sala = sala;
    this.online = true;
    this.timer = null;
    this.conectado = false;
    this.desde = Date.now();
    this.ultimaMsg = 0;
    this.fase = null;
    this.montar();
    setInterval(function () { self.verificar(); }, 250);
    this.verificar();
  }
  Tablet.prototype.montar = function () {
    var t = this.tela;
    t.textContent = '';
    this.cabeca = criar('div', 'dt-tela-cabeca');
    this.cabeca.appendChild(criar('span', 'dt-tela-sala', 'Sala ' + this.sala));
    this.conexao = criar('span', 'dt-tela-conexao');
    this.cabeca.appendChild(this.conexao);
    this.corpo = criar('div', 'dt-tela-corpo');
    this.corpo.setAttribute('role', 'timer');
    this.rotulo = criar('p', 'dt-tela-rotulo');
    this.tempo = criar('p', 'dt-tela-tempo');
    this.sub = criar('p', 'dt-tela-sub', 'Último tempo recebido — aguardando o servidor');
    this.corpo.appendChild(this.rotulo);
    this.corpo.appendChild(this.tempo);
    this.corpo.appendChild(this.sub);
    this.aviso = criar('div', 'dt-tela-corpo');
    this.avisoTitulo = criar('p', 'dt-tela-titulo');
    this.avisoTexto = criar('p', 'dt-tela-texto');
    this.aviso.appendChild(this.avisoTitulo);
    this.aviso.appendChild(this.avisoTexto);
    this.barra = criar('div', 'dt-tela-barra');
    this.barra.setAttribute('aria-hidden', 'true');
    this.preenchido = criar('div');
    this.barra.appendChild(this.preenchido);
    [this.cabeca, this.corpo, this.aviso, this.barra].forEach(function (e) { t.appendChild(e); });
  };
  Tablet.prototype.receber = function (m) {
    if (m.sala !== this.sala) return;
    this.ultimaMsg = Date.now();
    if (m.tipo === 'estado') this.timer = m.timer;
    else if (m.tipo === 'aviso') som.aviso();
    else if (m.tipo === 'fim') som.fim();
    this.verificar();
  };
  Tablet.prototype.cair = function () { this.ultimaMsg = 0; this.verificar(); };
  Tablet.prototype.verificar = function () {
    var agora = Date.now();
    var con = agora - this.ultimaMsg < SEM_SINAL_MS;
    if (con !== this.conectado) { this.conectado = con; this.desde = agora; }
    this.desenhar(!con && agora - this.desde >= PARADO_MS);
  };
  Tablet.prototype.mensagem = function (titulo, texto) {
    this.tela.className = 'dt-tela';
    this.cabeca.hidden = this.corpo.hidden = this.barra.hidden = true;
    this.aviso.hidden = false;
    this.avisoTitulo.textContent = titulo;
    this.avisoTitulo.className = titulo ? 'dt-tela-titulo' : 'dt-tela-espera';
    this.avisoTexto.textContent = texto;
    this.avisoTexto.hidden = !texto;
  };
  Tablet.prototype.desenhar = function (parado) {
    if (!this.timer) {
      if (!parado) {
        this.mensagem('', '');
        this.avisoTitulo.textContent = 'Conectando ao servidor...';
        this.avisoTitulo.className = 'dt-tela-espera';
      } else {
        this.mensagem('Sem conexão com o servidor', 'Religue o Wi-Fi do tablet: esta tela atualiza sozinha quando a conexão voltar.');
      }
      return;
    }
    var t = this.timer, estado;
    // uma classe por estado visual; "stale" vence tudo porque o tempo pode estar parado
    if (parado) estado = 'stale';
    else if (t.phase === 'finished') estado = 'finished';
    else if (t.phase === 'paused') estado = 'paused';
    else if (t.phase === 'idle') estado = 'idle';
    else if (t.timeLeft <= 10) estado = 'last10';
    else if (t.timeLeft <= 30) estado = 'warning';
    else estado = 'running';
    if (t.phase === 'idle' && this.fase !== 'idle') som.parar();
    this.fase = t.phase;

    var mostrado = t.phase === 'idle' ? t.duration : t.timeLeft;
    var fracao = t.phase === 'idle' ? 1 : t.duration > 0 ? Math.max(0, Math.min(1, t.timeLeft / t.duration)) : 0;
    this.tela.className = 'dt-tela ' + estado;
    this.cabeca.hidden = this.corpo.hidden = this.barra.hidden = false;
    this.aviso.hidden = true;
    this.rotulo.textContent = ROTULO_TABLET[estado];
    this.tempo.textContent = formatar(mostrado);
    this.sub.hidden = !parado;
    this.corpo.setAttribute('aria-label', ROTULO_TABLET[estado] + ', ' + formatar(mostrado));
    this.preenchido.style.transform = 'scaleX(' + fracao + ')';
    if (this.conectado) {
      this.conexao.className = 'dt-tela-conexao ao-vivo';
      this.conexao.textContent = '';
      this.conexao.setAttribute('role', 'img');
      this.conexao.setAttribute('aria-label', 'Conectado ao servidor');
    } else {
      this.conexao.className = 'dt-tela-conexao';
      this.conexao.textContent = 'Reconectando...';
      this.conexao.removeAttribute('role');
      this.conexao.removeAttribute('aria-label');
    }
  };

  /* ---------- painel central: um cartão por sala ---------- */
  function Cartao(servidor, sala, anunciar) {
    var self = this;
    this.servidor = servidor;
    this.sala = sala;
    this.anunciar = anunciar;
    this.confirmando = false;
    this.fase = null;
    var c = this.el = criar('div', 'dt-cartao');
    var cab = criar('div', 'dt-cabeca');
    cab.appendChild(criar('h3', 'dt-nome', 'Sala ' + sala));
    this.selo = criar('span', 'dt-fase');
    cab.appendChild(this.selo);
    var principal = criar('div', 'dt-principal');
    this.tempo = criar('div', 'dt-tempo');
    this.botao = criar('button', 'dt-btn');
    this.botao.type = 'button';
    this.botao.addEventListener('click', function () {
      var f = servidor.salas[sala].phase;
      servidor.comando(f === 'running' ? 'pausar' : f === 'paused' ? 'retomar' : 'iniciar', sala);
    });
    principal.appendChild(this.tempo);
    principal.appendChild(this.botao);

    this.controles = criar('div', 'dt-controles');
    this.mais = criar('button', 'dt-btn dt-secundario', '+30 s');
    this.mais.type = 'button';
    this.mais.setAttribute('aria-label', 'Mais 30 segundos na sala ' + sala);
    this.mais.addEventListener('click', function () { servidor.comando('mais', sala, 30); });
    this.duracao = criar('select', 'dt-duracao');
    this.duracao.setAttribute('aria-label', 'Duração da sala ' + sala);
    DURACOES.forEach(function (s) {
      var o = criar('option', null, formatarDuracao(s));
      o.value = s;
      self.duracao.appendChild(o);
    });
    this.duracao.addEventListener('change', function () { servidor.comando('duracao', sala, Number(self.duracao.value)); });
    this.reiniciar = criar('button', 'dt-btn dt-perigo', 'Reiniciar');
    this.reiniciar.type = 'button';
    this.reiniciar.setAttribute('aria-label', 'Reiniciar sala ' + sala);
    this.reiniciar.addEventListener('click', function () {
      var f = servidor.salas[sala].phase;
      // com a contagem ativa, reiniciar pede confirmação: a contagem atual se perde
      if (f === 'running' || f === 'paused') { self.confirmando = true; self.desenhar(); self.manter.focus(); }
      else servidor.comando('reiniciar', sala);
    });
    [this.mais, this.duracao, this.reiniciar].forEach(function (e) { self.controles.appendChild(e); });

    this.confirmar = criar('div', 'dt-confirmar');
    this.confirmar.setAttribute('role', 'group');
    this.confirmarTexto = criar('p');
    var acoes = criar('div', 'dt-confirmar-acoes');
    var sim = criar('button', 'dt-btn dt-perigo-cheio', 'Reiniciar');
    sim.type = 'button';
    sim.addEventListener('click', function () { self.confirmando = false; servidor.comando('reiniciar', sala); self.botao.focus(); });
    this.manter = criar('button', 'dt-btn dt-secundario', 'Manter contagem');
    this.manter.type = 'button';
    this.manter.addEventListener('click', function () { self.confirmando = false; self.desenhar(); self.reiniciar.focus(); });
    acoes.appendChild(sim);
    acoes.appendChild(this.manter);
    this.confirmar.appendChild(this.confirmarTexto);
    this.confirmar.appendChild(acoes);

    this.presenca = criar('p', 'dt-presenca');
    var prog = criar('div', 'dt-progresso');
    prog.setAttribute('aria-hidden', 'true');
    this.preenchido = criar('div');
    prog.appendChild(this.preenchido);
    [cab, principal, this.controles, this.confirmar, this.presenca, prog].forEach(function (e) { c.appendChild(e); });
  }
  Cartao.prototype.desenhar = function () {
    var t = this.servidor.salas[this.sala], f = t.phase;
    var ativo = f === 'running' || f === 'paused';
    var aviso = f === 'running' && t.timeLeft > 0 && t.timeLeft <= 30;
    // uma confirmação pedida numa fase deixa de valer quando a fase muda
    if (this.fase !== null && this.fase !== f) {
      this.confirmando = false;
      if (f === 'finished' || f === 'paused') this.anunciar('Sala ' + this.sala + ': ' + ROTULO_PAINEL[f].toLowerCase() + '.');
    }
    this.fase = f;
    var mostrado = f === 'idle' ? t.duration : t.timeLeft;
    this.el.className = 'dt-cartao fase-' + f + (aviso ? ' fase-aviso' : '');
    this.selo.textContent = ROTULO_PAINEL[f];
    this.tempo.textContent = formatar(mostrado);
    this.botao.textContent = f === 'running' ? 'Pausar' : f === 'paused' ? 'Retomar' : 'Iniciar';
    this.botao.className = 'dt-btn ' + (f === 'running' ? 'dt-pausar' : 'dt-primario');
    this.botao.setAttribute('aria-label', this.botao.textContent + ' sala ' + this.sala);
    // por fase, só aparece o que faz sentido, como no sistema
    this.botao.hidden = this.confirmando;
    this.controles.hidden = this.confirmando;
    this.confirmar.hidden = !this.confirmando;
    this.mais.hidden = !ativo;
    this.duracao.hidden = !(f === 'idle' || f === 'paused');
    this.reiniciar.hidden = f === 'idle';
    if (document.activeElement !== this.duracao) this.duracao.value = String(t.escolhida);
    if (this.confirmando) {
      this.confirmarTexto.textContent = 'Reiniciar a sala ' + this.sala + '? A contagem atual (' + formatar(t.timeLeft) +
        ') será perdida e o cronômetro volta para ' + formatar(t.duration) + ', aguardando início.';
    }
    var n = this.servidor.contarTablets(this.sala);
    this.presenca.className = 'dt-presenca' + (n > 0 ? ' ok' : ativo ? ' alerta' : '');
    this.presenca.textContent = n === 0 ? (ativo ? 'Sala sem tablet' : 'Nenhum tablet') : n === 1 ? 'Tablet conectado' : n + ' tablets conectados';
    var fracao = f === 'idle' ? 1 : t.duration > 0 ? t.timeLeft / t.duration : 0;
    this.preenchido.style.transform = 'scaleX(' + fracao + ')';
  };

  /* ---------- montagem ---------- */
  function iniciarDemo(raiz) {
    var servidor = new Servidor();
    var cartoes = raiz.querySelector('.demo-cartoes');
    var tablets = raiz.querySelector('.demo-tablets');
    var anuncio = criar('p', 'so-leitor');
    anuncio.setAttribute('aria-live', 'polite');
    raiz.appendChild(anuncio);
    var lista = [1, 2, 3].map(function (sala) {
      var c = new Cartao(servidor, sala, function (txt) { anuncio.textContent = txt; });
      cartoes.appendChild(c.el);
      return c;
    });
    servidor.aoMudar = function () { lista.forEach(function (c) { c.desenhar(); }); };

    [1, 2, 3].forEach(function (sala) {
      var fig = criar('figure');
      var aparelho = criar('div', 'tablet');
      var tela = criar('div', 'dt-tela');
      aparelho.appendChild(tela);
      var legenda = criar('figcaption');
      var wifi = criar('button', 'dt-btn', 'Desligar Wi-Fi');
      wifi.type = 'button';
      wifi.setAttribute('aria-label', 'Desligar o Wi-Fi do tablet da sala ' + sala);
      legenda.appendChild(wifi);
      fig.appendChild(aparelho);
      fig.appendChild(legenda);
      tablets.appendChild(fig);

      var tablet = new Tablet(tela, sala);
      servidor.conectar(tablet);
      wifi.addEventListener('click', function () {
        tablet.online = !tablet.online;
        var acao = tablet.online ? 'Desligar' : 'Religar';
        wifi.textContent = acao + ' Wi-Fi';
        wifi.setAttribute('aria-label', acao + ' o Wi-Fi do tablet da sala ' + sala);
        wifi.classList.toggle('desligado', !tablet.online);
        if (tablet.online) servidor.conectar(tablet);  // reconecta e recebe o estado atual
        else { tablet.cair(); servidor.aoMudar(); }
      });
    });

    var botaoSom = raiz.querySelector('[data-som]');
    if (botaoSom) {
      botaoSom.addEventListener('click', function () {
        if (som.ligado()) som.desligar(); else som.ligar();
        botaoSom.textContent = som.ligado() ? 'Desativar o som dos tablets' : 'Ativar o som dos tablets';
      });
    }
    servidor.aoMudar();
  }

  var raiz = document.querySelector('[data-demo-timer]');
  if (raiz) iniciarDemo(raiz);
})();
