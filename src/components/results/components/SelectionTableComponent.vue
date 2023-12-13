<template>
  <div class="selection-table-component container">
    <h2>{{ $t('selection_table.selected_records') }}
      <span class="filters-count-label">
        {{ $tc('common_tables.records_count', selectedGroupRecordsCount ?? 0, {count: selectedGroupRecordsCount ?? '0'}) }}
      </span>
    </h2>

    <DataTable
      class="selection-datatable"
      :value="selectedGroupRecords"
      v-model:expandedRows="expandedRows"
      paginator
      :rows="20"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      scrollable
      scrollHeight="500px">
    <template #empty>{{ $t('selection_table.no_result_selected') }}</template>
    
    <Column expander style="width: 5rem" />
    <Column>
      <template #header>
        <Button
        v-if="selectedGroupRecords?.length !== 0"
        icon="pi pi-trash"
        text
        raised
        @click="clearAllSelection()"></Button>
      </template>
      <template #body="slotProps">
        <Button
        icon="pi pi-trash"
        text
        raised
        @click="unselectGroupRecord(slotProps.data)"></Button>
      </template>
    </Column>
    <Column
      field="groupTitle"
      :header="$t('common_tables.group_name_column')"></Column>
    <Column
      :header="$t('common_tables.details_column')">
      <template #body="slotProps">
        Records in the group : {{ slotProps.data.records?.length || 0 }}
      </template>
    </Column>
    <Column
      field="type"
      :header="$t('common_tables.type_column')">
      <template #body="slotProps">
        <Badge :value="slotProps.data.type"></Badge>
      </template>
    </Column>
    
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

      <template #empty>
        {{ $t('common_tables.nothing_to_show') }}
      </template>

      <Column headerStyle="width: 3rem">  
        <template #body="slotProps">
          <Button
          icon="pi pi-trash"
          text
          raised
          @click="unselectRecord(slotProps.data)"></Button>
        </template>
      </Column>
      
      <Column
        header="tvg-logo">
        <template #body="row">
          <img v-if="row.data.tvgParameters?.tvgLogo"
          :src="row.data.tvgParameters?.tvgLogo"
          :alt="`Logo for ${row.data.tvgParameters?.tvgName}`"
          class="tvg-logo-picture"/>
        </template>
      </Column>
      
      <Column
        field="name"
        :header="$t('common_tables.name_column')"></Column>
      <Column
        field="tvgName"
        header="tvg-name"></Column>
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
    ...mapState(recordsStore, ['selectedGroupRecords']),

    selectedGroupRecordsCount(): number {
      return this.selectedGroupRecords.reduce((totalCount, groupedRecord) => {
        return totalCount + groupedRecord.records.length;
      }, 0);
    }
  },
  created() { },
  methods: {
    unselectRecord(record: Record) {
      recordsStore()?.removeRecordSelection(record);
    },
    
    unselectGroupRecord(groupRecord: GroupedRecords) {
      recordsStore()?.removeGroupedRecordSelection(groupRecord);
    },
    
    clearAllSelection() {
      recordsStore()?.clearAllSelection();
    },
  },
});
</script>

<style lang="scss" scoped>
.selection-table-component {
  .selection-datatable {
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
}
</style>