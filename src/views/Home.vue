<script setup>
import { ref, onMounted } from 'vue'
import 'vue3-carousel/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import linkArrow from '/src/assets/link-arrow.png'
import hamburger from '/src/assets/hamburger.svg'
import Overlay from '/src/views/Overlay.vue'

const description = ref('Loading...')
const issues = ref([])
const imageBaseUrl = 'http://127.0.0.1:8000'
const showOverlay = ref(false)

const carouselConfig = {
  itemsToShow: 2.5,
  wrapAround: true
}

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value
}

onMounted(async () => {
  //fetch home page data
  try {
    const responseHome = await fetch('http://127.0.0.1:8000/api/v2/pages/?type=home.HomePage&fields=description')
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
    const responseIssues = await fetch('http://127.0.0.1:8000/api/v2/pages/?type=journal.IssuePage&fields=*')
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
    <button class="toggle-overlay-btn" @click="toggleOverlay">
        <img :src="hamburger" alt="Menu" class="hamburger-icon" />
    </button>

    <!-- render the home page description -->
    <div v-html="description"></div>

    <!-- Render the carousel -->
    <div v-if="issues.length">
      <h2>Issues</h2>
      <Carousel v-bind="carouselConfig">
        <Slide v-for="issue in issues" :key="issue.id">
          <div class="carousel__item">
            <div class="image-container">
              <img 
                v-if="issue.cover_image && issue.cover_image.meta && issue.cover_image.meta.download_url"
                :src="imageBaseUrl + issue.cover_image.meta.download_url"
                alt="Issue Cover"
              />
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

    <Overlay :show="showOverlay" :issues="issues" @close="toggleOverlay" />
  </div>
</template>

<style scoped>
#home-container {
  margin: 0 10%;
}

.toggle-overlay-btn {
  position: absolute;
  top: 100px;
  right: 80px;
  background: rgb(239, 239, 239);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 0;
}

.carousel__item {
  text-align: center;
  position: relative;
}

img {
  max-width: 50%;
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
</style>
