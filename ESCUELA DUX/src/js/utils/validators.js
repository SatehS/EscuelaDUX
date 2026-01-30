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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
      if (rule.type === 'email' && !isValidEmail(value)) {
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
 * Sanitiza una cadena para prevenir XSS
 * @param {string} str - Cadena a sanitizar
 * @returns {string}
 */
export const sanitize = (str) => {
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
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, char => escapeMap[char]);
};
