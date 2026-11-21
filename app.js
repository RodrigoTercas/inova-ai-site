/* Inova.AI — comportamento da página. Sem dependências e sem servidor próprio. */

// ---- ajuste aqui: contato -----------------------------------------------------
const CONTATO = {
  whatsapp: '5598984003949',          // só dígitos, com 55
  whatsappTexto: '(98) 98400-3949',
  email: 'contato@inovajur.com',
};

// Planos conforme a apresentação comercial de 18/11/2026.
const PLANOS = [
  { nome: 'Free', preco: 'Grátis', per: 'para sempre', para: 'Para experimentar o assistente dentro do PJe.',
    itens: ['10 interações por mês', 'Seus próprios prompts, sincronizados'], acao: 'Começar grátis' },
  { nome: 'Pro', preco: 'R$ 140', per: 'por mês', para: 'Para quem usa o assistente no dia a dia dos processos.',
    itens: ['125 interações por mês', 'Biblioteca de prompts da InovaJur'], acao: 'Assinar o Pro' },
  { nome: 'Ultra', preco: 'R$ 250', per: 'por mês', para: 'Para volume alto de processos e prazos.', destaque: true,
    itens: ['Interações ilimitadas', 'Biblioteca de prompts da InovaJur', 'Prioridade no atendimento', '!Assinatura do InovaJur Cortex incluída'], acao: 'Assinar o Ultra' },
  { nome: 'Enterprise', preco: 'Sob consulta', per: 'por contrato', para: 'Para escritórios, procuradorias e órgãos.',
    itens: ['Interações ilimitadas', 'Biblioteca de prompts da InovaJur', 'Condições e suporte negociados', 'Personalização para a organização'], acao: 'Pedir proposta' },
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const zap = texto => `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(texto)}`;
const espera = ms => new Promise(r => setTimeout(r, ms));
document.documentElement.classList.add('js');

function aoVer(alvo, fn, margem = '0px 0px -12% 0px') {
  const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { o.unobserve(e.target); fn(e.target); } }), { rootMargin: margem, threshold: .12 });
  [].concat(alvo).filter(Boolean).forEach(a => o.observe(a));
}

/* ---------- topo e seção ativa ---------- */
(function topo() {
  const topo = $('#topo');
  const rola = () => topo.classList.toggle('topo--solida', scrollY > 24);
  addEventListener('scroll', rola, { passive: true }); rola();
  const links = new Map($$('.menu a').map(a => [a.getAttribute('href').slice(1), a]));
  const o = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.remove('ativa'));
    links.get(e.target.id)?.classList.add('ativa');
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => o.observe(s));
})();

/* ---------- entradas ao rolar ---------- */
(function entradas() {
  $$('.rola').forEach(el => {
    const irmaos = [...el.parentElement.children].filter(c => c.classList.contains('rola'));
    el.style.setProperty('--i', Math.min(irmaos.indexOf(el), 6));
  });
  aoVer($$('.rola'), el => el.classList.add('visto'));
})();

/* ---------- abertura: a conversa acontece sozinha, em ciclo ---------- */
(function conversa() {
  const corpo = $('#conversa'), vazio = $('#vazio'), atalho = $('#atalho'), pecas = $$('.linha-tempo li');
  if (!corpo) return;
  const RESPOSTA = [
    ['b', 'Resumo do processo. '],
    ['t', 'Ação de cobrança. A autora pede o pagamento de notas fiscais vencidas; a ré alega pagamento parcial e junta comprovantes. '],
    ['b', 'Última movimentação: '],
    ['t', 'réplica juntada. Próximo passo provável: saneamento e definição das provas.'],
  ];
  const no = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };

  async function passo(texto, peca) {
    const p = no('div', 'passo-ia'); p.append(no('i'), no('span', null, texto)); corpo.append(p);
    if (peca) { peca.classList.add('lendo'); }
    await espera(900);
    p.classList.add('ok'); if (peca) { peca.classList.remove('lendo'); peca.classList.add('lida'); }
  }
  async function escreve() {
    const m = no('div', 'msg-ia'), cursor = no('span', 'cursor'); m.append(cursor); corpo.append(m);
    for (const [tipo, txt] of RESPOSTA) {
      const alvo = tipo === 'b' ? no('b') : document.createTextNode('');
      m.insertBefore(alvo, cursor);
      for (const ch of txt) { (alvo.nodeType === 3 ? alvo : alvo).textContent += ch; await espera(14); }
    }
    await espera(900); cursor.remove();
  }
  function limpa() {
    $$('.msg-eu, .passo-ia, .msg-ia', corpo).forEach(e => e.remove());
    pecas.forEach(p => p.classList.remove('lendo', 'lida'));
    vazio.hidden = false; atalho.classList.remove('tocado');
  }
  async function ciclo() {
    limpa(); await espera(1400);
    atalho.classList.add('tocado'); await espera(500);
    vazio.hidden = true; corpo.append(no('div', 'msg-eu', 'Resumir processo'));
    await espera(450);
    await passo('Consultando a timeline do processo');
    await passo('Lendo Petição inicial', pecas[0]);
    await passo('Lendo Contestação', pecas[2]);
    await passo('Lendo Réplica', pecas[4]);
    await escreve();
    await espera(5200);
  }
  if (semMovimento) {     // sem animação: mostra o estado final de uma vez
    vazio.hidden = true; corpo.append(no('div', 'msg-eu', 'Resumir processo'));
    ['Consultando a timeline do processo', 'Lendo Petição inicial', 'Lendo Contestação'].forEach(t => { const p = no('div', 'passo-ia ok'); p.append(no('i'), no('span', null, t)); corpo.append(p); });
    const m = no('div', 'msg-ia'); RESPOSTA.forEach(([t, s]) => m.append(t === 'b' ? no('b', null, s) : document.createTextNode(s))); corpo.append(m);
    return;
  }
  (async () => { await espera(1200); for (;;) { if (!document.hidden) await ciclo(); else await espera(1000); } })();
})();

