import { ref } from "vue";
import api, { extraerMsg } from "../services/api.js";
import productService from "../services/products.js";

// Same limit the Edge Function enforces (MAX_CARACTERES in ai-crud/index.ts)
export const MAX_INSTRUCCION = 500;

const useCrudIA = (service = productService) => {
  const propuesta = ref(null);
  const mensaje = ref("");
  const loading = ref(false);
  const error = ref(null);

  // Same pattern as useProductAdmin: uniform loading and error handling
  const execute = async (actionCallback) => {
    loading.value = true;
    error.value = null;
    mensaje.value = "";
    try {
      await actionCallback();
      return true;
    } catch (err) {
      error.value = extraerMsg(err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Step 1: the AI interprets the instruction and returns a proposal (nothing is written)
  const interpretar = (instruccion) => {
    const texto = instruccion?.trim();
    if (!texto || texto.length > MAX_INSTRUCCION) {
      error.value = `Escribí una instrucción de 1 a ${MAX_INSTRUCCION} caracteres`;
      return false;
    }
    propuesta.value = null;
    return execute(async () => {
      // The LLM is slower than a regular query: raise the timeout (api.js default is 5s)
      const { data } = await api.post("/functions/v1/ai-crud", { instruccion: texto }, { timeout: 30000 });
      propuesta.value = data.propuesta;
    });
  };

  // Step 2: the admin confirms and the traditional CRUD runs it (validate() + RLS)
  const confirmar = () =>
    execute(async () => {
      const { accion, id, actual, datos } = propuesta.value;
      if (accion === "crear") await service.createProduct(datos);
      // editProduct validates the whole product: merge current values with the changes
      // so fields the AI did not mention (e.g. imagen) are kept
      if (accion === "actualizar") await service.editProduct(id, { ...actual, ...datos });
      if (accion === "eliminar") await service.deleteProduct(id);
      mensaje.value = "Operación realizada";
      propuesta.value = null;
    });

  const descartar = () => {
    propuesta.value = null;
    error.value = null;
  };

  return { propuesta, mensaje, loading, error, interpretar, confirmar, descartar };
};

export default useCrudIA;
