const contenedor = document.getElementById("contenedor")
const filtrosEl = document.getElementById("filtros")

/**
 * Productos que de alguna manera lo consigo STORE
 * API -> fetch 
*/

let productos = []
let categoriaActiva = "todos"


/**
 * Funcion que se encarge de renderizar 1 Product
 */

const renderizarTarjeta = producto => {
    const precio = Number(producto.precio).toLocaleString("es-AR", { style: "currency", currency: "ARS" })
    const defaultURLImage = 'https://placehold.co/400x400/F2EFF6/7C8F6E?text=No+Image'
    /**Calculado */
    const sinStock = !producto.stock || producto.stock <= 0
    const imagenUrl = producto.imagen || defaultURLImage


    return `<article class="producto">
<div class="imagen">
    <img 
        src="${imagenUrl}" 
        alt="${producto.nombre}"  
        loading="lazy"
        onerror="this.src='${defaultURLImage}'"    
    >
</div>
<div class="info">
    <p class="categoria"> ${producto.categoria || "general"} </p>
    <h2>${producto.nombre}</h2>
    <p class="descripcion"> ${producto.descripcion} || "Este producto se describe por si solo, papa!"</p>
    <div class="pie">
        <span class="precio"> ${precio} </span>
        <span class="stock  ${sinStock? 'agotado': ''}">  ${sinStock ? 'Sin stock': `${producto.stock} en stock`} </span>
    </div>
</div>
</article>`
}


/**
 * Function que se encargue de renderizar los productos por categoria
 */

const renderizarProductos = ()=>{
    const listaProductos =  
        categoriaActiva === 'todos' ? 
            productos 
        :   productos.filter( p => p.categoria === categoriaActiva)

    if (listaProductos.lenght === 0){
        contenedor.innerHTML = `<p class="estado">  No hay productos en esta categoria </p>` 
        return
    }

    contenedor.innerHTML = `
    <div class="grid">
        ${listaProductos.map(renderizarTarjeta).join("\n")} 
    </div>
    
    `


}


/**
 * Function que se encargue de renderizar los filtros | categorias | todos --> (default)
 */

const renderizarFiltros = () => {
    const categorias = ["todos", ...new Set(productos.map(p=>p.categoria).filter(Boolean))]

    console.log(categorias);
    

    filtrosEl.innerHTML = categorias.map(
        categoria => `
        <button data-categoria="${categoria}"  class="${categoria === categoriaActiva ? 'activo': ''}"> ${categoria === "todos"?"Todos":categoria} </button>
        `
    ).join("")

    filtrosEl.querySelectorAll("button").forEach(
        btn => {
            btn.addEventListener(
                "click",
                () => {
                    categoriaActiva = btn.dataset.categoria
                    renderizarFiltros()
                    renderizarProductos()
                }
            )
        }
    )

}


/**
 * Function que se encargue llamar a los productos
 */

const useFetchData = async () => {
    try{
        const response = await fetch(SUPABASE_URL, {
            headers:{
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        })

        if (!response.ok){
            throw new Error(`Error -> ${response.status}`)
        }


        productos = await response.json()

    }
    catch(error){
        contenedor.innerHTML = `<p class="estado">  No se pudo cargar el catalogo ${error.message}</p>` 
    }
}


/**
 * Function que se encargue de cargar todos los productos
 */



const cargarProductos  = async () => {
    try{

        await useFetchData()
        
        if(productos.lenght === 0){
            contenedor.innerHTML = `<p class="estado"> No hay productos en la base de datos</p>`
            return
        }
        
        renderizarFiltros()
        renderizarProductos()
    }
     catch(error){
        console.error(error.message);
        
     }   
}



cargarProductos()
