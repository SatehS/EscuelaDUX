/**
 * @fileoverview Módulo Student - Lógica del panel del alumno con API
 * @module modules/student
 */

import { STUDENT_SECTIONS } from '../core/config.js';
import { appState } from '../core/state.js';
import { api, ApiError } from '../services/api.js';
import { $, $$, setHTML, addClass, removeClass, delegate } from '../utils/dom.js';
import { getStudentSectionContent } from '../components/StudentPanel.js';

/**
 * Clase StudentModule - Gestiona la lógica del panel del alumno con backend
 * @class
 */
class StudentModule {
  #initialized;
  #dashboardData;

  constructor() {
    this.#initialized = false;
    this.#dashboardData = null;
  }

  /**
   * Inicializa el módulo del estudiante
   */
  init() {
    if (this.#initialized) return;
    this.#bindEvents();
    this.#initialized = true;
    console.log('[StudentModule] Inicializado');
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

    // Formulario de preguntas
    delegate(document, 'submit', '#formPreguntas', (e) => {
      e.preventDefault();
      this.#handleQuestionSubmit();
    });
  }

  /**
   * Carga los datos del dashboard desde la API
   * @returns {Promise<Object>}
   */
  async loadDashboardData() {
    const studentId = appState.getUserId();
    if (!studentId) {
      console.warn('[StudentModule] No hay usuario autenticado');
      return null;
    }

    try {
      appState.setLoading(true);
      const response = await api.getStudentDashboard(studentId);
      
      if (response.success && response.data) {
        this.#dashboardData = response.data;
        appState.setDashboardData(response.data);
        console.log('[StudentModule] Dashboard cargado:', response.data);
        return response.data;
      }
      
      return null;

    } catch (error) {
      console.error('[StudentModule] Error cargando dashboard:', error);
      return null;
    } finally {
      appState.setLoading(false);
    }
  }

  /**
   * Obtiene los datos del dashboard (caché o API)
   * @returns {Object|null}
   */
  getDashboardData() {
    return this.#dashboardData || appState.getDashboardData();
  }

  /**
   * Maneja la navegación del sidebar
   * @param {Element} navLink - Link clickeado
   * @private
   */
  #handleNavigation(navLink) {
    const section = navLink.dataset.section;
    if (!section) return;

    // Actualizar estado activo en sidebar
    $$('.student-sidebar .nav-link').forEach(link => removeClass(link, 'active'));
    addClass(navLink, 'active');

    // Actualizar estado y renderizar
    appState.setSection(section);
    this.#renderSection(section);
  }

  /**
   * Renderiza una sección específica
   * @param {string} section - Nombre de la sección
   * @private
   */
  #renderSection(section) {
    const contentContainer = $('#studentContent');
    if (!contentContainer) return;

    // Renderizar contenido con datos del dashboard
    const data = this.getDashboardData();
    let html = getStudentSectionContent(section);

    // Si tenemos datos de la API, enriquecer el contenido
    if (data) {
      html = this.#enrichContentWithApiData(section, html, data);
    }

