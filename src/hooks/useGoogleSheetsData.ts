import { useCallback, useEffect, useRef, useState } from 'react';
import { parsePlanningRows, parseNumeric, normalizeCD, normalizeMarca } from '../utils/sheetParser';
import { BloqueioFunil, BloqueioMeta, PlanningRow } from '../types';

const REFRESH_INTERVAL_MS = 60_000;
const SHEET_NAMES = ['Planejamento', 'Report Backlog'];

interface SheetsResponse {
  availableSheets: string[];
  sheets: Record<string, unknown[][]>;
  fetchedAt: string;
  error?: string;
  details?: string;
}

interface DashboardData {
  planningData: PlanningRow[];
  metaData: BloqueioMeta[];
  funilData: BloqueioFunil[];
}

function normalizeOrigin(value: unknown): string {
  const raw = String(value ?? '').trim();
  const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized === 'cita' || normalized.includes('itaitinga')) return 'Itaitinga';
  if (normalized === 'cjun' || normalized.includes('jundiai')) return 'Jundiai';
  if (normalized.includes('sao jose') || normalized === 'csc') return 'Sao Jose';
  return normalizeCD(raw);
}

function normalizeSector(value: unknown): string {
  const raw = String(value ?? '').trim();
  const normalized = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (normalized.includes('international school')) return 'IS';
  if (normalized.includes('sae')) return 'SAE';
  if (normalized.includes('sas')) return 'SAS';
  return normalizeMarca(raw);
}

function mapReportBacklog(rows: unknown[][]): Pick<DashboardData, 'metaData' | 'funilData'> {
  const metaData: BloqueioMeta[] = [];
  const funilData: BloqueioFunil[] = [];

  // A:D = backlog por centro/setor/status; G:J = backlog detalhado por origem/marca/motivo.
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index] || [];
    const origin = row[0];
    const sector = row[1];
    const status = row[2];
    if (origin && sector && status && String(status).toLowerCase() !== 'status pedido') {
      metaData.push({
        origem: normalizeOrigin(origin),
        marca: normalizeSector(sector),
        statusCampanha: String(status).trim(),
        volume: parseNumeric(row[3]),
      });
    }
  }

  for (let index = 2; index < rows.length; index += 1) {
    const row = rows[index] || [];
    const origin = row[6];
    const brand = row[7];
    const reason = row[8];
    if (origin && brand && reason) {
      funilData.push({
        origem: normalizeOrigin(origin),
        marca: normalizeMarca(String(brand)),
        observacao: String(reason).trim(),
        volume: parseNumeric(row[9]),
      });
    }
  }

  return { metaData, funilData };
}

function mapSheetsToDashboard(response: SheetsResponse): DashboardData {
  const planningRows = response.sheets['Planejamento'];
  const reportRows = response.sheets['Report Backlog'];
  if (!planningRows?.length) throw new Error('A aba Planejamento não retornou linhas.');
  if (!reportRows?.length) throw new Error('A aba Report Backlog não retornou linhas.');

  const parsed = parsePlanningRows(planningRows);
  if (parsed.data.length === 0) {
    throw new Error('Nenhum registro válido foi encontrado na aba Planejamento. Confira os cabeçalhos e os dados publicados.');
  }

  return {
    planningData: parsed.data,
    ...mapReportBacklog(reportRows),
  };
}

export function useGoogleSheetsData() {
  const [data, setData] = useState<DashboardData>({
    planningData: [],
    metaData: [],
    funilData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const requestInProgress = useRef(false);

  const refresh = useCallback(async () => {
    if (requestInProgress.current) return;
    requestInProgress.current = true;
    setLoading(true);

    try {
      const query = encodeURIComponent(SHEET_NAMES.join(','));
      const response = await fetch(`/api/sheets?sheets=${query}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      const payload = (await response.json()) as SheetsResponse;

      if (!response.ok) {
        throw new Error(payload.details || payload.error || `Falha HTTP ${response.status}`);
      }

      const nextData = mapSheetsToDashboard(payload);
      setData(nextData);
      setAvailableSheets(payload.availableSheets || []);
      setUpdatedAt(payload.fetchedAt || new Date().toISOString());
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Falha ao consultar o Google Sheets.');
    } finally {
      setLoading(false);
      requestInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [refresh]);

  return {
    ...data,
    loading,
    error,
    updatedAt,
    availableSheets,
    refresh,
    hasData: data.planningData.length > 0,
  };
}
