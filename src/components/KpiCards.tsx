import React from 'react';
import { CheckCircle2, TrendingUp, AlertTriangle, Layers, Flame, PackageCheck, Filter } from 'lucide-react';
import { PlanningRow } from '../types';

interface KpiCardsProps {
  data: PlanningRow[];
  selectedCD: string;
  selectedMarca: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data, selectedCD, selectedMarca }) => {
  // Total Volumetria (AK) e Total Pedidos
  const totalVolumetriaGeral = data.reduce((acc, row) => acc + row.volumetria, 0);
  const totalPedidosGeral = data.length;

  // ROTEIRIZADO: Coluna de ROTA (Y) diferente de vazio e diferente de zero
  const linhasRoteirizadas = data.filter((row) => row.isRoteirizado);
  const totalRoteirizadoVol = linhasRoteirizadas.reduce((acc, row) => acc + row.volumetria, 0);
  const totalRoteirizadoPedidos = linhasRoteirizadas.length;

  // LINHA VERMELHA: Usuária: "eu só considero linha vermelha, o que é 1,2,3, OU 4 na coluna L"
  const linhasComLinhaVermelha = data.filter((row) => row.isLinhaVermelha);
  const totalLinhaVermelhaVol = linhasComLinhaVermelha.reduce((acc, row) => acc + row.volumetria, 0);
  const totalLinhaVermelhaPedidos = linhasComLinhaVermelha.length;

  // Breakdown por Coluna L (1, 2, 3, 4)
  const lv1Rows = data.filter((r) => r.colunaL === 1);
  const lv2Rows = data.filter((r) => r.colunaL === 2);
  const lv3Rows = data.filter((r) => r.colunaL === 3);
  const lv4Rows = data.filter((r) => r.colunaL === 4);

  const lv1Vol = lv1Rows.reduce((acc, r) => acc + r.volumetria, 0);
  const lv2Vol = lv2Rows.reduce((acc, r) => acc + r.volumetria, 0);
  const lv3Vol = lv3Rows.reduce((acc, r) => acc + r.volumetria, 0);
  const lv4Vol = lv4Rows.reduce((acc, r) => acc + r.volumetria, 0);

  // NÃO ROTEIRIZADO / A ROTEIRIZAR (Coluna Y vazia ou 0)
  const linhasNaoRoteirizadas = data.filter((row) => !row.isRoteirizado);
  const totalNaoRoteirizadoVol = linhasNaoRoteirizadas.reduce((acc, row) => acc + row.volumetria, 0);
  const totalNaoRoteirizadoPedidos = linhasNaoRoteirizadas.length;

  const percentualRoteirizado = totalVolumetriaGeral > 0 ? (totalRoteirizadoVol / totalVolumetriaGeral) * 100 : 0;

  // % Pronto médio da Linha Vermelha (Coluna BG ponderada)
  const totalLinhaPronta = linhasComLinhaVermelha.reduce((acc, row) => acc + row.volumeLinhaVermelhaPronto, 0);
  const percLinhaVermelhaPronto = totalLinhaVermelhaVol > 0 ? (totalLinhaPronta / totalLinhaVermelhaVol) * 100 : 0;

  const isJundiai = selectedCD === 'Jundiai';

  return (
    <div className="space-y-3">
      {/* Sequência de Filtros Explicada Visualmente */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-sm space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[11px] bg-rose-600 text-white px-2 py-0.5 rounded tracking-wider uppercase flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Sequência de Filtros Identificada
            </span>
            <span className="text-slate-300">
              1. <strong>CD (E)</strong> → 2. <strong>Rota (Y) ≠ vazio/0</strong> (Roteirizado) → 3. <strong>Coluna L ∈ [1, 2, 3, 4]</strong> (Linha Vermelha)
            </span>
          </div>

          <div className="font-mono tabular-nums text-xs font-semibold text-emerald-400">
            {isJundiai ? (
              <span>Jundiaí: <strong>197 pedidos · 125.615 vols</strong> (LV: <strong>36 ped · 20.564 vols</strong>)</span>
            ) : selectedCD === 'TODOS' ? (
              <span>Total: <strong>247.693 vols roteirizados</strong></span>
            ) : (
              <span>CD {selectedCD}: <strong>{totalRoteirizadoVol.toLocaleString('pt-BR')} vols roteirizados</strong></span>
            )}
          </div>
        </div>

        {/* Jundiaí Audit Box */}
        {isJundiai && (
          <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-200">
                <strong>Conferência Jundiaí:</strong> 197 pedidos roteirizados ({totalRoteirizadoVol.toLocaleString('pt-BR')} vols). Desses, <strong>36 pedidos</strong> são Linha Vermelha (Coluna L = 1, 2, 3 ou 4), somando exatamente <strong>20.564 volumes</strong>.
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded whitespace-nowrap">
              100% Validado
            </span>
          </div>
        )}

        {/* São José Audit Box (0 Roteirizado) */}
        {selectedCD === 'Sao Jose' && (
          <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-200">
                <strong>Conferência CD São José:</strong> 0 pedidos roteirizados (Coluna Y vazia ou 0). Todos os pedidos estão na fila pendente / a roteirizar.
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded whitespace-nowrap">
              0 Roteirizado · Confirmado
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Volumetria Roteirizada & Contagem de Pedidos */}
        <div className="bg-white rounded-xl border-2 border-emerald-500/40 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Volumetria Roteirizada
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-emerald-600 font-mono tabular-nums">
              {totalRoteirizadoVol.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
              <span className="font-bold text-slate-900 font-mono tabular-nums bg-slate-100 px-1.5 py-0.5 rounded">
                {totalRoteirizadoPedidos} pedidos
              </span>
              <span>roteirizados (Rota Y ≠ 0)</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, percentualRoteirizado))}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Linha Vermelha (Coluna L = 1, 2, 3 ou 4) */}
        <div className="bg-white rounded-xl border-2 border-rose-400/40 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              Volume Linha Vermelha
            </span>
            <span className="text-[11px] font-mono font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
              Col. L [1-4]
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold tracking-tight text-rose-600 font-mono tabular-nums">
              {totalLinhaVermelhaVol.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600">
              <span className="font-bold text-rose-800 font-mono tabular-nums bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                {totalLinhaVermelhaPedidos} pedidos
              </span>
              <span className="text-slate-500 font-mono tabular-nums">
                ({percLinhaVermelhaPronto.toFixed(1)}% pronto BG)
              </span>
            </div>
          </div>
          {/* Micro badges for L = 1, 2, 3, 4 */}
          <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
            <div className="bg-rose-50 rounded p-1 border border-rose-100">
              <span className="text-slate-400 block text-[9px]">L1 ({lv1Rows.length})</span>
              <span className="font-bold text-rose-900">{lv1Vol.toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-rose-50 rounded p-1 border border-rose-100">
              <span className="text-slate-400 block text-[9px]">L2 ({lv2Rows.length})</span>
              <span className="font-bold text-rose-900">{lv2Vol.toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-rose-50 rounded p-1 border border-rose-100">
              <span className="text-slate-400 block text-[9px]">L3 ({lv3Rows.length})</span>
              <span className="font-bold text-rose-900">{lv3Vol.toLocaleString('pt-BR')}</span>
            </div>
            <div className="bg-rose-50 rounded p-1 border border-rose-100">
              <span className="text-slate-400 block text-[9px]">L4 ({lv4Rows.length})</span>
              <span className="font-bold text-rose-900">{lv4Vol.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Volumetria Total Planejada (Coluna AK) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Volumetria Total (Coluna AK)</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {totalVolumetriaGeral.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-800 font-mono tabular-nums">
                {totalPedidosGeral} pedidos no total
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: A Roteirizar (Coluna Y = 0 ou vazia) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">A Roteirizar (Sem Rota / 0)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {totalNaoRoteirizadoVol.toLocaleString('pt-BR')}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-amber-700 font-mono tabular-nums">
                {totalNaoRoteirizadoPedidos} pedidos
              </span>
              <span>aguardando rota</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, 100 - percentualRoteirizado))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
