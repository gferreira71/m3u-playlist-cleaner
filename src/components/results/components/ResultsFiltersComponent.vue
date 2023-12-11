<template>
  <div class="results-filters-component container">
    <h2>Records filters form</h2>
    <form
      v-if="recordsFilters"
      class="filters-form"
      @submit.prevent="handleFilter()">
      <div class="search-text col-12 grid">

        <div class="col-4">
          <div class="field">
            <label for="search_text">Searched text</label>
            <InputText
              type="text"
              id="search_text"
              v-model="recordsFilters.text"/>
          </div>
        </div>

        <div class="col-5">
          <div class="field">
            <label for="search_text_scope">Searched text scope</label>
            <div
              id="search_text_scope"
              class="search-text-scope-list">
              <div v-for="scope of searchTextScope" :key="scope.key"
                class="search-text-scope-choice">
                <Checkbox
                  v-model="recordsFilters.scopeText"
                  :inputId="`${scope.key}`"
                  name="category"
                  :value="scope.name" />
                <label
                  :for="`${scope.key}`">{{ scope.name }}</label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-3">
          <div class="field">
            <label for="record_type">Record type</label>
            <SelectButton
              id="record_type"
              v-model="recordsFilters.scope"
              :options="scopeOptions"
              optionLabel="value"
              optionValue="value"
              multiple
              aria-labelledby="multiple" />
          </div>
        </div>
      </div>

      <div class="col-12">
        <Button
          class="col-4"
          type="submit"
          icon="pi pi-filter"
          :disabled="isFilteringRunning"
          :label="$t('form.filter_button')">
        </Button>
      </div>
    </form>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia'
import { recordsStore } from './../../../stores/recordsStore';
import { RecordTypeEnum } from '@/types/RecordsTypes';
import { ScopeTextEnum } from '@/types/RecordsFiltersTypes';

export default defineComponent({
  data() {
    return {
      scopeOptions: [{
        value: RecordTypeEnum.MEDIA
      }, {
        value: RecordTypeEnum.LIVE
      }, {
        value: RecordTypeEnum.VOD
      }] as any,
      searchTextScope: [{
        key: 1,
        name: ScopeTextEnum.GROUPTITLE
      }, {
        key: 2,
        name: ScopeTextEnum.NAME
      }, {
        key: 3,
        name: ScopeTextEnum.TVGNAME
      }, {
        key: 4,
        name: ScopeTextEnum.TVGID
      }]
    };
  },
  computed: {
    ...mapState(recordsStore, ['recordsFilters', 'isFilteringRunning']),
  },
  created() { },
  methods: {
    handleFilter() {
      recordsStore()?.applyFilters();
    }
  },
});
</script>

<style lang="scss" scoped>
.results-filters-component {
  .filters-form {
    background: white;
    border: 1px solid #dbdbdb;
    padding: 8px;
    border-radius: 4px;
  }

  .search-text-scope-list {
    display: inline-flex;
    width: 100%;
    margin-top: 8px;
    label {
      margin: 0 6px;
    }
  }
}
</style>