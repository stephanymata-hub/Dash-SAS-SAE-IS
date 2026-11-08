import React, { useState } from 'react';
import { Route, Layers, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { PlanningRow } from '../types';

interface RouteLinhaVermelhaVisualizerProps {
  data: PlanningRow[];
  selectedMarca: string;
  selectedCD: string;
}

interface RouteAggregate {
  rota: string;
  totalVolumetria: number;
  totalRoteirizado: number;
  linhaVermelhaVol: number;
  totalPendente: number;
  percentualPonderado: number;
  linhasCount: number;
  cds: string[];
  marcas: string[];
  lvFases: number[];
  detalhes: PlanningRow[];
}

export const RouteLinhaVermelhaVisualizer: React.FC<RouteLinhaVermelhaVisualizerProps> = ({
  data,
  selectedMarca,
  selectedCD
}) => {
  const [sortBy, setSortBy] = useState<'rota' | 'volumetria' | 'percentual_desc' | 'percentual_asc'>('rota');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  // Group by Route (Coluna Y)
  const routeMap = new Map<string, PlanningRow[]>();
  data.forEach((row) => {
    const list = routeMap.get(row.rota) || [];
    list.push(row);
    routeMap.set(row.rota, list);
  });

  const routeAggregates: RouteAggregate[] = Array.from(routeMap.entries()).map(([rota, rows]) => {
    const totalVolumetria = rows.reduce((acc, r) => acc + r.volumetria, 0);
    const lvRows = rows.filter((r) => r.isLinhaVermelha);
    const linhaVermelhaVol = lvRows.reduce((acc, r) => acc + r.volumetria, 0);
    const totalLinhaPronta = rows.reduce((acc, r) => acc + r.volumeLinhaVermelhaPronto, 0);
    const totalPendente = Math.max(0, totalVolumetria - totalLinhaPronta);
    const percentualPonderado = linhaVermelhaVol > 0 ? (totalLinhaPronta / linhaVermelhaVol) * 100 : 0;
    const cds = Array.from(new Set(rows.map((r) => r.cd)));
    const marcas = Array.from(new Set(rows.map((r) => r.marca)));
    const lvFases = Array.from(new Set(lvRows.map((r) => r.colunaL).filter((l): l is number => l !== null))).sort();

    return {
      rota,
      totalVolumetria,
      totalRoteirizado: totalVolumetria,
      linhaVermelhaVol,
      totalPendente,
      percentualPonderado,
      linhasCount: rows.length,
      cds,
      marcas,
      lvFases,
      detalhes: rows
    };
  });

  // Sort routes
  const sortedRoutes = [...routeAggregates].sort((a, b) => {
    if (sortBy === 'volumetria') return b.totalVolumetria - a.totalVolumetria;
    if (sortBy === 'percentual_desc') return b.percentualPonderado - a.percentualPonderado;
    if (sortBy === 'percentual_asc') return a.percentualPonderado - b.percentualPonderado;
    // Natural order: extract numbers if present
    const numA = parseInt(a.rota.replace(/\D/g, '') || '0', 10);
    const numB = parseInt(b.rota.replace(/\D/g, '') || '0', 10);
    return numA - numB;
  });

  const getLinhaVermelhaBadge = (perc: number) => {
    if (perc >= 100) {
      return {
        label: '100% Pronto · Linha Vermelha Concluída',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        bar: 'bg-emerald-500'
      };
    }
    if (perc >= 70) {
      return {
        label: `${perc.toFixed(0)}% Pronto · Linha Vermelha Avançada`,
        bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        bar: 'bg-indigo-600'
      };
    }
    if (perc >= 30) {
      return {
        label: `${perc.toFixed(0)}% Pronto · Em Roteirização`,
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        bar: 'bg-amber-500'
      };
    }
    return {
      label: `${perc.toFixed(0)}% Pronto · Linha Vermelha Pendente`,
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      bar: 'bg-rose-500'
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
            Acompanhamento Visual de Linha Vermelha por Rota
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Coluna Rota Y</span>
            <span aria-hidden="true">·</span>
            <span>Coluna Volumetria AK</span>
            <span aria-hidden="true">·</span>
            <span>Coluna % Pronto / Linha Vermelha BG</span>
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="rota">Sequência da Rota (Rota 1, 2, 3...)</option>
            <option value="volumetria">Maior Volumetria (AK)</option>
            <option value="percentual_desc">Maior % Linha Vermelha (BG)</option>
            <option value="percentual_asc">Menor % Linha Vermelha (Mais Pendente)</option>
          </select>
        </div>
      </div>

      {/* Grid of Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sortedRoutes.map((routeItem) => {
          const badge = getLinhaVermelhaBadge(routeItem.percentualPonderado);
          const isExpanded = expandedRoute === routeItem.rota;

          return (
            <div
              key={routeItem.rota}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Route Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                    {routeItem.rota.replace(/Rota\s*/i, 'R')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {routeItem.rota}
                      </h3>
                      {routeItem.lvFases.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {routeItem.lvFases.map((fase) => (
                            <span key={fase} className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              LV {fase} (Col L)
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Sem LV</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span>CDs: {routeItem.cds.join(', ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>Marcas: {routeItem.marcas.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Volumetria Total</div>
                  <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    {routeItem.totalVolumetria.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Linha Vermelha Visual Meter - HIGH IMPACT REQUIREMENT */}
              <div className="mt-5 p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    Linha Vermelha (Coluna L ∈ {'{1, 2, 3, 4}'} · % Pronto Coluna BG)
                  </span>
                  <span className="font-bold font-mono tabular-nums text-slate-900 text-sm">
                    {routeItem.percentualPonderado.toFixed(1)}%
                  </span>
                </div>

                {/* Main Progress Track */}
                <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${badge.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, routeItem.percentualPonderado))}%` }}
                  />
                </div>

                {/* Volumetric details under meter */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono tabular-nums">
                  <div className="flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Vol. com Linha Vermelha: {routeItem.linhaVermelhaVol.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pronto: {routeItem.totalRoteirizado.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${badge.bg}`}>
                  {badge.label}
                </span>

                <button
                  onClick={() => setExpandedRoute(isExpanded ? null : routeItem.rota)}
                  className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium py-1 px-2 rounded hover:bg-slate-100 transition-colors"
                >
                  <span>{isExpanded ? 'Recolher detalhes' : `Ver ${routeItem.linhasCount} linhas`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Collapsible Details Table */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Detalhamento por CD e Marca nesta rota:
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100">
                          <th className="py-1 font-medium">CD (E)</th>
                          <th className="py-1 font-medium">Marca (F)</th>
                          <th className="py-1 font-medium">Linha Vermelha (L)</th>
                          <th className="py-1 font-medium text-right">Volume (AK)</th>
                          <th className="py-1 font-medium text-right">% Pronto (BG)</th>
                          <th className="py-1 font-medium text-right">Vol Pronto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                        {routeItem.detalhes.map((d) => (
                          <tr key={d.id} className="hover:bg-slate-50">
                            <td className="py-1.5 font-sans font-medium text-slate-800">
                              {d.cd === 'Jundiai' ? 'Jundiaí' : d.cd === 'Sao Jose' ? 'São José' : d.cd}
                            </td>
                            <td className="py-1.5 font-sans">
                              <span className={`font-semibold ${
                                d.marca === 'SAS' ? 'text-blue-600' : d.marca === 'SAE' ? 'text-purple-600' : 'text-emerald-600'
                              }`}>
                                {d.marca}
                              </span>
                            </td>
                            <td className="py-1.5 font-sans">
                              {d.colunaL ? (
                                <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  L = {d.colunaL}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Sem LV</span>
                              )}
                            </td>
                            <td className="py-1.5 text-right text-slate-700">{d.volumetria.toLocaleString('pt-BR')}</td>
                            <td className="py-1.5 text-right">
                              <span className={`font-semibold ${
                                d.percentualLinhaVermelha >= 100 
                                  ? 'text-emerald-600' 
                                  : d.percentualLinhaVermelha >= 70 
                                    ? 'text-indigo-600' 
                                    : d.percentualLinhaVermelha >= 30 
                                      ? 'text-amber-600' 
                                      : 'text-rose-600'
                              }`}>
                                {d.percentualLinhaVermelha}%
                              </span>
                            </td>
                            <td className="py-1.5 text-right font-semibold text-emerald-600">
                              {d.volumeLinhaVermelhaPronto.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sortedRoutes.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Route className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            {selectedCD === 'Sao Jose' ? 'CD São José: 0 rotas roteirizadas' : 'Nenhuma rota encontrada'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {selectedCD === 'Sao Jose'
              ? 'Conferido: no CD São José nada está roteirizado (Coluna Y vazia ou 0). Todos os pedidos encontram-se na fila a roteirizar.'
              : 'Tente ajustar os filtros de Marca ou Centro de Distribuição acima.'}
          </p>
        </div>
      )}
    </div>
  );
};
