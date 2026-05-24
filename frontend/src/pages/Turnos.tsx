import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock, Plus, Search, XCircle } from 'lucide-react';
import { medicosApi, pacientesApi, turnosApi } from '../api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import type { EstadoTurno, Medico, Paciente, ReservarTurnoRequest, Turno } from '../types';

const emptyForm: ReservarTurnoRequest = {
  pacienteId: '',
  medicoId: '',
  fechaHora: '',
  duracionMinutos: 30,
  motivo: '',
};

const estadosDestino: EstadoTurno[] = ['CONFIRMADO', 'COMPLETADO', 'AUSENTE', 'CANCELADO'];

function toApiDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value;
}

function todayRange() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    desde: `${today}T00:00:00`,
    hasta: `${today}T23:59:59`,
  };
}

function TurnoForm({
  pacientes,
  medicos,
  loading,
  onSubmit,
}: {
  pacientes: Paciente[];
  medicos: Medico[];
  loading: boolean;
  onSubmit: (data: ReservarTurnoRequest) => void;
}) {
  const [form, setForm] = useState<ReservarTurnoRequest>(emptyForm);
  const set = (key: keyof ReservarTurnoRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((current) => ({ ...current, [key]: key === 'duracionMinutos' ? Number(event.target.value) : event.target.value }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, fechaHora: toApiDateTime(form.fechaHora) }); }} className="space-y-4">
      <label className="block text-xs font-medium text-slate-600">
        Paciente
        <select required value={form.pacienteId} onChange={set('pacienteId')} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Seleccionar paciente...</option>
          {pacientes.map((paciente) => (
            <option key={paciente.id} value={paciente.id}>{paciente.nombreCompleto}</option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Medico
        <select required value={form.medicoId} onChange={set('medicoId')} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Seleccionar medico...</option>
          {medicos.map((medico) => (
            <option key={medico.id} value={medico.id}>{medico.nombreCompleto} - {medico.especialidad}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">
          Fecha y hora
          <input required type="datetime-local" value={form.fechaHora} onChange={set('fechaHora')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Duracion
          <select value={form.duracionMinutos} onChange={set('duracionMinutos')} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>60 minutos</option>
          </select>
        </label>
      </div>
      <label className="block text-xs font-medium text-slate-600">
        Motivo
        <textarea value={form.motivo} onChange={set('motivo')} rows={3} className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Reservando...' : 'Reservar turno'}
      </button>
    </form>
  );
}

export default function Turnos() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [selectedMedico, setSelectedMedico] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState('');

  const cargarCatalogos = () => {
    setLoading(true);
    Promise.all([pacientesApi.listar(), medicosApi.listar()])
      .then(([pacientesData, medicosData]) => {
        setPacientes(pacientesData);
        setMedicos(medicosData);
        if (medicosData.length > 0) {
          setSelectedMedico((current) => current || medicosData[0].id);
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos'))
      .finally(() => setLoading(false));
  };

  useEffect(cargarCatalogos, []);

  const cargarAgenda = () => {
    if (!selectedMedico) {
      setTurnos([]);
      return;
    }
    const { desde, hasta } = todayRange();
    setLoading(true);
    turnosApi.agenda(selectedMedico, desde, hasta)
      .then((data) => setTurnos(data.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudo cargar la agenda'))
      .finally(() => setLoading(false));
  };

  useEffect(cargarAgenda, [selectedMedico]);

  const medicoActual = medicos.find((medico) => medico.id === selectedMedico);
  const turnosFiltrados = useMemo(
    () => turnos.filter((turno) =>
      `${turno.pacienteNombre} ${turno.medicoNombre} ${turno.estado} ${turno.motivo ?? ''}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [search, turnos],
  );

  const reservar = async (data: ReservarTurnoRequest) => {
    setSaving(true);
    setError('');
    try {
      await turnosApi.reservar(data);
      setSelectedMedico(data.medicoId);
      setModal(false);
      cargarAgenda();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo reservar el turno');
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (turno: Turno, nuevoEstado: EstadoTurno) => {
    if (nuevoEstado === turno.estado) return;
    setError('');
    try {
      await turnosApi.cambiarEstado(turno.id, nuevoEstado);
      cargarAgenda();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado');
    }
  };

  const cancelar = async (turno: Turno) => {
    if (!confirm(`Cancelar el turno de ${turno.pacienteNombre}?`)) return;
    setError('');
    try {
      await turnosApi.cancelar(turno.id, 'Cancelado desde el panel web');
      cargarAgenda();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar el turno');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Turnos</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {medicoActual ? `Agenda de hoy — ${medicoActual.nombreCompleto}` : 'Agenda de hoy'}
          </p>
        </div>
        <button onClick={() => { setError(''); setModal(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md">
          <Plus size={16} aria-hidden="true" /> Reservar turno
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        <select value={selectedMedico} onChange={(event) => setSelectedMedico(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
          {medicos.map((medico) => (
            <option key={medico.id} value={medico.id}>{medico.nombreCompleto} - {medico.especialidad}</option>
          ))}
        </select>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en la agenda..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {error && !modal && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <CalendarDays size={18} className="text-slate-500" />
          <h2 className="font-semibold text-slate-900">Agenda del dia</h2>
        </div>
        {loading ? <Spinner /> : turnosFiltrados.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock size={32} className="mx-auto mb-3 opacity-40" />
            <p>No hay turnos para mostrar</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {turnosFiltrados.map((turno) => (
              <article key={turno.id} className="grid gap-4 px-5 py-4 hover:bg-slate-50 lg:grid-cols-[120px_1fr_auto] lg:items-center">
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(turno.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-slate-400">{turno.duracionMinutos} minutos</p>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{turno.pacienteNombre}</p>
                    <Badge estado={turno.estado} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{turno.motivo || 'Sin motivo registrado'}</p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <select value={turno.estado} onChange={(event) => cambiarEstado(turno, event.target.value as EstadoTurno)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={turno.estado}>{turno.estado}</option>
                    {estadosDestino.filter((estado) => estado !== turno.estado).map((estado) => (
                      <option key={estado} value={estado}>{estado}</option>
                    ))}
                  </select>
                  <button onClick={() => cambiarEstado(turno, 'CONFIRMADO')} disabled={turno.estado !== 'PENDIENTE'} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40">
                    <Check size={14} /> Confirmar
                  </button>
                  <button onClick={() => cancelar(turno)} disabled={turno.estado === 'CANCELADO' || turno.estado === 'COMPLETADO'} className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40">
                    <XCircle size={14} /> Cancelar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <Modal title="Reservar turno" onClose={() => setModal(false)}>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <TurnoForm pacientes={pacientes} medicos={medicos} loading={saving} onSubmit={reservar} />
        </Modal>
      )}
    </div>
  );
}
