/**
 * @fileoverview Módulo de Autenticación - Login, Logout con API
 * @module modules/auth
 */

import { USER_ROLES } from '../core/config.js';
import { appState } from '../core/state.js';
import { router } from '../core/router.js';
import { api, ApiError } from '../services/api.js';
import { $, getValue, showAlert, removeAlert, resetForm, delegate, setHTML } from '../utils/dom.js';
import { validateLoginForm, validateRegisterForm } from '../utils/validators.js';

/**
 * Clase AuthModule - Gestiona la autenticación con el backend
 * @class
 */
class AuthModule {
  #initialized;

  constructor() {
    this.#initialized = false;
  }

  /**
   * Inicializa el módulo de autenticación
   */
  init() {
    if (this.#initialized) return;
    this.#bindEvents();
    this.#initialized = true;
    console.log('[AuthModule] Inicializado');
  }

  /**
   * Vincula eventos de autenticación usando delegación
   * @private
   */
  #bindEvents() {
    // Login Form
    delegate(document, 'submit', '#formLoginHome', (e) => {
      e.preventDefault();
      this.#handleLogin();
    });

    // Register Form
    delegate(document, 'submit', '#formRegisterHome', (e) => {
      e.preventDefault();
      this.#handleRegister();
    });

    // Logout button
    delegate(document, 'click', '#logoutBtn', (e) => {
      e.preventDefault();
      this.logout();
    });
  }

  /**
   * Maneja el proceso de login
   * @private
   */
  async #handleLogin() {
    const email = getValue('#loginEmailHome');
    const password = getValue('#loginPasswordHome');

    // Validación local
    const validation = validateLoginForm({ email, password });
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0][0];
      showAlert('formLoginHome', firstError);
      return;
    }

    // Mostrar estado de carga
    const submitBtn = $('#formLoginHome button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Ingresando...';
    }

    try {
      // Llamar a la API
      const response = await api.login(email, password);
      
      if (response.success && response.data) {
        removeAlert('formLoginHome');
        
        // Actualizar estado con datos del usuario
        appState.setUser(response.data.user);
        
        console.log(`[AuthModule] Login exitoso: ${response.data.user.full_name}`);
      }

    } catch (error) {
      console.error('[AuthModule] Error de login:', error);
      
      if (error instanceof ApiError) {
        showAlert('formLoginHome', error.message);
      } else {
        showAlert('formLoginHome', 'Error al conectar con el servidor');
      }
    } finally {
      // Restaurar botón
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  /**
   * Maneja el proceso de registro
   * @private
   */
  async #handleRegister() {
    const email = getValue('#registerEmailHome');
    const password = getValue('#registerPasswordHome');
    const userType = getValue('#registerTipoHome');

    // Validación local
    const validation = validateRegisterForm({ email, password, userType });
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0][0];
      showAlert('formRegisterHome', firstError);
      return;
    }

    // Mostrar estado de carga
    const submitBtn = $('#formRegisterHome button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registrando...';
    }

    try {
      // El registro simple (sin curso) aún no es soportado por la API
      // Mostrar mensaje para usar el formulario de inscripción
      showAlert('formRegisterHome', 
        'Para registrarte, usa el botón "Inscribirse a un curso" y completa el formulario de inscripción.', 
        'info'
      );

    } catch (error) {
      console.error('[AuthModule] Error de registro:', error);
      
      if (error instanceof ApiError) {
        showAlert('formRegisterHome', error.message);
      } else {
        showAlert('formRegisterHome', 'Error al conectar con el servidor');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    api.logout();
    appState.clearUser();
    router.refresh();
    console.log('[AuthModule] Sesión cerrada');
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean}
   */
  hasRole(role) {
    return appState.getUserRole() === role;
  }

  /**
   * Verifica si el usuario es alumno
   * @returns {boolean}
   */
  isStudent() {
    const role = appState.getUserRole();
    return role === USER_ROLES.ALUMNO || role === 'student';
  }

  /**
   * Verifica si el usuario es profesor
   * @returns {boolean}
   */
  isTeacher() {
    const role = appState.getUserRole();
    return role === USER_ROLES.PROFESOR || role === 'teacher';
  }

  /**
   * Verifica si el usuario es admin
   * @returns {boolean}
   */
  isAdmin() {
    const role = appState.getUserRole();
    return role === USER_ROLES.ADMIN || role === 'admin';
  }
}

// Singleton
export const authModule = new AuthModule();
export default authModule;
