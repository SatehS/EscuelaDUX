Estructura propuesta para el proyecto Escuela DUX:

/src
  /js
    /modules
      - api.js
      - ui.js
      - auth.js
      - cursos.js
      - alumno.js
      - profesor.js
    - app.js
  /styles
    - base.css
    - layout.css
    - components.css
    - custom.css
  /assets
    - (imágenes, íconos, fuentes)
index.html

- Todos los módulos JS usan ES6 (import/export).
- El HTML principal está en index.html y el contenido dinámico se renderiza en #root.
- Las rutas de recursos están actualizadas para la nueva estructura.
- Usa esta guía para mantener la organización y escalabilidad del proyecto.