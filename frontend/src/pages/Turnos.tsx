import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Clock, Plus, Search, XCircle } from 'lucide-react';
import { medicosApi, pacientesApi, turnosApi } from '../api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import type { EstadoTurno, Medico, Paciente, ReservarTurnoRequest, Turno } from '../types';

const emptyForm: ReservarTurnoRequest = {
  pacienteId: '', medicoId: '', fechaHora: '', duracionMinutos: 30, motivo: '',
};

const estadosDestino: EstadoTurno[] = ['CONFIRMADO', 'COMPLETADO', 'AUSENTE', 'CANCELADO'];

function toApiDateTime(v: string) { return v.length === 16 ? `${v}:00` : v; }

function todayRange() {
  const today = new Date().toISOString().slice(0, 10);
  return { desde: `${today}T00:00:00`, hasta: `${today}T23:59:59` };
}

function TurnoForm({
  pacientes, medicos, loading, onSubmit,
}: {
  pacientes: Paciente[];
  medicos: Medico[];
  loading: boolean;
  onSubmit: (data: ReservarTurnoRequest) => void;
}) {
  const [form, setForm] = useState<ReservarTurnoRequest>(emptyForm);
  const set = (key: keyof ReservarTurnoRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({
        ...prev,
        [key]: key === 'duracionMinutos' ? Number(e.target.value) : e.target.value,
      }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, fechaHora: toApiDateTime(form.fechaHora) }); }} className="space-y-5">
      <label className="ds-label">Paciente
        <select required value={form.pacienteId} onChange={set('pacienteId')} className="ds-select">
          <option value="">Seleccionar paciente…</option>
          {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombreCompleto}</option>)}
        </select>
      </label>
      <label className="ds-label">Médico
        <select required value={form.medicoId} onChange={set('medicoId')} className="ds-select">
          <option value="">Seleccionar médico…</option>
          {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombreCompleto} — {m.especialidad}</option>)}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="ds-label">Fecha y hora
          <input required type="datetime-local" value={form.fechaHora} onChange={set('fechaHora')} className="ds-input" />
        </label>
        <label className="ds-label">Duración
          <select value={form.duracionMinutos} onChange={set('duracionMinutos')} className="ds-select">
            <option value={15}>15 minutos</option>
            <option value={30}>30 minutos</option>
            <option value={45}>45 minutos</option>
            <option value={60}>60 minutos</option>
          </select>
        </label>
      </div>
      <label className="ds-label">Motivo
        <textarea value={form.motivo} onChange={set('motivo')} rows={3} className="ds-textarea" />
      </label>
      <button type="submit" disabled={loading} className="ds-btn-primary w-full">
        {loading ? 'Reservando…' : 'Reservar turno'}
      </button>
    </form>
  );
}

