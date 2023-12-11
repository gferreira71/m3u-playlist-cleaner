<template>
  <div class="results-component">
    <ResultsFiltersComponent></ResultsFiltersComponent>
    <ResultsTableComponent></ResultsTableComponent>
    <SelectionTableComponent></SelectionTableComponent>
  </div>
</template>
  
<script lang="ts">
import { defineComponent } from 'vue';
import ResultsFiltersComponent from './components/ResultsFiltersComponent.vue';
import SelectionTableComponent from './components/SelectionTableComponent.vue';
import ResultsTableComponent from './components/ResultsTableComponent.vue';

export default defineComponent({
  components: {
    ResultsFiltersComponent,
    ResultsTableComponent,
    SelectionTableComponent,
  },
  data() {
    return {};
  },
  computed: {},
  created() { },
  methods: {},
});
</script>

<style lang="scss" scoped>
</style>