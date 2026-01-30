/**
 * @fileoverview Componente StudentPanel - Panel completo del alumno
 * @module components/StudentPanel
 */

import { STUDENT_SECTIONS } from '../core/config.js';
import { appState } from '../core/state.js';

/**
 * Renderiza el panel del alumno
 * @returns {string} HTML del panel
 */
export const StudentPanel = () => {
  const currentSection = appState.getCurrentSection() || STUDENT_SECTIONS.CLASES;
  
  return `
    <main class="container my-4">
      <section class="student-layout" aria-label="Panel del alumno">
        ${StudentSidebar(currentSection)}
        <div class="student-main">
          ${StudentHeader()}
          <div id="studentContent" class="student-content">
            ${getStudentSectionContent(currentSection)}
          </div>
        </div>
      </section>
    </main>
  `;
};

/**
 * Renderiza el sidebar del alumno
 * @param {string} activeSection - Sección activa
 * @returns {string} HTML del sidebar
 */
const StudentSidebar = (activeSection) => {
  const menuItems = [
    { section: STUDENT_SECTIONS.CLASES, icon: '🎥', label: 'Clases grabadas' },
    { section: STUDENT_SECTIONS.MATERIAL, icon: '📄', label: 'Material escrito' },
    { section: STUDENT_SECTIONS.PLANTILLAS, icon: '📑', label: 'Plantillas' },
    { section: STUDENT_SECTIONS.HORARIO, icon: '🕒', label: 'Horario en vivo' },
    { section: STUDENT_SECTIONS.LINK, icon: '🔗', label: 'Link en vivo' },
    { section: STUDENT_SECTIONS.TAREAS, icon: '📝', label: 'Tareas' },
    { section: STUDENT_SECTIONS.NOTAS, icon: '📊', label: 'Notas' },
    { section: STUDENT_SECTIONS.CERTIFICADO, icon: '🎓', label: 'Certificado' },
    { section: STUDENT_SECTIONS.PREGUNTAS, icon: '❓', label: 'Preguntas al profesor' }
  ];

  return `
    <nav class="student-sidebar" aria-label="Menú del alumno">
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
 * Renderiza el header del panel de alumno
 * @returns {string} HTML del header
 */
const StudentHeader = () => {
  const userName = appState.getUserName() || 'Alumno(a)';
  
  return `
    <header class="student-header d-flex justify-content-between align-items-center p-3 mb-4">
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
export const getStudentSectionContent = (section) => {
  const contentMap = {
    [STUDENT_SECTIONS.CLASES]: renderClases,
    [STUDENT_SECTIONS.MATERIAL]: renderMaterial,
    [STUDENT_SECTIONS.PLANTILLAS]: renderPlantillas,
    [STUDENT_SECTIONS.HORARIO]: renderHorario,
    [STUDENT_SECTIONS.LINK]: renderLink,
    [STUDENT_SECTIONS.TAREAS]: renderTareas,
    [STUDENT_SECTIONS.NOTAS]: renderNotas,
    [STUDENT_SECTIONS.CERTIFICADO]: renderCertificado,
    [STUDENT_SECTIONS.PREGUNTAS]: renderPreguntas
  };

  const renderer = contentMap[section] || renderWelcome;
  return renderer();
};

// ============================================
// Renderers de secciones
// ============================================

const renderWelcome = () => `
  <div class="card shadow-sm p-4">
    <h2 class="text-danger h3">¡Bienvenido al Panel del Alumno!</h2>
    <p>Selecciona una sección del menú para comenzar.</p>
  </div>
`;

const renderClases = () => `
  <div>
    <h4 class="text-danger mb-4">Clases grabadas</h4>
    <div class="clases-lista">
      <div class="clase-card">
        <iframe src="https://www.youtube.com/embed/ysz5S6PUM-U" allowfullscreen title="Clase 1"></iframe>
        <div class="clase-title">Clase 1: Introducción</div>
      </div>
      <div class="clase-card">
        <iframe src="https://www.youtube.com/embed/jfKfPfyJRdk" allowfullscreen title="Clase 2"></iframe>
        <div class="clase-title">Clase 2: Técnicas de Escritura</div>
      </div>
      <div class="clase-card">
        <iframe src="https://www.youtube.com/embed/2Vv-BfVoq4g" allowfullscreen title="Clase 3"></iframe>
        <div class="clase-title">Clase 3: Narración Creativa</div>
      </div>
    </div>
  </div>
`;

const renderTareas = () => `
  <div>
    <h4 class="text-danger mb-4">Subir Tareas</h4>
    <form class="tarea-upload-area" id="formTareaUpload">
      <div class="mb-3">
        <label for="tareaArchivo" class="form-label">Selecciona tu archivo:</label>
        <input type="file" class="form-control" id="tareaArchivo" required>
      </div>
      <button type="submit" class="btn btn-danger w-100">Subir tarea</button>
      <div class="tarea-file-name mt-3" id="tareaFileName"></div>
    </form>
  </div>
`;

const renderMaterial = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Material escrito</h4>
    <p>Aquí encontrarás material escrito del curso.</p>
    <ul class="list-group list-group-flush">
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Guía de Escritura Creativa</span>
        <button class="btn btn-outline-danger btn-sm">Descargar</button>
      </li>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Manual de Estilo</span>
        <button class="btn btn-outline-danger btn-sm">Descargar</button>
      </li>
    </ul>
  </div>
`;

const renderPlantillas = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Plantillas</h4>
    <p>Descarga y usa las plantillas proporcionadas.</p>
    <ul class="list-group list-group-flush">
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Plantilla de Cuento Corto</span>
        <button class="btn btn-outline-danger btn-sm">Descargar</button>
      </li>
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>Plantilla de Ensayo</span>
        <button class="btn btn-outline-danger btn-sm">Descargar</button>
      </li>
    </ul>
  </div>
`;

const renderHorario = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Horario de clases en vivo</h4>
    <p>Consulta el horario de tus clases en vivo.</p>
    <table class="table table-bordered mt-3">
      <thead class="table-danger">
        <tr>
          <th>Día</th>
          <th>Horario</th>
          <th>Tema</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Lunes</td>
          <td>6:00 PM - 8:00 PM</td>
          <td>Escritura Creativa</td>
        </tr>
        <tr>
          <td>Miércoles</td>
          <td>6:00 PM - 8:00 PM</td>
          <td>Taller Práctico</td>
        </tr>
      </tbody>
    </table>
  </div>
`;

const renderLink = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Link de clases en vivo</h4>
    <p>Accede al enlace para tus clases en vivo.</p>
    <a href="#" class="btn btn-danger btn-lg mt-3">
      <span class="me-2">🔴</span> Unirse a clase en vivo
    </a>
  </div>
`;

const renderNotas = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Notas</h4>
    <p>Consulta tus notas de aprobados o reprobados.</p>
    <table class="table table-striped mt-3">
      <thead>
        <tr>
          <th>Evaluación</th>
          <th>Calificación</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Tarea 1</td>
          <td>85/100</td>
          <td><span class="badge bg-success">Aprobado</span></td>
        </tr>
        <tr>
          <td>Tarea 2</td>
          <td>Pendiente</td>
          <td><span class="badge bg-warning text-dark">En revisión</span></td>
        </tr>
      </tbody>
    </table>
  </div>
`;

const renderCertificado = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Certificado</h4>
    <p>Descarga tu certificado al finalizar el curso.</p>
    <div class="alert alert-info">
      Tu certificado estará disponible una vez completes todas las evaluaciones.
    </div>
  </div>
`;

const renderPreguntas = () => `
  <div class="card shadow-sm p-4">
    <h4 class="text-danger">Preguntas al profesor</h4>
    <p>Envía tus preguntas al profesor desde aquí.</p>
    <form id="formPreguntas">
      <div class="mb-3">
        <label for="preguntaTexto" class="form-label">Tu pregunta:</label>
        <textarea class="form-control" id="preguntaTexto" rows="4" placeholder="Escribe tu pregunta aquí..."></textarea>
      </div>
      <button type="submit" class="btn btn-danger">Enviar pregunta</button>
    </form>
  </div>
`;

export default StudentPanel;