export default function Turnos() {
  const [pacientes,      setPacientes]      = useState<Paciente[]>([]);
  const [medicos,        setMedicos]        = useState<Medico[]>([]);
  const [turnos,         setTurnos]         = useState<Turno[]>([]);
  const [selectedMedico, setSelectedMedico] = useState('');
  const [search,         setSearch]         = useState('');
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [modal,          setModal]          = useState(false);
  const [error,          setError]          = useState('');

  const cargarCatalogos = () => {
    setLoading(true);
    Promise.all([pacientesApi.listar(), medicosApi.listar()])
      .then(([pd, md]) => {
        setPacientes(pd); setMedicos(md);
        if (md.length > 0) setSelectedMedico((c) => c || md[0].id);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos'),
      )
      .finally(() => setLoading(false));
  };
  useEffect(cargarCatalogos, []);

  const cargarAgenda = () => {
    if (!selectedMedico) { setTurnos([]); return; }
    const { desde, hasta } = todayRange();
    setLoading(true);
    turnosApi.agenda(selectedMedico, desde, hasta)
      .then((data) => setTurnos(data.sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudo cargar la agenda'),
      )
      .finally(() => setLoading(false));
  };
  useEffect(cargarAgenda, [selectedMedico]);

  const medicoActual    = medicos.find((m) => m.id === selectedMedico);
  const turnosFiltrados = useMemo(
    () => turnos.filter((t) =>
      `${t.pacienteNombre} ${t.medicoNombre} ${t.estado} ${t.motivo ?? ''}`
        .toLowerCase().includes(search.toLowerCase()),
    ),
    [search, turnos],
  );

  const reservar = async (data: ReservarTurnoRequest) => {
    setSaving(true); setError('');
    try {
      await turnosApi.reservar(data);
      setSelectedMedico(data.medicoId); setModal(false); cargarAgenda();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo reservar el turno');
    } finally { setSaving(false); }
  };

  const cambiarEstado = async (turno: Turno, nuevoEstado: EstadoTurno) => {
    if (nuevoEstado === turno.estado) return;
    setError('');
    try   { await turnosApi.cambiarEstado(turno.id, nuevoEstado); cargarAgenda(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado'); }
  };

  const cancelar = async (turno: Turno) => {
    if (!confirm(`¿Cancelar el turno de ${turno.pacienteNombre}?`)) return;
    setError('');
    try   { await turnosApi.cancelar(turno.id, 'Cancelado desde el panel web'); cargarAgenda(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'No se pudo cancelar'); }
  };

  return (
    <div className="space-y-6">
      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">Turnos</h1>
          <p className="ds-page-subtitle">
            {medicoActual ? `Agenda de hoy — ${medicoActual.nombreCompleto}` : 'Agenda de hoy'}
          </p>
        </div>
        <button onClick={() => { setError(''); setModal(true); }} className="ds-btn-primary">
          <Plus size={16} aria-hidden="true" /> Reservar turno
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[280px_1fr]">
        <select value={selectedMedico} onChange={(e) => setSelectedMedico(e.target.value)} className="ds-select py-3">
          {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombreCompleto} — {m.especialidad}</option>)}
        </select>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carbon-gray-50" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en la agenda…" className="ds-input-search" />
        </div>
      </div>

      {error && !modal && <p role="alert" className="ds-alert-error">{error}</p>}

      <section className="ds-card overflow-hidden">
        <div className="ds-card-header">
          <CalendarDays size={16} className="text-carbon-gray-70" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-carbon-gray-100">Agenda del día</h2>
        </div>

        {loading ? <Spinner /> : turnosFiltrados.length === 0 ? (
          <div className="ds-empty">
            <Clock size={28} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
            <p>No hay turnos para mostrar</p>
          </div>
        ) : (
          <div className="divide-y divide-carbon-gray-20">
            {turnosFiltrados.map((turno) => (
              <article
                key={turno.id}
                className="grid gap-4 px-4 py-4 transition-colors hover:bg-carbon-gray-10
                           lg:grid-cols-[100px_1fr_auto] lg:items-center"
              >
                <div>
                  <p className="text-lg font-semibold tabular-nums text-carbon-gray-100">
                    {new Date(turno.fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-carbon-gray-50">{turno.duracionMinutos} min</p>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-carbon-gray-100">{turno.pacienteNombre}</p>
                    <Badge estado={turno.estado} />
                  </div>
                  <p className="mt-0.5 text-sm text-carbon-gray-70">{turno.motivo || 'Sin motivo registrado'}</p>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <select
                    value={turno.estado}
                    onChange={(e) => cambiarEstado(turno, e.target.value as EstadoTurno)}
                    className="ds-select py-2 px-3 text-xs"
                  >
                    <option value={turno.estado}>{turno.estado}</option>
                    {estadosDestino.filter((e) => e !== turno.estado).map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <button onClick={() => cambiarEstado(turno, 'CONFIRMADO')} disabled={turno.estado !== 'PENDIENTE'} className="ds-btn-ghost-sm">
                    <Check size={14} aria-hidden="true" /> Confirmar
                  </button>
                  <button onClick={() => cancelar(turno)} disabled={turno.estado === 'CANCELADO' || turno.estado === 'COMPLETADO'} className="ds-btn-danger-sm">
                    <XCircle size={14} aria-hidden="true" /> Cancelar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <Modal title="Reservar turno" onClose={() => setModal(false)}>
          {error && <p role="alert" className="ds-alert-error-sm">{error}</p>}
          <TurnoForm pacientes={pacientes} medicos={medicos} loading={saving} onSubmit={reservar} />
        </Modal>
      )}
    </div>
  );
}
