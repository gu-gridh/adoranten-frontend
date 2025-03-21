<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// access the current route
const route = useRoute()

const articles = ref([])
const issue = ref([])
const imageBaseUrl = 'https://shfa.dh.gu.se/wagtail'
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
})
</script>

<template>
  <div>

    <h3><a v-if="issue.pdf_file" 
   :href="issue.pdf_file" 
   target="_blank">Read full {{ issue.title }} PDF</a></h3>

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