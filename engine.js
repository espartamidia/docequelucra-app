// Motor de cálculo — Método das 4 Gavetas (Doce que Lucra)
// Cada linha é arredondada em centavos, como quem faz a conta na calculadora.
const E = (() => {
  const r2 = x => Math.round((x + Math.sign(x) * 1e-9) * 100) / 100;
  const n = v => { const x = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(x) ? x : 0; };
  const ceilStep = (x, step) => step > 0 ? Math.ceil(r2(x / step) - 1e-9) * step : x;
  const toBase = (qtd, un) => (un === 'kg' || un === 'L') ? n(qtd) * 1000 : n(qtd);
  const baseUn = un => ({ kg: 'g', L: 'ml' }[un] || un);

  function base(c) {
    const horasMes = n(c.horasMes) || n(c.diasSemana) * n(c.horasDia) * 4;
    const valorHora = horasMes ? n(c.salario) / horasMes : 0;
    const kgGas = n(c.botijao) / 13;
    const bocaH = kgGas * n(c.kgBoca);
    const fornoH = kgGas * n(c.kgForno);
    const limpezaReceita = n(c.receitasMes) ? n(c.limpezaMes) / n(c.receitasMes) : 0;
    const fixasTotal = r2((c.fixas || []).reduce((s, f) => s + n(f.valor), 0));
    const fixasPct = n(c.faturamento) ? fixasTotal / n(c.faturamento) * 100 : 0;
    const fixasUsada = c.fixasManual ? n(c.fixasPctManual) : Math.round(fixasPct * 10) / 10;
    const taxas = n(c.taxas), lucro = n(c.lucro);
    const divCerto = 1 - (taxas + fixasUsada + lucro) / 100;
    const divMin = 1 - (taxas + fixasUsada) / 100;
    return { horasMes, valorHora: r2(valorHora), kgGas, bocaH, fornoH, limpezaReceita, fixasTotal, fixasPct, fixas: fixasUsada, taxas, lucro, divCerto, divMin, tarifa: n(c.tarifa), perdas: n(c.perdas) };
  }

  const precoUn = ins => ins ? n(ins.preco) / (toBase(ins.qtd, ins.un) || 1) : 0;

  function lucroReal(P, custo, b, taxaPct) {
    const tx = taxaPct == null ? b.taxas : taxaPct;
    const taxas = r2(P * tx / 100), fixas = r2(P * b.fixas / 100);
    // lucro calculado com taxas + fixas juntas, arredondado no fim (igual aos exemplos do material)
    return { taxas, fixas, lucro: Math.round((P - custo - P * (tx + b.fixas) / 100) * 100) / 100 };
  }

  function doce(d, cfg, despensa) {
    const b = base(cfg);
    const find = id => despensa.find(i => i.id === id);
    const linhas = (d.receita || []).map(l => {
      const ins = find(l.insumo); const pu = precoUn(ins);
      return { nome: ins ? ins.nome : '(item removido)', un: ins ? baseUn(ins.un) : '', pu, usado: n(l.usado), custo: r2(pu * n(l.usado)), ins };
    });
    const custoReceita = r2(linhas.reduce((s, l) => s + l.custo, 0));
    const rend = n(d.rendimento);
    const nRec = n(d.nReceitas) || 1;
    const unidades = n(d.unidades) || rend * nRec || 1;
    const ing = r2(nRec * custoReceita);
    const perdasPct = d.perdas == null || d.perdas === '' ? b.perdas : n(d.perdas);
    const perdas = r2(ing * perdasPct / 100);
    const g1 = r2(ing + perdas);

    const emb = (d.embalagem || []).map(l => {
      const ins = find(l.insumo); const pu = precoUn(ins);
      return { nome: ins ? ins.nome : '(item removido)', qtd: n(l.qtd), pu, custo: r2(pu * n(l.qtd)) };
    });
    const g2 = r2(emb.reduce((s, l) => s + l.custo, 0));

    const casa = [];
    if (n(d.bocaMin)) casa.push({ nome: 'Gás da boca', conta: `${fmtH(n(d.bocaMin) / 60)} × ${brl(b.bocaH)}/h`, custo: r2(n(d.bocaMin) / 60 * b.bocaH) });
    if (n(d.fornoMin)) casa.push({ nome: 'Gás do forno', conta: `${fmtH(n(d.fornoMin) / 60)} × ${brl(b.fornoH)}/h`, custo: r2(n(d.fornoMin) / 60 * b.fornoH) });
    (d.aparelhos || []).forEach(a => {
      const kwh = n(a.watts) * n(a.min) / 60 / 1000;
      if (kwh) casa.push({ nome: a.nome || 'Aparelho', conta: `${kwh.toFixed(3).replace('.', ',')} kWh × ${brl(b.tarifa)}`, custo: r2(kwh * b.tarifa) });
    });
    const limpRec = d.limpezaReceitas == null || d.limpezaReceitas === '' ? nRec : n(d.limpezaReceitas);
    if (b.limpezaReceita && limpRec) casa.push({ nome: 'Água e limpeza', conta: `${limpRec} × ${brl(b.limpezaReceita)}`, custo: r2(limpRec * b.limpezaReceita) });
    const g3 = r2(casa.reduce((s, l) => s + l.custo, 0));

    const minutos = (d.tarefas || []).reduce((s, t) => s + n(t.min), 0);
    const horas = minutos / 60;
    const g4 = r2(horas * b.valorHora);

    const total = r2(g1 + g2 + g3 + g4);
    const calc = b.divCerto > 0 ? r2(total / b.divCerto) : 0;
    const step = n(d.arred) || n(cfg.arred) || 0.10;
    const certoUn = r2(ceilStep(calc / unidades, step));
    const certo = r2(certoUn * unidades);
    const minimo = b.divMin > 0 ? r2(total / b.divMin) : 0;
    const x3 = r2(ing * 3);
    const lucroCerto = lucroReal(certo, total, b).lucro;
    const lucroX3 = lucroReal(x3, total, b).lucro;
    const hoje = n(d.cobroHoje), mercado = n(d.mercado);
    const lucroHoje = hoje ? lucroReal(hoje, total, b).lucro : null;
    const zona = p => !p ? null : p < minimo ? 'abaixo' : p < certo ? 'entre' : 'acima';
    return {
      b, linhas, custoReceita, rend, custoUnIng: rend ? r2(custoReceita / rend) : 0, nRec, unidades,
      ing, perdasPct, perdas, g1, emb, g2, casa, g3, minutos, horas, g4, total, porUn: Math.round(total / unidades * 100) / 100,
      calc, step, certo, certoUn, minimo, minimoUn: r2(minimo / unidades), x3, lucroCerto, lucroX3,
      hoje, mercado, lucroHoje, zonaHoje: zona(hoje), zonaMercado: zona(mercado), descMax: r2(certo - minimo)
    };
  }

  function desconto(r, pct) {
    const P = r2(r.certo * (1 - pct / 100));
    const l = lucroReal(P, r.total, r.b).lucro;
    return { preco: P, lucro: l, perda: r.lucroCerto ? (l - r.lucroCerto) / r.lucroCerto * 100 : 0 };
  }

  function orcamento(o, cfg, despensa, doces) {
    const b = base(cfg);
    const itens = (o.itens || []).map(it => {
      const d = doces.find(x => x.id === it.doce);
      if (!d) return { nome: '(doce removido)', qtd: 0, total: 0, piso: 0, prev: [0, 0, 0, 0], horas: 0 };
      const r = doce(d, cfg, despensa);
      const qtd = n(it.qtd);
      const porLote = it.modo !== 'un';
      const fator = porLote ? qtd : qtd / r.unidades;
      const base = porLote ? r.certo : r.certoUn;
      const persCusto = n(it.persMaterial) + n(it.persMin) / 60 * b.valorHora;
      const acresc = persCusto ? Math.ceil(r2(persCusto / b.divCerto) - 1e-9) : 0;
      const total = r2(qtd * base + acresc);
      const piso = r2(fator * r.minimo + (persCusto ? persCusto / b.divMin : 0));
      const prev = [r.g1 * fator, r.g2 * fator + n(it.persMaterial), r.g3 * fator, r.g4 * fator + r2(n(it.persMin) / 60 * b.valorHora)].map(r2);
      return { nome: d.nome, lote: d.lote, unNome: d.unNome, porLote, qtd, base, acresc, persCusto: r2(persCusto), total, unit: qtd ? r2(total / qtd) : 0, piso, prev, horas: r.horas * fator + n(it.persMin) / 60, doce: d.id };
    });
    const km = n(o.km), custoKm = n(o.kmL) ? n(o.gasolina) / n(o.kmL) : 0;
    const entCombust = r2(km * custoKm), entTempo = r2(n(o.entMin) / 60 * b.valorHora);
    const entCusto = r2(entCombust + entTempo);
    const entrega = o.tipo === 'entrega' && entCusto ? Math.ceil(entCusto - 1e-9) : 0;
    const subtotal = r2(itens.reduce((s, i) => s + i.total, 0));
    const total = r2(subtotal + entrega);
    const sinalPct = o.sinalPct == null || o.sinalPct === '' ? 50 : n(o.sinalPct);
    const sinal = r2(total * sinalPct / 100);
    const minimo = r2(itens.reduce((s, i) => s + i.piso, 0) + (entrega ? entCusto : 0));
    const prev = [0, 1, 2, 3].map(k => r2(itens.reduce((s, i) => s + i.prev[k], 0)));
    if (entrega) { prev[2] = r2(prev[2] + entCombust); prev[3] = r2(prev[3] + entTempo); }
    const horas = itens.reduce((s, i) => s + i.horas, 0) + (entrega ? n(o.entMin) / 60 : 0);
    const docinhos = n(o.convidados) ? [n(o.convidados) * 4, n(o.convidados) * 6] : null;
    return { b, itens, custoKm, entCombust, entTempo, entCusto, entrega, subtotal, total, sinalPct, sinal, restante: r2(total - sinal), minimo, descMax: r2(total - minimo), prev, horas, docinhos };
  }

  function fechamento(f, cfg) {
    const b = base(cfg);
    const P = n(f.preco);
    const prev = (f.prev || [0, 0, 0, 0]).map(n);
    const hPrev = n(f.horasPrev), hReal = f.horasReal === '' || f.horasReal == null ? hPrev : n(f.horasReal);
    const g4Real = hReal === hPrev ? prev[3] : r2(prev[3] + (hReal - hPrev) * b.valorHora);
    const real = [r2(prev[0] + n(f.extraIng)), f.embReal === '' || f.embReal == null ? prev[1] : n(f.embReal), f.casaReal === '' || f.casaReal == null ? prev[2] : n(f.casaReal), g4Real];
    const cPrev = r2(prev.reduce((s, x) => s + x, 0)), cReal = r2(real.reduce((s, x) => s + x, 0));
    const lp = lucroReal(P, cPrev, b), lr = lucroReal(P, cReal, b, n(f.taxaPct));
    return { b, P, prev, real, cPrev, cReal, hPrev, hReal, taxasPrev: lp.taxas, taxasReal: lr.taxas, fixas: lp.fixas, lucroPrev: lp.lucro, lucroReal: lr.lucro };
  }

  const brl = v => 'R$ ' + (Math.round(n(v) * 100) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtH = h => (Math.round(h * 100) / 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' h';
  return { r2, n, ceilStep, toBase, baseUn, base, precoUn, lucroReal, doce, desconto, orcamento, fechamento, brl, fmtH };
})();
if (typeof module !== 'undefined') module.exports = E;
