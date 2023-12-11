<template>
  <div class="download-playlist container">
    <h2>Download new playlist</h2>

    <div class="col-12 grid">

      <div class="col-4">
        <div class="field">
          <label for="filename">New file name</label>
          <InputText
            type="text"
            id="filename"
            v-model="downloadFileName"/>
            <span class="filename_extension">.m3u</span>
        </div>
      </div>

    </div>

    <div class="col-12 grid">
      <div class="col-6">
        <div class="field">
          <Button
            :label="$t('selection.download_button')"
            icon="pi pi-download"
            :disabled="downloadButtonDisabled"
            @click="downloadResults()"/>
          </div>
      </div>
    </div>

  </div>
</template>
    
<script lang="ts">
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
import { recordsStore } from '../../stores/recordsStore';

export default defineComponent({
  data() {
    return {
      downloadFileName: 'cleaned_playlist'
    };
  },
  computed: {
    ...mapState(recordsStore, ['selectedGroupRecords']),

    downloadButtonDisabled(): boolean {
      return (this.selectedGroupRecords?.length === 0) || !this.downloadFileName;
    }
  },
  created() { },
  methods: {
    downloadResults() {
      recordsStore()?.downloadPlaylist(this.downloadFileName.trim());
    }
  },
});
</script>

<style lang="scss" scoped>
.p-inputtext {
  width: calc(100% - 50px) !important;
  margin-right: 6px;
}
.filename_extension {
  font-weight: 700;
}
</style>