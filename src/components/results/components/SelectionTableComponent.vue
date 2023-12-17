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
    
    <Column expander style="width: 4rem" />
    <Column style="width: 4rem">
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
        {{ $t('selection_table.details_content', {recordsCount: slotProps.data.records?.length || 0}) }}
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
        header="tvg-logo"
        style="width: 80px">
        <template #body="row">
          <img v-if="row.data.tvgParameters?.tvgLogo"
            :src="row.data.tvgParameters?.tvgLogo"
            :alt="`Logo for ${row.data.tvgParameters?.tvgName}`"
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