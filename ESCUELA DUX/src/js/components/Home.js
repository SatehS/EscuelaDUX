/**
 * @fileoverview Componente Home - Pantalla de inicio con login
 * @module components/Home
 */

/**
 * Renderiza la pantalla de inicio
 * @returns {string} HTML del home
 */
export const Home = () => {
  return `
    <main class="container-fluid home-split min-vh-100 d-flex align-items-center justify-content-center">
      <article class="row w-100 home-card shadow-lg overflow-hidden rounded-4">
        
        <!-- Columna izquierda: Bienvenida -->
        <section class="col-md-6 d-flex flex-column align-items-center justify-content-center p-5 home-left position-relative">
          <div class="home-bg" aria-hidden="true"></div>
          <div class="position-relative z-2 text-center w-100">
            <img 
              src="public/assets/images/logo-escuela-dux.png" 
              alt="Logo Escuela DUX" 
              class="logo-hero mb-4" 
              style="background:transparent;box-shadow:none;width:120px;"
            >
            <h1 class="fw-bold text-white mb-3 h2">¡Bienvenido a Escuela DUX!</h1>
            <p class="text-light mb-0 fs-5">
              Palabras que transforman,<br>historias que perduran.
            </p>
          </div>
        </section>

        <!-- Columna derecha: Login/Registro -->
        <section class="col-md-6 bg-white home-bg-img d-flex flex-column justify-content-center p-5">
          <div class="d-flex justify-content-center mb-4 gap-2">
            <button class="btn btn-danger rounded-pill" id="inscripcionBtnHome" type="button">
              Inscribirse a un curso
            </button>
          </div>

          <!-- Tabs de navegación -->
          <ul class="nav nav-pills mb-4 justify-content-center" id="pills-tab" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link active" 
                id="pills-login-tab" 
                data-bs-toggle="pill" 
                data-bs-target="#pills-login" 
                type="button" 
                role="tab" 
                aria-controls="pills-login" 
                aria-selected="true"
              >
                Iniciar Sesión
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="pills-register-tab" 
                data-bs-toggle="pill" 
                data-bs-target="#pills-register" 
                type="button" 
                role="tab" 
                aria-controls="pills-register" 
                aria-selected="false"
              >
                Registrarse
              </button>
            </li>
          </ul>

          <div class="tab-content" id="pills-tabContent">
            <!-- Tab: Login -->
            <div 
              class="tab-pane fade show active" 
              id="pills-login" 
              role="tabpanel" 
              aria-labelledby="pills-login-tab"
            >
              <div class="alert alert-secondary small mb-3" role="alert">
                <strong>Usuarios de prueba:</strong><br>
                <span class="d-block">Alumno: <code>alumno@dux.com</code> / <code>1234</code></span>
                <span class="d-block">Profesor: <code>profesor@dux.com</code> / <code>1234</code></span>
                <span class="d-block">Admin: <code>admin@dux.com</code> / <code>1234</code></span>
              </div>
              <form id="formLoginHome" novalidate>
                <div class="mb-3">
                  <label for="loginEmailHome" class="visually-hidden">Correo electrónico</label>
                  <input 
                    type="email" 
                    class="form-control form-control-lg" 
                    id="loginEmailHome" 
                    placeholder="Correo electrónico" 
                    required
                    autocomplete="email"
                  >
                </div>
                <div class="mb-3">
                  <label for="loginPasswordHome" class="visually-hidden">Contraseña</label>
                  <input 
                    type="password" 
                    class="form-control form-control-lg" 
                    id="loginPasswordHome" 
                    placeholder="Contraseña" 
                    required
                    autocomplete="current-password"
                  >
                </div>
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="keepSignedInHome">
                  <label class="form-check-label text-secondary" for="keepSignedInHome">
                    Mantener sesión iniciada
                  </label>
                </div>
                <button type="submit" class="btn btn-danger btn-lg w-100 rounded-pill">
                  Acceder
                </button>
              </form>
            </div>

            <!-- Tab: Registro -->
            <div 
              class="tab-pane fade" 
              id="pills-register" 
              role="tabpanel" 
              aria-labelledby="pills-register-tab"
            >
              <form id="formRegisterHome" novalidate>
                <div class="mb-3">
                  <label for="registerEmailHome" class="visually-hidden">Correo electrónico</label>
                  <input 
                    type="email" 
                    class="form-control form-control-lg" 
                    id="registerEmailHome" 
                    placeholder="Correo electrónico" 
                    required
                    autocomplete="email"
                  >
                </div>
                <div class="mb-3">
                  <label for="registerPasswordHome" class="visually-hidden">Contraseña</label>
                  <input 
                    type="password" 
                    class="form-control form-control-lg" 
                    id="registerPasswordHome" 
                    placeholder="Contraseña" 
                    required
                    autocomplete="new-password"
                  >
                </div>
                <div class="mb-3">
                  <label for="registerTipoHome" class="visually-hidden">Tipo de usuario</label>
                  <select class="form-select form-select-lg" id="registerTipoHome" required>
                    <option value="">Selecciona tipo de usuario</option>
                    <option value="alumno">Alumno</option>
                    <option value="profesor">Profesor</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-danger btn-lg w-100 rounded-pill">
                  Registrarse
                </button>
              </form>
            </div>
          </div>
        </section>
      </article>
    </main>
  `;
};

export default Home;
