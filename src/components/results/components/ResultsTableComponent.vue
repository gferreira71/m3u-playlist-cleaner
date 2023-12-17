<template>
  <div class="results-table-component container">
    <h2>{{ $t('records_table.filtered_records') }}
      <span class="filters-count-label">
        {{ $tc('common_tables.records_count', filteredGroupRecordsCount ?? 0, {count: filteredGroupRecordsCount ?? '0'}) }}
      </span>
    </h2>
    <DataTable
      :value="filteredGroupRecords"
      :loading="isFilteringRunning"
      v-model:expandedRows="expandedRows"
      dataKey="groupTitle"
      paginator
      :rows="20"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      :row-class="resultTableRowClass"
      scrollable
      scrollHeight="500px"
      class="results-datatable">

      <Column expander style="width: 4rem">
      </Column>

      <Column style="width: 2rem">
        <template #header>
          <input
            v-if="filteredGroupRecords?.length !== 0"
            type="checkbox"
            class="input-checkbox"
            :checked="areAllFilteredRecordsSelected()"
            @change="selectAllFilteredRecordChanged($event)"
          />
        </template>
        <template #body="slotProps">
          <input
            type="checkbox"
            class="input-checkbox"
            :checked="isGroupedRecordSelected(slotProps.data)"
            @change="selectAllRecordChanged($event, slotProps.data)"
          />
        </template>
      </Column>

      <Column
        field="groupTitle"
        :header="$t('common_tables.group_name_column')"
        ></Column>
      <Column
        :header="$t('common_tables.details_column')">
        <template #body="slotProps">
          {{ $t('records_table.details_content', {
            recordsCount: slotProps.data.records?.length || 0,
            selectedCount: getRecordSelectedCount(slotProps.data.records)
          }) }}
        </template>
      </Column>
      <Column
        field="type"
        :header="$t('common_tables.type_column')">
        <template #body="slotProps">
          <Badge :value="slotProps.data.type"></Badge>
        </template>
      </Column>

      <template #empty>
        {{ $t('records_table.no_result_found') }}
      </template>
      <template #expansion="slotProps">

        <DataTable
          :value="slotProps.data.records"
          dataKey="name"
          paginator
          :rows="20"
          :rowsPerPageOptions="[5, 10, 20, 50]"
          :row-class="recordsTableRowClass"
          class="expand-row-table"
          scrollable
          scrollHeight="300px">

          <template #empty>
            {{ $t('common_tables.nothing_to_show') }}
          </template>

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

          <Column
            header="tvg-logo"
            style="width: 80px">
            <template #body="row">
              <img v-if="row.data.tvgParameters?.tvgLogo"
                :src="row.data.tvgParameters?.tvgLogo"
                class="tvg-logo-picture"/>
                <div v-else
                  class="no-logo-symbol">
                  ?
                </div>
            </template>
          </Column>

          <Column
            field="name"
            :header="$t('common_tables.name_column')"></Column>
          <Column header="tvg-name">
            <template #body="row">
              {{ row.data.tvgParameters?.tvgName || '-' }}
            </template>
          </Column>
          <Column
            field="groupTitle"
            header="group-title"></Column>
          <Column
            field="type"
            :header="$t('common_tables.type_column')">
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
    resultTableRowClass(rowData: any): string {
      let clazz = '';
      if(!rowData.records) clazz += 'no-expander';
      if(this.isGroupedRecordSelected(rowData)) {
        clazz += 'row-highlighted-full';
      } else if(this.isGroupedRecordPartiallySelected(rowData)) {
        clazz += 'row-highlighted-partial';
      }
      return clazz;
    },

    recordsTableRowClass(rowData: any): string {
      let clazz = '';
      if(this.isRecordSelected(rowData)) {
        clazz += 'row-highlighted-full';
      }
      return clazz;
    },

    isGroupedRecordSelected(groupedRecord: GroupedRecords) {
      const selectedRecords = this.selectedGroupRecords.flatMap(
        selectedGroupRecord => selectedGroupRecord.records
      );
      return groupedRecord.records.every(record =>
        selectedRecords.includes(record)
      );
    },

    isGroupedRecordPartiallySelected(groupedRecord: GroupedRecords) {
      const selectedRecords = this.selectedGroupRecords.flatMap(
        selectedGroupRecord => selectedGroupRecord.records
      );
      return groupedRecord.records.some(record =>
        selectedRecords.includes(record)
      );
    },

    isRecordSelected(record: Record) {
      return this.selectedGroupRecords.some(groupedRecord =>
        groupedRecord.records.some(selectedRecord => selectedRecord.name === record.name)
      );
    },

    areAllFilteredRecordsSelected() {
      const selectedRecords = this.selectedGroupRecords.flatMap(
        selectedGroupRecord => selectedGroupRecord.records
      );
      const filteredGroupRecordsRecords = this.filteredGroupRecords.flatMap(
        groupRecords => groupRecords.records
      );
      return filteredGroupRecordsRecords.every(record =>
        selectedRecords.includes(record)
      );
    },

    getRecordSelectedCount(records: Record[]) {
      const selectedRecords: Record[] = this.selectedGroupRecords.flatMap(
        selectedGroupRecord => selectedGroupRecord.records
      );
      return records.filter(record =>
        selectedRecords.includes(record)
      ).length;
    },

    selectAllFilteredRecordChanged(event: any) {
      recordsStore().toggleAllFilteredGroupRecordSelection(event.target.checked);
    },

    selectAllRecordChanged(event: any, data: GroupedRecords) {
      recordsStore().toggleGroupedRecordSelection(data, event.target.checked);
    },

    selectRecordChanged(event: any, data: Record) {
      recordsStore().toggleRecordSelection(data);
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

  :deep(tr.row-highlighted-full) {
    background-color: #e2dcfc !important;
  }

  :deep(.row-highlighted-partial) {
    background-color: #f8f6ff !important;
  }

  .no-logo-symbol {
    width: 22px;
    height: 22px;
    border: 1px solid transparent;
    background-color: #7254f3;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>