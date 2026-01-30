/**
 * @fileoverview Componente AdminPanel - Panel completo del administrador
 * @module components/AdminPanel
 */

import { appState } from '../core/state.js';

/**
 * Secciones del panel de administrador
 * @constant {Object}
 */
export const ADMIN_SECTIONS = Object.freeze({
  DASHBOARD: 'dashboard',
  ALUMNOS: 'alumnos',
  PROFESORES: 'profesores',
  CURSOS: 'cursos',
  PAGOS: 'pagos',
  FACTURAS: 'facturas',
  USUARIOS: 'usuarios',
  CONFIGURACION: 'configuracion'
});

/**
 * Renderiza el panel del administrador
 * @returns {string} HTML del panel
 */
export const AdminPanel = () => {
  const currentSection = appState.getCurrentSection() || ADMIN_SECTIONS.DASHBOARD;
  
  return `
    <main class="container my-4">
      <section class="admin-layout" aria-label="Panel administrativo">
        ${AdminSidebar(currentSection)}
        <div class="admin-main">
          ${AdminHeader()}
          <div id="adminContent" class="admin-content">
            ${getAdminSectionContent(currentSection)}
          </div>
        </div>
      </section>
    </main>
  `;
};

/**
 * Renderiza el sidebar del administrador
 * @param {string} activeSection - Sección activa
 * @returns {string} HTML del sidebar
 */
const AdminSidebar = (activeSection) => {
  const menuItems = [
    { section: ADMIN_SECTIONS.DASHBOARD, icon: '📊', label: 'Dashboard' },
    { section: ADMIN_SECTIONS.ALUMNOS, icon: '👨‍🎓', label: 'Gestión de Alumnos' },
    { section: ADMIN_SECTIONS.PROFESORES, icon: '👨‍🏫', label: 'Gestión de Profesores' },
    { section: ADMIN_SECTIONS.CURSOS, icon: '📚', label: 'Gestión de Cursos' },
    { section: ADMIN_SECTIONS.PAGOS, icon: '💳', label: 'Pagos' },
    { section: ADMIN_SECTIONS.FACTURAS, icon: '🧾', label: 'Facturas' },
    { section: ADMIN_SECTIONS.USUARIOS, icon: '👥', label: 'Crear Usuarios' },
    { section: ADMIN_SECTIONS.CONFIGURACION, icon: '⚙️', label: 'Configuración' }
  ];

  return `
    <nav class="admin-sidebar" aria-label="Menú administrativo">
      <div class="sidebar-logo mb-4 mt-3 text-center">
        <div class="sidebar-logo-bg sidebar-logo-bg--admin">
          <img src="public/assets/images/logo-escuela-dux.png" alt="Logo Escuela DUX">
        </div>
      </div>
      <div class="sidebar-admin-badge text-center mb-3">
        <span class="badge bg-warning text-dark">ADMINISTRADOR</span>
      </div>
      <ul class="sidebar-menu nav flex-column gap-2">
        ${menuItems.map(item => `
          <li class="nav-item">
            <a 
              class="nav-link ${item.section === activeSection ? 'active' : ''}" 
              data-section="${item.section}" 
              href="#" 
              role="button"
            >
              <span class="sidebar-icon" aria-hidden="true">${item.icon}</span> 
              ${item.label}
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;
};

/**
 * Renderiza el header del panel administrativo
 * @returns {string} HTML del header
 */
const AdminHeader = () => {
  const userName = appState.getUserName() || 'Administrador';
  
  return `
    <header class="admin-header d-flex justify-content-between align-items-center p-3 mb-4">
      <div>
        <h5 class="mb-0 text-danger">Panel de Administración</h5>
        <small class="text-muted">Grupo DUX S.A.S</small>
      </div>
      <div class="d-flex align-items-center gap-3">
        <span class="fw-bold">${userName}</span>
        <img src="public/assets/images/avatar-alumno.png" alt="Avatar" class="student-avatar-img">
      </div>
    </header>
  `;
};

