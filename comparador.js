const CLAVE_COMPARADOR = 'ndtech_comparador';
const MAX_COMPARAR = 4;

const NOMBRES_CATEGORIA = {
  celular: 'Celular',
  computadora: 'Computadora',
  monitor: 'Monitor',
  audifono: 'Audífonos',
  consola: 'Consola'
};

// Claves donde un valor MENOR es mejor (ej. tiempo de respuesta).
// Cualquier otra clave numérica se trata como "mayor es mejor".
const CLAVES_MENOR_MEJOR = ['tiempo de respuesta'];

function obtenerComparados() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_COMPARADOR)) || [];
  } catch {
    return [];
  }
}

function guardarComparados(lista) {
  localStorage.setItem(CLAVE_COMPARADOR, JSON.stringify(lista));
}

function formatoDinero(valor) {
  return 'US$ ' + Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function mostrarToast(mensaje, tipo) {
  const toast = document.getElementById('toast');
  if (!toast) {
    alert(mensaje);
    return;
  }
  toast.textContent = mensaje;
  toast.className = 'toast visible' + (tipo === 'info' ? ' info' : '');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('visible'), 3200);
}

function leerSpecs(tarjeta) {
  const specs = {};
  tarjeta.querySelectorAll('.specs-producto li').forEach(item => {
    const partes = item.textContent.split(':');
    const nombre = partes[0].trim();
    const valor = partes.slice(1).join(':').trim();
    if (nombre) specs[nombre] = valor;
  });
  return specs;
}

