{
const KEY = 'docequelucra:v1';
const { brl, n, r2 } = E;
let S = null;
const load = () => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.cfg) return x; } catch (e) {} return null; };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const today = () => new Date().toISOString().slice(0, 10);
const fmtD = d => d ? String(d).split('-').reverse().join('/') : '';
const pct = x => (Math.round(x * 10) / 10).toLocaleString('pt-BR') + '%';
const hrs = h => { const m = Math.round(h * 60); return Math.floor(m / 60) + 'h' + (m % 60 ? String(m % 60).padStart(2, '0') : ''); };
const dec = (x, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString('pt-BR', { maximumFractionDigits: d });
const get = p => p.split('.').reduce((o, k) => o == null ? o : o[k], S);
const set = (p, v) => { const ks = p.split('.'); const last = ks.pop(); const o = ks.reduce((o, k) => o[k], S); o[last] = v; };
const $ = id => document.getElementById(id);
const put = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };
const UNS = [['g', 'g'], ['kg', 'kg'], ['ml', 'ml'], ['L', 'L'], ['un', 'un'], ['receita', 'receita']];
const plural = (x, s, p) => x === 1 ? s : p;

// ---------- campos ----------
const ci = (p, o = {}) => `<span class="ctl">${o.pre ? `<i>${o.pre}</i>` : ''}<input data-k="${p}" value="${esc(get(p))}" ${o.text ? '' : 'inputmode="decimal"'} placeholder="${esc(o.ph ?? '')}" aria-label="${esc(o.al || '')}"${o.re ? ' data-re' : ''}>${o.suf ? `<i>${esc(o.suf)}</i>` : ''}</span>`;
const sel = (p, opts, o = {}) => { const v = String(get(p) ?? ''); return `<select data-k="${p}"${o.re ? ' data-re' : ''} aria-label="${esc(o.al || '')}">${opts.map(([val, t]) => `<option value="${esc(val)}"${String(val) === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>`; };
function fld(p, label, o = {}) {
  const ctl = o.opts ? `<span class="ctl">${sel(p, o.opts, o)}</span>`
    : o.area ? `<span class="ctl"><textarea data-k="${p}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}">${esc(get(p))}</textarea></span>`
    : o.date ? `<span class="ctl"><input type="${o.date}" data-k="${p}" value="${esc(get(p))}"></span>`
    : ci(p, o);
  return `<label class="fld${o.cls ? ' ' + o.cls : ''}"><span class="lb">${label}${o.hint ? `<small>${o.hint}</small>` : ''}</span>${ctl}</label>`;
}

// ---------- navegação ----------
const ICO = {
  inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  doces: '<path d="M5 11h14l-2 9H7z"/><path d="M6 11a6 6 0 0 1 12 0"/><path d="M12 5V3"/>',
  orcamentos: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  fechamentos: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>',
  mais: '<path d="M4 7h16M4 12h16M4 17h16"/>'
};
const NAV = [['inicio', 'Início'], ['doces', 'Doces'], ['orcamentos', 'Orçamentos'], ['fechamentos', 'Fechamentos'], ['base', 'Minha base'], ['despensa', 'Despensa'], ['esquecidos', 'Custos esquecidos'], ['dados', 'Backup']];
const SECT = { doce: 'doces', orc: 'orcamentos', fec: 'fechamentos', base: 'mais', despensa: 'mais', esquecidos: 'mais', dados: 'mais' };
function nav(view) {
  const top = SECT[view] && SECT[view] !== 'mais' ? SECT[view] : view;
  $('navtop').innerHTML = NAV.map(([k, t]) => `<a href="#${k}" class="${k === top ? 'on' : ''}">${t}</a>`).join('');
  const bot = SECT[view] || view;
  $('navbot').innerHTML = [['inicio', 'Início'], ['doces', 'Doces'], ['orcamentos', 'Orçamentos'], ['fechamentos', 'Fechar'], ['mais', 'Mais']]
    .map(([k, t]) => `<a href="#${k}" class="${k === bot ? 'on' : ''}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>${t}</a>`).join('');
}

// ---------- desenhos ----------
function comoda(r) {
  const g = [[r.g1, 'Ingredientes + perdas'], [r.g2, 'Embalagem'], [r.g3, 'Custos da casa'], [r.g4, 'Seu tempo']];
  const t = r.total || 1;
  return `<div class="comoda" role="img" aria-label="Custo por gaveta"><div class="tampo"></div><div style="display:flex;flex-direction:column;height:340px">${g.map(([v, nome], i) =>
    `<div class="gav d${i + 1}" style="flex:${Math.max(v / t, 0.001)} 1 0"><span class="gn">Gaveta ${i + 1}</span><span class="gt">${nome}</span><b>${brl(v)}</b><span class="pux"></span></div>`).join('')}</div><div class="pes"><i></i><i></i></div></div>`;
}
function regua(r, mini) {
  const vals = [r.minimo, r.certo, r.hoje, r.mercado, mini ? 0 : r.x3].filter(v => v > 0);
  if (!r.certo) return mini ? '<div class="mini"></div>' : '<p class="mute">Preencha as gavetas para ver a régua.</p>';
  const lo = Math.min(...vals) * 0.8, hi = Math.max(...vals) * 1.08, X = v => ((v - lo) / (hi - lo) * 100).toFixed(2);
  const zones = `<span class="z z1" style="left:0;width:${X(r.minimo)}%"></span><span class="z z2" style="left:${X(r.minimo)}%;width:${X(r.certo) - X(r.minimo)}%"></span><span class="z z3" style="left:${X(r.certo)}%;right:0"></span>`;
  const pinList = mini ? [['p-merc', r.mercado], ['p-hoje', r.hoje]] : [['p-min', r.minimo], ['p-certo', r.certo], ['p-x3', r.x3], ['p-merc', r.mercado], ['p-hoje', r.hoje]];
  const pins = pinList.filter(p => p[1] > 0).map(([c, v]) => `<span class="pin ${c}" style="left:${X(v)}%"></span>`).join('');
  if (mini) return `<div class="mini" aria-hidden="true">${zones}${pins}</div>`;
  const L = [['var(--rasp)', 'Preço mínimo', r.minimo], ['var(--green)', 'Preço Certo', r.certo], ['var(--ink)', 'Você cobra hoje', r.hoje], ['var(--g2)', 'Mercado da região', r.mercado], ['var(--g1)', 'No x3', r.x3]].filter(l => l[2] > 0);
  return `<div class="regua" aria-hidden="true"><div class="trk">${zones}<span class="tk"></span></div>${pins}</div>
  <div class="zl"><span>prejuízo</span><span>dá para negociar</span><span>lucro pleno</span></div>
  <ul class="leg">${L.map(([c, t, v]) => `<li><i class="dot" style="background:${c}"></i>${t}<b>${brl(v)}</b></li>`).join('')}</ul>`;
}
const zonaTxt = { abaixo: 'Abaixo do mínimo', entre: 'Entre mínimo e certo', acima: 'No Preço Certo ou acima' };
const chip = z => z ? `<span class="chip ${z}">${zonaTxt[z]}</span>` : '<span class="chip nd">Sem preço atual</span>';

// ---------- telas ----------
const V = {};
let paint = () => {};
const loteNome = d => d.lote || 'lote';
const unNome = d => d.unNome || 'unidade';

V.inicio = () => {
  const rs = S.doces.map(d => [d, E.doce(d, S.cfg, S.despensa)]);
  const b = E.base(S.cfg);
  const al = [];
  if (!n(S.cfg.salario)) al.push(`Preencha <a href="#base">Minha base</a>: sem o valor da sua hora, a Gaveta 4 fica vazia.`);
  rs.forEach(([d, r]) => {
    if (r.zonaHoje === 'abaixo') al.push(`<b>${esc(d.nome)}</b>: você cobra ${brl(r.hoje)} no ${esc(loteNome(d))}, abaixo do mínimo de ${brl(r.minimo)}. Cada venda tira dinheiro do seu bolso.`);
    else if (r.zonaHoje === 'entre') al.push(`<b>${esc(d.nome)}</b>: dá para vender a ${brl(r.hoje)}, mas faltam ${brl(r.certo - r.hoje)} para o Preço Certo.`);
    if (d.atualizado && (Date.now() - new Date(d.atualizado)) / 864e5 > 90) al.push(`<b>${esc(d.nome)}</b>: preço feito há mais de 3 meses. Confira os preços na <a href="#despensa">Despensa</a>.`);
  });
  const porDoce = {};
  S.fechamentos.filter(f => f.doce).forEach(f => (porDoce[f.doce] = porDoce[f.doce] || []).push(f));
  Object.entries(porDoce).forEach(([id, fs]) => {
    const last = fs.slice(-2); const d = S.doces.find(x => x.id === id);
    if (d && last.length === 2 && last.every(f => n(f.horasReal) > n(f.horasPrev) || n(f.extraIng) > 0)) al.push(`<b>${esc(d.nome)}</b>: a mesma diferença apareceu em 2 fechamentos seguidos. Hora de refazer a Ficha do Preço.`);
  });
  const plano = ['Preencha Minha base: valor da sua hora e % de despesas fixas.', 'Cadastre a receita do doce que você mais vende.', 'Complete as 4 gavetas desse doce com a Lista dos Custos Esquecidos.', 'Veja o Preço Certo e o Preço Mínimo e compare com o que você cobra.', 'Separe as mensagens de WhatsApp que você mais vai usar.', 'Repita para o segundo doce mais vendido.', 'Na próxima encomenda, faça o orçamento aqui e depois o fechamento.'];
  return `${S.exemplo ? `<div class="banner"><p><b>Você está vendo os exemplos do material</b>: brigadeiro, brownie e doce no pote, com preços de referência de 2026. Explore e, quando quiser, troque pelos seus números.</p><button class="btn rasp" data-a="zerar">Começar com os meus doces</button></div>` : ''}
  <div class="homeg"><div>
    <div class="headrow"><div><h1>Seus doces</h1><span class="mute">Preço Certo de cada lote, com as 4 gavetas pagas.</span></div><button class="btn" data-a="novoDoce">Novo doce</button></div>
    ${rs.length ? `<div class="cards">${rs.map(([d, r]) => docCard(d, r)).join('')}</div>` : `<div class="card empty"><p>Nenhum doce ainda.</p><button class="btn rasp" data-a="novoDoce">Cadastrar o primeiro doce</button></div>`}
  </div><aside class="list">
    <div class="card"><h3>Avisos</h3><ul class="alerts" style="margin-top:10px">${al.length ? al.map(a => `<li>${a}</li>`).join('') : '<li class="ok">Tudo em dia. Nenhum doce abaixo do mínimo.</li>'}</ul></div>
    <div class="card"><h3>Sua régua</h3><div class="kv" style="margin-top:10px"><div><span>Sua hora</span><b>${brl(b.valorHora)}</b></div><div><span>Taxas + fixas</span><b>${pct(b.taxas + b.fixas)}</b></div><div><span>Lucro</span><b>${pct(b.lucro)}</b></div></div><p style="margin:10px 0 0"><a href="#base">Ajustar minha base</a></p></div>
    <div class="card"><h3>Seus próximos 7 dias</h3><div style="margin-top:6px">${plano.map((t, i) => `<label class="chk${S.plano[i] ? ' done' : ''}"><input type="checkbox" data-k="plano.${i}" data-re${S.plano[i] ? ' checked' : ''}><span><b>Dia ${i + 1}.</b> ${t}</span></label>`).join('')}</div></div>
  </aside></div>`;
};
function docCard(d, r) {
  return `<a class="card dc" href="#doce-${esc(d.id)}"><div class="hd"><div><h3>${esc(d.nome || 'Sem nome')}</h3><small>${esc(loteNome(d))} · ${r.unidades} ${esc(unNome(d))}${r.unidades === 1 ? '' : 's'}</small></div>${chip(r.zonaHoje)}</div>
  <div><span class="pc">${brl(r.certo)}</span> <span class="mute nw">· ${brl(r.certoUn)} cada</span></div>${regua(r, true)}
  <div class="kv"><div><span>Custo total</span><b>${brl(r.total)}</b></div><div><span>Mínimo</span><b>${brl(r.minimo)}</b></div><div><span>Cobra hoje</span><b>${r.hoje ? brl(r.hoje) : '—'}</b></div></div></a>`;
}

V.doces = () => {
  const rs = S.doces.map(d => [d, E.doce(d, S.cfg, S.despensa)]);
  return `<div class="headrow"><div><h1>Doces</h1><span class="mute">Uma Ficha do Preço para cada doce. Os preços vêm da <a href="#despensa">Despensa</a>.</span></div><button class="btn" data-a="novoDoce">Novo doce</button></div>
  ${rs.length ? `<div class="cards">${rs.map(([d, r]) => docCard(d, r)).join('')}</div>` : `<div class="card empty"><p>Nenhum doce ainda.</p><button class="btn rasp" data-a="novoDoce">Cadastrar o primeiro doce</button></div>`}`;
};

V.doce = id => {
  const di = S.doces.findIndex(d => d.id === id); if (di < 0) return notFound('doces');
  const d = S.doces[di], P = `doces.${di}`;
  const opts = tipo => S.despensa.filter(x => x.tipo === tipo).map(x => [x.id, x.nome]);
  const rec = d.receita.map((l, i) => {
    const pi = S.despensa.findIndex(x => x.id === l.insumo), ins = S.despensa[pi], pp = `despensa.${pi}`;
    return `<div class="row rr"><div class="c c-nome"><span class="cl">Ingrediente</span><span class="ctl">${sel(`${P}.receita.${i}.insumo`, opts('ing'), { re: 1, al: 'Ingrediente' })}</span><small id="o-pu-${i}"></small></div>
    <div class="c"><span class="cl">Preço pago</span>${ins ? ci(pp + '.preco', { pre: 'R$', al: 'Preço pago' }) : ''}</div>
    <div class="c"><span class="cl">Embalagem</span>${ins ? `<span class="pair">${ci(pp + '.qtd', { al: 'Tamanho da embalagem' })}<span class="ctl">${sel(pp + '.un', UNS, { re: 1, al: 'Unidade' })}</span></span>` : ''}</div>
    <div class="c"><span class="cl">Usado</span>${ci(`${P}.receita.${i}.usado`, { suf: ins ? E.baseUn(ins.un) : '', al: 'Quantidade usada' })}</div>
    <div class="c num"><span class="cl">Custo</span><b id="o-rc-${i}"></b></div>
    <button class="x" data-a="del" data-p="${P}.receita" data-i="${i}" aria-label="Remover ingrediente">×</button></div>`;
  }).join('');
  const emb = d.embalagem.map((l, i) => {
    const pi = S.despensa.findIndex(x => x.id === l.insumo), ins = S.despensa[pi], pp = `despensa.${pi}`;
    return `<div class="row re"><div class="c c-nome"><span class="cl">Item</span><span class="ctl">${sel(`${P}.embalagem.${i}.insumo`, opts('emb'), { re: 1, al: 'Item de embalagem' })}</span><small id="o-eu-${i}"></small></div>
    <div class="c"><span class="cl">Preço do pacote</span>${ins ? ci(pp + '.preco', { pre: 'R$', al: 'Preço do pacote' }) : ''}</div>
    <div class="c"><span class="cl">Itens no pacote</span>${ins ? ci(pp + '.qtd', { suf: 'un', al: 'Itens no pacote' }) : ''}</div>
    <div class="c"><span class="cl">Usa no lote</span>${ci(`${P}.embalagem.${i}.qtd`, { suf: 'un', al: 'Quantidade no lote' })}</div>
    <div class="c num"><span class="cl">Total</span><b id="o-et-${i}"></b></div>
    <button class="x" data-a="del" data-p="${P}.embalagem" data-i="${i}" aria-label="Remover item">×</button></div>`;
  }).join('');
  const apa = d.aparelhos.map((a, i) => `<div class="row ra"><div class="c c-nome"><span class="cl">Aparelho</span>${ci(`${P}.aparelhos.${i}.nome`, { text: 1, ph: 'Batedeira', al: 'Aparelho' })}</div>
    <div class="c"><span class="cl">Potência</span>${ci(`${P}.aparelhos.${i}.watts`, { suf: 'W', al: 'Potência' })}</div>
    <div class="c"><span class="cl">Tempo</span>${ci(`${P}.aparelhos.${i}.min`, { suf: 'min', al: 'Minutos' })}</div>
    <div class="c num"><span class="cl">Energia</span><b id="o-ap-${i}"></b></div>
    <button class="x" data-a="del" data-p="${P}.aparelhos" data-i="${i}" aria-label="Remover aparelho">×</button></div>`).join('');
  const tar = d.tarefas.map((t, i) => `<div class="row rt"><div class="c c-nome">${ci(`${P}.tarefas.${i}.nome`, { text: 1, ph: 'Etapa', al: 'Etapa' })}</div>
    <div class="c">${ci(`${P}.tarefas.${i}.min`, { suf: 'min', al: 'Minutos' })}</div>
    <button class="x" data-a="del" data-p="${P}.tarefas" data-i="${i}" aria-label="Remover etapa">×</button></div>`).join('');
  const quick = (tipo) => tipo === 'ing'
    ? `<details class="more"><summary>Cadastrar ingrediente novo</summary><div class="grid">
      <label class="fld"><span class="lb">Nome</span><span class="ctl"><input id="nq-nome-ing" placeholder="Leite condensado"></span></label>
      <label class="fld"><span class="lb">Preço pago</span><span class="ctl"><i>R$</i><input id="nq-preco-ing" inputmode="decimal" placeholder="8,00"></span></label>
      <label class="fld"><span class="lb">Tamanho da embalagem</span><span class="pair"><span class="ctl"><input id="nq-qtd-ing" inputmode="decimal" placeholder="395"></span><span class="ctl"><select id="nq-un-ing">${UNS.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></span></span></label>
      <label class="fld"><span class="lb">Usado na receita<small>em g, ml ou un</small></span><span class="ctl"><input id="nq-usado-ing" inputmode="decimal" placeholder="395"></span></label>
      </div><div class="add"><button class="btn" data-a="novoIns" data-t="ing" data-d="${di}">Adicionar à receita e à despensa</button></div></details>`
    : `<details class="more"><summary>Cadastrar item de embalagem novo</summary><div class="grid">
      <label class="fld"><span class="lb">Nome</span><span class="ctl"><input id="nq-nome-emb" placeholder="Forminha nº 4"></span></label>
      <label class="fld"><span class="lb">Preço do pacote</span><span class="ctl"><i>R$</i><input id="nq-preco-emb" inputmode="decimal" placeholder="7,00"></span></label>
      <label class="fld"><span class="lb">Itens no pacote</span><span class="ctl"><input id="nq-qtd-emb" inputmode="decimal" placeholder="100"></span></label>
      <label class="fld"><span class="lb">Usa no lote</span><span class="ctl"><input id="nq-usado-emb" inputmode="decimal" placeholder="100"></span></label>
      </div><div class="add"><button class="btn" data-a="novoIns" data-t="emb" data-d="${di}">Adicionar ao doce e à despensa</button></div></details>`;
  const addSel = (tipo, lbl) => { const o = opts(tipo); return o.length ? `<select data-add="${tipo}" data-d="${di}" aria-label="${lbl}"><option value="">+ ${lbl}</option>${o.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select>` : ''; };
  return `<div class="ptop"><a href="#doces" class="back">← Doces</a>
    <input class="title-in" data-k="${P}.nome" value="${esc(d.nome)}" placeholder="Nome do doce" aria-label="Nome do doce">
    <div class="grid">${fld(P + '.lote', 'Nome do lote', { text: 1, ph: 'cento, forma, 10 potes' })}${fld(P + '.unNome', 'Cada unidade é um(a)', { text: 1, ph: 'brigadeiro' })}${fld(P + '.nReceitas', 'Receitas no lote', { suf: 'receitas' })}${fld(P + '.unidades', 'Unidades no lote', { suf: 'un', ph: String(n(d.rendimento) * (n(d.nReceitas) || 1) || '') })}</div></div>
  <div class="work"><aside class="panel" id="panel"></aside><div class="form">
  <section class="sec"><header><span class="tag t1">1</span><div><h2>Ingredientes + perdas</h2><small>Ficha da Receita · preço pago ÷ embalagem × usado</small></div><span class="tot" id="o-g1"></span></header><div class="in">
    <div class="row rr rh"><span>Ingrediente</span><span>Preço pago</span><span>Embalagem</span><span>Usado (1 receita)</span><span class="num">Custo</span><span></span></div>
    <div class="rows">${rec || '<p class="mute">Adicione os ingredientes de 1 receita.</p>'}</div>
    <div class="add">${addSel('ing', 'adicionar ingrediente da despensa')}</div>${quick('ing')}
    <small style="display:block;margin-top:8px">Preço e embalagem ficam na despensa: mudou aqui, muda em todos os doces que usam esse ingrediente.</small>
    <div class="grid" style="margin-top:14px">${fld(P + '.rendimento', 'Rendimento real de 1 receita', { suf: 'un', hint: 'unidades prontas para vender, não o do caderno' })}${fld(P + '.perdas', 'Perdas', { suf: '%', ph: String(S.cfg.perdas), hint: 'comece com 5%; doces finos 8 a 10%' })}</div>
    <div class="sum" id="o-sum1"></div>
    <details class="more"><summary>Converter medida caseira em gramas</summary>
      <div class="grid"><label class="fld"><span class="lb">Ingrediente</span><span class="ctl"><select id="mc-i">${MED.map((m, i) => `<option value="${i}">${m[0]}</option>`).join('')}</select></span></label>
      <label class="fld"><span class="lb">Quantidade</span><span class="ctl"><input id="mc-q" inputmode="decimal" value="1"></span></label>
      <label class="fld"><span class="lb">Medida</span><span class="ctl"><select id="mc-m"><option value="1">xícara (240 ml)</option><option value="2">colher de sopa</option></select></span></label></div>
      <p id="o-mc" style="margin:10px 0 0;font-weight:700"></p><small>Referência aproximada. O ideal é pesar uma vez na balança e anotar.</small></details>
  </div></section>
  <section class="sec"><header><span class="tag t2">2</span><div><h2>Embalagem</h2><small>Tudo que vai com o doce até a mão do cliente</small></div><span class="tot" id="o-g2"></span></header><div class="in">
    <div class="row re rh"><span>Item</span><span>Preço do pacote</span><span>Itens no pacote</span><span>Usa no lote</span><span class="num">Total</span><span></span></div>
    <div class="rows">${emb || '<p class="mute">Forminha, caixa, fita, etiqueta, pote, colher, sacola.</p>'}</div>
    <div class="add">${addSel('emb', 'adicionar embalagem da despensa')}<a class="btn ghost" href="#esquecidos">Conferir custos esquecidos</a></div>${quick('emb')}
  </div></section>
  <section class="sec"><header><span class="tag t3">3</span><div><h2>Custos da casa</h2><small>Gás, energia, água e limpeza</small></div><span class="tot" id="o-g3"></span></header><div class="in">
    <div class="grid">${fld(P + '.bocaMin', 'Boca do fogão acesa', { suf: 'min', hint: 'some o tempo de todas as panelas' })}${fld(P + '.fornoMin', 'Forno ligado', { suf: 'min', hint: 'inclui pré-aquecimento' })}${fld(P + '.limpezaReceitas', 'Receitas para a limpeza', { suf: '×', ph: String(n(d.nReceitas) || 1), hint: 'em geral, igual ao nº de receitas' })}</div>
    <h3 style="margin:16px 0 4px;font-size:16px">Aparelhos elétricos</h3>
    <div class="rows">${apa || '<p class="mute" style="margin:4px 0">Batedeira, liquidificador, micro-ondas, air fryer. A potência está na etiqueta.</p>'}</div>
    <div class="add"><button class="btn ghost" data-a="push" data-p="${P}.aparelhos" data-v='{"nome":"","watts":"","min":""}'>+ Aparelho</button></div>
    <div class="sum" id="o-casa"></div>
  </div></section>
  <section class="sec"><header><span class="tag t4">4</span><div><h2>Seu tempo</h2><small>Preparar, cozinhar, enrolar ou decorar, embalar e limpar</small></div><span class="tot" id="o-g4"></span></header><div class="in">
    <div class="rows">${tar}</div>
    <div class="add"><button class="btn ghost" data-a="push" data-p="${P}.tarefas" data-v='{"nome":"","min":""}'>+ Etapa</button></div>
    <div class="sum" id="o-sum4"></div>
    <div class="hint">Cronometre uma vez: anote a hora em que começou e a hora em que terminou de limpar a cozinha.</div>
  </div></section>
  <section class="sec"><header><span class="tag t5">R</span><div><h2>Régua do Preço</h2><small>custo total ÷ (1 − taxas − fixas − lucro)</small></div></header><div class="in">
    <div class="sum" id="o-regua" style="margin-top:0;border:0;padding-top:0"></div>
    <div class="grid" style="margin-top:12px">${fld(P + '.arred', 'Arredondar para cima, por unidade', { opts: [['0.05', 'de R$ 0,05 em R$ 0,05'], ['0.1', 'de R$ 0,10 em R$ 0,10'], ['0.5', 'de R$ 0,50 em R$ 0,50'], ['1', 'de R$ 1,00 em R$ 1,00']] })}</div>
    <h3 style="margin:20px 0 8px">Compare</h3>
    <div class="grid">${fld(P + '.cobroHoje', 'Quanto eu cobro hoje (lote)', { pre: 'R$' })}${fld(P + '.mercado', 'Mercado da minha região (lote)', { pre: 'R$' })}</div>
    <div id="o-diag"></div>
    <h3 style="margin:20px 0 8px">No x3 × no Preço Certo</h3><div id="o-x3"></div>
    <h3 style="margin:20px 0 8px">E se o cliente pedir desconto?</h3>
    <label class="fld"><span class="lb">Desconto: <span id="o-dp"></span></span><input type="range" id="desc" min="0" max="25" step="1" value="10"></label>
    <div id="o-desc"></div>
    <h3 style="margin:20px 0 8px">Minha decisão</h3>
    <div class="grid">${fld(P + '.decisao', 'Decisão', { opts: [['', 'Escolha…'], ['manter', 'Manter o preço'], ['subir', 'Subir o preço'], ['ajustar', 'Ajustar o doce (tamanho, embalagem, recheio)'], ['minimo', 'Criar pedido mínimo'], ['parar', 'Parar de vender assim']] })}</div>
    ${fld(P + '.notas', 'Anotações', { area: 1, ph: 'Medidas pesadas, o que mudou, ideia de ajuste…' })}
  </div></section>
  <div class="add"><button class="btn ghost" data-a="dupDoce" data-id="${esc(d.id)}">Duplicar doce</button><button class="btn ghost" data-a="delDoce" data-id="${esc(d.id)}">Excluir doce</button></div>
  </div></div><div class="sticky-res" id="sticky"></div>`;
};
const MED = [['Farinha de trigo', 120, 7.5], ['Açúcar refinado', 180, 12], ['Chocolate ou cacau em pó', 90, 7.5], ['Manteiga', 200, 15], ['Leite, água, óleo (ml)', 240, 15], ['Coco ralado', 80, 5]];

function paintDoce(id) {
  const d = S.doces.find(x => x.id === id); if (!d) return;
  const r = E.doce(d, S.cfg, S.despensa), L = loteNome(d), U = unNome(d);
  r.linhas.forEach((l, i) => { put('o-pu-' + i, l.ins ? `R$ ${dec(l.pu, l.pu < 1 ? 4 : 2)} por ${esc(l.un)}` : 'escolha um ingrediente'); put('o-rc-' + i, brl(l.custo)); });
  r.emb.forEach((l, i) => { put('o-eu-' + i, `R$ ${dec(l.pu, l.pu < 1 ? 3 : 2)} cada`); put('o-et-' + i, brl(l.custo)); });
  put('o-g1', brl(r.g1)); put('o-g2', brl(r.g2)); put('o-g3', brl(r.g3)); put('o-g4', brl(r.g4));
  put('o-sum1', `<div><span>Custo de 1 receita</span><b>${brl(r.custoReceita)}</b></div><div><span>Custo por ${esc(U)} (só ingredientes)</span><b>${brl(r.custoUnIng)}</b></div>
    <div><span>Ingredientes do ${esc(L)}: ${r.nRec} × ${brl(r.custoReceita)}</span><b>${brl(r.ing)}</b></div><div><span>Perdas (${pct(r.perdasPct)})</span><b>${brl(r.perdas)}</b></div><div class="big"><span>Gaveta 1</span><b>${brl(r.g1)}</b></div>`);
  (d.aparelhos || []).forEach((a, i) => { const k = n(a.watts) * n(a.min) / 60 / 1000; put('o-ap-' + i, brl(r2(k * r.b.tarifa))); });
  put('o-casa', r.casa.length ? r.casa.map(c => `<div><span>${esc(c.nome)} <small>${c.conta}</small></span><b>${brl(c.custo)}</b></div>`).join('') + `<div class="big"><span>Gaveta 3</span><b>${brl(r.g3)}</b></div>` : '<div><span class="mute">Preencha o tempo de fogão, forno e aparelhos.</span></div>');
  put('o-sum4', `<div><span>${hrs(r.horas)} × ${brl(r.b.valorHora)} por hora</span><b>${brl(r.g4)}</b></div>${r.b.valorHora ? '' : '<div><span class="pos">Preencha o valor da sua hora em <a href="#base">Minha base</a>.</span></div>'}`);
  const somaPct = r.b.taxas + r.b.fixas + r.b.lucro;
  put('o-regua', `<div><span>Custo total do ${esc(L)} (4 gavetas)</span><b>${brl(r.total)}</b></div>
    <div><span>Taxas ${pct(r.b.taxas)} + fixas ${pct(r.b.fixas)} + lucro ${pct(r.b.lucro)}</span><b>${pct(somaPct)}</b></div>
    <div><span>Divisor = 1 − ${dec(somaPct / 100, 3)}</span><b>${dec(r.b.divCerto, 3)}</b></div>
    <div><span>Preço calculado = ${brl(r.total)} ÷ ${dec(r.b.divCerto, 3)}</span><b>${brl(r.calc)}</b></div>
    <div class="big"><span>Preço Certo (${brl(r.certoUn)} por ${esc(U)})</span><b>${brl(r.certo)}</b></div>
    <div><span>Preço mínimo = ${brl(r.total)} ÷ ${dec(r.b.divMin, 3)}</span><b>${brl(r.minimo)}</b></div>
    <div><span>Desconto máximo (lucro zero)</span><b>${brl(r.descMax)}</b></div>`);
  const z = r.zonaMercado || r.zonaHoje, ref = r.zonaMercado ? 'O mercado paga' : 'Você cobra';
  const DG = { acima: `${ref} acima do seu Preço Certo. Ótimo: dá para cobrar mais e aumentar o lucro.`, entre: `${ref} entre o mínimo e o Preço Certo. Dá para vender, com lucro menor. Veja se consegue reduzir embalagem, tamanho ou tempo.`, abaixo: `${ref} abaixo do seu mínimo. Não venda esse doce desse jeito: diminua o tamanho, simplifique a embalagem, troque um ingrediente, crie um pedido mínimo ou ofereça outro doce.` };
  put('o-diag', z ? `<div class="diag ${z}">${DG[z]}${r.hoje ? `<br><b>Lucro real cobrando ${brl(r.hoje)}: ${brl(r.lucroHoje)}</b>` : ''}</div>` : '<p class="mute" style="margin:8px 0 0">Preencha um dos dois para ver o diagnóstico.</p>');
  put('o-x3', `<div class="vs"><div class="a"><div class="h">No x3</div>Preço: ${brl(r.x3)}<br>Você acha que lucra: ${brl(r.x3 - r.ing)}<div class="l">${brl(r.lucroX3)}</div>de lucro real</div><div class="b"><div class="h">No Preço Certo</div>Preço: ${brl(r.certo)}<br>Todas as gavetas pagas<div class="l">${brl(r.lucroCerto)}</div>de lucro real</div></div>
    <small style="display:block;margin-top:6px">Lucro real = preço − custo total (com suas horas pagas) − taxas − despesas fixas.</small>`);
  const dp = n(($('desc') || {}).value), ds = E.desconto(r, dp);
  put('o-dp', `<b>${dp}%</b>`);
  put('o-desc', `<div class="sum" style="margin-top:4px"><div><span>Novo preço do ${esc(L)}</span><b>${brl(ds.preco)}</b></div><div><span>Lucro que sobra</span><b class="${ds.lucro < 0 ? 'pos' : ''}">${brl(ds.lucro)}</b></div><div><span>Perda de lucro</span><b class="pos">${r.lucroCerto ? Math.round(ds.perda) + '%' : '—'}</b></div></div>
    ${ds.preco < r.minimo ? `<div class="diag abaixo">Abaixo do mínimo: com esse desconto você paga para trabalhar.</div>` : `<small>Troque desconto por ajuste: embalagem mais simples, retirada no local, sabor tradicional, Pix à vista.</small>`}`);
  put('panel', `${comoda(r)}<div class="custo"><span>Custo total</span><b class="nw">${brl(r.total)} · ${brl(r.porUn)}/${esc(U)}</b></div>
    <div class="price"><div class="k">Preço Certo do ${esc(L)}</div><div class="v">${brl(r.certo)}</div><div class="u">${brl(r.certoUn)} por ${esc(U)}</div>
    <div class="duo"><div><span>Preço mínimo</span><b>${brl(r.minimo)}</b></div><div><span>Lucro do negócio</span><b>${brl(r.lucroCerto)}</b></div></div></div>
    <div class="card" style="padding:14px"><h3>Régua do Preço</h3>${regua(r)}</div>`);
  put('sticky', `<span>Preço Certo<br><small style="color:inherit;opacity:.75">mín. ${brl(r.minimo)}</small></span><b>${brl(r.certo)}</b>`);
  const mi = MED[n(($('mc-i') || {}).value)] || MED[0], q = n(($('mc-q') || {}).value), m = ($('mc-m') || {}).value === '2' ? 2 : 1;
  put('o-mc', `≈ ${dec(q * mi[m], 1)} ${/ml/.test(mi[0]) ? 'ml' : 'g'}`);
}

V.base = () => {
  const c = 'cfg';
  const fx = S.cfg.fixas.map((f, i) => `<div class="row rf"><div class="c c-nome">${ci(`${c}.fixas.${i}.nome`, { text: 1, ph: 'DAS do MEI', al: 'Despesa' })}</div><div class="c">${ci(`${c}.fixas.${i}.valor`, { pre: 'R$', al: 'Valor por mês' })}</div><button class="x" data-a="del" data-p="${c}.fixas" data-i="${i}" aria-label="Remover despesa">×</button></div>`).join('');
  return `<div class="headrow"><div><h1>Minha base</h1><span class="mute">Ficha 0. Faça uma vez e revise a cada 3 meses: estes números entram em todos os doces.</span></div></div>
  <div class="work"><aside class="panel" id="panel"></aside><div class="form">
  <section class="sec"><header><span class="tag t4">4</span><div><h2>Valor da minha hora</h2><small>salário ÷ horas de produção</small></div><span class="tot" id="o-hora"></span></header><div class="in"><div class="grid">
    ${fld(c + '.nome', 'Seu nome ou da confeitaria', { text: 1, ph: 'Doces da Ana' })}${fld(c + '.salario', 'Quanto quero ganhar por mês', { pre: 'R$' })}${fld(c + '.diasSemana', 'Dias de produção por semana', { suf: 'dias' })}${fld(c + '.horasDia', 'Horas de produção por dia', { suf: 'h' })}</div>
    <div class="sum" id="o-sh"></div><small>Conte só preparar, cozinhar, enrolar ou decorar, embalar e limpar. WhatsApp e compras já ficam pagos assim.</small></div></section>
  <section class="sec"><header><span class="tag t3">3</span><div><h2>Custos da casa</h2><small>gás, energia e limpeza</small></div></header><div class="in"><div class="grid">
    ${fld(c + '.botijao', 'Preço do botijão (13 kg)', { pre: 'R$' })}${fld(c + '.kgBoca', 'Consumo da boca', { suf: 'kg/h', hint: 'estimativa média: 0,15' })}${fld(c + '.kgForno', 'Consumo do forno', { suf: 'kg/h', hint: 'estimativa média: 0,22' })}${fld(c + '.tarifa', 'Tarifa de energia', { pre: 'R$', suf: '/kWh', hint: 'na conta de luz, com impostos' })}${fld(c + '.limpezaMes', 'Gasto do mês com limpeza', { pre: 'R$', hint: 'detergente, esponja, papel, luvas' })}${fld(c + '.receitasMes', 'Receitas que faço por mês', { suf: 'receitas' })}</div>
    <div class="sum" id="o-sc"></div></div></section>
  <section class="sec"><header><span class="tag t5">%</span><div><h2>Despesas fixas do negócio</h2><small>existem todo mês, vendendo muito ou pouco</small></div><span class="tot" id="o-fx"></span></header><div class="in">
    <div class="rows">${fx}</div><div class="add"><button class="btn ghost" data-a="push" data-p="${c}.fixas" data-v='{"nome":"","valor":""}'>+ Despesa</button></div>
    <div class="grid" style="margin-top:12px">${fld(c + '.faturamento', 'Faturamento médio do mês', { pre: 'R$' })}</div><div class="sum" id="o-sf"></div>
    <small>Geladeira e freezer entram aqui (parte da energia), não na Gaveta 3.</small></div></section>
  <section class="sec"><header><span class="tag t5">R</span><div><h2>Minha Régua do Preço</h2><small>o que sai de dentro do preço de venda</small></div></header><div class="in"><div class="grid">
    ${fld(c + '.taxas', 'Taxas (maquininha, link, app)', { suf: '%', hint: '3% é a média de quem recebe Pix e cartão' })}${fld(c + '.lucro', 'Lucro do negócio', { suf: '%', hint: 'não é seu salário: é para o negócio crescer' })}${fld(c + '.perdas', 'Perdas padrão', { suf: '%', hint: 'usado quando o doce não define' })}${fld(c + '.arred', 'Arredondamento padrão', { opts: [['0.05', 'R$ 0,05'], ['0.1', 'R$ 0,10'], ['0.5', 'R$ 0,50'], ['1', 'R$ 1,00']] })}</div>
    <div class="sum" id="o-sr"></div></div></section>
  </div></div>`;
};
function paintBase() {
  const b = E.base(S.cfg);
  put('o-hora', brl(b.valorHora)); put('o-fx', brl(b.fixasTotal));
  put('o-sh', `<div><span>Horas de produção por mês (dias × horas × 4)</span><b>${dec(b.horasMes, 1)} h</b></div><div class="big"><span>Valor da minha hora</span><b>${brl(b.valorHora)}</b></div>`);
  put('o-sc', `<div><span>Preço do kg de gás</span><b>${brl(b.kgGas)}</b></div><div><span>Uma boca, por hora</span><b>${brl(b.bocaH)}</b></div><div><span>Forno, por hora</span><b>${brl(b.fornoH)}</b></div><div><span>Limpeza por receita</span><b>${brl(b.limpezaReceita)}</b></div>`);
  put('o-sf', `<div><span>Total das despesas fixas</span><b>${brl(b.fixasTotal)}</b></div><div class="big"><span>% de despesas fixas (total ÷ faturamento)</span><b>${pct(b.fixas)}</b></div>`);
  put('o-sr', `<div><span>Taxas + fixas + lucro</span><b>${pct(b.taxas + b.fixas + b.lucro)}</b></div><div class="big"><span>Divisor do Preço Certo</span><b>${dec(b.divCerto, 3)}</b></div><div><span>Divisor do Preço Mínimo</span><b>${dec(b.divMin, 3)}</b></div>${b.divCerto <= 0 ? '<div class="pos">A soma passou de 100%: revise as porcentagens.</div>' : ''}`);
  put('panel', `<div class="price"><div class="k">Sua hora vale</div><div class="v">${brl(b.valorHora)}</div><div class="u">${dec(b.horasMes, 1)} h de produção por mês</div>
    <div class="duo"><div><span>Divide o custo por</span><b>${dec(b.divCerto, 3)}</b></div><div><span>Piso: divide por</span><b>${dec(b.divMin, 3)}</b></div></div></div>
    <div class="card"><h3>Para onde vai cada R$ 100 vendidos</h3><div style="margin-top:10px;display:flex;height:22px;border-radius:6px;overflow:hidden">
    ${[[b.taxas, 'var(--g1)'], [b.fixas, 'var(--g2)'], [b.lucro, 'var(--green)'], [Math.max(0, 100 - b.taxas - b.fixas - b.lucro), 'var(--wood)']].map(([v, c]) => `<span style="width:${v}%;background:${c}"></span>`).join('')}</div>
    <ul class="leg"><li><i class="dot" style="background:var(--g1)"></i>Taxas<b>${brl(b.taxas)}</b></li><li><i class="dot" style="background:var(--g2)"></i>Despesas fixas<b>${brl(b.fixas)}</b></li><li><i class="dot" style="background:var(--green)"></i>Lucro do negócio<b>${brl(b.lucro)}</b></li><li><i class="dot" style="background:var(--wood)"></i>Paga as 4 gavetas<b>${brl(Math.max(0, 100 - b.taxas - b.fixas - b.lucro))}</b></li></ul></div>`);
}

V.despensa = () => {
  const uso = id => S.doces.filter(d => d.receita.some(l => l.insumo === id) || d.embalagem.some(l => l.insumo === id)).length;
  const bloco = (tipo, titulo, sub) => {
    const its = S.despensa.map((x, i) => [x, i]).filter(([x]) => x.tipo === tipo);
    return `<section class="sec"><header><span class="tag ${tipo === 'ing' ? 't1' : 't2'}">${tipo === 'ing' ? '1' : '2'}</span><div><h2>${titulo}</h2><small>${sub}</small></div></header><div class="in">
    <div class="row ro rh"><span>Nome</span><span>Preço pago</span><span></span><span>${tipo === 'ing' ? 'Embalagem' : 'Itens no pacote'}</span><span class="num">Por ${tipo === 'ing' ? 'g/ml/un' : 'unidade'}</span><span></span></div>
    <div class="rows">${its.map(([x, i]) => `<div class="row ro" data-f="${esc(x.nome.toLowerCase())}"><div class="c c-nome"><span class="cl">Nome</span>${ci(`despensa.${i}.nome`, { text: 1, al: 'Nome' })}<small>${uso(x.id) ? `usado em ${uso(x.id)} ${plural(uso(x.id), 'doce', 'doces')}` : 'não usado'}${x.atualizado ? ` · preço de ${fmtD(x.atualizado)}` : ''}</small></div>
      <div class="c"><span class="cl">Preço pago</span>${ci(`despensa.${i}.preco`, { pre: 'R$', al: 'Preço' })}</div><span></span>
      <div class="c"><span class="cl">${tipo === 'ing' ? 'Embalagem' : 'Itens no pacote'}</span>${tipo === 'ing' ? `<span class="pair">${ci(`despensa.${i}.qtd`, { al: 'Tamanho' })}<span class="ctl">${sel(`despensa.${i}.un`, UNS, { re: 1, al: 'Unidade' })}</span></span>` : ci(`despensa.${i}.qtd`, { suf: 'un', al: 'Itens no pacote' })}</div>
      <div class="c num"><span class="cl">Preço unitário</span><b id="o-dp-${i}"></b></div>
      <button class="x" data-a="delIns" data-id="${esc(x.id)}" aria-label="Remover">×</button></div>`).join('') || '<p class="mute">Nada cadastrado.</p>'}</div>
    <div class="add"><button class="btn ghost" data-a="novoInsD" data-t="${tipo}">+ ${tipo === 'ing' ? 'Ingrediente' : 'Embalagem'}</button></div></div></section>`;
  };
  return `<div class="headrow"><div><h1>Despensa</h1><span class="mute">Atualize o preço aqui quando o mercado mudar: todos os doces recalculam na hora.</span></div>
    <label class="fld" style="width:min(100%,280px)"><span class="lb">Buscar</span><span class="ctl"><input id="busca" placeholder="leite, caixa…"></span></label></div>
    ${bloco('ing', 'Ingredientes', 'preço pago ÷ tamanho da embalagem = preço por grama')}${bloco('emb', 'Embalagens', 'preço do pacote ÷ itens no pacote = preço de 1 unidade')}`;
};
function paintDespensa() {
  S.despensa.forEach((x, i) => { const pu = E.precoUn(x); put('o-dp-' + i, `R$ ${dec(pu, pu < 1 ? 4 : 2)}${x.tipo === 'ing' ? '/' + E.baseUn(x.un) : ''}`); });
  const q = (($('busca') || {}).value || '').toLowerCase();
  document.querySelectorAll('[data-f]').forEach(r => { r.style.display = !q || r.dataset.f.includes(q) ? '' : 'none'; });
}

const ESQ = [
  ['Gaveta 1 · Ingredientes e perdas', 't1', ['Ingredientes principais (pesados, não “a olho”)', 'Fermento, essência, sal, corante', 'Granulado, confeitos, glitter comestível', 'Açúcar de confeiteiro para finalizar', 'Desmoldante, manteiga e farinha da forma', 'Recheio que sobra na manga e no bowl', 'Unidades que você prova ou que quebram', 'Receita que desanda (média do mês)', 'Frutas que estragam antes de usar', 'Chocolate que empedra na temperagem']],
  ['Gaveta 2 · Embalagem', 't2', ['Forminhas (e as que rasgam)', 'Caixa, pote, marmita, saquinho', 'Berço ou apoio interno da caixa', 'Fita, laço, barbante', 'Etiqueta, tag, adesivo', 'Cartão de agradecimento', 'Colher, garfo, guardanapo', 'Sacola para entrega', 'Papel de seda, filme, papel-manteiga', 'Base de papelão para bolo', 'Topper ou plaquinha', 'Caixa térmica e gelo para transporte']],
  ['Gaveta 3 · Custos da casa', 't3', ['Gás das bocas do fogão', 'Gás do forno (inclui pré-aquecimento)', 'Energia da batedeira e liquidificador', 'Energia do micro-ondas e air fryer', 'Água para cozinhar e lavar', 'Detergente e esponja', 'Papel-toalha e pano de prato', 'Luvas, touca e máscara', 'Sacos de lixo']],
  ['Gaveta 4 · Seu tempo', 't4', ['Preparar e pesar ingredientes', 'Cozinhar e esperar o ponto', 'Enrolar, rechear, decorar', 'Embalar e etiquetar', 'Lavar a louça e limpar a cozinha', 'Tempo de entrega (se for você)']],
  ['Despesas fixas (entram em %)', 't5', ['DAS do MEI', 'Parte do celular e da internet', 'Instagram: impulsionamentos e anúncios', 'Reposição de formas, bicos, espátulas', 'Manutenção de batedeira e fogão', 'Parte da energia da geladeira e freezer', 'Transporte para compras', 'Curso, apostila ou material de estudo', 'Aplicativo de pagamento ou gestão']],
  ['Taxas (entram em %)', 't5', ['Maquininha: débito', 'Maquininha: crédito à vista', 'Crédito parcelado', 'Link de pagamento', 'Aplicativo de entrega', 'Antecipação de recebíveis']]
];
V.esquecidos = () => {
  const tot = ESQ.reduce((s, g) => s + g[2].length, 0), mk = Object.values(S.checks).filter(Boolean).length;
  return `<div class="headrow"><div><h1>Custos esquecidos</h1><span class="mute">Marque o que você usa e confira se está no preço. O que não estiver, sai do seu bolso.</span></div><span class="chip nd" style="font-size:15px">${mk} de ${tot} marcados</span></div>
  <div class="esq">${ESQ.map(([t, c, its], g) => `<div class="card"><h3 style="display:flex;gap:10px;align-items:center"><span class="tag ${c}" style="width:28px;height:28px;font-size:14px">${c === 't5' ? '%' : c[1]}</span>${t}</h3><div style="margin-top:8px">${its.map((x, i) => { const k = `checks.e${g}_${i}`; return `<label class="chk${get(k) ? ' done' : ''}"><input type="checkbox" data-k="${k}" data-re${get(k) ? ' checked' : ''}><span>${x}</span></label>`; }).join('')}</div></div>`).join('')}</div>
  <p class="mute">Gavetas 1 a 4 entram em reais, em cada doce. Despesas fixas e taxas entram em %, em <a href="#base">Minha base</a>.</p>`;
};

// ---------- orçamentos ----------
const STATUS = [['rascunho', 'Rascunho'], ['enviado', 'Enviado'], ['fechado', 'Fechado'], ['perdido', 'Não fechou']];
V.orcamentos = () => `<div class="headrow"><div><h1>Orçamentos</h1><span class="mute">Ficha 3. Pergunte antes de calcular, sempre com sinal e validade.</span></div><button class="btn" data-a="novoOrc">Novo orçamento</button></div>
  <div class="list">${S.orcamentos.slice().reverse().map(o => { const r = E.orcamento(o, S.cfg, S.despensa, S.doces); return `<a class="card li" href="#orc-${esc(o.id)}"><div><h3>${esc(o.cliente || 'Sem nome')}</h3><small>${o.data ? 'Festa em ' + fmtD(o.data) : 'Sem data'}${o.convidados ? ` · ${esc(o.convidados)} convidados` : ''} · ${esc((STATUS.find(s => s[0] === o.status) || STATUS[0])[1])}</small></div><div class="r">${brl(r.total)}<br><small>sinal ${brl(r.sinal)}</small></div></a>`; }).join('') || '<div class="card empty">Nenhum orçamento ainda.</div>'}</div>`;

V.orc = id => {
  const oi = S.orcamentos.findIndex(o => o.id === id); if (oi < 0) return notFound('orcamentos');
  const o = S.orcamentos[oi], P = `orcamentos.${oi}`;
  const dopts = S.doces.map(d => [d.id, d.nome]);
  const its = o.itens.map((it, i) => { const d = S.doces.find(x => x.id === it.doce); const Q = `${P}.itens.${i}`; return `<div class="card" style="padding:12px 14px;margin-bottom:10px;background:var(--bg)">
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))"><label class="fld" style="grid-column:span 2"><span class="lb">Doce</span><span class="ctl">${sel(Q + '.doce', dopts, { re: 1 })}</span></label>
    ${fld(Q + '.modo', 'Vender por', { opts: [['lote', d ? 'lote (' + (d.lote || 'lote') + ')' : 'lote'], ['un', 'unidade']], re: 1 })}${fld(Q + '.qtd', 'Quantidade', { suf: it.modo === 'un' ? 'un' : '×' })}</div>
    ${fld(Q + '.obs', 'Detalhe para o cliente', { text: 1, ph: 'nas cores da festa, sabor…' })}
    <details class="more"${n(it.persMaterial) || n(it.persMin) ? ' open' : ''}><summary>Personalização deste item</summary><div class="grid">${fld(Q + '.persMaterial', 'Material extra', { pre: 'R$', hint: 'forminha colorida, papel especial, topper' })}${fld(Q + '.persMin', 'Tempo extra', { suf: 'min' })}</div><p id="o-ps-${i}" style="margin:8px 0 0"></p></details>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px"><span id="o-it-${i}"></span><button class="x" data-a="del" data-p="${P}.itens" data-i="${i}" aria-label="Remover item">×</button></div></div>`; }).join('');
  return `<div class="ptop"><a href="#orcamentos" class="back">← Orçamentos</a><input class="title-in" data-k="${P}.cliente" value="${esc(o.cliente)}" placeholder="Nome do cliente" aria-label="Cliente"></div>
  <div class="work"><aside class="panel" id="panel"></aside><div class="form">
  <section class="sec"><header><span class="tag t5">1</span><div><h2>Pergunte antes de calcular</h2><small>data, convidados, sabores, personalização, entrega</small></div></header><div class="in"><div class="grid">
    ${fld(P + '.whats', 'WhatsApp', { text: 1, ph: '22 99999-0000' })}${fld(P + '.data', 'Data da festa', { date: 'date' })}${fld(P + '.hora', 'Horário', { date: 'time' })}${fld(P + '.convidados', 'Convidados', { suf: 'pessoas' })}
    ${fld(P + '.bolo', 'Tem bolo?', { opts: [['true', 'Sim'], ['false', 'Não']] })}${fld(P + '.status', 'Situação', { opts: STATUS })}</div><p id="o-dc" style="margin:10px 0 0"></p></div></section>
  <section class="sec"><header><span class="tag t1">2</span><div><h2>Itens do pedido</h2><small>preços da Ficha do Preço de cada doce</small></div><span class="tot" id="o-sub"></span></header><div class="in">
    ${its || '<p class="mute">Adicione os doces do pedido.</p>'}<div class="add">${S.doces.length ? `<button class="btn ghost" data-a="addItem" data-p="${P}.itens">+ Item</button>` : '<a class="btn" href="#doces">Cadastre um doce primeiro</a>'}</div></div></section>
  <section class="sec"><header><span class="tag t3">3</span><div><h2>Retirada ou entrega</h2><small>km × custo por km + tempo × valor da hora</small></div><span class="tot" id="o-ent"></span></header><div class="in"><div class="grid">
    ${fld(P + '.tipo', 'Como vai', { opts: [['retirada', 'Retirada no local'], ['entrega', 'Entrega']], re: 1 })}${o.tipo === 'entrega' ? fld(P + '.endereco', 'Bairro ou endereço', { text: 1 }) + fld(P + '.km', 'Km rodados (ida e volta)', { suf: 'km' }) + fld(P + '.gasolina', 'Gasolina', { pre: 'R$', suf: '/L' }) + fld(P + '.kmL', 'Seu carro faz', { suf: 'km/L' }) + fld(P + '.entMin', 'Tempo no trânsito', { suf: 'min' }) : ''}</div><div class="sum" id="o-se"></div></div></section>
  <section class="sec"><header><span class="tag t4">4</span><div><h2>Condições</h2><small>sinal, prazo, validade e o que está incluso</small></div></header><div class="in"><div class="grid">
    ${fld(P + '.sinalPct', 'Sinal para reservar a data', { suf: '%' })}${fld(P + '.restanteData', 'Restante pago até', { date: 'date' })}${fld(P + '.validade', 'Orçamento válido até', { date: 'date' })}</div>
    ${fld(P + '.incluso', 'O que está incluso, formas de pagamento, cancelamento', { area: 1 })}</div></section>
  <section class="sec"><header><span class="tag t2">W</span><div><h2>Mensagem para o cliente</h2><small>pronta para colar no WhatsApp</small></div></header><div class="in">
    <div class="msg" id="o-msg"></div><div class="add"><button class="btn" data-a="copyMsg" data-id="${esc(o.id)}">Copiar mensagem</button><a class="btn ghost" id="o-wa" target="_blank" rel="noopener">Abrir no WhatsApp</a></div></div></section>
  <div class="add"><button class="btn rasp" data-a="fecharOrc" data-id="${esc(o.id)}">Fechar esta encomenda</button><button class="btn ghost" data-a="dupOrc" data-id="${esc(o.id)}">Duplicar</button><button class="btn ghost" data-a="delOrc" data-id="${esc(o.id)}">Excluir</button></div>
  </div></div><div class="sticky-res" id="sticky"></div>`;
};
function msgOrc(o, r) {
  const L = [`Olá${o.cliente ? ', ' + o.cliente.replace(/\s*\(exemplo\)/, '') : ''}! Segue o orçamento${o.data ? ` para o dia ${fmtD(o.data)}${o.hora ? ' às ' + o.hora : ''}` : ''}:`, ''];
  r.itens.forEach((it, i) => { const ob = o.itens[i].obs; L.push(`• ${dec(it.qtd, 2)} × ${it.nome} (${it.porLote ? (it.lote || 'lote') : (it.unNome || 'unidade')})${ob ? ' ' + ob : ''}: ${brl(it.total)}`); });
  if (r.entrega) L.push(`• Entrega${o.endereco ? ' (' + o.endereco + ')' : ''}: ${brl(r.entrega)}`);
  L.push('', `*Total: ${brl(r.total)}*`, `Para reservar a data: sinal de ${dec(r.sinalPct, 1)}% (${brl(r.sinal)}).`, `Restante: ${brl(r.restante)}${o.restanteData ? ' até ' + fmtD(o.restanteData) : ''}.`);
  if (o.incluso) L.push('', o.incluso);
  if (o.validade) L.push('', `Orçamento válido até ${fmtD(o.validade)}.`);
  return L.join('\n');
}
function paintOrc(id) {
  const o = S.orcamentos.find(x => x.id === id); if (!o) return;
  const r = E.orcamento(o, S.cfg, S.despensa, S.doces);
  r.itens.forEach((it, i) => {
    put('o-it-' + i, `<b>${brl(it.total)}</b> <small>${dec(it.qtd, 2)} × ${brl(it.unit)}${it.acresc ? ` (inclui ${brl(it.acresc)} de personalização)` : ''}</small>`);
    put('o-ps-' + i, it.persCusto ? `(${brl(it.persCusto)} de material e horas) ÷ ${dec(r.b.divCerto, 3)} = <b>${brl(it.acresc)}</b> a mais, arredondado para cima` : '<small>Personalizar dá mais trabalho e usa material diferente: cobre os dois.</small>');
  });
  put('o-sub', brl(r.subtotal)); put('o-ent', o.tipo === 'entrega' ? brl(r.entrega) : 'Retirada');
  put('o-se', o.tipo === 'entrega' ? `<div><span>Combustível: ${dec(n(o.km), 1)} km × ${brl(r.custoKm)}</span><b>${brl(r.entCombust)}</b></div><div><span>Tempo: ${dec(n(o.entMin), 0)} min × ${brl(r.b.valorHora)}/h</span><b>${brl(r.entTempo)}</b></div><div class="big"><span>Taxa de entrega (arredondada)</span><b>${brl(r.entrega)}</b></div>` : '<div><span class="mute">Retirada no local: sem taxa.</span></div>');
  put('o-dc', r.docinhos ? `Referência para festa com bolo: <b>${r.docinhos[0]} a ${r.docinhos[1]} docinhos</b> (4 a 6 por convidado). Ajuste com o cliente.${String(o.bolo) === 'false' ? ' Sem bolo, as pessoas costumam comer mais.' : ''}` : '');
  const m = msgOrc(o, r); put('o-msg', esc(m));
  const w = $('o-wa'); if (w) { let num = String(o.whats || '').replace(/\D/g, ''); if (num && num.length <= 11) num = '55' + num; w.href = `https://wa.me/${num}?text=${encodeURIComponent(m)}`; }
  put('panel', `<div class="price"><div class="k">Total do pedido</div><div class="v">${brl(r.total)}</div><div class="u">${r.itens.length} ${plural(r.itens.length, 'item', 'itens')}${r.entrega ? ' + entrega' : ''}</div>
    <div class="duo"><div><span>Sinal (${dec(r.sinalPct, 1)}%)</span><b>${brl(r.sinal)}</b></div><div><span>Restante</span><b>${brl(r.restante)}</b></div></div></div>
    <div class="private"><div class="h">Só para você: não envie ao cliente</div><div class="sum" style="border:0;margin-top:4px;padding-top:0"><div><span>Preço mínimo deste pedido</span><b>${brl(r.minimo)}</b></div><div class="big"><span>Desconto máximo</span><b>${brl(r.descMax)}</b></div></div>
    <small>Acima disso, o pedido dá prejuízo. Prefira trocar desconto por ajuste.</small></div>
    <div class="card" style="padding:14px"><h3>Custo previsto por gaveta</h3><ul class="leg">${['Ingredientes + perdas', 'Embalagem', 'Custos da casa', 'Seu tempo (' + hrs(r.horas) + ')'].map((t, k) => `<li><i class="dot" style="background:var(--g${k + 1})"></i>${t}<b>${brl(r.prev[k])}</b></li>`).join('')}</ul></div>`);
  put('sticky', `<span>Total · sinal ${brl(r.sinal)}<br><small style="color:inherit;opacity:.75">desconto máx. ${brl(r.descMax)}</small></span><b>${brl(r.total)}</b>`);
}

// ---------- fechamentos ----------
const PAG = [['Pix', 'Pix'], ['Dinheiro', 'Dinheiro'], ['Débito', 'Débito'], ['Crédito', 'Crédito'], ['Link', 'Link de pagamento'], ['App', 'Aplicativo de entrega']];
V.fechamentos = () => `<div class="headrow"><div><h1>Fechamentos</h1><span class="mute">Ficha 4. Previsto × real: 5 minutos que deixam o próximo preço mais certo.</span></div><button class="btn" data-a="novoFec">Novo fechamento</button></div>
  <div class="list">${S.fechamentos.slice().reverse().map(f => { const r = E.fechamento(f, S.cfg); return `<a class="card li" href="#fec-${esc(f.id)}"><div><h3>${esc(f.nome || 'Encomenda')}</h3><small>${f.data ? fmtD(f.data) + ' · ' : ''}${esc(f.pagamento || '')} · previsto ${brl(r.lucroPrev)}</small></div><div class="r ${r.lucroReal < r.lucroPrev ? 'pos' : 'neg'}">${brl(r.lucroReal)}<br><small>lucro real</small></div></a>`; }).join('') || '<div class="card empty">Nenhum fechamento ainda. Feche uma encomenda a partir do orçamento, ou comece um novo aqui.</div>'}</div>`;
V.fec = id => {
  const fi = S.fechamentos.findIndex(f => f.id === id); if (fi < 0) return notFound('fechamentos');
  const f = S.fechamentos[fi], P = `fechamentos.${fi}`;
  return `<div class="ptop"><a href="#fechamentos" class="back">← Fechamentos</a><input class="title-in" data-k="${P}.nome" value="${esc(f.nome)}" placeholder="Encomenda / cliente" aria-label="Encomenda"></div>
  <div class="work"><aside class="panel" id="panel"></aside><div class="form">
  <section class="sec"><header><span class="tag t5">1</span><div><h2>Venda</h2><small>preço cobrado e forma de pagamento</small></div></header><div class="in"><div class="grid">
    ${fld(P + '.data', 'Data da entrega', { date: 'date' })}${fld(P + '.preco', 'Preço cobrado', { pre: 'R$' })}${fld(P + '.pagamento', 'Forma de pagamento', { opts: PAG, re: 1 })}${fld(P + '.taxaPct', 'Taxa cobrada', { suf: '%', hint: 'Pix e dinheiro: 0%' })}</div>
    ${f.origem === 'doce' ? `<div class="grid" style="margin-top:12px"><label class="fld"><span class="lb">Doce</span><span class="ctl">${sel(P + '.doce', S.doces.map(d => [d.id, d.nome]), { re: 1 })}</span></label>${fld(P + '.lotes', 'Quantos lotes', { suf: '×' })}</div><div class="add"><button class="btn ghost" data-a="puxarPrev" data-id="${esc(f.id)}">Puxar previsto da Ficha do Preço</button></div>` : ''}</div></section>
  <section class="sec"><header><span class="tag t1">2</span><div><h2>O que aconteceu de verdade</h2><small>anote durante a produção</small></div></header><div class="in"><div class="grid">
    ${fld(P + '.extraIng', 'Gasto extra com ingredientes e perdas', { pre: 'R$', hint: 'panela que passou do ponto, ingrediente que subiu' })}${fld(P + '.embReal', 'Embalagem real', { pre: 'R$', ph: dec(n(f.prev[1])) })}${fld(P + '.casaReal', 'Custos da casa reais', { pre: 'R$', ph: dec(n(f.prev[2])) })}${fld(P + '.horasReal', 'Horas reais de produção', { suf: 'h', ph: dec(n(f.horasPrev)), hint: 'previsto: ' + hrs(n(f.horasPrev)) })}</div></div></section>
  <section class="sec"><header><span class="tag t4">3</span><div><h2>Previsto × real</h2></div></header><div class="in"><div class="scroll" id="o-tab"></div></div></section>
  <section class="sec"><header><span class="tag t5">4</span><div><h2>O que aprendi</h2></div></header><div class="in">
    ${fld(P + '.mudou', 'O que mudou nesta encomenda?', { area: 1 })}${fld(P + '.ajuste', 'O que vou ajustar na Ficha do Preço?', { area: 1 })}
    <div class="hint"><b>Refaça o preço quando:</b> a mesma diferença aparecer em 2 ou 3 encomendas seguidas, um ingrediente principal subir, trocar de embalagem, fornecedor ou receita, ou a cada 3 meses.</div></div></section>
  <div class="add"><button class="btn ghost" data-a="delFec" data-id="${esc(f.id)}">Excluir fechamento</button></div>
  </div></div><div class="sticky-res" id="sticky"></div>`;
};
function paintFec(id) {
  const f = S.fechamentos.find(x => x.id === id); if (!f) return;
  const r = E.fechamento(f, S.cfg), dif = (a, b) => { const d = r2(b - a); return d ? `<span class="${d > 0 ? 'pos' : 'neg'}">${d > 0 ? '+' : '−'}${brl(Math.abs(d))}</span>` : '—'; };
  const rows = [['Gaveta 1 · Ingredientes + perdas', r.prev[0], r.real[0]], ['Gaveta 2 · Embalagem', r.prev[1], r.real[1]], ['Gaveta 3 · Custos da casa', r.prev[2], r.real[2]], [`Gaveta 4 · Seu tempo (${hrs(r.hPrev)} → ${hrs(r.hReal)})`, r.prev[3], r.real[3]]];
  put('o-tab', `<table class="tbl"><thead><tr><th>O que</th><th class="num">Previsto</th><th class="num">Real</th><th class="num">Diferença</th></tr></thead><tbody>
    ${rows.map(([t, a, b]) => `<tr><td>${t}</td><td class="num">${brl(a)}</td><td class="num">${brl(b)}</td><td class="num">${dif(a, b)}</td></tr>`).join('')}
    <tr><td><b>Custo total</b></td><td class="num"><b>${brl(r.cPrev)}</b></td><td class="num"><b>${brl(r.cReal)}</b></td><td class="num">${dif(r.cPrev, r.cReal)}</td></tr>
    <tr><td>Taxas</td><td class="num">${brl(r.taxasPrev)}</td><td class="num">${brl(r.taxasReal)}</td><td class="num">${dif(r.taxasPrev, r.taxasReal)}</td></tr>
    <tr><td>Despesas fixas (${pct(r.b.fixas)})</td><td class="num">${brl(r.fixas)}</td><td class="num">${brl(r.fixas)}</td><td class="num">—</td></tr>
    <tr class="tt"><td>Lucro do negócio</td><td class="num">${brl(r.lucroPrev)}</td><td class="num">${brl(r.lucroReal)}</td><td class="num">${(() => { const d = r2(r.lucroReal - r.lucroPrev); return d ? `<span class="${d < 0 ? 'pos' : 'neg'}">${d > 0 ? '+' : '−'}${brl(Math.abs(d))}</span>` : '—'; })()}</td></tr></tbody></table>`);
  const pior = r.lucroReal < r.lucroPrev;
  put('panel', `<div class="price" style="${pior ? 'background:var(--amb)' : ''}"><div class="k" style="${pior ? 'color:var(--ink)' : ''}">Lucro real do negócio</div><div class="v">${brl(r.lucroReal)}</div><div class="u">previsto ${brl(r.lucroPrev)} · suas ${hrs(r.hReal)} já pagas</div>
    <div class="duo"><div><span>Custo real</span><b>${brl(r.cReal)}</b></div><div><span>Preço cobrado</span><b>${brl(r.P)}</b></div></div></div>
    <div class="card" style="padding:14px">${r.lucroReal < 0 ? 'Esta encomenda deu prejuízo, mesmo com suas horas pagas. Revise a Ficha do Preço antes da próxima.' : r.hReal > r.hPrev ? `A produção levou ${hrs(r.hReal - r.hPrev)} a mais. Se isso se repetir, refaça o preço com ${hrs(r.hReal)} na Gaveta 4.` : pior ? 'Deu lucro, mas abaixo do previsto. Veja na tabela onde foi a diferença.' : 'Saiu como o previsto. Seu preço está certo para este doce.'}</div>`);
  put('sticky', `<span>Lucro real<br><small style="color:inherit;opacity:.75">previsto ${brl(r.lucroPrev)}</small></span><b>${brl(r.lucroReal)}</b>`);
}

V.mais = () => `<h1>Mais</h1><div class="list" style="margin-top:14px">${[['base', 'Minha base', 'Valor da hora, custos da casa, despesas fixas e a sua Régua do Preço'], ['despensa', 'Despensa', 'Preços dos ingredientes e embalagens que você compra'], ['esquecidos', 'Custos esquecidos', 'A lista para conferir antes de passar orçamento'], ['dados', 'Backup dos seus dados', 'Salvar, restaurar ou recomeçar']].map(([h, t, s]) => `<a class="card li" href="#${h}"><div><h3>${t}</h3><small>${s}</small></div><span class="r">›</span></a>`).join('')}</div>`;

V.dados = () => `<h1>Backup dos seus dados</h1><p class="mute">Seus doces ficam salvos neste aparelho. Copie o backup de vez em quando e guarde no WhatsApp ou no e-mail, para não perder se trocar de celular.</p>
  <div class="homeg"><div class="list">
  <div class="card"><h3>Salvar backup</h3><p class="mute" style="margin:6px 0 10px">${S.doces.length} doces · ${S.despensa.length} itens na despensa · ${S.orcamentos.length} orçamentos · ${S.fechamentos.length} fechamentos</p>
    <div class="add"><button class="btn" data-a="copyBk">Copiar backup</button>${window.self === window.top ? '<button class="btn ghost" data-a="dlBk">Baixar arquivo</button>' : ''}</div></div>
  <div class="card"><h3>Restaurar backup</h3><p class="mute" style="margin:6px 0 10px">Cole o texto do backup ou escolha o arquivo. Isso substitui os dados atuais.</p>
    <span class="ctl"><textarea id="bk-in" rows="4" placeholder='{"v":1,…}'></textarea></span>
    <div class="add"><button class="btn" data-a="restBk">Restaurar</button><label class="btn ghost">Escolher arquivo<input type="file" id="bk-file" accept=".json,application/json" hidden></label></div></div>
  </div><div class="list"><div class="card"><h3>Recomeçar</h3><p class="mute" style="margin:6px 0 10px">Apaga doces, despensa, orçamentos e fechamentos. Mantém Minha base.</p><button class="btn ghost" data-a="zerar">Começar do zero</button></div>
  <div class="card"><h3>Ver os exemplos de novo</h3><p class="mute" style="margin:6px 0 10px">Carrega brigadeiro, brownie e doce no pote do material, no lugar dos seus dados.</p><button class="btn ghost" data-a="exemplos">Carregar exemplos</button></div></div></div>`;

function notFound(back) { return `<div class="card empty"><p>Não encontrei esse item.</p><a class="btn" href="#${back}">Voltar</a></div>`; }

// ---------- roteamento ----------
const PAINT = { doce: paintDoce, base: paintBase, despensa: paintDespensa, orc: paintOrc, fec: paintFec };
let cur = { view: 'inicio', id: null };
function render() {
  const h = (location.hash || '#inicio').slice(1);
  const m = h.match(/^(doce|orc|fec)-(.+)$/);
  cur = m ? { view: m[1], id: m[2] } : { view: V[h] ? h : 'inicio', id: null };
  const y = window.scrollY, same = render.last === h;
  $('app').innerHTML = V[cur.view](cur.id);
  $('app').className = ['doce', 'orc', 'fec'].includes(cur.view) ? 'has-sticky' : '';
  nav(cur.view);
  paint = PAINT[cur.view] ? () => PAINT[cur.view](cur.id) : () => {};
  paint();
  if (same) window.scrollTo(0, y); else window.scrollTo(0, 0);
  render.last = h;
}
const go = h => { if (location.hash === '#' + h) render(); else location.hash = h; };

// ---------- ações ----------
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 1800); }
function ask(msg, ok, fn) {
  const ov = document.createElement('div'); ov.className = 'ov';
  ov.innerHTML = `<div class="card" role="dialog" aria-modal="true"><p style="margin:0">${msg}</p><div class="acts"><button class="btn ghost" data-x>Cancelar</button><button class="btn rasp" data-ok>${ok}</button></div></div>`;
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); if (e.target.closest('[data-ok]')) { ov.remove(); fn(); } });
  document.body.appendChild(ov); ov.querySelector('[data-ok]').focus();
}
async function copy(t) {
  try { await navigator.clipboard.writeText(t); toast('Copiado'); }
  catch (e) { const ov = document.createElement('div'); ov.className = 'ov'; ov.innerHTML = `<div class="card"><p style="margin:0 0 8px">Selecione e copie:</p><span class="ctl"><textarea rows="8"></textarea></span><div class="acts"><button class="btn" data-x>Fechar</button></div></div>`; ov.querySelector('textarea').value = t; ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); }); document.body.appendChild(ov); ov.querySelector('textarea').select(); }
}
const novoDoce = () => ({ id: uid(), nome: 'Novo doce', lote: '', unNome: '', receita: [], rendimento: '', nReceitas: 1, unidades: '', perdas: '', embalagem: [], bocaMin: '', fornoMin: '', aparelhos: [], limpezaReceitas: '', tarefas: ['Preparar', 'Cozinhar', 'Enrolar ou decorar', 'Embalar', 'Limpar'].map(t => ({ nome: t, min: '' })), arred: String(S.cfg.arred || 0.1), cobroHoje: '', mercado: '', decisao: '', notas: '', atualizado: today() });
function prevDoce(d, lotes) { const r = E.doce(d, S.cfg, S.despensa), k = n(lotes) || 1; return { prev: [r.g1, r.g2, r.g3, r.g4].map(v => r2(v * k)), horas: r2(r.horas * k), preco: r2(r.certo * k) }; }
const A = {
  novoDoce() { const d = novoDoce(); S.doces.push(d); S.exemplo = false; save(); go('doce-' + d.id); },
  dupDoce({ id }) { const d = JSON.parse(JSON.stringify(S.doces.find(x => x.id === id))); d.id = uid(); d.nome += ' (cópia)'; S.doces.push(d); save(); go('doce-' + d.id); toast('Doce duplicado'); },
  delDoce({ id }) { ask('Excluir este doce? A receita e as gavetas serão apagadas.', 'Excluir', () => { S.doces = S.doces.filter(x => x.id !== id); save(); go('doces'); }); },
  del({ p, i }) { get(p).splice(+i, 1); save(); render(); },
  push({ p, v }) { get(p).push(JSON.parse(v)); save(); render(); },
  novoIns({ t, d }) {
    const v = k => ($(`nq-${k}-${t}`) || {}).value || '';
    if (!v('nome').trim()) { toast('Dê um nome ao item'); return; }
    const ins = { id: uid(), tipo: t, nome: v('nome').trim(), preco: v('preco'), qtd: v('qtd'), un: t === 'ing' ? v('un') : 'un', atualizado: today() };
    S.despensa.push(ins); S.doces[+d][t === 'ing' ? 'receita' : 'embalagem'].push(t === 'ing' ? { insumo: ins.id, usado: v('usado') } : { insumo: ins.id, qtd: v('usado') });
    save(); render(); toast('Adicionado');
  },
  novoInsD({ t }) { S.despensa.push({ id: uid(), tipo: t, nome: '', preco: '', qtd: '', un: t === 'ing' ? 'g' : 'un', atualizado: today() }); save(); render(); },
  delIns({ id }) {
    const u = S.doces.filter(d => d.receita.some(l => l.insumo === id) || d.embalagem.some(l => l.insumo === id));
    const doit = () => { S.despensa = S.despensa.filter(x => x.id !== id); S.doces.forEach(d => { d.receita = d.receita.filter(l => l.insumo !== id); d.embalagem = d.embalagem.filter(l => l.insumo !== id); }); save(); render(); };
    u.length ? ask(`Este item está em ${u.length} ${plural(u.length, 'doce', 'doces')} e sairá deles também. Excluir?`, 'Excluir', doit) : doit();
  },
  novoOrc() { const o = { id: uid(), cliente: '', whats: '', data: '', hora: '', convidados: '', bolo: 'true', tipo: 'retirada', endereco: '', km: '', gasolina: '', kmL: '', entMin: '', itens: S.doces.length ? [{ doce: S.doces[0].id, qtd: 1, modo: 'lote', persMaterial: '', persMin: '', obs: '' }] : [], sinalPct: 50, restanteData: '', validade: '', incluso: '', status: 'rascunho' }; S.orcamentos.push(o); save(); go('orc-' + o.id); },
  addItem({ p }) { get(p).push({ doce: S.doces[0].id, qtd: 1, modo: 'lote', persMaterial: '', persMin: '', obs: '' }); save(); render(); },
  dupOrc({ id }) { const o = JSON.parse(JSON.stringify(S.orcamentos.find(x => x.id === id))); o.id = uid(); o.cliente += ' (cópia)'; o.status = 'rascunho'; S.orcamentos.push(o); save(); go('orc-' + o.id); },
  delOrc({ id }) { ask('Excluir este orçamento?', 'Excluir', () => { S.orcamentos = S.orcamentos.filter(x => x.id !== id); save(); go('orcamentos'); }); },
  copyMsg({ id }) { const o = S.orcamentos.find(x => x.id === id); copy(msgOrc(o, E.orcamento(o, S.cfg, S.despensa, S.doces))); },
  fecharOrc({ id }) {
    const o = S.orcamentos.find(x => x.id === id), r = E.orcamento(o, S.cfg, S.despensa, S.doces);
    const ds = [...new Set(r.itens.map(i => i.doce))];
    const f = { id: uid(), nome: o.cliente || 'Encomenda', origem: 'orc', orc: o.id, doce: ds.length === 1 ? ds[0] : '', data: o.data, preco: r.total, pagamento: 'Pix', taxaPct: 0, prev: r.prev, horasPrev: r2(r.horas), extraIng: '', embReal: '', casaReal: '', horasReal: '', mudou: '', ajuste: '' };
    o.status = 'fechado'; S.fechamentos.push(f); save(); go('fec-' + f.id);
  },
  novoFec() { if (!S.doces.length) { toast('Cadastre um doce primeiro'); return; } const d = S.doces[0], p = prevDoce(d, 1); const f = { id: uid(), nome: d.nome, origem: 'doce', doce: d.id, lotes: 1, data: today(), preco: p.preco, pagamento: 'Pix', taxaPct: 0, prev: p.prev, horasPrev: p.horas, extraIng: '', embReal: '', casaReal: '', horasReal: '', mudou: '', ajuste: '' }; S.fechamentos.push(f); save(); go('fec-' + f.id); },
  puxarPrev({ id }) { const f = S.fechamentos.find(x => x.id === id), d = S.doces.find(x => x.id === f.doce); if (!d) return; const p = prevDoce(d, f.lotes); f.prev = p.prev; f.horasPrev = p.horas; if (!n(f.preco)) f.preco = p.preco; save(); render(); toast('Previsto atualizado'); },
  delFec({ id }) { ask('Excluir este fechamento?', 'Excluir', () => { S.fechamentos = S.fechamentos.filter(x => x.id !== id); save(); go('fechamentos'); }); },
  copyBk() { copy(JSON.stringify(S)); },
  dlBk() { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' })); a.download = `doce-que-lucra-backup-${today()}.json`; a.click(); } catch (e) { toast('Não deu para baixar aqui. Use Copiar backup.'); } },
  restBk() { restore(($('bk-in') || {}).value); },
  zerar() { ask('Começar com os seus doces? Os exemplos (doces, despensa, orçamento e fechamento) serão apagados. Minha base fica.', 'Começar', () => { Object.assign(S, { exemplo: false, despensa: [], doces: [], orcamentos: [], fechamentos: [] }); save(); go('base'); toast('Comece pela sua base'); }); },
  exemplos() { ask('Carregar os exemplos do material? Seus dados atuais serão substituídos. Copie um backup antes, se quiser guardá-los.', 'Carregar', () => { S = SEED(); save(); go('inicio'); }); }
};
function restore(txt) {
  try { const x = JSON.parse(txt); if (!x || !x.cfg || !Array.isArray(x.doces)) throw 0; ask('Substituir os dados atuais por este backup?', 'Restaurar', () => { S = Object.assign(SEED(), { checks: {}, plano: {} }, x); save(); go('inicio'); toast('Backup restaurado'); }); }
  catch (e) { toast('Esse texto não é um backup válido'); }
}

// ---------- eventos ----------
const app = $('app');
function onField(e) {
  const el = e.target;
  if (el.dataset.add != null) { if (!el.value) return; const d = S.doces[+el.dataset.d]; if (el.dataset.add === 'ing') d.receita.push({ insumo: el.value, usado: '' }); else d.embalagem.push({ insumo: el.value, qtd: '' }); save(); render(); return; }
  const k = el.dataset.k;
  if (!k) { if (e.type === 'input' || el.tagName === 'SELECT') paint(); if (el.id === 'bk-file' && el.files[0]) el.files[0].text().then(restore); return; }
  if (e.type === 'change' && el.tagName !== 'SELECT' && el.type !== 'checkbox' && el.type !== 'date' && el.type !== 'time') return;
  let v = el.type === 'checkbox' ? el.checked : el.value;
  if (k.endsWith('.bolo')) v = String(v);
  set(k, v);
  const dm = k.match(/^doces\.(\d+)\./); if (dm) S.doces[+dm[1]].atualizado = today();
  const pm = k.match(/^despensa\.(\d+)\.(preco|qtd|un)$/); if (pm) S.despensa[+pm[1]].atualizado = today();
  if (/^fechamentos\.\d+\.pagamento$/.test(k)) { const f = get(k.replace('.pagamento', '')); f.taxaPct = ['Pix', 'Dinheiro'].includes(v) ? 0 : S.cfg.taxas; }
  if (k === 'cfg.nome' || k === 'cfg.arred') {}
  save();
  if (el.dataset.re != null) render(); else paint();
}
app.addEventListener('input', onField);
app.addEventListener('change', onField);
document.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (b && A[b.dataset.a]) { e.preventDefault(); A[b.dataset.a](b.dataset); } });
window.addEventListener('hashchange', render);

const start = data => { S = (data && data.cfg) ? data : (load() || SEED()); S.checks = S.checks || {}; S.plano = S.plano || {}; render(); };
window.claude?.hot?.snapshot?.(() => S);
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? null);
}
