/**
 * @fileoverview Utilidades DOM - Helpers para manipulación del DOM
 * @module utils/dom
 */

/**
 * Selector de elemento único (alias de querySelector)
 * @param {string} selector - Selector CSS
 * @param {Element} [context=document] - Contexto de búsqueda
 * @returns {Element|null}
 */
export const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Selector de múltiples elementos (alias de querySelectorAll)
 * @param {string} selector - Selector CSS
 * @param {Element} [context=document] - Contexto de búsqueda
 * @returns {NodeList}
 */
export const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Muestra un elemento (remueve d-none)
 * @param {Element} element - Elemento a mostrar
 */
export const show = (element) => {
  if (element) {
    element.classList.remove('d-none');
  }
};

/**
 * Oculta un elemento (agrega d-none)
 * @param {Element} element - Elemento a ocultar
 */
export const hide = (element) => {
  if (element) {
    element.classList.add('d-none');
  }
};

/**
 * Alterna la visibilidad de un elemento
 * @param {Element} element - Elemento a alternar
 */
export const toggle = (element) => {
  if (element) {
    element.classList.toggle('d-none');
  }
};

/**
 * Verifica si un elemento tiene una clase
 * @param {Element} element - Elemento a verificar
 * @param {string} className - Nombre de la clase
 * @returns {boolean}
 */
export const hasClass = (element, className) => {
  return element?.classList.contains(className) || false;
};

/**
 * Agrega una o más clases a un elemento
 * @param {Element} element - Elemento destino
 * @param {...string} classes - Clases a agregar
 */
export const addClass = (element, ...classes) => {
  if (element) {
    element.classList.add(...classes);
  }
};

/**
 * Remueve una o más clases de un elemento
 * @param {Element} element - Elemento destino
 * @param {...string} classes - Clases a remover
 */
export const removeClass = (element, ...classes) => {
  if (element) {
    element.classList.remove(...classes);
  }
};

/**
 * Establece el contenido HTML de un elemento
 * @param {Element} element - Elemento destino
 * @param {string} html - Contenido HTML
 */
export const setHTML = (element, html) => {
  if (element) {
    element.innerHTML = html;
  }
};

/**
 * Establece el texto de un elemento
 * @param {Element} element - Elemento destino
 * @param {string} text - Contenido texto
 */
export const setText = (element, text) => {
  if (element) {
    element.textContent = text;
  }
};

/**
 * Obtiene el valor de un input
 * @param {string} selector - Selector del input
 * @returns {string}
 */
export const getValue = (selector) => {
  const element = $(selector);
  return element?.value?.trim() || '';
};

/**
 * Establece el valor de un input
 * @param {string} selector - Selector del input
 * @param {string} value - Valor a establecer
 */
export const setValue = (selector, value) => {
  const element = $(selector);
  if (element) {
    element.value = value;
  }
};

/**
 * Limpia el valor de un formulario
 * @param {string} formSelector - Selector del formulario
 */
export const resetForm = (formSelector) => {
  const form = $(formSelector);
  if (form) {
    form.reset();
  }
};

/**
 * Hace scroll suave hacia un elemento
 * @param {Element} element - Elemento destino
 * @param {number} [offset=0] - Offset adicional
 */
export const scrollToElement = (element, offset = 0) => {
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

/**
 * Crea un elemento con atributos y contenido
 * @param {string} tag - Nombre del tag
 * @param {Object} [attrs={}] - Atributos
 * @param {string} [content=''] - Contenido HTML o texto
 * @returns {Element}
 */
export const createElement = (tag, attrs = {}, content = '') => {
  const element = document.createElement(tag);
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') {
      element.className = value;
    } else if (key === 'data') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });

  if (content) {
    element.innerHTML = content;
  }

  return element;
};

/**
 * Delegación de eventos
 * @param {Element} parent - Elemento padre
 * @param {string} eventType - Tipo de evento
 * @param {string} selector - Selector de elementos hijos
 * @param {Function} handler - Manejador del evento
 */
export const delegate = (parent, eventType, selector, handler) => {
  parent.addEventListener(eventType, (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) {
      handler.call(target, event, target);
    }
  });
};

/**
 * Muestra una alerta en un contenedor
 * @param {string} containerId - ID del contenedor
 * @param {string} message - Mensaje a mostrar
 * @param {string} [type='danger'] - Tipo de alerta (danger, success, warning, info)
 */
export const showAlert = (containerId, message, type = 'danger') => {
  const container = $(`#${containerId}`);
  if (!container) return;

  const existingAlert = $('.alert', container);
  if (existingAlert) existingAlert.remove();

  const alert = createElement('div', {
    class: `alert alert-${type} py-2 small`,
    role: 'alert'
  }, message);

  container.prepend(alert);
};

/**
 * Remueve alertas de un contenedor
 * @param {string} containerId - ID del contenedor
 */
export const removeAlert = (containerId) => {
  const container = $(`#${containerId}`);
  const alert = container?.querySelector('.alert');
  if (alert) alert.remove();
};

/**
 * Wrapper para Bootstrap Modal (usando jQuery por compatibilidad)
 */
export const modal = {
  show: (selector) => {
    if (window.$ && window.$.fn.modal) {
      window.$(selector).modal('show');
    }
  },
  hide: (selector) => {
    if (window.$ && window.$.fn.modal) {
      window.$(selector).modal('hide');
    }
  }
};
