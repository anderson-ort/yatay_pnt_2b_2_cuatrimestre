import axios from "axios";
import { ref } from "vue";

export default function useFetchAPI(url) {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);

    const fetchData = async () => {
        loading.value = true;

        try {
            const response = await axios.get(url);
            data.value = await response.data;
            console.log(data.value);
        } catch (err) {
            error.value = err;
        } finally {
            loading.value = false;
        }

    };

    fetchData();

    return {
        data,
        error,
        loading
    }
}

