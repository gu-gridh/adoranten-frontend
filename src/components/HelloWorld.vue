<script setup>
import { ref, onMounted } from 'vue'
import Flipbook from 'flipbook-vue'

const pages = ref([])

onMounted(() => {
  for (let i = 1; i <= 20; i++) {
    const imageName = i.toString().padStart(2, '0')
    const path = `/pdf-images/a8alta.pdf 15-10-51-478_Page_${imageName}.png`
    pages.value.push(path)
  }
})
</script>

<template>
  <div class="flipbook-container">
    <Flipbook :pages="pages" class="flipbook"/>
  </div>
</template>

<style scoped>
.flipbook-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.flipbook {
  width: 90vw; 
  height: 90vh;
  border: 1px solid #ccc;
}
</style>
