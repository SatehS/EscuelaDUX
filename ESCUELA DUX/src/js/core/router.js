/**
 * @fileoverview Router - Controlador de vistas y navegación interna
 * @module core/router
 */

import { VIEWS, DOM_SELECTORS } from './config.js';
import { appState } from './state.js';
import { $, $$, show, hide, scrollToElement } from '../utils/dom.js';

/**
 * Clase Router - Gestiona la navegación entre vistas
 * @class
 */
class Router {
  #routes;
  #initialized;

  constructor() {
    this.#routes = new Map();
    this.#initialized = false;
    this.#registerDefaultRoutes();
  }

  /**
   * Registra las rutas predeterminadas
   * @private
   */
  #registerDefaultRoutes() {
    this.register(VIEWS.HOME, () => this.#showHome());
    this.register(VIEWS.STUDENT_DASHBOARD, () => this.#showStudentDashboard());
    this.register(VIEWS.TEACHER_DASHBOARD, () => this.#showTeacherDashboard());
    this.register(VIEWS.ADMIN_DASHBOARD, () => this.#showAdminDashboard());
  }

  /**
   * Inicializa el router y suscribe al estado
   */
  init() {
    if (this.#initialized) return;

    appState.subscribe('router', (state, prevState) => {
      if (state.currentView !== prevState.currentView) {
        this.navigate(state.currentView);
      }
    });

    this.#initialized = true;
    this.navigate(appState.getCurrentView());
  }

  /**
   * Registra una nueva ruta
   * @param {string} viewName - Nombre de la vista
   * @param {Function} handler - Función manejadora
   */
  register(viewName, handler) {
    this.#routes.set(viewName, handler);
  }

  /**
   * Navega a una vista específica
   * @param {string} viewName - Nombre de la vista destino
   */
  navigate(viewName) {
    const handler = this.#routes.get(viewName);
    if (handler) {
      this.#hideAllViews();
      handler();
    } else {
      console.warn(`[Router] Vista no encontrada: ${viewName}`);
      this.navigate(VIEWS.HOME);
    }
  }

  /**
   * Oculta todas las vistas
   * @private
   */
  #hideAllViews() {
    hide($(DOM_SELECTORS.HOME_SPLIT));
    hide($(DOM_SELECTORS.STUDENT_PANEL));
    hide($(DOM_SELECTORS.TEACHER_PANEL));
    hide($(DOM_SELECTORS.ADMIN_SECTION));
    hide($(DOM_SELECTORS.NAV_USER_HOME));
  }

  /**
   * Muestra la vista Home
   * @private
   */
  #showHome() {
    show($(DOM_SELECTORS.HOME_SPLIT));
    hide($(DOM_SELECTORS.NAV_USER_HOME));
  }

  /**
   * Muestra el panel de alumno
   * @private
   */
  #showStudentDashboard() {
    const panel = $(DOM_SELECTORS.STUDENT_PANEL);
    show(panel);
    show($(DOM_SELECTORS.NAV_USER_HOME));
    this.#updateUserTypeDisplay('Alumno');
    scrollToElement(panel);
  }

  /**
   * Muestra el panel de profesor
   * @private
   */
  #showTeacherDashboard() {
    const panel = $(DOM_SELECTORS.TEACHER_PANEL);
    show(panel);
    show($(DOM_SELECTORS.NAV_USER_HOME));
    this.#updateUserTypeDisplay('Profesor');
    scrollToElement(panel);
  }

  /**
   * Muestra el panel de administrador
   * @private
   */
  #showAdminDashboard() {
    show($(DOM_SELECTORS.ADMIN_SECTION));
    show($(DOM_SELECTORS.NAV_USER_HOME));
    this.#updateUserTypeDisplay('Admin');
  }

  /**
   * Actualiza el texto del tipo de usuario en la UI
   * @param {string} userType - Tipo de usuario
   * @private
   */
  #updateUserTypeDisplay(userType) {
    const element = $(DOM_SELECTORS.USER_TYPE_HOME);
    if (element) {
      element.textContent = `Usuario: ${userType}`;
    }
  }
}

// Singleton
export const router = new Router();
export default router;
