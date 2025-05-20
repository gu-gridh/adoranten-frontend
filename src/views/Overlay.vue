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
  <transition name="fade">
    <div v-if="show" class="overlay" @click.self="emit('close')">
      <transition name="slide">
        <aside class="drawer">
          <button class="panel-close" @click="emit('close')" aria-label="Close navigation">
            <img :src="X" alt="" />
          </button>

          <nav class="issues-list">
            <router-link v-for="issue in issues" :key="issue.id" :to="{ name: 'Issue', params: { id: issue.id } }"
              class="issue-item" @click="emit('close')">
              <img :src="issueIcon" alt="" class="issue-icon" />
              <span>Adoranten&nbsp;{{ issue.issue_year }}</span>
            </router-link>
          </nav>
        </aside>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0 0 0 /.45);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: clamp(260px, 75vw, 360px);
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding-top: 56px;
  overflow: hidden;
  box-shadow: -4px 0 14px rgba(0, 0, 0, .2);
  overflow-x: hidden;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform .3s ease;
}

.panel-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform .25s ease-in-out;
}

.panel-close:hover {
  transform: scale(1.1);
}

.panel-close img {
  width: 100%;
  height: 100%;
  display: block;
}

.issues-list {
  flex: 1 1 auto;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  padding-bottom: 32px;
  overflow-x: hidden;
}

.issue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 14px 24px;
  text-decoration: none;
  color: inherit;
  transition: background .2s;
}

.issue-item:not(:last-child) {
  border-bottom: 1px solid #ececec;
}

.issue-item:hover {
  background: #e2e2e2;
}

.issue-icon {
  width: 24px;
}
</style>