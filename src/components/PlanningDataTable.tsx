import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Download, Search, CheckCircle2, Clock } from 'lucide-react';
import { PlanningRow } from '../types';

interface PlanningDataTableProps {
  data: PlanningRow[];
  onExportCsv: () => void;
}

type SortField = 'cd' | 'marca' | 'tipoPedido' | 'rota' | 'volumetria' | 'percentualLinhaVermelha' | 'volumeLinhaVermelhaPronto' | 'isRoteirizado';

export const PlanningDataTable: React.FC<PlanningDataTableProps> = ({ data, onExportCsv }) => {
  const [sortField, setSortField] = useState<SortField>('volumetria');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localSearch, setLocalSearch] = useState<string>('');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredData = useMemo(() => {
    if (!localSearch.trim()) return data;
    const q = localSearch.toLowerCase();
    return data.filter(
      (r) =>
        r.cd.toLowerCase().includes(q) ||
        r.marca.toLowerCase().includes(q) ||
        (r.tipoPedido && r.tipoPedido.toLowerCase().includes(q)) ||
        r.rota.toLowerCase().includes(q) ||
        (r.observacao && r.observacao.toLowerCase().includes(q))
    );
  }, [data, localSearch]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'boolean') {
        return sortDirection === 'asc' ? (valA === valB ? 0 : valA ? 1 : -1) : (valA === valB ? 0 : valA ? -1 : 1);
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [filteredData, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table Header controls */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Registros Detalhados da Aba Planejamento
          </h3>
          <div className="text-xs text-slate-500 mt-0.5">
            Mapeamento: CD (E) · Marca (F) · Rota (Y: ≠ 0 = Roteirizado) · Volumetria (AK) · % Linha Vermelha (BG)
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filtrar tabela..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th
                onClick={() => handleSort('cd')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>CD (Origem E)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('marca')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Marca (F)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('tipoPedido')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Tipo de Pedido</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('rota')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Rota (Y)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('isRoteirizado')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status Roteirizado</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">
                <span>Coluna L (LV 1-4)</span>
              </th>
              <th
                onClick={() => handleSort('volumetria')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volumetria (AK)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('percentualLinhaVermelha')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors min-w-[150px]"
              >
                <div className="flex items-center gap-1">
                  <span>% Linha Vermelha (BG)</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volumeLinhaVermelhaPronto')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume Linha Pronta</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
            {paginatedData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-sans font-medium text-slate-900">
                  {row.cd === 'Jundiai' ? 'Jundiaí' : row.cd === 'Sao Jose' ? 'São José' : row.cd}
                </td>
                <td className="py-3 px-4 font-sans">
                  <span
                    className={`font-semibold ${
                      row.marca === 'SAS'
                        ? 'text-blue-600'
                        : row.marca === 'SAE'
                        ? 'text-purple-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {row.marca}
                  </span>
                </td>
                <td className="py-3 px-4 font-sans text-slate-700">
                  <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {row.tipoPedido || 'Implantação'}
                  </span>
                </td>
                <td className="py-3 px-4 font-sans font-medium text-slate-800">{row.rota}</td>
                <td className="py-3 px-4 font-sans">
                  {row.isRoteirizado ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Roteirizado</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Sem Rota (0)</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-sans">
                  {row.colunaL ? (
                    <span className="inline-flex items-center text-[11px] font-bold font-mono text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      LV {row.colunaL}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px] font-mono">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">
                  {row.volumetria.toLocaleString('pt-BR')}
                </td>
                <td className="py-3 px-4 font-sans">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-semibold text-slate-800">{row.percentualLinhaVermelha}%</span>
                      <span className="text-slate-400">
                        {row.percentualLinhaVermelha >= 100
                          ? '100% Pronto'
                          : row.percentualLinhaVermelha >= 70
                          ? 'Linha Ativa'
                          : row.percentualLinhaVermelha > 0
                          ? 'Em Digitação'
                          : 'Pendente'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          row.percentualLinhaVermelha >= 100
                            ? 'bg-emerald-500'
                            : row.percentualLinhaVermelha >= 70
                            ? 'bg-indigo-600'
                            : row.percentualLinhaVermelha > 0
                            ? 'bg-amber-500'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${row.percentualLinhaVermelha}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                  {row.volumeLinhaVermelhaPronto.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </td>
                <td className="py-3 px-4 font-sans text-xs text-slate-500 max-w-xs truncate">
                  {row.observacao || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} registros
          </span>
          <span aria-hidden="true">·</span>
          <span>Linhas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            Anterior
          </button>
          <span className="px-2 font-mono tabular-nums">
            Pág. {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};
