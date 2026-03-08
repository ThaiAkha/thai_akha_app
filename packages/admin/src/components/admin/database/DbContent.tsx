import React from 'react';
import { Table as TableIcon } from 'lucide-react';
import { DataExplorerContent, GridCard, DataExplorerRow, DataCardContent, DataRowText } from '../../../components/data-explorer';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import Checkbox from '../../../components/form/input/Checkbox';
import { cn } from '../../../lib/utils';
import { GRID_PRIMARY_FIELDS } from '../../../hooks/useAdminDatabase';

interface DbContentProps {
    loading: boolean;
    viewMode: 'table' | 'grid';
    selectedTable: string;
    filteredData: any[];
    selectedRow: any | null;
    onRowSelect: (row: any) => void;
    columns: string[];
    selectedIds: Set<string>;
    onToggleSelectAll: () => void;
    onToggleSelectRow: (row: any) => void;
}

const DbContent: React.FC<DbContentProps> = ({
    loading,
    viewMode,
    selectedTable,
    filteredData,
    selectedRow,
    onRowSelect,
    columns,
    selectedIds,
    onToggleSelectAll,
    onToggleSelectRow
}) => {
    // Grid Card field logic derived from hook config
    const renderGridCardFields = (item: Record<string, any>) => {
        const config = GRID_PRIMARY_FIELDS[selectedTable];
        const titleField = config?.title || columns[0] || 'id';
        const subtitleField = config?.subtitle || columns[1];
        const badgeField = config?.badge;

        return (
            <DataCardContent
                title={String(item[titleField] ?? '—')}
                subtitle={subtitleField ? String(item[subtitleField] ?? '') : undefined}
                badges={badgeField && item[badgeField] != null ? (
                    <Badge color="light" size="sm" className="text-[9px] font-bold tracking-widest uppercase">
                        {String(item[badgeField])}
                    </Badge>
                ) : undefined}
                footerLeft={
                    <p className="text-[10px] font-mono font-bold text-gray-300 uppercase tracking-tighter">
                        VAL: {String(item[columns[2]] || '—').substring(0, 10)}
                    </p>
                }
            />
        );
    };

    const getRowId = (r: any) => String(r.id ?? r.internal_id ?? JSON.stringify(r));
    const selectedRowId = selectedRow ? getRowId(selectedRow) : null;

    return (
        <DataExplorerContent
            loading={loading}
            emptyIcon={<TableIcon className="w-12 h-12" />}
            emptyMessage={`No data found in ${selectedTable}`}
        >
            {filteredData.length > 0 && viewMode === 'table' && (
                <Table className="text-xs whitespace-nowrap">
                    <TableHeader className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                        <TableRow>
                            <TableCell isHeader className="px-4 py-3 w-10">
                                <Checkbox
                                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                                    onChange={onToggleSelectAll}
                                />
                            </TableCell>
                            {columns.map(col => (
                                <TableCell key={col} isHeader className="px-4 py-3 text-left font-black uppercase tracking-widest text-gray-500 text-[10px]">
                                    {col}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((row, idx) => {
                            const currentRowId = getRowId(row);
                            const isRowSelected = currentRowId === selectedRowId;

                            return (
                                <DataExplorerRow
                                    key={idx}
                                    idx={idx}
                                    selected={isRowSelected}
                                    onClick={() => onRowSelect(row)}
                                    className={cn(selectedIds.has(currentRowId) && "!bg-brand-500/5")}
                                >
                                    <TableCell className="px-4 w-10" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.has(currentRowId)}
                                            onChange={() => onToggleSelectRow(row)}
                                        />
                                    </TableCell>
                                    {columns.map(col => (
                                        <TableCell key={col} className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300 max-w-[250px] truncate text-xs tracking-tight">
                                            <DataRowText
                                                title={
                                                    row[col] === null ? undefined :
                                                        typeof row[col] === 'boolean' ? undefined :
                                                            JSON.stringify(row[col]).replace(/^"|"$/g, '')
                                                }
                                                description={
                                                    row[col] === null ? (
                                                        <span className="text-gray-300 dark:text-gray-700 italic">null</span>
                                                    ) : typeof row[col] === 'boolean' ? (
                                                        <Badge color={row[col] ? 'success' : 'light'} size="sm">{row[col] ? 'TRUE' : 'FALSE'}</Badge>
                                                    ) : undefined
                                                }
                                            />
                                        </TableCell>
                                    ))}
                                </DataExplorerRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            {filteredData.length > 0 && viewMode === 'grid' && (
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filteredData.map((row, idx) => {
                            const currentRowId = getRowId(row);
                            return (
                                <GridCard
                                    key={idx}
                                    item={row}
                                    selected={currentRowId === selectedRowId}
                                    onClick={() => onRowSelect(row)}
                                    imageIcon={<TableIcon className="w-8 h-8" />}
                                    renderFields={renderGridCardFields}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </DataExplorerContent>
    );
};

export default DbContent;
