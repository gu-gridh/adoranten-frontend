<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import linkArrow from '/src/assets/link-arrow.png'
import downloadButton from '/src/assets/download.png'

// access the current route
const route = useRoute()

const baseURL = 'https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.'

const articles = ref([])
const issue = ref([])
const issueId = route.params.id

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

  // after data is loaded, scroll to hash if present
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
    <h2>Articles</h2>
    <h3>
      <a v-if="issue.pdf_file" :href="issue.pdf_file" target="_blank">
        Read full {{ issue.title }} PDF
      </a>
    </h3>

    <div class="container">
      <p v-if="!articles.length">No articles found.</p>
      <ul v-else>
        <li v-for="article in articles" :key="article.id" :id="'article-' + article.id">
          <div class="article-box">
            <div v-if="article.image?.meta?.download_url" class="image-container">
              <img
                :src="article.image.meta.download_url"
                :alt="article.article_title"
              />
              <button class="view-button">
                <span>Download Citation</span>
                <img :src="downloadButton" alt="Arrow Icon" class="download-icon" />
              </button>
            </div>

            <div class="content">
              <h3>{{ article.article_title }}</h3>
              <div
                v-html="article.article_description"
                class="article-description"
              ></div>
            </div>
            <a
              v-if="article.pdf_file"
              :href="article.pdf_file"
              target="_blank"
              class="pdf-link"
            >
              <span>Read PDF</span>
              <img :src="linkArrow" alt="Right Arrow Icon" class="arrow-icon" />
            </a>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  flex-direction: column;
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20px;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: flex-start;
}

.content > * {
  margin: 0 0 10px 0;
}

img {
  width: 300px;
  height: auto;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.article-description {
  line-height: 1.6;
  max-width: 800px;
  font-size: 1rem;
  color: #333;
  text-align: left;
  width: 100%;
  flex: 1;
}

.article-box {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  position: relative;
  width: 90%;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin: 0 auto;
}

.image-container {
  position: relative;
  overflow: hidden;
  border-radius: 5px;
}

.image-container:hover img {
  transform: scale(1.05);
}

.view-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-container:hover .view-button {
  opacity: 1;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

.download-icon {
  width: 20px;
  height: 20px;
}

.pdf-link {
  position: absolute;
  bottom: 15px;
  right: 15px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #000;
  color: #fff;
  padding: 6px 10px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}
</style>
