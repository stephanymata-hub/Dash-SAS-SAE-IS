import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle, CheckCircle2, SlidersHorizontal, MapPin } from 'lucide-react';
import { PlanningRow } from '../types';
import { parseFile, parsePastedText, ParseResult } from '../utils/sheetParser';
import { generatePlanningData } from '../data/defaultData';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (newData: PlanningRow[]) => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({ isOpen, onClose, onDataLoaded }) => {
  const [activeMode, setActiveMode] = useState<'calibrar' | 'paste' | 'upload'>('calibrar');
  const [pastedText, setPastedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calibration inputs
  const [itaVol, setItaVol] = useState<number>(122078);
  const [itaOrders, setItaOrders] = useState<number>(150);

  if (!isOpen) return null;

  const handleApplyCalibration = () => {
    const newData = generatePlanningData(itaVol, itaOrders);
    onDataLoaded(newData);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await parseFile(file);
      if (res.data.length === 0) {
        setErrorMsg('Nenhuma linha válida encontrada no arquivo. Verifique se o arquivo possui colunas preenchidas.');
      } else {
        setParseResult(res);
      }
    } catch (err: any) {
      setErrorMsg(`Erro ao ler arquivo: ${err.message || 'Formato não suportado'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPasted = () => {
    if (!pastedText.trim()) {
      setErrorMsg('Cole primeiro os dados copiados do Google Sheets ou Excel.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = parsePastedText(pastedText);
      if (res.data.length === 0) {
        setErrorMsg('Não foi possível reconhecer registros válidos no texto colado.');
      } else {
        setParseResult(res);
      }
    } catch (err: any) {
      setErrorMsg(`Erro ao processar texto: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyData = () => {
    if (!parseResult || parseResult.data.length === 0) return;
    onDataLoaded(parseResult.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Calibrar ou Importar Dados da Aba Planejamento
              </h3>
              <p className="text-xs text-slate-500">
                Ajuste os valores dos CDs ou carregue as linhas copiadas do Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tabs: Calibrate vs Paste vs File */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setActiveMode('calibrar');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'calibrar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Ajustar Números por CD</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('paste');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'paste'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Colar Células do Sheets
            </button>
            <button
              onClick={() => {
                setActiveMode('upload');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeMode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload de Arquivo (.xlsx/.csv)
            </button>
          </div>

          {activeMode === 'calibrar' ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                Digite os valores exatos que encontrou no seu filtro da planilha (Coluna E = CD, Coluna Y diferente de vazio e zero):
              </div>

              {/* CD Itaitinga Input Box */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>CD Itaitinga (CE)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Editável
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Volumetria Roteirizada (Coluna AK):
                    </label>
                    <input
                      type="number"
                      value={itaVol}
                      onChange={(e) => setItaVol(Number(e.target.value) || 0)}
                      placeholder="Ex: 122078"
                      className="w-full text-sm font-mono font-bold p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quantidade de Pedidos em Rota:
                    </label>
                    <input
                      type="number"
                      value={itaOrders}
                      onChange={(e) => setItaOrders(Number(e.target.value) || 0)}
                      placeholder="Ex: 150"
                      className="w-full text-sm font-mono font-bold p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Jundiaí & São José summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>CD Jundiaí (SP)</span>
                    <span className="text-emerald-700 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conferido
                    </span>
                  </div>
                  <div className="text-base font-extrabold font-mono text-slate-900">
                    125.615 vols
                  </div>
                  <div className="text-[11px] text-slate-500">
                    197 pedidos · LV: 20.564 vols (36 pedidos)
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>CD São José (SC/PR)</span>
                    <span className="text-amber-700 text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      0 Roteirizado
                    </span>
                  </div>
                  <div className="text-base font-extrabold font-mono text-slate-900">
                    0 vols
                  </div>
                  <div className="text-[11px] text-slate-500">
                    0 pedidos em rota (Coluna Y vazia/0)
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
                <span>Novo Total Roteirizado (Jundiaí + Itaitinga + São José):</span>
                <span className="font-bold font-mono text-emerald-400 text-sm">
                  {(125615 + itaVol).toLocaleString('pt-BR')} vols
                </span>
              </div>

              <button
                onClick={handleApplyCalibration}
                className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Aplicar Calibração de Itaitinga no Dashboard
              </button>
            </div>
          ) : activeMode === 'paste' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">
                  Selecione as linhas no Google Sheets (incluindo ou não o cabeçalho) e dê Ctrl+C / Ctrl+V aqui:
                </span>
                <span className="text-slate-400">Separado por tab/vírgula</span>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Exemplo: cole aqui as células copiadas da aba Planejamento..."
                rows={6}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
              <button
                onClick={handleProcessPasted}
                disabled={isProcessing || !pastedText.trim()}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
              >
                {isProcessing ? 'Processando dados...' : 'Interpretar Dados Colados'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
              >
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-800">
                  Clique para selecionar arquivo .xlsx, .xls ou .csv
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  O sistema busca automaticamente a aba <strong>Planejamento</strong> e as colunas E, F, Y, AK, BG
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parse Result Preview */}
          {parseResult && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{parseResult.totalRows} registros identificados com sucesso!</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px]">
                  Origem: {parseResult.detectedColumns.origemCol} · Rota: {parseResult.detectedColumns.rotaCol} · AK: {parseResult.detectedColumns.volumetriaCol} · BG: {parseResult.detectedColumns.percentualCol}
                </span>
              </div>

              {/* Mini Preview Table */}
              <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 text-[11px]">
                    <tr>
                      <th className="py-1.5 px-3">CD (E)</th>
                      <th className="py-1.5 px-3">Marca (F)</th>
                      <th className="py-1.5 px-3">Rota (Y)</th>
                      <th className="py-1.5 px-3">LV (L)</th>
                      <th className="py-1.5 px-3 text-right">Vol (AK)</th>
                      <th className="py-1.5 px-3 text-right">% Linha (BG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                    {parseResult.data.slice(0, 5).map((row) => (
                      <tr key={row.id}>
                        <td className="py-1.5 px-3 font-sans">{row.cd}</td>
                        <td className="py-1.5 px-3 font-sans font-medium">{row.marca}</td>
                        <td className="py-1.5 px-3 font-sans">{row.rota}</td>
                        <td className="py-1.5 px-3 font-sans">
                          {row.colunaL ? (
                            <span className="text-rose-700 font-bold bg-rose-50 px-1 py-0.5 rounded text-[10px]">
                              L={row.colunaL}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-right">{row.volumetria.toLocaleString('pt-BR')}</td>
                        <td className="py-1.5 px-3 text-right font-semibold text-emerald-600">{row.percentualLinhaVermelha}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApplyData}
            disabled={!parseResult || parseResult.data.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-xs"
          >
            Aplicar no Dashboard ({parseResult?.totalRows || 0} Linhas)
          </button>
        </div>
      </div>
    </div>
  );
};