/**
 * Obtiene el contenido de una sección específica
 * @param {string} section - Nombre de la sección
 * @returns {string} HTML del contenido
 */
export const getAdminSectionContent = (section) => {
  const contentMap = {
    [ADMIN_SECTIONS.DASHBOARD]: renderDashboard,
    [ADMIN_SECTIONS.ALUMNOS]: renderAlumnos,
    [ADMIN_SECTIONS.PROFESORES]: renderProfesores,
    [ADMIN_SECTIONS.CURSOS]: renderCursos,
    [ADMIN_SECTIONS.PAGOS]: renderPagos,
    [ADMIN_SECTIONS.FACTURAS]: renderFacturas,
    [ADMIN_SECTIONS.USUARIOS]: renderUsuarios,
    [ADMIN_SECTIONS.CONFIGURACION]: renderConfiguracion
  };

  const renderer = contentMap[section] || renderDashboard;
  return renderer();
};

// ============================================
// Renderers de secciones
// ============================================

const renderDashboard = () => `
  <div class="row g-4">
    <!-- Stats Cards -->
    <div class="col-md-3">
      <div class="card admin-stat-card bg-primary text-white">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="card-subtitle mb-1 opacity-75">Total Alumnos</h6>
              <h2 class="card-title mb-0">156</h2>
            </div>
            <span class="admin-stat-icon">👨‍🎓</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card admin-stat-card bg-success text-white">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="card-subtitle mb-1 opacity-75">Profesores</h6>
              <h2 class="card-title mb-0">8</h2>
            </div>
            <span class="admin-stat-icon">👨‍🏫</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card admin-stat-card bg-warning text-dark">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="card-subtitle mb-1 opacity-75">Cursos Activos</h6>
              <h2 class="card-title mb-0">7</h2>
            </div>
            <span class="admin-stat-icon">📚</span>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card admin-stat-card bg-danger text-white">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="card-subtitle mb-1 opacity-75">Pagos Pendientes</h6>
              <h2 class="card-title mb-0">12</h2>
            </div>
            <span class="admin-stat-icon">💳</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="col-md-8">
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <h5 class="mb-0 text-danger">Actividad Reciente</h5>
        </div>
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>María García</strong> se inscribió a <em>Escritura Creativa</em>
              </div>
              <small class="text-muted">Hace 2 horas</small>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>Carlos López</strong> realizó un pago de $150.000 COP
              </div>
              <small class="text-muted">Hace 5 horas</small>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>Prof. Carolina Eguiguren</strong> subió nueva clase
              </div>
              <small class="text-muted">Hace 1 día</small>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="col-md-4">
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <h5 class="mb-0 text-danger">Acciones Rápidas</h5>
        </div>
        <div class="card-body d-grid gap-2">
          <button class="btn btn-outline-danger" data-action="create-student">
            ➕ Nuevo Alumno
          </button>
          <button class="btn btn-outline-danger" data-action="create-course">
            ➕ Nuevo Curso
          </button>
          <button class="btn btn-outline-danger" data-action="send-reminder">
            📧 Enviar Recordatorios
          </button>
          <button class="btn btn-outline-danger" data-action="export-report">
            📊 Exportar Reportes
          </button>
        </div>
      </div>
    </div>
  </div>
`;

