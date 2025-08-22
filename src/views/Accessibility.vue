<script setup>
import backButton from '/src/assets/back-button.svg'
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack () {
  const { back } = router.options.history.state || {}
  back ? router.back() : router.push({ name: 'Home' })
}

</script>
<template>
    <div class="header-wrapper">
      <img :src="backButton" alt="Back" class="back-button" @click="goBack" />
      <p v-html="description"></p>
    </div>
    this is the accessibility
</template>
<style scoped>
.header-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>