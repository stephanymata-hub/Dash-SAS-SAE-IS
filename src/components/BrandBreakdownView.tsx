import React from 'react';
import { Tag, CheckCircle2, TrendingUp, Compass } from 'lucide-react';
import { PlanningRow } from '../types';

interface BrandBreakdownViewProps {
  data: PlanningRow[];
  selectedMarca: string;
  onSelectMarca: (marca: string) => void;
}

export const BrandBreakdownView: React.FC<BrandBreakdownViewProps> = ({
  data,
  selectedMarca,
  onSelectMarca
}) => {
  const marcas = ['SAS', 'SAE', 'IS'];

  const brandStats = marcas.map((marca) => {
    const brandRows = data.filter((r) => r.marca === marca);
    const brandRoteirizados = brandRows.filter((r) => r.isRoteirizado);
    const brandNaoRoteirizados = brandRows.filter((r) => !r.isRoteirizado);
    const brandLinhaVermelha = brandRows.filter((r) => r.isRoteirizado && r.isLinhaVermelha);

    const totalVol = brandRows.reduce((acc, r) => acc + r.volumetria, 0);
    const roteirizado = brandRoteirizados.reduce((acc, r) => acc + r.volumetria, 0);
    const roteirizadoPedidos = brandRoteirizados.length;
    const pendente = brandNaoRoteirizados.reduce((acc, r) => acc + r.volumetria, 0);
    const percRoteirizado = totalVol > 0 ? (roteirizado / totalVol) * 100 : 0;

    const linhaVermelhaVol = brandLinhaVermelha.reduce((acc, r) => acc + r.volumetria, 0);
    const linhaVermelhaPedidos = brandLinhaVermelha.length;

    const rotas = new Set(brandRoteirizados.map((r) => r.rota)).size;

    return {
      marca,
      totalVol,
      roteirizado,
      roteirizadoPedidos,
      linhaVermelhaVol,
      linhaVermelhaPedidos,
      pendente,
      percRoteirizado,
      rotas,
      count: brandRows.length
    };
  });

  const totalAllRoteirizado = brandStats.reduce((acc, b) => acc + b.roteirizado, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-700" />
            Distribuição de Volume Roteirizado por Marca (Coluna F)
          </h3>
          <p className="text-xs text-slate-500">
            Comparativo de volumetria roteirizada (Coluna Y ≠ 0) entre SAS, SAE e IS
          </p>
        </div>

        {selectedMarca !== 'TODAS' && (
          <button
            onClick={() => onSelectMarca('TODAS')}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium self-start sm:self-auto transition-colors"
          >
            ← Voltar para Visão Total
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {brandStats.map((b) => {
          const isSelected = selectedMarca === b.marca;
          const share = totalAllRoteirizado > 0 ? (b.roteirizado / totalAllRoteirizado) * 100 : 0;

          const themeColors =
            b.marca === 'SAS'
              ? { text: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-600' }
              : b.marca === 'SAE'
              ? { text: 'text-purple-600', bg: 'bg-purple-50', bar: 'bg-purple-600' }
              : { text: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-600' };

          return (
            <div
              key={b.marca}
              onClick={() => onSelectMarca(isSelected ? 'TODAS' : b.marca)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-slate-900 ring-2 ring-slate-900/10 bg-slate-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-base font-bold ${themeColors.text}`}>{b.marca}</span>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {share.toFixed(1)}% do roteirizado
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Volume Roteirizado:</span>
                  <div className="text-right">
                    <span className="text-base font-bold text-emerald-600 font-mono tabular-nums">
                      {b.roteirizado.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono block">
                      {b.roteirizadoPedidos} pedidos
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between text-xs text-slate-500 font-mono tabular-nums pt-1 border-t border-slate-100">
                  <span>Linha Vermelha (Col L [1-4]):</span>
                  <div className="text-right">
                    <span className="font-bold text-rose-600">
                      {b.linhaVermelhaVol.toLocaleString('pt-BR')} vols
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      ({b.linhaVermelhaPedidos} pedidos)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1 flex">
                  <div
                    className={`${themeColors.bar} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${b.percRoteirizado}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{b.rotas} rotas com volume</span>
                <span className="text-slate-400">
                  {isSelected ? '✓ Filtrado' : 'Clique para filtrar'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
