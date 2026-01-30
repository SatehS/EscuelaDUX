/**
 * @fileoverview Módulo Teacher - Panel y funcionalidades del profesor
 * @module modules/teacher
 */

import { TEACHER_SECTIONS, DOM_SELECTORS } from '../core/config.js';
import { appState } from '../core/state.js';
import { $, $$, setHTML, addClass, removeClass, delegate } from '../utils/dom.js';

/**
 * Clase TeacherModule - Gestiona el panel del profesor
 * @class
 */
class TeacherModule {
  #initialized;
  #contentContainer;

  constructor() {
    this.#initialized = false;
    this.#contentContainer = null;
  }

  /**
   * Inicializa el módulo del profesor
   */
  init() {
    if (this.#initialized) return;
    
    this.#contentContainer = $(DOM_SELECTORS.TEACHER_CONTENT);
    this.#bindEvents();
    this.#initialized = true;
  }

  /**
   * Vincula eventos del panel de profesor
   * @private
   */
  #bindEvents() {
    // Navegación del sidebar
    delegate(document, 'click', '.prof-sidebar .nav-link', (e, target) => {
      e.preventDefault();
      this.#handleNavigation(target);
    });

    // Upload de clases
    delegate(document, 'change', '#claseArchivo', (e) => {
      this.#handleFileSelect(e.target, '#claseFileName');
    });

    delegate(document, 'submit', '#formClaseUpload', (e) => {
      e.preventDefault();
      this.#handleClassUpload();
    });

    // Preparar tareas
    delegate(document, 'submit', '#formPrepararTarea', (e) => {
      e.preventDefault();
      this.#handleTaskCreation();
    });
  }

  /**
   * Maneja la navegación del sidebar
   * @param {Element} navLink - Link clickeado
   * @private
   */
  #handleNavigation(navLink) {
    // Actualizar estado activo
    $$('.prof-sidebar .nav-link').forEach(link => removeClass(link, 'active'));
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
      [TEACHER_SECTIONS.CLASES]: () => this.#renderClases(),
      [TEACHER_SECTIONS.TAREAS]: () => this.#renderTareas(),
      [TEACHER_SECTIONS.ALUMNOS]: () => this.#renderAlumnos(),
      [TEACHER_SECTIONS.DUDAS]: () => this.#renderDudas(),
      [TEACHER_SECTIONS.EVALUAR]: () => this.#renderEvaluar(),
      [TEACHER_SECTIONS.APROBAR]: () => this.#renderAprobar(),
      [TEACHER_SECTIONS.EN_VIVO]: () => this.#renderEnVivo()
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
        <h3 class="text-danger">¡Bienvenido al Panel del Profesor!</h3>
        <p>Selecciona una sección del menú para comenzar.</p>
      </div>
    `;
  }

  /**
   * Renderiza la sección de subir clases
   * @returns {string}
   * @private
   */
  #renderClases() {
    return `
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
  }

  /**
   * Renderiza la sección de preparar tareas
   * @returns {string}
   * @private
   */
  #renderTareas() {
    return `
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
  }

  /**
   * Renderiza la sección de lista de alumnos
   * @returns {string}
   * @private
   */
  #renderAlumnos() {
    return `
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
  }

  /**
   * Renderiza la sección de responder dudas
   * @returns {string}
   * @private
   */
  #renderDudas() {
    return `
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
  }

  /**
   * Renderiza la sección de evaluar alumnos
   * @returns {string}
   * @private
   */
  #renderEvaluar() {
    return `
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
  }

  /**
   * Renderiza la sección de aprobar/rechazar
   * @returns {string}
   * @private
   */
  #renderAprobar() {
    return `
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
  }

  /**
   * Renderiza la sección de clases en vivo
   * @returns {string}
   * @private
   */
  #renderEnVivo() {
    return `
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
  }

  /**
   * Maneja la selección de archivo
   * @param {HTMLInputElement} input - Input de archivo
   * @param {string} displaySelector - Selector del elemento donde mostrar nombre
   * @private
   */
  #handleFileSelect(input, displaySelector) {
    const display = $(displaySelector);
    if (display && input.files[0]) {
      display.textContent = `Archivo seleccionado: ${input.files[0].name}`;
    }
  }

  /**
   * Maneja la subida de clase
   * @private
   */
  #handleClassUpload() {
    const fileInput = $('#claseArchivo');
    const fileName = $('#claseFileName');
    
    if (fileInput?.files[0] && fileName) {
      fileName.innerHTML = `
        <span class="text-success">¡Clase subida correctamente!</span><br>
        Archivo: ${fileInput.files[0].name}
      `;
    }
  }

  /**
   * Maneja la creación de tarea
   * @private
   */
  #handleTaskCreation() {
    const titulo = $('#tareaTitulo')?.value;
    const msg = $('#tareaCreadaMsg');
    
    if (titulo && msg) {
      msg.innerHTML = `
        <span class="text-success">¡Tarea creada correctamente!</span><br>
        Título: ${titulo}
      `;
    }
  }
}

// Singleton
export const teacherModule = new TeacherModule();
export default teacherModule;
