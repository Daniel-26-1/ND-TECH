const formRecuperar = document.getElementById('form-recuperar');
const inputCorreoRecuperar = document.getElementById('correo-recuperar');
const errorCorreoRecuperar = document.getElementById('error-correo-recuperar');
const toastExito = document.getElementById('toast-exito');
const textoToast = document.getElementById('texto-toast');

const REGEX_SOLO_GMAIL = /^[^\s@]+@gmail\.com$/i;

function marcarError(input, mensajeEl, mensaje) {
  input.classList.add('campo-invalido');
  mensajeEl.textContent = mensaje;
}

function limpiarError(input, mensajeEl) {
  input.classList.remove('campo-invalido');
  mensajeEl.textContent = '';
}

function mostrarToast(mensaje) {
  textoToast.textContent = mensaje;
  toastExito.classList.add('visible');
  clearTimeout(toastExito._timeout);
  toastExito._timeout = setTimeout(() => {
    toastExito.classList.remove('visible');
  }, 4000);
}

formRecuperar.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const correo = inputCorreoRecuperar.value.trim();

  if (correo === '') {
    marcarError(inputCorreoRecuperar, errorCorreoRecuperar, 'El correo es obligatorio');
    return;
  }

  if (!REGEX_SOLO_GMAIL.test(correo)) {
    marcarError(inputCorreoRecuperar, errorCorreoRecuperar, 'El correo debe ser de tipo usuario@gmail.com');
    return;
  }

  limpiarError(inputCorreoRecuperar, errorCorreoRecuperar);

  mostrarToast('Enlace de recuperación enviado a ' + correo);
  formRecuperar.reset();
});

inputCorreoRecuperar.addEventListener('input', () => {
  limpiarError(inputCorreoRecuperar, errorCorreoRecuperar);
});