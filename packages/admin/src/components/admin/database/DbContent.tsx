import React from 'react';
import { Table as TableIcon } from 'lucide-react';
import {
    DataExplorerContent,
    GridCard,
    DataExplorerRow,
    DataCardContent,
    DataRowText,
    DataTableHead,
    HeaderCell,
    SelectCell,
    CardGrid,
    getExplorerRowId,
} from '../../../components/data-explorer';
import { Table, TableBody, TableCell } from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import { cn } from '@thaiakha/shared/lib/utils';
import type { DataRow } from '../../../components/data-explorer/GridCard';
import { GRID_PRIMARY_FIELDS } from '../../../hooks/useAdminDatabase';

interface DbContentProps {
    loading: boolean;
    viewMode: 'table' | 'grid';
    selectedTable: string;
    filteredData: DataRow[];
    selectedRow: DataRow | null;
    onRowSelect: (row: DataRow) => void;
    columns: string[];
    selectedIds: Set<string>;
    onToggleSelectAll: () => void;
    onToggleSelectRow: (row: DataRow) => void;
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
    const renderGridCardFields = (item: DataRow) => {
        const config = GRID_PRIMARY_FIELDS[selectedTable];
        const titleField = config?.title || columns[0] || 'id';
        const subtitleField = config?.subtitle || columns[1];
        const badgeField = config?.badge;

        return (
            <DataCardContent
                title={String(item[titleField] ?? '—')}
                subtitle={subtitleField ? String(item[subtitleField] ?? '') : undefined}
                badges={badgeField && item[badgeField] != null ? (
                    <Badge color="light" size="sm" className="text-xs font-bold tracking-widest uppercase">
                        {String(item[badgeField])}
                    </Badge>
                ) : undefined}
                footerLeft={
                    <p className="text-xs font-mono font-bold text-sub uppercase tracking-tighter">
                        VAL: {String(item[columns[2]] || '—').substring(0, 10)}
                    </p>
                }
            />
        );
    };

    const selectedRowId = selectedRow ? getExplorerRowId(selectedRow) : null;

    return (
        <DataExplorerContent
            loading={loading}
            emptyIcon={<TableIcon className="w-12 h-12" />}
            emptyMessage={`No data found in ${selectedTable}`}
            isEmpty={filteredData.length === 0}
        >
            {viewMode === 'table' && (
                <Table className="text-xs whitespace-nowrap">
                    <DataTableHead>
                        <HeaderCell
                            width="w-10"
                            selectAll={{
                                checked: selectedIds.size === filteredData.length && filteredData.length > 0,
                                onToggle: onToggleSelectAll,
                            }}
                        />
                        {columns.map(col => (
                            <HeaderCell key={col} label={col} align="left" />
                        ))}
                    </DataTableHead>
                    <TableBody>
                        {filteredData.map((row, idx) => {
                            const currentRowId = getExplorerRowId(row);
                            const isRowSelected = currentRowId === selectedRowId;

                            return (
                                <DataExplorerRow
                                    key={idx}
                                    idx={idx}
                                    selected={isRowSelected}
                                    onClick={() => onRowSelect(row)}
                                    className={cn(selectedIds.has(currentRowId) && "!bg-primary-500/5")}
                                >
                                    <SelectCell
                                        className="px-4 w-10"
                                        checked={selectedIds.has(currentRowId)}
                                        onToggle={() => onToggleSelectRow(row)}
                                    />
                                    {columns.map(col => (
                                        <TableCell key={col} className="px-4 py-3 font-bold text-body max-w-[250px] truncate text-xs tracking-tight">
                                            <DataRowText
                                                title={
                                                    row[col] === null ? undefined :
                                                        typeof row[col] === 'boolean' ? undefined :
                                                            JSON.stringify(row[col]).replace(/^"|"$/g, '')
                                                }
                                                description={
                                                    row[col] === null ? (
                                                        <span className="text-muted italic">null</span>
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

            {viewMode === 'grid' && (
                <CardGrid>
                    {filteredData.map((row, idx) => {
                        const currentRowId = getExplorerRowId(row);
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
                </CardGrid>
            )}
        </DataExplorerContent>
    );
};

export default DbContent;
