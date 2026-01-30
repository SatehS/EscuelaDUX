/**
 * @fileoverview Componente Modals - Modales de la aplicación
 * @module components/Modals
 */

import { COURSES, COMPANY_INFO } from '../core/config.js';

/**
 * Renderiza todos los modales de la aplicación
 * @returns {string} HTML de los modales
 */
export const Modals = () => {
  return `
    ${EnrollmentModal()}
    ${PlanillaModal()}
  `;
};

/**
 * Modal de inscripción a cursos
 * @returns {string} HTML del modal
 */
export const EnrollmentModal = () => {
  const courseOptions = Object.entries(COURSES)
    .map(([id, course]) => `<option value="${id}">${course.name}</option>`)
    .join('');

  return `
    <div class="modal fade" id="inscripcionModal" tabindex="-1" aria-labelledby="inscripcionModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h3 class="modal-title h5" id="inscripcionModalLabel">Inscripción a Curso</h3>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <form id="formInscripcion" novalidate>
              <div class="mb-3">
                <label for="curso" class="form-label">Curso</label>
                <select class="form-select" id="curso" required>
                  <option value="">Selecciona un curso</option>
                  ${courseOptions}
                </select>
              </div>

              <!-- Detalles del curso seleccionado -->
              <div class="mb-3 d-none" id="detallesCurso">
                <div class="card card-body bg-light border border-danger">
                  <p class="mb-1"><strong>Turno:</strong> <span id="detalleTurno"></span></p>
                  <p class="mb-1"><strong>Días:</strong> <span id="detalleDias"></span></p>
                  <p class="mb-1"><strong>Horario:</strong> <span id="detalleHorario"></span></p>
                  <p class="mb-1"><strong>Total de clases:</strong> <span id="detalleTotalClases"></span></p>
                  <p class="mb-1"><strong>Horas de clases:</strong> <span id="detalleHoras"></span></p>
                  <p class="mb-1"><strong>Profesor:</strong> <span id="detalleProfesor"></span></p>
                </div>
              </div>

              <div class="mb-3">
                <label for="inscripcionNombre" class="form-label">Nombre completo</label>
                <input type="text" class="form-control" id="inscripcionNombre" required autocomplete="name">
              </div>
              <div class="mb-3">
                <label for="inscripcionEmail" class="form-label">Correo electrónico</label>
                <input type="email" class="form-control" id="inscripcionEmail" required autocomplete="email">
              </div>
              <div class="mb-3">
                <label for="inscripcionTelefono" class="form-label">Teléfono/WhatsApp</label>
                <input type="tel" class="form-control" id="inscripcionTelefono" autocomplete="tel">
              </div>
              <div class="mb-3">
                <label for="inscripcionPais" class="form-label">País</label>
                <select class="form-select" id="inscripcionPais">
                  <option value="">Selecciona tu país</option>
                  <option value="Colombia">Colombia</option>
                  <option value="México">México</option>
                  <option value="Argentina">Argentina</option>
                  <option value="España">España</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="pago" class="form-label">Método de pago</label>
                <select class="form-select" id="pago" required>
                  <option value="">Selecciona un método</option>
                  <option value="tarjeta">Tarjeta de crédito/débito</option>
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">Daviplata</option>
                </select>
              </div>
              <button type="submit" class="btn btn-danger w-100">
                Generar Planilla de Inscripción
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Modal de previsualización de planilla
 * @returns {string} HTML del modal
 */
export const PlanillaModal = () => {
  return `
    <div class="modal fade" id="planillaModal" tabindex="-1" aria-labelledby="planillaModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h3 class="modal-title h5" id="planillaModalLabel">Planilla de Inscripción</h3>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex justify-content-end mb-3">
              <button class="btn btn-outline-danger" id="descargarPDF" type="button">
                <strong>📄 Descargar PDF</strong>
              </button>
            </div>
            <div id="planillaPreview" aria-live="polite"></div>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Genera el contenido de la planilla de inscripción
 * @param {Object} data - Datos de la inscripción
 * @returns {string} HTML de la planilla
 */
export const generatePlanillaContent = (data) => {
  const { curso, estudiante, pago } = data;

  return `
    <div class="container-fluid planilla" id="planillaContent">
      <!-- Header -->
      <div class="row align-items-center mb-3">
        <div class="col-2 text-center">
          <img src="public/assets/images/logo-escuela-dux.png" alt="Logo" class="planilla__logo" style="max-width: 90px;">
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
          <div class="col-md-3 mb-2"><strong>Apellido:</strong> ${estudiante.apellido || ''}</div>
          <div class="col-md-3 mb-2"><strong>N° Documento:</strong> ${estudiante.documento || ''}</div>
          <div class="col-md-3 mb-2"><strong>Tel:</strong> ${estudiante.telefono || ''}</div>
        </div>
        <div class="row mb-2">
          <div class="col-md-3 mb-2"><strong>País:</strong> ${estudiante.pais || ''}</div>
          <div class="col-md-3 mb-2"><strong>Mail:</strong> ${estudiante.email}</div>
          <div class="col-md-3 mb-2"><strong>WhatsApp:</strong> ${estudiante.whatsapp || estudiante.telefono || ''}</div>
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
          <div class="col-md-3 mb-2"><strong>Método de pago:</strong> ${pago.metodo || ''}</div>
          <div class="col-md-3 mb-2"><strong>Valor del taller COP:</strong> ${pago.valorCOP || ''}</div>
          <div class="col-md-3 mb-2"><strong>Valor del taller USD:</strong> ${pago.valorUSD || ''}</div>
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
          <div class="planilla__signature-line" style="border-top: 1px solid #666; width: 150px; margin: 0 auto;"></div>
          <small class="text-muted">Firma autorizada</small>
        </div>
        <div class="col-6 text-center">
          <span class="fw-bold">Alumno(a)</span><br><br>
          <div class="planilla__signature-line" style="border-top: 1px solid #666; width: 150px; margin: 0 auto;"></div>
          <small class="text-muted">Firma del estudiante</small>
        </div>
      </div>
    </div>
  `;
};

export default Modals;
