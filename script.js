const contenedor = document.getElementById('contenedor');
const btnRegistro = document.getElementById('btn-registro');
const btnLogin = document.getElementById('btn-login');

const camposRegistro = document.querySelectorAll('.panel-registro input');
const camposLogin = document.querySelectorAll('.panel-login input');

function activarCampos(campos, activar) {
  campos.forEach(campo => {
    if (activar) {
      campo.setAttribute('required', 'required');
    } else {
      campo.removeAttribute('required');
    }
  });
}

btnRegistro.addEventListener('click', () => {
  contenedor.classList.add('activo');
  activarCampos(camposRegistro, true);
  activarCampos(camposLogin, false);
});

btnLogin.addEventListener('click', () => {
  contenedor.classList.remove('activo');
  activarCampos(camposLogin, true);
  activarCampos(camposRegistro, false);
});

// ---------- VALIDACIÓN DEL REGISTRO (usuario, correo @gmail.com y contraseña obligatorios) ----------
const formRegistro = document.getElementById('form-registro');

const inputUsuarioRegistro = document.getElementById('usuario-registro');
const inputCorreoRegistro = document.getElementById('correo-registro');
const inputClaveRegistro = document.getElementById('clave-registro');

const errorUsuarioRegistro = document.getElementById('error-usuario-registro');
const errorCorreo = document.getElementById('error-correo');
const errorClaveRegistro = document.getElementById('error-clave-registro');

const REGEX_SOLO_GMAIL = /^[^\s@]+@gmail\.com$/i;

function marcarError(input, mensajeEl, mensaje) {
  input.classList.add('campo-invalido');
  mensajeEl.textContent = mensaje;
}

function limpiarError(input, mensajeEl) {
  input.classList.remove('campo-invalido');
  mensajeEl.textContent = '';
}

formRegistro.addEventListener('submit', (evento) => {
  const usuario = inputUsuarioRegistro.value.trim();
  const correo = inputCorreoRegistro.value.trim();
  const clave = inputClaveRegistro.value;

  let formularioValido = true;

  if (usuario === '') {
    marcarError(inputUsuarioRegistro, errorUsuarioRegistro, 'El usuario es obligatorio');
    formularioValido = false;
  } else {
    limpiarError(inputUsuarioRegistro, errorUsuarioRegistro);
  }

  if (correo === '') {
    marcarError(inputCorreoRegistro, errorCorreo, 'El correo es obligatorio');
    formularioValido = false;
  } else if (!REGEX_SOLO_GMAIL.test(correo)) {
    marcarError(inputCorreoRegistro, errorCorreo, 'El correo debe ser de tipo usuario@gmail.com');
    formularioValido = false;
  } else {
    limpiarError(inputCorreoRegistro, errorCorreo);
  }

  if (clave === '') {
    marcarError(inputClaveRegistro, errorClaveRegistro, 'La contraseña es obligatoria');
    formularioValido = false;
  } else {
    limpiarError(inputClaveRegistro, errorClaveRegistro);
  }

  if (!formularioValido) {
    evento.preventDefault();
  }
});

// Quita el mensaje de error de cada campo apenas el usuario empieza a corregirlo
inputUsuarioRegistro.addEventListener('input', () => limpiarError(inputUsuarioRegistro, errorUsuarioRegistro));
inputCorreoRegistro.addEventListener('input', () => limpiarError(inputCorreoRegistro, errorCorreo));
inputClaveRegistro.addEventListener('input', () => limpiarError(inputClaveRegistro, errorClaveRegistro));