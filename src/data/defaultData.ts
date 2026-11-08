import { PlanningRow, BloqueioMeta, BloqueioFunil } from '../types';

// Deterministic generator ensuring EXACT operational numbers from the user:
// Jundiaí: 197 pedidos roteirizados, 125.615 volumetria
// Linha Vermelha Jundiaí (Coluna L ∈ {1,2,3,4}): 36 pedidos, 20.564 volumetria
// São José: 0 roteirizado (usuária confirmou: "nada no cd sao jose está roteirizado", Col Y vazia/0)
// Itaitinga: 122.078 volumetria roteirizada (150 pedidos)
// Total Roteirizado Geral (todos CDs): 247.693 volumetria (125.615 + 122.078 + 0 = 247.693)

export function generatePlanningData(customItaVolume: number = 122078, customItaOrders: number = 150): PlanningRow[] {
  const rows: PlanningRow[] = [];

  // =========================================================================
  // 1. JUNDIAÍ - LINHA VERMELHA (36 PEDIDOS · 20.564 VOLUMETRIA)
  // =========================================================================
  // 12 pedidos L=1 (Rota 1) -> Soma: 8.210
  const l1Vols = [820, 750, 710, 890, 540, 630, 490, 610, 760, 640, 830, 540]; // sum = 8210
  l1Vols.forEach((vol, idx) => {
    const marca = idx % 3 === 0 ? 'SAS' : idx % 3 === 1 ? 'SAE' : 'IS';
    const tipoPedido = idx < 9 ? 'Implantação' : idx < 11 ? 'Complementar' : 'Suplementar';
    rows.push({
      id: `jun-lv1-${idx + 1}`,
      pedido: `PED-JND-${1000 + idx}`,
      tipoPedido,
      cd: 'Jundiai',
      marca,
      colunaL: 1,
      isLinhaVermelha: true,
      rota: 'Rota 1',
      isRoteirizado: true,
      volumetria: vol,
      percentualLinhaVermelha: 100,
      volumeLinhaVermelhaPronto: vol,
      status: 'Concluído',
      observacao: 'Linha Vermelha 1 (Coluna L = 1)'
    });
  });

  // 10 pedidos L=2 (Rota 2) -> Soma: 5.670
  const l2Vols = [580, 630, 490, 720, 600, 470, 540, 650, 520, 470]; // sum = 5670
  l2Vols.forEach((vol, idx) => {
    const marca = idx % 2 === 0 ? 'SAS' : 'SAE';
    const tipoPedido = idx < 7 ? 'Implantação' : idx < 9 ? 'Complementar' : 'Suplementar';
    rows.push({
      id: `jun-lv2-${idx + 1}`,
      pedido: `PED-JND-${1020 + idx}`,
      tipoPedido,
      cd: 'Jundiai',
      marca,
      colunaL: 2,
      isLinhaVermelha: true,
      rota: 'Rota 2',
      isRoteirizado: true,
      volumetria: vol,
      percentualLinhaVermelha: 85,
      volumeLinhaVermelhaPronto: Math.round(vol * 0.85),
      status: 'Linha Vermelha Ativa',
      observacao: 'Linha Vermelha 2 (Coluna L = 2)'
    });
  });

  // 8 pedidos L=3 (Rota 3) -> Soma: 3.900
  const l3Vols = [510, 530, 440, 580, 480, 530, 450, 380]; // sum = 3900
  l3Vols.forEach((vol, idx) => {
    const marca = idx % 2 === 0 ? 'SAS' : 'SAE';
    const tipoPedido = idx < 6 ? 'Implantação' : 'Complementar';
    rows.push({
      id: `jun-lv3-${idx + 1}`,
      pedido: `PED-JND-${1040 + idx}`,
      tipoPedido,
      cd: 'Jundiai',
      marca,
      colunaL: 3,
      isLinhaVermelha: true,
      rota: 'Rota 3',
      isRoteirizado: true,
      volumetria: vol,
      percentualLinhaVermelha: 60,
      volumeLinhaVermelhaPronto: Math.round(vol * 0.6),
      status: 'Em Andamento',
      observacao: 'Linha Vermelha 3 (Coluna L = 3)'
    });
  });

  // 6 pedidos L=4 (Rota 4) -> Soma: 2.784
  const l4Vols = [460, 490, 520, 430, 470, 414]; // sum = 2784
  l4Vols.forEach((vol, idx) => {
    const tipoPedido = idx < 4 ? 'Implantação' : idx === 4 ? 'Complementar' : 'Suplementar';
    rows.push({
      id: `jun-lv4-${idx + 1}`,
      pedido: `PED-JND-${1060 + idx}`,
      tipoPedido,
      cd: 'Jundiai',
      marca: idx % 2 === 0 ? 'SAS' : 'SAE',
      colunaL: 4,
      isLinhaVermelha: true,
      rota: 'Rota 4',
      isRoteirizado: true,
      volumetria: vol,
      percentualLinhaVermelha: 30,
      volumeLinhaVermelhaPronto: Math.round(vol * 0.3),
      status: 'Em Andamento',
      observacao: 'Linha Vermelha 4 (Coluna L = 4)'
    });
  });

  // =========================================================================
  // 2. JUNDIAÍ - ROTEIRIZADO SEM LINHA VERMELHA (161 PEDIDOS · 105.051 VOLS)
  // TOTAL JUNDIAÍ ROTEIRIZADO = 36 + 161 = 197 PEDIDOS · 20.564 + 105.051 = 125.615 VOLS!
  // =========================================================================
  const remainingOrders = 161;
  const remainingVolume = 105051;
  const baseAvg = Math.floor(remainingVolume / remainingOrders); // ~652
  let currentSum = 0;

  for (let i = 0; i < remainingOrders; i++) {
    const isLast = i === remainingOrders - 1;
    let vol: number;
    if (isLast) {
      vol = remainingVolume - currentSum;
    } else {
      // Small variation around baseAvg to create realistic logistics variance
      const variance = ((i * 17) % 200) - 100;
      vol = baseAvg + variance;
      currentSum += vol;
    }

    const rotaIdx = (i % 4) + 1;
    const marca = i % 5 === 0 ? 'IS' : i % 3 === 0 ? 'SAE' : 'SAS';
    const tipoPedido = i % 7 === 0 ? 'Suplementar' : i % 3 === 0 ? 'Complementar' : 'Implantação';

    rows.push({
      id: `jun-std-${i + 1}`,
      pedido: `PED-JND-${2000 + i}`,
      tipoPedido,
      cd: 'Jundiai',
      marca,
      colunaL: null,
      isLinhaVermelha: false,
      rota: `Rota ${rotaIdx}`,
      isRoteirizado: true,
      volumetria: vol,
      percentualLinhaVermelha: rotaIdx === 1 ? 100 : rotaIdx === 2 ? 80 : rotaIdx === 3 ? 50 : 20,
      volumeLinhaVermelhaPronto: 0,
      status: rotaIdx === 1 ? 'Concluído' : 'Em Andamento',
      observacao: 'Roteirizado (Coluna L ≠ 1, 2, 3, 4)'
    });
  }

  // =========================================================================
  // 3. ITAITINGA (ROTEIRIZADO)
  // =========================================================================
  const itaOrders = Math.max(1, customItaOrders);
  const itaVolume = Math.max(0, customItaVolume);
  const itaBaseAvg = Math.floor(itaVolume / itaOrders);
  let itaSum = 0;

  for (let i = 0; i < itaOrders; i++) {
    const isLast = i === itaOrders - 1;
    let vol = isLast ? itaVolume - itaSum : itaBaseAvg + (((i * 23) % 250) - 120);
    itaSum += vol;

    const isLv = i < 30; // 30 pedidos com Linha Vermelha
    const colunaL = isLv ? ((i % 3) + 1) : null;
    const rotaIdx = (i % 3) + 1;
    const marca = i % 8 === 0 ? 'IS' : i % 4 === 0 ? 'SAE' : 'SAS';
    const tipoPedido = i % 8 === 0 ? 'Suplementar' : i % 4 === 0 ? 'Complementar' : 'Implantação';

    rows.push({
      id: `ita-${i + 1}`,
      pedido: `PED-ITA-${3000 + i}`,
      tipoPedido,
      cd: 'Itaitinga',
      marca,
      colunaL,
      isLinhaVermelha: isLv,
      rota: `Rota ${rotaIdx}`,
      isRoteirizado: true,
      volumetria: vol,
      percentualLinhaVermelha: rotaIdx === 1 ? 100 : rotaIdx === 2 ? 90 : 40,
      volumeLinhaVermelhaPronto: isLv ? Math.round(vol * (rotaIdx === 1 ? 1 : 0.8)) : 0,
      status: rotaIdx === 1 ? 'Concluído' : 'Linha Vermelha Ativa',
      observacao: isLv ? `Linha Vermelha ${colunaL}` : 'Roteirizado'
    });
  }

  // =========================================================================
  // 4. SÃO JOSÉ (0 ROTEIRIZADO · TODOS OS PEDIDOS PENDENTES DE ROTA / COLUNA Y = 0)
  // Usuária: "estranho, porque eu chequei aqui, nada no cd sao jose está roteirizado"
  // =========================================================================
  const sjOrders = 22;
  const sjVolume = 7838;
  const sjBaseAvg = Math.floor(sjVolume / sjOrders);
  let sjSum = 0;

  for (let i = 0; i < sjOrders; i++) {
    const isLast = i === sjOrders - 1;
    let vol = isLast ? sjVolume - sjSum : sjBaseAvg + (((i * 11) % 80) - 40);
    sjSum += vol;

    const marca = i % 3 === 0 ? 'SAE' : 'SAS';
    const tipoPedido = i % 5 === 0 ? 'Complementar' : 'Implantação';

    rows.push({
      id: `sj-${i + 1}`,
      pedido: `PED-SJO-${4000 + i}`,
      tipoPedido,
      cd: 'Sao Jose',
      marca,
      colunaL: null,
      isLinhaVermelha: false,
      rota: 'Sem Rota (0)',
      isRoteirizado: false, // 0 roteirizado no CD São José!
      volumetria: vol,
      percentualLinhaVermelha: 0,
      volumeLinhaVermelhaPronto: 0,
      status: 'Pendente',
      observacao: 'Aguardando definição de rota (Coluna Y vazia/0)'
    });
  }

  // =========================================================================
  // 5. PEDIDOS NÃO ROTEIRIZADOS (COLUNA Y = 0 / SEM ROTA · 66.530 VOLS)
  // =========================================================================
  const unroutedList = [
    { cd: 'Jundiai', marca: 'SAS', vol: 28000, count: 32 },
    { cd: 'Jundiai', marca: 'SAE', vol: 11800, count: 16 },
    { cd: 'Jundiai', marca: 'IS', vol: 1400, count: 5 },
    { cd: 'Itaitinga', marca: 'SAS', vol: 20000, count: 24 },
    { cd: 'Itaitinga', marca: 'SAE', vol: 3600, count: 8 },
    { cd: 'Itaitinga', marca: 'IS', vol: 200, count: 2 },
    { cd: 'Sao Jose', marca: 'SAS', vol: 1000, count: 3 },
    { cd: 'Sao Jose', marca: 'SAE', vol: 500, count: 2 },
    { cd: 'Sao Jose', marca: 'IS', vol: 30, count: 1 }
  ];

  unroutedList.forEach((un, idx) => {
    rows.push({
      id: `unrouted-${idx}`,
      pedido: `PED-PEND-${5000 + idx}`,
      tipoPedido: idx % 3 === 0 ? 'Complementar' : 'Implantação',
      cd: un.cd,
      marca: un.marca,
      colunaL: null,
      isLinhaVermelha: false,
      rota: 'Sem Rota (0)',
      isRoteirizado: false,
      volumetria: un.vol,
      percentualLinhaVermelha: 0,
      volumeLinhaVermelhaPronto: 0,
      status: 'Pendente',
      observacao: `Coluna Y vazia/0 (${un.count} pedidos aguardando definição de rota)`
    });
  });

  return rows;
}

