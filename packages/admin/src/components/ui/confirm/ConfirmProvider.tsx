import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal } from '../modal';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@thaiakha/shared/lib/utils';

/**
 * App-wide confirmation dialog. Use `useConfirm()` to get a promise-based
 * `confirm(opts)` and await the user's choice before a destructive action.
 * Without a mounted <ConfirmProvider> it falls back to window.confirm.
 */
export interface ConfirmOptions {
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'danger' | 'default';
}

type ConfirmFn = (opts?: ConfirmOptions) => Promise<boolean>;

const fallback: ConfirmFn = (opts) => Promise.resolve(window.confirm(opts?.message || 'Are you sure?'));
const ConfirmContext = createContext<ConfirmFn>(fallback);

export const useConfirm = (): ConfirmFn => useContext(ConfirmContext);

interface PendingState extends ConfirmOptions { resolve: (v: boolean) => void; }

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pending, setPending] = useState<PendingState | null>(null);

    const confirm = useCallback<ConfirmFn>((opts) => new Promise<boolean>((resolve) => {
        setPending({ ...opts, resolve });
    }), []);

    const close = (result: boolean) => {
        pending?.resolve(result);
        setPending(null);
    };

    const danger = pending?.tone !== 'default';

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Modal isOpen={!!pending} onClose={() => close(false)} showCloseButton={false} className="max-w-sm p-6">
                <div className="text-center">
                    <div className={cn('mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl', danger ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400')}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pending?.title ?? 'Confirm'}</h3>
                    {pending?.message && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{pending.message}</p>}
                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => close(false)}
                            className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                        >
                            {pending?.cancelLabel ?? 'Cancel'}
                        </button>
                        <button
                            type="button"
                            onClick={() => close(true)}
                            className={cn(
                                'flex-1 h-11 rounded-xl text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2',
                                danger ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500' : 'bg-primary-600 hover:bg-primary-700 focus-visible:ring-primary-500',
                            )}
                        >
                            {pending?.confirmLabel ?? 'Confirm'}
                        </button>
                    </div>
                </div>
            </Modal>
        </ConfirmContext.Provider>
    );
};

export default ConfirmProvider;
