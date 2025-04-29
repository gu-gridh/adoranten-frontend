<script setup>
import { ref, onMounted } from 'vue'
import 'vue3-carousel/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import linkArrow from '/src/assets/link-arrow.png'
import hamburger from '/src/assets/menu.png'
import loader from '/src/assets/loader.svg'
import Overlay from '/src/views/Overlay.vue'
import { useRouter } from 'vue-router'

const description = ref('Loading...')
const issues = ref([])
const articles = ref([])
const loading = ref(true)
const latestIssue = ref(null)
const showOverlay = ref(false)
const router = useRouter();

const coverImg = ref(null)
const coverHeight = ref(0)

const onImageLoad = () => {
  if (coverImg.value) {
    coverHeight.value = coverImg.value.clientHeight
  }
}

const carouselConfig = {
  itemsToShow: 2.5,
  wrapAround: true,
}

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value
}

const navigateToArticle = (article) => {
  if (article.issue_id && article.id) {
    router.push({
      name: 'Issue',
      params: { id: article.issue_id },
      hash: `#article-${article.id}`
    })
  } else {
    console.log('no issue id or article id')
  }
}

const navigateToIssue = (article) => {
  if (article.id) {
    router.push({
      name: 'Issue',
      params: { id: article.id },
    })
  } else {
    console.log('no issue id')
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    //fetch both home page and issues data
    const responseHome = await fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=home.HomePage&fields=*')
    const dataHome = await responseHome.json()

    //set description and issues and latest issue
    if (dataHome.items && dataHome.items.length > 0) {
      const homeItem = dataHome.items[0]
      description.value = homeItem.description

      const highlightsBlock = homeItem.article_highlights?.find(b => b.type === 'article_list')
      if (highlightsBlock) {
        articles.value = highlightsBlock.value
      }

      const latestIssueBlock = homeItem.latest_issue?.find(b => b.type === 'issue')
      if (latestIssueBlock) {
        latestIssue.value = latestIssueBlock.value
      }
    } else {
      description.value = 'No home page content found'
    }
  } catch (error) {
    console.error(error)
    description.value = 'Error loading home page content'
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
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading">
    <img :src="loader" alt="Loading..." class="loader" />
  </div>
  <div v-else id="home-container">
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
              <img v-if="issue.image && issue.image.meta && issue.image.meta.download_url"
                :src="issue.image.meta.download_url" alt="Issue Cover" />
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

    <h2 v-if="latestIssue" class="latest-title">Latest Issue: {{ latestIssue.title }}</h2>
    <div v-if="latestIssue" class="latest-container">
      <div class="image-container" @click="navigateToIssue(latestIssue)">
        <img ref="coverImg" :src="latestIssue.image.file" :alt="latestIssue.image.title" class="cover-image"
          @load="onImageLoad" />
        <button class="view-button">
          <span>View&nbsp;Issue</span>
          <img :src="linkArrow" alt="Arrow Icon" class="arrow-icon" />
        </button>
      </div>

      <div class="text-column" :style="{ maxHeight: coverHeight + 'px' }">
        <p v-html="latestIssue.description"></p>
      </div>
    </div>

    <!-- Articles Display -->
    <div v-if="articles.length" class="articles-container">
      <h2>Selected Articles</h2>
      <div class="articles-grid">
        <div v-for="article in articles" :key="article.id" class="article-card" @click="navigateToArticle(article)"
          :style="article.issueId ? 'cursor: pointer' : ''">
          <div class="image-container">
            <img v-if="article.image && article.image.file" :src="article.image.file" :alt="article.title"
              class="article-image" />
            <button class="view-button">
              <span>View&nbsp;Article</span>
              <img :src="linkArrow" alt="Arrow Icon" class="arrow-icon" />
            </button>
          </div>
          <h3 class="article-title">{{ article.title }}</h3>
        </div>
      </div>
    </div>

    <Overlay :show="showOverlay" :issues="issues" @close="toggleOverlay" />
  </div>
</template>

<style scoped>
.loader {
  width: 50px;
  height: 50px;
  margin: 0 auto;
}

.cover-image {
  height: auto;
  object-fit: contain;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
}

.text-column {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 12;
}

.cover-image {
  width: 300px;
  flex-shrink: 0;
}

.text-column {
  width: 300px;
  text-overflow: ellipsis;
  text-align: left;
  margin-left: 2rem;
  margin-top: 0rem;
}

.cover-image:hover {
  transform: scale(1.03);
}

.articles-container {
  padding: 20px;
  margin-bottom: 20px;
  text-align: left;
}

.latest-title {
  color: var(--theme-2);
  text-align: center;
  margin-top: 2rem;
}

.latest-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  margin: 2rem auto;
}

.articles-container h2 {
  text-align: center;
}

.articles-container h2,
.articles-container .article-title,
.latest-container h2 {
  color: var(--theme-2);
}

.articles-grid {
  display: flex;
  gap: 40px;
  margin-top: 20px;
  flex-wrap: wrap;
  overflow: hidden;
  width: 100%;
  justify-content: space-evenly;
}

.article-card {
  min-width: 200px;
  text-align: left;
}

.articles-container .image-container img {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover .article-image {
  transform: scale(1.03);
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.12);
}

.article-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 5px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-title {
  width: 100%;
  margin-top: 10px;
  font-size: 1rem;
}

h2,
h3 {
  color: white;
}

#home-container {
  margin: 0 10%;
}

.carousel-container {
  background-color: var(--theme-1);
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
  background: var(--theme-1);
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
  margin: 0 5%;
  /* top no margin, left and right 5% */
}

.carousel {
  --vc-pgn-background-color: rgba(255, 255, 255, 0.7);
  --vc-pgn-active-color: rgba(255, 255, 255, 1);
  --vc-nav-background: rgba(255, 255, 255, 0.7);
  --vc-nav-border-radius: 100%;
}

::v-deep(.carousel__pagination-button--active) {
  /*override the active button color for carousel*/
  background-color: #b02b27 !important;
}

@media screen and (max-width: 768px) {
  .latest-container {
    flex-direction: column;
    align-items: center;
  }

  .text-column {
    margin-left: 0;
    margin-top: 1rem;
    width: 90%;
    text-align: center;
  }

  #home-container>div.carousel-container>section>ol {
    display: none;
  }
}

.latest-container .image-container,
.article-card .image-container {
  position: relative;
}

.article-card:hover .view-button,
.latest-container .image-container:hover .view-button {
  opacity: 1;
}

.latest-container .view-button,
.article-card .view-button {
  bottom: 40px;
}
</style>