/* ---------- Biblioteca: abas com as telas reais ---------- */
(function biblioteca() {
  const TELAS = {
    prompts: ['img/biblioteca-prompts.png', 'Biblioteca do Inova.AI na aba de assistentes, com a lista de assistentes virtuais', 'Tela real da Biblioteca, aba de assistentes.'],
    skills: ['img/biblioteca-skills.png', 'Biblioteca do Inova.AI na aba de skills instaladas', 'Tela real da Biblioteca, aba de skills instaladas.'],
  };
  const img = $('#biblio-img'), leg = $('#biblio-leg'), painel = $('#painel-biblio');
  const abas = $$('.abas [role="tab"]');
  new Image().src = TELAS.skills[0];   // pré-carrega a segunda tela
  const mostra = aba => {
    abas.forEach(a => a.setAttribute('aria-selected', String(a.dataset.aba === aba)));
    painel.setAttribute('aria-labelledby', `aba-${aba}`);
    img.style.opacity = 0;
    setTimeout(() => { [img.src, img.alt, leg.textContent] = TELAS[aba]; img.style.opacity = 1; }, 180);
  };
  abas.forEach(a => a.addEventListener('click', () => mostra(a.dataset.aba)));
  // setas do teclado entre as abas
  $('.abas').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const i = abas.findIndex(a => a.getAttribute('aria-selected') === 'true');
    const prox = abas[(i + (e.key === 'ArrowRight' ? 1 : abas.length - 1)) % abas.length];
    prox.focus(); mostra(prox.dataset.aba);
  });
})();

/* ---------- planos ---------- */
(function planos() {
  const lista = $('#lista-planos');
  if (!lista) return;
  lista.replaceChildren(...PLANOS.map(p => {
    const c = document.createElement('article');
    c.className = 'plano rola' + (p.destaque ? ' plano--destaque' : '');
    if (p.destaque) c.append(Object.assign(document.createElement('span'), { className: 'plano__selo', textContent: 'Mais completo' }));
    const linha = (tag, cls, txt) => c.append(Object.assign(document.createElement(tag), { className: cls, textContent: txt }));
    linha('p', 'plano__nome', p.nome); linha('p', 'plano__preco' + (p.preco.length > 8 ? ' plano__preco--texto' : ''), p.preco); linha('p', 'plano__per', p.per); linha('p', 'plano__para', p.para);
    const ul = document.createElement('ul'); ul.className = 'plano__itens';
    p.itens.forEach(t => { const li = document.createElement('li'); if (t[0] === '!') { li.className = 'forte'; t = t.slice(1); } li.textContent = t; ul.append(li); });
    c.append(ul);
    const a = document.createElement('a');
    a.className = 'botao ' + (p.destaque ? 'botao--azul' : 'botao--linha');
    a.href = zap(p.nome === 'Enterprise' ? 'Olá! Quero uma proposta do Inova.AI Enterprise para a minha organização.' : `Olá! Quero assinar o plano ${p.nome} do Inova.AI.`);
    a.target = '_blank'; a.rel = 'noopener';
    a.append(p.acao + ' ', Object.assign(document.createElement('span'), { textContent: '→', ariaHidden: 'true' }));
    c.append(a);
    return c;
  }));
  $$('.rola', lista).forEach((el, i) => el.style.setProperty('--i', i));
  aoVer($$('.rola', lista), el => el.classList.add('visto'));
})();

/* ---------- contatos ---------- */
(function contatos() {
  const oi = zap('Olá! Quero saber mais sobre o Inova.AI.');
  $('#fecho-whats').href = oi;
  const w = $('#rodape-whats'); w.href = oi; w.textContent = `WhatsApp ${CONTATO.whatsappTexto}`;
  const m = $('#rodape-email'); m.href = `mailto:${CONTATO.email}`; m.textContent = CONTATO.email;
  $('#ano').textContent = new Date().getFullYear();
})();
