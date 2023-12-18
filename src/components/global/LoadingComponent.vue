<template>
  <div class="loading-container">
    <ProgressSpinner
      :aria-label="$t('global.loading')"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    return { };
  },
  computed: { },
  created() { },
  methods: { }
});

</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: 300px;
}
</style>