const renderAlumnos = () => `
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-danger">Gestión de Alumnos</h5>
      <button class="btn btn-danger btn-sm" data-action="add-student">
        ➕ Agregar Alumno
      </button>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover" id="alumnosTable">
          <thead class="table-danger">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Curso</th>
              <th>Estado Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>001</td>
              <td>María García</td>
              <td>maria@email.com</td>
              <td>Escritura Creativa</td>
              <td><span class="badge bg-success">Pagado</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" title="Editar">✏️</button>
                <button class="btn btn-sm btn-outline-danger" title="Eliminar">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>002</td>
              <td>Carlos López</td>
              <td>carlos@email.com</td>
              <td>Escritura Creativa</td>
              <td><span class="badge bg-warning text-dark">Pendiente</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" title="Editar">✏️</button>
                <button class="btn btn-sm btn-outline-danger" title="Eliminar">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>003</td>
              <td>Ana Martínez</td>
              <td>ana@email.com</td>
              <td>Narración</td>
              <td><span class="badge bg-success">Pagado</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" title="Editar">✏️</button>
                <button class="btn btn-sm btn-outline-danger" title="Eliminar">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

const renderProfesores = () => `
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-danger">Gestión de Profesores</h5>
      <button class="btn btn-danger btn-sm" data-action="add-teacher">
        ➕ Agregar Profesor
      </button>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-danger">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Cursos Asignados</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>P001</td>
              <td>Carolina Eguiguren</td>
              <td>carolina@dux.com</td>
              <td>Escritura Creativa, Lector Editorial</td>
              <td><span class="badge bg-success">Activo</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1">✏️</button>
                <button class="btn btn-sm btn-outline-danger">🗑️</button>
              </td>
            </tr>
            <tr>
              <td>P002</td>
              <td>Hexy Marquez</td>
              <td>hexy@dux.com</td>
              <td>Redacción, Narración</td>
              <td><span class="badge bg-success">Activo</span></td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1">✏️</button>
                <button class="btn btn-sm btn-outline-danger">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
`;

const renderCursos = () => `
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-danger">Gestión de Cursos</h5>
      <button class="btn btn-danger btn-sm" data-action="add-course">
        ➕ Crear Curso
      </button>
    </div>
    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-title text-danger">Escritura Creativa</h6>
              <p class="card-text small text-muted">Prof. Carolina Eguiguren</p>
              <p class="card-text small">
                <strong>Turno:</strong> Noche<br>
                <strong>Días:</strong> Lunes y Miércoles<br>
                <strong>Alumnos:</strong> 25
              </p>
            </div>
            <div class="card-footer bg-white">
              <button class="btn btn-sm btn-outline-danger">Editar</button>
            </div>
          </div>
        </div>
        <div class="col-md-6 col-lg-4">
          <div class="card h-100">
            <div class="card-body">
              <h6 class="card-title text-danger">Narración</h6>
              <p class="card-text small text-muted">Prof. Hexy Marquez</p>
              <p class="card-text small">
                <strong>Turno:</strong> Noche<br>
                <strong>Días:</strong> Martes y Jueves<br>
                <strong>Alumnos:</strong> 18
              </p>
            </div>
            <div class="card-footer bg-white">
              <button class="btn btn-sm btn-outline-danger">Editar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

const renderPagos = () => `
  <div class="card shadow-sm">
    <div class="card-header bg-white">
      <h5 class="mb-0 text-danger">Gestión de Pagos</h5>
    </div>
    <div class="card-body">
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item">
          <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#pagosPendientes">Pendientes</button>
        </li>
        <li class="nav-item">
          <button class="nav-link" data-bs-toggle="tab" data-bs-target="#pagosCompletados">Completados</button>
        </li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane fade show active" id="pagosPendientes">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Curso</th>
                <th>Monto</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Carlos López</td>
                <td>Escritura Creativa</td>
                <td>$150.000 COP</td>
                <td>05/02/2026</td>
                <td>
                  <button class="btn btn-sm btn-success me-1">Confirmar Pago</button>
                  <button class="btn btn-sm btn-outline-warning">Recordar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
`;

