import type { WorkerRole } from '@thaiakha/shared/types/workers.types';

export interface Person {
    id: string;
    name: string;
    avatarUrl: string | null;
    displayOrder: number;
    primaryRole: WorkerRole | 'unassigned';
    roles: WorkerRole[];
}

/** La riga del mese. net_amount e' GENERATA dal DB: si legge, non si scrive. */
export interface SalaryRow {
    id: string;
    employee_id: string;
    base_amount: number;
    overtime_amount: number;
    ssf_amount: number;
    other_deduction: number;
    net_amount: number | null;
    pay_method: string;
    status: string;
    zoho_expense_id: string | null;
}

/** Quello che il manager sta digitando (stringhe: gli input number restano controllati). */
export interface Draft {
    base: string;
    overtime: string;
    ssf: string;
    deduction: string;
    method: 'bank' | 'cash';
}

export interface AuthorRow {
    id: string; name: string; display_order: number | null;
    worker_roles: { role: string; is_primary: boolean }[] | null;
    avatar: { image_url: string | null } | { image_url: string | null }[] | null;
}

export const EMPTY_DRAFT: Draft = { base: '', overtime: '', ssf: '', deduction: '', method: 'bank' };

/** Ordine dei gruppi (cappello primario). Driver in fondo: non hanno base mensile. */
export const GROUP_ORDER: Array<WorkerRole | 'unassigned'> =
    ['teacher', 'helper', 'extra', 'setup', 'logistics', 'manager', 'admin', 'driver', 'unassigned'];

export const num = (v: string | number | null | undefined): number => Number(v ?? 0) || 0;

/** Stessa formula della colonna generata net_amount: base + OT + SSF - trattenute. */
export const netOfDraft = (d: Draft | undefined): number =>
    d ? num(d.base) + num(d.overtime) + num(d.ssf) - num(d.deduction) : 0;

export const thisMonth = (): string => new Date().toISOString().slice(0, 7);
