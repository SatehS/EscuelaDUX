/**
 * @fileoverview Configuración global y constantes de la aplicación
 * @module core/config
 */

/**
 * Datos de los cursos disponibles
 * @constant {Object}
 */
export const COURSES = Object.freeze({
  escritura_creativa: {
    id: 'escritura_creativa',
    name: 'Escritura creativa',
    turno: 'Noche',
    dias: 'Lunes y miércoles',
    horario: '6:00 pm a 8:00 pm',
    totalClases: '8',
    horas: '16',
    profesor: 'Carolina Eguiguren'
  },
  edicion_estilo: {
    id: 'edicion_estilo',
    name: 'Edición y corrección de estilo',
    turno: 'Noche',
    dias: 'Martes y Jueves',
    horario: '6:00 pm a 8:00 pm',
    totalClases: '8',
    horas: '16',
    profesor: 'Carolina Eguiguren'
  },
  redaccion: {
    id: 'redaccion',
    name: 'Redacción',
    turno: 'Noche',
    dias: 'Martes y Jueves',
    horario: '6:00 pm a 8:00 pm',
    totalClases: '8',
    horas: '16',
    profesor: 'Hexy Marquez'
  },
  narracion: {
    id: 'narracion',
    name: 'Narración',
    turno: 'Noche',
    dias: 'Martes y Jueves',
    horario: '6:00 pm a 8:00 pm',
    totalClases: '8',
    horas: '16',
    profesor: 'Hexy Marquez'
  },
  diccion_voz: {
    id: 'diccion_voz',
    name: 'Dicción, voz y oratoria',
    turno: 'Noche',
    dias: 'Martes y Jueves',
    horario: '8:00 pm a 10:00 pm',
    totalClases: '8',
    horas: '16',
    profesor: 'José Alí Cabrera'
  },
  lector_editorial: {
    id: 'lector_editorial',
    name: 'Lector Editorial',
    turno: 'Mañana',
    dias: 'Sábados',
    horario: '9:00 am a 11:00 am',
    totalClases: '8',
    horas: '16',
    profesor: 'Carolina Eguiguren'
  },
  escritura_creativa_presencial: {
    id: 'escritura_creativa_presencial',
    name: 'Escritura creativa (Presencial)',
    turno: 'Mañana',
    dias: 'Sábados',
    horario: '8:00 am a 12:00 m',
    totalClases: '4',
    horas: '16',
    profesor: 'Carolina Eguiguren'
  }
});

/**
 * Usuarios de prueba para desarrollo
 * @constant {Object}
 */
export const TEST_USERS = Object.freeze({
  alumno: {
    email: 'alumno@dux.com',
    password: '1234',
    role: 'alumno',
    name: 'Estudiante Demo'
  },
  profesor: {
    email: 'profesor@dux.com',
    password: '1234',
    role: 'profesor',
    name: 'Profesor Demo'
  },
  admin: {
    email: 'admin@dux.com',
    password: '1234',
    role: 'admin',
    name: 'Administrador'
  }
});

/**
 * Roles de usuario disponibles
 * @constant {Object}
 */
export const USER_ROLES = Object.freeze({
  ALUMNO: 'alumno',
  PROFESOR: 'profesor',
  ADMIN: 'admin'
});

/**
 * Vistas/Rutas de la aplicación
 * @constant {Object}
 */
export const VIEWS = Object.freeze({
  HOME: 'home',
  STUDENT_DASHBOARD: 'student-dashboard',
  TEACHER_DASHBOARD: 'teacher-dashboard',
  ADMIN_DASHBOARD: 'admin-dashboard'
});

/**
 * Secciones del panel de alumno
 * @constant {Object}
 */
export const STUDENT_SECTIONS = Object.freeze({
  CLASES: 'clases',
  MATERIAL: 'material',
  PLANTILLAS: 'plantillas',
  HORARIO: 'horario',
  LINK: 'link',
  TAREAS: 'tareas',
  NOTAS: 'notas',
  CERTIFICADO: 'certificado',
  PREGUNTAS: 'preguntas'
});

/**
 * Secciones del panel de profesor
 * @constant {Object}
 */
export const TEACHER_SECTIONS = Object.freeze({
  CLASES: 'clases',
  TAREAS: 'tareas',
  ALUMNOS: 'alumnos',
  DUDAS: 'dudas',
  EVALUAR: 'evaluar',
  APROBAR: 'aprobar',
  EN_VIVO: 'en_vivo'
});

/**
 * Información de la empresa
 * @constant {Object}
 */
export const COMPANY_INFO = Object.freeze({
  name: 'GRUPO DUX S.A.S',
  email: 'educacionduxoficial@gmail.com',
  nit: '901157018',
  bank: 'Bancolombia',
  accountNumber: '30200040441',
  accountName: 'Grupo Dux S.A.S'
});

/**
 * Selectores DOM principales
 * @constant {Object}
 */
export const DOM_SELECTORS = Object.freeze({
  // Contenedores principales (SPA)
  NAVBAR_CONTAINER: '#navbar-container',
  APP_CONTAINER: '#app-container',
  MODALS_CONTAINER: '#modals-container',
  
  // Formularios
  LOGIN_FORM: '#formLoginHome',
  REGISTER_FORM: '#formRegisterHome',
  ENROLLMENT_FORM: '#formInscripcion',
  
  // Modales
  ENROLLMENT_MODAL: '#inscripcionModal',
  PLANILLA_MODAL: '#planillaModal',
  
  // Contenido dinámico
  STUDENT_CONTENT: '#studentContent',
  TEACHER_CONTENT: '#profContent',
  ADMIN_CONTENT: '#adminContent',
  PLANILLA_PREVIEW: '#planillaPreview'
});

/**
 * URLs de assets
 * @constant {Object}
 */
export const ASSETS = Object.freeze({
  LOGO: 'public/assets/images/logo-escuela-dux.png',
  AVATAR_DEFAULT: 'public/assets/images/avatar-alumno.png'
});
