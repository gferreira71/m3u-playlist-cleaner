<template>
  <div class="selection-component"
    v-if="parsedData">
    <div>
      <strong>Live records found :</strong> {{ liveRecords.length }}
    </div>
    <div>
      <strong>VOD records found :</strong> {{ vodRecords.length }}
    </div>

    <div class="form">
      <form @submit.prevent="handleFilter()">

        <h2>{{ $t('form.form_title') }}</h2>
        <InputText
          type="text"
          v-model="searchedForm.text"/>

        <SelectButton
          v-model="searchedForm.scope"
          :options="scopeOptions"
          optionLabel="value"
          multiple
          aria-labelledby="multiple" />

        <Button
          type="submit"
          :label="$t('form.filter_button')">
        </Button>

      </form>

    </div>

    <div>
      <h2>FILTERED RESULTS ({{ filterResults?.length || 0 }} record(s))</h2>

      <DataTable
        :value="filterResults"
        v-model:expandedRows="expandedRows"
        dataKey="groupName"
        paginator
        :rows="20"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        :row-class="expandRowClass"
        scrollable
        scrollHeight="500px">

        <Column expander style="width: 5rem" />

        <Column field="groupName" header="Group name"></Column>
        <Column header="Details">
          <template #body="slotProps">
            Records in the group : {{ slotProps.data.children?.length || 0 }}
          </template>
        </Column>
        <Column field="type" header="Type"></Column>

        <template #empty>No result found.</template>
        <template #expansion="slotProps">

          <DataTable
            :value="slotProps.data.children"
            dataKey="name"
            v-model:selection="selectedRecords"
            paginator
            :rows="20"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            class="expand-row-table"
            :row-class="selectedRowClass"
            scrollable
            scrollHeight="300px">

            <template #empty>Nothing to show.</template>

            <Column headerStyle="width: 3rem">
              <template #header>
                <input
                  type="checkbox"
                  :checked="selectedRecords.filter(e => e.name === slotProps.data.name).length === slotProps.data.children.length"
                  @change="selectAllRecordChanged($event, slotProps.data)"
                />
              </template>

              <template #body="row">
                <input
                  type="checkbox"
                  :checked="selectedRecords.some(e => e.name === row.data.name)"
                  @change="selectRecordChanged($event, row.data)"
                />
              </template>
            </Column>


            <!--Column selectionMode="multiple" headerStyle="width: 3rem"></Column-->

            <Column field="name" header="Name"></Column>
            <Column field="tvg-name" header="tvg-name"></Column>
            <Column field="group-title" header="group-title"></Column>
            <Column field="type" header="Type">
              <template #body="slotProps">
                <Badge :value="slotProps.data.type"></Badge>
              </template>
            </Column>

          </DataTable>

        </template>

      </DataTable>

      <h2>SELECTED RESULTS ({{ selectedRecords?.length || 0 }} record(s))</h2>

      <DataTable
        :value="selectedRecords"
        paginator
        :rows="5"
        :rowsPerPageOptions="[5, 10, 20, 50]"
        scrollable
        selectionMode="multiple"
        scrollHeight="300px">
        <template #empty>No result selected.</template>
        <Column>

          <template #header>
            <Button
              icon="pi pi-trash"
              text
              raised
              @click="unselectAllRecords()"></Button>
          </template>
          <template #body="slotProps">
            <Button
              icon="pi pi-trash"
              text
              raised
              @click="unselectRecord(slotProps.data.name)"></Button>
          </template>

        </Column>
        <Column field="name" header="Name"></Column>
        <Column field="tvg-name" header="tvg-name"></Column>
        <Column field="group-title" header="group-title"></Column>
        <Column field="type" header="Type">
          <template #body="slotProps">
            <Badge :value="slotProps.data.type"></Badge>
          </template>
        </Column>
      </DataTable>

    </div>

    <div class="download-button-container">
      <Button
        :label="$t('selection.download_button')"
        icon="pi pi-download"
        :disabled="selectedRecords.length === 0"
        @click="downloadResults()"/>
    </div>
  </div>
</template>

<script lang="ts">
import ParserService from '@/services/ParserService';
import { defineComponent } from 'vue';
// import ParserService from './../services/ParserService';

