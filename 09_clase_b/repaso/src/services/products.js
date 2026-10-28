import api from "./api.js";

const API_ENDPOINT = "/rest/v1/productos"


const normalize = (product) => ({
    nombre: String(product.nombre ?? "").trim(),
    descripcion: product.descripcion?.trim() || null,
    categoria: product.categoria?.trim() || null,
    imagen: product.imagen?.trim() || null,
    precio: Number(product.precio ?? 100)
})

const validate = (product) => {
    const errors = []
    if (!product.nombre) errors.push("Debe tener un nombre")
    if (!Number.isFinite(product.precio) || product.precio < 0) errors.push("El precio debe ser mayor a 0")
    return errors
}

const prepareProduct = (product) => {
    const normData = normalize(product)
    const errors = validate(normData)
    if (errors.length) throw new Error(errors.join(". "))
    return normData
}


const HEADER_ROWS = { Prefer: "return=representation" }


const productService = {

    async fetchProducts() {
        // api -> donde va a a tener su documentacion de como consume la data.
        const { data } = await api.get(
            API_ENDPOINT, 
            {params: { select: "id,nombre,descripcion,categoria,imagen,precio", order: "nombre.asc" }}
        )
        return data
    },
    async createProduct(product) {
        const { data } = await api.post(API_ENDPOINT, prepareProduct(product), { headers: HEADER_ROWS })
        return data[0]
    },
    async editProduct(productId, product) {
        const { data } = await api.patch(API_ENDPOINT, prepareProduct(product), {
            params: { id: `eq.${productId}` },
            headers: HEADER_ROWS
        })

        if (!data.length) throw new Error("No se ha actualizado el producto")
        return data[0]
    },
    async deleteProduct(productId) {
        const { data } = await api.delete(API_ENDPOINT, {
            params: { id: `eq.${productId}` },
            headers: HEADER_ROWS
        })
        if (!data.length) throw new Error("No se ha encontrado el producto para borrar")
    }
}



export default productService