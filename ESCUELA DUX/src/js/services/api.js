/**
 * @fileoverview API Service - Cliente HTTP para comunicación con el backend
 * @module services/api
 */

/**
 * Configuración base de la API
 * @constant {Object}
 */
const API_CONFIG = Object.freeze({
  BASE_URL: '/public/api',
  TIMEOUT: 30000, // 30 segundos
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Clase ApiService - Cliente HTTP para la API de EscuelaDUX
 * @class
 */
class ApiService {
  #baseUrl;
  #defaultHeaders;
  #token;

  constructor() {
    this.#baseUrl = API_CONFIG.BASE_URL;
    this.#defaultHeaders = { ...API_CONFIG.HEADERS };
    this.#token = null;
    this.#loadToken();
  }

  /**
   * Carga el token desde sessionStorage
   * @private
   */
  #loadToken() {
    const session = sessionStorage.getItem('dux_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        this.#token = data.token || null;
      } catch (e) {
        this.#token = null;
      }
    }
  }

  /**
   * Establece el token de autenticación
   * @param {string} token - Token de sesión
   */
  setToken(token) {
    this.#token = token;
  }

  /**
   * Limpia el token
   */
  clearToken() {
    this.#token = null;
  }

  /**
   * Construye los headers de la petición
   * @param {Object} customHeaders - Headers adicionales
   * @returns {Object}
   * @private
   */
  #buildHeaders(customHeaders = {}) {
    const headers = { ...this.#defaultHeaders, ...customHeaders };
    
    if (this.#token) {
      headers['Authorization'] = `Bearer ${this.#token}`;
    }
    
    return headers;
  }

  /**
   * Construye la URL completa
   * @param {string} endpoint - Endpoint de la API
   * @returns {string}
   * @private
   */
  #buildUrl(endpoint) {
    // Asegurar que el endpoint empieza con /
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.#baseUrl}${path}`;
  }

  /**
   * Realiza una petición HTTP
   * @param {string} method - Método HTTP
   * @param {string} endpoint - Endpoint
   * @param {Object} data - Datos a enviar
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>}
   * @private
   */
  async #request(method, endpoint, data = null, options = {}) {
    const url = this.#buildUrl(endpoint);
    const isFormData = data instanceof FormData;
    
    const config = {
      method,
      headers: isFormData 
        ? { 'Accept': 'application/json' } // No establecer Content-Type para FormData
        : this.#buildHeaders(options.headers),
      ...options
    };

    // Agregar body si hay datos
    if (data && method !== 'GET') {
      config.body = isFormData ? data : JSON.stringify(data);
    }

    // Para GET con parámetros, agregarlos a la URL
    let finalUrl = url;
    if (method === 'GET' && data) {
      const params = new URLSearchParams(data);
      finalUrl = `${url}?${params.toString()}`;
    }

    try {
      console.log(`[API] ${method} ${finalUrl}`);
      
      const response = await fetch(finalUrl, config);
      const responseData = await response.json();

      // Log de respuesta
      console.log(`[API] Response:`, responseData);

      // Verificar si la respuesta fue exitosa
      if (!response.ok) {
        throw new ApiError(
          responseData.error || 'Error en la petición',
          response.status,
          responseData
        );
      }

      return responseData;

    } catch (error) {
      // Si ya es un ApiError, re-lanzar
      if (error instanceof ApiError) {
        throw error;
      }

      // Error de red u otro
      console.error(`[API] Error:`, error);
      throw new ApiError(
        'Error de conexión. Verifica tu conexión a internet.',
        0,
        { originalError: error.message }
      );
    }
  }

  /**
   * Petición GET
   * @param {string} endpoint - Endpoint
   * @param {Object} params - Query params
   * @returns {Promise<Object>}
   */
  async get(endpoint, params = null) {
    return this.#request('GET', endpoint, params);
  }

  /**
   * Petición POST
   * @param {string} endpoint - Endpoint
   * @param {Object} data - Datos
   * @returns {Promise<Object>}
   */
  async post(endpoint, data = {}) {
    return this.#request('POST', endpoint, data);
  }

  /**
   * Petición PUT
   * @param {string} endpoint - Endpoint
   * @param {Object} data - Datos
   * @returns {Promise<Object>}
   */
  async put(endpoint, data = {}) {
    return this.#request('PUT', endpoint, data);
  }

  /**
   * Petición DELETE
   * @param {string} endpoint - Endpoint
   * @param {Object} data - Datos
   * @returns {Promise<Object>}
   */
  async delete(endpoint, data = null) {
    return this.#request('DELETE', endpoint, data);
  }

  /**
   * Sube un archivo
   * @param {string} endpoint - Endpoint
   * @param {FormData} formData - FormData con el archivo
   * @returns {Promise<Object>}
   */
  async upload(endpoint, formData) {
    return this.#request('POST', endpoint, formData);
  }

  // ============================================
  // Métodos específicos de autenticación
  // ============================================

  /**
   * Inicia sesión
   * @param {string} email - Email
   * @param {string} password - Contraseña
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    const response = await this.post('/auth/login.php', { email, password });
    
    if (response.success && response.data) {
      // Guardar sesión
      this.setToken(response.data.token);
      sessionStorage.setItem('dux_session', JSON.stringify(response.data));
    }
    
    return response;
  }

  /**
   * Registra nuevo usuario e inscribe a curso
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>}
   */
  async register(userData) {
    return this.post('/auth/register.php', userData);
  }

  /**
   * Cierra sesión
   */
  logout() {
    this.clearToken();
    sessionStorage.removeItem('dux_session');
  }

  /**
   * Obtiene la sesión guardada
   * @returns {Object|null}
   */
  getSession() {
    const session = sessionStorage.getItem('dux_session');
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  /**
   * Verifica si hay sesión activa
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.getSession() !== null;
  }

  // ============================================
  // Métodos específicos por módulo
  // ============================================

  /**
   * Obtiene todos los cursos
   * @returns {Promise<Object>}
   */
  async getCourses() {
    return this.get('/courses/get_all.php');
  }

  /**
   * Obtiene datos del dashboard de estudiante
   * @param {number} studentId - ID del estudiante
   * @returns {Promise<Object>}
   */
  async getStudentDashboard(studentId) {
    return this.get('/student/dashboard_data.php', { student_id: studentId });
  }

  /**
   * Sube una tarea
   * @param {FormData} formData - FormData con el archivo
   * @returns {Promise<Object>}
   */
  async uploadSubmission(formData) {
    return this.upload('/student/upload_submission.php', formData);
  }

  /**
   * Obtiene datos del dashboard de profesor
   * @param {number} teacherId - ID del profesor
   * @returns {Promise<Object>}
   */
  async getTeacherDashboard(teacherId) {
    return this.get('/teacher/dashboard_data.php', { teacher_id: teacherId });
  }

  /**
   * Crea una tarea
   * @param {Object} assignmentData - Datos de la tarea
   * @returns {Promise<Object>}
   */
  async createAssignment(assignmentData) {
    return this.post('/teacher/create_assignment.php', assignmentData);
  }

  /**
   * Califica una entrega
   * @param {Object} gradeData - Datos de calificación
   * @returns {Promise<Object>}
   */
  async gradeSubmission(gradeData) {
    return this.post('/teacher/grade_submission.php', gradeData);
  }

  /**
   * Obtiene estadísticas del admin
   * @returns {Promise<Object>}
   */
  async getAdminStats() {
    return this.get('/admin/get_stats.php');
  }

  /**
   * Obtiene lista de usuarios
   * @param {Object} filters - Filtros
   * @returns {Promise<Object>}
   */
  async getUsers(filters = {}) {
    return this.get('/admin/get_users.php', filters);
  }

  /**
   * Obtiene inscripciones
   * @param {Object} filters - Filtros
   * @returns {Promise<Object>}
   */
  async getEnrollments(filters = {}) {
    return this.get('/admin/get_enrollments.php', filters);
  }

  /**
   * Aprueba o rechaza inscripción
   * @param {Object} data - Datos de la acción
   * @returns {Promise<Object>}
   */
  async updateEnrollmentStatus(data) {
    return this.post('/admin/approve_enrollment.php', data);
  }
}

/**
 * Clase de error personalizada para la API
 */
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /**
   * Verifica si es error de autenticación
   * @returns {boolean}
   */
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Verifica si es error de validación
   * @returns {boolean}
   */
  isValidationError() {
    return this.status === 400;
  }

  /**
   * Verifica si es error de servidor
   * @returns {boolean}
   */
  isServerError() {
    return this.status >= 500;
  }
}

// Singleton
export const api = new ApiService();
export { ApiError };
export default api;
