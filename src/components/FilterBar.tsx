import React from 'react';
import { Filter, Search, X, CheckCircle2 } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableCDs: string[];
  availableMarcas: string[];
  availableRotas: string[];
  availableTipos: string[];
  onResetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  availableCDs,
  availableMarcas,
  availableRotas,
  availableTipos,
  onResetFilters,
  filteredCount,
  totalCount
}) => {
  const isFiltered =
    filters.cd !== 'TODOS' ||
    filters.marca !== 'TODAS' ||
    filters.rota !== 'TODAS' ||
    filters.tipoPedido !== 'TODOS' ||
    filters.colunaL !== 'TODOS' ||
    filters.statusLinha !== 'TODOS' ||
    filters.apenasRoteirizados !== false ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
      {/* Row 1: Brand (Marca) & CD Selectors as Segmented Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Marca Selector - User requirement: "visualizar total e por marca, com um filtro" */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Filtro de Marca (Coluna F)
          </label>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg flex-wrap">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, marca: 'TODAS' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filters.marca === 'TODAS'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visão Total (Todas)
            </button>
            {availableMarcas.map((marca) => (
              <button
                key={marca}
                onClick={() => setFilters((prev) => ({ ...prev, marca }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  filters.marca === marca
                    ? 'bg-rose-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {marca}
              </button>
            ))}
          </div>
        </div>

        {/* CD Selector - Origem (Coluna E) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Centro de Distribuição (Coluna E)
          </label>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg flex-wrap">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, cd: 'TODOS' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                filters.cd === 'TODOS'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos os CDs
            </button>
            {availableCDs.map((cd) => (
              <button
                key={cd}
                onClick={() => setFilters((prev) => ({ ...prev, cd }))}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  filters.cd === cd
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cd === 'Jundiai'
                  ? 'Jundiaí (125.615)'
                  : cd === 'Itaitinga'
                  ? 'Itaitinga (122.078)'
                  : cd === 'Sao Jose'
                  ? 'São José (0 roteirizado)'
                  : cd}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Filters & Roteirizado Toggle & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Toggle Roteirizados vs Todos */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, apenasRoteirizados: !prev.apenasRoteirizados }))}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              filters.apenasRoteirizados
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${filters.apenasRoteirizados ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Apenas Roteirizados (Coluna Y ≠ 0)</span>
          </button>

          {/* Tipo de Pedido Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 whitespace-nowrap">Tipo de Pedido:</span>
            <select
              value={filters.tipoPedido}
              onChange={(e) => setFilters((prev) => ({ ...prev, tipoPedido: e.target.value }))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
            >
              <option value="TODOS">Todos os Tipos</option>
              {availableTipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Coluna L (Linha Vermelha: 1, 2, 3 ou 4) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 whitespace-nowrap">Coluna L:</span>
            <select
              value={filters.colunaL}
              onChange={(e) => setFilters((prev) => ({ ...prev, colunaL: e.target.value }))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
            >
              <option value="TODOS">Coluna L (Todas)</option>
              <option value="APENAS_LV">Apenas Linha Vermelha (1, 2, 3, 4)</option>
              <option value="1">Linha Vermelha 1 (L = 1)</option>
              <option value="2">Linha Vermelha 2 (L = 2)</option>
              <option value="3">Linha Vermelha 3 (L = 3)</option>
              <option value="4">Linha Vermelha 4 (L = 4)</option>
              <option value="SEM_LV">Sem Linha Vermelha</option>
            </select>
          </div>

          {/* Rota Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 whitespace-nowrap">Rota:</span>
            <select
              value={filters.rota}
              onChange={(e) => setFilters((prev) => ({ ...prev, rota: e.target.value }))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="TODAS">Todas as Rotas</option>
              {availableRotas.map((rota) => (
                <option key={rota} value={rota}>
                  {rota}
                </option>
              ))}
            </select>
          </div>

          {/* Status Linha Vermelha Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 whitespace-nowrap">Linha Vermelha:</span>
            <select
              value={filters.statusLinha}
              onChange={(e) => setFilters((prev) => ({ ...prev, statusLinha: e.target.value }))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="Concluído">100% Pronto</option>
              <option value="Linha Vermelha Ativa">Linha Vermelha Ativa (≥70%)</option>
              <option value="Em Andamento">Em Andamento (1-69%)</option>
              <option value="Pendente">Pendente (0%)</option>
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Buscar rota, CD, marca ou tipo..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Filter summary status line */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Exibindo {filteredCount} de {totalCount} registros</span>
          <span aria-hidden="true">·</span>
          <span>CD: {filters.cd === 'TODOS' ? 'Todos' : filters.cd}</span>
          <span aria-hidden="true">·</span>
          <span>Marca: {filters.marca === 'TODAS' ? 'Total (Consolidado)' : filters.marca}</span>
          <span aria-hidden="true">·</span>
          <span>Tipo: {filters.tipoPedido === 'TODOS' ? 'Todos' : filters.tipoPedido}</span>
        </div>
      </div>
    </div>
  );
};
