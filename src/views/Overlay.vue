<script setup>
import { defineProps, defineEmits } from 'vue'
import X from '/src/assets/close.svg'
import issueIcon from '/src/assets/issue.png'

defineProps({
  show: Boolean,
  issues: Array
})
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="overlay">
    <div class="overlay-content">
        <img :src="X" alt="Close" class="close-icon" @click="emit('close')" />
      <div class="issues-list">
        <router-link
          v-for="issue in issues"
          :key="issue.id"
          :to="{ name: 'Issue', params: { id: issue.id } }"
          class="issue-item"
        >
          <img :src="issueIcon" alt="Issue Icon" class="issue-icon" />
            <span class="issue-title">Adoranten&nbsp;{{ issue.issue_year }}</span>
        </router-link>
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
  background: #707070e8;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* above everything */
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: auto;
  cursor: pointer;
  transition: transform 0.25s ease-in-out;
  z-index: 10;
}

.overlay-content {
  background: white;
  padding: 0;
  border-radius: 10px;
  width: 200px;
  max-width: 400px;
  min-height: 50vh;
  text-align: center;
  position: relative;
}

.close-icon:hover {
  transform: scale(1.1);
}

.issues-list {
  margin-top: 1rem;
  padding: 20px 0; 
  max-height: 60vh;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.issues-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0.5rem 20px;
  border-bottom: 1px solid #e0e0e0;
  color: inherit;
  text-decoration: none;
  transition: background 0.2s ease-in-out;
  justify-content: flex-start; 
  position: relative;
}

.issue-icon {
  width: 24px;
  height: auto;
}

.issue-item:hover {
  background: #e2e2e2;
}

.issue-title {
  color: #646cff;
  font-size: 1.1rem;
}
</style>