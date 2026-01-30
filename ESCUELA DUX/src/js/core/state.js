/**
 * @fileoverview State Manager - Gestión centralizada del estado de la aplicación
 * @module core/state
 */

import { USER_ROLES, VIEWS } from './config.js';

/**
 * Estado inicial de la aplicación
 * @constant {Object}
 */
const INITIAL_STATE = Object.freeze({
  user: null,
  isAuthenticated: false,
  currentView: VIEWS.HOME,
  currentSection: null
});

/**
 * Clase StateManager - Implementa el patrón Observer para gestión de estado
 * @class
 */
class StateManager {
  #state;
  #listeners;

  constructor() {
    this.#state = { ...INITIAL_STATE };
    this.#listeners = new Map();
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
    this.#notifyListeners(prevState);
  }

  // ============================================
  // Métodos específicos de autenticación
  // ============================================

  /**
   * Establece el usuario autenticado
   * @param {Object} user - Datos del usuario
   */
  setUser(user) {
    this.setState({
      user,
      isAuthenticated: true,
      currentView: this.#getViewForRole(user.role)
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
   * Obtiene el nombre del usuario actual
   * @returns {string|null}
   */
  getUserName() {
    return this.#state.user?.name || null;
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
      [USER_ROLES.ADMIN]: VIEWS.ADMIN_DASHBOARD
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
    this.setState({ currentView: view, currentSection: null });
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
}

// Singleton - única instancia del StateManager
export const appState = new StateManager();
export default appState;
