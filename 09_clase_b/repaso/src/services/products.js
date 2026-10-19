import api from "./api.js";

const API_ENDPOINT = "/rest/v1"

const fetchProducts = async () => await api.get(`${API_ENDPOINT}/productos`)

export default fetchProducts