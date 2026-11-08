import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenImportModal: () => void;
  onExportCsv: () => void;
  onResetData: () => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenImportModal,
  onExportCsv,
  onResetData,
  totalRecords
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              AR
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Roteirização & Planejamento CD
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Aba Planejamento · {totalRecords} registros carregados
              </span>
            </div>
          </div>

          {/* Zone 2: Clean single-line text navigation links / tabs */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('planejamento')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'planejamento'
                  ? 'text-slate-900 border-b-2 border-rose-600 font-semibold'
                  : ''
              }`}
            >
              Visão Geral por CD
            </button>
            <button
              onClick={() => setActiveTab('linha_vermelha')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'linha_vermelha'
                  ? 'text-slate-900 border-b-2 border-rose-600 font-semibold'
                  : ''
              }`}
            >
              Rotas & Linha Vermelha
            </button>
            <button
              onClick={() => setActiveTab('bloqueios')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'bloqueios'
                  ? 'text-slate-900 border-b-2 border-rose-600 font-semibold'
                  : ''
              }`}
            >
              Aba Bloqueios & Funil
            </button>
            <button
              onClick={() => setActiveTab('tabela')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 ${
                activeTab === 'tabela'
                  ? 'text-slate-900 border-b-2 border-rose-600 font-semibold'
                  : ''
              }`}
            >
              Dados Brutos
            </button>
          </nav>

          {/* Zone 3: Primary action button + Quick utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onOpenImportModal}
              title="Sincronizar com Google Sheets"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onExportCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar Google Sheets</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 gap-4 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('planejamento')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'planejamento' ? 'bg-slate-100 text-slate-900 font-semibold' : ''
            }`}
          >
            Visão CD
          </button>
          <button
            onClick={() => setActiveTab('linha_vermelha')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'linha_vermelha' ? 'bg-slate-100 text-slate-900 font-semibold' : ''
            }`}
          >
            Rotas & Linha Vermelha
          </button>
          <button
            onClick={() => setActiveTab('bloqueios')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'bloqueios' ? 'bg-slate-100 text-slate-900 font-semibold' : ''
            }`}
          >
            Bloqueios
          </button>
          <button
            onClick={() => setActiveTab('tabela')}
            className={`whitespace-nowrap px-2 py-1 rounded ${
              activeTab === 'tabela' ? 'bg-slate-100 text-slate-900 font-semibold' : ''
            }`}
          >
            Dados
          </button>
        </div>
      </div>
    </header>
  );
};
