/**
 * @fileoverview Módulo Teacher - Lógica del panel del profesor
 * @module modules/teacher
 */

import { TEACHER_SECTIONS } from '../core/config.js';
import { appState } from '../core/state.js';
import { $, $$, setHTML, addClass, removeClass, delegate } from '../utils/dom.js';
import { getTeacherSectionContent } from '../components/TeacherPanel.js';

/**
 * Clase TeacherModule - Gestiona la lógica del panel del profesor
 * @class
 */
class TeacherModule {
  #initialized;

  constructor() {
    this.#initialized = false;
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
    const section = navLink.dataset.section;
    if (!section) return;

    // Actualizar estado activo
    $$('.prof-sidebar .nav-link').forEach(link => removeClass(link, 'active'));
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
    const contentContainer = $('#profContent');
    if (contentContainer) {
      setHTML(contentContainer, getTeacherSectionContent(section));
    }
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
  #handleTaskCreation() {
    const titulo = $('#tareaTitulo')?.value;
    const msg = $('#tareaCreadaMsg');
    
    if (titulo && msg) {
      msg.innerHTML = `
        <span class="text-success">✅ ¡Tarea creada correctamente!</span><br>
        <small>Título: ${titulo}</small>
      `;
      $('#tareaTitulo').value = '';
      $('#tareaDescripcion').value = '';
    }
  }
}

// Singleton
export const teacherModule = new TeacherModule();
export default teacherModule;
