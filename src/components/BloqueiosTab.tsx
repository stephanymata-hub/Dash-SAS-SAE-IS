import React, { useState } from 'react';
import { ShieldAlert, Filter, AlertOctagon, TrendingDown, Building, PieChart } from 'lucide-react';
import { BloqueioMeta, BloqueioFunil } from '../types';

interface BloqueiosTabProps {
  metaData: BloqueioMeta[];
  funilData: BloqueioFunil[];
}

export const BloqueiosTab: React.FC<BloqueiosTabProps> = ({ metaData, funilData }) => {
  const [selectedMarca, setSelectedMarca] = useState<string>('TODAS');
  const [selectedCD, setSelectedCD] = useState<string>('TODOS');

  // Filtered meta data
  const filteredMeta = metaData.filter((m) => {
    const matchMarca = selectedMarca === 'TODAS' || m.marca === selectedMarca;
    const matchCD = selectedCD === 'TODOS' || m.origem === selectedCD;
    return matchMarca && matchCD;
  });

  // Filtered funil data
  const filteredFunil = funilData.filter((f) => {
    const matchMarca = selectedMarca === 'TODAS' || f.marca === selectedMarca;
    const matchCD = selectedCD === 'TODOS' || f.origem === selectedCD;
    return matchMarca && matchCD;
  });

  const totalBloqueiosMeta = filteredMeta.reduce((acc, m) => acc + m.volume, 0);
  const totalBloqueiosFunil = filteredFunil.reduce((acc, f) => acc + f.volume, 0);

  // Group funil by reason (observacao)
  const funilByReasonMap = new Map<string, number>();
  filteredFunil.forEach((f) => {
    funilByReasonMap.set(f.observacao, (funilByReasonMap.get(f.observacao) || 0) + f.volume);
  });

  const reasonsSorted = Array.from(funilByReasonMap.entries())
    .map(([motivo, vol]) => ({ motivo, vol }))
    .sort((a, b) => b.vol - a.vol);

  // Group meta by CD
  const cdMetaMap = new Map<string, number>();
  filteredMeta.forEach((m) => {
    cdMetaMap.set(m.origem, (cdMetaMap.get(m.origem) || 0) + m.volume);
  });

  // Group meta by Marca
  const marcaMetaMap = new Map<string, number>();
  filteredMeta.forEach((m) => {
    marcaMetaMap.set(m.marca, (marcaMetaMap.get(m.marca) || 0) + m.volume);
  });

  return (
    <div className="space-y-6">
      {/* Context banner explaining this tab matches their uploaded sheet */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950">
              Dados Extraídos da Planilha Anexa (Aba Bloqueios)
            </h4>
            <div className="text-xs text-amber-800">
              Arquivo: <code className="font-mono text-[11px] bg-amber-100/60 px-1 py-0.5 rounded">SAE_e_IS_-_V1</code> · Total de Bloqueios registrados: 314.223 volumes
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedMarca}
            onChange={(e) => setSelectedMarca(e.target.value)}
            className="text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-slate-800"
          >
            <option value="TODAS">Todas as Marcas</option>
            <option value="SAS">SAS</option>
            <option value="SAE">SAE</option>
            <option value="IS">IS</option>
          </select>
          <select
            value={selectedCD}
            onChange={(e) => setSelectedCD(e.target.value)}
            className="text-xs bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-slate-800"
          >
            <option value="TODOS">Todos os CDs</option>
            <option value="Jundiai">Jundiaí</option>
            <option value="Itaitinga">Itaitinga</option>
            <option value="Sao Jose">São José</option>
          </select>
        </div>
      </div>

      {/* KPI Cards for Bloqueios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Volume Bloqueios - Meta</span>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums mt-2">
            {totalBloqueiosMeta.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Demanda total com bloqueios ativos
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Volume Bloqueios - Funil</span>
          <div className="text-2xl font-bold tracking-tight text-rose-600 font-mono tabular-nums mt-2">
            {totalBloqueiosFunil.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Volumes rastreados no funil de pendências
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Maior Motivo de Bloqueio</span>
          <div className="text-lg font-bold tracking-tight text-slate-900 truncate mt-2">
            {reasonsSorted[0]?.motivo || 'Nenhum'}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            {reasonsSorted[0]?.vol.toLocaleString('pt-BR')} volumes afetados
          </div>
        </div>
      </div>

      {/* Breakdown by Motivo do Funil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Reasons of Bloqueio */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Motivos de Bloqueio no Funil
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {reasonsSorted.length} categorias
            </span>
          </div>

          <div className="space-y-3">
            {reasonsSorted.map(({ motivo, vol }) => {
              const perc = totalBloqueiosFunil > 0 ? (vol / totalBloqueiosFunil) * 100 : 0;
              return (
                <div key={motivo} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[240px]">
                      {motivo}
                    </span>
                    <div className="flex items-center gap-2 font-mono tabular-nums text-slate-900 font-semibold">
                      <span>{vol.toLocaleString('pt-BR')}</span>
                      <span className="text-slate-400 font-normal">({perc.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        motivo.includes('Erro')
                          ? 'bg-rose-600'
                          : motivo.includes('Escola')
                          ? 'bg-amber-500'
                          : motivo.includes('Bloqueada')
                          ? 'bg-indigo-600'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bloqueios por CD & Marca */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Bloqueios por CD e Marca
          </h3>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-700">Por Centro de Distribuição:</div>
            {Array.from(cdMetaMap.entries()).map(([cd, vol]) => (
              <div key={cd} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                <span className="font-medium text-slate-800">
                  CD {cd === 'Jundiai' ? 'Jundiaí' : cd === 'Sao Jose' ? 'São José' : cd}
                </span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {vol.toLocaleString('pt-BR')} vols
                </span>
              </div>
            ))}

            <div className="text-xs font-semibold text-slate-700 pt-2">Por Marca:</div>
            {Array.from(marcaMetaMap.entries()).map(([marca, vol]) => (
              <div key={marca} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      marca === 'SAS' ? 'bg-blue-600' : marca === 'SAE' ? 'bg-purple-600' : 'bg-emerald-600'
                    }`}
                  />
                  <span className="font-medium text-slate-800">{marca}</span>
                </div>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {vol.toLocaleString('pt-BR')} vols
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
