<template>
  <div class="cleaner-view">
    <!-- 1- Selecting source -->
    <SourceComponent></SourceComponent>
    <!-- 2- Select records -->
    <ResultsComponent></ResultsComponent>
    <!-- 3- Download final playlist -->
    <DownloadPlaylistComponent></DownloadPlaylistComponent>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SourceComponent from "./../components/source/SourceComponent.vue";
import ResultsComponent from "./../components/results/ResultsComponent.vue";
import DownloadPlaylistComponent from "./../components/export/DownloadPlaylistComponent.vue";
import { recordsStore } from "@/stores/recordsStore";

export default defineComponent({
  components: {
    SourceComponent,
    ResultsComponent,
    DownloadPlaylistComponent,
  },
  data() {
    return {};
  },
  computed: {},
  created() {},
  mounted() {
    recordsStore()?.setViewLoaded(true);
  },
  methods: {},
});
</script>
