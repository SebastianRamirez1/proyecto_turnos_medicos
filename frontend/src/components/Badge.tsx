import type { EstadoTurno } from '../types';

/* Carbon Design System — Tags
   Sin border-radius (inline), tipografía 12px, colores semánticos */
const configs: Record<EstadoTurno, { label: string; className: string }> = {
  PENDIENTE:  {
    label: 'Pendiente',
    className: 'bg-carbon-yellow-10 text-carbon-gray-100 border border-carbon-yellow-40',
  },
  CONFIRMADO: {
    label: 'Confirmado',
    className: 'bg-carbon-blue-10 text-carbon-blue-60 border border-carbon-blue-60',
  },
  COMPLETADO: {
    label: 'Completado',
    className: 'bg-carbon-green-10 text-carbon-green-50 border border-carbon-green-50',
  },
  CANCELADO:  {
    label: 'Cancelado',
    className: 'bg-carbon-red-10 text-carbon-red-60 border border-carbon-red-60',
  },
  AUSENTE:    {
    label: 'Ausente',
    className: 'bg-carbon-gray-10 text-carbon-gray-70 border border-carbon-gray-30',
  },
};

export default function Badge({ estado }: { estado: EstadoTurno }) {
  const { label, className } = configs[estado] ?? configs.PENDIENTE;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
