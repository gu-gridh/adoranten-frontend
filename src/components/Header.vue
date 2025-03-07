<script setup>
</script>

<template>
  <header class="header-tabs">
    <nav>
      <ul>
        <li>Home</li>
        <li>About</li>
        <li>Search</li>
        <li>Accessibility</li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.header-tabs {
  padding: 10px;
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
</style>
