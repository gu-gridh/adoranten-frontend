<script setup>
import { ref, onMounted } from 'vue'
import 'vue3-carousel/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import linkArrow from '/src/assets/link-arrow.png'
import hamburger from '/src/assets/menu.png'
import Overlay from '/src/views/Overlay.vue'
import { useRouter } from 'vue-router';

const description = ref('Loading...')
const issues = ref([])
const showOverlay = ref(false)
const articles = ref([])
const router = useRouter();

const carouselConfig = {
  itemsToShow: 2.5,
  wrapAround: true,
}

const toggleOverlay = () => {
  showOverlay.value = !showOverlay.value
}

const navigateToArticle = (article) => {
  if (article.issueId) {
    router.push({ 
      name: 'Issue', 
      params: { id: article.issueId },
      hash: `#article-${article.id}`
    });
  }
}

onMounted(async () => {
  try {
    // Fetch both home page and issues data
    const [responseHome, responseIssues] = await Promise.all([
      fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=home.HomePage&fields=*'),
      fetch('https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=journal.IssuePage&fields=*')
    ]);
    
    const dataHome = await responseHome.json();
    const dataIssues = await responseIssues.json();
    
    // Set description and issues data
    if (dataHome.items && dataHome.items.length > 0) {
      description.value = dataHome.items[0].description;
    }
    
    if (dataIssues.items && dataIssues.items.length > 0) {
      issues.value = dataIssues.items;
    }
    
    // Get articles
    if (dataHome.items && dataHome.items.length > 0 && dataHome.items[0].article_highlights) {
      const articleList = dataHome.items[0].article_highlights[1];
      if (articleList && articleList.type === 'article_list' && articleList.value) {
        // Get basic article data
        const basicArticles = articleList.value;
        
        // Fetch detailed article data to get URLs for linking
        const articlePromises = basicArticles.map(article => 
          fetch(`https://shfa.dh.gu.se/wagtail/api/v2/pages/${article.id}/`)
            .then(res => res.json())
        );
        
        // Process articles with the detailed data
        Promise.all(articlePromises).then(articleDetails => {
          articles.value = basicArticles.map((article, index) => {
            const meta = articleDetails[index].meta;
            const articleUrl = meta?.html_url || '';
            let issueId = null;
            
            if (articleUrl) {
              const urlParts = articleUrl.split('/');
              const publicationsIndex = urlParts.indexOf('publications');
              
              if (publicationsIndex !== -1 && urlParts.length > publicationsIndex + 1) {
                const issueSlug = urlParts[publicationsIndex + 1];
                const matchingIssue = issues.value.find(
                  item => item.meta && item.meta.slug === issueSlug
                );
                
                if (matchingIssue) {
                  issueId = matchingIssue.id;
                }
              }
            }
            
            return {
              ...article,
              issueId
            };
          });
        });
      }
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    description.value = 'error loading content';
  }
})
</script>

<template>
  <div id="home-container">
    <!-- render the home page description -->
    <div v-html="description"></div>

    <!-- Render the carousel -->
    <div v-if="issues.length" class="carousel-container">
      <button class="toggle-overlay-btn" @click="toggleOverlay">
        <img :src="hamburger" alt="Menu" class="hamburger-icon" />
      </button>
      <h2>Issues</h2>
      <Carousel v-bind="carouselConfig">
        <Slide v-for="issue in issues" :key="issue.id">
          <div class="carousel__item">
            <div class="image-container">
              <img v-if="issue.image && issue.image.meta && issue.image.meta.download_url"
                :src="issue.image.meta.download_url" alt="Issue Cover" />
              <router-link :to="{ name: 'Issue', params: { id: issue.id } }">
                <button class="view-button">
                  <span>View Issue</span>
                  <img :src="linkArrow" alt="Arrow Icon" class="arrow-icon" />
                </button>
              </router-link>
            </div>
            <h3>{{ issue.issue_name }} ({{ issue.issue_year }})</h3>
          </div>
        </Slide>
        <template #addons>
          <Navigation />
          <Pagination />
        </template>
      </Carousel>
    </div>
    <div v-else>
      <p>No issues found</p>
    </div>

      <!-- Articles Display -->
      <div v-if="articles.length" class="articles-container">
      <h2>Selected Articles</h2>
      <div class="articles-grid">
        <div v-for="article in articles" :key="article.id" 
            class="article-card" 
            @click="navigateToArticle(article)"
            :style="article.issueId ? 'cursor: pointer' : ''">
            <img v-if="article.image && article.image.file" 
              :src="article.image.file" 
              :alt="article.title"
              class="article-image" />
            <h3 class="article-title">{{ article.title }}</h3>
        </div>
      </div>
    </div>

    <Overlay :show="showOverlay" :issues="issues" @close="toggleOverlay" />
  </div>
</template>

<style scoped>
.articles-container {
  background-color: var(--theme-1);
  padding: 20px;
  margin-top: 20px;
  margin-bottom: 20px;
  border-radius: 8px;
  text-align: left;
}

.articles-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  justify-content: space-between;
}

.article-card {
  min-width: 200px;
  text-align: left;
}

.article-card:hover {
  transform: scale(1.03);
  transition: transform 0.3s ease;
}

.article-image {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 5px;
}

.article-title {
  margin-top: 10px;
  font-size: 1rem;
}

h2, h3 {
  color: white;
}

#home-container {
  margin: 0 10%;
}

.carousel-container {
  background-color: var(--theme-1);
  position: relative;
  padding: 20px;
  margin-top: 20px;
  border-radius: 8px;
}

.toggle-overlay-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  z-index: 999;
}

.carousel__item {
  text-align: center;
  position: relative;
}

img {
  width: 80%;
  height: auto;
  border-radius: 5px;
  transition: transform 0.3s ease-in-out;
}

.image-container:hover img {
  transform: scale(1.05);
}

.view-button {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--theme-2);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

.hamburger-icon {
  width: 40px;
  height: 40px;
}

.image-container:hover .view-button {
  opacity: 1;
}

.carousel__slide {
  width: 30% !important;
  margin: 0 5%; /* top no margin, left and right 5% */
}

.carousel {
  --vc-pgn-background-color: rgba(255, 255, 255, 0.7);
  --vc-pgn-active-color: rgba(255, 255, 255, 1);
  --vc-nav-background: rgba(255, 255, 255, 0.7);
  --vc-nav-border-radius: 100%;
}

::v-deep(.carousel__pagination-button--active) { /*override the active button color for carousel*/
  background-color: #b02b27 !important;
}
</style>
