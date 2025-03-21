<script setup>
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <header class="header-tabs">
    <nav>
      <ul>
        <li 
          :class="{ active: route.path === '/' }" 
          @click="navigateTo('/')">
          Home
        </li>
        <li :class="{ active: route.path === '/about' }" 
        @click="navigateTo('/about')">About</li>
        <li 
          :class="{ active: route.path === '/search' }" 
          @click="navigateTo('/search')">
          Search
        </li>
        <li :class="{ active: route.path === '/accessibility' }" 
        @click="navigateTo('/accessibility')">Accessibility</li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header-tabs {
  padding: 10px;
  margin-right: 5%;
}

.header-tabs nav ul {
  list-style: none;
  display: flex;
  justify-content: flex-end;
  margin: 0;
  padding: 0;
}

.header-tabs nav ul li {
  margin-left: 20px;
  font-weight: 500;
  color: #333;
}

.header-tabs nav ul li:hover {
  color: #666;
}

.header-tabs nav ul li.active {
  color: #000;
  font-weight: 600;
  border-bottom: 2px solid #000;
}
</style>
