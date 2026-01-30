/**
 * @fileoverview Módulo Student - Panel y funcionalidades del alumno
 * @module modules/student
 */

import { STUDENT_SECTIONS, DOM_SELECTORS } from '../core/config.js';
import { appState } from '../core/state.js';
import { $, $$, setHTML, addClass, removeClass, delegate } from '../utils/dom.js';

/**
 * Clase StudentModule - Gestiona el panel del alumno
 * @class
 */
class StudentModule {
  #initialized;
  #contentContainer;

  constructor() {
    this.#initialized = false;
    this.#contentContainer = null;
  }

  /**
   * Inicializa el módulo del estudiante
   */
  init() {
    if (this.#initialized) return;
    
    this.#contentContainer = $(DOM_SELECTORS.STUDENT_CONTENT);
    this.#bindEvents();
    this.#initialized = true;
  }

  /**
   * Vincula eventos del panel de alumno
   * @private
   */
  #bindEvents() {
    // Navegación del sidebar
    delegate(document, 'click', '.student-sidebar .nav-link', (e, target) => {
      e.preventDefault();
      this.#handleNavigation(target);
    });

    // Upload de tareas
    delegate(document, 'change', '#tareaArchivo', (e) => {
      this.#handleFileSelect(e.target);
    });

    delegate(document, 'submit', '#formTareaUpload', (e) => {
      e.preventDefault();
      this.#handleTaskUpload();
    });
  }

  /**
   * Maneja la navegación del sidebar
   * @param {Element} navLink - Link clickeado
   * @private
   */
  #handleNavigation(navLink) {
    // Actualizar estado activo
    $$('.student-sidebar .nav-link').forEach(link => removeClass(link, 'active'));
    addClass(navLink, 'active');

    const section = navLink.dataset.section;
    appState.setSection(section);
    this.#renderSection(section);
  }

  /**
   * Renderiza una sección específica
   * @param {string} section - Nombre de la sección
   * @private
   */
  #renderSection(section) {
    const renderers = {
      [STUDENT_SECTIONS.CLASES]: () => this.#renderClases(),
      [STUDENT_SECTIONS.TAREAS]: () => this.#renderTareas(),
      [STUDENT_SECTIONS.MATERIAL]: () => this.#renderMaterial(),
      [STUDENT_SECTIONS.PLANTILLAS]: () => this.#renderPlantillas(),
      [STUDENT_SECTIONS.HORARIO]: () => this.#renderHorario(),
      [STUDENT_SECTIONS.LINK]: () => this.#renderLink(),
      [STUDENT_SECTIONS.NOTAS]: () => this.#renderNotas(),
      [STUDENT_SECTIONS.CERTIFICADO]: () => this.#renderCertificado(),
      [STUDENT_SECTIONS.PREGUNTAS]: () => this.#renderPreguntas()
    };

    const renderer = renderers[section] || (() => this.#renderWelcome());
    setHTML(this.#contentContainer, renderer());
  }

  /**
   * Renderiza la vista de bienvenida
   * @returns {string}
   * @private
   */
  #renderWelcome() {
    return `
      <div class="card shadow-sm p-4">
        <h3 class="text-danger">¡Bienvenido al Panel del Alumno!</h3>
        <p>Selecciona una sección del menú para comenzar.</p>
      </div>
    `;
  }

  /**
   * Renderiza la sección de clases grabadas
   * @returns {string}
   * @private
   */
  #renderClases() {
    return `
      <div>
        <h4 class="text-danger mb-4">Clases grabadas</h4>
        <div class="clases-lista">
          <div class="clase-card">
            <iframe src="https://www.youtube.com/embed/ysz5S6PUM-U" allowfullscreen></iframe>
            <div class="clase-title">Clase 1: Introducción</div>
          </div>
          <div class="clase-card">
            <iframe src="https://www.youtube.com/embed/jfKfPfyJRdk" allowfullscreen></iframe>
            <div class="clase-title">Clase 2: Técnicas de Escritura</div>
          </div>
          <div class="clase-card">
            <iframe src="https://www.youtube.com/embed/2Vv-BfVoq4g" allowfullscreen></iframe>
            <div class="clase-title">Clase 3: Narración Creativa</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza la sección de tareas
   * @returns {string}
   * @private
   */
  #renderTareas() {
    return `
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
  }

  /**
   * Renderiza la sección de material escrito
   * @returns {string}
   * @private
   */
  #renderMaterial() {
    return `
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
  }

  /**
   * Renderiza la sección de plantillas
   * @returns {string}
   * @private
   */
  #renderPlantillas() {
    return `
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
  }

  /**
   * Renderiza la sección de horario
   * @returns {string}
   * @private
   */
  #renderHorario() {
    return `
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
  }

  /**
   * Renderiza la sección de link en vivo
   * @returns {string}
   * @private
   */
  #renderLink() {
    return `
      <div class="card shadow-sm p-4">
        <h4 class="text-danger">Link de clases en vivo</h4>
        <p>Accede al enlace para tus clases en vivo.</p>
        <a href="#" class="btn btn-danger btn-lg mt-3">
          <span class="me-2">🔴</span> Unirse a clase en vivo
        </a>
      </div>
    `;
  }

  /**
   * Renderiza la sección de notas
   * @returns {string}
   * @private
   */
  #renderNotas() {
    return `
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
  }

  /**
   * Renderiza la sección de certificado
   * @returns {string}
   * @private
   */
  #renderCertificado() {
    return `
      <div class="card shadow-sm p-4">
        <h4 class="text-danger">Certificado</h4>
        <p>Descarga tu certificado al finalizar el curso.</p>
        <div class="alert alert-info">
          Tu certificado estará disponible una vez completes todas las evaluaciones.
        </div>
      </div>
    `;
  }

  /**
   * Renderiza la sección de preguntas
   * @returns {string}
   * @private
   */
  #renderPreguntas() {
    return `
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
  }

  /**
   * Maneja la selección de archivo
   * @param {HTMLInputElement} input - Input de archivo
   * @private
   */
  #handleFileSelect(input) {
    const fileName = $('#tareaFileName');
    if (fileName && input.files[0]) {
      fileName.textContent = `Archivo seleccionado: ${input.files[0].name}`;
    }
  }

  /**
   * Maneja la subida de tarea
   * @private
   */
  #handleTaskUpload() {
    const fileInput = $('#tareaArchivo');
    const fileName = $('#tareaFileName');
    
    if (fileInput?.files[0] && fileName) {
      fileName.innerHTML = `
        <span class="text-success">¡Tarea subida correctamente!</span><br>
        Archivo: ${fileInput.files[0].name}
      `;
    }
  }
}

// Singleton
export const studentModule = new StudentModule();
export default studentModule;
