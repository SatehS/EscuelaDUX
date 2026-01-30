/**
 * @fileoverview Módulo de Autenticación - Login, Logout y gestión de sesión
 * @module modules/auth
 */

import { TEST_USERS, USER_ROLES, DOM_SELECTORS } from '../core/config.js';
import { appState } from '../core/state.js';
import { router } from '../core/router.js';
import { $, getValue, showAlert, removeAlert, resetForm, delegate } from '../utils/dom.js';
import { validateLoginForm, validateRegisterForm } from '../utils/validators.js';

/**
 * Clase AuthModule - Gestiona la autenticación de usuarios
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
    // Login Form (delegación desde document para SPA)
    delegate(document, 'submit', '#formLoginHome', (e) => {
      e.preventDefault();
      this.#handleLogin();
    });

    // Register Form
    delegate(document, 'submit', '#formRegisterHome', (e) => {
      e.preventDefault();
      this.#handleRegister();
    });

    // Logout button (navbar)
    delegate(document, 'click', '#logoutBtn', (e) => {
      e.preventDefault();
      this.logout();
    });

    // Logout desde paneles (legacy support)
    delegate(document, 'click', '#logoutBtnAlumno, #logoutBtnProfesor, #logoutBtnAdmin', (e) => {
      e.preventDefault();
      this.logout();
    });
  }

  /**
   * Maneja el proceso de login
   * @private
   */
  #handleLogin() {
    const email = getValue('#loginEmailHome');
    const password = getValue('#loginPasswordHome');

    // Validación
    const validation = validateLoginForm({ email, password });
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0][0];
      showAlert('formLoginHome', firstError);
      return;
    }

    // Autenticar usuario
    const user = this.#authenticateUser(email, password);
    
    if (user) {
      removeAlert('formLoginHome');
      this.#loginSuccess(user);
    } else {
      showAlert('formLoginHome', 'Usuario o contraseña incorrectos.');
    }
  }

  /**
   * Autentica al usuario contra los usuarios de prueba
   * @param {string} email - Email
   * @param {string} password - Contraseña
   * @returns {Object|null} Usuario autenticado o null
   * @private
   */
  #authenticateUser(email, password) {
    const normalizedEmail = email.toLowerCase();
    
    for (const [, userData] of Object.entries(TEST_USERS)) {
      if (userData.email === normalizedEmail && userData.password === password) {
        return {
          email: userData.email,
          role: userData.role,
          name: userData.name
        };
      }
    }
    
    return null;
  }

  /**
   * Procesa el login exitoso
   * @param {Object} user - Datos del usuario
   * @private
   */
  #loginSuccess(user) {
    appState.setUser(user);
    console.log(`[AuthModule] Login exitoso: ${user.name} (${user.role})`);
  }

  /**
   * Maneja el proceso de registro
   * @private
   */
  #handleRegister() {
    const email = getValue('#registerEmailHome');
    const password = getValue('#registerPasswordHome');
    const userType = getValue('#registerTipoHome');

    // Validación
    const validation = validateRegisterForm({ email, password, userType });
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0][0];
      showAlert('formRegisterHome', firstError);
      return;
    }

    // Verificar email existente
    if (this.#isEmailRegistered(email)) {
      showAlert('formRegisterHome', 'Este correo ya está registrado.');
      return;
    }

    removeAlert('formRegisterHome');

    // Crear usuario y autenticar
    const newUser = {
      email,
      role: userType,
      name: email.split('@')[0]
    };

    this.#loginSuccess(newUser);
  }

  /**
   * Verifica si un email ya está registrado
   * @param {string} email - Email a verificar
   * @returns {boolean}
   * @private
   */
  #isEmailRegistered(email) {
    const normalizedEmail = email.toLowerCase();
    return Object.values(TEST_USERS).some(
      user => user.email === normalizedEmail
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
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
    return this.hasRole(USER_ROLES.ALUMNO);
  }

  /**
   * Verifica si el usuario es profesor
   * @returns {boolean}
   */
  isTeacher() {
    return this.hasRole(USER_ROLES.PROFESOR);
  }

  /**
   * Verifica si el usuario es admin
   * @returns {boolean}
   */
  isAdmin() {
    return this.hasRole(USER_ROLES.ADMIN);
  }
}

// Singleton
export const authModule = new AuthModule();
export default authModule;
