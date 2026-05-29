import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Stethoscope, UserX } from 'lucide-react';
import { medicosApi } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import type { ActualizarMedicoRequest, CrearMedicoRequest, Medico } from '../types';

const ESPECIALIDADES = [
  'Cardiologia','Clinica Medica','Dermatologia','Endocrinologia',
  'Gastroenterologia','Ginecologia','Neurologia','Oftalmologia',
  'Ortopedia','Pediatria','Psiquiatria','Traumatologia','Urologia',
];

const emptyForm: CrearMedicoRequest = {
  nombre: '', apellido: '', matricula: '', especialidad: '', email: '', telefono: '',
};

function MedicoForm({
  initial, editing, loading, onSubmit,
}: {
  initial?: Partial<CrearMedicoRequest>;
  editing?: boolean;
  loading: boolean;
  onSubmit: (data: CrearMedicoRequest) => void;
}) {
  const [form, setForm] = useState<CrearMedicoRequest>({ ...emptyForm, ...initial });
  const set = (key: keyof CrearMedicoRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="ds-label">Nombre
          <input required value={form.nombre} onChange={set('nombre')} className="ds-input" />
        </label>
        <label className="ds-label">Apellido
          <input required value={form.apellido} onChange={set('apellido')} className="ds-input" />
        </label>
      </div>
      <label className="ds-label">Matrícula
        <input required disabled={editing} value={form.matricula} onChange={set('matricula')} className="ds-input" />
      </label>
      <label className="ds-label">Especialidad
        <select required value={form.especialidad} onChange={set('especialidad')} className="ds-select">
          <option value="">Seleccionar especialidad…</option>
          {ESPECIALIDADES.map((esp) => <option key={esp} value={esp}>{esp}</option>)}
        </select>
      </label>
      <label className="ds-label">Email
        <input required type="email" value={form.email} onChange={set('email')} className="ds-input" />
      </label>
      <label className="ds-label">Teléfono
        <input value={form.telefono} onChange={set('telefono')} className="ds-input" />
      </label>
      <button type="submit" disabled={loading} className="ds-btn-primary w-full">
        {loading ? 'Guardando…' : 'Guardar médico'}
      </button>
    </form>
  );
}

export default function Medicos() {
  const [medicos,      setMedicos]      = useState<Medico[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [search,       setSearch]       = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [modal,        setModal]        = useState<null | 'crear' | 'editar'>(null);
  const [selected,     setSelected]     = useState<Medico | null>(null);
  const [error,        setError]        = useState('');

  const cargar = () => {
    setLoading(true);
    medicosApi.listar()
      .then(setMedicos)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los médicos'),
      )
      .finally(() => setLoading(false));
  };
  useEffect(cargar, []);

  const especialidades = useMemo(
    () => [...new Set(medicos.map((m) => m.especialidad))].sort(),
    [medicos],
  );

  const filtrados = medicos.filter((m) => {
    const matchSearch = `${m.nombreCompleto} ${m.especialidad} ${m.matricula} ${m.email}`
      .toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!especialidad || m.especialidad === especialidad);
  });

  const crear = async (data: CrearMedicoRequest) => {
    setSaving(true); setError('');
    try   { await medicosApi.crear(data); setModal(null); cargar(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const editar = async (data: CrearMedicoRequest) => {
    if (!selected) return;
    const payload: ActualizarMedicoRequest = {
      nombre: data.nombre, apellido: data.apellido,
      especialidad: data.especialidad, email: data.email, telefono: data.telefono,
    };
    setSaving(true); setError('');
    try   { await medicosApi.actualizar(selected.id, payload); setModal(null); cargar(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const desactivar = async (medico: Medico) => {
    if (!confirm(`¿Desactivar a ${medico.nombreCompleto}?`)) return;
    await medicosApi.desactivar(medico.id);
    cargar();
  };

  return (
    <div className="space-y-6">
      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">Médicos</h1>
          <p className="ds-page-subtitle">{medicos.length} médicos activos</p>
        </div>
        <button onClick={() => { setError(''); setModal('crear'); }} className="ds-btn-primary">
          <Plus size={16} aria-hidden="true" /> Nuevo médico
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-carbon-gray-50" aria-hidden="true" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, matrícula o email…" className="ds-input-search" />
        </div>
        <select value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className="ds-select py-3">
          <option value="">Todas las especialidades</option>
          {especialidades.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      {error && !modal && <p role="alert" className="ds-alert-error">{error}</p>}

      {loading ? <Spinner /> : filtrados.length === 0 ? (
        <div className="ds-card ds-empty">
          <Stethoscope size={28} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p>No se encontraron médicos</p>
        </div>
      ) : (
        <div className="grid gap-px bg-carbon-gray-20 lg:grid-cols-2">
          {filtrados.map((medico) => (
            <article key={medico.id} className="bg-white p-5 transition-colors hover:bg-carbon-gray-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="ds-avatar-violet">{medico.nombre[0]}{medico.apellido[0]}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-carbon-gray-100">{medico.nombreCompleto}</p>
                    <p className="truncate text-xs text-carbon-gray-70">{medico.especialidad}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelected(medico); setError(''); setModal('editar'); }} className="ds-btn-icon-ghost" aria-label={`Editar ${medico.nombreCompleto}`}>
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button onClick={() => desactivar(medico)} className="ds-btn-icon-danger" aria-label={`Desactivar ${medico.nombreCompleto}`}>
                    <UserX size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid gap-0 border border-carbon-gray-20 text-sm sm:grid-cols-2">
                <div className="border-b border-carbon-gray-20 px-3 py-2 sm:border-b-0 sm:border-r">
                  <dt className="text-xs text-carbon-gray-50">Matrícula</dt>
                  <dd className="font-medium text-carbon-gray-100">{medico.matricula}</dd>
                </div>
                <div className="border-b border-carbon-gray-20 px-3 py-2">
                  <dt className="text-xs text-carbon-gray-50">Teléfono</dt>
                  <dd className="font-medium text-carbon-gray-100">{medico.telefono || '—'}</dd>
                </div>
                <div className="bg-carbon-gray-10 px-3 py-2 sm:col-span-2">
                  <dt className="text-xs text-carbon-gray-50">Email</dt>
                  <dd className="truncate font-medium text-carbon-gray-100">{medico.email}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {modal === 'crear' && (
        <Modal title="Nuevo médico" onClose={() => setModal(null)}>
          {error && <p role="alert" className="ds-alert-error-sm">{error}</p>}
          <MedicoForm onSubmit={crear} loading={saving} />
        </Modal>
      )}
      {modal === 'editar' && selected && (
        <Modal title="Editar médico" onClose={() => setModal(null)}>
          {error && <p role="alert" className="ds-alert-error-sm">{error}</p>}
          <MedicoForm editing initial={{ nombre: selected.nombre, apellido: selected.apellido, matricula: selected.matricula, especialidad: selected.especialidad, email: selected.email, telefono: selected.telefono ?? '' }} onSubmit={editar} loading={saving} />
        </Modal>
      )}
    </div>
  );
}
