import { ref } from "vue";
import { defineStore } from "pinia";

export const adorantenStore = defineStore("resources", () => {
const keyword = ref("keyword");

  return { 
    keyword, 
  };
});
