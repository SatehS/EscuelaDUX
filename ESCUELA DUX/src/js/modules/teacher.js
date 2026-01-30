/**
 * @fileoverview Módulo Teacher - Lógica del panel del profesor con API
 * @module modules/teacher
 */

import { TEACHER_SECTIONS } from '../core/config.js';
import { appState } from '../core/state.js';
import { api, ApiError } from '../services/api.js';
import { $, $$, setHTML, addClass, removeClass, delegate, getValue } from '../utils/dom.js';
import { getTeacherSectionContent } from '../components/TeacherPanel.js';

/**
 * Clase TeacherModule - Gestiona la lógica del panel del profesor con backend
 * @class
 */
class TeacherModule {
  #initialized;
  #dashboardData;

  constructor() {
    this.#initialized = false;
    this.#dashboardData = null;
  }

  /**
   * Inicializa el módulo del profesor
   */
  init() {
    if (this.#initialized) return;
    this.#bindEvents();
    this.#initialized = true;
    console.log('[TeacherModule] Inicializado');
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

    // Crear tareas
    delegate(document, 'submit', '#formPrepararTarea', (e) => {
      e.preventDefault();
      this.#handleCreateAssignment();
    });

    // Calificar
    delegate(document, 'click', '.btn-grade-submission', (e, target) => {
      this.#handleGradeSubmission(target);
    });
  }

  /**
   * Carga los datos del dashboard desde la API
   * @returns {Promise<Object>}
   */
  async loadDashboardData() {
    const teacherId = appState.getUserId();
    if (!teacherId) {
      console.warn('[TeacherModule] No hay usuario autenticado');
      return null;
    }

    try {
      appState.setLoading(true);
      const response = await api.getTeacherDashboard(teacherId);
      
      if (response.success && response.data) {
        this.#dashboardData = response.data;
        appState.setDashboardData(response.data);
        console.log('[TeacherModule] Dashboard cargado:', response.data);
        return response.data;
      }
      
      return null;

    } catch (error) {
      console.error('[TeacherModule] Error cargando dashboard:', error);
      return null;
    } finally {
      appState.setLoading(false);
    }
  }

  /**
   * Obtiene los datos del dashboard
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

    $$('.prof-sidebar .nav-link').forEach(link => removeClass(link, 'active'));
    addClass(navLink, 'active');

    appState.setSection(section);
    this.#renderSection(section);
  }

  /**
   * Renderiza una sección específica
   * @param {string} section - Nombre de la sección
   * @private
   */
  #renderSection(section) {
    const contentContainer = $('#profContent');
    if (!contentContainer) return;

    const data = this.getDashboardData();
    let html = getTeacherSectionContent(section);

    if (data) {
      html = this.#enrichContentWithApiData(section, html, data);
    }

    setHTML(contentContainer, html);
  }

  /**
   * Enriquece el contenido con datos de la API
   * @param {string} section
   * @param {string} html
   * @param {Object} data
   * @returns {string}
   * @private
   */
  #enrichContentWithApiData(section, html, data) {
    switch (section) {
      case TEACHER_SECTIONS.ALUMNOS:
        if (data.students && data.students.length > 0) {
          return this.#renderStudentsFromApi(data.students);
        }
        break;

      case TEACHER_SECTIONS.EVALUAR:
        if (data.pending_submissions && data.pending_submissions.length > 0) {
          return this.#renderPendingSubmissionsFromApi(data.pending_submissions);
        }
        break;

      case TEACHER_SECTIONS.TAREAS:
        return this.#renderCreateAssignmentForm(data.courses || []);
    }
    
