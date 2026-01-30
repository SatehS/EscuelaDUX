$(document).ready(function() {
  // Mostrar modal de inscripción
  $('#inscripcionBtn').click(function() {
    $('#inscripcionModal').modal('show');
  });

  // Mostrar modal de login/registro
  $('#loginBtn, #registerBtn').click(function(e) {
    e.preventDefault();
    $('#loginModal').modal('show');
    if ($(this).attr('id') === 'registerBtn') {
      $('#formLogin').addClass('d-none');
      $('#formRegister').removeClass('d-none');
    } else {
      $('#formLogin').removeClass('d-none');
      $('#formRegister').addClass('d-none');
    }
  });

  // Alternar entre login y registro dentro del modal
  $('#showRegister').click(function(e) {
    e.preventDefault();
    $('#formLogin').addClass('d-none');
    $('#formRegister').removeClass('d-none');
  });
  $('#showLogin').click(function(e) {
    e.preventDefault();
    $('#formRegister').addClass('d-none');
    $('#formLogin').removeClass('d-none');
  });

  // Simulación de login/registro
  $('#adminBtn').click(function() {
    loginComo('admin');
  });

  // Cerrar sesión
  $('#logoutBtn').click(function() {
    logout();
  });

  // Enviar inscripción a curso (simulado, mostrar previsualización)
  $('#formInscripcion').submit(function(e) {
    e.preventDefault();
    // Obtener datos del formulario
    const cursoVal = $('#curso').val();
    const cursoData = cursos[cursoVal] || {};
    const nombre = $('#nombre').val();
    const email = $('#email').val();
    const pago = $('#pago').val();
    // Datos extra simulados
    const apellido = '';
    const documento = '';
    const pais = '';
    const whatsapp = '';
    const fechaInscripcion = new Date().toLocaleDateString();
    const fechaPago = '';
    const valorCOP = '';
    const valorUSD = '';
    const abono = '';
    const saldo = '';
    // Renderizar previsualización
    $('#planillaPreview').html(`
      <div class="container-fluid">
        <div class="row align-items-center mb-3">
          <div class="col-2 text-center">
            <img src='logo-escuela-dux.png' alt='Logo' style='max-width:90px;'>
          </div>
          <div class="col-10">
            <h4 class="fw-bold mb-0">GRUPO DUX S.A.S</h4>
            <small>Inscripción de alumnos</small><br>
            <small>educacionduxoficial@gmail.com</small>
          </div>
        </div>
        <hr class="border-danger border-2 opacity-50 mb-3">
        <div class="row mb-2">
          <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">Datos del estudiante</div>
        </div>
        <div class="row mb-2">
          <div class="col-md-3 mb-2"><strong>Nombre:</strong> ${nombre}</div>
          <div class="col-md-3 mb-2"><strong>Apellido:</strong> ${apellido}</div>
          <div class="col-md-3 mb-2"><strong>N° Documento:</strong> ${documento}</div>
          <div class="col-md-3 mb-2"><strong>Tel:</strong> </div>
        </div>
        <div class="row mb-2">
          <div class="col-md-3 mb-2"><strong>País:</strong> ${pais}</div>
          <div class="col-md-3 mb-2"><strong>Mail:</strong> ${email}</div>
          <div class="col-md-3 mb-2"><strong>WhatsApp:</strong> ${whatsapp}</div>
        </div>
        <div class="row mb-2 mt-3">
          <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">Datos del Taller</div>
        </div>
        <div class="row mb-2">
          <div class="col-md-4 mb-2"><strong>Curso:</strong> ${$('#curso option:selected').text()}</div>
          <div class="col-md-2 mb-2"><strong>Turno:</strong> ${cursoData.turno || ''}</div>
          <div class="col-md-2 mb-2"><strong>Días:</strong> ${cursoData.dias || ''}</div>
          <div class="col-md-4 mb-2"><strong>Horario:</strong> ${cursoData.horario || ''}</div>
        </div>
        <div class="row mb-2">
          <div class="col-md-3 mb-2"><strong>Total de clases:</strong> ${cursoData.totalClases || ''}</div>
          <div class="col-md-3 mb-2"><strong>Horas totales:</strong> ${cursoData.horas || ''}</div>
          <div class="col-md-6 mb-2"><strong>Profesor:</strong> ${cursoData.profesor || ''}</div>
        </div>
        <div class="row mb-2 mt-3">
          <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">Pagos</div>
        </div>
        <div class="row mb-2">
          <div class="col-md-3 mb-2"><strong>Fecha de inscripción:</strong> ${fechaInscripcion}</div>
          <div class="col-md-3 mb-2"><strong>Fecha de pago:</strong> ${fechaPago}</div>
          <div class="col-md-3 mb-2"><strong>Valor del taller COP:</strong> ${valorCOP}</div>
          <div class="col-md-3 mb-2"><strong>Valor del taller USD:</strong> ${valorUSD}</div>
        </div>
        <div class="row mb-2">
          <div class="col-md-3 mb-2"><strong>Abono a cuenta:</strong> ${abono}</div>
          <div class="col-md-3 mb-2"><strong>Saldo pendiente:</strong> ${saldo}</div>
        </div>
        <div class="row mb-2 mt-3">
          <div class="col-12 bg-danger text-white fw-bold py-1 ps-2 rounded">Datos legales</div>
        </div>
        <div class="row mb-2">
          <div class="col-12 small text-secondary">
            <p>En calidad de estudiante, me comprometo al pago solicitado por GRUPO DUX, por el servicio de cursos en educación informal, en los plazos y fechas a partir de la fecha. Recordatorio de pago: DUXPEDAGOGIA, Bancolombia, Número de cuenta 30200040441 a nombre de Grupo Dux S.A.S, NIT 901157018.</p>
            <p>Para certificados oficiales, deberá hacer el pago de inscripción antes o el día 0. Consultar sobre medios disponibles. Notificar de su pago al mail escueladuxoficial@gmail.com o al WhatsApp corporativo.</p>
          </div>
        </div>
        <div class="row mt-4">
          <div class="col-6 text-center">
            <span class="fw-bold">Grupo Dux S.A.S</span><br><br>
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Firma.png" alt="Firma" style="max-width:90px;opacity:0.5;">
          </div>
          <div class="col-6 text-center">
            <span class="fw-bold">Alumno(a)</span>
          </div>
        </div>
      </div>
    `);
    $('#inscripcionModal').modal('hide');
    setTimeout(function() {
      $('#planillaModal').modal('show');
    }, 400);
  });

  // Mostrar panel de alumno moderno
  function mostrarPanelAlumno() {
    $('#alumnoPanel').removeClass('d-none');
    $('#alumnoSection').addClass('d-none');
    $('#profesorSection, #adminSection').addClass('d-none');
    $('.home-split').addClass('d-none');
    $('#navUserHome').removeClass('d-none');
    $('#userTypeHome').text('Usuario: Alumno');
    $('html, body').animate({ scrollTop: $("#alumnoPanel").offset().top }, 500);
  }

  // Mostrar panel de profesor moderno
  function mostrarPanelProfesor() {
    $('#profesorPanel').removeClass('d-none');
    $('#profesorSection').addClass('d-none');
    $('#alumnoPanel, #alumnoSection, #adminSection').addClass('d-none');
    $('.home-split').addClass('d-none');
    $('#navUserHome').removeClass('d-none');
    $('#userTypeHome').text('Usuario: Profesor');
    $('html, body').animate({ scrollTop: $("#profesorPanel").offset().top }, 500);
  }

  // Login simulado desde el home (solo usuarios de prueba)
  $('#formLoginHome').submit(function(e) {
    e.preventDefault();
    const email = $('#loginEmailHome').val().trim();
    const pass = $('#loginPasswordHome').val().trim();
    let tipo = null;
    if (email === 'alumno@dux.com' && pass === '1234') {
      tipo = 'alumno';
    } else if (email === 'profesor@dux.com' && pass === '1234') {
      tipo = 'profesor';
    }
    if (!tipo) {
      if ($('#loginErrorMsg').length === 0) {
        $('#formLoginHome').prepend('<div id="loginErrorMsg" class="alert alert-danger py-2 small">Usuario o contraseña incorrectos.</div>');
      }
      return;
    } else {
      $('#loginErrorMsg').remove();
    }
    if (tipo === 'alumno') {
      mostrarPanelAlumno();
    } else if (tipo === 'profesor') {
      mostrarPanelProfesor();
    }
  });

  // Registro simulado desde el home (ahora con tipo de usuario)
  $('#formRegisterHome').submit(function(e) {
    e.preventDefault();
    const email = $('#registerEmailHome').val().trim();
    const pass = $('#registerPasswordHome').val().trim();
    const tipo = $('#registerTipoHome').val();
    if (!tipo) {
      if ($('#registerErrorMsg').length === 0) {
        $('#formRegisterHome').prepend('<div id="registerErrorMsg" class="alert alert-danger py-2 small">Selecciona el tipo de usuario.</div>');
      }
      return;
    }
    // Emails ya registrados (simulados)
    if (email === 'alumno@dux.com' || email === 'profesor@dux.com') {
      if ($('#registerErrorMsg').length === 0) {
        $('#formRegisterHome').prepend('<div id="registerErrorMsg" class="alert alert-danger py-2 small">Este correo ya está registrado.</div>');
      }
      return;
    } else {
      $('#registerErrorMsg').remove();
    }
    if (tipo === 'alumno') {
      mostrarPanelAlumno();
    } else {
      mostrarPanelProfesor();
    }
  });

  // Navegación en el sidebar del panel de alumno
  $(document).on('click', '.student-sidebar .nav-link', function(e) {
    e.preventDefault();
    $('.student-sidebar .nav-link').removeClass('active');
    $(this).addClass('active');
    const section = $(this).data('section');
    let html = '';
    switch(section) {
      case 'clases':
        html = `<div><h4 class='text-danger mb-4'>Clases grabadas</h4>
          <div class='clases-lista'>
            <div class='clase-card'>
              <iframe src='https://www.youtube.com/embed/ysz5S6PUM-U' allowfullscreen></iframe>
              <div class='clase-title'>Clase 1: Introducción</div>
            </div>
            <div class='clase-card'>
              <iframe src='https://www.youtube.com/embed/jfKfPfyJRdk' allowfullscreen></iframe>
              <div class='clase-title'>Clase 2: Técnicas de Escritura</div>
            </div>
            <div class='clase-card'>
              <iframe src='https://www.youtube.com/embed/2Vv-BfVoq4g' allowfullscreen></iframe>
              <div class='clase-title'>Clase 3: Narración Creativa</div>
            </div>
          </div>
        </div>`;
        break;
      case 'tareas':
        html = `<div><h4 class='text-danger mb-4'>Subir Tareas</h4>
          <form class='tarea-upload-area' id='formTareaUpload'>
            <div class='mb-3'>
              <label for='tareaArchivo'>Selecciona tu archivo:</label>
              <input type='file' class='form-control' id='tareaArchivo' required>
            </div>
            <button type='submit' class='btn btn-danger w-100'>Subir tarea</button>
            <div class='tarea-file-name' id='tareaFileName'></div>
          </form>
        </div>`;
        break;
      case 'material':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Material escrito</h4><p>Aquí encontrarás material escrito del curso.</p></div>`;
        break;
      case 'plantillas':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Plantillas</h4><p>Descarga y usa las plantillas proporcionadas.</p></div>`;
        break;
      case 'horario':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Horario de clases en vivo</h4><p>Consulta el horario de tus clases en vivo.</p></div>`;
        break;
      case 'link':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Link de clases en vivo</h4><p>Accede al enlace para tus clases en vivo.</p></div>`;
        break;
      case 'notas':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Notas</h4><p>Consulta tus notas de aprobados o reprobados.</p></div>`;
        break;
      case 'certificado':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Certificado</h4><p>Descarga tu certificado al finalizar el curso.</p></div>`;
        break;
      case 'preguntas':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Preguntas al profesor</h4><p>Envía tus preguntas al profesor desde aquí.</p></div>`;
        break;
      default:
        html = `<div class='card shadow-sm p-4'><h3 class='text-danger'>¡Bienvenido al Panel del Alumno!</h3><p>Selecciona una sección del menú para comenzar.</p></div>`;
    }
    $('#studentContent').html(html);
  });

  // Mostrar nombre del archivo subido en tareas
  $(document).on('change', '#tareaArchivo', function() {
    const file = this.files[0];
    if (file) {
      $('#tareaFileName').text('Archivo seleccionado: ' + file.name);
    } else {
      $('#tareaFileName').text('');
    }
  });
  // Simular subida de tarea
  $(document).on('submit', '#formTareaUpload', function(e) {
    e.preventDefault();
    const file = $('#tareaArchivo')[0].files[0];
    if (file) {
      $('#tareaFileName').html('<span class="text-success">¡Tarea subida correctamente!</span><br>Archivo: ' + file.name);
    }
  });

  // Cerrar sesión desde el panel de alumno
  $(document).on('click', '#logoutBtnAlumno', function(e) {
    e.preventDefault();
    $('#alumnoPanel').addClass('d-none');
    $('.home-split').removeClass('d-none');
    $('#navUserHome').addClass('d-none');
    $('#userTypeHome').text('');
  });

  function loginComo(tipo) {
    mostrarPanel(tipo);
    $('#navAuth').addClass('d-none');
    $('#navUser').removeClass('d-none');
    let tipoTexto = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    $('#userType').text('Usuario: ' + tipoTexto);
  }

  function logout() {
    $('#alumnoSection, #profesorSection, #adminSection').addClass('d-none');
    $('#navAuth').removeClass('d-none');
    $('#navUser').addClass('d-none');
    $('#userType').text('');
  }

  function mostrarPanel(tipo) {
    $('#alumnoSection, #profesorSection, #adminSection').addClass('d-none');
    if (tipo === 'alumno') {
      $('#alumnoSection').removeClass('d-none');
    } else if (tipo === 'profesor') {
      $('#profesorSection').removeClass('d-none');
    } else if (tipo === 'admin') {
      $('#adminSection').removeClass('d-none');
    }
    // Scroll al panel
    $('html, body').animate({
      scrollTop: $("main").offset().top
    }, 500);
  }

  // Datos de los cursos
  const cursos = {
    escritura_creativa: {
      turno: 'Noche',
      dias: 'Lunes y miércoles',
      horario: '6:00 pm a 8:00 pm',
      totalClases: '8',
      horas: '16',
      profesor: 'Carolina Eguiguren'
    },
    edicion_estilo: {
      turno: 'Noche',
      dias: 'Martes y Jueves',
      horario: '6:00 pm a 8:00 pm',
      totalClases: '8',
      horas: '16',
      profesor: 'Carolina Eguiguren'
    },
    redaccion: {
      turno: 'Noche',
      dias: 'Martes y Jueves',
      horario: '6:00 pm a 8:00 pm',
      totalClases: '8',
      horas: '16',
      profesor: 'Hexy Marquez'
    },
    narracion: {
      turno: 'Noche',
      dias: 'Martes y Jueves',
      horario: '6:00 pm a 8:00 pm',
      totalClases: '8',
      horas: '16',
      profesor: 'Hexy Marquez'
    },
    diccion_voz: {
      turno: 'Noche',
      dias: 'Martes y Jueves',
      horario: '8:00 pm a 10:00 pm',
      totalClases: '8',
      horas: '16',
      profesor: 'José Alí Cabrera'
    },
    lector_editorial: {
      turno: 'Mañana',
      dias: 'Sábados',
      horario: '9:00 am a 11:00 am',
      totalClases: '8',
      horas: '16',
      profesor: 'Carolina Eguiguren'
    },
    escritura_creativa_presencial: {
      turno: 'Mañana',
      dias: 'Sábados',
      horario: '8:00 am a 12:00 m',
      totalClases: '4',
      horas: '16',
      profesor: 'Carolina Eguiguren'
    }
  };

  // Mostrar detalles del curso seleccionado
  $('#curso').change(function() {
    const val = $(this).val();
    if (val && cursos[val]) {
      $('#detalleTurno').text(cursos[val].turno);
      $('#detalleDias').text(cursos[val].dias);
      $('#detalleHorario').text(cursos[val].horario);
      $('#detalleTotalClases').text(cursos[val].totalClases);
      $('#detalleHoras').text(cursos[val].horas);
      $('#detalleProfesor').text(cursos[val].profesor);
      $('#detallesCurso').removeClass('d-none');
    } else {
      $('#detallesCurso').addClass('d-none');
    }
  });

  // Descargar planilla como PDF (simulado)
  $(document).on('click', '#descargarPDF', function() {
    alert('Simulación: Aquí se descargaría la planilla en PDF.');
  });

  // Botón 'Inscribirse a un curso' funcional en la columna de login
  $(document).on('click', '#inscripcionBtn', function(e) {
    $('#inscripcionModal').modal('show');
  });

  // Botón 'Iniciar Sesión' funcional en la columna de login
  $(document).on('click', '#showLoginTab', function(e) {
    e.preventDefault();
    $('#pills-login-tab').tab('show');
  });

  // Navegación en el sidebar del panel de profesor
  $(document).on('click', '.prof-sidebar .nav-link', function(e) {
    e.preventDefault();
    $('.prof-sidebar .nav-link').removeClass('active');
    $(this).addClass('active');
    const section = $(this).data('section');
    let html = '';
    switch(section) {
      case 'clases':
        html = `<div><h4 class='text-danger mb-4'>Subir clases escritas</h4>
          <form class='tarea-upload-area' id='formClaseUpload'>
            <div class='mb-3'>
              <label for='claseArchivo'>Selecciona el archivo de la clase:</label>
              <input type='file' class='form-control' id='claseArchivo' required>
            </div>
            <button type='submit' class='btn btn-danger w-100'>Subir clase</button>
            <div class='tarea-file-name' id='claseFileName'></div>
          </form>
        </div>`;
        break;
      case 'tareas':
        html = `<div><h4 class='text-danger mb-4'>Preparar tarea</h4>
          <form class='tarea-upload-area' id='formPrepararTarea'>
            <div class='mb-3'>
              <label for='tareaTitulo'>Título de la tarea:</label>
              <input type='text' class='form-control' id='tareaTitulo' required>
            </div>
            <div class='mb-3'>
              <label for='tareaDescripcion'>Descripción:</label>
              <textarea class='form-control' id='tareaDescripcion' rows='3' required></textarea>
            </div>
            <button type='submit' class='btn btn-danger w-100'>Crear tarea</button>
            <div class='tarea-file-name' id='tareaCreadaMsg'></div>
          </form>
        </div>`;
        break;
      case 'alumnos':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Lista de alumnos</h4><p>Aquí verás la lista de alumnos inscritos.</p></div>`;
        break;
      case 'dudas':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Responder dudas</h4><p>Responde las dudas o evaluaciones de los alumnos aquí.</p></div>`;
        break;
      case 'evaluar':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Evaluar alumnos</h4><p>Evalúa y califica a los alumnos.</p></div>`;
        break;
      case 'aprobar':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Aprobar/rechazar curso</h4><p>Aprueba o rechaza el curso de los alumnos.</p></div>`;
        break;
      case 'en_vivo':
        html = `<div class='card shadow-sm p-4'><h4 class='text-danger'>Iniciar clases en vivo</h4><p>Inicia una clase en vivo desde aquí.</p></div>`;
        break;
      default:
        html = `<div class='card shadow-sm p-4'><h3 class='text-danger'>¡Bienvenido al Panel del Profesor!</h3><p>Selecciona una sección del menú para comenzar.</p></div>`;
    }
    $('#profContent').html(html);
  });

  // Subir clase escrita (simulado)
  $(document).on('change', '#claseArchivo', function() {
    const file = this.files[0];
    if (file) {
      $('#claseFileName').text('Archivo seleccionado: ' + file.name);
    } else {
      $('#claseFileName').text('');
    }
  });
  $(document).on('submit', '#formClaseUpload', function(e) {
    e.preventDefault();
    const file = $('#claseArchivo')[0].files[0];
    if (file) {
      $('#claseFileName').html('<span class="text-success">¡Clase subida correctamente!</span><br>Archivo: ' + file.name);
    }
  });

  // Preparar tarea (simulado)
  $(document).on('submit', '#formPrepararTarea', function(e) {
    e.preventDefault();
    const titulo = $('#tareaTitulo').val();
    $('#tareaCreadaMsg').html('<span class="text-success">¡Tarea creada correctamente!</span><br>Título: ' + titulo);
  });

  // Cerrar sesión desde el panel de profesor
  $(document).on('click', '#logoutBtnProfesor', function(e) {
    e.preventDefault();
    $('#profesorPanel').addClass('d-none');
    $('.home-split').removeClass('d-none');
    $('#navUserHome').addClass('d-none');
    $('#userTypeHome').text('');
  });
}); 