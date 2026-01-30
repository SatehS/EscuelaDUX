/**
 * @fileoverview Validadores - Funciones de validación de datos
 * @module utils/validators
 */

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @returns {boolean}
 */
export const isNotEmpty = (value) => {
  return value?.trim().length > 0;
};

/**
 * Valida longitud mínima
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @returns {boolean}
 */
export const hasMinLength = (value, minLength) => {
  return value?.trim().length >= minLength;
};

/**
 * Valida longitud máxima
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean}
 */
export const hasMaxLength = (value, maxLength) => {
  return value?.trim().length <= maxLength;
};

/**
 * Valida un formulario completo
 * @param {Object} fields - Objeto con campos y sus valores
 * @param {Object} rules - Reglas de validación
 * @returns {Object} { isValid, errors }
 */
export const validateForm = (fields, rules) => {
  const errors = {};
  let isValid = true;

  Object.entries(rules).forEach(([fieldName, fieldRules]) => {
    const value = fields[fieldName];
    const fieldErrors = [];

    fieldRules.forEach(rule => {
      if (rule.type === 'required' && !isNotEmpty(value)) {
        fieldErrors.push(rule.message || `${fieldName} es requerido`);
      }
      if (rule.type === 'email' && value && !isValidEmail(value)) {
        fieldErrors.push(rule.message || 'Email inválido');
      }
      if (rule.type === 'minLength' && !hasMinLength(value, rule.value)) {
        fieldErrors.push(rule.message || `Mínimo ${rule.value} caracteres`);
      }
      if (rule.type === 'maxLength' && !hasMaxLength(value, rule.value)) {
        fieldErrors.push(rule.message || `Máximo ${rule.value} caracteres`);
      }
      if (rule.type === 'custom' && rule.validator && !rule.validator(value)) {
        fieldErrors.push(rule.message || 'Valor inválido');
      }
    });

    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Valida el formulario de login
 * @param {Object} data - Datos del formulario { email, password }
 * @returns {Object} { isValid, errors }
 */
export const validateLoginForm = (data) => {
  return validateForm(data, {
    email: [
      { type: 'required', message: 'El correo electrónico es requerido.' },
      { type: 'email', message: 'Por favor ingresa un email válido.' }
    ],
    password: [
      { type: 'required', message: 'La contraseña es requerida.' }
    ]
  });
};

/**
 * Valida el formulario de registro
 * @param {Object} data - Datos del formulario { email, password, userType }
 * @returns {Object} { isValid, errors }
 */
export const validateRegisterForm = (data) => {
  return validateForm(data, {
    email: [
      { type: 'required', message: 'El correo electrónico es requerido.' },
      { type: 'email', message: 'Por favor ingresa un email válido.' }
    ],
    password: [
      { type: 'required', message: 'La contraseña es requerida.' },
      { type: 'minLength', value: 4, message: 'La contraseña debe tener al menos 4 caracteres.' }
    ],
    userType: [
      { type: 'required', message: 'Selecciona el tipo de usuario.' }
    ]
  });
};

/**
 * Valida el formulario de inscripción
 * @param {Object} data - Datos del formulario
 * @returns {Object} { isValid, errors }
 */
export const validateEnrollmentForm = (data) => {
  return validateForm(data, {
    curso: [
      { type: 'required', message: 'Selecciona un curso.' }
    ],
    nombre: [
      { type: 'required', message: 'El nombre es requerido.' },
      { type: 'minLength', value: 3, message: 'El nombre debe tener al menos 3 caracteres.' }
    ],
    email: [
      { type: 'required', message: 'El correo electrónico es requerido.' },
      { type: 'email', message: 'Por favor ingresa un email válido.' }
    ],
    metodoPago: [
      { type: 'required', message: 'Selecciona un método de pago.' }
    ]
  });
};

/**
 * Valida un formulario de creación de usuario
 * @param {Object} data - Datos del formulario
 * @returns {Object} { isValid, errors }
 */
export const validateUserForm = (data) => {
  return validateForm(data, {
    nombre: [
      { type: 'required', message: 'El nombre es requerido.' }
    ],
    email: [
      { type: 'required', message: 'El correo electrónico es requerido.' },
      { type: 'email', message: 'Por favor ingresa un email válido.' }
    ],
    password: [
      { type: 'required', message: 'La contraseña es requerida.' },
      { type: 'minLength', value: 4, message: 'La contraseña debe tener al menos 4 caracteres.' }
    ],
    rol: [
      { type: 'required', message: 'Selecciona un rol.' }
    ]
  });
};

/**
 * Sanitiza una cadena para prevenir XSS
 * @param {string} str - Cadena a sanitizar
 * @returns {string}
 */
export const sanitize = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Escapa caracteres HTML
 * @param {string} str - Cadena a escapar
 * @returns {string}
 */
export const escapeHTML = (str) => {
  if (!str) return '';
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, char => escapeMap[char]);
};

/**
 * Valida un número de teléfono
 * @param {string} phone - Teléfono a validar
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Campo opcional
  const phoneRegex = /^[\d\s\-+()]{7,20}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Valida una fecha
 * @param {string} dateStr - Fecha en formato string
 * @returns {boolean}
 */
export const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

/**
 * Valida que una fecha sea futura
 * @param {string} dateStr - Fecha en formato string
 * @returns {boolean}
 */
export const isFutureDate = (dateStr) => {
  if (!isValidDate(dateStr)) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};
