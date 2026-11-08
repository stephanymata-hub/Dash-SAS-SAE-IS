import * as XLSX from 'xlsx';
import { PlanningRow } from '../types';

/**
 * Converts Excel column string to 0-based index.
 * E.g., 'A' -> 0, 'E' -> 4, 'F' -> 5, 'Y' -> 24, 'AK' -> 36, 'BG' -> 58
 */
export function colLetterToIndex(col: string): number {
  const upper = col.trim().toUpperCase();
  let index = 0;
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

/**
 * Normalizes text for header detection
 */
function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Normalizes CD / Origem names
 */
export function normalizeCD(cdRaw: string): string {
  const norm = normalizeStr(cdRaw);
  if (norm.includes('jundiai') || norm.includes('sp')) return 'Jundiai';
  if (norm.includes('itaitinga') || norm.includes('ce') || norm.includes('fortaleza')) return 'Itaitinga';
  if (norm.includes('jose') || norm.includes('curitiba') || norm.includes('pr') || norm.includes('sc')) return 'Sao Jose';
  return cdRaw.trim() || 'Indefinido';
}

/**
 * Normalizes Marca (SAS, SAE, IS)
 */
export function normalizeMarca(marcaRaw: string): string {
  const norm = normalizeStr(marcaRaw);
  if (norm === 'sas' || norm.includes('sas')) return 'SAS';
  if (norm === 'sae' || norm.includes('sae')) return 'SAE';
  if (norm === 'is' || norm.includes('internat') || norm.includes('is ')) return 'IS';
  return marcaRaw.trim() || 'Geral';
}

/**
 * Safely parses numbers from Brazilian or standard formats:
 * "48.500", "48,500", "48500", "1.234,56", "75%"
 */
export function parseNumeric(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  
  let str = String(val).trim().replace(/%/g, '');
  
  // If format is 1.234,56
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    // Check if comma is decimal or thousands
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length >= 1) {
      str = str.replace(',', ''); // thousands separator
    } else {
      str = str.replace(',', '.'); // decimal
    }
  } else if (str.includes('.')) {
    // Check if dot is thousands: "48.500"
    const parts = str.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      str = str.replace('.', '');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Parses percentage value: handles 0.85 -> 85%, 85 -> 85%, "85%" -> 85%
 */
export function parsePercentage(val: unknown): number {
  const num = parseNumeric(val);
  if (num > 0 && num <= 1) {
    // E.g. 0.85 formatted as decimal in Excel
    return Math.round(num * 100);
  }
  return Math.min(100, Math.max(0, Math.round(num)));
}

/**
 * Determines status based on % pronto / linha vermelha
 */
export function calculateStatus(percentual: number): 'Concluído' | 'Linha Vermelha Ativa' | 'Em Andamento' | 'Pendente' {
  if (percentual >= 100) return 'Concluído';
  if (percentual >= 70) return 'Linha Vermelha Ativa';
  if (percentual > 0) return 'Em Andamento';
  return 'Pendente';
}

export interface ParseResult {
  data: PlanningRow[];
  totalRows: number;
  warnings: string[];
  detectedColumns: {
    origemCol: string;
    marcaCol: string;
    rotaCol: string;
    volumetriaCol: string;
    percentualCol: string;
  };
}

/**
 * Main parser that parses a raw 2D array of rows into PlanningRow[]
 */
export function parsePlanningRows(rawRows: unknown[][]): ParseResult {
  const warnings: string[] = [];
  if (!rawRows || rawRows.length === 0) {
    return {
      data: [],
      totalRows: 0,
      warnings: ['Nenhuma linha encontrada no arquivo.'],
      detectedColumns: { origemCol: 'E', marcaCol: 'F', rotaCol: 'Y', volumetriaCol: 'AK', percentualCol: 'BG' }
    };
  }

  // Indices based on the user's explicit column specification:
  // Coluna E -> index 4
  // Coluna F -> index 5
  // Coluna L -> index 11 (Linha Vermelha: 1, 2, 3 ou 4)
  // Coluna Y -> index 24
  // Coluna AK -> index 36
  // Coluna BG -> index 58
  // Locate the actual header row and map fields by the published sheet's column names.
  let headerRowIndex = rawRows.findIndex((row) =>
    Array.isArray(row) && row.some((cell) => normalizeStr(String(cell ?? '')) === 'status_plan')
      && row.some((cell) => normalizeStr(String(cell ?? '')).includes('ordem venda'))
  );
  if (headerRowIndex < 0) {
    headerRowIndex = rawRows.findIndex((row) =>
      Array.isArray(row) && row.some((cell) => normalizeStr(String(cell ?? '')).includes('origem'))
        && row.some((cell) => normalizeStr(String(cell ?? '')).includes('marca'))
    );
  }

  let origemIdx = 4;
  let marcaIdx = 5;
  let colunaLIdx = 11;
  let tipoPedidoIdx = 10;
  let rotaIdx = 24;
  let volumetriaIdx = 36;
  let percentualIdx = 58;
  let pedidoIdx = 1;
  let observacaoIdx = 25;

  if (headerRowIndex >= 0) {
    const headers = rawRows[headerRowIndex].map((cell) => normalizeStr(String(cell ?? '')));
    const findHeader = (predicate: (value: string) => boolean, fallback: number) => {
      const index = headers.findIndex(predicate);
      return index >= 0 ? index : fallback;
    };
    origemIdx = findHeader((value) => value === 'origem' || value === 'cd/origem', origemIdx);
    marcaIdx = findHeader((value) => value === 'marca', marcaIdx);
    colunaLIdx = findHeader((value) => value === 'linha vermelha' || value === 'l', colunaLIdx);
    tipoPedidoIdx = findHeader((value) => value === 'tipo_pedido' || value === 'tipo pedido', tipoPedidoIdx);
    rotaIdx = findHeader((value) => value === 'rota', rotaIdx);
    volumetriaIdx = findHeader((value) => value === 'volume' || value === 'volumetria', volumetriaIdx);
    percentualIdx = findHeader((value) => value.includes('% linha vermelha'), percentualIdx);
    pedidoIdx = findHeader((value) => value === 'ordem venda' || value === 'pedido', pedidoIdx);
    observacaoIdx = findHeader((value) => value === 'observacao' || value === 'observação', observacaoIdx);
  }

  const startRow = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
  const parsedRows: PlanningRow[] = [];

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    const cdVal = row[origemIdx] !== undefined ? String(row[origemIdx]).trim() : '';
    const marcaVal = row[marcaIdx] !== undefined ? String(row[marcaIdx]).trim() : '';
    const rotaVal = row[rotaIdx] !== undefined ? String(row[rotaIdx]).trim() : '';
    const lVal = row[colunaLIdx];
    const tipoVal = tipoPedidoIdx >= 0 && row[tipoPedidoIdx] !== undefined ? String(row[tipoPedidoIdx]).trim() : '';
    const volVal = row[volumetriaIdx];
    const percVal = row[percentualIdx];

    // Skip empty or total rows
    if (!cdVal && !marcaVal && !rotaVal) continue;
    if (normalizeStr(cdVal).includes('total') || normalizeStr(marcaVal).includes('total')) continue;

    const volumetria = parseNumeric(volVal);
    const percentualLinhaVermelha = parsePercentage(percVal);
    const volumeLinhaVermelhaPronto = Math.round(volumetria * (percentualLinhaVermelha / 100));
    const status = calculateStatus(percentualLinhaVermelha);

    const cd = normalizeCD(cdVal);
    const marca = normalizeMarca(marcaVal);
    const tipoPedido = tipoVal || 'Implantação';

    // Regra da usuária: "eu só considero linha vermelha, o que é 1,2,3, OU 4 na coluna L"
    const rawLStr = lVal !== undefined && lVal !== null ? String(lVal).trim() : '';
    const parsedLNum = parseInt(rawLStr.replace(/\D/g, ''), 10);
    const isLinhaVermelha = parsedLNum === 1 || parsedLNum === 2 || parsedLNum === 3 || parsedLNum === 4;
    const colunaL = isLinhaVermelha ? parsedLNum : null;

    // Regra da usuária: "rotas que não são vazio ou zero"
    const rotaClean = rotaVal.trim();
    const isRoteirizado = Boolean(
      rotaClean &&
      rotaClean !== '0' &&
      rotaClean !== '-' &&
      !normalizeStr(rotaClean).includes('sem rota') &&
      !normalizeStr(rotaClean).includes('nao')
    );

    const rota = isRoteirizado
      ? (rotaClean.toLowerCase().startsWith('rota') ? rotaClean : `Rota ${rotaClean}`)
      : 'Sem Rota (0)';

    parsedRows.push({
      id: `row-${r}-${Date.now()}`,
      pedido: row[pedidoIdx] !== undefined && row[pedidoIdx] !== null ? String(row[pedidoIdx]).trim() : `PED-${r + 1000}`,
      tipoPedido,
      cd,
      marca,
      colunaL,
      isLinhaVermelha,
      rota,
      isRoteirizado,
      volumetria,
      percentualLinhaVermelha,
      volumeLinhaVermelhaPronto,
      status,
      observacao: (observacaoIdx >= 0 && row[observacaoIdx] ? String(row[observacaoIdx]).trim() : '') || (isLinhaVermelha
        ? `Linha Vermelha ${colunaL} (Coluna L) · ${percentualLinhaVermelha}% pronto`
        : isRoteirizado
        ? 'Roteirizado (Sem Linha Vermelha na Coluna L)'
        : 'Coluna Y vazia ou 0 - a roteirizar')
    });
  }

  return {
    data: parsedRows,
    totalRows: parsedRows.length,
    warnings,
    detectedColumns: {
      origemCol: `Col ${origemIdx + 1}`,
      marcaCol: `Col ${marcaIdx + 1}`,
      rotaCol: `Col ${rotaIdx + 1}`,
      volumetriaCol: `Col ${volumetriaIdx + 1}`,
      percentualCol: `Col ${percentualIdx + 1}`
    }
  };
}

/**
 * Parses binary or text file buffer (CSV, TSV, XLSX)
 */
export async function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        
        // Prefer sheet named "Planejamento" if exists, otherwise first sheet
        let targetSheetName = workbook.SheetNames[0];
        for (const name of workbook.SheetNames) {
          if (normalizeStr(name).includes('planejamento')) {
            targetSheetName = name;
            break;
          }
        }

        const worksheet = workbook.Sheets[targetSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        const result = parsePlanningRows(rawRows);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/**
 * Parses raw text copied and pasted from Google Sheets or Excel
 */
export function parsePastedText(text: string): ParseResult {
  const lines = text.trim().split(/\r\n|\n|\r/);
  const rawRows: string[][] = lines.map(line => {
    // Check whether tab or comma or semicolon separated
    if (line.includes('\t')) return line.split('\t');
    if (line.includes(';')) return line.split(';');
    return line.split(',');
  });

  return parsePlanningRows(rawRows);
}