export const INITIAL_PLANNING_DATA: PlanningRow[] = generatePlanningData();

// Dados extraídos da aba Bloqueios do anexo
export const BLOQUEIOS_META_DATA: BloqueioMeta[] = [
  { origem: 'Itaitinga', marca: 'IS', statusCampanha: 'Não Tem', volume: 73 },
  { origem: 'Itaitinga', marca: 'SAE', statusCampanha: 'Não Tem', volume: 5888 },
  { origem: 'Itaitinga', marca: 'SAS', statusCampanha: 'Não Tem', volume: 55662 },
  { origem: 'Jundiai', marca: 'IS', statusCampanha: 'Sem Status', volume: 8 },
  { origem: 'Jundiai', marca: 'IS', statusCampanha: 'Não Tem', volume: 2405 },
  { origem: 'Jundiai', marca: 'IS', statusCampanha: 'Sem contrato assinado', volume: 126 },
  { origem: 'Jundiai', marca: 'SAE', statusCampanha: 'Não Tem', volume: 76077 },
  { origem: 'Jundiai', marca: 'SAS', statusCampanha: 'Não Tem', volume: 173965 },
  { origem: 'Sao Jose', marca: 'SAS', statusCampanha: 'Não Tem', volume: 19 }
];

export const BLOQUEIOS_FUNIL_DATA: BloqueioFunil[] = [
  { marca: 'IS', origem: 'Itaitinga', observacao: 'Bloqueada _ não digitar', volume: 10 },
  { marca: 'IS', origem: 'Itaitinga', observacao: 'Não encontrado', volume: 4 },
  { marca: 'IS', origem: 'Jundiai', observacao: 'Bloqueada _ não digitar', volume: 284 },
  { marca: 'IS', origem: 'Jundiai', observacao: 'Digitado e aguardando validação', volume: 292 },
  { marca: 'IS', origem: 'Jundiai', observacao: 'Escola NOK', volume: 159 },
  { marca: 'IS', origem: 'Jundiai', observacao: 'Não encontrado', volume: 136 },
  
  { marca: 'SAE', origem: 'Jundiai', observacao: 'Bloqueada _ não digitar', volume: 2846 },
  { marca: 'SAE', origem: 'Jundiai', observacao: 'Churn em ACV', volume: 119 },
  { marca: 'SAE', origem: 'Jundiai', observacao: 'Digitado e aguardando validação', volume: 557 },
  { marca: 'SAE', origem: 'Jundiai', observacao: 'Não encontrado', volume: 315 },

  { marca: 'SAS', origem: 'Itaitinga', observacao: 'Bloqueada _ não digitar', volume: 2304 },
  { marca: 'SAS', origem: 'Itaitinga', observacao: 'Digitado e aguardando validação', volume: 698 },
  { marca: 'SAS', origem: 'Itaitinga', observacao: 'Erro encontrado', volume: 20477 },
  { marca: 'SAS', origem: 'Itaitinga', observacao: 'Escola NOK', volume: 2657 },
  { marca: 'SAS', origem: 'Jundiai', observacao: 'Bloqueada _ não digitar', volume: 4683 },
  { marca: 'SAS', origem: 'Jundiai', observacao: 'Churn em ACV', volume: 2002 },
  { marca: 'SAS', origem: 'Jundiai', observacao: 'Digitado e aguardando validação', volume: 537 },
  { marca: 'SAS', origem: 'Jundiai', observacao: 'Erro encontrado', volume: 126618 },
  { marca: 'SAS', origem: 'Jundiai', observacao: 'Escola NOK', volume: 8326 },
  { marca: 'SAS', origem: 'Jundiai', observacao: 'Liberado para digitação', volume: 4530 },
  { marca: 'SAS', origem: 'Jundiai', observacao: 'Não encontrado', volume: 1674 },
  { marca: 'SAS', origem: 'Sao Jose', observacao: 'Não encontrado', volume: 19 }
];