const renderFacturas = () => `
  <div class="card shadow-sm">
    <div class="card-header bg-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0 text-danger">Facturas</h5>
      <button class="btn btn-danger btn-sm">
        ➕ Generar Factura
      </button>
    </div>
    <div class="card-body">
      <table class="table table-hover">
        <thead class="table-danger">
          <tr>
            <th>N° Factura</th>
            <th>Alumno</th>
            <th>Concepto</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>FAC-2026-001</td>
            <td>María García</td>
            <td>Inscripción Escritura Creativa</td>
            <td>$200.000 COP</td>
            <td>28/01/2026</td>
            <td>
              <button class="btn btn-sm btn-outline-primary">Ver</button>
              <button class="btn btn-sm btn-outline-secondary">PDF</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
`;

const renderUsuarios = () => `
  <div class="row g-4">
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <h5 class="mb-0 text-danger">Crear Nuevo Usuario</h5>
        </div>
        <div class="card-body">
          <form id="formCrearUsuario">
            <div class="mb-3">
              <label for="nuevoNombre" class="form-label">Nombre completo</label>
              <input type="text" class="form-control" id="nuevoNombre" required>
            </div>
            <div class="mb-3">
              <label for="nuevoEmail" class="form-label">Correo electrónico</label>
              <input type="email" class="form-control" id="nuevoEmail" required>
            </div>
            <div class="mb-3">
              <label for="nuevoPassword" class="form-label">Contraseña</label>
              <input type="password" class="form-control" id="nuevoPassword" required>
            </div>
            <div class="mb-3">
              <label for="nuevoRol" class="form-label">Tipo de usuario</label>
              <select class="form-select" id="nuevoRol" required>
                <option value="">Seleccionar...</option>
                <option value="alumno">Alumno</option>
                <option value="profesor">Profesor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button type="submit" class="btn btn-danger w-100">Crear Usuario</button>
          </form>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card shadow-sm">
        <div class="card-header bg-white">
          <h5 class="mb-0 text-danger">Usuarios del Sistema</h5>
        </div>
        <div class="card-body">
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>admin@dux.com</strong>
                <span class="badge bg-danger ms-2">Admin</span>
              </div>
              <button class="btn btn-sm btn-outline-secondary">Editar</button>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>profesor@dux.com</strong>
                <span class="badge bg-primary ms-2">Profesor</span>
              </div>
              <button class="btn btn-sm btn-outline-secondary">Editar</button>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>alumno@dux.com</strong>
                <span class="badge bg-success ms-2">Alumno</span>
              </div>
              <button class="btn btn-sm btn-outline-secondary">Editar</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
`;

const renderConfiguracion = () => `
  <div class="card shadow-sm">
    <div class="card-header bg-white">
      <h5 class="mb-0 text-danger">Configuración del Sistema</h5>
    </div>
    <div class="card-body">
      <form id="formConfiguracion">
        <h6 class="text-muted mb-3">Información de la Empresa</h6>
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label class="form-label">Nombre de la empresa</label>
            <input type="text" class="form-control" value="GRUPO DUX S.A.S">
          </div>
          <div class="col-md-6">
            <label class="form-label">NIT</label>
            <input type="text" class="form-control" value="901157018">
          </div>
          <div class="col-md-6">
            <label class="form-label">Email corporativo</label>
            <input type="email" class="form-control" value="educacionduxoficial@gmail.com">
          </div>
          <div class="col-md-6">
            <label class="form-label">WhatsApp</label>
            <input type="text" class="form-control" value="+57 300 123 4567">
          </div>
        </div>
        
        <h6 class="text-muted mb-3">Datos Bancarios</h6>
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <label class="form-label">Banco</label>
            <input type="text" class="form-control" value="Bancolombia">
          </div>
          <div class="col-md-4">
            <label class="form-label">Número de cuenta</label>
            <input type="text" class="form-control" value="30200040441">
          </div>
          <div class="col-md-4">
            <label class="form-label">Titular</label>
            <input type="text" class="form-control" value="Grupo Dux S.A.S">
          </div>
        </div>
        
        <button type="submit" class="btn btn-danger">Guardar Cambios</button>
      </form>
    </div>
  </div>
`;

export default AdminPanel;
