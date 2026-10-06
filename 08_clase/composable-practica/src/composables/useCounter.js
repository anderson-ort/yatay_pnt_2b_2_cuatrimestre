import { ref } from "vue";

/**
 * hace una referencia al estado  interno de esta instancia
*/
export default function useCounter() {
  const counter = ref(10);

  const increment = () => {
    counter.value++;
  };

  const decrement = () => {
    counter.value--;
  };

  return {
    counter,
    increment,
    decrement
  };
}