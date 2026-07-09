const inputBuscar = document.getElementById('input-buscar');
const grid = document.getElementById('grid-productos');
const tarjetas = document.querySelectorAll('.tarjeta');
const mensajeSinResultados = document.getElementById('sin-resultados');

if (inputBuscar) {
  inputBuscar.addEventListener('input', () => {
    const texto = inputBuscar.value.trim().toLowerCase();
    let visibles = 0;

    tarjetas.forEach(tarjeta => {
      const nombre = tarjeta.dataset.nombre.toLowerCase();
      const coincide = nombre.includes(texto);
      tarjeta.style.display = coincide ? 'flex' : 'none';
      if (coincide) visibles++;
    });

    if (mensajeSinResultados) mensajeSinResultados.style.display = visibles === 0 ? 'block' : 'none';
  });

  inputBuscar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });
}

let carrito = JSON.parse(localStorage.getItem('ndtech_carrito')) || [];

const carritoCantidadEl = document.getElementById('carrito-cantidad');
const carritoListaEl = document.getElementById('carrito-lista');
const carritoTotalEl = document.getElementById('carrito-total-monto');
const carritoPanel = document.getElementById('carrito-panel');
const btnCarritoIcono = document.getElementById('btn-carrito-icono');

function guardarCarrito() {
  localStorage.setItem('ndtech_carrito', JSON.stringify(carrito));
}

function formatoDinero(valor) {
  return 'US$ ' + valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderizarCarrito() {
  const totalArticulos = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  carritoCantidadEl.textContent = totalArticulos;

  carritoListaEl.innerHTML = '';

  if (carrito.length === 0) {
    carritoListaEl.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
  } else {
    carrito.forEach((item, indice) => {
      const fila = document.createElement('div');
      fila.className = 'carrito-item';
      fila.innerHTML = `
        <div class="carrito-item-info">
          <p class="carrito-item-nombre">${item.nombre}</p>
          <p class="carrito-item-precio">${formatoDinero(item.precio)} x ${item.cantidad}</p>
        </div>
        <button class="carrito-item-quitar" data-indice="${indice}">&times;</button>
      `;
      carritoListaEl.appendChild(fila);
    });
  }

  const totalDinero = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  carritoTotalEl.textContent = formatoDinero(totalDinero);

  document.querySelectorAll('.carrito-item-quitar').forEach(boton => {
    boton.addEventListener('click', (e) => {
      const indice = Number(e.currentTarget.dataset.indice);
      carrito.splice(indice, 1);
      guardarCarrito();
      renderizarCarrito();
    });
  });
}

document.querySelectorAll('[data-accion="agregar"]').forEach(boton => {
  boton.addEventListener('click', () => {
    const tarjeta = boton.closest('[data-nombre]');
    const nombre = tarjeta.dataset.nombre;
    const precio = Number(tarjeta.dataset.precio);
    const imagen = tarjeta.dataset.imagen;

    const existente = carrito.find(item => item.nombre === nombre);
    if (existente) {
      existente.cantidad++;
    } else {
      carrito.push({ nombre, precio, cantidad: 1, imagen });
    }

    guardarCarrito();
    renderizarCarrito();

    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '¡Agregado!';
    boton.disabled = true;
    setTimeout(() => {
      boton.innerHTML = textoOriginal;
      boton.disabled = false;
    }, 900);

    carritoPanel.classList.add('abierto');
  });
});

btnCarritoIcono.addEventListener('click', () => {
  carritoPanel.classList.toggle('abierto');
});

document.addEventListener('click', (e) => {
  const clicDentroDelCarrito = e.target.closest('.carrito-wrapper');
  if (!clicDentroDelCarrito) {
    carritoPanel.classList.remove('abierto');
  }
});

renderizarCarrito();