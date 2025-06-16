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
      <h2 style="margin-bottom: 5px; margin-top: 5px">Issues</h2>
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

    <div class="home-main">
      <section class="latest-col">
        <h2 class="latest-title">Latest Issue: {{ latestIssue.title }}</h2>

        <div class="latest-card" @click="navigateToIssue(latestIssue)">
          <img ref="coverImg" :src="latestIssue.image.file" :alt="latestIssue.image.title" class="cover-image"
            @load="onImageLoad" />

          <div class="latest-desc" v-html="latestIssue.description"></div>

          <button class="view-button">
            <span>View&nbsp;Issue</span>
            <img :src="linkArrow" alt="" class="arrow-icon" />
          </button>
        </div>
      </section>

      <!-- right: selected articles -->
      <section class="articles-col">
        <h2 class="articles-title">Selected Articles</h2>

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
      </section>
    </div>

    <Overlay :show="showOverlay" :issues="issues" @close="toggleOverlay" />
  </div>
</template>

<style scoped>
#home-container {
  width: 80%;
  max-width: 85vw;
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.home-main {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  margin-top: 20px;
}

.latest-col {
  flex: 0 0 30%;
}

.articles-col {
  flex: 1 0 70%;
}

.latest-title,
.articles-title {
  text-align: left;
  color: var(--theme-2);
  margin-bottom: 1rem;
}

.latest-card {
  position: relative;
  cursor: pointer;
}

.cover-image {
  width: 100%;
  border-radius: 8px;
  transition: transform .3s ease,
    filter .3s ease;
}

.latest-card:hover .cover-image {
  transform: scale(1.03);
  filter: brightness(0.35);
}

.latest-desc {
  position: absolute;
  inset: 0;
  padding: 0px;
  overflow-y: auto;
  background: transparent;
  color: #fff;
  opacity: 0;
  transition: opacity .25s ease;
  border-radius: inherit;
  font-size: .95rem;
  scrollbar-width: none;
 -ms-overflow-style: none; 
}

.latest-desc::-webkit-scrollbar {
  display: none;
}

.latest-card:hover .latest-desc {
  opacity: 1;
}

.home-description {
  max-width: 70%;
  width: 90%;
  text-align: left;
}

.loader {
  width: 50px;
  height: 50px;
  margin: 0 auto;
}

.latest-title {
  color: var(--theme-2);
  text-align: left;
}

.image-container img {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
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

.carousel-container {
  padding: 20px;
  width: 100%;
  background: var(--theme-1);
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, .12);
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
  transform: scale(1.01);
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

.image-container:hover .view-button {
  opacity: 1;
}

.carousel__slide {
  width: 30% !important;
  margin: 0 5%;
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
  .home-main {
    flex-direction: column;
  }

  .latest-col,
  .articles-col {
    width: 100%;
  }

  .carousel-container {
    padding: 0px;
  }

  .selected-article-card {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }

  #home-container>div.carousel-container>section>ol {
    display: none;
  }
}

.selected-articles-container {
  width: 90%;
  margin: 0 auto;
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
  display: flex;
  gap: 40px;
  justify-content: center;
  flex-wrap: wrap;
}

.selected-article-card {
  flex: 1 1 0;
  min-width: 0;
  max-width: calc((100% - 80px)/3);
  background: var(--theme-1);
  border-radius: 8px;
  padding: 5px 15px 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform .3s ease;
  filter: drop-shadow(0 0 0.25rem rgb(128 128 128));
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