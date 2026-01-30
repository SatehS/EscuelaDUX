/**
 * @fileoverview Componente Navbar - Barra de navegación principal
 * @module components/Navbar
 */

import { appState } from '../core/state.js';

/**
 * Renderiza el navbar de la aplicación
 * @returns {string} HTML del navbar
 */
export const Navbar = () => {
  const isAuthenticated = appState.isLoggedIn();
  const userName = appState.getUserName();
  const userRole = appState.getUserRole();

  return `
    <nav class="navbar navbar-dark bg-black py-2" role="navigation" aria-label="Navegación principal">
      <div class="container-fluid">
        <a class="navbar-brand d-flex align-items-center gap-2" href="#" data-navigate="home" aria-label="Inicio">
          <img src="public/assets/images/logo-escuela-dux.png" alt="Logo Escuela DUX" height="36">
          <span class="fw-bold text-danger">Escuela DUX</span>
        </a>
        <div class="d-flex align-items-center gap-3">
          ${isAuthenticated ? `
            <span class="text-light">
              <span class="badge bg-danger me-2">${_capitalizeRole(userRole)}</span>
              ${userName}
            </span>
            <button class="btn btn-outline-light btn-sm rounded-pill" id="logoutBtn" type="button">
              Cerrar sesión
            </button>
          ` : `
            <button class="btn btn-danger rounded-pill" id="inscripcionBtn" type="button">
              Inscribirse a un curso
            </button>
          `}
        </div>
      </div>
    </nav>
  `;
};

/**
 * Capitaliza el rol del usuario
 * @param {string} role - Rol del usuario
 * @returns {string} Rol capitalizado
 * @private
 */
const _capitalizeRole = (role) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export default Navbar;
