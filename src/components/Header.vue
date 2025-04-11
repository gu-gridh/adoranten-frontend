<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue'; 
import logo from '/src/assets/logo.png'

const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);

const navigateTo = (path) => {
  router.push(path);
  isMenuOpen.value = false;
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <header class="header-tabs">
    <div class="header-container">
      <div class="brand">
        <img :src="logo" alt="Logo" class="site-logo" />
        <span class="site-title">Adoranten</span>
      </div>

      <!-- Hamburger Menu Button -->
      <div class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav :class="{ 'open': isMenuOpen }">
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
            :class="{ active: route.path === '/submit' }" 
            @click="navigateTo('/submit')">
            Submit
          </li>
          <li 
            :class="{ active: route.path === '/accessibility' }" 
            @click="navigateTo('/accessibility')">
            Accessibility
          </li>
          <li 
            :class="{ active: route.path === '/about' }" 
            @click="navigateTo('/about')">
            About
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

/* Hamburger implementation */
.header-container {
  position: relative;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
  z-index: 10;
}

.hamburger span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: #333;
  border-radius: 3px;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .site-logo {
    height: 50px;
  }
  
  nav {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    width: 100%;
    max-width: fit-content;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 5;
    opacity: 0;
    visibility: hidden;
  }
  
  nav.open {
    transform: translateX(0);
    opacity: 1;
    visibility: visible;
  }
  
  .header-tabs nav ul {
    flex-direction: column;
  }
  
  .header-tabs nav ul li {
    margin: 10px 0;
    margin-left: 0;
    padding: 8px 0;
  }
}
</style>
