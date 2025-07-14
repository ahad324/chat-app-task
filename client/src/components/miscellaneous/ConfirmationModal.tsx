import React, { useEffect } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmButtonColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmButtonColor = 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
}) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
           window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);
    
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 transition-opacity"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="relative mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800 transition-transform"
                role="document"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start">
                    <div className="mt-0 text-left">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonColor} dark:focus:ring-offset-slate-800`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
