/**
 * @fileoverview Main Entry Point - Punto de entrada SPA
 * @module main
 * @description Inicializa la aplicación EscuelaDUX como Single Page Application
 */

// Core imports
import { appState } from './core/state.js';
import { router } from './core/router.js';
import { VIEWS } from './core/config.js';

// Module imports
import { authModule } from './modules/auth.js';
import { studentModule } from './modules/student.js';
import { teacherModule } from './modules/teacher.js';
import { adminModule } from './modules/admin.js';
import { enrollmentModule } from './modules/enrollment.js';

/**
 * Clase principal de la aplicación SPA
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
  async init() {
    if (this.#initialized) {
      console.warn('[EscuelaDUX] La aplicación ya fue inicializada');
      return;
    }

    console.log('[EscuelaDUX] 🚀 Inicializando aplicación...');

    try {
      // Registrar módulos
      this.#registerModules();
      
      // Inicializar router (maneja renderizado)
      router.init();
      
      // Inicializar módulos de lógica
      this.#initializeModules();
      
      // Suscribir a cambios de estado para debugging
      this.#subscribeToStateChanges();
      
      this.#initialized = true;
      console.log('[EscuelaDUX] ✅ Aplicación inicializada correctamente');
      
    } catch (error) {
      console.error('[EscuelaDUX] ❌ Error al inicializar:', error);
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
    this.#modules.set('admin', adminModule);
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
          console.log(`[EscuelaDUX] 👤 Usuario: ${state.user?.name} (${state.user?.role})`);
        } else {
          console.log('[EscuelaDUX] 🚪 Sesión cerrada');
        }
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
    router.navigate(view);
  }

  /**
   * Verifica si la aplicación está inicializada
   * @returns {boolean}
   */
  isInitialized() {
    return this.#initialized;
  }

  /**
   * Refresca la vista actual
   */
  refresh() {
    router.refresh();
  }
}

// Crear instancia de la aplicación
const app = new EscuelaDUXApp();

// Inicializar cuando el DOM esté listo
const initApp = () => {
  app.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Exponer API pública para debugging y extensibilidad
window.EscuelaDUX = Object.freeze({
  app,
  state: appState,
  router,
  VIEWS,
  
  // Métodos de conveniencia
  navigate: (view) => router.navigate(view),
  refresh: () => router.refresh(),
  getState: () => appState.getState(),
  
  // Para desarrollo/debugging
  debug: () => {
    console.group('🔍 EscuelaDUX Debug Info');
    console.log('Estado:', appState.getState());
    console.log('Vista actual:', router.getCurrentView());
    console.log('Inicializado:', app.isInitialized());
    console.groupEnd();
  }
});

export default app;