    setHTML(contentContainer, html);
  }

  /**
   * Enriquece el contenido con datos de la API
   * @param {string} section - Sección actual
   * @param {string} html - HTML base
   * @param {Object} data - Datos de la API
   * @returns {string}
   * @private
   */
  #enrichContentWithApiData(section, html, data) {
    switch (section) {
      case STUDENT_SECTIONS.CLASES:
        if (data.recordings && data.recordings.length > 0) {
          return this.#renderRecordingsFromApi(data.recordings);
        }
        break;

      case STUDENT_SECTIONS.NOTAS:
        if (data.assignments) {
          return this.#renderGradesFromApi(data.assignments);
        }
        break;

      case STUDENT_SECTIONS.TAREAS:
        if (data.assignments) {
          return this.#renderAssignmentsFromApi(data.assignments);
        }
        break;
    }
    
    return html;
  }

  /**
   * Renderiza clases desde datos de API
   * @param {Array} recordings
   * @returns {string}
   * @private
   */
  #renderRecordingsFromApi(recordings) {
    const recordingCards = recordings.map(r => `
      <div class="clase-card">
        <iframe src="${r.video_url}" allowfullscreen title="${r.title}"></iframe>
        <div class="clase-title">${r.title}</div>
        <small class="text-muted px-3 pb-2 d-block">${r.course_title}</small>
      </div>
    `).join('');

    return `
      <div>
        <h4 class="text-danger mb-4">Clases grabadas</h4>
        <div class="clases-lista">${recordingCards}</div>
      </div>
    `;
  }

  /**
   * Renderiza notas desde datos de API
   * @param {Array} assignments
   * @returns {string}
   * @private
   */
  #renderGradesFromApi(assignments) {
    const rows = assignments.map(a => {
      const submission = a.submission;
      let grade = 'Pendiente';
      let status = '<span class="badge bg-secondary">No entregada</span>';

      if (submission) {
        if (submission.grade !== null) {
          grade = `${submission.grade}/${a.max_grade}`;
          status = submission.grade >= (a.max_grade * 0.6) 
            ? '<span class="badge bg-success">Aprobado</span>'
            : '<span class="badge bg-danger">Reprobado</span>';
        } else {
          grade = 'En revisión';
          status = '<span class="badge bg-warning text-dark">En revisión</span>';
        }
      }

      return `
        <tr>
          <td>${a.title}</td>
          <td>${a.course_title}</td>
          <td>${grade}</td>
          <td>${status}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="card shadow-sm p-4">
        <h4 class="text-danger">Notas</h4>
        <table class="table table-striped mt-3">
          <thead>
            <tr><th>Tarea</th><th>Curso</th><th>Calificación</th><th>Estado</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  /**
   * Renderiza tareas desde datos de API
   * @param {Array} assignments
   * @returns {string}
   * @private
   */
  #renderAssignmentsFromApi(assignments) {
    const pending = assignments.filter(a => !a.submission);
    
    const taskList = pending.map(a => `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title text-danger">${a.title}</h5>
          <p class="card-text">${a.description || ''}</p>
          <p class="text-muted small">
            <strong>Curso:</strong> ${a.course_title}<br>
            <strong>Fecha límite:</strong> ${a.due_date || 'Sin fecha límite'}
          </p>
          <form class="tarea-upload-area mt-3" data-assignment-id="${a.id}">
            <input type="file" class="form-control mb-2" name="file" required>
            <button type="submit" class="btn btn-danger btn-sm">Subir tarea</button>
          </form>
        </div>
      </div>
    `).join('');

    return `
      <div>
        <h4 class="text-danger mb-4">Tareas Pendientes (${pending.length})</h4>
        ${pending.length > 0 ? taskList : '<p class="text-muted">No tienes tareas pendientes.</p>'}
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
  async #handleTaskUpload() {
    const fileInput = $('#tareaArchivo');
    const fileName = $('#tareaFileName');
    
    if (!fileInput?.files[0]) {
      alert('Selecciona un archivo');
      return;
    }

    const assignmentId = fileInput.closest('form')?.dataset?.assignmentId;
    const studentId = appState.getUserId();

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('student_id', studentId);
    
    if (assignmentId) {
      formData.append('assignment_id', assignmentId);
    }

    try {
      const response = await api.uploadSubmission(formData);
      
      if (response.success) {
        if (fileName) {
          fileName.innerHTML = `
            <span class="text-success">✅ ¡Tarea subida correctamente!</span><br>
            <small>Archivo: ${fileInput.files[0].name}</small>
          `;
        }
        fileInput.value = '';
      }

    } catch (error) {
      console.error('[StudentModule] Error subiendo tarea:', error);
      alert('Error al subir la tarea. Intenta nuevamente.');
    }
  }

  /**
   * Maneja el envío de preguntas
   * @private
   */
  #handleQuestionSubmit() {
    const textarea = $('#preguntaTexto');
    if (textarea?.value.trim()) {
      const container = textarea.closest('form');
      if (container) {
        container.innerHTML = `
          <div class="alert alert-success">
            ✅ ¡Tu pregunta ha sido enviada al profesor!
          </div>
        `;
      }
    }
  }
}

// Singleton
export const studentModule = new StudentModule();
export default studentModule;
