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

// function downloadCitation(articleTitle, format) {
//   const sanitizedTitle = articleTitle.replace(/\s+/g, '_')

//   const fileName = `${sanitizedTitle}.${format}`

//   const citationText = `citation for "${articleTitle}" in a .${format} file.`

//   //blob is a file-like object ofraw data
//   const blob = new Blob([citationText], { type: 'text/plain' })

//   //create a temporary link to trigger the download because blobs can't be downloaded directly
//   const link = document.createElement('a')
//   link.href = URL.createObjectURL(blob)
//   link.download = fileName
//   link.click()
//   URL.revokeObjectURL(link.href)
// }

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
    <h2>{{ issue.title }}</h2>
    <h3>
      <a v-if="issue.pdf_file" :href="issue.pdf_file" target="_blank">
        Read full {{ issue.title }} PDF
      </a>
    </h3>

    <div class="container">
      <p v-if="!articles.length">No articles found.</p>
      <ul v-else>
        <li 
          v-for="article in articles" 
          :key="article.id" 
          :id="'article-' + article.id"
          class="article-list-item"
        >
          <div class="article-box">
            <div v-if="article.image?.meta?.download_url" class="image-container">
              <img
                :src="article.image.meta.download_url"
                :alt="article.title"
              />
            </div>

            <div class="content">
              <h3>{{ article.title }}</h3>
              <div
                v-html="article.article_description"
                class="article-description"
              ></div>
            </div>

            <div class="button-group">
              <button class="citation-button" @click="downloadCitation(article.title, 'docx')">
                <span>Download Citation (APA)</span>
                <img :src="downloadButton" alt="Download Icon" class="download-icon" />
              </button>
              <button class="citation-button" @click="downloadCitation(article.title, 'txt')">
                <span>Download Citation (MLA)</span>
                <img :src="downloadButton" alt="Download Icon" class="download-icon" />
              </button>
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
  padding: 10px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.image-container {
  width: 100%;
  height: 200px; 
  overflow: hidden;
  border-radius: 5px;
  margin-bottom: 10px;
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
}

.article-description {
  line-height: 1.6;
  font-size: 1rem;
  color: #333;
  text-align: left;
  color: white;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto; 
}

.citation-button {
  background: var(--theme-2);
  color: white;
  border: none;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-transform: none;
}

.download-icon {
  width: 20px;
  height: 20px;
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

.arrow-icon {
  width: 16px;
  height: 16px;
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
