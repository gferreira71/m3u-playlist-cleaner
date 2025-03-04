<template>
  <div class="download-playlist container">
    <form @submit.prevent="downloadResults()">
      <h2>{{ $t("download_playlist.download_new_playlist") }}</h2>
      <div class="col-12 grid">
        <div class="col-12 lg:col-4 md:col-5 sm:col-6">
          <div class="field">
            <label for="filename">
              {{ $t("download_playlist.new_file_name") }}
            </label>
            <InputText type="text" id="filename" v-model="downloadFileName" />
            <span class="filename_extension">.m3u</span>
          </div>
        </div>
      </div>

      <div class="col-12 grid">
        <div class="col-12 lg:col-4 md:col-5 sm:col-6">
          <div class="field">
            <Button
              :label="$t('download_playlist.download_button')"
              icon="pi pi-download"
              class="button-full-width"
              type="submit"
              :disabled="downloadButtonDisabled"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { recordsStore } from "../../stores/recordsStore";

export default defineComponent({
  data() {
    return {
      downloadFileName: "cleaned_playlist",
    };
  },
  computed: {
    ...mapState(recordsStore, ["selectedGroupRecords"]),

    downloadButtonDisabled(): boolean {
      return (
        this.selectedGroupRecords?.length === 0 || !this.downloadFileName.trim()
      );
    },
  },
  created() {},
  methods: {
    downloadResults() {
      recordsStore()?.downloadPlaylist(this.downloadFileName.trim());
    },
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