    return html;
  }

  /**
   * Renderiza lista de estudiantes desde API
   * @param {Array} students
   * @returns {string}
   * @private
   */
  #renderStudentsFromApi(students) {
    const rows = students.map(s => `
      <tr>
        <td>
          <img src="${s.avatar_url || 'public/assets/images/avatar-alumno.png'}" 
               alt="${s.name}" class="student-avatar-img me-2" style="width:32px;height:32px;">
          ${s.name}
        </td>
        <td>${s.email}</td>
        <td>${s.course.title}</td>
        <td><small class="text-muted">${s.enrolled_at}</small></td>
      </tr>
    `).join('');

    return `
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <h5 class="mb-0 text-danger">Lista de Alumnos (${students.length})</h5>
        </div>
        <div class="card-body">
          <table class="table table-hover">
            <thead class="table-danger">
              <tr><th>Alumno</th><th>Email</th><th>Curso</th><th>Inscrito</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza entregas pendientes de calificar
   * @param {Array} submissions
   * @returns {string}
   * @private
   */
  #renderPendingSubmissionsFromApi(submissions) {
    const rows = submissions.map(s => `
      <tr data-submission-id="${s.id}">
        <td>${s.student.name}</td>
        <td>${s.assignment.title}</td>
        <td>${s.course.title}</td>
        <td><a href="${s.file_url}" target="_blank" class="btn btn-sm btn-outline-primary">Ver</a></td>
        <td>
          <input type="number" class="form-control form-control-sm grade-input" 
                 style="width:80px" min="0" max="100" placeholder="0-100">
        </td>
        <td>
          <button class="btn btn-sm btn-success btn-grade-submission">Guardar</button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <h5 class="mb-0 text-danger">Entregas Pendientes (${submissions.length})</h5>
        </div>
        <div class="card-body">
          <table class="table table-hover">
            <thead class="table-danger">
              <tr><th>Alumno</th><th>Tarea</th><th>Curso</th><th>Archivo</th><th>Nota</th><th>Acción</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza formulario de crear tarea
   * @param {Array} courses
   * @returns {string}
   * @private
   */
  #renderCreateAssignmentForm(courses) {
    const courseOptions = courses.map(c => 
      `<option value="${c.id}">${c.title}</option>`
    ).join('');

    return `
      <div>
        <h4 class="text-danger mb-4">Crear Nueva Tarea</h4>
        <form class="tarea-upload-area" id="formPrepararTarea" style="max-width:500px;">
          <div class="mb-3">
            <label for="tareasCurso" class="form-label">Curso:</label>
            <select class="form-select" id="tareasCurso" required>
              <option value="">Selecciona un curso</option>
              ${courseOptions}
            </select>
          </div>
          <div class="mb-3">
            <label for="tareaTitulo" class="form-label">Título de la tarea:</label>
            <input type="text" class="form-control" id="tareaTitulo" required>
          </div>
          <div class="mb-3">
            <label for="tareaDescripcion" class="form-label">Descripción:</label>
            <textarea class="form-control" id="tareaDescripcion" rows="3"></textarea>
          </div>
          <div class="mb-3">
            <label for="tareaFechaLimite" class="form-label">Fecha límite:</label>
            <input type="date" class="form-control" id="tareaFechaLimite">
          </div>
          <button type="submit" class="btn btn-danger w-100">Crear tarea</button>
          <div class="mt-3" id="tareaCreadaMsg"></div>
        </form>
      </div>
    `;
  }

  /**
   * Maneja la selección de archivo
   * @param {HTMLInputElement} input
   * @param {string} displaySelector
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
        <span class="text-success">✅ ¡Clase subida correctamente!</span><br>
        <small>Archivo: ${fileInput.files[0].name}</small>
      `;
      fileInput.value = '';
    }
  }

  /**
   * Maneja la creación de tarea
   * @private
   */
  async #handleCreateAssignment() {
    const courseId = getValue('#tareasCurso');
    const title = getValue('#tareaTitulo');
    const description = getValue('#tareaDescripcion');
    const dueDate = getValue('#tareaFechaLimite');
    const teacherId = appState.getUserId();

    if (!courseId || !title) {
      alert('Curso y título son requeridos');
      return;
    }

    try {
      const response = await api.createAssignment({
        course_id: courseId,
        teacher_id: teacherId,
        title,
        description,
        due_date: dueDate || null
      });

      if (response.success) {
        const msg = $('#tareaCreadaMsg');
        if (msg) {
          msg.innerHTML = `
            <div class="alert alert-success">
              ✅ Tarea "<strong>${title}</strong>" creada exitosamente.
            </div>
          `;
        }
        // Limpiar formulario
        $('#tareaTitulo').value = '';
        $('#tareaDescripcion').value = '';
        $('#tareaFechaLimite').value = '';
      }

    } catch (error) {
      console.error('[TeacherModule] Error creando tarea:', error);
      alert('Error al crear la tarea. Intenta nuevamente.');
    }
  }

  /**
   * Maneja la calificación de una entrega
   * @param {Element} button
   * @private
   */
  async #handleGradeSubmission(button) {
    const row = button.closest('tr');
    const submissionId = row?.dataset?.submissionId;
    const gradeInput = row?.querySelector('.grade-input');
    const grade = parseFloat(gradeInput?.value);

    if (!submissionId || isNaN(grade)) {
      alert('Ingresa una calificación válida');
      return;
    }

    try {
      const response = await api.gradeSubmission({
        submission_id: submissionId,
        grade,
        teacher_id: appState.getUserId()
      });

      if (response.success) {
        button.textContent = '✅ Guardado';
        button.disabled = true;
        button.className = 'btn btn-sm btn-outline-success disabled';
      }

    } catch (error) {
      console.error('[TeacherModule] Error calificando:', error);
      alert('Error al guardar la calificación.');
    }
  }
}

// Singleton
export const teacherModule = new TeacherModule();
export default teacherModule;
