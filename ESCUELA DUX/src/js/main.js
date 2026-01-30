/**
 * @fileoverview Main Entry Point - Punto de entrada principal de la aplicación
 * @module main
 * @description Inicializa todos los módulos y configura la aplicación EscuelaDUX
 */

// Core imports
import { appState } from './core/state.js';
import { router } from './core/router.js';
import { VIEWS } from './core/config.js';

// Module imports
import { authModule } from './modules/auth.js';
import { studentModule } from './modules/student.js';
import { teacherModule } from './modules/teacher.js';
import { enrollmentModule } from './modules/enrollment.js';

/**
 * Clase principal de la aplicación
 * @class
 */
class EscuelaDUXApp {
  #modules;
  #initialized;

  constructor() {
    this.#modules = new Map();
    this.#initialized = false;
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    if (this.#initialized) {
      console.warn('[EscuelaDUX] La aplicación ya fue inicializada');
      return;
    }

    console.log('[EscuelaDUX] Inicializando aplicación...');

    try {
      // Registrar módulos
      this.#registerModules();
      
      // Inicializar módulos
      this.#initializeModules();
      
      // Inicializar router
      router.init();
      
      // Suscribir a cambios de estado
      this.#subscribeToStateChanges();
      
      this.#initialized = true;
      console.log('[EscuelaDUX] Aplicación inicializada correctamente');
    } catch (error) {
      console.error('[EscuelaDUX] Error al inicializar:', error);
    }
  }

  /**
   * Registra todos los módulos de la aplicación
   * @private
   */
  #registerModules() {
    this.#modules.set('auth', authModule);
    this.#modules.set('student', studentModule);
    this.#modules.set('teacher', teacherModule);
    this.#modules.set('enrollment', enrollmentModule);
  }

  /**
   * Inicializa todos los módulos registrados
   * @private
   */
  #initializeModules() {
    this.#modules.forEach((module, name) => {
      try {
        module.init();
        console.log(`[EscuelaDUX] Módulo '${name}' inicializado`);
      } catch (error) {
        console.error(`[EscuelaDUX] Error al inicializar módulo '${name}':`, error);
      }
    });
  }

  /**
   * Suscribe listeners a cambios de estado
   * @private
   */
  #subscribeToStateChanges() {
    appState.subscribe('main', (state, prevState) => {
      // Log de cambios de autenticación
      if (state.isAuthenticated !== prevState.isAuthenticated) {
        if (state.isAuthenticated) {
          console.log(`[EscuelaDUX] Usuario autenticado: ${state.user?.name} (${state.user?.role})`);
        } else {
          console.log('[EscuelaDUX] Sesión cerrada');
        }
      }

      // Log de cambios de vista
      if (state.currentView !== prevState.currentView) {
        console.log(`[EscuelaDUX] Vista cambiada a: ${state.currentView}`);
      }
    });
  }

  /**
   * Obtiene un módulo por nombre
   * @param {string} moduleName - Nombre del módulo
   * @returns {Object|undefined} Módulo
   */
  getModule(moduleName) {
    return this.#modules.get(moduleName);
  }

  /**
   * Obtiene el estado actual
   * @returns {Object} Estado de la aplicación
   */
  getState() {
    return appState.getState();
  }

  /**
   * Navega a una vista específica
   * @param {string} view - Vista destino
   */
  navigateTo(view) {
    appState.setView(view);
  }

  /**
   * Verifica si la aplicación está inicializada
   * @returns {boolean}
   */
  isInitialized() {
    return this.#initialized;
  }
}

// Crear instancia de la aplicación
const app = new EscuelaDUXApp();

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Exponer la aplicación globalmente para debugging (opcional)
window.EscuelaDUX = {
  app,
  state: appState,
  router,
  VIEWS
};

export default app;
