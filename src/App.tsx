/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { CdVolumetryOverview } from './components/CdVolumetryOverview';
import { RouteLinhaVermelhaVisualizer } from './components/RouteLinhaVermelhaVisualizer';
import { BrandBreakdownView } from './components/BrandBreakdownView';
import { PlanningDataTable } from './components/PlanningDataTable';
import { BloqueiosTab } from './components/BloqueiosTab';
import { DataImportModal } from './components/DataImportModal';
import { INITIAL_PLANNING_DATA, BLOQUEIOS_META_DATA, BLOQUEIOS_FUNIL_DATA } from './data/defaultData';
import { FilterState, PlanningRow, TabType } from './types';
import { Info, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [planningData, setPlanningData] = useState<PlanningRow[]>(INITIAL_PLANNING_DATA);
  const [activeTab, setActiveTab] = useState<TabType>('planejamento');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    cd: 'TODOS',
    marca: 'TODAS',
    rota: 'TODAS',
    tipoPedido: 'TODOS',
    colunaL: 'TODOS',
    apenasRoteirizados: false,
    statusLinha: 'TODOS',
    searchQuery: ''
  });

  // Extract unique filter options from current dataset
  const availableCDs = useMemo(() => {
    return Array.from(new Set(planningData.map((r) => r.cd))).filter(Boolean);
  }, [planningData]);

  const availableMarcas = useMemo(() => {
    return Array.from(new Set(planningData.map((r) => r.marca))).filter(Boolean);
  }, [planningData]);

  const availableTipos = useMemo(() => {
    return Array.from(new Set(planningData.map((r) => r.tipoPedido))).filter(Boolean);
  }, [planningData]);

  const availableRotas = useMemo(() => {
    return Array.from(new Set(planningData.map((r) => r.rota)))
      .filter((rota) => rota !== 'Sem Rota (0)')
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
        const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
        return numA - numB;
      });
  }, [planningData]);

  // Filtered planning data
  const filteredData = useMemo(() => {
    return planningData.filter((row) => {
      // CD filter
      if (filters.cd !== 'TODOS' && row.cd !== filters.cd) return false;

      // Marca filter (SAS, SAE, IS)
      if (filters.marca !== 'TODAS' && row.marca !== filters.marca) return false;

      // Tipo de Pedido filter
      if (filters.tipoPedido !== 'TODOS' && row.tipoPedido !== filters.tipoPedido) return false;

      // Rota filter
      if (filters.rota !== 'TODAS' && row.rota !== filters.rota) return false;

      // Coluna L filter (Linha Vermelha: 1, 2, 3 ou 4)
      if (filters.colunaL !== 'TODOS') {
        if (filters.colunaL === 'APENAS_LV' && !row.isLinhaVermelha) return false;
        if (filters.colunaL === 'SEM_LV' && row.isLinhaVermelha) return false;
        if (['1', '2', '3', '4'].includes(filters.colunaL) && row.colunaL !== Number(filters.colunaL)) return false;
      }

      // Filter only roteirizados (Coluna Y ≠ vazio e ≠ 0)
      if (filters.apenasRoteirizados && !row.isRoteirizado) return false;

      // Status filter
      if (filters.statusLinha !== 'TODOS' && row.status !== filters.statusLinha) return false;

      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesCd = row.cd.toLowerCase().includes(query);
        const matchesMarca = row.marca.toLowerCase().includes(query);
        const matchesRota = row.rota.toLowerCase().includes(query);
        const matchesTipo = row.tipoPedido?.toLowerCase().includes(query) || false;
        const matchesObs = row.observacao?.toLowerCase().includes(query) || false;
        if (!matchesCd && !matchesMarca && !matchesRota && !matchesTipo && !matchesObs) return false;
      }

      return true;
    });
  }, [planningData, filters]);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      cd: 'TODOS',
      marca: 'TODAS',
      rota: 'TODAS',
      tipoPedido: 'TODOS',
      colunaL: 'TODOS',
      apenasRoteirizados: false,
      statusLinha: 'TODOS',
      searchQuery: ''
    });
  };

  // Restore seed dataset
  const handleResetData = () => {
    setPlanningData(INITIAL_PLANNING_DATA);
    handleResetFilters();
    triggerToast('Dados restaurados: Total Roteirizado 247.693 vols (Jundiaí: 125.615 · Itaitinga: 122.078 · São José: 0).');
  };

  // Handle new data loaded from modal (CSV, XLSX or paste)
  const handleDataLoaded = (newData: PlanningRow[]) => {
    setPlanningData(newData);
    handleResetFilters();
    const roteirizadosCount = newData.filter((r) => r.isRoteirizado).reduce((acc, r) => acc + r.volumetria, 0);
    triggerToast(`${newData.length} linhas carregadas! Volumetria roteirizada: ${roteirizadosCount.toLocaleString('pt-BR')} vols.`);
  };

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 4000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'CD (Origem Col E)',
      'Marca (Col F)',
      'Tipo de Pedido',
      'Rota (Col Y)',
      'Roteirizado (Col Y ≠ 0)',
      'Linha Vermelha (Col L: 1, 2, 3, 4)',
      'Volumetria (Col AK)',
      '% Linha Vermelha (Col BG)',
      'Volume Linha Pronta',
      'Status',
      'Observacao'
    ];

    const rows = filteredData.map((r) => [
      r.cd,
      r.marca,
      r.tipoPedido,
      r.rota,
      r.isRoteirizado ? 'Sim' : 'Não',
      r.colunaL ? `LV ${r.colunaL}` : 'Sem LV',
      r.volumetria,
      `${r.percentualLinhaVermelha}%`,
      r.volumeLinhaVermelhaPronto,
      r.status,
      r.observacao || ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `planejamento_roteirizacao_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Relatório CSV exportado com sucesso.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportCsv={handleExportCsv}
        onResetData={handleResetData}
        totalRecords={planningData.length}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Context Information Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-900">Mapeamento da Aba Planejamento:</span>{' '}
              <span>CD/Origem (E: Jundiaí, Itaitinga, São José)</span>
              <span className="text-slate-300 mx-1.5">|</span>
              <span>Marca (F: SAS, SAE, IS)</span>
              <span className="text-slate-300 mx-1.5">|</span>
              <span>Rota (Y: ≠ 0 ou vazio = Roteirizado)</span>
              <span className="text-slate-300 mx-1.5">|</span>
              <span>Volumetria (AK)</span>
              <span className="text-slate-300 mx-1.5">|</span>
              <span>Linha Vermelha / % Pronto (BG)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-medium flex-wrap text-xs">
            <span className="text-slate-400">Total Roteirizado:</span>
            <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              247.693 vols
            </span>
            <span className="text-slate-400">· Jundiaí:</span>
            <span className="font-bold font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
              125.615
            </span>
            <span className="text-slate-400">· Itaitinga:</span>
            <span className="font-bold font-mono text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
              122.078
            </span>
            <span className="text-slate-400">· São José:</span>
            <span className="font-bold font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              0 vols
            </span>
          </div>
        </div>

        {/* Tab 1: Visão Geral por CD (Planejamento) */}
        {activeTab === 'planejamento' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <KpiCards
              data={filteredData}
              selectedCD={filters.cd}
              selectedMarca={filters.marca}
            />

            {/* Filter Bar with Marca & CD toggles */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              availableCDs={availableCDs}
              availableMarcas={availableMarcas}
              availableRotas={availableRotas}
              availableTipos={availableTipos}
              onResetFilters={handleResetFilters}
              filteredCount={filteredData.length}
              totalCount={planningData.length}
            />

            {/* Brand Breakdown */}
            <BrandBreakdownView
              data={planningData}
              selectedMarca={filters.marca}
              onSelectMarca={(marca) => setFilters((prev) => ({ ...prev, marca }))}
            />

            {/* CD Volumetry Overview */}
            <CdVolumetryOverview
              data={filteredData}
              selectedCD={filters.cd}
              onSelectCD={(cd) => setFilters((prev) => ({ ...prev, cd }))}
              selectedMarca={filters.marca}
            />
          </div>
        )}

        {/* Tab 2: Rotas & Linha Vermelha Visual */}
        {activeTab === 'linha_vermelha' && (
          <div className="space-y-6">
            <KpiCards
              data={filteredData}
              selectedCD={filters.cd}
              selectedMarca={filters.marca}
            />

            <FilterBar
              filters={filters}
              setFilters={setFilters}
              availableCDs={availableCDs}
              availableMarcas={availableMarcas}
              availableRotas={availableRotas}
              availableTipos={availableTipos}
              onResetFilters={handleResetFilters}
              filteredCount={filteredData.length}
              totalCount={planningData.length}
            />

            <RouteLinhaVermelhaVisualizer
              data={filteredData.filter((r) => r.isRoteirizado)}
              selectedMarca={filters.marca}
              selectedCD={filters.cd}
            />
          </div>
        )}

        {/* Tab 3: Aba Bloqueios & Funil */}
        {activeTab === 'bloqueios' && (
          <div className="space-y-6">
            <BloqueiosTab
              metaData={BLOQUEIOS_META_DATA}
              funilData={BLOQUEIOS_FUNIL_DATA}
            />
          </div>
        )}

        {/* Tab 4: Dados Brutos */}
        {activeTab === 'tabela' && (
          <div className="space-y-6">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              availableCDs={availableCDs}
              availableMarcas={availableMarcas}
              availableRotas={availableRotas}
              availableTipos={availableTipos}
              onResetFilters={handleResetFilters}
              filteredCount={filteredData.length}
              totalCount={planningData.length}
            />

            <PlanningDataTable
              data={filteredData}
              onExportCsv={handleExportCsv}
            />
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onDataLoaded={handleDataLoaded}
      />
    </div>
  );
}
