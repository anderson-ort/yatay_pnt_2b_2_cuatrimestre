import mockData from '../data/productos.mock.json';

export const fetchProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockData), 400); // simula latencia de red
  });
};

// Auth placeholder — sin backend real por ahora
export const signIn = (email, password) => Promise.resolve({ email });
export const signUp = (email, password) => Promise.resolve({ email });
