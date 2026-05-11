export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  dni: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  creadoEn: string;
}

export interface Medico {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  matricula: string;
  especialidad: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  creadoEn: string;
}

export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'COMPLETADO' | 'CANCELADO' | 'AUSENTE';

export interface Turno {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  medicoId: string;
  medicoNombre: string;
  especialidad: string;
  fechaHora: string;
  fechaHoraFin: string;
  duracionMinutos: number;
  estado: EstadoTurno;
  motivo: string | null;
  notas: string | null;
  creadoEn: string;
}

export interface CrearPacienteRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
}

export type ActualizarPacienteRequest = Omit<CrearPacienteRequest, 'dni'>;

export interface CrearMedicoRequest {
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string;
  email: string;
  telefono: string;
}

export type ActualizarMedicoRequest = Omit<CrearMedicoRequest, 'matricula'>;

export interface ReservarTurnoRequest {
  pacienteId: string;
  medicoId: string;
  fechaHora: string;
  duracionMinutos: number;
  motivo: string;
}
