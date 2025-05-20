<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adorantenStore } from "/src/stores/store.js";
import loader from '/src/assets/loader.svg' 
import linkArrow from '/src/assets/link-arrow.png'
import rightArrow from '/src/assets/right-arrow.png'
import downArrow from '/src/assets/down-arrow.png'
import backButton from '/src/assets/back-button.svg'
import infoIcon from '/src/assets/info.svg'
import closeIcon from '/src/assets/close.svg'

// access the current route
const route = useRoute()
const router = useRouter()
const baseURL = 'https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.'
const expandedArticleId = ref(null)
const loading = ref(true)
const articles = ref([])
const issue = ref([])
const issueId = route.params.id
const expandedArticles = ref({})
const TRUNCATE_LIMIT = 300
const store = adorantenStore();
const showCitationBox = ref(null)
const showIssueDescriptionOverlay = ref(false)
const hasDescription = computed( //check if the issue has a description
  () => issue.value?.description && issue.value.description.trim() !== '')

function downloadCitation(articleTitle, format) {
  const sanitizedTitle = articleTitle.replace(/\s+/g, '_')
  const fileName = `${sanitizedTitle}.${format}`
  const citationText = `${articleTitle}"`
  const blob = new Blob([citationText], { type: 'text/plain' })  //blob is a file-like object of raw data

  //create a temporary link to trigger the download because blobs can't be downloaded directly
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

function toggleCitation(articleId) {
  showCitationBox.value = showCitationBox.value === articleId ? null : articleId
  // Close download options if citation box is opened
  if (expandedArticleId.value === articleId) {
    expandedArticleId.value = null
  }
}

function goBack() {
  const { back } = router.options.history.state || {}
  back ? router.back() : router.push({ name: 'Home' })
}

function toggleDownload(articleId) {
  expandedArticleId.value = expandedArticleId.value === articleId ? null : articleId
}

function toggleExpand(articleId) {
  expandedArticles.value[articleId] = !expandedArticles.value[articleId]
}

//check whether the article description needs an expand icon
function needsExpandIcon(article) {
  if (!article.description) return false
  return article.description.length > TRUNCATE_LIMIT
}

//returns the text to display - truncated or full based on the expanded state
function getDisplayText(article) {
  const desc = article.description || ''
  if (!needsExpandIcon(article)) {
    return desc
  }
  return expandedArticles.value[article.id]
    ? desc
    : desc.slice(0, TRUNCATE_LIMIT) + '…'
}

function setKeyword(tag) {
  store.keyword = tag;
  console.log('Keyword set to:', store.keyword);
  router.push({ name: 'Search' })
}

function showIssueDescription() {
  showIssueDescriptionOverlay.value = true
}

function toggleOverlay() {
  showIssueDescriptionOverlay.value = !showIssueDescriptionOverlay.value
}

onMounted(async () => {
  //fetch issue article data
  try {
    // get the issue ID from the URL params
    const responseArticles = await fetch(`${baseURL}ArticlePage&child_of=${issueId}&fields=*`)
    const data = await responseArticles.json()
    if (data.items && data.items.length > 0) {
      articles.value = data.items
    } else {
      articles.value = []
    }
  } catch (error) {
    console.error('error fetching articles:', error)
  }

  //fetch issue full pdf
  try {
    // get the issue ID from the URL params
    const responseIssue = await fetch(`${baseURL}IssuePage&id=${issueId}&fields=*`)
    const data = await responseIssue.json()
    if (data.items && data.items.length > 0) {
      issue.value = data.items[0]
    } else {
      issue.value = []
    }
  } catch (error) {
    console.error('error fetching issue full pdf:', error)
  } finally {
    loading.value = false 
  }

  //after data is loaded, scroll to hash if present
  await nextTick()
  if (route.hash) {
    const element = document.querySelector(route.hash)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
})
</script>

<template>
  <div v-if="loading" class="loader-wrapper">
    <img :src="loader" alt="Loading…" class="loader" />
  </div>
  <div v-else>
    <div class="header-wrapper">
      <img :src="backButton" alt="Back" class="back-button" @click="goBack" />
      <h2>{{ issue.title }} <img v-if="hasDescription" :src="infoIcon" alt="Info" class="info-icon"
          @click="showIssueDescription" /></h2>
    </div>
    <h3 id="issue-button">
      <a v-if="issue.pdf_file" :href="issue.pdf_file" target="_blank">
        Read full {{ issue.title }} PDF
      </a>
    </h3>

    <div class="container">
      <p v-if="!articles.length">No articles found.</p>
      <ul v-else>
        <li v-for="article in articles" :key="article.id" :id="'article-' + article.id" class="article-list-item">
          <div class="article-box">
            <div class="image-container">
              <img v-if="article.image?.meta?.download_url" :src="article.image.meta.download_url"
                :alt="article.title" />
              <img v-else-if="issue?.image?.meta?.download_url" :src="issue.image.meta.download_url"
                :alt="article.title" />
              <a v-if="article.pdf_file" :href="article.pdf_file" target="_blank" class="pdf-button">
                <span>Read PDF</span>
                <img :src="linkArrow" alt="Right Arrow Icon" class="arrow-icon" />
              </a>
            </div>

            <div class="content">
              <h3 class="article-title">{{ article.title }}</h3>

              <div class="article-description">
                <p v-html="getDisplayText(article)"></p>
              </div>

              <div class="expand-toggle" v-if="needsExpandIcon(article)" @click="toggleExpand(article.id)">
                <span v-if="!expandedArticles[article.id]">[+ Read more]</span>
                <span v-else>[- Show less]</span>
              </div>

              <div class="bottom-bar">
                <div class="tags-row">
                  <template v-if="article.tags && article.tags.length">
                    <span v-for="(tag, index) in article.tags" :key="index" class="keyword-tag"
                      @click="setKeyword(tag)">
                      #{{ tag }}
                    </span>
                  </template>
                </div>

                <div class="button-group">
                  <div class="download-dropdown">
                    <button class="download-main-button" :class="{ 'disabled-button': !article.citation }"
                      @click.stop="toggleDownload(article.id)">
                      <span>Download Citation</span>
                      <img :src="rightArrow" alt="Toggle Download Options" class="arrow-icon" />
                    </button>
                    <div v-if="expandedArticleId === article.id" class="download-submenu">
                      <button class="format-option" @click="downloadCitation(article.title, 'bibtex')">(bibtex)</button>
                      <button class="format-option" @click="downloadCitation(article.title, 'ris')">(ris)</button>
                    </div>
                  </div>

                  <button class="download-main-button" :class="{ 'disabled-button': !article.citation }"
                    @click="toggleCitation(article.id)">
                    <span>Copy Citation</span>
                    <img :src="downArrow" alt="Toggle Citation Box" class="arrow-icon" />
                  </button>
                </div>
              </div>
            </div>

            <div v-if="showCitationBox === article.id" class="citation-box">
              <div class="citation-content">
                <div v-html="article.citation"></div>
                <div class="citation-note">Select the text above to copy</div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <transition name="fade">
      <div v-if="showIssueDescriptionOverlay" class="backdrop" @click.self="toggleOverlay">
        <transition name="slide">
          <aside class="desc-drawer">
            <button class="drawer-close" @click="toggleOverlay" aria-label="Close">
              <img :src="closeIcon" alt="" />
            </button>
            <div class="desc-scroll">
              <div v-if="issue.description" v-html="issue.description"></div>
              <p v-else>No description for this issue.</p>
            </div>
          </aside>
        </transition>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0 0 0 /.45);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.desc-drawer {
  position: fixed;
  right: 0;
  top: 0;
  width: clamp(260px, 75vw, 360px);
  height: 100%;
  background: #fff;
  box-shadow: -4px 0 14px rgba(0, 0, 0, .2);
  display: flex;
  flex-direction: column;
  padding-top: 56px;
  overflow: hidden;
}

.desc-scroll {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 0 24px 32px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  text-align: left;
}

.desc-scroll::-webkit-scrollbar {
  width: 6px;
}

.desc-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.desc-scroll::-webkit-scrollbar-thumb {
  background: #ccc;
}

.drawer-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform .25s ease-in-out;
}

