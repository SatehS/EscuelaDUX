/**
 * @fileoverview Módulo Admin - Lógica del panel administrativo con API
 * @module modules/admin
 */

import { appState } from '../core/state.js';
import { api, ApiError } from '../services/api.js';
import { $, $$, setHTML, addClass, removeClass, delegate, getValue } from '../utils/dom.js';
import { getAdminSectionContent, ADMIN_SECTIONS } from '../components/AdminPanel.js';

/**
 * Clase AdminModule - Gestiona la lógica del panel administrativo con backend
 * @class
 */
class AdminModule {
  #initialized;
  #stats;
  #users;
  #enrollments;

  constructor() {
    this.#initialized = false;
    this.#stats = null;
    this.#users = null;
    this.#enrollments = null;
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

    // Acciones rápidas
    delegate(document, 'click', '[data-action]', (e, target) => {
      e.preventDefault();
      this.#handleAction(target.dataset.action);
    });

    // Formulario de crear usuario
    delegate(document, 'submit', '#formCrearUsuario', (e) => {
      e.preventDefault();
      this.#handleCreateUser();
    });

    // Aprobar/rechazar inscripción
    delegate(document, 'click', '.btn-approve-enrollment', (e, target) => {
      this.#handleEnrollmentAction(target, 'approved');
    });

    delegate(document, 'click', '.btn-reject-enrollment', (e, target) => {
      this.#handleEnrollmentAction(target, 'rejected');
    });
  }

  /**
   * Carga estadísticas desde la API
   * @returns {Promise<Object>}
   */
  async loadStats() {
    try {
      appState.setLoading(true);
      const response = await api.getAdminStats();
      
      if (response.success && response.data) {
        this.#stats = response.data;
        console.log('[AdminModule] Stats cargadas:', response.data);
        return response.data;
      }
      
      return null;

    } catch (error) {
      console.error('[AdminModule] Error cargando stats:', error);
      return null;
    } finally {
      appState.setLoading(false);
    }
  }

  /**
   * Carga usuarios desde la API
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async loadUsers(filters = {}) {
    try {
      const response = await api.getUsers(filters);
      
      if (response.success && response.data) {
        this.#users = response.data;
        return response.data;
      }
      
      return null;

    } catch (error) {
      console.error('[AdminModule] Error cargando usuarios:', error);
      return null;
    }
  }

  /**
   * Carga inscripciones desde la API
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async loadEnrollments(filters = {}) {
    try {
      const response = await api.getEnrollments(filters);
      
      if (response.success && response.data) {
        this.#enrollments = response.data;
        return response.data;
      }
      
      return null;

    } catch (error) {
      console.error('[AdminModule] Error cargando inscripciones:', error);
      return null;
    }
  }

  /**
   * Maneja la navegación del sidebar
   * @param {Element} navLink
   * @private
   */
  async #handleNavigation(navLink) {
    const section = navLink.dataset.section;
    if (!section) return;

    $$('.admin-sidebar .nav-link').forEach(link => removeClass(link, 'active'));
    addClass(navLink, 'active');

