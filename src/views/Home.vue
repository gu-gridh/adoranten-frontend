<script setup>
import { ref, onMounted } from 'vue'
import 'vue3-carousel/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import linkArrow from '/src/assets/link-arrow.png'
import hamburger from '/src/assets/menu.png'
import Overlay from '/src/views/Overlay.vue'

const description = ref('Loading...')
const issues = ref([])
const showOverlay = ref(false)

const carouselConfig = {
  itemsToShow: 2.5,
  wrapAround: true,
}

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value
}

onMounted(async () => {
  //fetch home page data
  try {
    const responseHome = await fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=home.HomePage&fields=description')
    const dataHome = await responseHome.json()
    if (dataHome.items && dataHome.items.length > 0) {
      description.value = dataHome.items[0].description
    } else {
      description.value = 'No home page content found'
    }
  } catch (error) {
    console.error('error fetching home page data:', error)
    description.value = 'error loading home page content'
  }

  //fetch issues data
  try {
    const responseIssues = await fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.IssuePage&fields=*')
    const dataIssues = await responseIssues.json()
    if (dataIssues.items && dataIssues.items.length > 0) {
      issues.value = dataIssues.items
    } else {
      issues.value = []
    }
  } catch (error) {
    console.error('error fetching issues data:', error)
  }
})
</script>

<template>
  <div id="home-container">
    <!-- render the home page description -->
    <div v-html="description"></div>

    <!-- Render the carousel -->
    <div v-if="issues.length" class="carousel-container">
      <button class="toggle-overlay-btn" @click="toggleOverlay">
        <img :src="hamburger" alt="Menu" class="hamburger-icon" />
      </button>
      <h2>Issues</h2>
      <Carousel v-bind="carouselConfig">
        <Slide v-for="issue in issues" :key="issue.id">
          <div class="carousel__item">
            <div class="image-container">
              <img v-if="issue.cover_image && issue.cover_image.meta && issue.cover_image.meta.download_url"
                :src="issue.cover_image.meta.download_url" alt="Issue Cover" />
              <router-link :to="{ name: 'Issue', params: { id: issue.id } }">
                <button class="view-button">
                  <span>View Issue</span>
                  <img :src="linkArrow" alt="Arrow Icon" class="arrow-icon" />
                </button>
              </router-link>
            </div>
            <h3>{{ issue.issue_name }} ({{ issue.issue_year }})</h3>
          </div>
        </Slide>
        <template #addons>
          <Navigation />
          <Pagination />
        </template>
      </Carousel>
    </div>
    <div v-else>
      <p>No issues found</p>
    </div>

    <div v-html="description"></div>

    <Overlay :show="showOverlay" :issues="issues" @close="toggleOverlay" />
  </div>
</template>

<style scoped>
h2, h3 {
  color: white;
}

#home-container {
  margin: 0 10%;
}

.carousel-container {
  background-color: #3C3C3C;
  position: relative;
  padding: 20px;
  margin-top: 20px;
  border-radius: 8px;
}

.toggle-overlay-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  z-index: 999;
}

.carousel__item {
  text-align: center;
  position: relative;
}

img {
  width: 80%;
  height: auto;
  border-radius: 5px;
  transition: transform 0.3s ease-in-out;
}

.image-container:hover img {
  transform: scale(1.05);
}

.view-button {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

.hamburger-icon {
  width: 40px;
  height: 40px;
}

.image-container:hover .view-button {
  opacity: 1;
}

.carousel__slide {
  width: 30% !important;
  margin: 0 5%; /* top no margin, left and right 5% */
}

.carousel {
  --vc-pgn-background-color: rgba(255, 255, 255, 0.7);
  --vc-pgn-active-color: rgba(255, 255, 255, 1);
  --vc-nav-background: rgba(255, 255, 255, 0.7);
  --vc-nav-border-radius: 100%;
}

::v-deep(.carousel__pagination-button--active) { /*override the active button color for carousel*/
  background-color: #b02b27 !important;
}
</style>
