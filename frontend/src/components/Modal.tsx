import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/* Carbon Design System — Modal
   Esquinas rectas, shadow pronunciada, fondo oscuro semitransparente */
export default function Modal({ title, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-carbon-gray-100/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container — sin border-radius */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="
          relative flex w-full max-w-lg flex-col bg-white
          shadow-[0_4px_16px_rgba(0,0,0,0.4)]
          max-h-[90vh]
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-carbon-gray-20 px-6 py-4">
          <h2
            id="modal-title"
            className="text-base font-semibold text-carbon-gray-100"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center text-carbon-gray-70 transition-colors hover:bg-carbon-gray-10"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
