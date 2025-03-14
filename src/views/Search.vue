<script setup>
import { ref, onMounted, watch } from 'vue'

const description = ref('Loading...')
const searchTerm = ref('')
const results = ref([])

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

async function fetchResults(query) {
  if (!query) {
    results.value = []
    return
  }

  try {
    const url = `http://localhost:8000/api/v2/pages/?type=journal.IssuePage&search=${encodeURIComponent(query)}`
    const response = await fetch(url)
    console.log(response);
    if (!response.ok) {
      throw new Error('network response was not ok')
    }
    const data = await response.json()
    results.value = data.items || []
  } catch (error) {
    console.error('error fetching data:', error)
  }
}

watch(searchTerm, (newValue) => {
  fetchResults(newValue)
})
 </script>
 
 <template>
  <div>
    <input v-model="searchTerm" type="text" placeholder="Enter search term..." />

    <div v-if="results.length">
      <h2>Search Results:</h2>
      <div v-for="item in results" :key="item.id">
        <router-link :to="{ name: 'Issue', params: { id: item.id } }">
          {{ item.title }}
        </router-link>
      </div>
    </div>
    
    <div v-else>
      <p>No results found.</p>
    </div>
  </div>
</template>