export default defineComponent({
  props: {
    parsedData: {
        type: Array,
        required: false,
    },
  },
  data() {
    return {
      testTable: [{
        id: 1,
        name: 'a'
      }, {
        name: 'b',
        id: 2,
        children: [
          {
            name: 'c'
          }
        ]
      }],

      filterResults: [] as any[],
      expandedRows: [] as any[],

      selectedRecords: [] as any[],
      selectedGroupRecords: [] as any[],
      searchedForm: {
        text: '' as string,
        scope: [{value:'LIVE'}, {value:'VOD'}] as any[]
      } as any,
      scopeOptions: [{
        value: 'LIVE'
      }, {
        value: 'VOD'
      }] as any
    };
  },
  computed: {
    vodRecords(): any[] {
      return this.parsedData?.find(rec => rec.name === 'VOD')?.records as any[] || [];
    },
    liveRecords(): any[] {
      return this.parsedData?.find(rec => rec.name === 'LIVE')?.records as any[] || [];
    },
    allRecords(): any[] {
      return [...this.vodRecords, ...this.liveRecords];
    },
  },
  created() {
    if(this.parsedData) {
      this.handleFilter();
    }
  },
  methods: {
    handleFilter() {
      /*
      TODO: If value is found in the group name : compute a "group-name" structure
      with an array containing all the records of the group in it (in order to expand it)
      If not, check the name or the tvg-id while ignoring the results already in the grouped results
      */
      const valueToFind = this.searchedForm.text.trim().toUpperCase();
      console.log('valueToFind', valueToFind);

      console.log('searchedForm.scope', this.searchedForm.scope);

      if(!this.searchedForm.scope || this.searchedForm.scope.length === 0) {
        this.filterResults = [];
      } else {

        if(!valueToFind || valueToFind.length === 0) {
          this.filterResults = this.allRecords.reduce((acc, record) => {
            const existingGroup = acc.find(item => item.groupName === record['group-title']);
            if (!existingGroup) {
              acc.push({ groupName: record['group-title'], children: [record] });
            } else {
              existingGroup.children.push(record);
            }
            return acc;
          }, []);
        }

        let groupFilterResultsFormatted: any[] = [];
        let groupFilterResults: any[] = [];
        let filterSingleResults: any[] = [];
        // if(valueToFind.length > 2) { PERF ISSUE ?
        if(valueToFind.length) {
          groupFilterResults = this.allRecords?.filter(rec => {
            return rec && (
              rec['group-title']?.toUpperCase().includes(valueToFind)
            );
          }) || [];

          groupFilterResultsFormatted = groupFilterResults.reduce((acc, record) => {
            const existingGroup = acc.find(item => item.name === record['group-title']);
            if (!existingGroup) {
              acc.push({ name: record['group-title'], children: [record] });
            } else {
              existingGroup.children.push(record);
            }

            return acc;
          }, []);

          filterSingleResults = this.allRecords?.filter(rec => {
            return rec &&
              !groupFilterResults.includes(rec) &&
              (
              rec.name?.toUpperCase().includes(valueToFind) ||
              rec['tvg-name']?.toUpperCase().includes(valueToFind)
            );
          }) || [];
          this.filterResults = [...groupFilterResultsFormatted, ...filterSingleResults];
        }
      }

      console.log('this.filterResults', this.filterResults);
    },

    expandRowClass(rowData: any) {
      return rowData.children ? "" : "no-expander";
    },

    selectedRowClass(rowData: any) {
      return this.selectedRecords.some(e => e.name === rowData.name) ? "p-highlight" : "";
    },

    unselectRecord(recordName: string) {
      this.selectedRecords = this.selectedRecords.filter((rec) => rec.name !== recordName);
    },

    unselectAllRecords() {
      this.selectedRecords = [];
    },

    selectRecordChanged(event: any, data: any) {
      console.log('event', event);
      if (!event.target.checked) {
        this.selectedRecords = this.selectedRecords.filter(
          (selected) => selected !== data
        );
      } else {
        this.selectedRecords.push(data);
      }
    },

    selectAllRecordChanged(event: any, data: any) {
      console.log('event', event);
      const firstElt = data.children[0];
      if(firstElt) {
        if (!event.target.checked) {
          this.selectedRecords = this.selectedRecords.filter(
            (selected) => selected['group-title'] !== firstElt['group-title']
          );
        } else {
          this.selectedRecords = this.selectedRecords.filter(
            (selected) => selected['group-title'] !== firstElt['group-title']
          );
          this.selectedRecords.push(...data.children);
        }
      }
    },

    downloadResults() {
      ParserService.downloadM3uResults(this.selectedRecords);
    }
  }
});
</script>

<style lang="scss" scoped>
.selection-component {
  .download-button-container {
    padding-top: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
  }

  .expand-row-table {
    z-index: 0;
    border: 1px solid #f2f2f2;
    :deep(.p-paginator) {
      background-color: #eff3f8;
      border-radius: 0;
    }
  }

  :deep(.p-datatable .p-datatable-tbody > tr.no-expander > td .p-row-toggler) {
    display: none;
  }
  :deep(.p-datatable-emptymessage > td) {
    text-align: center !important;
}
}
</style>