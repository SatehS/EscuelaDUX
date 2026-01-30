/**
 * @fileoverview Módulo Enrollment - Inscripción a cursos con API
 * @module modules/enrollment
 */

import { COURSES, DOM_SELECTORS } from '../core/config.js';
import { appState } from '../core/state.js';
import { api, ApiError } from '../services/api.js';
import { $, setHTML, getValue, hide, show, modal, delegate } from '../utils/dom.js';
import { validateEnrollmentForm } from '../utils/validators.js';
import { generatePlanillaContent } from '../components/Modals.js';

/**
 * Clase EnrollmentModule - Gestiona la inscripción a cursos con backend
 * @class
 */
class EnrollmentModule {
  #initialized;
  #courses;

  constructor() {
    this.#initialized = false;
    this.#courses = null;
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
    delegate(document, 'click', '#inscripcionBtn, #inscripcionBtnHome', async (e) => {
      e.preventDefault();
      await this.#loadCoursesAndOpenModal();
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
   * Carga cursos desde la API y abre el modal
   * @private
   */
  async #loadCoursesAndOpenModal() {
    try {
      // Cargar cursos si no están en caché
      if (!this.#courses) {
        const response = await api.getCourses();
        if (response.success && response.data) {
          this.#courses = response.data.courses;
          this.#updateCourseSelect();
        }
      }
      
      modal.show(DOM_SELECTORS.ENROLLMENT_MODAL);
      
    } catch (error) {
      console.error('[EnrollmentModule] Error cargando cursos:', error);
      // Fallback a cursos locales
      modal.show(DOM_SELECTORS.ENROLLMENT_MODAL);
    }
  }

  /**
   * Actualiza el select de cursos con datos de la API
   * @private
   */
  #updateCourseSelect() {
    const select = $('#curso');
    if (!select || !this.#courses) return;

    // Limpiar opciones existentes excepto la primera
    while (select.options.length > 1) {
      select.remove(1);
    }

    // Agregar cursos de la API
    this.#courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.id;
      option.textContent = course.title;
      option.dataset.course = JSON.stringify(course);
      select.appendChild(option);
    });
  }

  /**
   * Maneja el cambio de curso seleccionado
   * @param {string} courseId - ID del curso
   * @private
   */
  #handleCourseChange(courseId) {
    const detailsContainer = $('#detallesCurso');
    
    if (!courseId) {
      hide(detailsContainer);
      return;
    }

    // Buscar curso en cache de API o en COURSES local
    let course = this.#courses?.find(c => c.id == courseId);
    
    if (!course && COURSES[courseId]) {
      course = COURSES[courseId];
    }

    if (course) {
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
    // Mapear campos de API a campos del DOM
    const schedule = course.schedule || {};
    
    const fields = {
      '#detalleTurno': schedule.shift || course.turno || '',
      '#detalleDias': schedule.days || course.dias || '',
      '#detalleHorario': schedule.time || course.horario || '',
      '#detalleTotalClases': course.total_classes || course.totalClases || '',
      '#detalleHoras': course.total_hours || course.horas || '',
      '#detalleProfesor': course.teacher?.name || course.profesor || ''
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
  async #handleEnrollment() {
    const formData = this.#collectFormData();
    
    // Validar formulario
    const validation = validateEnrollmentForm(formData);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0][0];
      alert(firstError);
      return;
    }

    const submitBtn = $('#formInscripcion button[type="submit"]');
    const originalText = submitBtn?.textContent;
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Procesando...';
    }

    try {
      // Enviar a la API
      const response = await api.register({
        full_name: formData.nombre,
        email: formData.email,
        password: '1234', // Password temporal
        course_id: formData.curso,
        phone: formData.telefono,
        country: formData.pais,
        payment_method: formData.metodoPago
      });

      if (response.success) {
        // Generar planilla con los datos
        const planillaData = this.#preparePlanillaData(formData, response.data);
        const planillaHTML = generatePlanillaContent(planillaData);

        setHTML($(DOM_SELECTORS.PLANILLA_PREVIEW), planillaHTML);
        
        modal.hide(DOM_SELECTORS.ENROLLMENT_MODAL);
        
        setTimeout(() => {
          modal.show(DOM_SELECTORS.PLANILLA_MODAL);
        }, 400);

        // Mostrar mensaje de éxito
        console.log('[EnrollmentModule] Inscripción exitosa:', response.data);
      }

    } catch (error) {
      console.error('[EnrollmentModule] Error en inscripción:', error);
      
      if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert('Error al procesar la inscripción. Intenta nuevamente.');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
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
   * @param {Object} apiResponse - Respuesta de la API
   * @returns {Object} Datos estructurados
   * @private
   */
  #preparePlanillaData(formData, apiResponse = null) {
    // Buscar curso
    let course = this.#courses?.find(c => c.id == formData.curso);
    if (!course && COURSES[formData.curso]) {
      course = COURSES[formData.curso];
    }
    
    const schedule = course?.schedule || {};
    
    return {
      curso: {
        id: formData.curso,
        nombre: course?.title || course?.name || '',
        turno: schedule.shift || course?.turno || '',
        dias: schedule.days || course?.dias || '',
        horario: schedule.time || course?.horario || '',
        totalClases: course?.total_classes || course?.totalClases || '',
        horas: course?.total_hours || course?.horas || '',
        profesor: course?.teacher?.name || course?.profesor || ''
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
        valorCOP: course?.price?.cop || '',
        valorUSD: course?.price?.usd || ''
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
      alert('📄 Generando PDF...\n\nEn producción, esto descargaría la planilla en formato PDF.');
    }
  }
}

// Singleton
export const enrollmentModule = new EnrollmentModule();
export default enrollmentModule;
