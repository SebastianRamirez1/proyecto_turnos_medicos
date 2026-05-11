import { useEffect, useState } from 'react';
import { Pencil, Plus, Search, UserX } from 'lucide-react';
import { pacientesApi } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import type { ActualizarPacienteRequest, CrearPacienteRequest, Paciente } from '../types';

const emptyForm: CrearPacienteRequest = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
};

function PacienteForm({
  initial,
  editing,
  loading,
  onSubmit,
}: {
  initial?: Partial<CrearPacienteRequest>;
  editing?: boolean;
  loading: boolean;
  onSubmit: (data: CrearPacienteRequest) => void;
}) {
  const [form, setForm] = useState<CrearPacienteRequest>({ ...emptyForm, ...initial });
  const set = (key: keyof CrearPacienteRequest) => (event: React.ChangeEvent<HTMLInputElement>) =>
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
        DNI
        <input required disabled={editing} inputMode="numeric" minLength={7} maxLength={10} pattern="[0-9]{7,10}" value={form.dni} onChange={set('dni')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500" />
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
        {loading ? 'Guardando...' : 'Guardar paciente'}
      </button>
    </form>
  );
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'crear' | 'editar'>(null);
  const [selected, setSelected] = useState<Paciente | null>(null);
  const [error, setError] = useState('');

  const cargar = () => {
    setLoading(true);
    pacientesApi.listar()
      .then(setPacientes)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los pacientes'))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, []);

  const filtrados = pacientes.filter((paciente) =>
    `${paciente.nombreCompleto} ${paciente.dni} ${paciente.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  const crear = async (data: CrearPacienteRequest) => {
    setSaving(true);
    setError('');
    try {
      await pacientesApi.crear(data);
      setModal(null);
      cargar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const editar = async (data: CrearPacienteRequest) => {
    if (!selected) return;
    const payload: ActualizarPacienteRequest = {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono,
    };

    setSaving(true);
    setError('');
    try {
      await pacientesApi.actualizar(selected.id, payload);
      setModal(null);
      cargar();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const desactivar = async (paciente: Paciente) => {
    if (!confirm(`Desactivar a ${paciente.nombreCompleto}?`)) return;
    await pacientesApi.desactivar(paciente.id);
    cargar();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="mt-0.5 text-sm text-slate-500">{pacientes.length} pacientes activos</p>
        </div>
        <button onClick={() => { setError(''); setModal('crear'); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700">
          <Plus size={16} /> Nuevo paciente
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, DNI o email..." className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {error && !modal && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        {loading ? <Spinner /> : filtrados.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <UserX size={32} className="mx-auto mb-3 opacity-40" />
            <p>No se encontraron pacientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Paciente</th>
                  <th className="px-5 py-3">DNI</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Alta</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {paciente.nombre[0]}{paciente.apellido[0]}
                        </div>
                        <span className="font-medium text-slate-900">{paciente.nombreCompleto}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{paciente.dni}</td>
                    <td className="px-5 py-4">
                      <p className="text-slate-600">{paciente.email}</p>
                      <p className="text-xs text-slate-400">{paciente.telefono || 'Sin telefono'}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{new Date(paciente.creadoEn).toLocaleDateString('es-CO')}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelected(paciente); setError(''); setModal('editar'); }} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => desactivar(paciente)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" title="Desactivar">
                          <UserX size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'crear' && (
        <Modal title="Nuevo paciente" onClose={() => setModal(null)}>
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <PacienteForm onSubmit={crear} loading={saving} />
        </Modal>
      )}
      {modal === 'editar' && selected && (
        <Modal title="Editar paciente" onClose={() => setModal(null)}>
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <PacienteForm
            editing
            initial={{
              nombre: selected.nombre,
              apellido: selected.apellido,
              dni: selected.dni,
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
