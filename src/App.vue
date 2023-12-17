<template>
  <header>
    <div class="header-container container">
      <div class="header-left">
        <span
          class="app-title"
          @click="$router.push('/')">
          m<span class="app-title-three">3</span>u playlist cleaner
        </span>
      </div>
      <div class="header-right">
        <div class="lang-selector">
          <div
          class="lang-flag"
          @click="changeLang(langEnum.EN)">EN</div>
          <div
          class="lang-flag"
          @click="changeLang(langEnum.FR)">FR</div>
          <div
          class="lang-flag"
          @click="changeLang(langEnum.PT)">PT</div>
        </div>
      </div>
    </div>
  </header>
  <main>
    <RouterView />
  </main>
  <footer>
    <div class="footer-content">
      <span class="footer-text">
        © 2023 - gferreira71
      </span>
      <a href="https://github.com/gferreira71/m3u-playlist-cleaner"
        target="_blank">
        <i class="pi pi-github"></i>
      </a>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export enum LangEnum {
  EN = 'en',
  FR = 'fr',
  PT = 'pt'
}

export default defineComponent({
  data() {
    return {
      langEnum: LangEnum,
    };
  },
  created() { },
  methods: {
    changeLang(lang: LangEnum) {
      this.$i18n.locale = lang;
    }
  }
});

</script>

<style lang="scss" scoped>
header {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  width: 100%;
  background-color: #fcfcfc;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
  position: fixed;
  z-index: 999;
  top: 0;

  .header-container {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
  }

  .header-left {

    .app-title {
      color: black;
      font-weight: bold;
      font-size: 18px;
      cursor: pointer;
      .app-title-three {
        color: red;
        font-style: italic;
        font-weight: bold;
        font-size: 20px;
      }
    }
  }

  .header-right {
    .lang-selector {
      display: inline-flex;
      .lang-flag {
        font-weight: bold;
        padding: 0 4px;
        cursor: pointer;
      }
    }
  }
}

main {
  background-color: var(--surface-ground);
  min-height: calc(100vh - 80px);
  padding-top: 50px;
}

footer {
  height: 30px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .footer-text {
    margin-right: 4px;
    font-size: 12px;
  }
}
</style>
