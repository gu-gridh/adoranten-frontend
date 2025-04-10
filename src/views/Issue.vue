<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import linkArrow from '/src/assets/link-arrow.png'
// import downloadButton from '/src/assets/download.png'
import rightArrow from '/src/assets/right-arrow.png'

// access the current route
const route = useRoute()

const baseURL = 'https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.'
const expandedArticleId = ref(null)
const articles = ref([])
const issue = ref([])
const issueId = route.params.id

function downloadCitation(articleTitle, format) {
  const sanitizedTitle = articleTitle.replace(/\s+/g, '_')
  const fileName = `${sanitizedTitle}.${format}`
  const citationText = `citation for "${articleTitle}" in a .${format} file.`
  const blob = new Blob([citationText], { type: 'text/plain' })   //blob is a file-like object ofraw data

  //create a temporary link to trigger the download because blobs can't be downloaded directly
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

function toggleDownload(articleId) {
  expandedArticleId.value = expandedArticleId.value === articleId ? null : articleId
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
  <div>
    <h2>{{ issue.title }}</h2>
    <h3>
      <a v-if="issue.pdf_file" :href="issue.pdf_file" target="_blank">
        Read full {{ issue.title }} PDF
      </a>
    </h3>

    <div class="container">
      <p v-if="!articles.length">No articles found.</p>
      <ul v-else>
        <li v-for="article in articles" :key="article.id" :id="'article-' + article.id" class="article-list-item">
          <div class="article-box">
            <div v-if="article.image?.meta?.download_url" class="image-container">
              <img :src="article.image.meta.download_url" :alt="article.title" />
            </div>

            <div class="content">
              <h3>{{ article.title }}</h3>
              <div v-html="article.article_description" class="article-description"></div>

              <div class="button-group">
                <div class="download-dropdown">
                  <button class="download-main-button" @click.stop="toggleDownload(article.id)">
                    <span>Download Citation</span>
                    <img :src="rightArrow" alt="Toggle Download Options" class="arrow-icon" />
                  </button>

                  <div v-if="expandedArticleId === article.id" class="download-submenu">
                    <button class="format-option" @click="downloadCitation(article.title, 'bibtex')">
                      (bibtex)
                    </button>
                    <button class="format-option" @click="downloadCitation(article.title, 'ris')">
                      (ris)
                    </button>
                  </div>
                </div>

                <a v-if="article.pdf_file" :href="article.pdf_file" target="_blank" class="pdf-link">
                  <span>Read PDF</span>
                  <img :src="linkArrow" alt="Right Arrow Icon" class="arrow-icon" />
                </a>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
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
}

.image-container {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.image-container:hover img {
  transform: scale(1.05);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  color: white;
  padding: 5px 15px 15px 15px;
}

.article-description {
  line-height: 1.6;
  font-size: 1rem;
  color: white;
  text-align: left;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  position: relative;
}

.download-dropdown {
  position: relative;
  display: inline-flex;
  align-items: center;
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

.download-icon {
  width: 20px;
  height: 20px;
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

.pdf-link {
  background: var(--theme-2);
  color: #fff;
  padding: 6px 10px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
</style>
