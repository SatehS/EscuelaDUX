/**
 * @fileoverview Módulo Enrollment - Inscripción a cursos y generación de planillas
 * @module modules/enrollment
 */

import { COURSES, COMPANY_INFO, DOM_SELECTORS } from '../core/config.js';
import { $, setHTML, getValue, hide, show, modal } from '../utils/dom.js';
import { sanitize } from '../utils/validators.js';

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
  }

  /**
   * Vincula eventos de inscripción
   * @private
   */
  #bindEvents() {
    // Botones de abrir modal de inscripción
    document.addEventListener('click', (e) => {
      if (e.target.matches('#inscripcionBtn')) {
        modal.show(DOM_SELECTORS.ENROLLMENT_MODAL);
      }
    });

    // Cambio de curso seleccionado
    const courseSelect = $('#curso');
    if (courseSelect) {
      courseSelect.addEventListener('change', (e) => this.#handleCourseChange(e));
    }

    // Formulario de inscripción
    const enrollForm = $(DOM_SELECTORS.ENROLLMENT_FORM);
    if (enrollForm) {
      enrollForm.addEventListener('submit', (e) => this.#handleEnrollment(e));
    }

    // Descargar PDF
    document.addEventListener('click', (e) => {
      if (e.target.matches('#descargarPDF')) {
        this.#handlePDFDownload();
      }
    });
  }

  /**
   * Maneja el cambio de curso seleccionado
   * @param {Event} e - Evento change
   * @private
   */
  #handleCourseChange(e) {
    const courseId = e.target.value;
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
   * @param {Event} e - Evento submit
   * @private
   */
  #handleEnrollment(e) {
    e.preventDefault();

    const formData = this.#collectFormData();
    const planillaHTML = this.#generatePlanilla(formData);

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
    const courseId = getValue('#curso');
    const course = COURSES[courseId] || {};
    const courseSelect = $('#curso');
    const selectedOption = courseSelect?.options[courseSelect.selectedIndex];

    return {
      curso: {
        id: courseId,
        nombre: selectedOption?.text || '',
        ...course
      },
      estudiante: {
        nombre: sanitize(getValue('#nombre')),
        email: sanitize(getValue('#email')),
        apellido: '',
        documento: '',
        telefono: '',
        pais: '',
        whatsapp: ''
      },
      pago: {
        metodo: getValue('#pago'),
        fechaInscripcion: new Date().toLocaleDateString('es-CO'),
        fechaPago: '',
        valorCOP: '',
        valorUSD: '',
        abono: '',
        saldo: ''
      }
    };
  }

  /**
   * Genera el HTML de la planilla de inscripción
   * @param {Object} data - Datos del formulario
   * @returns {string} HTML de la planilla
   * @private
   */
  #generatePlanilla(data) {
    const { curso, estudiante, pago } = data;

    return `
      <div class="container-fluid planilla">
        <!-- Header -->
        <div class="row align-items-center mb-3">
          <div class="col-2 text-center">
            <img src="public/assets/images/logo-escuela-dux.png" alt="Logo" class="planilla__logo">
          </div>
          <div class="col-10">
            <h4 class="fw-bold mb-0">${COMPANY_INFO.name}</h4>
            <small>Inscripción de alumnos</small><br>
            <small>${COMPANY_INFO.email}</small>
          </div>
        </div>

        <hr class="border-danger border-2 opacity-50 mb-3">

        <!-- Datos del estudiante -->
        <section class="planilla__section">
          <div class="row mb-2">
            <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">
              Datos del estudiante
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-md-3 mb-2"><strong>Nombre:</strong> ${estudiante.nombre}</div>
            <div class="col-md-3 mb-2"><strong>Apellido:</strong> ${estudiante.apellido}</div>
            <div class="col-md-3 mb-2"><strong>N° Documento:</strong> ${estudiante.documento}</div>
            <div class="col-md-3 mb-2"><strong>Tel:</strong> ${estudiante.telefono}</div>
          </div>
          <div class="row mb-2">
            <div class="col-md-3 mb-2"><strong>País:</strong> ${estudiante.pais}</div>
            <div class="col-md-3 mb-2"><strong>Mail:</strong> ${estudiante.email}</div>
            <div class="col-md-3 mb-2"><strong>WhatsApp:</strong> ${estudiante.whatsapp}</div>
          </div>
        </section>

        <!-- Datos del Taller -->
        <section class="planilla__section">
          <div class="row mb-2 mt-3">
            <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">
              Datos del Taller
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-md-4 mb-2"><strong>Curso:</strong> ${curso.nombre}</div>
            <div class="col-md-2 mb-2"><strong>Turno:</strong> ${curso.turno || ''}</div>
            <div class="col-md-2 mb-2"><strong>Días:</strong> ${curso.dias || ''}</div>
            <div class="col-md-4 mb-2"><strong>Horario:</strong> ${curso.horario || ''}</div>
          </div>
          <div class="row mb-2">
            <div class="col-md-3 mb-2"><strong>Total de clases:</strong> ${curso.totalClases || ''}</div>
            <div class="col-md-3 mb-2"><strong>Horas totales:</strong> ${curso.horas || ''}</div>
            <div class="col-md-6 mb-2"><strong>Profesor:</strong> ${curso.profesor || ''}</div>
          </div>
        </section>

        <!-- Pagos -->
        <section class="planilla__section">
          <div class="row mb-2 mt-3">
            <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">
              Pagos
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-md-3 mb-2"><strong>Fecha de inscripción:</strong> ${pago.fechaInscripcion}</div>
            <div class="col-md-3 mb-2"><strong>Fecha de pago:</strong> ${pago.fechaPago}</div>
            <div class="col-md-3 mb-2"><strong>Valor del taller COP:</strong> ${pago.valorCOP}</div>
            <div class="col-md-3 mb-2"><strong>Valor del taller USD:</strong> ${pago.valorUSD}</div>
          </div>
          <div class="row mb-2">
            <div class="col-md-3 mb-2"><strong>Abono a cuenta:</strong> ${pago.abono}</div>
            <div class="col-md-3 mb-2"><strong>Saldo pendiente:</strong> ${pago.saldo}</div>
          </div>
        </section>

        <!-- Datos legales -->
        <section class="planilla__section planilla__section--legal">
          <div class="row mb-2 mt-3">
            <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">
              Datos legales
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-12 small text-secondary">
              <p>En calidad de estudiante, me comprometo al pago solicitado por ${COMPANY_INFO.name}, 
              por el servicio de cursos en educación informal, en los plazos y fechas a partir de la fecha. 
              Recordatorio de pago: DUXPEDAGOGIA, ${COMPANY_INFO.bank}, 
              Número de cuenta ${COMPANY_INFO.accountNumber} a nombre de ${COMPANY_INFO.accountName}, 
              NIT ${COMPANY_INFO.nit}.</p>
              <p>Para certificados oficiales, deberá hacer el pago de inscripción antes o el día 0. 
              Consultar sobre medios disponibles. Notificar de su pago al mail ${COMPANY_INFO.email} 
              o al WhatsApp corporativo.</p>
            </div>
          </div>
        </section>

        <!-- Firmas -->
        <div class="row mt-4 planilla__signatures">
          <div class="col-6 text-center">
            <span class="fw-bold">${COMPANY_INFO.accountName}</span><br><br>
            <div class="planilla__signature-line"></div>
          </div>
          <div class="col-6 text-center">
            <span class="fw-bold">Alumno(a)</span><br><br>
            <div class="planilla__signature-line"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Maneja la descarga del PDF
   * @private
   */
  #handlePDFDownload() {
    // Verificar si html2pdf está disponible
    if (typeof html2pdf !== 'undefined') {
      const element = $(DOM_SELECTORS.PLANILLA_PREVIEW);
      const options = {
        margin: 10,
        filename: 'planilla-inscripcion-dux.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(options).from(element).save();
    } else {
      alert('Simulación: Aquí se descargaría la planilla en PDF.');
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
