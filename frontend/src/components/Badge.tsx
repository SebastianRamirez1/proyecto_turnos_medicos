import type { EstadoTurno } from '../types';

const configs: Record<EstadoTurno, { label: string; className: string }> = {
  PENDIENTE:  { label: 'Pendiente',  className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMADO: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800' },
  COMPLETADO: { label: 'Completado', className: 'bg-green-100 text-green-800' },
  CANCELADO:  { label: 'Cancelado',  className: 'bg-red-100 text-red-800' },
  AUSENTE:    { label: 'Ausente',    className: 'bg-slate-100 text-slate-600' },
};

export default function Badge({ estado }: { estado: EstadoTurno }) {
  const { label, className } = configs[estado] ?? configs.PENDIENTE;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
