<script setup>
import { defineProps, defineEmits } from 'vue'
import X from '/src/assets/close.png'

defineProps({
  show: Boolean,
  issues: Array
})
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="overlay">
    <div class="overlay-content">
      <button class="close-btn" @click="emit('close')">
        <img :src="X" alt="Close" class="close-icon" />
      </button>
      <h2>Issues</h2>
      <div class="issues-list">
        <div v-for="issue in issues" :key="issue.id">
          <router-link :to="{ name: 'Issue', params: { id: issue.id } }">
            Issue {{ issue.issue_year }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--theme-2);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* above everything */
}

.overlay-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 40%;
  min-height: 50vh;
  text-align: center;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--theme-6);
}

.close-btn > img {
  width: 20px;
  height: auto;
}
</style>