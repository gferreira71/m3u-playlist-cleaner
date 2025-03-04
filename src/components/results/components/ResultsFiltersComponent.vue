<template>
  <div class="results-filters-component container">
    <h2>{{ $t("form.records_filters_form") }}</h2>
    <form
      v-if="recordsFilters"
      class="filters-form"
      @submit.prevent="handleFilter()"
    >
      <div class="search-text col-12 grid">
        <div class="col-12 lg:col-4 md:col-5 sm:col-5">
          <div class="field">
            <label for="search_text">{{ $t("form.searched_text") }}</label>
            <InputText
              type="text"
              id="search_text"
              v-model="recordsFilters.text"
            />
          </div>
        </div>

        <div class="col-12 lg:col-5 md:col-7 sm:col-7">
          <div class="field">
            <label for="search_text_scope">{{
              $t("form.searched_text_scope")
            }}</label>
            <div id="search_text_scope" class="search-text-scope-list">
              <div
                v-for="scope of searchTextScope"
                :key="scope.key"
                class="search-text-scope-choice"
              >
                <Checkbox
                  v-model="recordsFilters.scopeText"
                  :inputId="`${scope.key}`"
                  name="category"
                  :value="scope.name"
                />
                <label :for="`${scope.key}`">{{ scope.name }}</label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 lg:col-3 md:col-6 sm:col-6">
          <div class="field">
            <label for="record_type">{{ $t("form.record_type") }}</label>
            <SelectButton
              id="record_type"
              class="record_type-select"
              v-model="recordsFilters.scope"
              :options="scopeOptions"
              optionLabel="value"
              optionValue="value"
              multiple
              aria-labelledby="multiple"
            />
          </div>
        </div>
      </div>

      <div class="col-12 grid">
        <div class="col-12 lg:col-4 md:col-6 sm:col-6">
          <Button
            type="submit"
            icon="pi pi-filter"
            class="button-full-width"
            :disabled="isFilteringRunning"
            :label="$t('form.filter_button')"
          >
          </Button>
        </div>

        <div class="col-12 lg:col-4 md:col-6 sm:col-6">
          <Button
            @click="resetFilters()"
            class="button-full-width"
            :disabled="!isFilterDirty"
            :label="$t('form.reset_filters')"
          >
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "pinia";
import { recordsStore } from "./../../../stores/recordsStore";
import { RecordTypeEnum } from "@/types/RecordsTypes";
import {
  ScopeTextEnum,
  type RecordsFitlers,
} from "@/types/RecordsFiltersTypes";

export default defineComponent({
  data() {
    return {
      scopeOptions: [
        {
          value: RecordTypeEnum.MEDIA,
        },
        {
          value: RecordTypeEnum.LIVE,
        },
        {
          value: RecordTypeEnum.VOD,
        },
      ] as any,
      searchTextScope: [
        {
          key: 1,
          name: ScopeTextEnum.GROUPTITLE,
        },
        {
          key: 2,
          name: ScopeTextEnum.NAME,
        },
        {
          key: 3,
          name: ScopeTextEnum.TVGNAME,
        },
        {
          key: 4,
          name: ScopeTextEnum.TVGID,
        },
      ],
    };
  },
  computed: {
    ...mapState(recordsStore, ["recordsFilters", "isFilteringRunning"]),

    isFilterDirty(): boolean {
      const textDirty = this.recordsFilters?.text.trim() !== "";
      const scopeDirty = this.recordsFilters?.scope?.length !== 3;
      const typeDirty =
        this.recordsFilters?.scopeText?.length !== 2 ||
        !this.recordsFilters?.scopeText.some(
          (scope) => scope === ScopeTextEnum.GROUPTITLE
        ) ||
        !this.recordsFilters?.scopeText.some(
          (scope) => scope === ScopeTextEnum.NAME
        );
      return textDirty || scopeDirty || typeDirty;
    },
  },
  created() {},
  methods: {
    handleFilter() {
      recordsStore()?.applyFilters();
    },
    resetFilters() {
      recordsStore()?.resetFilters();
      recordsStore()?.applyFilters();
    },
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
      margin: 0 4px;
      font-size: 12px;
    }
  }

  :deep(.record_type-select.p-selectbutton > .p-button) {
    width: 33.3% !important;
  }

  @media (max-width: 446px) {
    .search-text-scope-list {
      flex-direction: column;
      & .search-text-scope-choice:not(:last-child) {
        margin-bottom: 1px;
      }
    }
  }
}
</style>
