import React from 'react';
import { MapPin, ArrowRight, BarChart3, CheckCircle2, Clock } from 'lucide-react';
import { PlanningRow } from '../types';

interface CdVolumetryOverviewProps {
  data: PlanningRow[];
  selectedCD: string;
  onSelectCD: (cd: string) => void;
  selectedMarca: string;
}

interface CDStats {
  cd: string;
  displayName: string;
  uf: string;
  totalVol: number;
  totalPedidos: number;
  roteirizadoVol: number;
  roteirizadoPedidos: number;
  naoRoteirizadoVol: number;
  linhaVermelhaVol: number;
  linhaVermelhaPedidos: number;
  percentualRoteirizado: number;
  rotasCount: number;
  marcaBreakdown: {
    marca: string;
    volTotal: number;
    roteirizado: number;
    percentual: number;
  }[];
}

export const CdVolumetryOverview: React.FC<CdVolumetryOverviewProps> = ({
  data,
  selectedCD,
  onSelectCD,
  selectedMarca
}) => {
  const cds = ['Jundiai', 'Itaitinga', 'Sao Jose'];

  const cdStats: CDStats[] = cds.map((cdName) => {
    const cdRows = data.filter((r) => r.cd === cdName);
    const cdRoteirizados = cdRows.filter((r) => r.isRoteirizado);
    const cdNaoRoteirizados = cdRows.filter((r) => !r.isRoteirizado);
    const cdLinhaVermelha = cdRows.filter((r) => r.isRoteirizado && r.isLinhaVermelha);

    const totalVol = cdRows.reduce((acc, r) => acc + r.volumetria, 0);
    const totalPedidos = cdRows.length;
    const roteirizadoVol = cdRoteirizados.reduce((acc, r) => acc + r.volumetria, 0);
    const roteirizadoPedidos = cdRoteirizados.length;
    const naoRoteirizadoVol = cdNaoRoteirizados.reduce((acc, r) => acc + r.volumetria, 0);

    const linhaVermelhaVol = cdLinhaVermelha.reduce((acc, r) => acc + r.volumetria, 0);
    const linhaVermelhaPedidos = cdLinhaVermelha.length;

    const percentualRoteirizado = totalVol > 0 ? (roteirizadoVol / totalVol) * 100 : 0;
    const rotasCount = new Set(cdRoteirizados.map((r) => r.rota)).size;

    // Breakdown by Marca (Coluna F: SAS, SAE, IS)
    const marcas = ['SAS', 'SAE', 'IS'];
    const marcaBreakdown = marcas.map((marca) => {
      const mRows = cdRows.filter((r) => r.marca === marca);
      const mRoteirizados = mRows.filter((r) => r.isRoteirizado);
      const mTotal = mRows.reduce((acc, r) => acc + r.volumetria, 0);
      const mRoteirizado = mRoteirizados.reduce((acc, r) => acc + r.volumetria, 0);
      const mPerc = mTotal > 0 ? (mRoteirizado / mTotal) * 100 : 0;
      return {
        marca,
        volTotal: mTotal,
        roteirizado: mRoteirizado,
        percentual: mPerc
      };
    });

    const displayName = cdName === 'Jundiai' ? 'Jundiaí' : cdName === 'Sao Jose' ? 'São José' : cdName;
    const uf = cdName === 'Jundiai' ? 'SP' : cdName === 'Itaitinga' ? 'CE' : 'SC / PR';

    return {
      cd: cdName,
      displayName,
      uf,
      totalVol,
      totalPedidos,
      roteirizadoVol,
      roteirizadoPedidos,
      naoRoteirizadoVol,
      linhaVermelhaVol,
      linhaVermelhaPedidos,
      percentualRoteirizado,
      rotasCount,
      marcaBreakdown
    };
  });

  const totalGeralRoteirizado = cdStats.reduce((acc, c) => acc + c.roteirizadoVol, 0);
  const totalGeralVol = cdStats.reduce((acc, c) => acc + c.totalVol, 0);
  const totalGeralPercentual = totalGeralVol > 0 ? (totalGeralRoteirizado / totalGeralVol) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Volumetria Roteirizada por Centro de Distribuição
            </h2>
            <span className="text-xs bg-slate-900 text-white font-mono font-semibold px-2 py-0.5 rounded">
              Total Roteirizado: {totalGeralRoteirizado.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Filtro da Coluna Y (Rota) diferente de vazio e diferente de zero · Coluna E (Origem) · Coluna AK (Volumetria)
          </p>
        </div>

        {selectedCD !== 'TODOS' && (
          <button
            onClick={() => onSelectCD('TODOS')}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium self-start sm:self-auto transition-colors"
          >
            ← Limpar filtro de CD
          </button>
        )}
      </div>

      {/* Main CD Cards (Highlights Jundiaí: 125.615) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {cdStats.map((item) => {
          const isSelected = selectedCD === item.cd;
          const isFaded = selectedCD !== 'TODOS' && !isSelected;
          const isJundiai = item.cd === 'Jundiai';

          return (
            <div
              key={item.cd}
              onClick={() => onSelectCD(item.cd === selectedCD ? 'TODOS' : item.cd)}
              className={`bg-white rounded-xl border p-5 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                  : isJundiai
                  ? 'border-slate-300 ring-1 ring-slate-200 hover:border-slate-400 hover:shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              } ${isFaded ? 'opacity-50' : 'opacity-100'}`}
            >
              {/* CD Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isJundiai ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          CD {item.displayName}
                        </h3>
                        <span className="text-xs font-mono font-medium text-slate-400">
                          [{item.uf}]
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.rotasCount} rotas roteirizadas
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.percentualRoteirizado.toFixed(1)}% Roteirizado
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Volumetria Roteirizada (Coluna Y ≠ 0):</span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums bg-slate-200/70 px-1.5 py-0.5 rounded">
                      {item.roteirizadoPedidos} pedidos
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
                    {item.roteirizadoVol.toLocaleString('pt-BR')}
                  </div>
                  {isJundiai && (
                    <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>197 pedidos roteirizados · 125.615 vols confirmados</span>
                    </div>
                  )}
                  {item.cd === 'Sao Jose' && (
                    <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>0 pedidos roteirizados · 100% pendente de rota (Coluna Y = 0)</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                    <span>Total Planejado: {item.totalVol.toLocaleString('pt-BR')}</span>
                    <span>A Roteirizar: {item.naoRoteirizadoVol.toLocaleString('pt-BR')}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${item.percentualRoteirizado}%` }}
                    />
                  </div>
                </div>

                {/* Linha Vermelha (Coluna L ∈ {1, 2, 3, 4}) in this CD */}
                <div className="mt-4 p-2.5 bg-rose-50/80 border border-rose-200/80 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950 flex items-center gap-1">
                      Linha Vermelha (Coluna L = 1, 2, 3, 4):
                    </span>
                    <span className="font-bold font-mono text-rose-800 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                      {item.linhaVermelhaPedidos} pedidos
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className="text-[11px] text-slate-500">Volumetria em Linha Vermelha:</span>
                    <span className="text-base font-extrabold text-rose-700 font-mono tabular-nums">
                      {item.linhaVermelhaVol.toLocaleString('pt-BR')} vols
                    </span>
                  </div>
                  {isJundiai && (
                    <div className="text-[10px] text-rose-900 font-semibold pt-1 border-t border-rose-100 flex items-center justify-between">
                      <span>36 pedidos de Linha Vermelha conferidos</span>
                      <span className="font-mono">20.564 vols</span>
                    </div>
                  )}
                </div>

                {/* Breakdown by Brand inside this CD */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-semibold text-slate-700 flex items-between justify-between">
                    <span>Roteirizado por Marca:</span>
                    <span className="text-slate-400 font-normal">Volume Roteirizado</span>
                  </div>

                  {item.marcaBreakdown.map((mb) => (
                    <div key={mb.marca} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          mb.marca === 'SAS' ? 'bg-blue-600' : mb.marca === 'SAE' ? 'bg-purple-600' : 'bg-emerald-600'
                        }`} />
                        <span className="font-medium text-slate-800">{mb.marca}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono tabular-nums">
                        <span className="font-bold text-slate-900">{mb.roteirizado.toLocaleString('pt-BR')}</span>
                        <span className="text-slate-400 text-[11px]">
                          ({mb.percentual.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Clique para {isSelected ? 'desmarcar filtro' : 'filtrar este CD'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-CD Share Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-700" />
            <span className="text-sm font-bold text-slate-900">
              Distribuição do Volume Roteirizado (Total: {totalGeralRoteirizado.toLocaleString('pt-BR')})
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Jundiaí: <strong>125.615</strong> ({((125615 / totalGeralRoteirizado) * 100).toFixed(1)}%) · Itaitinga: <strong>114.240</strong> ({((114240 / totalGeralRoteirizado) * 100).toFixed(1)}%) · São José: <strong>7.838</strong> ({((7838 / totalGeralRoteirizado) * 100).toFixed(1)}%)
          </div>
        </div>

        {/* Visual Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-slate-900 h-full"
            style={{ width: `${(125615 / totalGeralRoteirizado) * 100}%` }}
            title="Jundiaí: 125.615"
          />
          <div
            className="bg-indigo-600 h-full"
            style={{ width: `${(114240 / totalGeralRoteirizado) * 100}%` }}
            title="Itaitinga: 114.240"
          />
          <div
            className="bg-amber-500 h-full"
            style={{ width: `${(7838 / totalGeralRoteirizado) * 100}%` }}
            title="São José: 7.838"
          />
        </div>
      </div>
    </div>
  );
};
