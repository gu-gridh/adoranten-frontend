<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// access the current route
const route = useRoute()

const articles = ref([])
const imageBaseUrl = 'http://127.0.0.1:8000'

onMounted(async () => {
  //fetch issue article data
  try {
    // get the issue ID from the URL params
    const issueId = route.params.id

    const response = await fetch(`http://127.0.0.1:8000/api/v2/pages/?type=journal.ArticlePage&child_of=${issueId}&fields=*`)
    const data = await response.json()
    if (data.items && data.items.length > 0) {
        articles.value = data.items
  } else {
        articles.value = []
  }
  } catch (error) {
    console.error('error fetching articles:', error)
  }
})
</script>

<template>
  <div>
    <h2>Articles</h2>
    
    <p v-if="!articles.length">No articles found.</p>
    
    <!-- Render the articles -->
    <ul v-else>
      <li v-for="article in articles" :key="article.id">
        <img 
          v-if="article.image?.meta?.download_url" 
          :src="imageBaseUrl + article.image.meta.download_url" 
          :alt="article.article_title"
        >
        <h3>{{ article.article_title }}</h3>
        <div v-html="article.article_description" class="article-description"></div>
        <a v-if="article.pdf_file" :href="article.pdf_file" target="_blank">Read PDF</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  text-align: center;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

img {
  max-width: 50%;
}

.article-description {
  margin: 1rem 0;
  line-height: 1.6;
  max-width: 800px;
  font-size: 1rem;
  color: #333;
  text-align: left;
  width: 100%;
}
</style>