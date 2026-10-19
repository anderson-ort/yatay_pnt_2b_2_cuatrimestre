import fetchProducts from '../services/products.js'
import {ref} from 'vue'

const useFetchProducts = () =>{
    const data  = ref([])
    const loading = ref(false)
    const error = ref(null)

    const retrieveProducts = async () => {
        loading.value = true
        
        try{
            const response = await fetchProducts()
            data.value = await response.data
        }
        catch(e){
            error.value = e.message
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