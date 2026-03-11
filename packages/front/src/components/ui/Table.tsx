import React from 'react';
import { cn } from '../../lib/utils';
import { Icon, Typography } from './index';

// 1. DEFINIZIONE INTERFACCE
export interface Column<T = any> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
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
export function Table<T extends Record<string, any>>({
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
        <div className="h-12 bg-black/5 dark:bg-white/5 animate-pulse mb-1" />
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
      <div className={cn("flex flex-col items-center justify-center p-12 text-desc border border-dashed border-border rounded-2xl bg-black/5 dark:bg-white/5", className)}>
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
          <tr className="bg-black/5 dark:bg-white/5 border-b border-border">
            {columns.map((col) => (
              <th 
                key={col.key} 
                className={cn(
                  "px-6 py-4 text-xs font-black uppercase tracking-widest text-desc select-none",
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
                onRowClick && hoverable ? "cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" : ""
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
                    {col.render ? col.render(val, row) : (val || '-')}
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

