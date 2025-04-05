<script setup>
import { useRoute, useRouter } from 'vue-router';
import logo from '/src/assets/logo.png'

const route = useRoute();
const router = useRouter();

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <header class="header-tabs">
    <div class="header-container">
      <div class="brand">
        <img :src="logo" alt="Logo" class="site-logo" />
        <span class="site-title">Adoranten</span>
      </div>

      <nav>
        <ul>
          <li 
            :class="{ active: route.path === '/' }" 
            @click="navigateTo('/')">
            Home
          </li>
          <li 
            :class="{ active: route.path === '/search' }" 
            @click="navigateTo('/search')">
            Search
          </li>
          <li 
            :class="{ active: route.path === '/about' }" 
            @click="navigateTo('/about')">
            About
          </li>
          <li 
            :class="{ active: route.path === '/accessibility' }" 
            @click="navigateTo('/accessibility')">
            Accessibility
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header-tabs {
  padding: 10px 5%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-logo {
  height: 100px;
  width: auto;
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
  cursor: pointer;
}

.header-tabs nav ul li:hover {
  color: var(--theme-3);
}

.header-tabs nav ul li.active {
  color: #000;
  font-weight: 600;
  border-bottom: 2px solid #000;
}

.site-title {
  font-family: 'Teko', sans-serif;
  margin-left: 20px;
  font-size: 50px;
  color: var(--theme-4);
}
</style>
