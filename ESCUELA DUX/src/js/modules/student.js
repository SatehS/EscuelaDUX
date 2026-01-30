/**
 * @fileoverview Módulo Student - Lógica del panel del alumno
 * @module modules/student
 */

import { STUDENT_SECTIONS } from '../core/config.js';
import { appState } from '../core/state.js';
import { router } from '../core/router.js';
import { $, $$, setHTML, addClass, removeClass, delegate } from '../utils/dom.js';
import { getStudentSectionContent } from '../components/StudentPanel.js';

/**
 * Clase StudentModule - Gestiona la lógica del panel del alumno
 * @class
 */
class StudentModule {
  #initialized;

  constructor() {
    this.#initialized = false;
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
    if (contentContainer) {
      setHTML(contentContainer, getStudentSectionContent(section));
    }
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
        <span class="text-success">✅ ¡Tarea subida correctamente!</span><br>
        <small>Archivo: ${fileInput.files[0].name}</small>
      `;
      fileInput.value = '';
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
          <button type="button" class="btn btn-outline-danger" onclick="location.reload()">
            Hacer otra pregunta
          </button>
        `;
      }
    }
  }
}

// Singleton
export const studentModule = new StudentModule();
export default studentModule;
