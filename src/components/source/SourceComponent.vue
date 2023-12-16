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

      <div v-if="!isOnProcessing">
        <ProcessingResultComponent></ProcessingResultComponent>
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
import { type Error, ErrorTypeEnum } from "@/types/ErrorTypes";
import ProcessingResultComponent from './components/ProcessingResultComponent.vue';

export default defineComponent({
  components: {
    ProcessingResultComponent,
  },
  data() {
      return { }
  },
  computed: {
    ...mapState(recordsStore,
      ['source',
      'progressStatus',
      'groupedRecords',
      'records',
      'isOnProcessing',
      'errors',
      'warnings'
    ]),

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
      const fileSource: Source = {
        type: SourceTypeEnum.UPLOADFILE,
        fileName: fileName,
        value: uploadedFile
      };

      if (fileName.toLowerCase().endsWith('.m3u') || fileName.toLowerCase().endsWith('.m3u8')) {
        // call the store and dispatch the new source
        // this.handleFileChange(uploadedFile);
        recordsStore()?.changeSource(fileSource);
      } else {
        const error: Error = {
          type: ErrorTypeEnum.WRONG_FILE_EXTENSION,
        }
        recordsStore()?.changeSourceWithErrors(fileSource, error);
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
}
</style>