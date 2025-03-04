<template>
  <div class="source-component container">
    <h2>{{ $t("source.source_file") }}</h2>
    <div v-if="!source" class="source-form">
      <div class="col-12 grid flex-column">
        <h3>{{ $t("source.download_m3u_fil_from_url") }}</h3>

        <template v-if="checkServerDone">
          <template v-if="!isServerUp">
            <div class="col-12">
              <div class="alert alert-info">
                {{ $t("source.download_not_available") }}
              </div>
            </div>
          </template>

          <template v-else>
            <form @submit.prevent="loadSourceFromUrl(source_url)">
              <div class="col-12 grid">
                <div class="col-12 lg:col-7 md:col-8 sm:col-8">
                  <div class="field">
                    <label for="url_download">{{
                      $t("source.url_file_to_download")
                    }}</label>
                    <InputText
                      type="text"
                      id="url_download"
                      v-model="source_url"
                      @update:modelValue="clearDownloadUrlError()"
                      :disabled="isProcessing"
                      :class="{
                        'p-invalid': downloadUrlError,
                      }"
                    />
                  </div>
                </div>

                <div class="col-12 lg:col-3 md:col-4 sm:col-4">
                  <Button
                    class="button-full-width download-url-button"
                    :label="$t('source.download_url')"
                    type="submit"
                    :disabled="
                      !isFilenameValid || isProcessing || downloadUrlError
                    "
                    :loading="isProcessing"
                  />
                </div>

                <template v-if="favoriteUrls.length !== 0">
                  <div class="col-12">
                    <i class="favorite-icon pi pi-star-fill"></i>
                    <label for="url_favorite">{{
                      $t("source.favorite.favorite_urls")
                    }}</label>
                    <DataTable
                      class="favorite_table"
                      id="url_favorite"
                      :value="favoriteUrls"
                    >
                      <Column
                        field="name"
                        :header="$t('source.favorite_table.name')"
                      ></Column>
                      <Column :header="$t('source.favorite_table.url')">
                        <template #body="slotProps">
                          <div class="favorite-url-cell">
                            {{ slotProps.data.url }}
                          </div>
                        </template>
                      </Column>
                      <Column
                        style="width: 6rem"
                        field="records"
                        :header="$t('source.favorite_table.records')"
                      ></Column>
                      <Column
                        :header="$t('source.favorite_table.actions')"
                        frozen
                        alignFrozen="right"
                        style="width: 6rem"
                      >
                        <template #body="slotProps">
                          <div class="buttons-table">
                            <ConfirmPopup></ConfirmPopup>
                            <div
                              class="button-table"
                              :class="{ disabled: isProcessing }"
                              @click="
                                confirmRemoveFavorite(
                                  $event,
                                  slotProps.data.url
                                )
                              "
                            >
                              <div class="pi pi-trash"></div>
                            </div>
                            <div
                              class="button-table"
                              :class="{ disabled: isProcessing }"
                              @click="
                                loadSourceFromUrl(
                                  slotProps.data.url,
                                  slotProps.data.name
                                )
                              "
                            >
                              <div class="pi pi-download"></div>
                            </div>
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </div>
                </template>
              </div>
            </form>
          </template>
        </template>
        <template v-else>
          <LoadingComponent />
        </template>

        <div class="or-source-divider">
          <span class="or-source-label">
            {{ $t("source.divider_or") }}
          </span>
          <div class="divider"></div>
        </div>

        <h3>
          {{ $t("source.upload_m3u_file") }}
        </h3>

        <div class="col-12 grid">
          <div class="col-12 lg:col-4 md:col-5 sm:col-6">
            <FileUpload
              :chooseLabel="$t('source.select_file')"
              :customUpload="true"
              :auto="true"
              :multiple="false"
              mode="basic"
              class="button-full-width"
              :disabled="isProcessing"
              @uploader="fileUploader($event)"
            />
          </div>
          <div class="col-12 lg:col-3 md:col-4 sm:col-6">
            <Button
              :label="$t('source.demo_file')"
              class="button-full-width"
              :disabled="isProcessing"
              @click="uploadDemoFile()"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="source-infos">
      <div class="current-source">
        <template v-if="source.type === sourceTypeEnum.URL">
          <div>
            <span class="current-file-label">
              {{ $t("source.file_downloaded") }}</span
            >
            :
            {{ source.fileName }}
          </div>
          <div v-if="records.length !== 0" class="favorite-form">
            <i class="favorite-icon pi pi-star-fill"></i>
            <template
              v-if="
                favoriteUrls.find(
                  (favorite) => favorite.url === (source?.url as string)
                )
              "
            >
              <template v-if="sourceFavoriteName">
                {{ $t("source.favorite.url_already_favorite_1") }}
                <span class="source_favorite_name">{{
                  sourceFavoriteName
                }}</span>
                {{ $t("source.favorite.url_already_favorite_2") }}
              </template>
              <template v-else>
                {{ $t("source.favorite.url_already_favorite") }}
              </template>
              <div
                class="small_button remove_favorite_button"
                @click="removeFavorite(source.url as string)"
              >
                <i class="pi pi-times"></i>
                {{ $t("source.favorite.remove") }}
              </div>
            </template>
            <template v-else>
              <template v-if="!isAddFavoriteFormOpened">
                <div
                  class="small_button add_favorite_button"
                  @click="openAddFavoriteForm()"
                >
                  <i class="pi pi-plus"></i>
                  {{ $t("source.favorite.add_favorite") }}
                </div>
              </template>

              <template v-else>
                {{ $t("source.favorite.add_favorite") }}
                <div
                  class="small_button cancel_add_favorite_button"
                  @click="closeAddFavoriteForm()"
                >
                  <i class="pi pi-times"></i>
                  {{ $t("source.favorite.cancel") }}
                </div>
                <form
                  @submit.prevent="
                    addFavorite(source.url as string, records.length)
                  "
                >
                  <div class="col-12 grid">
                    <div class="lg:col-4 md:col-5 col-6 field">
                      <label for="favorite_name">{{
                        $t("source.favorite.favorite_name")
                      }}</label>
                      <InputText
                        type="text"
                        id="favorite_name"
                        v-model="favorite_name"
                      />
                    </div>
                    <div class="col-1 add-favorite-button">
                      <Button
                        icon="pi pi-plus"
                        type="submit"
                        :disabled="!isFavoriteValid"
                      />
                    </div>
                  </div>
                </form>
              </template>
            </template>
          </div>
        </template>
        <template v-else>
          <span class="current-file-label">
            {{ $t("source.file_uploaded") }}</span
          >
          :
          {{ source.fileName }}
        </template>
      </div>
      <div v-if="progressStatus && isOnProcessing" class="process-progress">
        <div v-if="progressStatus.downloadProgress" class="progress-row">
          <span id="download_status">
            {{
              $t("source.download_progress", {
                progress: $t(
                  "source.progress." +
                    progressStatus.downloadProgressStatus?.valueOf()
                ),
              })
            }}
          </span>
          <ProgressBar
            :value="progressStatus.downloadProgress"
            aria-labelledby="download_status"
          />
        </div>
        <div v-if="progressStatus.uploadProgress" class="progress-row">
          <span id="upload_status">
            {{
              $t("source.upload_progress", {
                progress: $t(
                  "source.progress." +
                    progressStatus.uploadProgressStatus?.valueOf()
                ),
              })
            }}
          </span>
          <ProgressBar
            :value="progressStatus.uploadProgress"
            aria-labelledby="upload_status"
          />
        </div>
        <div v-if="progressStatus.parseProgress" class="progress-row">
          <span id="parse_status">
            {{
              $t("source.parsing_progress", {
                progress: $t(
                  "source.progress." +
                    progressStatus.parseProgressStatus?.valueOf()
                ),
              })
            }}
          </span>
          <ProgressBar
            :value="progressStatus.parseProgress"
            aria-labelledby="parse_status"
          />
        </div>
      </div>

      <div v-if="!isOnProcessing">
        <ProcessingResultComponent></ProcessingResultComponent>
      </div>

      <div>
        <Button
          :label="$t('source.btn_clear_source')"
          @click="clearSource()"
        ></Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from "pinia";
