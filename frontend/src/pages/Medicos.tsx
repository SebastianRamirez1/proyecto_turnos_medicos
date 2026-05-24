import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Stethoscope, UserX } from 'lucide-react';
import { medicosApi } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import type { ActualizarMedicoRequest, CrearMedicoRequest, Medico } from '../types';

const ESPECIALIDADES = [
  'Cardiologia',
  'Clinica Medica',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Traumatologia',
  'Urologia',
];

const emptyForm: CrearMedicoRequest = {
  nombre: '',
  apellido: '',
  matricula: '',
  especialidad: '',
  email: '',
  telefono: '',
};

function MedicoForm({
  initial,
  editing,
  loading,
  onSubmit,
}: {
  initial?: Partial<CrearMedicoRequest>;
  editing?: boolean;
  loading: boolean;
  onSubmit: (data: CrearMedicoRequest) => void;
}) {
  const [form, setForm] = useState<CrearMedicoRequest>({ ...emptyForm, ...initial });
  const set = (key: keyof CrearMedicoRequest) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">
          Nombre
          <input required value={form.nombre} onChange={set('nombre')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Apellido
          <input required value={form.apellido} onChange={set('apellido')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
      </div>
      <label className="block text-xs font-medium text-slate-600">
        Matricula
        <input required disabled={editing} value={form.matricula} onChange={set('matricula')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500" />
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Especialidad
        <select required value={form.especialidad} onChange={set('especialidad')} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Seleccionar especialidad...</option>
          {ESPECIALIDADES.map((especialidad) => (
            <option key={especialidad} value={especialidad}>{especialidad}</option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Email
        <input required type="email" value={form.email} onChange={set('email')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <label className="block text-xs font-medium text-slate-600">
        Telefono
        <input value={form.telefono} onChange={set('telefono')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Guardando...' : 'Guardar medico'}
      </button>
    </form>
  );
}

export default function Medicos() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [modal, setModal] = useState<null | 'crear' | 'editar'>(null);
  const [selected, setSelected] = useState<Medico | null>(null);
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    medicosApi.listar()
      .then(setMedicos)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los medicos'))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const especialidades = useMemo(
    () => [...new Set(medicos.map((medico) => medico.especialidad))].sort(),
    [medicos],
  );

  const filtrados = medicos.filter((medico) => {
    const matchSearch = `${medico.nombreCompleto} ${medico.especialidad} ${medico.matricula} ${medico.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchEspecialidad = !especialidad || medico.especialidad === especialidad;
    return matchSearch && matchEspecialidad;
  });

  const crear = async (data: CrearMedicoRequest) => {
    setSaving(true);
    setError('');
    try {
      await medicosApi.crear(data);
      setModal(null);
      cargar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const editar = async (data: CrearMedicoRequest) => {
    if (!selected) return;
    const payload: ActualizarMedicoRequest = {
      nombre: data.nombre,
      apellido: data.apellido,
      especialidad: data.especialidad,
      email: data.email,
      telefono: data.telefono,
    };

    setSaving(true);
    setError('');
    try {
      await medicosApi.actualizar(selected.id, payload);
      setModal(null);
      cargar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const desactivar = async (medico: Medico) => {
    if (!confirm(`Desactivar a ${medico.nombreCompleto}?`)) return;
    await medicosApi.desactivar(medico.id);
    cargar();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Médicos</h1>
          <p className="mt-0.5 text-sm text-slate-500">{medicos.length} médicos activos</p>
        </div>
        <button onClick={() => { setError(''); setModal('crear'); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-md">
          <Plus size={16} aria-hidden="true" /> Nuevo médico
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, matricula o email..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={especialidad} onChange={(event) => setEspecialidad(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las especialidades</option>
          {especialidades.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {error && !modal && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? <Spinner /> : filtrados.length === 0 ? (
        <div className="rounded-lg border border-slate-100 bg-white py-12 text-center text-slate-400 shadow-sm">
          <Stethoscope size={32} className="mx-auto mb-3 opacity-40" />
          <p>No se encontraron medicos</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtrados.map((medico) => (
            <article key={medico.id} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition-colors hover:border-blue-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                    {medico.nombre[0]}{medico.apellido[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{medico.nombreCompleto}</p>
                    <p className="truncate text-xs text-slate-500">{medico.especialidad}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelected(medico); setError(''); setModal('editar'); }} className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100" title="Editar" aria-label={`Editar ${medico.nombreCompleto}`}>
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button onClick={() => desactivar(medico)} className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" title="Desactivar" aria-label={`Desactivar ${medico.nombreCompleto}`}>
                    <UserX size={16} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-400">Matricula</dt>
                  <dd className="font-medium text-slate-700">{medico.matricula}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Telefono</dt>
                  <dd className="font-medium text-slate-700">{medico.telefono || 'Sin telefono'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-slate-400">Email</dt>
                  <dd className="truncate font-medium text-slate-700">{medico.email}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}

      {modal === 'crear' && (
        <Modal title="Nuevo médico" onClose={() => setModal(null)}>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <MedicoForm onSubmit={crear} loading={saving} />
        </Modal>
      )}
      {modal === 'editar' && selected && (
        <Modal title="Editar médico" onClose={() => setModal(null)}>
          {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <MedicoForm
            editing
            initial={{
              nombre: selected.nombre,
              apellido: selected.apellido,
              matricula: selected.matricula,
              especialidad: selected.especialidad,
              email: selected.email,
              telefono: selected.telefono ?? '',
            }}
            onSubmit={editar}
            loading={saving}
          />
        </Modal>
      )}
    </div>
  );
}
