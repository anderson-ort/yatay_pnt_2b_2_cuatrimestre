import productService from '../services/products.js'
import { ref } from 'vue'

const useFetchProducts = () => {
    const data = ref([])
    const loading = ref(false)
    const error = ref(null)

    const retrieveProducts = async () => {
        loading.value = true

        try {
            data.value = await productService.fetchProducts()
        }
        catch (e) {
            error.value = e.message
        }
        finally {
            loading.value = false
        }
    }


    retrieveProducts()

    return {
        loading,
        error,
        data,
        retrieveProducts
    }
}

export default useFetchProducts