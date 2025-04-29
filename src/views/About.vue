<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import backButton from '/src/assets/back-button.svg'
import { useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const PAGE_ENDPOINT = 'https://shfa.dh.gu.se/wagtail/api/v2/pages/?type=home.FormPage&fields=*'
const SUBMIT_ENDPOINT = `https://shfa.dh.gu.se/wagtail/api/v2/form-submit/310/`

const form = reactive({ firstName: '', email: '', message: '' })
const formType = ref('contact') //contact or submit
const ctaText = ref('Send')
const thankYouText = ref('Thanks for your submission.')

function goBack() {
  if (window.history.length > 2) {
    history.back()
  } else {
    router.push({name: 'Home' })
  }
}

async function fetchFormData() {
  try {
    const res = await fetch(PAGE_ENDPOINT)
    const data = await res.json()
    const page = data.items?.[0]
    if (!page) return

    const choicesField = page.form_fields.find(f => f.clean_name === 'type_of_request')
    const [contactLabel = 'Contact us', submitLabel = 'Submit an article'] =
      (choicesField?.choices || '').split(/\r?\n/)

    ctaText.value = formType.value === 'submit' ? submitLabel : contactLabel

    thankYouText.value = page.thank_you_text.replace(/<[^>]+>/g, '').trim()
  } catch (err) {
    console.error(err)
  }
}

function updateFormType(path) {
  formType.value = path.endsWith('/submit') ? 'submit' : 'contact'
  fetchFormData()
}

onMounted(() => updateFormType(route.fullPath))
watch(() => route.fullPath, updateFormType)

async function handleSubmit() {
  const payload = {
    name: [form.firstName.trim()],
    mail: form.email.trim(),
    type_of_request: formType.value === 'submit' ? 'Submit an article' : 'Contact us',
    message: [form.message.trim()],
  }

  try {
    const res = await fetch(SUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`HTTP ${res.status} – ${txt}`)
    }

    toast.success(thankYouText.value, { position: 'top-right', timeout: 3000 })
    form.firstName = form.email = form.message = ''
  } catch (err) {
    toast.error('Something went wrong — please try again.', { position: 'top-right', timeout: 4000 })
  }
}
</script>

<template>
    <div class="header-wrapper">
      <img :src="backButton" alt="Back" class="back-button" @click="goBack" />
      <p v-html="description"></p>
    </div>

  <div class="contact-form">
    <h2>{{ formType === 'submit' ? 'Submit' : 'Contact' }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group-name">
        <div>
          <label for="firstName">Name</label>
          <input id="firstName" v-model="form.firstName" required />
        </div>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" v-model="form.email" required />
      </div>

      <div class="form-group">
        <label for="message">Your Message</label>
        <textarea id="message" v-model="form.message" required></textarea>
      </div>

      <button type="submit">{{ ctaText }}</button>
    </form>
  </div>
</template>

<style scoped>
.contact-form {
  max-width: 400px;
  margin: 40px auto;
  padding: 15px;
}

.form-group-name {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group-name div {
  flex: 1;
}

.form-group {
  margin-bottom: 10px;
}

input,
textarea {
  width: 100%;
  padding: 6px;
  border: 1px solid var(--theme-5);
  border-radius: 3px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

textarea {
  min-height: 100px;
  resize: none;
}

button {
  width: 100%;
  padding: 10px;
  background: var(--theme-1);
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background: var(--theme-3);
}

.header-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button {
  position: absolute;
  left: 25px;
  width: 30px;
  height: 30px;
  cursor: pointer;
}
</style>