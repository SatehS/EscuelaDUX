/**
 * @fileoverview State Manager - Gestión centralizada del estado (sin localStorage)
 * @module core/state
 */

import { USER_ROLES, VIEWS } from './config.js';
import { api } from '../services/api.js';

/**
 * Estado inicial de la aplicación
 * @constant {Object}
 */
const INITIAL_STATE = Object.freeze({
  user: null,
  isAuthenticated: false,
  currentView: VIEWS.HOME,
  currentSection: null,
  isLoading: false,
  dashboardData: null
});

/**
 * Clase StateManager - Implementa el patrón Observer con sesión en memoria
 * @class
 */
class StateManager {
  #state;
  #listeners;

  constructor() {
    this.#state = { ...INITIAL_STATE };
    this.#listeners = new Map();
    this.#restoreSession();
  }

  /**
   * Restaura la sesión desde sessionStorage
   * @private
   */
  #restoreSession() {
    const session = api.getSession();
    if (session && session.user) {
      this.#state.user = session.user;
      this.#state.isAuthenticated = true;
      this.#state.currentView = this.#getViewForRole(session.user.role.name);
    }
  }

  /**
   * Obtiene el estado actual (copia inmutable)
   * @returns {Object} Estado actual
   */
  getState() {
    return { ...this.#state };
  }

  /**
   * Obtiene una propiedad específica del estado
   * @param {string} key - Clave de la propiedad
   * @returns {*} Valor de la propiedad
   */
  get(key) {
    return this.#state[key];
  }

  /**
   * Actualiza el estado y notifica a los listeners
   * @param {Object} updates - Objeto con las actualizaciones
   */
  setState(updates) {
    const prevState = { ...this.#state };
    this.#state = { ...this.#state, ...updates };
    this.#notifyListeners(prevState);
  }

  /**
   * Suscribe un listener a cambios de estado
   * @param {string} key - Identificador único del listener
   * @param {Function} callback - Función a ejecutar en cambios
   * @returns {Function} Función para desuscribir
   */
  subscribe(key, callback) {
    this.#listeners.set(key, callback);
    return () => this.#listeners.delete(key);
  }

  /**
   * Notifica a todos los listeners sobre cambios
   * @param {Object} prevState - Estado anterior
   * @private
   */
  #notifyListeners(prevState) {
    this.#listeners.forEach((callback) => {
      callback(this.#state, prevState);
    });
  }

  /**
   * Reinicia el estado al inicial
   */
  reset() {
    const prevState = { ...this.#state };
    this.#state = { ...INITIAL_STATE };
    api.logout();
    this.#notifyListeners(prevState);
  }

  // ============================================
  // Métodos de autenticación
  // ============================================

  /**
   * Establece el usuario autenticado desde respuesta de API
   * @param {Object} userData - Datos del usuario de la API
   */
  setUser(userData) {
    // Normalizar estructura del usuario
    const user = {
      id: userData.id,
      name: userData.full_name,
      email: userData.email,
      role: userData.role.name,
      roleId: userData.role.id,
      phone: userData.phone || null,
      avatarUrl: userData.avatar_url || null
    };

    this.setState({
      user,
      isAuthenticated: true,
      currentView: this.#getViewForRole(user.role),
      dashboardData: null // Resetear datos del dashboard
    });
  }

  /**
   * Cierra la sesión del usuario
   */
  clearUser() {
    this.reset();
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean}
   */
  isLoggedIn() {
    return this.#state.isAuthenticated;
  }

  /**
   * Obtiene el rol del usuario actual
   * @returns {string|null}
   */
  getUserRole() {
    return this.#state.user?.role || null;
  }

  /**
   * Obtiene el ID del usuario actual
   * @returns {number|null}
   */
  getUserId() {
    return this.#state.user?.id || null;
  }

  /**
   * Obtiene el nombre del usuario actual
   * @returns {string|null}
   */
  getUserName() {
    return this.#state.user?.name || null;
  }

  /**
   * Obtiene el usuario completo
   * @returns {Object|null}
   */
  getUser() {
    return this.#state.user;
  }

  /**
   * Determina la vista según el rol
   * @param {string} role - Rol del usuario
   * @returns {string} Vista correspondiente
   * @private
   */
  #getViewForRole(role) {
    const viewMap = {
      [USER_ROLES.ALUMNO]: VIEWS.STUDENT_DASHBOARD,
      [USER_ROLES.PROFESOR]: VIEWS.TEACHER_DASHBOARD,
      [USER_ROLES.ADMIN]: VIEWS.ADMIN_DASHBOARD,
      'student': VIEWS.STUDENT_DASHBOARD,
      'teacher': VIEWS.TEACHER_DASHBOARD,
      'admin': VIEWS.ADMIN_DASHBOARD
    };
    return viewMap[role] || VIEWS.HOME;
  }

  // ============================================
  // Métodos de navegación
  // ============================================

  /**
   * Cambia la vista actual
   * @param {string} view - Nueva vista
   */
  setView(view) {
    this.setState({ currentView: view, currentSection: null, dashboardData: null });
  }

  /**
   * Cambia la sección dentro de un panel
   * @param {string} section - Nueva sección
   */
  setSection(section) {
    this.setState({ currentSection: section });
  }

  /**
   * Obtiene la vista actual
   * @returns {string}
   */
  getCurrentView() {
    return this.#state.currentView;
  }

  /**
   * Obtiene la sección actual
   * @returns {string|null}
   */
  getCurrentSection() {
    return this.#state.currentSection;
  }

  // ============================================
  // Métodos de carga de datos
  // ============================================

  /**
   * Establece el estado de carga
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    this.setState({ isLoading });
  }

  /**
   * Verifica si está cargando
   * @returns {boolean}
   */
  isLoading() {
    return this.#state.isLoading;
  }

  /**
   * Guarda los datos del dashboard
   * @param {Object} data
   */
  setDashboardData(data) {
    this.setState({ dashboardData: data });
  }

  /**
   * Obtiene los datos del dashboard
   * @returns {Object|null}
   */
  getDashboardData() {
    return this.#state.dashboardData;
  }
}

// Singleton - única instancia del StateManager
export const appState = new StateManager();
export default appState;
