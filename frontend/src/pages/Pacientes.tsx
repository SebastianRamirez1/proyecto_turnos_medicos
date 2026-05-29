import { useEffect, useState } from 'react';
import { Pencil, Plus, Search, UserX } from 'lucide-react';
import { pacientesApi } from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import type { ActualizarPacienteRequest, CrearPacienteRequest, Paciente } from '../types';

const emptyForm: CrearPacienteRequest = {
  nombre: '', apellido: '', dni: '', email: '', telefono: '',
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
  const set = (key: keyof CrearPacienteRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="ds-label">
          Nombre
          <input required value={form.nombre} onChange={set('nombre')} className="ds-input mt-1" />
        </label>
        <label className="ds-label">
          Apellido
          <input required value={form.apellido} onChange={set('apellido')} className="ds-input mt-1" />
        </label>
      </div>

      <label className="ds-label">
        DNI
        <input
          required
          disabled={editing}
          inputMode="numeric"
          minLength={7}
          maxLength={10}
          pattern="[0-9]{7,10}"
          value={form.dni}
          onChange={set('dni')}
          className="ds-input mt-1"
        />
      </label>

      <label className="ds-label">
        Email
        <input required type="email" value={form.email} onChange={set('email')} className="ds-input mt-1" />
      </label>

      <label className="ds-label">
        Teléfono
        <input value={form.telefono} onChange={set('telefono')} className="ds-input mt-1" />
      </label>

      <button type="submit" disabled={loading} className="ds-btn-primary w-full">
        {loading ? 'Guardando…' : 'Guardar paciente'}
      </button>
    </form>
  );
}

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState<null | 'crear' | 'editar'>(null);
  const [selected,  setSelected]  = useState<Paciente | null>(null);
  const [error,     setError]     = useState('');

  const cargar = () => {
    setLoading(true);
    pacientesApi.listar()
      .then(setPacientes)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los pacientes'),
      )
      .finally(() => setLoading(false));
  };
  useEffect(cargar, []);

  const filtrados = pacientes.filter((p) =>
    `${p.nombreCompleto} ${p.dni} ${p.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  const crear = async (data: CrearPacienteRequest) => {
    setSaving(true); setError('');
    try   { await pacientesApi.crear(data); setModal(null); cargar(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const editar = async (data: CrearPacienteRequest) => {
    if (!selected) return;
    const payload: ActualizarPacienteRequest = {
      nombre: data.nombre, apellido: data.apellido,
      email: data.email,   telefono: data.telefono,
    };
    setSaving(true); setError('');
    try   { await pacientesApi.actualizar(selected.id, payload); setModal(null); cargar(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const desactivar = async (paciente: Paciente) => {
    if (!confirm(`¿Desactivar a ${paciente.nombreCompleto}?`)) return;
    await pacientesApi.desactivar(paciente.id);
    cargar();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de página */}
      <div className="ds-page-header">
        <div>
          <h1 className="ds-page-title">Pacientes</h1>
          <p className="ds-page-subtitle">{pacientes.length} pacientes activos</p>
        </div>
        <button
          onClick={() => { setError(''); setModal('crear'); }}
          className="ds-btn-primary"
        >
          <Plus size={16} aria-hidden="true" /> Nuevo paciente
        </button>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, DNI o email…"
          className="ds-input-search"
        />
      </div>

      {error && !modal && <p role="alert" className="ds-alert-error">{error}</p>}

      {/* Tabla */}
      <div className="ds-card overflow-hidden">
        {loading ? <Spinner /> : filtrados.length === 0 ? (
          <div className="ds-empty">
            <UserX size={32} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
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
                  <tr key={paciente.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="ds-avatar-blue">
                          {paciente.nombre[0]}{paciente.apellido[0]}
                        </div>
                        <span className="font-medium text-slate-900">{paciente.nombreCompleto}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{paciente.dni}</td>
                    <td className="px-5 py-4">
                      <p className="text-slate-600">{paciente.email}</p>
                      <p className="text-xs text-slate-400">{paciente.telefono || 'Sin teléfono'}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(paciente.creadoEn).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelected(paciente); setError(''); setModal('editar'); }}
                          className="ds-btn-icon-ghost"
                          aria-label={`Editar ${paciente.nombreCompleto}`}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => desactivar(paciente)}
                          className="ds-btn-icon-danger"
                          aria-label={`Desactivar ${paciente.nombreCompleto}`}
                        >
                          <UserX size={16} aria-hidden="true" />
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

      {/* Modales */}
      {modal === 'crear' && (
        <Modal title="Nuevo paciente" onClose={() => setModal(null)}>
          {error && <p role="alert" className="ds-alert-error-sm">{error}</p>}
          <PacienteForm onSubmit={crear} loading={saving} />
        </Modal>
      )}
      {modal === 'editar' && selected && (
        <Modal title="Editar paciente" onClose={() => setModal(null)}>
          {error && <p role="alert" className="ds-alert-error-sm">{error}</p>}
          <PacienteForm
            editing
            initial={{
              nombre:   selected.nombre,
              apellido: selected.apellido,
              dni:      selected.dni,
              email:    selected.email,
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
