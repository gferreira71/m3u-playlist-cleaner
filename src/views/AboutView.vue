<template>
  <div>
    <div>
      <span v-if="isLoading">L O A D I N G . . .</span>
      <div v-else>{{ parsedData }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParserService from './../services/ParserService';

export default defineComponent({
  data() {
    return {
      m3uContent: '',
      parsedData: '',
      isLoading: false
    };
  },
  created() {
    this.loadM3UFile();
  },
  methods: {
    async loadM3UFile() {
      const fileName = '/file_example.m3u'; // '/playlist_full.m3u';
      try {
        this.isLoading = true;
        const response = await fetch(fileName);
        this.m3uContent = await response.text();
        const parsedResult = this.parseM3UContent(this.m3uContent);
        console.log(parsedResult);
        this.parsedData = parsedResult;
      } catch (error) {
        console.error('Error loading the M3U file:', error);
      } finally {
        this.isLoading = false;
      }
    },
    parseM3UContent(content) {
      // Call the parsing function on the content
      return ParserService(content);
    }
  }
});
</script>

<style scoped>
</style>
