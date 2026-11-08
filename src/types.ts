export interface PlanningRow {
  id: string;
  pedido?: string;                  // Código/ID do Pedido
  tipoPedido: string;               // Tipo de Pedido (ex: Implantação, Complementar, Suplementar)
  cd: string;                       // Coluna E (Origem): Jundiai, Itaitinga, Sao Jose
  marca: string;                    // Coluna F (Marca): SAS, SAE, IS
  colunaL: number | null;           // Coluna L: apenas 1, 2, 3 ou 4 é considerado Linha Vermelha!
  isLinhaVermelha: boolean;         // true se Coluna L for 1, 2, 3 ou 4
  rota: string;                     // Coluna Y (Rota): 'Rota 1', 'Rota 2', '0', etc.
  isRoteirizado: boolean;           // Regra da usuária: Coluna Y diferente de vazio e diferente de zero
  volumetria: number;               // Coluna AK (Volumetria da linha/rota)
  percentualLinhaVermelha: number;  // Coluna BG (% Pronto / Linha Vermelha: 0 - 100)
  volumeLinhaVermelhaPronto: number;// Calculado: volumetria * (percentualLinhaVermelha / 100)
  status: 'Concluído' | 'Linha Vermelha Ativa' | 'Em Andamento' | 'Pendente';
  dataAtualizacao?: string;
  observacao?: string;
}

export interface BloqueioMeta {
  origem: string;
  marca: string;
  statusCampanha: string;
  volume: number;
}

export interface BloqueioFunil {
  marca: string;
  origem: string;
  observacao: string;
  volume: number;
}

export interface FilterState {
  cd: string;            // 'TODOS' | 'Jundiai' | 'Itaitinga' | 'Sao Jose'
  marca: string;         // 'TODAS' | 'SAS' | 'SAE' | 'IS'
  rota: string;          // 'TODAS' | string
  tipoPedido: string;    // 'TODOS' | string (Implantação, Complementar, etc.)
  colunaL: string;       // 'TODOS' | 'APENAS_LV' | '1' | '2' | '3' | '4' | 'SEM_LV'
  apenasRoteirizados: boolean; // true para filtrar apenas Coluna Y ≠ vazio e ≠ 0
  statusLinha: string;   // 'TODOS' | string
  searchQuery: string;
}

export type TabType = 'planejamento' | 'linha_vermelha' | 'bloqueios' | 'tabela';
