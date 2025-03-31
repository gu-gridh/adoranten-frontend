<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

// access the current route
const route = useRoute()

const articles = ref([])
const issue = ref([])
const issueId = route.params.id

onMounted(async () => {
  //fetch issue article data
  try {
    // get the issue ID from the URL params

    const responseArticles = await fetch(`https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.ArticlePage&child_of=${issueId}&fields=*`)
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

    const responseIssue = await fetch(`https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.IssuePage&id=${issueId}&fields=*`)
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

    <h3><a v-if="issue.pdf_file" 
   :href="issue.pdf_file" 
   target="_blank">Read full {{ issue.title }} PDF</a></h3>

    <h2>Articles</h2>
    <div class="container">
    
    <p v-if="!articles.length">No articles found.</p>
    
    <!-- Render the articles -->
    <ul v-else>
      <li v-for="article in articles" :key="article.id" :id="'article-' + article.id">
        <img 
          v-if="article.image?.meta?.download_url" 
          :src="article.image.meta.download_url" 
          :alt="article.article_title"
        >
        <div class="content">
          <h3>{{ article.article_title }}</h3>
        <div v-html="article.article_description" class="article-description"></div>
        <a v-if="article.pdf_file" :href="article.pdf_file" target="_blank" class="pdf-link">Read PDF</a>
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

.pdf-link {
  margin-top: auto;
  align-self: flex-start;
}

img {
  width: 30%;
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
</style>