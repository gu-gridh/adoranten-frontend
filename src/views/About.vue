<script>
  import { useToast } from 'vue-toastification';
  
  export default {
    name: "ContactForm",
    setup() {
      const toast = useToast();
      return { toast };
    },
    data() {
      return {
        form: {
          firstName: "",
          lastName: "",
          email: "",
          message: "",
        },
      };
    },
    methods: {
      handleSubmit() {
        this.toast.success("Your message has been sent!", {
          position: "top-right",
          timeout: 3000,
        });
  
        // Reset form
        this.form = { firstName: "", lastName: "", email: "", message: "" };
      },
    },
  };
  </script>
  
  <template>
    <div class="contact-form">
      <h2>Contact Us</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group-name">
        <div>
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" v-model="form.firstName" required />
        </div>
        <div>
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" v-model="form.lastName" required />
        </div>
      </div>
  
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" required />
        </div>
  
        <div class="form-group">
          <label for="message">Your Message</label>
          <textarea id="message" v-model="form.message" required></textarea>
        </div>
  
        <button type="submit">Send Message</button>
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

input, textarea {
width: 100%;
padding: 6px;
border: 1px solid #ccc;
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
font-family: system-ui, Helvetica, Arial, sans-serif;;
}

button:hover {
background: #8a8a8a;
}
</style>

