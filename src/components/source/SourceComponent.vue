<template>
  <div class="source-component container">
    <h2>{{ $t('source.source_file') }}</h2>
    <div v-if="!source">
      <div class="upload-section">
        <FileUpload
          :chooseLabel="$t('source.select_file')"
          :customUpload="true"
          :auto="true"
          :multiple="false"
          mode="basic"
          @uploader="fileUploader($event)" />
        <Button
          :label="$t('source.demo_file')"
          class="demo-button"
          @click="uploadDemoFile()" />
      </div>
    </div>

    <div v-else
      class="source-infos">
      <div class="current-source">
        <span class="current-file-label">
          {{ $t('source.file_uploaded') }}</span> : {{ source.fileName }}
      </div>
      <div v-if="progressStatus && isOnProcessing"
        class="process-progress">
        <div v-if="progressStatus.downloadProgress"
          class="progress-row">
          <span id="download_status">
            {{ $t('source.download_progress', {progress: progressStatus.downloadProgressStatus?.valueOf()}) }}
          </span>
          <ProgressBar
            :value="progressStatus.downloadProgress"
            aria-labelledby="download_status" />
        </div>
        <div v-if="progressStatus.uploadProgress"
          class="progress-row">
          <span id="upload_status">
            {{ $t('source.upload_progress', {progress: progressStatus.uploadProgressStatus?.valueOf()}) }}
          </span>
          <ProgressBar
            :value="progressStatus.uploadProgress"
            aria-labelledby="upload_status" />
        </div>
        <div v-if="progressStatus.parseProgress"
          class="progress-row">
          <span id="parse_status">
            {{ $t('source.parsing_progress', {progress: progressStatus.parseProgressStatus?.valueOf()}) }}
          </span>
          <ProgressBar
            :value="progressStatus.parseProgress"
            aria-labelledby="parse_status" />
        </div>
      </div>

      <div v-if="!isOnProcessing"
        class="processing-result">
        <table class="processing-results-table">
          <tr>
            <th>
              {{ $t('source.parsing_result.records_count') }}
            </th>
            <td>
              {{ records?.length }}
            </td>
          </tr>
          <tr>
            <th>
              {{ $t('source.parsing_result.media_count') }}
            </th>
            <td>
              {{ liveRecordsCount }}
            </td>
          </tr>
          <tr>
            <th>
              {{ $t('source.parsing_result.live_count') }}
            </th>
            <td>
              {{ mediaRecordsCount }}
            </td>
          </tr>
          <tr>
            <th>
              {{ $t('source.parsing_result.vod_count') }}
            </th>
            <td>
              {{ vodRecordsCount }}
            </td>
          </tr>
        </table>
      </div>

      <div>
        <Button
          :label="$t('source.btn_clear_source')"
          @click="clearSource()"></Button>
      </div>
    </div>
  </div>
</template>
  
<script lang="ts">
import { mapState } from "pinia";
import type { FileUploadUploaderEvent } from "primevue/fileupload";
import { defineComponent } from 'vue';
import { type Source, SourceTypeEnum } from "../../types/SourcesTypes";
import { recordsStore } from './../../stores/recordsStore';
import ParserService from "@/services/ParserService";
import { RecordTypeEnum } from "@/types/RecordsTypes";

export default defineComponent({
  data() {
      return { }
  },
  computed: {
    ...mapState(recordsStore,
      ['source',
      'progressStatus',
      'groupedRecords',
      'records',
      'isOnProcessing']),

    liveRecordsCount(): number {
      return this.records?.filter(record => record.type === RecordTypeEnum.LIVE).length;
    },
    mediaRecordsCount(): number {
      return this.records?.filter(record => record.type === RecordTypeEnum.MEDIA).length;
    },
    vodRecordsCount(): number {
      return this.records?.filter(record => record.type === RecordTypeEnum.VOD).length;
    }
  },
  created() {},
  methods: {
    fileUploader(event: FileUploadUploaderEvent) {
      if (!event?.files)
        return;
      const uploadedFile: File = (event.files as File[])[0];
      const fileName: string = uploadedFile.name;

      if (fileName.toLowerCase().endsWith('.m3u') || fileName.toLowerCase().endsWith('.m3u8')) {
        // call the store and dispatch the new source
        // this.handleFileChange(uploadedFile);
        const fileSource: Source = {
          type: SourceTypeEnum.UPLOADFILE,
          fileName: fileName,
          value: uploadedFile
        };
        recordsStore()?.changeSource(fileSource);
      } else {
        // TODO:handle the error
        console.log('Please upload a file with .m3u or .m3u8 extension.');
      }
    },

    uploadDemoFile() {
      const demoFileName = 'file_example.m3u';
      ParserService.getDemoFile(demoFileName)
      .then((file) => {
        const demoSource: Source = {
          type: SourceTypeEnum.DEMO,
          fileName: demoFileName,
          value: file
        };
      recordsStore()?.changeSource(demoSource);
      })
      .catch((error) => {
        console.error(error);
      });
    },

    clearSource() {
      recordsStore()?.clearSource();
    }
  }
});
</script>

<style lang="scss" scoped>
.source-component {
  padding-top: 24px;

  .upload-section {
    display: inline-flex;
    .demo-button {
      margin-left: 8px;
    }
  }

  .source-infos {
    background: white;
    padding: 18px;
    border: 1px solid lightgrey;
    border-radius: 4px;
  }

  .current-file-label {
    font-weight: 600;
  }

  .progress-row {
    padding: 6px 0px;
  }

  .process-progress {
    padding: 18px 0;
  }

  .processing-results-table {
    th {
      font-weight: 500;
      text-align: left;
      width: 300px;
    }
  }

  .processing-result {
    padding: 12px 4px;
  }
}
</style>