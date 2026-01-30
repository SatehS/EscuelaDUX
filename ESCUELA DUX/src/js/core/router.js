/**
 * @fileoverview Router - Sistema de enrutamiento SPA con rutas protegidas
 * @module core/router
 */

import { VIEWS, USER_ROLES } from './config.js';
import { appState } from './state.js';
import { $ } from '../utils/dom.js';

// Importar componentes
import { Navbar } from '../components/Navbar.js';
import { Home } from '../components/Home.js';
import { StudentPanel } from '../components/StudentPanel.js';
import { TeacherPanel } from '../components/TeacherPanel.js';
import { AdminPanel } from '../components/AdminPanel.js';
import { Modals } from '../components/Modals.js';

/**
 * Configuración de rutas con protección por rol
 * @constant {Object}
 */
const ROUTE_CONFIG = Object.freeze({
  [VIEWS.HOME]: {
    component: Home,
    protected: false,
    allowedRoles: null,
    title: 'Inicio - Escuela DUX'
  },
  [VIEWS.STUDENT_DASHBOARD]: {
    component: StudentPanel,
    protected: true,
    allowedRoles: [USER_ROLES.ALUMNO],
    title: 'Panel del Alumno - Escuela DUX'
  },
  [VIEWS.TEACHER_DASHBOARD]: {
    component: TeacherPanel,
    protected: true,
    allowedRoles: [USER_ROLES.PROFESOR],
    title: 'Panel del Profesor - Escuela DUX'
  },
  [VIEWS.ADMIN_DASHBOARD]: {
    component: AdminPanel,
    protected: true,
    allowedRoles: [USER_ROLES.ADMIN],
    title: 'Panel Administrativo - Escuela DUX'
  }
});

/**
 * Clase Router - Sistema de enrutamiento SPA
 * @class
 */
class Router {
  #container;
  #navbarContainer;
  #modalsContainer;
  #initialized;
  #currentView;

  constructor() {
    this.#container = null;
    this.#navbarContainer = null;
    this.#modalsContainer = null;
    this.#initialized = false;
    this.#currentView = null;
  }

  /**
   * Inicializa el router
   */
  init() {
    if (this.#initialized) return;

    // Obtener contenedores del DOM
    this.#navbarContainer = $('#navbar-container');
    this.#container = $('#app-container');
    this.#modalsContainer = $('#modals-container');

    if (!this.#container) {
      console.error('[Router] No se encontró #app-container');
      return;
    }

    // Renderizar navbar y modales
    this.#renderNavbar();
    this.#renderModals();

    // Suscribirse a cambios de estado
    appState.subscribe('router', (state, prevState) => {
      // Si cambia la vista, navegar
      if (state.currentView !== prevState.currentView) {
        this.#handleRouteChange(state.currentView);
      }
      
      // Si cambia el estado de autenticación, actualizar navbar
      if (state.isAuthenticated !== prevState.isAuthenticated) {
        this.#renderNavbar();
      }
    });

    this.#initialized = true;

    // Navegar a la vista inicial
    this.#handleRouteChange(appState.getCurrentView());
    
    console.log('[Router] Inicializado correctamente');
  }

  /**
   * Maneja el cambio de ruta
   * @param {string} viewName - Nombre de la vista
   * @private
   */
  #handleRouteChange(viewName) {
    const routeConfig = ROUTE_CONFIG[viewName];

    if (!routeConfig) {
      console.warn(`[Router] Vista no encontrada: ${viewName}, redirigiendo a home`);
      this.navigate(VIEWS.HOME);
      return;
    }

    // Verificar protección de ruta
    if (routeConfig.protected && !this.#checkAccess(routeConfig)) {
      console.warn(`[Router] Acceso denegado a: ${viewName}`);
      this.navigate(VIEWS.HOME);
      return;
    }

    // Actualizar título de la página
    document.title = routeConfig.title;

    // Renderizar componente
    this.#render(routeConfig.component);
    this.#currentView = viewName;

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Verifica si el usuario tiene acceso a la ruta
   * @param {Object} routeConfig - Configuración de la ruta
   * @returns {boolean}
   * @private
   */
  #checkAccess(routeConfig) {
    // Si la ruta no está protegida, permitir acceso
    if (!routeConfig.protected) return true;

    // Verificar autenticación
    if (!appState.isLoggedIn()) {
      console.log('[Router] Usuario no autenticado');
      return false;
    }

    // Si no hay roles específicos, permitir a cualquier usuario autenticado
    if (!routeConfig.allowedRoles) return true;

    // Verificar rol del usuario
    const userRole = appState.getUserRole();
    const hasAccess = routeConfig.allowedRoles.includes(userRole);

    if (!hasAccess) {
      console.log(`[Router] Rol ${userRole} no autorizado para esta vista`);
    }

    return hasAccess;
  }

  /**
   * Renderiza un componente en el contenedor principal
   * @param {Function} component - Función componente
   * @private
   */
  #render(component) {
    if (this.#container && component) {
      this.#container.innerHTML = component();
    }
  }

  /**
   * Renderiza el navbar
   * @private
   */
  #renderNavbar() {
    if (this.#navbarContainer) {
      this.#navbarContainer.innerHTML = Navbar();
    }
  }

  /**
   * Renderiza los modales
   * @private
   */
  #renderModals() {
    if (this.#modalsContainer) {
      this.#modalsContainer.innerHTML = Modals();
    }
  }

  /**
   * Navega a una vista específica
   * @param {string} viewName - Nombre de la vista
   */
  navigate(viewName) {
    if (viewName === this.#currentView) return;
    appState.setView(viewName);
  }

  /**
   * Obtiene la vista actual
   * @returns {string}
   */
  getCurrentView() {
    return this.#currentView;
  }

  /**
   * Re-renderiza la vista actual
   */
  refresh() {
    if (this.#currentView) {
      const routeConfig = ROUTE_CONFIG[this.#currentView];
      if (routeConfig) {
        this.#render(routeConfig.component);
      }
    }
    this.#renderNavbar();
  }

  /**
   * Registra una nueva ruta dinámicamente
   * @param {string} viewName - Nombre de la vista
   * @param {Object} config - Configuración de la ruta
   */
  registerRoute(viewName, config) {
    ROUTE_CONFIG[viewName] = config;
  }
}

// Singleton
export const router = new Router();
export default router;
