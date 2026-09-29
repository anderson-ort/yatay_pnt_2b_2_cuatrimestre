# Composable simple en Vue 3

Un composable es una función reutilizable que contiene lógica de Vue. Por ejemplo, podemos crear un contador que cualquier componente pueda utilizar.

## 1. Crear el composable

Crea el archivo:

```text
src/composables/useContador.js
```

Con este contenido:

```js
import { ref } from 'vue'

export function useContador() {
  const contador = ref(0)

  function incrementar() {
    contador.value++
  }

  function decrementar() {
    contador.value--
  }

  return {
    contador,
    incrementar,
    decrementar
  }
}
```

Aquí ocurre lo siguiente:

```js
const contador = ref(0)
```

Crea un dato reactivo.

```js
contador.value++
```

Aumenta su valor. Dentro de JavaScript usamos `.value` porque `contador` es un `ref`.

```js
return {
  contador,
  incrementar,
  decrementar
}
```

Expone el estado y las funciones para que un componente pueda utilizarlos.

## 2. Usar el composable

En un componente Vue:

```vue
<script setup>
import { useContador } from '@/composables/useContador'

const {
  contador,
  incrementar,
  decrementar
} = useContador()
</script>

<template>
  <main>
    <h1>Contador: {{ contador }}</h1>

    <button @click="incrementar">
      Aumentar
    </button>

    <button @click="decrementar">
      Disminuir
    </button>
  </main>
</template>
```

En el template no necesitas escribir `.value`:

```vue
{{ contador }}
```

Vue se encarga automáticamente de acceder al valor interno del `ref`.

## Sin composable

La lógica estaría directamente en el componente:

```vue
<script setup>
import { ref } from 'vue'

const contador = ref(0)

function incrementar() {
  contador.value++
}
</script>
```

## Con composable

El componente importa la lógica:

```vue
<script setup>
import { useContador } from '@/composables/useContador'

const { contador, incrementar } = useContador()
</script>
```

La ventaja es que puedes usar el mismo contador en varios componentes sin repetir su lógica. Vue define un composable como una función que utiliza la Composition API para encapsular y reutilizar lógica con estado. [vuejs](https://vuejs.org/guide/reusability/composables)