// Extrae el primer número que aparece en un texto de especificación.
// Ej: "240 Hz" -> 240 | "1 TB SSD" -> 1 | "8 GB" -> 8
function extraerNumero(texto) {
  if (!texto) return null;
  const match = String(texto).match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

// Devuelve un array de booleanos indicando, para cada producto de la lista,
// si su valor en "clave" es el mejor (o empata con el mejor).
function calcularMejores(clave, lista) {
  const valores = lista.map(p => extraerNumero((p.specs || {})[clave]));
  const numericos = valores.filter(v => v !== null);

  // Si hay menos de 2 valores numéricos comparables, no marcamos nada
  if (numericos.length < 2) return lista.map(() => false);

  const menorEsMejor = CLAVES_MENOR_MEJOR.some(c => clave.toLowerCase().includes(c));
  const mejorValor = menorEsMejor ? Math.min(...numericos) : Math.max(...numericos);

  // Si todos los valores numéricos son iguales, no hay "mejor" que destacar
  const todosIguales = numericos.every(v => v === numericos[0]);
  if (todosIguales) return lista.map(() => false);

  return valores.map(v => v !== null && v === mejorValor);
}

function iniciarComparadorEnProductos() {
  const tarjetas = document.querySelectorAll('.tarjeta[data-categoria]');
  const barra = document.getElementById('barra-comparar');
  const barraTexto = document.getElementById('barra-comparar-texto');
  const barraLimpiar = document.getElementById('barra-comparar-limpiar');

  function actualizarBarra() {
    const lista = obtenerComparados();
    if (lista.length > 0) {
      barraTexto.textContent = lista.length === 1 ? '1 producto seleccionado' : lista.length + ' productos seleccionados';
      barra.classList.add('visible');
    } else {
      barra.classList.remove('visible');
    }
  }

  function refrescarEstadoVisual() {
    const lista = obtenerComparados();
    tarjetas.forEach(tarjeta => {
      const boton = tarjeta.querySelector('.btn-comparar');
      const texto = boton.querySelector('.texto-btn-comparar');
      const yaEsta = lista.some(p => p.nombre === tarjeta.dataset.nombre);
      boton.classList.toggle('activo', yaEsta);
      tarjeta.classList.toggle('en-comparacion', yaEsta);
      texto.textContent = yaEsta ? 'En comparación' : 'Comparar';
    });
    actualizarBarra();
  }

  tarjetas.forEach(tarjeta => {
    const boton = tarjeta.querySelector('.btn-comparar');
    boton.addEventListener('click', () => {
      const nombre = tarjeta.dataset.nombre;
      const categoria = tarjeta.dataset.categoria;
      const precio = Number(tarjeta.dataset.precio);
      const imagen = tarjeta.dataset.imagen;
      let lista = obtenerComparados();

      if (lista.some(p => p.nombre === nombre)) {
        lista = lista.filter(p => p.nombre !== nombre);
        guardarComparados(lista);
        refrescarEstadoVisual();
        return;
      }

      if (lista.length > 0 && lista[0].categoria !== categoria) {
        mostrarToast('Solo puedes comparar productos de la misma categoría.');
        return;
      }

      if (lista.length >= MAX_COMPARAR) {
        mostrarToast('Solo puedes comparar hasta ' + MAX_COMPARAR + ' productos a la vez.');
        return;
      }

      lista.push({ nombre, categoria, precio, imagen, specs: leerSpecs(tarjeta) });
      guardarComparados(lista);
      refrescarEstadoVisual();
    });
  });

  if (barraLimpiar) {
    barraLimpiar.addEventListener('click', () => {
      guardarComparados([]);
      refrescarEstadoVisual();
    });
  }

  refrescarEstadoVisual();
}

function iniciarPaginaComparar() {
  const contenedorSlots = document.getElementById('comparador-slots');
  const contenedorTablaWrap = document.getElementById('comparador-tabla-wrapper');
  const contenedorVacio = document.getElementById('comparador-vacio');
  const btnLimpiarTodo = document.getElementById('btn-limpiar-todo');
  const acciones = document.getElementById('acciones-comparador');

  function renderizar() {
    const lista = obtenerComparados();

    if (lista.length === 0) {
      contenedorVacio.style.display = 'block';
      contenedorSlots.style.display = 'none';
      contenedorTablaWrap.style.display = 'none';
      acciones.style.display = 'none';
      return;
    }

    contenedorVacio.style.display = 'none';
    contenedorSlots.style.display = 'grid';
    contenedorTablaWrap.style.display = 'block';
    acciones.style.display = 'flex';

    contenedorSlots.innerHTML = '';
    for (let i = 0; i < MAX_COMPARAR; i++) {
      const producto = lista[i];
      const slot = document.createElement('div');

      if (producto) {
        slot.className = 'slot';
        slot.innerHTML =
          '<button class="slot-quitar" data-nombre="' + producto.nombre + '">&times;</button>' +
          '<img src="' + producto.imagen + '" alt="' + producto.nombre + '">' +
          '<h3>' + producto.nombre + '</h3>' +
          '<p class="slot-categoria">' + (NOMBRES_CATEGORIA[producto.categoria] || producto.categoria) + '</p>' +
          '<p class="slot-precio">' + formatoDinero(producto.precio) + '</p>' +
          '<a class="btn-ver-producto" href="inicio2.html">Ver producto</a>';
      } else {
        slot.className = 'slot slot-vacio';
        slot.innerHTML = '<p>Agrega un producto para comparar</p><a href="inicio2.html">Ver productos &#8250;</a>';
      }
      contenedorSlots.appendChild(slot);
    }

    contenedorSlots.querySelectorAll('.slot-quitar').forEach(boton => {
      boton.addEventListener('click', () => {
        const nuevaLista = obtenerComparados().filter(p => p.nombre !== boton.dataset.nombre);
        guardarComparados(nuevaLista);
        renderizar();
      });
    });

    const claves = [];
    lista.forEach(producto => {
      Object.keys(producto.specs || {}).forEach(clave => {
        if (!claves.includes(clave)) claves.push(clave);
      });
    });

    let filas = '';
    claves.forEach(clave => {
      filas += '<tr><th>' + clave + '</th>';
      const mejores = calcularMejores(clave, lista);
      lista.forEach((producto, indice) => {
        const valor = (producto.specs || {})[clave];
        if (!valor) {
          filas += '<td class="sin-dato">—</td>';
        } else if (mejores[indice]) {
          filas += '<td class="valor-mejor">' + valor + ' <span class="gancho-mejor" title="Mejor opción">&#10003;</span></td>';
        } else {
          filas += '<td>' + valor + '</td>';
        }
      });
      filas += '</tr>';
    });

    // Fila de precio: destaca el más económico con el mismo gancho verde
    const precios = lista.map(p => p.precio);
    const precioMinimo = Math.min(...precios);
    const hayDiferenciaPrecio = new Set(precios).size > 1;

    filas += '<tr class="fila-precio"><th>Precio</th>';
    lista.forEach(producto => {
      if (hayDiferenciaPrecio && producto.precio === precioMinimo) {
        filas += '<td class="valor-mejor">' + formatoDinero(producto.precio) + ' <span class="gancho-mejor" title="Mejor precio">&#10003;</span></td>';
      } else {
        filas += '<td>' + formatoDinero(producto.precio) + '</td>';
      }
    });
    filas += '</tr>';

    let encabezado = '<th>CARACTERÍSTICAS</th>';
    lista.forEach(producto => {
      encabezado += '<th class="col-producto">' + producto.nombre + '</th>';
    });

    contenedorTablaWrap.innerHTML = '<table class="tabla-comparar"><thead><tr>' + encabezado + '</tr></thead><tbody>' + filas + '</tbody></table>';
  }

  if (btnLimpiarTodo) {
    btnLimpiarTodo.addEventListener('click', () => {
      guardarComparados([]);
      renderizar();
    });
  }

  const btnCompartir = document.getElementById('btn-compartir-comparacion');
  if (btnCompartir) {
    btnCompartir.addEventListener('click', async () => {
      const lista = obtenerComparados();
      if (lista.length === 0) return;
      const resumen = 'Comparación NDTECH:\n' + lista.map(p => '- ' + p.nombre + ' (' + formatoDinero(p.precio) + ')').join('\n');
      try {
        await navigator.clipboard.writeText(resumen);
        mostrarToast('Comparación copiada al portapapeles.', 'info');
      } catch {
        mostrarToast('No se pudo copiar la comparación.');
      }
    });
  }

  const btnRecomendacion = document.getElementById('btn-recomendacion-inteligente');
  if (btnRecomendacion) {
    btnRecomendacion.addEventListener('click', () => {
      mostrarToast('El comparador inteligente estará disponible próximamente.', 'info');
    });
  }

  renderizar();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('grid-productos')) {
    iniciarComparadorEnProductos();
  }
  if (document.getElementById('comparador-slots')) {
    iniciarPaginaComparar();
  }
});