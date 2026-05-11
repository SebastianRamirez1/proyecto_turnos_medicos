import { api } from './client';
import type {
  ActualizarMedicoRequest,
  ActualizarPacienteRequest,
  CrearMedicoRequest,
  CrearPacienteRequest,
  EstadoTurno,
  Medico,
  Paciente,
  ReservarTurnoRequest,
  Turno,
} from '../types';

export const pacientesApi = {
  listar: () => api.get<Paciente[]>('/api/v1/pacientes'),
  obtener: (id: string) => api.get<Paciente>(`/api/v1/pacientes/${id}`),
  crear: (data: CrearPacienteRequest) => api.post<Paciente>('/api/v1/pacientes', data),
  actualizar: (id: string, data: ActualizarPacienteRequest) =>
    api.patch<Paciente>(`/api/v1/pacientes/${id}`, data),
  desactivar: (id: string) => api.delete(`/api/v1/pacientes/${id}`),
};

export const medicosApi = {
  listar: () => api.get<Medico[]>('/api/v1/medicos'),
  obtener: (id: string) => api.get<Medico>(`/api/v1/medicos/${id}`),
  porEspecialidad: (especialidad: string) =>
    api.get<Medico[]>(`/api/v1/medicos/especialidad/${encodeURIComponent(especialidad)}`),
  crear: (data: CrearMedicoRequest) => api.post<Medico>('/api/v1/medicos', data),
  actualizar: (id: string, data: ActualizarMedicoRequest) =>
    api.patch<Medico>(`/api/v1/medicos/${id}`, data),
  desactivar: (id: string) => api.delete(`/api/v1/medicos/${id}`),
};

export const turnosApi = {
  porPaciente: (id: string) => api.get<Turno[]>(`/api/v1/turnos/paciente/${id}`),
  porMedico: (id: string) => api.get<Turno[]>(`/api/v1/turnos/medico/${id}`),
  agenda: (medicoId: string, desde: string, hasta: string) =>
    api.get<Turno[]>(
      `/api/v1/turnos/medico/${medicoId}/agenda?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
    ),
  obtener: (id: string) => api.get<Turno>(`/api/v1/turnos/${id}`),
  reservar: (data: ReservarTurnoRequest) => api.post<Turno>('/api/v1/turnos', data),
  cambiarEstado: (id: string, nuevoEstado: EstadoTurno, notas = '') =>
    api.patch<Turno>(`/api/v1/turnos/${id}/estado`, { nuevoEstado, notas }),
  cancelar: (id: string, notas = '') =>
    api.delete(`/api/v1/turnos/${id}${notas ? `?notas=${encodeURIComponent(notas)}` : ''}`),
};
