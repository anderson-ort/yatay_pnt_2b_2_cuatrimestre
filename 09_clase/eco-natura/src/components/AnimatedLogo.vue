<script setup>
import { onMounted } from "vue";
import anime from "animejs";

onMounted(() => {
  // Timeline: encadena varias animaciones una tras otra (o superpuestas)
  const tl = anime.timeline({ easing: "easeOutQuad" });

  tl.add({
    // 1) Tallo: se "dibuja" de abajo hacia arriba
    targets: ".stem",
    // anime.setDashoffset calcula el largo del path y anima el
    // stroke-dashoffset desde ahí hasta 0, dando efecto de trazo progresivo
    strokeDashoffset: [anime.setDashoffset, 0],
    duration: 900,
  })
    .add(
      {
        // 2) Hojas: aparecen una por una (stagger) con rebote elástico
        targets: ".leaf",
        scale: [0, 1], // crecen desde 0 hasta tamaño normal
        opacity: [0, 1], // van de invisibles a visibles
        translateY: [10, 0], // suben ligeramente mientras aparecen
        duration: 600,
        delay: anime.stagger(150), // cada hoja arranca 150ms después que la anterior
        easing: "easeOutElastic(1, .6)", // rebote tipo "resorte" al final
      },
      "-=400",
    ) // arranca 400ms antes de que termine el paso anterior (se solapan)
    .add(
      {
        // 3) Texto del logo: entra deslizando desde la izquierda
        targets: ".logo-text",
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 500,
      },
      "-=200",
    ); // se solapa con el final de las hojas
});
</script>

<template>
  <div class="logo-wrapper">
    <svg width="60" height="60" viewBox="0 0 100 100">
      <!-- Tallo: se anima con stroke-dashoffset (necesita stroke-dasharray en CSS) -->
      <path
        class="stem"
        d="M50 90 C50 60 50 40 50 15"
        fill="none"
        stroke="#2E7D32"
        stroke-width="4"
        stroke-linecap="round"
      />

      <!-- Cada hoja tiene su propio transform-origin en el punto donde nace del tallo,
           para que el scale crezca desde ahí y no desde el centro del path -->
      <g class="leaf" transform-origin="42 55">
        <path
          d="M50 55 C30 45 25 25 42 15 C55 25 55 45 50 55 Z"
          fill="#4CAF50"
        />
      </g>
      <g class="leaf" transform-origin="58 40">
        <path
          d="M50 40 C70 32 78 15 62 8 C48 18 46 32 50 40 Z"
          fill="#66BB6A"
        />
      </g>
      <g class="leaf" transform-origin="45 70">
        <path
          d="M50 70 C28 65 20 48 38 40 C52 48 54 62 50 70 Z"
          fill="#43A047"
        />
      </g>
    </svg>
    <span class="logo-text">EcoNatura</span>
  </div>
</template>

<style scoped>
.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
/* stroke-dasharray debe ser >= al largo real del path para que el dashoffset funcione */
.stem {
  stroke-dasharray: 100;
}
/* fill-box hace que transform-origin se calcule sobre el bounding box del path, no del SVG entero */
.leaf {
  transform-box: fill-box;
}
</style>
