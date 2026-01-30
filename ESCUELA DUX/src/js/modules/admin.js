/**
 * @fileoverview Módulo Admin - Lógica del panel administrativo
 * @module modules/admin
 */

import { appState } from '../core/state.js';
import { $, $$, setHTML, addClass, removeClass, delegate, showAlert } from '../utils/dom.js';
import { getAdminSectionContent, ADMIN_SECTIONS } from '../components/AdminPanel.js';
import { validateForm, isValidEmail, isNotEmpty } from '../utils/validators.js';

/**
 * Clase AdminModule - Gestiona la lógica del panel administrativo
 * @class
 */
class AdminModule {
  #initialized;
  #mockData;

  constructor() {
    this.#initialized = false;
    this.#mockData = this.#initMockData();
  }

  /**
   * Inicializa datos de prueba
   * @returns {Object}
   * @private
   */
  #initMockData() {
    return {
      alumnos: [
        { id: '001', nombre: 'María García', email: 'maria@email.com', curso: 'Escritura Creativa', estadoPago: 'pagado' },
        { id: '002', nombre: 'Carlos López', email: 'carlos@email.com', curso: 'Escritura Creativa', estadoPago: 'pendiente' },
        { id: '003', nombre: 'Ana Martínez', email: 'ana@email.com', curso: 'Narración', estadoPago: 'pagado' }
      ],
      profesores: [
        { id: 'P001', nombre: 'Carolina Eguiguren', email: 'carolina@dux.com', cursos: ['Escritura Creativa', 'Lector Editorial'], estado: 'activo' },
        { id: 'P002', nombre: 'Hexy Marquez', email: 'hexy@dux.com', cursos: ['Redacción', 'Narración'], estado: 'activo' }
      ],
      pagos: [
        { id: 1, alumno: 'Carlos López', curso: 'Escritura Creativa', monto: 150000, vencimiento: '2026-02-05' }
      ]
    };
  }

  /**
   * Inicializa el módulo administrativo
   */
  init() {
    if (this.#initialized) return;
    this.#bindEvents();
    this.#initialized = true;
    console.log('[AdminModule] Inicializado');
  }

  /**
   * Vincula eventos del panel administrativo
   * @private
   */
  #bindEvents() {
    // Navegación del sidebar admin
    delegate(document, 'click', '.admin-sidebar .nav-link', (e, target) => {
      e.preventDefault();
      this.#handleNavigation(target);
    });

    // Acciones rápidas del dashboard
    delegate(document, 'click', '[data-action]', (e, target) => {
      e.preventDefault();
      this.#handleAction(target.dataset.action);
    });

    // Formulario de crear usuario
    delegate(document, 'submit', '#formCrearUsuario', (e) => {
      e.preventDefault();
      this.#handleCreateUser();
    });

    // Formulario de configuración
    delegate(document, 'submit', '#formConfiguracion', (e) => {
      e.preventDefault();
      this.#handleSaveConfig();
    });

    // Editar alumno
    delegate(document, 'click', '#alumnosTable .btn-outline-primary', (e, target) => {
      const row = target.closest('tr');
      const id = row?.querySelector('td:first-child')?.textContent;
      this.#handleEditStudent(id);
    });

    // Eliminar alumno
    delegate(document, 'click', '#alumnosTable .btn-outline-danger', (e, target) => {
      const row = target.closest('tr');
      const id = row?.querySelector('td:first-child')?.textContent;
      this.#handleDeleteStudent(id, row);
    });

    // Confirmar pago
    delegate(document, 'click', '.btn-success[class*="Confirmar"]', (e, target) => {
      if (target.textContent.includes('Confirmar')) {
        this.#handleConfirmPayment(target);
      }
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
    $$('.admin-sidebar .nav-link').forEach(link => removeClass(link, 'active'));
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
    const contentContainer = $('#adminContent');
    if (contentContainer) {
      setHTML(contentContainer, getAdminSectionContent(section));
    }
  }

  /**
   * Maneja acciones rápidas
   * @param {string} action - Nombre de la acción
   * @private
   */
  #handleAction(action) {
    const actions = {
      'create-student': () => this.#navigateToSection(ADMIN_SECTIONS.USUARIOS),
      'create-course': () => this.#navigateToSection(ADMIN_SECTIONS.CURSOS),
      'send-reminder': () => this.#sendReminders(),
      'export-report': () => this.#exportReport(),
      'add-student': () => this.#showAddStudentModal(),
      'add-teacher': () => this.#showAddTeacherModal(),
      'add-course': () => this.#showAddCourseModal()
    };

    const handler = actions[action];
    if (handler) {
      handler();
    } else {
      console.log(`[AdminModule] Acción no implementada: ${action}`);
    }
  }

  /**
   * Navega a una sección
   * @param {string} section - Sección destino
   * @private
   */
  #navigateToSection(section) {
    const navLink = $(`.admin-sidebar .nav-link[data-section="${section}"]`);
    if (navLink) {
      navLink.click();
    }
  }

  /**
   * Envía recordatorios de pago
   * @private
   */
  #sendReminders() {
    const pendingPayments = this.#mockData.alumnos.filter(a => a.estadoPago === 'pendiente');
    alert(`📧 Se enviarían recordatorios a ${pendingPayments.length} alumno(s) con pagos pendientes.`);
  }

  /**
   * Exporta reportes
   * @private
   */
  #exportReport() {
    alert('📊 Generando reporte...\n\nEsta funcionalidad exportaría un archivo Excel/PDF con los datos del sistema.');
  }

  /**
   * Muestra modal para agregar estudiante
   * @private
   */
  #showAddStudentModal() {
    alert('➕ Modal de agregar estudiante\n\nAquí se mostraría un formulario para registrar un nuevo alumno.');
  }

  /**
   * Muestra modal para agregar profesor
   * @private
   */
  #showAddTeacherModal() {
    alert('➕ Modal de agregar profesor\n\nAquí se mostraría un formulario para registrar un nuevo profesor.');
  }

  /**
   * Muestra modal para agregar curso
   * @private
   */
  #showAddCourseModal() {
    alert('➕ Modal de agregar curso\n\nAquí se mostraría un formulario para crear un nuevo curso.');
  }

  /**
   * Maneja la creación de usuario
   * @private
   */
  #handleCreateUser() {
    const nombre = $('#nuevoNombre')?.value?.trim();
    const email = $('#nuevoEmail')?.value?.trim();
    const password = $('#nuevoPassword')?.value;
    const rol = $('#nuevoRol')?.value;

    // Validaciones
    if (!nombre || !email || !password || !rol) {
      showAlert('formCrearUsuario', 'Todos los campos son requeridos.');
      return;
    }

    if (!isValidEmail(email)) {
      showAlert('formCrearUsuario', 'Por favor ingresa un email válido.');
      return;
    }

    // Simular creación
    console.log('[AdminModule] Crear usuario:', { nombre, email, rol });
    
    // Feedback
    const form = $('#formCrearUsuario');
    if (form) {
      form.reset();
      const successDiv = document.createElement('div');
      successDiv.className = 'alert alert-success mt-3';
      successDiv.innerHTML = `✅ Usuario <strong>${nombre}</strong> creado correctamente como <strong>${rol}</strong>.`;
      form.appendChild(successDiv);
      
      setTimeout(() => successDiv.remove(), 3000);
    }
  }

  /**
   * Maneja guardar configuración
   * @private
   */
  #handleSaveConfig() {
    alert('✅ Configuración guardada correctamente.');
  }

  /**
   * Edita un estudiante
   * @param {string} id - ID del estudiante
   * @private
   */
  #handleEditStudent(id) {
    const student = this.#mockData.alumnos.find(a => a.id === id);
    if (student) {
      alert(`✏️ Editar alumno: ${student.nombre}\n\nAquí se abriría un modal para editar los datos.`);
    }
  }

  /**
   * Elimina un estudiante
   * @param {string} id - ID del estudiante
   * @param {Element} row - Fila de la tabla
   * @private
   */
  #handleDeleteStudent(id, row) {
    if (confirm(`¿Estás seguro de eliminar el alumno ${id}?`)) {
      row?.remove();
      this.#mockData.alumnos = this.#mockData.alumnos.filter(a => a.id !== id);
      console.log(`[AdminModule] Alumno ${id} eliminado`);
    }
  }

  /**
   * Confirma un pago
   * @param {Element} button - Botón clickeado
   * @private
   */
  #handleConfirmPayment(button) {
    const row = button.closest('tr');
    if (row) {
      button.textContent = '✅ Pagado';
      button.className = 'btn btn-sm btn-success disabled';
      button.disabled = true;
      row.querySelector('.btn-outline-warning')?.remove();
    }
  }

  /**
   * Obtiene estadísticas del dashboard
   * @returns {Object}
   */
  getStats() {
    return {
      totalAlumnos: this.#mockData.alumnos.length,
      totalProfesores: this.#mockData.profesores.length,
      pagosPendientes: this.#mockData.alumnos.filter(a => a.estadoPago === 'pendiente').length
    };
  }
}

// Singleton
export const adminModule = new AdminModule();
export default adminModule;
