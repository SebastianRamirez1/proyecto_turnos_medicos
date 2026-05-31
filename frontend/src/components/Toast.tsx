import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3
                 bg-carbon-gray-90 text-white px-4 py-3
                 border-l-4 border-carbon-green-50 shadow-lg"
    >
      <CheckCircle size={16} className="shrink-0 text-carbon-green-50" aria-hidden="true" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
