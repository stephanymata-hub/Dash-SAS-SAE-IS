import * as XLSX from 'xlsx';

const PUBLISHED_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4YdxZtZpInztq2MHa5PGbD7R-kDim-HHLAGiaHCUm2kmDFxFP0VP52Sa2VFaDnLkqs8S__USeMVGk/pub';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const upstream = await fetch(`${PUBLISHED_SHEET_URL}?output=xlsx`, {
      headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      signal: AbortSignal.timeout(25000),
    });

    if (!upstream.ok) {
      throw new Error(`Google Sheets respondeu HTTP ${upstream.status}.`);
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error('O Google Sheets retornou HTML em vez do arquivo XLSX publicado. Verifique se a planilha inteira está publicada na web.');
    }

    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength < 100 || bytes.byteLength > 40 * 1024 * 1024) {
      throw new Error('Tamanho inesperado na resposta publicada do Google Sheets.');
    }

    const workbook = XLSX.read(new Uint8Array(bytes), { type: 'array', cellDates: true });
    const allNames = workbook.SheetNames;
    const allRequested = String(req.query?.all || '') === '1';
    const requestedNames = String(req.query?.sheets || 'Planejamento,Report Backlog')
      .split(',')
      .map((name: string) => name.trim())
      .filter(Boolean);

    const selectedNames = allRequested
      ? allNames
      : requestedNames.filter((name: string) => allNames.includes(name));

    const sheets: Record<string, unknown[][]> = {};
    for (const name of selectedNames) {
      const worksheet = workbook.Sheets[name];
      sheets[name] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: false,
        blankrows: false,
      }) as unknown[][];
    }

    if (!allRequested && selectedNames.length !== requestedNames.length) {
      const missing = requestedNames.filter((name: string) => !allNames.includes(name));
      throw new Error(`Abas não encontradas na publicação: ${missing.join(', ')}.`);
    }

    return res.status(200).json({
      source: 'google-sheets-published-workbook',
      fetchedAt: new Date().toISOString(),
      availableSheets: allNames,
      sheets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha desconhecida ao consultar o Google Sheets.';
    console.error('[sheets-api]', message);
    return res.status(502).json({
      error: 'Não foi possível atualizar os dados diretamente do Google Sheets.',
      details: message,
    });
  }
}