    appState.setSection(section);
    await this.#renderSection(section);
  }

  /**
   * Renderiza una sección específica
   * @param {string} section
   * @private
   */
  async #renderSection(section) {
    const contentContainer = $('#adminContent');
    if (!contentContainer) return;

    // Mostrar loading
    setHTML(contentContainer, '<div class="text-center p-5"><div class="spinner-border text-danger"></div></div>');

    let html = '';

    switch (section) {
      case ADMIN_SECTIONS.DASHBOARD:
        const stats = await this.loadStats();
        html = this.#renderDashboardFromApi(stats);
        break;

      case ADMIN_SECTIONS.ALUMNOS:
        const studentsData = await this.loadUsers({ role: 'student' });
        html = this.#renderUsersTableFromApi(studentsData, 'Alumnos');
        break;

      case ADMIN_SECTIONS.PROFESORES:
        const teachersData = await this.loadUsers({ role: 'teacher' });
        html = this.#renderUsersTableFromApi(teachersData, 'Profesores');
        break;

      case ADMIN_SECTIONS.PAGOS:
        const enrollmentsData = await this.loadEnrollments({ status: 'pending' });
        html = this.#renderEnrollmentsFromApi(enrollmentsData);
        break;

      default:
        html = getAdminSectionContent(section);
    }

    setHTML(contentContainer, html);
  }

  /**
   * Renderiza dashboard con datos de API
   * @param {Object} data
   * @returns {string}
   * @private
   */
  #renderDashboardFromApi(data) {
    if (!data) return getAdminSectionContent(ADMIN_SECTIONS.DASHBOARD);

    const { stats, recent_activity, popular_courses } = data;

    const activityItems = recent_activity?.map(a => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <strong>${a.student_name}</strong> se inscribió a <em>${a.course_title}</em>
          <span class="badge bg-${a.status === 'approved' ? 'success' : 'warning'} ms-2">${a.status}</span>
        </div>
        <small class="text-muted">${new Date(a.created_at).toLocaleDateString()}</small>
      </li>
    `).join('') || '<li class="list-group-item">Sin actividad reciente</li>';

    return `
      <div class="row g-4">
        <div class="col-md-3">
          <div class="card admin-stat-card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle mb-1 opacity-75">Total Alumnos</h6>
                  <h2 class="card-title mb-0">${stats.total_students}</h2>
                </div>
                <span class="admin-stat-icon">👨‍🎓</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card admin-stat-card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle mb-1 opacity-75">Profesores</h6>
                  <h2 class="card-title mb-0">${stats.total_teachers}</h2>
                </div>
                <span class="admin-stat-icon">👨‍🏫</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card admin-stat-card bg-warning text-dark">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle mb-1 opacity-75">Cursos Activos</h6>
                  <h2 class="card-title mb-0">${stats.total_courses}</h2>
                </div>
                <span class="admin-stat-icon">📚</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card admin-stat-card bg-danger text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle mb-1 opacity-75">Pagos Pendientes</h6>
                  <h2 class="card-title mb-0">${stats.pending_enrollments}</h2>
                </div>
                <span class="admin-stat-icon">💳</span>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0 text-danger">Actividad Reciente</h5>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-flush">${activityItems}</ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza tabla de usuarios desde API
   * @param {Object} data
   * @param {string} title
   * @returns {string}
   * @private
   */
  #renderUsersTableFromApi(data, title) {
    if (!data || !data.users) {
      return `<div class="alert alert-info">No se encontraron ${title.toLowerCase()}.</div>`;
    }

    const rows = data.users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.full_name}</td>
        <td>${u.email}</td>
        <td>${u.phone || '-'}</td>
        <td>
          <span class="badge bg-${u.is_active ? 'success' : 'secondary'}">
            ${u.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td><small>${new Date(u.created_at).toLocaleDateString()}</small></td>
      </tr>
    `).join('');

    return `
      <div class="card shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-danger">Gestión de ${title} (${data.pagination.total})</h5>
        </div>
        <div class="card-body">
          <table class="table table-hover">
            <thead class="table-danger">
              <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Estado</th><th>Registro</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza inscripciones pendientes
   * @param {Object} data
   * @returns {string}
   * @private
   */
  #renderEnrollmentsFromApi(data) {
    if (!data || !data.enrollments || data.enrollments.length === 0) {
      return `<div class="alert alert-success">No hay inscripciones pendientes.</div>`;
    }

    const rows = data.enrollments.map(e => `
      <tr data-enrollment-id="${e.id}">
        <td>${e.student.name}</td>
        <td>${e.student.email}</td>
        <td>${e.course.title}</td>
        <td>${e.payment_method || '-'}</td>
        <td><small>${new Date(e.created_at).toLocaleDateString()}</small></td>
        <td>
          <button class="btn btn-sm btn-success me-1 btn-approve-enrollment">Aprobar</button>
          <button class="btn btn-sm btn-outline-danger btn-reject-enrollment">Rechazar</button>
        </td>
      </tr>
    `).join('');

    return `
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <h5 class="mb-0 text-danger">Inscripciones Pendientes (${data.enrollments.length})</h5>
        </div>
        <div class="card-body">
          <table class="table table-hover">
            <thead class="table-danger">
              <tr><th>Alumno</th><th>Email</th><th>Curso</th><th>Pago</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Maneja acciones rápidas
   * @param {string} action
   * @private
   */
  #handleAction(action) {
    console.log('[AdminModule] Acción:', action);
    // Implementar acciones según necesidad
  }

  /**
   * Maneja creación de usuario
   * @private
   */
  #handleCreateUser() {
    // Por implementar con endpoint de creación
    alert('Funcionalidad de creación de usuario disponible próximamente.');
  }

  /**
   * Maneja aprobación/rechazo de inscripción
   * @param {Element} button
   * @param {string} status
   * @private
   */
  async #handleEnrollmentAction(button, status) {
    const row = button.closest('tr');
    const enrollmentId = row?.dataset?.enrollmentId;

    if (!enrollmentId) return;

    try {
      const response = await api.updateEnrollmentStatus({
        enrollment_id: enrollmentId,
        status,
        admin_id: appState.getUserId()
      });

      if (response.success) {
        // Remover fila de la tabla
        row.remove();
        
        // Mostrar feedback
        console.log(`[AdminModule] Inscripción ${enrollmentId} ${status}`);
      }

    } catch (error) {
      console.error('[AdminModule] Error actualizando inscripción:', error);
      alert('Error al procesar la inscripción.');
    }
  }

  /**
   * Obtiene estadísticas cacheadas
   * @returns {Object|null}
   */
  getStats() {
    return this.#stats;
  }
}

// Singleton
export const adminModule = new AdminModule();
export default adminModule;
