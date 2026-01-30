/**
 * @fileoverview Componente TeacherPanel - Panel completo del profesor
 * @module components/TeacherPanel
 */

import { TEACHER_SECTIONS } from '../core/config.js';
import { appState } from '../core/state.js';

/**
 * Renderiza el panel del profesor
 * @returns {string} HTML del panel
 */
export const TeacherPanel = () => {
  const currentSection = appState.getCurrentSection() || TEACHER_SECTIONS.CLASES;
  
  return `
    <main class="container my-4">
      <section class="prof-layout" aria-label="Panel del profesor">
        ${TeacherSidebar(currentSection)}
        <div class="prof-main">
          ${TeacherHeader()}
          <div id="profContent" class="prof-content">
            ${getTeacherSectionContent(currentSection)}
          </div>
        </div>
      </section>
    </main>
  `;
};

/**
 * Renderiza el sidebar del profesor
 * @param {string} activeSection - Sección activa
 * @returns {string} HTML del sidebar
 */
const TeacherSidebar = (activeSection) => {
  const menuItems = [
    { section: TEACHER_SECTIONS.CLASES, icon: '📚', label: 'Subir clases escritas' },
    { section: TEACHER_SECTIONS.TAREAS, icon: '📝', label: 'Preparar tareas' },
    { section: TEACHER_SECTIONS.ALUMNOS, icon: '👥', label: 'Lista de alumnos' },
    { section: TEACHER_SECTIONS.DUDAS, icon: '💬', label: 'Responder dudas' },
    { section: TEACHER_SECTIONS.EVALUAR, icon: '⭐', label: 'Evaluar alumnos' },
    { section: TEACHER_SECTIONS.APROBAR, icon: '✅', label: 'Aprobar/rechazar curso' },
    { section: TEACHER_SECTIONS.EN_VIVO, icon: '🔴', label: 'Iniciar clases en vivo' }
  ];

  return `
    <nav class="prof-sidebar" aria-label="Menú del profesor">
      <div class="sidebar-logo mb-4 mt-3 text-center">
        <div class="sidebar-logo-bg">
          <img src="public/assets/images/logo-escuela-dux.png" alt="Logo Escuela DUX">
        </div>
      </div>
      <ul class="sidebar-menu nav flex-column gap-2">
        ${menuItems.map(item => `
          <li class="nav-item">
            <a 
              class="nav-link ${item.section === activeSection ? 'active' : ''}" 
              data-section="${item.section}" 
              href="#" 
              role="button"
            >
              <span class="sidebar-icon" aria-hidden="true">${item.icon}</span> 
              ${item.label}
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;
};

/**
 * Renderiza el header del panel de profesor
 * @returns {string} HTML del header
 */
const TeacherHeader = () => {
  const userName = appState.getUserName() || 'Profesor(a)';
  
  return `
    <header class="prof-header d-flex justify-content-between align-items-center p-3 mb-4">
      <div></div>
      <div class="d-flex align-items-center gap-3">
        <span class="fw-bold">${userName}</span>
        <img src="public/assets/images/avatar-alumno.png" alt="Avatar" class="student-avatar-img">
      </div>
    </header>
  `;
};

/**
 * Obtiene el contenido de una sección específica
 * @param {string} section - Nombre de la sección
 * @returns {string} HTML del contenido
 */
export const getTeacherSectionContent = (section) => {
  const contentMap = {
    [TEACHER_SECTIONS.CLASES]: renderClases,
    [TEACHER_SECTIONS.TAREAS]: renderTareas,
    [TEACHER_SECTIONS.ALUMNOS]: renderAlumnos,
    [TEACHER_SECTIONS.DUDAS]: renderDudas,
    [TEACHER_SECTIONS.EVALUAR]: renderEvaluar,
    [TEACHER_SECTIONS.APROBAR]: renderAprobar,
    [TEACHER_SECTIONS.EN_VIVO]: renderEnVivo
  };

  const renderer = contentMap[section] || renderWelcome;
  return renderer();
};

// ============================================
// Renderers de secciones
// ============================================

const renderWelcome = () => `
  <div class="card shadow-sm p-4">
    <h2 class="text-danger h3">¡Bienvenido al Panel del Profesor!</h2>
    <p>Selecciona una sección del menú para comenzar.</p>
  </div>
`;

const renderClases = () => `
  <div>
    <h4 class="text-danger mb-4">Subir clases escritas</h4>
    <form class="tarea-upload-area" id="formClaseUpload">
      <div class="mb-3">
        <label for="claseArchivo" class="form-label">Selecciona el archivo de la clase:</label>
        <input type="file" class="form-control" id="claseArchivo" required>
      </div>
      <button type="submit" class="btn btn-danger w-100">Subir clase</button>
      <div class="tarea-file-name mt-3" id="claseFileName"></div>
    </form>
  </div>
`;

