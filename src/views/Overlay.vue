<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: Boolean,
  issues: Array
})
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="overlay">
    <div class="overlay-content">
      <button class="close-btn" @click="emit('close')">X</button>
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
  background: rgba(0, 0, 0, 0.7);
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
  color: black;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 5px;
}
</style>