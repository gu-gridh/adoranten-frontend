<script setup>
import { ref, onMounted } from 'vue'

const description = ref('Loading...')
const issues = ref([])
const imageBaseUrl = 'http://127.0.0.1:8000'

onMounted(async () => {
  //fetch home page data
  try {
    const responseHome = await fetch('http://127.0.0.1:8000/api/v2/pages/?type=home.HomePage&fields=description')
    const dataHome = await responseHome.json()
    if (dataHome.items && dataHome.items.length > 0) {
      description.value = dataHome.items[0].description
    } else {
      description.value = 'No home page content found'
    }
  } catch (error) {
    console.error('error fetching home page data:', error)
    description.value = 'error loading home page content'
  }

  //fetch issues data
  try {
    const responseIssues = await fetch('http://127.0.0.1:8000/api/v2/pages/?type=journal.IssuePage&fields=issue_name,issue_year,cover_image,pdf_file')
    const dataIssues = await responseIssues.json()
    if (dataIssues.items && dataIssues.items.length > 0) {
      issues.value = dataIssues.items
    } else {
      issues.value = []
    }
  } catch (error) {
    console.error('error fetching issues data:', error)
  }
})
</script>

<template>
  <div>
    <!-- render the home page description -->
    <div v-html="description"></div>
    
    <!-- render the list of issues -->
    <div v-if="issues.length">
      <h2>Issues</h2>
      <ul>
        <li v-for="issue in issues" :key="issue.id">
          <h3>{{ issue.issue_name }} ({{ issue.issue_year }})</h3>
          <img 
            v-if="issue.cover_image && issue.cover_image.meta && issue.cover_image.meta.download_url" 
            :src="imageBaseUrl + issue.cover_image.meta.download_url" 
            alt="Issue Cover"
          >
          <p v-if="issue.pdf_file">
            <a :href="issue.pdf_file" target="_blank">Download PDF</a>
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 20px;
}

img {
  max-width: 200px;
  display: block;
  margin-bottom: 10px;
}
</style>
