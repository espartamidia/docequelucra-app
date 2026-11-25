// Exemplos do material (Bônus 3) — valores de referência de 2026
const SEED = () => ({
  v: 1,
  exemplo: true,
  cfg: {
    salario: 2400, diasSemana: 5, horasDia: 8, horasMes: '',
    botijao: 120, kgBoca: 0.15, kgForno: 0.22, tarifa: 0.95,
    limpezaMes: 20, receitasMes: 40,
    fixas: [
      { nome: 'DAS do MEI', valor: 80 },
      { nome: 'Parte do celular e internet', valor: 60 },
      { nome: 'Reposição de utensílios', valor: 50 },
      { nome: 'Transporte para compras e entregas', valor: 90 }
    ],
    faturamento: 2800, fixasManual: false, fixasPctManual: '',
    taxas: 3, lucro: 15, perdas: 5, arred: 0.10, nome: ''
  },
  despensa: [
    { id: 'lc', tipo: 'ing', nome: 'Leite condensado', preco: 8.00, qtd: 395, un: 'g' },
    { id: 'mt', tipo: 'ing', nome: 'Manteiga', preco: 12.00, qtd: 200, un: 'g' },
    { id: 'cp', tipo: 'ing', nome: 'Chocolate em pó 50%', preco: 13.00, qtd: 200, un: 'g' },
    { id: 'gr', tipo: 'ing', nome: 'Granulado', preco: 6.00, qtd: 150, un: 'g' },
    { id: 'cma', tipo: 'ing', nome: 'Chocolate meio amargo (barra)', preco: 70.00, qtd: 1, un: 'kg' },
    { id: 'ac', tipo: 'ing', nome: 'Açúcar', preco: 5.00, qtd: 1, un: 'kg' },
    { id: 'ov', tipo: 'ing', nome: 'Ovos', preco: 10.80, qtd: 12, un: 'un' },
    { id: 'ft', tipo: 'ing', nome: 'Farinha de trigo', preco: 6.00, qtd: 1, un: 'kg' },
    { id: 'cc', tipo: 'ing', nome: 'Cacau em pó', preco: 13.00, qtd: 200, un: 'g' },
    { id: 'cl', tipo: 'ing', nome: 'Creme de leite', preco: 3.50, qtd: 200, un: 'g' },
    { id: 'co', tipo: 'ing', nome: 'Coco ralado', preco: 5.50, qtd: 100, un: 'g' },
    { id: 'mb', tipo: 'ing', nome: 'Massa de bolo (receita base)', preco: 8.50, qtd: 1, un: 'receita' },
    { id: 'fm', tipo: 'emb', nome: 'Forminhas nº 4 (pacote com 100)', preco: 7.00, qtd: 100, un: 'un' },
    { id: 'cx', tipo: 'emb', nome: 'Caixa para cento', preco: 9.00, qtd: 1, un: 'un' },
    { id: 'sq', tipo: 'emb', nome: 'Saquinho ou caixinha individual', preco: 0.90, qtd: 1, un: 'un' },
    { id: 'et', tipo: 'emb', nome: 'Etiqueta', preco: 0.30, qtd: 1, un: 'un' },
    { id: 'pt', tipo: 'emb', nome: 'Pote 250 ml com tampa', preco: 1.40, qtd: 1, un: 'un' },
    { id: 'cd', tipo: 'emb', nome: 'Colher descartável', preco: 0.15, qtd: 1, un: 'un' }
  ],
  doces: [
    {
      id: 'brig', nome: 'Brigadeiro tradicional', lote: 'cento', unNome: 'brigadeiro',
      receita: [{ insumo: 'lc', usado: 395 }, { insumo: 'mt', usado: 15 }, { insumo: 'cp', usado: 30 }, { insumo: 'gr', usado: 60 }],
      rendimento: 25, nReceitas: 4, unidades: 100, perdas: '',
      embalagem: [{ insumo: 'fm', qtd: 100 }, { insumo: 'cx', qtd: 1 }],
      bocaMin: 80, fornoMin: 0, aparelhos: [], limpezaReceitas: '',
      tarefas: [{ nome: 'Cozinhar', min: 80 }, { nome: 'Enrolar', min: 100 }, { nome: 'Embalar', min: 30 }, { nome: 'Limpar', min: 30 }],
      arred: 0.10, cobroHoje: 159, mercado: '', decisao: '', atualizado: '2026-11-01'
    },
    {
      id: 'brow', nome: 'Brownie de chocolate', lote: 'forma 20x30', unNome: 'pedaço',
      receita: [{ insumo: 'cma', usado: 200 }, { insumo: 'mt', usado: 150 }, { insumo: 'ac', usado: 250 }, { insumo: 'ov', usado: 4 }, { insumo: 'ft', usado: 100 }, { insumo: 'cc', usado: 30 }],
      rendimento: 15, nReceitas: 1, unidades: 15, perdas: '',
      embalagem: [{ insumo: 'sq', qtd: 15 }, { insumo: 'et', qtd: 15 }],
      bocaMin: 0, fornoMin: 50, aparelhos: [{ nome: 'Batedeira 400 W', watts: 400, min: 10 }], limpezaReceitas: '',
      tarefas: [{ nome: 'Preparo', min: 30 }, { nome: 'Cortar e embalar', min: 40 }, { nome: 'Limpar', min: 20 }],
      arred: 0.10, cobroHoje: '', mercado: '', decisao: '', atualizado: '2026-11-01'
    },
    {
      id: 'pote', nome: 'Doce no pote (chocolate e coco, 250 ml)', lote: 'lote de 10', unNome: 'pote',
      receita: [{ insumo: 'lc', usado: 592.5 }, { insumo: 'cl', usado: 300 }, { insumo: 'cp', usado: 30 }, { insumo: 'mt', usado: 15 }, { insumo: 'co', usado: 50 }, { insumo: 'mb', usado: 0.5 }],
      rendimento: 5, nReceitas: 2, unidades: 10, perdas: '',
      embalagem: [{ insumo: 'pt', qtd: 10 }, { insumo: 'cd', qtd: 10 }, { insumo: 'et', qtd: 10 }],
      bocaMin: 60, fornoMin: 45, aparelhos: [{ nome: 'Batedeira 400 W', watts: 400, min: 10 }], limpezaReceitas: '',
      tarefas: [{ nome: 'Bolo', min: 40 }, { nome: 'Cremes', min: 60 }, { nome: 'Montar', min: 50 }, { nome: 'Limpar', min: 30 }],
      arred: 0.50, cobroHoje: '', mercado: '', decisao: '', atualizado: '2026-11-01'
    }
  ],
  orcamentos: [
    {
      id: 'orc1', cliente: 'Mariana (exemplo)', whats: '', data: '2026-12-20', hora: '16:00', convidados: 100, bolo: true,
      tipo: 'entrega', endereco: 'Centro', km: 24, gasolina: 6.50, kmL: 10, entMin: 40,
      itens: [
        { doce: 'brig', qtd: 3, modo: 'lote', persMaterial: '', persMin: '' },
        { doce: 'brig', qtd: 1, modo: 'lote', persMaterial: 15, persMin: 60, obs: 'nas cores da festa' }
      ],
      sinalPct: 50, validade: '2026-12-01', incluso: 'Forminhas e caixas inclusas. Pagamento no Pix ou cartão. Sinal não reembolsável em cancelamento com menos de 7 dias.', status: 'enviado'
    }
  ],
  fechamentos: [
    {
      id: 'fec1', nome: 'Cento de brigadeiro (exemplo)', origem: 'doce', doce: 'brig', data: '2026-11-15',
      preco: 190, pagamento: 'Pix', taxaPct: 0, prev: [55.65, 16.00, 3.85, 60.00], horasPrev: 4,
      extraIng: 8, embReal: '', casaReal: '', horasReal: 5,
      mudou: 'Uma panela passou do ponto e a produção levou 5 horas.', ajuste: 'Se repetir, refazer a Ficha do Preço com 5 h.'
    }
  ],
  checks: {}, plano: {}
});
if (typeof module !== 'undefined') module.exports = SEED;
