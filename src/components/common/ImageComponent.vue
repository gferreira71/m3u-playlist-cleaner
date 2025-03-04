<template>
  <div v-if="imageSource" class="image">
    <div class="image-mask" @click="closeImage()">
      <div class="image-close-button">
        <i class="pi pi-times" @click="closeImage()"></i>
      </div>
      <img :src="imageSource" @click="stopPropagation($event)" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: ["imageSource"],
  emits: ["closeImage"],
  data() {
    return {};
  },
  computed: {},
  created() {},
  methods: {
    closeImage() {
      this.$emit("closeImage");
    },
    stopPropagation(event: Event) {
      event.stopPropagation();
      event.preventDefault();
    },
  },
});
</script>

<style lang="scss" scoped>
.image {
  .image-mask {
    background: #00000066;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    cursor: pointer;

    .image-close-button {
      position: absolute;
      top: 16px;
      right: 16px;
      font-size: 26px;
      color: white;

      &:hover {
        cursor: pointer;
      }

      i {
        font-size: 1em;
      }
    }

    img {
      object-fit: cover;
      max-width: 100%;
      max-height: 95%;
      user-select: none;
      cursor: initial;
    }
  }
}
</style>