const renderTareas = () => `
  <div>
    <h4 class="text-danger mb-4">Preparar tarea</h4>
    <form class="tarea-upload-area" id="formPrepararTarea">
      <div class="mb-3">
        <label for="tareaTitulo" class="form-label">Título de la tarea:</label>
        <input type="text" class="form-control" id="tareaTitulo" required>
      </div>
      <div class="mb-3">
        <label for="tareaDescripcion" class="form-label">Descripción:</label>
        <textarea class="form-control" id="tareaDescripcion" rows="3" required></textarea>
      </div>
      <div class="mb-3">
        <label for="tareaFechaLimite" class="form-label">Fecha límite:</label>
        <input type="date" class="form-control" id="tareaFechaLimite">
      </div>
      <button type="submit" class="btn btn-danger w-100">Crear tarea</button>
      <div class="tarea-file-name mt-3" id="tareaCreadaMsg"></div>
    </form>
  </div>
`;

const renderAlumnos = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Lista de alumnos</h4>
    <p>Alumnos inscritos en tus cursos.</p>
    <table class="table table-hover mt-3">
      <thead class="table-danger">
        <tr>
          <th>Nombre</th>
          <th>Curso</th>
          <th>Progreso</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>María García</td>
          <td>Escritura Creativa</td>
          <td>
            <div class="progress" style="width: 100px;">
              <div class="progress-bar bg-danger" style="width: 75%;">75%</div>
            </div>
          </td>
          <td><button class="btn btn-sm btn-outline-danger">Ver perfil</button></td>
        </tr>
        <tr>
          <td>Carlos López</td>
          <td>Escritura Creativa</td>
          <td>
            <div class="progress" style="width: 100px;">
              <div class="progress-bar bg-danger" style="width: 50%;">50%</div>
            </div>
          </td>
          <td><button class="btn btn-sm btn-outline-danger">Ver perfil</button></td>
        </tr>
      </tbody>
    </table>
  </div>
`;

const renderDudas = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Responder dudas</h4>
    <p>Dudas pendientes de los alumnos.</p>
    <div class="list-group mt-3">
      <div class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">¿Cómo estructuro mi cuento corto?</h6>
          <small class="text-muted">Hace 2 horas</small>
        </div>
        <p class="mb-1 text-muted small">De: María García</p>
        <button class="btn btn-sm btn-danger mt-2">Responder</button>
      </div>
      <div class="list-group-item">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">Dudas sobre el ensayo final</h6>
          <small class="text-muted">Hace 1 día</small>
        </div>
        <p class="mb-1 text-muted small">De: Carlos López</p>
        <button class="btn btn-sm btn-danger mt-2">Responder</button>
      </div>
    </div>
  </div>
`;

const renderEvaluar = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Evaluar alumnos</h4>
    <p>Tareas pendientes de calificación.</p>
    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>Alumno</th>
          <th>Tarea</th>
          <th>Entregada</th>
          <th>Calificar</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>María García</td>
          <td>Cuento corto #1</td>
          <td>28/01/2026</td>
          <td>
            <input type="number" class="form-control form-control-sm" style="width: 80px;" min="0" max="100" placeholder="0-100">
          </td>
        </tr>
      </tbody>
    </table>
    <button class="btn btn-danger mt-3">Guardar calificaciones</button>
  </div>
`;

const renderAprobar = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Aprobar/rechazar curso</h4>
    <p>Aprueba o rechaza el curso de los alumnos que han finalizado.</p>
    <table class="table mt-3">
      <thead class="table-danger">
        <tr>
          <th>Alumno</th>
          <th>Promedio</th>
          <th>Asistencia</th>
          <th>Decisión</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>María García</td>
          <td>85%</td>
          <td>90%</td>
          <td>
            <button class="btn btn-sm btn-success me-1">Aprobar</button>
            <button class="btn btn-sm btn-outline-danger">Rechazar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`;

const renderEnVivo = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Iniciar clases en vivo</h4>
    <p>Inicia una sesión de clase en vivo para tus alumnos.</p>
    <div class="alert alert-info">
      <strong>Próxima clase programada:</strong> Lunes 6:00 PM - Escritura Creativa
    </div>
    <button class="btn btn-danger btn-lg">
      <span class="me-2">🔴</span> Iniciar clase en vivo
    </button>
  </div>
`;

export default TeacherPanel;
