/**
 * @fileoverview Módulo Enrollment - Inscripción a cursos y generación de planillas
 * @module modules/enrollment
 */

import { COURSES, DOM_SELECTORS } from '../core/config.js';
import { $, setHTML, getValue, hide, show, modal, delegate } from '../utils/dom.js';
import { validateEnrollmentForm } from '../utils/validators.js';
import { generatePlanillaContent } from '../components/Modals.js';

/**
 * Clase EnrollmentModule - Gestiona la inscripción a cursos
 * @class
 */
class EnrollmentModule {
  #initialized;

  constructor() {
    this.#initialized = false;
  }

  /**
   * Inicializa el módulo de inscripción
   */
  init() {
    if (this.#initialized) return;
    this.#bindEvents();
    this.#initialized = true;
    console.log('[EnrollmentModule] Inicializado');
  }

  /**
   * Vincula eventos de inscripción
   * @private
   */
  #bindEvents() {
    // Botones de abrir modal de inscripción
    delegate(document, 'click', '#inscripcionBtn, #inscripcionBtnHome', (e) => {
      e.preventDefault();
      modal.show(DOM_SELECTORS.ENROLLMENT_MODAL);
    });

    // Cambio de curso seleccionado
    delegate(document, 'change', '#curso', (e) => {
      this.#handleCourseChange(e.target.value);
    });

    // Formulario de inscripción
    delegate(document, 'submit', '#formInscripcion', (e) => {
      e.preventDefault();
      this.#handleEnrollment();
    });

    // Descargar PDF
    delegate(document, 'click', '#descargarPDF', () => {
      this.#handlePDFDownload();
    });
  }

  /**
   * Maneja el cambio de curso seleccionado
   * @param {string} courseId - ID del curso
   * @private
   */
  #handleCourseChange(courseId) {
    const detailsContainer = $('#detallesCurso');

    if (courseId && COURSES[courseId]) {
      const course = COURSES[courseId];
      this.#updateCourseDetails(course);
      show(detailsContainer);
    } else {
      hide(detailsContainer);
    }
  }

  /**
   * Actualiza los detalles del curso en el DOM
   * @param {Object} course - Datos del curso
   * @private
   */
  #updateCourseDetails(course) {
    const fields = {
      '#detalleTurno': course.turno,
      '#detalleDias': course.dias,
      '#detalleHorario': course.horario,
      '#detalleTotalClases': course.totalClases,
      '#detalleHoras': course.horas,
      '#detalleProfesor': course.profesor
    };

    Object.entries(fields).forEach(([selector, value]) => {
      const element = $(selector);
      if (element) element.textContent = value;
    });
  }

  /**
   * Maneja el envío del formulario de inscripción
   * @private
   */
  #handleEnrollment() {
    const formData = this.#collectFormData();
    
    // Validar formulario
    const validation = validateEnrollmentForm(formData);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0][0];
      alert(firstError);
      return;
    }

    // Generar planilla
    const planillaData = this.#preparePlanillaData(formData);
    const planillaHTML = generatePlanillaContent(planillaData);

    setHTML($(DOM_SELECTORS.PLANILLA_PREVIEW), planillaHTML);
    
    modal.hide(DOM_SELECTORS.ENROLLMENT_MODAL);
    
    setTimeout(() => {
      modal.show(DOM_SELECTORS.PLANILLA_MODAL);
    }, 400);
  }

  /**
   * Recolecta los datos del formulario
   * @returns {Object} Datos del formulario
   * @private
   */
  #collectFormData() {
    return {
      curso: getValue('#curso'),
      nombre: getValue('#inscripcionNombre'),
      email: getValue('#inscripcionEmail'),
      telefono: getValue('#inscripcionTelefono'),
      pais: getValue('#inscripcionPais'),
      metodoPago: getValue('#pago')
    };
  }

  /**
   * Prepara los datos para la planilla
   * @param {Object} formData - Datos del formulario
   * @returns {Object} Datos estructurados
   * @private
   */
  #preparePlanillaData(formData) {
    const course = COURSES[formData.curso] || {};
    
    return {
      curso: {
        id: formData.curso,
        nombre: course.name || '',
        turno: course.turno || '',
        dias: course.dias || '',
        horario: course.horario || '',
        totalClases: course.totalClases || '',
        horas: course.horas || '',
        profesor: course.profesor || ''
      },
      estudiante: {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        pais: formData.pais,
        apellido: '',
        documento: '',
        whatsapp: formData.telefono
      },
      pago: {
        metodo: this.#getPaymentMethodName(formData.metodoPago),
        fechaInscripcion: new Date().toLocaleDateString('es-CO'),
        valorCOP: '',
        valorUSD: ''
      }
    };
  }

  /**
   * Obtiene el nombre del método de pago
   * @param {string} method - Código del método
   * @returns {string} Nombre legible
   * @private
   */
  #getPaymentMethodName(method) {
    const methods = {
      'tarjeta': 'Tarjeta de crédito/débito',
      'transferencia': 'Transferencia bancaria',
      'nequi': 'Nequi',
      'daviplata': 'Daviplata'
    };
    return methods[method] || method;
  }

  /**
   * Maneja la descarga del PDF
   * @private
   */
  #handlePDFDownload() {
    const element = $('#planillaContent');
    
    // Verificar si html2pdf está disponible
    if (typeof html2pdf !== 'undefined' && element) {
      const options = {
        margin: 10,
        filename: `planilla-inscripcion-dux-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(options).from(element).save();
    } else {
      alert('📄 Generando PDF...\n\nEn un entorno de producción, esto descargaría la planilla en formato PDF.');
    }
  }

  /**
   * Obtiene la lista de cursos disponibles
   * @returns {Array} Lista de cursos
   */
  getCoursesList() {
    return Object.entries(COURSES).map(([id, course]) => ({
      id,
      ...course
    }));
  }

  /**
   * Obtiene un curso por ID
   * @param {string} courseId - ID del curso
   * @returns {Object|null} Datos del curso
   */
  getCourseById(courseId) {
    return COURSES[courseId] || null;
  }
}

// Singleton
export const enrollmentModule = new EnrollmentModule();
export default enrollmentModule;
