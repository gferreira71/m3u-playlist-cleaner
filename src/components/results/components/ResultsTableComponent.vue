<template>
  <div class="results-table-component container">
    <h2>Filtered records
      <span class="filters-count-label">{{ filteredGroupRecordsCount ?? '0' }} record(s)</span>
    </h2>
    <DataTable
      :value="filteredGroupRecords"
      :loading="isFilteringRunning"
      v-model:expandedRows="expandedRows"
      dataKey="groupTitle"
      paginator
      :rows="20"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :row-class="expandRowClass"
      scrollable
      scrollHeight="500px"
      class="results-datatable">

      <Column expander style="width: 5rem" />

      <Column field="groupTitle" header="Group name"></Column>
      <Column header="Details">
        <template #body="slotProps">
          Records in the group : {{ slotProps.data.records?.length || 0 }}
        </template>
      </Column>
      <Column field="type" header="Type">
        <template #body="slotProps">
          <Badge :value="slotProps.data.type"></Badge>
        </template>
      </Column>

      <template #empty>No result found.</template>
      <template #expansion="slotProps">

        <DataTable
          :value="slotProps.data.records"
          dataKey="name"
          paginator
          :rows="20"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          class="expand-row-table"
          scrollable
          scrollHeight="300px">

          <template #empty>Nothing to show.</template>

          <Column headerStyle="width: 3rem">
            <template #header>
              <input
                type="checkbox"
                class="input-checkbox"
                :checked="isGroupedRecordSelected(slotProps.data)"
                @change="selectAllRecordChanged($event, slotProps.data)"
              />
            </template>

            <template #body="row">
              <input
                type="checkbox"
                class="input-checkbox"
                :checked="isRecordSelected(row.data)"
                @change="selectRecordChanged($event, row.data)"
              />
            </template>
          </Column>

          <Column header="tvg-logo">
            <template #body="row">
              <img v-if="row.data.tvgParameters?.tvgLogo"
                :src="row.data.tvgParameters?.tvgLogo"
                class="tvg-logo-picture"/>
            </template>
          </Column>

          <Column field="name" header="Name"></Column>
          <Column header="tvg-name">
            <template #body="row">
              {{ row.data.tvgParameters?.tvgName || '-' }}
            </template>
          </Column>
          <Column field="groupTitle" header="group-title"></Column>
          <Column field="type" header="Type">
            <template #body="slotProps">
              <Badge :value="slotProps.data.type"></Badge>
            </template>
          </Column>

        </DataTable>

      </template>

    </DataTable>
  </div>
</template>
  
<script lang="ts">
import { recordsStore } from '@/stores/recordsStore';
import { mapState } from 'pinia';
import { defineComponent } from 'vue';
import { type Record } from '@/types/RecordsTypes';
import type { GroupedRecords } from '@/types/GroupedRecordsTypes';

export default defineComponent({
  data() {
    return {
      expandedRows: [] as any[],
    };
  },
  computed: {
    ...mapState(recordsStore, [
      'filteredGroupRecords',
      'selectedGroupRecords',
      'isFilteringRunning'
    ]),

    filteredGroupRecordsCount(): number {
      return this.filteredGroupRecords.reduce((totalCount, groupedRecord) => {
        return totalCount + groupedRecord.records.length;
      }, 0);
    },
  },
  created() { },
  methods: {
    expandRowClass(rowData: any): string {
      return rowData.records ? "" : "no-expander";
    },

    isGroupedRecordSelected(groupedRecord: GroupedRecords) {
      const selectedRecords = this.selectedGroupRecords.flatMap(
        selectedGroupRecord => selectedGroupRecord.records
      );
      return groupedRecord.records.every(record =>
        selectedRecords.includes(record)
      );
    },

    isRecordSelected(record: Record) {
      return this.selectedGroupRecords.some(groupedRecord =>
        groupedRecord.records.some(selectedRecord => selectedRecord.name === record.name)
      );
    },

    selectRecordChanged(event: any, data: Record) {
      recordsStore().toggleRecordSelection(data);
    },

    selectAllRecordChanged(event: any, data: GroupedRecords) {
      recordsStore().toggleGroupedRecordSelection(data);
    },
  },
});
</script>

<style lang="scss" scoped>
.results-table-component {
  .results-datatable {
    border: 1px solid #d8d8d8;
    border-radius: 0 0 6px 6px;
  }

  .filters-count-label {
    font-style: italic;
    font-weight: 100;
  }

  .tvg-logo-picture {
    width: auto;
    height: 30px;
  }

  .expand-row-table {
    z-index: 0;
    border: 1px solid #f2f2f2;
    :deep(.p-paginator) {
      background-color: #eff3f8;
      border-radius: 0;
    }
  }

  .input-checkbox {
    width: 16px;
    height: 16px;
  }
}
</style>