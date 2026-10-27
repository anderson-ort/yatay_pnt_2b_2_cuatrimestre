import productService from "../services/products.js";
import { extraerMsg } from "../services/api.js";

import { ref } from "vue";

const useProductAdmin = (service = productService) => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const execute = async (actionCallback) => {
    loading.value = true;
    error.value = null;
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

  const loadProducts = () =>
    execute(async () => {
      products.value = await service.fetchProducts();
    });

  const createProduct = async (product) => {
    const ok = await execute(() => service.createProduct(product));
    if (ok) await loadProducts();
    return ok;
  };

  const editProduct = async (productId, product) => {
    const ok = await execute(() => service.editProduct(productId, product));
    if (ok) await loadProducts();
    return ok;
  };

  const deleteProduct = async (productId) => {
    const ok = await execute(() => service.deleteProduct(productId));
    if (ok) await loadProducts();
    return ok;
  };

  return {
    products,
    loading,
    error,
    loadProducts,
    createProduct,
    editProduct,
    deleteProduct,
  };
};

export default useProductAdmin;
