<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
    <div id="app">
        <Header />
        <main id="main-content">
            <div class="page-container">
                <router-view />
            </div>
        </main>
        <Footer />
    </div>
</template>

<style>
html,
body {
    margin: 0;
    padding: 0;
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

#main-content {
    flex: 1;
}

.page-container {
    margin: 0 auto;
    text-align: center;
}
</style>