import type { FavoriteUrl } from "@/types/FavoriteUrlTypes";
import type { FileUploadUploaderEvent } from "primevue/fileupload";
import { defineComponent } from "vue";
import { type Source, SourceTypeEnum } from "../../types/SourcesTypes";
import { recordsStore } from "./../../stores/recordsStore";
import ParserService from "@/services/ParserService";
import FileService from "@/services/FileService";
import FavoriteService from "@/services/FavoriteService";
import { type Error, ErrorTypeEnum } from "@/types/ErrorTypes";
import ProcessingResultComponent from "./components/ProcessingResultComponent.vue";
import LoadingComponent from "@/components/global/LoadingComponent.vue";
import { useConfirm } from "primevue/useconfirm";

export default defineComponent({
  components: {
    ProcessingResultComponent,
    LoadingComponent,
  },
  setup: () => ({
    confirm: useConfirm(),
  }),
  data() {
    return {
      source_url: "",
      favorite_name: "",
      sourceTypeEnum: SourceTypeEnum,
      isProcessing: false,
      downloadUrlError: false,
      favoriteUrls: [] as FavoriteUrl[],
      sourceFavoriteName: null as string | null,
      isAddFavoriteFormOpened: false,
      checkServerDone: false,
      isServerUp: false,
    };
  },
  computed: {
    ...mapState(recordsStore, [
      "source",
      "progressStatus",
      "groupedRecords",
      "records",
      "isOnProcessing",
      "errors",
      "warnings",
    ]),

    isFilenameValid(): boolean {
      if (!this.source_url?.trim()) {
        return false;
      }
      const fileName = this.source_url?.trim().toLowerCase();
      return (
        (fileName &&
          (fileName.startsWith("http://") ||
            fileName.startsWith("https://") ||
            fileName.startsWith("www."))) ||
        false
      );
    },
    isFavoriteValid(): boolean {
      return this.favorite_name.trim() !== "";
    },
  },
  created() {
    this.fetchFavoriteUrls();
    this.checkIfServerIsUp();
  },
  methods: {
    checkIfServerIsUp() {
      this.checkServerDone = false;
      FileService.isServerUp()
        .then((isUp) => {
          this.isServerUp = isUp;
        })
        .finally(() => {
          this.checkServerDone = true;
        });
    },
    fileUploader(event: FileUploadUploaderEvent) {
      if (!event?.files) return;
      const uploadedFile: File = (event.files as File[])[0];
      const fileName: string = uploadedFile.name;
      const fileSource: Source = {
        type: SourceTypeEnum.UPLOADFILE,
        fileName: fileName,
        value: uploadedFile,
      };

      if (
        fileName.toLowerCase().endsWith(".m3u") ||
        fileName.toLowerCase().endsWith(".m3u8")
      ) {
        // call the store and dispatch the new source
        recordsStore()?.changeSource(fileSource);
      } else {
        const error: Error = {
          type: ErrorTypeEnum.WRONG_FILE_EXTENSION,
        };
        recordsStore()?.changeSourceWithErrors(fileSource, error);
      }
    },

    uploadDemoFile() {
      const demoFileName = "file_example.m3u";
      ParserService.getDemoFile(demoFileName).then((file) => {
        const demoSource: Source = {
          type: SourceTypeEnum.DEMO,
          fileName: demoFileName,
          value: file,
        };
        recordsStore()?.changeSource(demoSource);
      });
    },

    clearSource() {
      recordsStore()?.clearSource();
    },

    loadSourceFromUrl(url?: string, favoriteName?: string) {
      if (!url || this.isProcessing) {
        return;
      }
      this.sourceFavoriteName = favoriteName || null;
      this.isProcessing = true;
      FileService.getFileContent(url)
        .then((file) => {
          const source: Source = {
            type: SourceTypeEnum.URL,
            fileName: file.name,
            url: url,
            value: file,
          };
          recordsStore()?.changeSource(source);
        })
        .catch((_) => {
          this.downloadUrlError = true;
        })
        .finally(() => {
          this.isProcessing = false;
        });
    },
    clearDownloadUrlError() {
      this.downloadUrlError = false;
    },
    openAddFavoriteForm() {
      this.isAddFavoriteFormOpened = true;
    },
    closeAddFavoriteForm() {
      this.isAddFavoriteFormOpened = false;
    },
    confirmRemoveFavorite(event: any, url: string) {
      this.confirm.require({
        target: event.currentTarget,
        message: this.$t("source.favorite_table.remove_dialog.title"),
        icon: "pi pi-exclamation-triangle",
        rejectLabel: this.$t("source.favorite_table.remove_dialog.cancel"),
        acceptLabel: this.$t("source.favorite_table.remove_dialog.ok"),
        accept: () => {
          this.removeFavorite(url);
        },
        reject: () => {
          // do nothing
        },
      });
    },
    addFavorite(url: string, records: number) {
      const name = this.favorite_name;
      if (!name) {
        return;
      }
      FavoriteService.addFavorite(name, url, records);
      this.isAddFavoriteFormOpened = false;
      this.sourceFavoriteName = name;
      this.fetchFavoriteUrls();
    },
    removeFavorite(url: string) {
      if (this.isProcessing) {
        return;
      }
      FavoriteService.removeFavorite(url);
      this.fetchFavoriteUrls();
    },
    fetchFavoriteUrls() {
      this.favoriteUrls = FavoriteService.getFavorites();
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./../../assets/base.scss";

.source-component {
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

  :deep(.p-fileupload-choose) {
    max-height: 39px;
  }

  .favorite-url-cell {
    text-overflow: ellipsis;
    max-width: 100px;
    overflow: hidden;
    white-space: nowrap;
  }

  .buttons-table {
    display: inline-flex;
    gap: 0.4rem;

    .button-table {
      width: 2rem;
      height: 2rem;
      background-color: #eff3f7;
      border: 1px solid #dee7ef;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;

      &:hover {
        background-color: #e9f0f7;
        cursor: pointer;
      }

      &.disabled {
        opacity: 0.4;

        &:hover {
          cursor: unset;
        }
      }
    }
  }

  .favorite-form {
    margin-top: 1em;

    .add-favorite-button {
      button {
        margin-top: 28px;
      }
    }
  }

  .source-form {
    background: white;
    border: 1px solid #dbdbdb;
    padding: 8px;
    border-radius: 4px;

    h3 {
      margin: 4px 12px;
      font-weight: 600;
    }

    .or-source-divider {
      display: flex;
      justify-content: center;
      position: relative;

      .or-source-label {
        text-align: center;
        font-weight: 600;
        background: #ffffff;
        z-index: 5;
        width: 100px;
        margin-top: 11px;
      }

      .divider {
        width: 90%;
        border-bottom: 1px solid #dbdbdb;
        position: absolute;
        top: 22px;
      }
    }
  }

  .favorite-icon {
    color: #7254f3;
    margin-right: 0.6em;
  }

  .favorite-icon-remove {
    color: #7254f3;
    margin-left: 0.3em;
  }

  .source_favorite_name {
    font-weight: 600;
  }

  .remove_favorite_button,
  .cancel_add_favorite_button {
    margin-left: 0.6rem;
  }

  .favorite_table {
    margin-top: 1em;

    :deep(table) {
      border: 1px solid #dee7ef;
      border-bottom: none;
    }
  }

  .small_button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #7254f3;
    color: #ffffff;
    padding: 0.1em 0.6em;
    border-radius: 6px;
    gap: 4px;
    &:hover {
      cursor: pointer;
      background: #6545f2;
    }
  }

  @media (min-width: $breakpoint-screen-xs) {
    .download-url-button {
      margin-top: 28px;
    }
  }
}
</style>
