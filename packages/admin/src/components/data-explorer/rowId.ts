import type { DataRow } from './GridCard';

/**
 * Identita' di riga del data explorer: id, poi internal_id, poi la riga
 * serializzata. Era duplicata verbatim in DbContent e NewsContent.
 */
export const getExplorerRowId = (row: DataRow): string =>
    String(row.id ?? row.internal_id ?? JSON.stringify(row));
