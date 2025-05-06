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
      <div class="title">Issues</div>
      <div class="issues-list">
        <router-link
          v-for="issue in issues"
          :key="issue.id"
          :to="{ name: 'Issue', params: { id: issue.id } }"
          class="issue-item"
        >
          <img :src="issueIcon" alt="Issue Icon" class="issue-icon" />
          Adoranten&nbsp;{{ issue.issue_year }}
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
}

.overlay-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 30%;
  min-height: 50vh;
  text-align: center;
  position: relative;
}

.close-icon:hover {
  transform: scale(1.1);
}

.title {
  font-size: 28px;
}

.issues-list {
  margin-top: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.issue-item {
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  color: inherit;
  text-decoration: none;
  transition: background 0.2s ease-in-out;
  text-align: center;
  justify-content: center; 
  position: relative;
}

.issue-icon {
  width: 24px;
  height: auto;
  position: absolute; 
  left: 0;
}

.issue-item:hover {
  background: #f0f0f0;
}
</style>