import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Stethoscope, Users } from 'lucide-react';
import { medicosApi, pacientesApi, turnosApi } from '../api';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';
import type { Medico, Paciente, Turno } from '../types';

interface Stats {
  pacientes: number;
  medicos: number;
  turnosHoy: number;
  turnosConfirmados: number;
}

const STAT_ITEMS = [
  { key: 'pacientes'         as const, label: 'Pacientes',       icon: Users,       accent: 'bg-carbon-blue-60'  },
  { key: 'medicos'           as const, label: 'Médicos activos',  icon: Stethoscope, accent: 'bg-carbon-gray-80'  },
  { key: 'turnosHoy'         as const, label: 'Turnos hoy',       icon: Calendar,    accent: 'bg-[#6929c4]'       },
  { key: 'turnosConfirmados' as const, label: 'Confirmados hoy',  icon: CheckCircle, accent: 'bg-carbon-green-50' },
];

function StatCard({
  label, value, icon: Icon, accent,
}: { label: string; value: number; icon: React.ElementType; accent: string }) {
  return (
    <div className="ds-card flex flex-col gap-6 p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs text-carbon-gray-70">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center ${accent}`}>
          <Icon size={16} className="text-white" aria-hidden="true" />
        </div>
      </div>
      <p className="text-4xl font-light tabular-nums text-carbon-gray-100">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [stats,     setStats]     = useState<Stats>({
    pacientes: 0, medicos: 0, turnosHoy: 0, turnosConfirmados: 0,
  });
  const [turnosHoy, setTurnosHoy] = useState<Turno[]>([]);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    Promise.all([pacientesApi.listar(), medicosApi.listar()])
      .then(async ([pacientes, medicos]: [Paciente[], Medico[]]) => {
        const agendas = await Promise.all(
          medicos.map((m) =>
            turnosApi.agenda(m.id, `${hoy}T00:00:00`, `${hoy}T23:59:59`).catch(() => [] as Turno[]),
          ),
        );
        const turnos = agendas.flat().sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
        setStats({
          pacientes:         pacientes.length,
          medicos:           medicos.length,
          turnosHoy:         turnos.length,
          turnosConfirmados: turnos.filter((t) => t.estado === 'CONFIRMADO').length,
        });
        setTurnosHoy(turnos.slice(0, 6));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard'),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="ds-page-title">Dashboard</h1>
        <p className="ds-page-subtitle">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {error && <p role="alert" className="ds-alert-error">{error}</p>}

      {/* Data tiles — separados por gap gris (Carbon data table style) */}
      <div className="grid gap-px bg-carbon-gray-20 border border-carbon-gray-20 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_ITEMS.map(({ key, label, icon, accent }) => (
          <StatCard key={key} label={label} value={stats[key]} icon={icon} accent={accent} />
        ))}
      </div>

      {/* Agenda */}
      <section className="ds-card overflow-hidden">
        <div className="ds-card-header">
          <Calendar size={16} className="text-carbon-gray-70" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-carbon-gray-100">Agenda de hoy</h2>
        </div>

        {turnosHoy.length === 0 ? (
          <div className="ds-empty">
            <Calendar size={28} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
            <p>No hay turnos programados para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-carbon-gray-20">
            {turnosHoy.map((turno) => (
              <div key={turno.id} className="ds-card-row">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="w-16 shrink-0">
                    <p className="text-sm font-semibold tabular-nums text-carbon-gray-100">
                      {new Date(turno.fechaHora).toLocaleTimeString('es-CO', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-carbon-gray-50">{turno.duracionMinutos} min</p>
                  </div>
                  <div className="h-8 w-px bg-carbon-gray-20" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-carbon-gray-100">{turno.pacienteNombre}</p>
                    <p className="truncate text-xs text-carbon-gray-70">
                      {turno.medicoNombre} — {turno.especialidad}
                    </p>
                  </div>
                </div>
                <Badge estado={turno.estado} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
