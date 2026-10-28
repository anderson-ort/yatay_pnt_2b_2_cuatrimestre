import { ref } from "vue";
import api, { extraerMsg } from "../services/api.js";
import config from "../config/index.js";
import productService from "../services/products.js";

const useCrudIA = (service = productService) => {
    const propuesta = ref(null)
    const mensaje = ref("")
    const loading = ref(false)
    const error = ref(null)

    const execute = async (actionCallback) => {
        loading.value = true
        error.value = null
        mensaje.value = ""

        try {
            await actionCallback()
            return true
        } catch (e) {
            error.value = extraerMsg(e)
        } finally {
            loading.value = false
        }

    }

    const interpretar = (instruccion) => {
        const texto = instruccion?.trim()
        if (!texto || texto.length > config.maxInstruccion) {
            error.value = `Reduci la cantidad de chars de 1 a ${config.maxInstruccion}`
            return false
        }
        propuesta.value = null
        return execute(async () => {
            const { data } = await api.post("/functions/v1/ai-crud", { instruccion: texto }, { timeout: 30000 })
            console.log(data);
            
            propuesta.value = data.propuesta
        })
    }
    const confirmar = () => {
        execute(async () => {
            const { accion, id, actual, datos } = propuesta.value

            if (accion === "crear") await service.createProduct(datos)
            if (accion === "actualizar") await service.editProduct(id, { ...actual, ...datos })
            if (accion === "eliminar") await service.deleteProduct(id)

            mensaje.value = "Operacion realizada con exito"
            propuesta.value = null
        })
    }
    const descartar = () => {
        propuesta.value = null
        error.value = null
    }

    return { propuesta, mensaje, loading, error, interpretar, confirmar, descartar }
}

export default useCrudIA