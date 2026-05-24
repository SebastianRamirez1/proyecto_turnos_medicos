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

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon size={22} className="text-white" aria-hidden="true" />
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Stats>({
    pacientes: 0,
    medicos: 0,
    turnosHoy: 0,
    turnosConfirmados: 0,
  });
  const [turnosHoy, setTurnosHoy] = useState<Turno[]>([]);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);

    Promise.all([pacientesApi.listar(), medicosApi.listar()])
      .then(async ([pacientes, medicos]: [Paciente[], Medico[]]) => {
        const agendas = await Promise.all(
          medicos.map((medico) =>
            turnosApi.agenda(medico.id, `${hoy}T00:00:00`, `${hoy}T23:59:59`).catch(() => [] as Turno[]),
          ),
        );
        const turnos = agendas.flat().sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

        setStats({
          pacientes: pacientes.length,
          medicos: medicos.length,
          turnosHoy: turnos.length,
          turnosConfirmados: turnos.filter((turno) => turno.estado === 'CONFIRMADO').length,
        });
        setTurnosHoy(turnos.slice(0, 6));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudo cargar el dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pacientes" value={stats.pacientes} icon={Users} color="bg-blue-500" />
        <StatCard label="Medicos activos" value={stats.medicos} icon={Stethoscope} color="bg-violet-500" />
        <StatCard label="Turnos hoy" value={stats.turnosHoy} icon={Calendar} color="bg-amber-500" />
        <StatCard label="Confirmados hoy" value={stats.turnosConfirmados} icon={CheckCircle} color="bg-emerald-500" />
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Agenda de hoy</h2>
        </div>
        {turnosHoy.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Calendar size={32} className="mx-auto mb-3 opacity-40" />
            <p>No hay turnos programados para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {turnosHoy.map((turno) => (
              <div key={turno.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(turno.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-400">{turno.duracionMinutos} min</p>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{turno.pacienteNombre}</p>
                    <p className="truncate text-xs text-slate-500">
                      {turno.medicoNombre} - {turno.especialidad}
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
