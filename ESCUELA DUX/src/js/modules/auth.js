/**
 * @fileoverview Módulo de Autenticación - Login, Logout y gestión de sesión
 * @module modules/auth
 */

import { TEST_USERS, USER_ROLES, DOM_SELECTORS } from '../core/config.js';
import { appState } from '../core/state.js';
import { $, getValue, showAlert, removeAlert, resetForm } from '../utils/dom.js';
import { isValidEmail, isNotEmpty } from '../utils/validators.js';

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
  }

  /**
   * Vincula eventos de autenticación
   * @private
   */
  #bindEvents() {
    // Login Form
    const loginForm = $(DOM_SELECTORS.LOGIN_FORM);
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.#handleLogin(e));
    }

    // Register Form
    const registerForm = $(DOM_SELECTORS.REGISTER_FORM);
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.#handleRegister(e));
    }

    // Logout buttons (delegación)
    document.addEventListener('click', (e) => {
      if (e.target.matches('#logoutBtnAlumno, #logoutBtnProfesor, #logoutBtnHome')) {
        e.preventDefault();
        this.logout();
      }
    });
  }

  /**
   * Maneja el proceso de login
   * @param {Event} e - Evento submit
   * @private
   */
  #handleLogin(e) {
    e.preventDefault();

    const email = getValue('#loginEmailHome');
    const password = getValue('#loginPasswordHome');

    // Validación básica
    if (!this.#validateLoginFields(email, password)) {
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
   * Valida los campos del login
   * @param {string} email - Email
   * @param {string} password - Contraseña
   * @returns {boolean}
   * @private
   */
  #validateLoginFields(email, password) {
    if (!isNotEmpty(email) || !isNotEmpty(password)) {
      showAlert('formLoginHome', 'Por favor completa todos los campos.');
      return false;
    }

    if (!isValidEmail(email)) {
      showAlert('formLoginHome', 'Por favor ingresa un email válido.');
      return false;
    }

    return true;
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
    resetForm(DOM_SELECTORS.LOGIN_FORM);
  }

  /**
   * Maneja el proceso de registro
   * @param {Event} e - Evento submit
   * @private
   */
  #handleRegister(e) {
    e.preventDefault();

    const email = getValue('#registerEmailHome');
    const password = getValue('#registerPasswordHome');
    const userType = getValue('#registerTipoHome');

    // Validaciones
    if (!userType) {
      showAlert('formRegisterHome', 'Selecciona el tipo de usuario.');
      return;
    }

    if (!this.#validateRegistrationFields(email, password)) {
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
   * Valida campos de registro
   * @param {string} email - Email
   * @param {string} password - Contraseña
   * @returns {boolean}
   * @private
   */
  #validateRegistrationFields(email, password) {
    if (!isNotEmpty(email) || !isNotEmpty(password)) {
      showAlert('formRegisterHome', 'Por favor completa todos los campos.');
      return false;
    }

    if (!isValidEmail(email)) {
      showAlert('formRegisterHome', 'Por favor ingresa un email válido.');
      return false;
    }

    if (password.length < 4) {
      showAlert('formRegisterHome', 'La contraseña debe tener al menos 4 caracteres.');
      return false;
    }

    return true;
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
