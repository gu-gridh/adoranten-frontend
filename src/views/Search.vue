<script setup>

import { ref, onMounted } from 'vue'

const description = ref('Loading...')

onMounted(async () => {
  //fetch search page data
  try {
    const responseSearch = await fetch('http://127.0.0.1:8000/api/v2/pages/?type=home.SearchPage&fields=description')
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
})
 </script>
 
 <template>
 Hi, let's search.
     <!-- render the search page description -->
     <div v-html="description"></div>
 </template>