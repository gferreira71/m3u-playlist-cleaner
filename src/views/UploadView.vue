<template>
  <div class="upload-view">
    <div class="uplaod-block-container">
      <div class="upload-block"
        v-if="!isUploading">
        <div class="upload-bold-label">
          Drag and drop a file here
        </div>
        <div>OR</div>
        <div class="upload-bold-label">
          Select a file to start the upload
        </div>
        <FileUpload
          :chooseLabel="$t('upload.select_file')"
          :customUpload="true"
          :auto="true"
          :multiple="false"
          mode="basic"
          @uploader="fileUploader($event)" />
      </div>

      <div v-else
        class="upload-infos">
        <h2>
          Upload file status
        </h2>
        <div v-if="!uploadingDone">
          <div class="upload-infos-reading">
            <progress :value="fileReadingProgress" max="100"></progress>
            <span>File Reading Progress: {{ fileReadingProgress }}%</span>
          </div>
          <div class="upload-infos-parsing">
            <progress :value="parsingProgress" max="100"></progress>
            <span>Parsing Progress: {{ parsingProgress }}%</span>
          </div>
        </div>
        <div v-else>
          <h2>
            Upload finished
          </h2>
        </div>
      </div>
    </div>

    <div v-if="parsedData" class="upload-results">
      <SelectionComponent
        :parsedData="parsedData"
        ></SelectionComponent>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParserService from './../services/ParserService';
import type { FileUploadUploaderEvent } from "primevue/fileupload";
import SelectionComponent from './components/SelectionComponent.vue';

export enum ProcessStateEnum {
  READING = 'READING',
  PARSING = 'PARSING'
}

export default defineComponent({
    components: { SelectionComponent },
    data() {
        return {
            isUploading: false,
            uploadingDone: false,
            parsedData: null as any,
            fileReadingProgress: 0,
            parsingProgress: 0,
        };
    },
    created() { },
    methods: {
        fileUploader(event: FileUploadUploaderEvent) {
            if (!event?.files)
              return;
            const uploadedFile: File = (event.files as File[])[0];
            const fileName: string = uploadedFile.name;
    
            if (fileName.toLowerCase().endsWith('.m3u') || fileName.toLowerCase().endsWith('.m3u8')) {
              this.handleFileChange(uploadedFile);
            } else {
              // TODO:handle the error
              console.log('Please upload a file with .m3u or .m3u8 extension.');
            }
        },
        async handleFileChange(file: File) {
            this.isUploading = true;
            this.fileReadingProgress = 0;
            this.parsingProgress = 0;
            if (file) {
                const parsedContent = await ParserService.parseM3UFile(file, (progress: number, state: ProcessStateEnum) => {
                    if (state === ProcessStateEnum.READING) {
                        this.fileReadingProgress = progress;
                    }
                    else if (state === ProcessStateEnum.PARSING) {
                        this.parsingProgress = progress;
                    }
                });
                console.log('parsedContent', parsedContent);
                this.uploadingDone = true;
                this.parsedData = parsedContent;
                // this.redirectToSelectionView();
            }
        },
        redirectToSelectionView() {
            setTimeout(() => {
                this.$router.push('/selection');
            }, 2000);
        }
    },
});
</script>

<style lang="scss" scoped>
.upload-view {
  .uplaod-block-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .upload-block {
    margin: 24px 0;
    background: var(--surface-200);
    height: 200px;
    width: 400px;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    flex-direction: column;
    .upload-bold-label {
      font-weight: bold;
    }
  }

  .upload-infos {
    margin: 24px 0;
    background: var(--surface-200);
    height: 158px;
    width: 400px;
    display: flex;
    align-items: center;
    flex-direction: column;
    .upload-infos-reading,
    .upload-infos-parsing {
      width: 100%;
    }
  }

  .upload-results {
    padding: 0 24px;
    padding-bottom: 24px;
  }
}
</style>
