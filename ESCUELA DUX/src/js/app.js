// Punto de entrada principal. Importa y orquesta los módulos.
import { inicializarUI } from './modules/ui.js';
import { inicializarAuth } from './modules/auth.js';
import { inicializarCursos } from './modules/cursos.js';
import { inicializarAlumno } from './modules/alumno.js';
import { inicializarProfesor } from './modules/profesor.js';

// Inicialización global
window.addEventListener('DOMContentLoaded', () => {
  inicializarUI();
  inicializarAuth();
  inicializarCursos();
  inicializarAlumno();
  inicializarProfesor();
});
