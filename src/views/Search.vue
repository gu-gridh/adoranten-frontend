<script setup>
import { ref, onMounted, watch } from 'vue'

const description = ref('Loading...')
const searchTerm = ref('')
const allArticles = ref([]) //holds the full list of articles fetched on mount
const results = ref([]) //filtered results that we display
const useLazyLoading = ref(false) // toggle between eager and lazy loading implementations

// function for processing articles to match the structure needed for display
const processArticles = (articlesData, allArticles) => {
  return articlesData.items.map(article => {
    const articleUrl = article.meta?.html_url || '';
    let issueId = null;

    // try to find issue ID by matching with known issues
    if (articleUrl) {
      // extract issue slug from article URL
      const urlParts = articleUrl.split('/');
      const publicationsIndex = urlParts.indexOf('publications');

      if (publicationsIndex !== -1 && urlParts.length > publicationsIndex + 1) {
        const issueSlug = urlParts[publicationsIndex + 1];

        // look for matching issue by slug
        const matchingIssue = allArticles.find(
          item => !item.isArticle && item.meta.slug === issueSlug
        );

        if (matchingIssue) {
          issueId = matchingIssue.id;
        }
      }
    }

    return {
      id: article.id,
      title: article.title,
      isArticle: true,
      meta: article.meta,
      articleUrl: articleUrl,
      issueId: issueId
    };
  });
};

onMounted(async () => {
  const start = performance.now()

  try {
    const responseSearch = await fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=home.SearchPage&fields=description')
    const dataSearch = await responseSearch.json()

    if (dataSearch.items && dataSearch.items.length > 0) {
      description.value = dataSearch.items[0].description
    } else {
      description.value = 'No search page content found'
    }
  } catch (error) {
    console.error('error fetching search page data:', error)
    description.value = 'error loading search page content'
  }


  if (!useLazyLoading.value) {

    //fetch all issues
    try {
      const response = await fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.IssuePage')
      if (!response.ok) {
        throw new Error('network response was not ok')
      }
      const data = await response.json()

      //store in all articles
      allArticles.value = data.items || []

      // fetch all articles
      const articlesResponse = await fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.ArticlePage')
      if (!articlesResponse.ok) {
        throw new Error('network response was not ok')
      }
      const articlesData = await articlesResponse.json()

      // process articles to match the structure needed for display
      const processedArticles = processArticles(articlesData, allArticles.value)

      // add articles to all articles
      allArticles.value = [...allArticles.value, ...processedArticles]

      //results.value = allArticles.value

      const end = performance.now()
      console.log(`Eager load initial rendering took ${(end - start).toFixed(2)} ms`)

    } catch (error) {
      console.error('Error fetching IssuePages:', error)
    }
  } else {
    const end = performance.now()
    console.log(`Lazy load initial rendering took ${(end - start).toFixed(2)} ms`)
  }

})

//filter local articles array when searchTerm changes
watch(searchTerm, async (newValue) => {
  if (useLazyLoading.value) {
    // Lazy loading implementation
    const start = performance.now()

    if (!newValue || newValue.length < 2) {
      results.value = newValue ? [] : allArticles.value
      return
    }

    try {
      // Fetch issues
      const issuesResponse = await fetch(`https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.IssuePage&search=${encodeURIComponent(newValue)}`)
      const issuesData = await issuesResponse.json()

      // Fetch articles
      const articlesResponse = await fetch(`https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.ArticlePage&search=${encodeURIComponent(newValue)}`)
      const articlesData = await articlesResponse.json()

      // process articles to match the structure needed for display
      const processedArticles = processArticles(articlesData, allArticles.value)

      // Combine results
      results.value = [...issuesData.items, ...processedArticles]

      const end = performance.now()
      console.log(`Lazy load search took ${(end - start).toFixed(2)} ms`)
    } catch (error) {
      console.error('Error in lazy loading search:', error)
      results.value = []
    }
  } else {
    // Use original eager loading implementation, with added performance check
    if (!newValue) {
      results.value = [];
    } else {
      const start = performance.now()
      results.value = allArticles.value.filter(item => {
        // filter all items (both issues and articles) using the same title criteria
        return item.title.toLowerCase().includes(newValue.toLowerCase())
      })
      const end = performance.now()
      console.log(`Eager load filtering took ${(end - start).toFixed(2)} ms`)
    }
  }
})
</script>

<template>
  <div>
    <p v-html="description"></p>

    <input v-model="searchTerm" type="text" placeholder="Search for issues and articles..." class="search-input" />

    <div v-if="results.length">
      <div v-for="item in results" :key="item.id">
        <!-- For normal issues -->
        <router-link v-if="!item.isArticle" :to="{ name: 'Issue', params: { id: item.id } }">
          {{ item.title }}
        </router-link>

        <!-- For articles -->
        <router-link v-else-if="item.issueId"
          :to="{ name: 'Issue', params: { id: item.issueId }, hash: '#article-' + item.id }">
          {{ item.title }} (Article)
        </router-link>
      </div>
    </div>

    <div v-else>
      <p>No results found.</p>
    </div>
  </div>
</template>

<style scoped>
.search-input {
  width: 50%;
  padding: 8px;
  margin-bottom: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1.4em;
}
</style>