.drawer-close:hover {
  transform: scale(1.1);
}

.drawer-close img {
  width: 100%;
  height: 100%;
  display: block;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform .3s ease;
}

.disabled-button {
  pointer-events: none;
  opacity: 0.5;
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.pdf-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--theme-1);
  color: #fff;
  padding: 4px 8px;
  border-radius: 5px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
  font-size: 1rem;
}

.pdf-button:hover {
  background-color: var(--theme-3);
}

.pdf-button .arrow-icon {
  width: 20px;
  height: 20px;
}

#issue-button {
  margin: 0px;
}

.container {
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}

.article-list-item {
  width: calc(33.333% - 20px);
  box-sizing: border-box;
  margin-bottom: 20px;
}

.article-box {
  background-color: var(--theme-1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible;
  filter: drop-shadow(0 0 0.25rem rgb(128, 128, 128));
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.3s ease-in-out;
}

.image-container:hover img {
  transform: scale(1.05);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  color: white;
  padding: 5px 15px 15px 15px;
}

.article-title {
  min-height: 48px;
  margin: 0 0 8px 0;
}

.article-description p {
  line-height: 1.6;
  font-size: 1rem;
  color: white;
  text-align: left;
  min-height: 30px;
  margin: 0;
}

.expand-toggle {
  cursor: pointer;
  color: #fff;
  font-weight: bold;
  margin-bottom: 12px;
}

.bottom-bar {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow: hidden;
  max-width: 100%;
}

.keyword-tag {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: grey;
  border-radius: 8px;
  padding: 3px 8px;
  cursor: pointer;
}

.download-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
}

button.download-main-button:hover,
.keyword-tag:hover {
  background-color: var(--theme-3);
}

.download-main-button {
  background-color: var(--theme-2);
  color: #fff;
  border: none;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.download-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 8px;
  background-color: var(--theme-2);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  display: inline-flex;
  flex-direction: column;
  z-index: 999;
  padding: 3.5px;
}

.format-option {
  background: none;
  border: none;
  color: #fff;
  text-align: left;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.format-option:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.citation-box {
  margin-top: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 10px;
  color: white;
}

.citation-content p {
  margin: 0;
  font-style: italic;
  padding: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  user-select: all;
}

.citation-note {
  font-size: 12px;
  color: #ccc;
  margin-top: 5px;
  text-align: right;
}

.header-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-icon {
  display: inline-block;
  height: 1em;
  vertical-align: middle;
  margin-left: .35em;
  cursor: pointer;
}

.info-icon:hover {
  transform: scale(1.1);
}

@media (max-width: 1024px) {
  .article-list-item {
    width: calc(50% - 20px);
  }
}

@media (max-width: 600px) {
  .article-list-item {
    width: 100%;
  }
}

.loader {
  width: 50px;
  height: 50px;
  margin: 0 auto;
}
</style>
