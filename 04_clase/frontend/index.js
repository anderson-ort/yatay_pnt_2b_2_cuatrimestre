const contenedor = document.getElementById("contenedor");
const filtrosEl = document.getElementById("filtros");

let productos = [];
let categoriaActiva = "todos";

async function cargarProductos() {
try {
  const respuesta = await fetch(
    `${SUPABASE_URL}/rest/v1/productos?select=*&order=creado_en.desc`,
    {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
      }
    }
  );

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status}`);
  }

  productos = await respuesta.json();

  if (productos.length === 0) {
    contenedor.innerHTML = '<p class="estado">No hay productos cargados todavia.</p>';
    return;
  }

  renderizarFiltros();
  renderizarProductos();
} catch (error) {
  contenedor.innerHTML = `<p class="estado">No se pudo cargar el catalogo. Revisa la URL y la anon key configuradas. (${error.message})</p>`;
}
}

function renderizarFiltros() {
const categorias = ["todos", ...new Set(productos.map(p => p.categoria).filter(Boolean))];

filtrosEl.innerHTML = categorias.map(cat => `
  <button data-categoria="${cat}" class="${cat === categoriaActiva ? 'activo' : ''}">
    ${cat === "todos" ? "Todos" : cat}
  </button>
`).join("");

filtrosEl.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    categoriaActiva = btn.dataset.categoria;
    renderizarFiltros();
    renderizarProductos();
  });
});
}

function renderizarProductos() {
const lista = categoriaActiva === "todos"
  ? productos
  : productos.filter(p => p.categoria === categoriaActiva);

if (lista.length === 0) {
  contenedor.innerHTML = '<p class="estado">No hay productos en esta categoria.</p>';
  return;
}

contenedor.innerHTML = `<div class="grid">
  ${lista.map(renderizarTarjeta).join("")}
</div>`;
}

function renderizarTarjeta(producto) {
const precio = Number(producto.precio).toLocaleString("es-AR", {
  style: "currency",
  currency: "ARS"
});

const sinStock = !producto.stock || producto.stock <= 0;
const imagenUrl = producto.imagen || "https://placehold.co/400x400/F2EFE6/7C8F6E?text=Sin+imagen";

return `
  <article class="producto">
    <div class="imagen">
      <img src="${imagenUrl}" alt="${producto.nombre}" loading="lazy"
           onerror="this.src='https://placehold.co/400x400/F2EFE6/7C8F6E?text=Sin+imagen'">
    </div>
    <div class="info">
      <p class="categoria">${producto.categoria || "general"}</p>
      <h2>${producto.nombre}</h2>
      <p class="descripcion">${producto.descripcion || ""}</p>
      <div class="pie">
        <span class="precio">${precio}</span>
        <span class="stock ${sinStock ? 'agotado' : ''}">
          ${sinStock ? "Sin stock" : `${producto.stock} en stock`}
        </span>
      </div>
    </div>
  </article>
`;
}

cargarProductos();