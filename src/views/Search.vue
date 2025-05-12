<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import articleIcon from '/src/assets/article.png'
import issueIcon from '/src/assets/issue.png'
import { adorantenStore } from '/src/stores/store.js'
import backButton from '/src/assets/back-button.svg'
import { useRouter } from 'vue-router'

const router = useRouter()
const description = ref('Loading...')
const searchTerm = ref('')
const allArticles = ref([]) // holds the full list of articles fetched on mount
const results = ref([]) // filtered results that we display
const baseURL = 'https://shfa.dh.gu.se/wagtail/api/v2/pages/?type='
const useLazyLoading = ref(false) // toggle between eager and lazy loading implementations

const store = adorantenStore()

function goBack() {
  const { back } = router.options.history.state || {}
  back ? router.back() : router.push({ name: 'Home' })
}

const mapArticle = a => ({
  id: a.id,
  title: a.title,
  isArticle: true,
  issueId: a.issue_id,
})

async function fetchAll(type, fields = '') { //loops through all pages using offset
  const limit = 200
  let offset = 0
  const out = []

  while (true) {
    const url = `${baseURL}${type}&limit=${limit}&offset=${offset}${fields}`
    console.log(url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`fetch failed`)

    const json = await res.json()
    out.push(...json.items)

    if (json.items.length < limit) break
    offset += limit
  }
  return out
}

onMounted(async () => {
  const start = performance.now()

  try {
    const responseSearch = await fetch(`${baseURL}home.SearchPage&fields=description`)
    const dataSearch = await responseSearch.json()

    if (dataSearch.items && dataSearch.items.length > 0) {
      description.value = dataSearch.items[0].description
    } else {
      description.value = 'No search page content found'
    }
  } catch (error) {
    console.error(error)
    description.value = 'error loading search page content'
  }

  if (!useLazyLoading.value) {
    //fetch all issues
    try {
      const [issues, articles] = await Promise.all([
        fetchAll('journal.IssuePage'),
        fetchAll('journal.ArticlePage', '&fields=issue_id')
      ])

      allArticles.value = [
        ...issues,
        ...articles.map(mapArticle)
      ]

      //combine issues and processed articles
      allArticles.value = [...allArticles.value, ...articlesData.items.map(mapArticle)]

      const end = performance.now();
      console.log(`Eager load initial rendering took ${(end - start).toFixed(2)} ms`);
    } catch (error) {
      console.error(error)
    }
  } else {
    const end = performance.now()
    console.log(`Lazy load initial rendering took ${(end - start).toFixed(2)} ms`)
  }
})

onUnmounted(() => {
  store.keyword = '';
});

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
      const query = encodeURIComponent(newValue)
      const searchIssues = fetchAll(`journal.IssuePage&search=${query}`)
      const searchArticles = fetchAll(`journal.ArticlePage&fields=issue_id&search=${query}`)

      results.value = [
        ...await searchIssues,
        ... (await searchArticles).map(mapArticle)
      ]

      const end = performance.now()
      console.log(`Lazy load search took ${(end - start).toFixed(2)} ms`)
    } catch (error) {
      console.error(error)
      results.value = []
    }
  } else {
    // Use original eager loading implementation, with added performance check
    if (!newValue) {
      results.value = [];
      store.keyword = '';
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

watch(() => store.keyword, async newKeyword => {
  if (!newKeyword || newKeyword === 'keyword') {
    searchTerm.value = ''
    results.value = []
    return
  }
  searchTerm.value = newKeyword
  const tagURL = `https://shfa.dh.gu.se/wagtail/api/v2/articles/?tag=${encodeURIComponent(newKeyword)}`
  try {
    const response = await fetch(tagURL)
    if (!response.ok) throw new Error('bad connection')

    const json = await response.json()
    const raw = Array.isArray(json) ? json : (json.items || [])

    results.value = raw.map(mapArticle)

  } catch (err) {
    console.error(err)
    results.value = []
  }
}, { immediate: true })
</script>

<template>
  <div class="header-wrapper">
    <img :src="backButton" alt="Back" class="back-button" @click="goBack" />
    <p v-html="description"></p>
  </div>

  <div class="search-container">
    <input v-model="searchTerm" type="text" placeholder="Search for issues and articles..." class="search-input" />

    <div v-if="results.length" class="search-results">
      <div v-for="item in results" :key="item.id" class="search-item">
        <img v-if="!item.isArticle" :src="issueIcon" alt="Issue Icon" class="search-icon" />
        <img v-else :src="articleIcon" alt="Article Icon" class="search-icon" />
        <!-- For normal issues -->
        <router-link v-if="!item.isArticle" :to="{ name: 'Issue', params: { id: item.id } }">
          {{ item.title }}
        </router-link>
        <!-- For articles -->
        <router-link v-else-if="item.issueId" class="search-link" :to="{
          name: 'Issue',
          params: { id: item.issueId },
          hash: '#article-' + item.id
        }">
          {{ item.title }} (Article)
        </router-link>
      </div>
    </div>

  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  width: 50%;
  margin: 0 auto;
  box-sizing: border-box;
}

.search-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 0;
  border: 1px solid var(--theme-5);
  border-radius: 4px;
  font-size: 1.4em;
  box-sizing: border-box;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  box-sizing: border-box;
  border: 1px solid var(--theme-5);
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 999;
  margin-top: 2px;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid var(--theme-7);
}

.search-icon {
  width: 24px;
  height: auto;
  margin-right: 8px;
}

.search-item:hover {
  background-color: #e2e2e2;
}

.header-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-link {
  display: flex;
  align-items: flex-start;
  text-align: left;
  text-decoration: none;
  width: 100%;
}
</style>
