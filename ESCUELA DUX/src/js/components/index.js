/**
 * @fileoverview Índice de componentes - Exporta todos los componentes
 * @module components
 */

// Layout Components
export { Navbar } from './Navbar.js';
export { Home } from './Home.js';

// Dashboard Components
export { StudentPanel, getStudentSectionContent } from './StudentPanel.js';
export { TeacherPanel, getTeacherSectionContent } from './TeacherPanel.js';
export { AdminPanel, getAdminSectionContent, ADMIN_SECTIONS } from './AdminPanel.js';

// Modal Components
export { Modals, EnrollmentModal, PlanillaModal, generatePlanillaContent } from './Modals.js';
