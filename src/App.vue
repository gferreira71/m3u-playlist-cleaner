<template>
  <header>
    <div class="header-container container">
      <div class="header-left">
        <span class="app-title" @click="$router.push('/')">
          m<span class="app-title-three">3</span>u playlist cleaner
        </span>

        <div class="menu">
          <div
            class="menu-item"
            :class="{ active: isToolPageActive }"
            @click="$router.push('/tool')"
          >
            Tool
          </div>
          <div
            class="menu-item"
            :class="{ active: isManualPageActive }"
            @click="$router.push('/manual')"
          >
            Manual
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="lang-selector">
          <div
            class="lang-flag"
            :class="{ 'lang-flag-active': $i18n.locale === langEnum.EN }"
            @click="changeLang(langEnum.EN)"
          >
            EN
          </div>
          <div
            class="lang-flag"
            :class="{ 'lang-flag-active': $i18n.locale === langEnum.FR }"
            @click="changeLang(langEnum.FR)"
          >
            FR
          </div>
        </div>
      </div>
    </div>
  </header>
  <main>
    <template v-if="!isViewLoaded">
      <LoadingComponent />
    </template>
    <RouterView />
  </main>
  <footer>
    <div class="footer-content">
      <span class="footer-text"> © 2024 - gferreira71 </span>
      <a
        class="github-link"
        href="https://github.com/gferreira71/m3u-playlist-cleaner"
        target="_blank"
      >
        <i class="pi pi-github"></i>
      </a>
    </div>
  </footer>
</template>

<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { recordsStore } from "./stores/recordsStore";
import LoadingComponent from "./components/global/LoadingComponent.vue";
import LangService from "./services/LangService";
import { useRoute } from "vue-router";

export enum LangEnum {
  EN = "en",
  FR = "fr",
  PT = "pt",
}

export default defineComponent({
  components: {
    LoadingComponent,
  },
  data() {
    return {
      langEnum: LangEnum,
    };
  },
  computed: {
    ...mapState(recordsStore, ["isViewLoaded"]),
    path() {
      const route = useRoute();
      return route.path;
    },
    isToolPageActive() {
      return this.path === "/tool";
    },
    isManualPageActive() {
      return this.path === "/manual";
    },
  },
  created() {
    this.initLang();
  },
  methods: {
    initLang() {
      const lang = LangService.getLang();
      if (lang) {
        this.$i18n.locale = lang;
      }
    },
    changeLang(lang: LangEnum) {
      this.$i18n.locale = lang;
      LangService.setLang(lang);
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./assets/base.scss";

header {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  width: 100%;
  background: linear-gradient(
    0deg,
    #f5f5f5 0%,
    rgb(255 255 255) 50%,
    #f5f5f5 100%
  );

  border-bottom: 1px solid #e8e8e8;
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
    display: inline-flex;
    align-items: center;
    gap: 1rem;

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

    .menu {
      display: inline-flex;
      justify-content: center;
      align-items: center;

      .menu-item {
        align-items: center;
        display: flex;
        padding: 0 12px;
        height: 50px;
        cursor: pointer;
        text-transform: uppercase;
        font-weight: 400;

        &:hover {
          color: blue;
          background-color: #eaeaea;
        }

        &.active {
          color: blue;
          background-color: #eaeaea;
        }
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
      .lang-flag-active {
        color: var(--highlight-text-color);
      }
    }
  }
}

main {
  background-color: var(--surface-ground);
  height: 100%;
  min-height: calc(100vh - 30px);
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
  .github-link:hover {
    cursor: pointer;
    color: var(--primary-color);
  }
}
</style>
