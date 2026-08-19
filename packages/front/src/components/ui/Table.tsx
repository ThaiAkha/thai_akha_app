import React from 'react';
import { cn } from '@thaiakha/shared/lib/utils';
import { Icon, Typography } from './index';

// 1. DEFINIZIONE INTERFACCE
export interface Column<T = Record<string, unknown>> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  keyField?: string;
  // ✅ QUESTA RIGA È FONDAMENTALE PER TOGLIERE L'ERRORE ROSSO
  isLoading?: boolean; 
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  hoverable?: boolean;
}

// 2. COMPONENTE
export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  keyField = 'id',
  isLoading = false, // ✅ Default value
  emptyMessage = 'No data available',
  className,
  onRowClick,
  hoverable = true
}: TableProps<T>) {

  // A. LOADING STATE (Skeleton)
  if (isLoading) {
    return (
      <div className={cn("w-full overflow-hidden rounded-xl bg-surface border border-border", className)}>
        {/* Fake Header */}
        <div className="h-12 bg-[var(--field-fill)] animate-pulse mb-1" />
        {/* Fake Rows */}
        {[...Array(5)].map((_, i) => (
           <div key={i} className="h-16 border-b border-border/50 animate-pulse bg-white/5 opacity-50" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    );
  }

  // B. EMPTY STATE
  if (!data || data.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-12 text-sub border border-dashed border-border rounded-2xl bg-[var(--field-fill)]", className)}>
        <Icon name="table_rows" size="xl" className="opacity-20 mb-4" />
        <Typography variant="caption" className="opacity-50">{emptyMessage}</Typography>
      </div>
    );
  }

  // C. DATA TABLE
  return (
    <div className={cn("w-full overflow-x-auto custom-scrollbar rounded-2xl border border-border bg-surface shadow-sm", className)}>
      <table className="w-full text-left border-collapse">
        
        {/* HEADER */}
        <thead>
          <tr className="bg-[var(--field-fill)] border-b border-border">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={cn(
                  "px-6 py-4 text-xs font-black uppercase tracking-widest text-sub select-none",
                  col.align === 'center' && "text-center",
                  col.align === 'right' && "text-right",
                  col.width && `w-[${col.width}]`
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="divide-y divide-border/50">
          {data.map((row, rowIndex) => (
            <tr 
              key={String(row[keyField] || rowIndex)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors duration-200",
                onRowClick && hoverable ? "cursor-pointer hover:bg-[var(--field-fill)]" : ""
              )}
            >
              {columns.map((col) => {
                const val = row[col.key];
                return (
                  <td 
                    key={`${String(row[keyField])}-${col.key}`}
                    className={cn(
                      "px-6 py-4 text-sm text-title font-medium",
                      col.align === 'center' && "text-center",
                      col.align === 'right' && "text-right"
                    )}
                  >
                    {col.render ? col.render(val, row) : ((val as React.ReactNode) || '-')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ✅ EXPORT DEFAULT FONDAMENTALE
// Questo permette l'import { Table } from '../ui' tramite il barrel file
export default Table;

