'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm button in red for destructive actions (default: true) */
  destructive?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose(false);
          }}
        >
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl p-5">
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                  state.destructive === false
                    ? 'bg-accent-soft text-accent'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                }`}
              >
                <AlertTriangle size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 id="confirm-dialog-title" className="text-sm font-semibold text-gray-900 dark:text-white">
                  {state.title || 'Are you sure?'}
                </h2>
                {state.description && (
                  <p id="confirm-dialog-description" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {state.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => handleClose(false)}
                className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              >
                {state.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md text-white ${
                  state.destructive === false
                    ? 'bg-accent bg-accent-hover'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {state.confirmLabel || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

/** Returns a function you can `await` in place of window.confirm(). */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
}