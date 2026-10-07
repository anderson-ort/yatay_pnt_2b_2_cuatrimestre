import { ref } from 'vue';
import api from '../services/api.js';


/**returns object with products, loading, and error state */
const useFetchProducts = () => {
    const products = ref([]);
    const loading = ref(false);
    const error = ref(null); // mensaje de error


    const fetchProducts = async () => {
        loading.value = true;
        error.value = null;

        try {
            const response = await api.get('/rest/v1/productos?select=*&order=creado_en.desc');
            products.value = response.data;

        } catch (err) {w

            error.value = err.message;
            console.error('Error fetching products:', err);
        } finally {
            loading.value = false;
        }
    }

    fetchProducts(); // Llamada inicial para cargar los productos al montar el componente

    return {
        products,
        loading,
        error
    }


}


export default useFetchProducts;