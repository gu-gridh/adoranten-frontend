<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import 'vue3-carousel/carousel.css'
import { adorantenStore } from "/src/stores/store.js";
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import rightArrow from '/src/assets/right-arrow.png'
import linkArrow from '/src/assets/link-arrow.png'
import loader from '/src/assets/loader.svg'
import Overlay from '/src/views/Overlay.vue'
import { useRouter } from 'vue-router'

const description = ref('Loading...')
const issues = ref([])
const articles = ref([])
const loading = ref(true)
const latestIssue = ref(null)
const showOverlay = ref(false)
const router = useRouter()

const coverImg = ref(null)
const coverHeight = ref(0)

const expandedLatest = ref(false)
const showExpandToggle = ref(false)
const textWrapper = ref(null)
const viewMode = ref('carousel')
const store = adorantenStore();

const onImageLoad = () => {
  if (coverImg.value) {
    coverHeight.value = coverImg.value.clientHeight
    updateToggle()
  }
}

const updateToggle = () => nextTick(() => {
  if (textWrapper.value && coverHeight.value) {
    showExpandToggle.value = textWrapper.value.scrollHeight > coverHeight.value
  }
})

const carouselConfig = {
  itemsToShow: 2.5,
  wrapAround: true,
}

const toggleOverlay = () => (showOverlay.value = !showOverlay.value)
const toggleExpand = () => (expandedLatest.value = !expandedLatest.value)

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

function setKeyword(tag) {
  store.keyword = tag
  router.push({ name: 'Search' })
}

onMounted(async () => {
  try {
    loading.value = true;
    const responseHome = await fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=home.HomePage&fields=*')
    const dataHome = await responseHome.json()

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

    //fetch all issues
    const fetchAllIssues = async () => {
      const allIssues = []
      const limit = 25
      let offset = 0
      let totalCount = Infinity

      while (offset < totalCount) {
        const res = await fetch(`https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.IssuePage&fields=*&limit=${limit}&offset=${offset}`)
        const data = await res.json()

        if (data.items && data.items.length > 0) {
          allIssues.push(...data.items)
          totalCount = data.meta.total_count
          offset += data.items.length
        } else {
          break
        }
      }
      return allIssues
    }

    issues.value = await fetchAllIssues()

  } catch (error) {
    console.error(error)
    description.value = 'error loading home page or issues'
    issues.value = []
  } finally {
    loading.value = false
  }
})

watch([coverHeight, () => latestIssue.value?.description], updateToggle)
</script>

<template>
  <div v-if="loading">
    <img :src="loader" alt="Loading..." class="loader" />
  </div>
  <div v-else id="home-container">
    <!-- render the home page description -->
    <div class="home-description" v-html="description"></div>

    <!-- Render the carousel -->
    <div v-if="issues.length" class="carousel-container">
      <h2 style="margin-bottom: 5px; margin-top: 0px">Issues</h2>
      <div class="view-toggle-buttons" style="margin-bottom: 10px;">
        <button class="standard-button" @click="toggleOverlay">Show as a list</button>
      </div>
      <Carousel v-if="viewMode === 'carousel'" v-bind="carouselConfig">

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

      <div class="text-column" :class="{ expanded: expandedLatest }">
        <div class="text-wrapper" ref="textWrapper"
          :style="expandedLatest ? {} : { maxHeight: (coverHeight - 25) + 'px' }">
          <p v-html="latestIssue.description"></p>
        </div>

        <div v-if="showExpandToggle" class="expand-toggle" @click.stop="toggleExpand">
          <span v-if="!expandedLatest">[+ Read more]</span>
          <span v-else>[- Show less]</span>
        </div>
      </div>
    </div>

    <!-- Articles Display -->
    <div v-if="articles.length" class="selected-articles-container" style="margin-top: 20px;">
      <h2 style="color: rgb(112, 112, 112);">Selected Articles</h2>

      <div class="selected-articles-grid">
        <div v-for="article in articles" :key="article.id" class="selected-article-card">
          <div class="selected-article-body">
            <h3 class="selected-article-title">{{ article.title }}</h3>
            <div class="selected-article-description" v-html="article.description"></div>
            <div class="selected-article-tags" v-if="article.tags?.length">
              <span v-for="tag in article.tags" :key="tag" class="tag" @click.stop="setKeyword(tag)">#{{ tag }}</span>
            </div>
          </div>

          <div class="selected-article-footer">
            <button class="explore-button" @click.stop="navigateToArticle(article)">
              Explore
              <img :src="rightArrow" alt="right arrow" class="explore-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <Overlay :show="showOverlay" :issues="issues" @close="toggleOverlay" />
  </div>
</template>

<style scoped>
.home-description {
  max-width: 1200px;
  width: 90%;
  margin: 20px auto;
  text-align: left;
}

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

.articles-container {
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
  margin-bottom: 0px;
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
  flex-shrink: 0;
  text-align: left;
}

.articles-container .image-container img,
.latest-container .image-container img {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover .article-image {
  transform: scale(1.03);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.12);
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
  margin: 20px auto;
  border-radius: 8px;
  max-width: 1500px;
  width: 90%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12)
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

.selected-article-card:hover {
    transform: scale(1.03);
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

  .article-card {
    width: 100%;
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

.text-wrapper {
  overflow: hidden;
}

.text-column.expanded .text-wrapper {
  overflow: visible;
  max-height: none;
}

.expand-toggle {
  cursor: pointer;
  color: var(--theme-2);
  margin-top: 0.5rem;
  text-align: center;
}

.articles-container h2 {
  text-align: center;
}

.selected-articles-container {
  margin-bottom: 40px;
}

.standard-button {
  background: var(--theme-2);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-family: 'Barlow Condensed'
}

.selected-article-title {
  margin-top: 10px;
  margin-bottom: 0px;
  cursor: default;
}

.selected-articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 40px;
  justify-content: center;
  max-width: 1200px;
  margin: 20px auto 0 auto;
}

.selected-article-card {
  background-color: var(--theme-1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 0 0.25rem rgb(128, 128, 128));
  padding: 5px 15px 15px 15px;
  transition: transform 0.3s ease;
}

.selected-article-description {
  line-height: 1.6;
  font-size: 1rem;
  color: white;
  text-align: left;
  min-height: 30px;
  margin: 0;
  cursor: default;
}

.selected-article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--theme-2);
  border-radius: 8px;
  padding: 3px 8px;
  cursor: pointer;
  color: white;
}

.selected-article-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.selected-article-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.explore-button {
  background-color: var(--theme-2);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Barlow Condensed';
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;
  line-height: 1;
}

.explore-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
  margin-top: 3px;
}

.explore-button:hover,
.tag:hover,
.standard-button:hover,
.explore-button:hover,
.view-button:hover {
  background-color: var(--theme-3);
}
</style>