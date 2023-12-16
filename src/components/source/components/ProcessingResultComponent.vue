<template>
  <div class="processing-result">
    <Panel
      v-if="errors?.length !== 0"
      toggleable
      :header="$t('source.parsing_result.error')"
      :collapsed="false"
      class="panel-error">
      <div v-for="(error, index) in errors" :key="index">
        <span v-if="error.line"
          class="line-label">
          {{ $t('source.parsing_result.error_line', {line: error.line}) }}
        </span>
        <span>
          {{ $t(`source.parsing_result.error_key.${error.type}`) }}
        </span>
      </div>
    </Panel>

    <Panel
      v-if="warnings?.length !== 0"
      toggleable
      :collapsed="true"
      class="panel-warning">
      <template #header>
        <div class="flex align-items-center">
          {{ $tc('source.parsing_result.warning', {count: warnings?.length ?? 0}) }}
        </div>
      </template>
      <div v-for="(warning, index) in warnings" :key="index">
        <span v-if="warning.line"
          class="line-label">
          {{ $t('source.parsing_result.warning_line', {line: warning.line}) }}
        </span>
        <span>
          {{ $t(`source.parsing_result.warning_key.${warning.type}`) }}
        </span>
      </div>
    </Panel>

    <table class="processing-results-table">
      <tr v-if="records?.length !== 0">
        <th>
          {{ $t('source.parsing_result.records_count') }}
        </th>
        <td>
          {{ records?.length }}
        </td>
      </tr>
      <tr v-if="mediaRecordsCount !== 0">
        <th>
          {{ $t('source.parsing_result.media_count') }}
        </th>
        <td>
          {{ mediaRecordsCount }}
        </td>
      </tr>
      <tr v-if="liveRecordsCount !== 0">
        <th>
          {{ $t('source.parsing_result.live_count') }}
        </th>
        <td>
          {{ liveRecordsCount }}
        </td>
      </tr>
      <tr v-if="vodRecordsCount !== 0">
        <th>
          {{ $t('source.parsing_result.vod_count') }}
        </th>
        <td>
          {{ vodRecordsCount }}
        </td>
      </tr>
    </table>
  </div>
</template>
  
<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from 'vue';
import { RecordTypeEnum } from "@/types/RecordsTypes";
import { recordsStore } from "../../../stores/recordsStore";

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
  methods: { }
});
</script>

<style lang="scss" scoped>
.processing-result {
  padding: 12px 0;
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

  :deep(.panel-warning) {
    padding: 8px 0;
    .p-panel-header {
      background: var(--yellow-300);
      color: var(--yellow-700);
    }
    .p-panel-toggler {
      color: var(--yellow-700);
    }
    .p-panel-header-icon:enabled:hover {
      background-color: var(--yellow-200);
    }
  }

  :deep(.panel-error) {
    padding: 8px 0;
    .p-panel-header {
      background: var(--red-300);
      color: var(--red-700);
    }
    .p-panel-toggler {
      color: var(--red-700);
    }
    .p-panel-header-icon:enabled:hover {
      background-color: var(--red-200);
    }
  }

  .line-label {
    font-weight: 600;
  }
}
</style>