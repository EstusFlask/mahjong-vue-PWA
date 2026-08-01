<template>
  <div id="root">
    <header class="app-header lggc">
      <nav class="nav-shell" aria-label="主导航">
        <div class="brand-mark" aria-label="雀算">雀算</div>
        <segmented-control
          class="main-navigation"
          :model-value="activeSection"
          :options="sectionOptions"
          semantics="tab"
          aria-label="主导航"
          @update:model-value="navigateTo"
        />
      </nav>

      <div id="nav-buttons" aria-label="辅助功能">
        <button
          class="icon-button pressable"
          type="button"
          aria-label="关于"
          title="关于"
          @click="showInfo=!showInfo"
        >
          <n-icon size="1.25rem">
            <InfoRound/>
          </n-icon>
        </button>
        <button
          class="icon-button pressable"
          type="button"
          aria-label="设置"
          title="设置"
          @click="showSetting=!showSetting"
        >
          <n-icon size="1.25rem">
            <SettingsRound/>
          </n-icon>
        </button>
      </div>
    </header>
    
    <div id="content">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionDirection" mode="out-in">
          <component :is="Component" :key="route.fullPath" :rule="rule" />
        </transition>
      </router-view>
    </div>



    <!-- 设置修改框  -->
    <n-modal
      v-model:show="showSetting"
      class="custom-card"
      preset="card"
      :style="{width:'min(37.5rem, calc(100vw - 2rem))'}"
      title="设置"
      closable
      :mask-closable="true"
      :bordered="false"
      @after-leave="updateData"
    >
      <div class="settings-intro">
        <div>
          <p class="modal-kicker">规则偏好</p>
          <h3>本地规则</h3>
          <p>更改会即时影响计算，并在关闭时保存。</p>
        </div>
        <span class="settings-live"><span class="settings-live-dot"></span>即时生效</span>
      </div>

      <div class="settings-list">
        <div class="settings-row">
          <div class="settings-label">
            <strong>食断</strong>
            <span>允许副露断幺九</span>
          </div>
          <segmented-control v-model="rule.shiDuan" class="settings-segmented"
            :options="settings[0]" aria-label="食断" />
        </div>

        <div class="settings-row">
          <div class="settings-label">
            <strong>多倍役满</strong>
            <span>役满可按倍数累计</span>
          </div>
          <segmented-control v-model="rule.duoBeiYiMan" class="settings-segmented"
            :options="settings[0]" aria-label="多倍役满" />
        </div>

        <div class="settings-row">
          <div class="settings-label">
            <strong>复合役满</strong>
            <span>允许多个役满同时成立</span>
          </div>
          <segmented-control v-model="rule.fuHeYiMan" class="settings-segmented"
            :options="settings[0]" aria-label="复合役满" />
        </div>

        <div class="settings-row">
          <div class="settings-label">
            <strong>连风雀头</strong>
            <span>连风雀头的符数</span>
          </div>
          <segmented-control v-model="rule.lianFeng4" class="settings-segmented"
            :options="settings[1]" aria-label="连风雀头" />
        </div>

        <div class="settings-row">
          <div class="settings-label">
            <strong>13翻及以上</strong>
            <span>累计役满或三倍满</span>
          </div>
          <segmented-control v-model="rule.allowLeiMan" class="settings-segmented"
            :options="settings[2]" aria-label="13翻及以上" />
        </div>
      </div>
    </n-modal>

    
    <!-- 信息框  -->
    <n-modal
      v-model:show="showInfo"
      class="custom-card"
      preset="card"
      :style="{width:'min(37.5rem, calc(100vw - 2rem))'}"
      title="关于"
      closable
      :mask-closable="true"
      :bordered="false"
    >

      <div>
        <p>
            本项目采用 Vue 构建，核心逻辑使用 JavaScript 实现，使用 PWA 实现跨平台、可安装的本地与 Web 应用。并在 Github 上开源。项目地址 <a href="https://github.com/EstusFlask/mahjong-vue-PWA">https://github.com/EstusFlask/mahjong-vue-PWA</a>。基于<a href="https://github.com/llx07/mahjong-vue">https://github.com/llx07/mahjong-vue</a>修改
        </p>

        <p>
          牌画素材来自 <a href="https://github.com/lietxia/mahjong_graphic">https://github.com/lietxia/mahjong_graphic</a>，以「M+字型授權條款」授权。
        </p>

        <p>
          支持对某些规则进行自定义（旁边的按钮）。现在可以自定义的规则有：食断，是否计多倍役满、复合役满，连凤雀头符数，是否计累计役满。
        </p>

        <p>
          如果有什么意见和想法，可以在 Github 上提出 Issue。
        </p>

        
        <p>
          目前的计划（按重要性排序）：
          <ol>
            <li>改进 UI</li>
            <li>将项目迁移到TypeScript</li>
            <li>编写测试用例</li>
          </ol>
        </p>
      </div>

    </n-modal>

  </div>
</template>

<script>
  import { Rule } from './store/definition'
  import { NModal, NIcon} from 'naive-ui'
  import SegmentedControl from './components/SegmentedControl.vue'
  import { SettingsRound,InfoRound } from '@vicons/material'

  export default{
    name:"App",
    data(){
      return {
        rule:new Rule(),
        showSetting:false,
        showInfo:false,
        transitionDirection:'page-switch-forward',

        settings:[
          [{value:1,label:"有"},{value:0,label:"无"}],
          [{value:0,label:"2符"},{value:1,label:"4符"}],
          [{value:1,label:"累计役满"},{value:0,label:"三倍满"}],
        ],
        sectionOptions:[
          {value:'calculator',label:'计算器'},
          {value:'practice',label:'点数练习'},
        ],
      }
    },
    components: {
      NModal,NIcon,SegmentedControl,
      SettingsRound,InfoRound
    },
    computed:{
      activeSection(){
        return this.$route.name === 'practice' ? 'practice' : 'calculator'
      },
    },
    watch:{
      $route(to,from){
        const routeOrder = {calculator:0,practice:1}
        const toIndex = routeOrder[to.name] ?? 0
        const fromIndex = routeOrder[from.name] ?? 0
        this.transitionDirection = toIndex >= fromIndex
          ? 'page-switch-forward'
          : 'page-switch-back'
      },
    },
    created(){
      if(localStorage.getItem('rule')!=null){
        this.rule = JSON.parse(localStorage.getItem('rule'))
      }
    },
    methods:{
      navigateTo(section){
        if(section !== this.activeSection){
          this.$router.push({name:section})
        }
      },
      updateData(){
        localStorage.setItem('rule',JSON.stringify(this.rule))
      }
    }
  }
</script>

<style>
  :root {
    color-scheme: light;
    font: 100%/1.5 -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
    --ink-950: #f7fcff;
    --ink-900: #eef7fc;
    --ink-850: #e4f1f8;
    --surface: rgba(255, 255, 255, 0.58);
    --surface-strong: rgba(255, 255, 255, 0.88);
    --surface-soft: rgba(255, 255, 255, 0.42);
    --line: rgba(82, 121, 153, 0.16);
    --line-strong: rgba(82, 121, 153, 0.28);
    --text: #1f2a44;
    --muted: #64758b;
    --teal: #198eb0;
    --teal-strong: #08779d;
    --amber: #c77c2f;
    --danger: #c65d70;
    --success: #318d68;
    --purple: #8070cc;
    --peach: #e3a16f;
    --lggc-radius: 1.35rem;
    --lggc-padding: 1rem 1.25rem;
    --lggc-bg: rgba(255, 255, 255, 0.52);
    --lggc-border: rgba(62, 97, 126, 0.12);
    --lggc-blur: 1.25rem;
    --lggc-highlight: rgba(255, 255, 255, 0.92);
    --radius-lg: 1.25rem;
    --radius-md: 0.85rem;
    --shadow-lg: 0 1.8rem 4rem rgba(44, 83, 113, 0.14);
    --shadow-sm: 0 0.8rem 1.8rem rgba(44, 83, 113, 0.1);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #app {
    min-height: 100%;
    margin: 0;
  }

  html {
    background: var(--ink-950);
  }

  body {
    background:
      radial-gradient(circle at 6% 0%, rgba(137, 205, 255, 0.38), transparent 29rem),
      radial-gradient(circle at 96% 10%, rgba(218, 205, 255, 0.42), transparent 31rem),
      radial-gradient(circle at 50% 82%, rgba(203, 247, 224, 0.3), transparent 34rem),
      linear-gradient(145deg, #fbfeff 0%, var(--ink-950) 52%, #f2f9fb 100%);
    color: var(--text);
    overflow-x: hidden;
    position: relative;
  }

  body::before,
  body::after {
    border-radius: 50%;
    content: "";
    filter: blur(2.5rem);
    pointer-events: none;
    position: fixed;
    z-index: -1;
  }

  body::before {
    background: rgba(178, 227, 255, 0.28);
    height: 25rem;
    left: -9rem;
    top: 18rem;
    width: 25rem;
  }

  body::after {
    background: rgba(255, 218, 194, 0.25);
    bottom: -9rem;
    height: 28rem;
    right: -8rem;
    width: 28rem;
  }

  body,
  button,
  input,
  textarea,
  select {
    font-family: inherit;
  }

  button,
  a {
    -webkit-tap-highlight-color: transparent;
  }

  #root {
    --nav-height: 4.5rem;
    isolation: isolate;
    min-height: 100vh;
    position: relative;
  }

  .app-header,
  footer {
    z-index: 5;
  }

  .app-header {
    align-items: center;
    backdrop-filter: blur(1.35rem) saturate(160%);
    background: rgba(255, 255, 255, 0.6);
    border-bottom: 1px solid rgba(255, 255, 255, 0.78);
    box-shadow: 0 0.7rem 2rem rgba(60, 98, 126, 0.08);
    display: flex;
    gap: 1rem;
    height: var(--nav-height);
    justify-content: space-between;
    padding: 0.7rem clamp(1rem, 4vw, 3.2rem);
    position: fixed;
    top: 0;
    width: 100%;
  }

  .nav-shell,
  #nav-buttons {
    align-items: center;
    display: flex;
  }

  .nav-shell {
    gap: 1.3rem;
  }

  .brand-mark {
    color: var(--text);
    font-size: 1.18rem;
    font-weight: 750;
    letter-spacing: -0.04em;
    white-space: nowrap;
  }

  .brand-mark::after {
    background: var(--teal);
    border-radius: 999px;
    content: "";
    display: inline-block;
    height: 0.35rem;
    margin: 0 0 0.1rem 0.34rem;
    width: 0.35rem;
  }

  .main-navigation {
    flex: 0 0 10.8rem;
    min-width: 10.8rem;
  }

  .main-navigation .segmented-option {
    padding-inline: 0.65rem;
  }

  #nav-buttons {
    gap: 0.35rem;
  }

  .icon-button {
    align-items: center;
    appearance: none;
    background: rgba(255, 255, 255, 0.48);
    border: 1px solid rgba(255, 255, 255, 0.78);
    border-radius: 0.75rem;
    color: var(--muted);
    cursor: pointer;
    display: inline-flex;
    height: 2.35rem;
    justify-content: center;
    padding: 0;
    width: 2.35rem;
  }

  .icon-button:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(25, 142, 176, 0.28);
    color: var(--teal-strong);
  }

  .pressable {
    transition:
      background-color 180ms ease,
      border-color 180ms ease,
      color 180ms ease,
      box-shadow 180ms ease,
      transform 120ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .pressable:active {
    transform: scale(0.95) translateY(0.05rem);
  }

  .pressable:focus-visible,
  .tile-button:focus-visible {
    outline: 0.15rem solid rgba(25, 142, 176, 0.7);
    outline-offset: 0.18rem;
  }

  .lggc {
    --lggc-radius: var(--radius-lg);
    --lggc-padding: 1rem 1.25rem;
    --lggc-bg: rgba(255, 255, 255, 0.52);
    --lggc-border: rgba(62, 97, 126, 0.12);
    --lggc-blur: 1.25rem;
    --lggc-highlight: rgba(255, 255, 255, 0.92);
    background: var(--lggc-bg);
    border: 1px solid var(--lggc-border);
    border-radius: var(--lggc-radius);
    box-shadow:
      inset 1.5px -1.5px 1px -1px var(--lggc-highlight),
      inset -1.5px 1.5px 1px -1px rgba(255, 255, 255, 0.8),
      inset 0 0 3px rgba(15, 23, 42, 0.14),
      0 1rem 2rem rgba(44, 83, 113, 0.1);
    isolation: isolate;
    overflow: hidden;
    position: relative;
  }

  .app-header.lggc {
    position: fixed;
  }

  .lggc::before,
  .lggc::after {
    border-radius: inherit;
    content: "";
    pointer-events: none;
    position: absolute;
  }

  .lggc::before {
    border: 1px solid rgba(255, 255, 255, 0.58);
    filter: blur(var(--lggc-blur));
    height: calc(100% - 1rem);
    left: 0.5rem;
    top: 35%;
    width: calc(100% - 1rem);
  }

  .lggc::after {
    background: linear-gradient(115deg, rgba(255, 255, 255, 0.22), transparent 32%, rgba(255, 255, 255, 0.1));
    inset: 0;
  }

  .lggc > * {
    position: relative;
    z-index: 1;
  }

  footer {
    align-items: center;
    bottom: 0;
    display: flex;
    flex-direction: column;
    height: 2rem;
    justify-content: center;
    left: 0;
    margin: 0;
    padding: 0;
    position: fixed;
    text-align: center;
    width: 100%;
  }

  #content {
    margin: 0 auto;
    max-width: 124rem;
    padding: calc(var(--nav-height) + 0.25rem) clamp(0.9rem, 2.4vw, 2.6rem) 0.4rem;
  }

  .page-switch-forward-enter-active,
  .page-switch-forward-leave-active,
  .page-switch-back-enter-active,
  .page-switch-back-leave-active {
    transform-origin: center top;
    transition:
      opacity 220ms ease,
      transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: opacity, transform;
  }

  .page-switch-forward-enter-from {
    opacity: 0;
    transform: translate3d(1.5rem, 0, 0) scale(0.99);
  }

  .page-switch-forward-leave-to {
    opacity: 0;
    transform: translate3d(-1.5rem, 0, 0) scale(0.99);
  }

  .page-switch-back-enter-from {
    opacity: 0;
    transform: translate3d(-1.5rem, 0, 0) scale(0.99);
  }

  .page-switch-back-leave-to {
    opacity: 0;
    transform: translate3d(1.5rem, 0, 0) scale(0.99);
  }

  .n-modal-container {
    padding: 1rem;
  }

  .n-modal-mask {
    background: rgba(100, 132, 162, 0.18) !important;
    backdrop-filter: blur(0.9rem) saturate(125%);
    -webkit-backdrop-filter: blur(0.9rem) saturate(125%);
    transition: background-color 180ms ease, backdrop-filter 220ms ease;
  }

  .n-base-select-menu,
  .n-dropdown-menu,
  .n-popover {
    background: rgba(255, 255, 255, 0.84) !important;
    backdrop-filter: blur(1.1rem) saturate(145%);
    -webkit-backdrop-filter: blur(1.1rem) saturate(145%);
    border: 1px solid rgba(255, 255, 255, 0.82) !important;
    border-radius: 0.82rem !important;
    box-shadow: 0 1rem 2.2rem rgba(44, 83, 113, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.86);
    color: var(--text);
  }

  .n-base-select-menu .n-base-select-option {
    border-radius: 0.55rem;
    color: var(--text);
    margin: 0.12rem 0.2rem;
    transition: background-color 140ms ease, color 140ms ease, transform 120ms ease;
  }

  .n-base-select-menu .n-base-select-option::before {
    background: transparent !important;
  }

  .n-base-select-menu .n-base-select-option:hover,
  .n-base-select-menu .n-base-select-option--pending {
    background: rgba(213, 242, 255, 0.72) !important;
    color: var(--teal-strong) !important;
  }

  .n-base-select-menu .n-base-select-option--selected {
    color: var(--teal-strong) !important;
    font-weight: 700;
  }

  .n-base-select-menu .n-base-select-option:active {
    transform: scale(0.98);
  }

  .custom-card {
    background:
      radial-gradient(circle at 100% 0%, rgba(216, 205, 255, 0.34), transparent 14rem),
      radial-gradient(circle at 0% 100%, rgba(193, 239, 255, 0.34), transparent 16rem),
      rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(1.25rem) saturate(150%);
    -webkit-backdrop-filter: blur(1.25rem) saturate(150%);
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: var(--radius-lg);
    box-shadow:
      inset 1px 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(73, 113, 143, 0.1),
      0 1.8rem 4rem rgba(44, 83, 113, 0.2);
    color: var(--text);
  }

  .custom-card .n-card__header {
    border-bottom: 1px solid rgba(82, 121, 153, 0.12);
    color: var(--text);
    padding: 1.2rem 1.35rem 0.95rem;
  }

  .custom-card .n-card__content {
    color: var(--text);
    padding: 1.1rem 1.35rem 1.35rem;
  }

  .custom-card .n-card-header__main,
  .custom-card .n-card-header__title {
    color: var(--text);
    font-weight: 750;
    letter-spacing: -0.03em;
  }

  .custom-card .n-card__close {
    border-radius: 0.65rem;
    color: var(--muted);
    transition: background-color 150ms ease, color 150ms ease, transform 120ms ease;
  }

  .custom-card .n-card__close:hover {
    background: rgba(255, 255, 255, 0.72);
    color: var(--teal-strong);
  }

  .custom-card .n-card__close:active {
    transform: scale(0.94);
  }

  .custom-card a {
    color: var(--teal-strong);
    font-weight: 650;
  }

  .custom-card p {
    line-height: 1.75;
    margin: 0 0 0.85rem;
  }

  .custom-card ol {
    margin-bottom: 0;
  }

  .modal-kicker {
    color: var(--teal-strong);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    margin: 0 0 0.2rem !important;
    text-transform: uppercase;
  }

  .settings-intro {
    align-items: flex-start;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    margin-bottom: 0.9rem;
  }

  .settings-intro h3 {
    color: var(--text);
    font-size: 1.12rem;
    letter-spacing: -0.035em;
    line-height: 1.2;
    margin: 0 0 0.25rem;
  }

  .settings-intro p:last-child {
    color: var(--muted);
    font-size: 0.76rem;
    margin: 0 !important;
  }

  .settings-live {
    align-items: center;
    background: rgba(226, 248, 237, 0.7);
    border: 1px solid rgba(49, 141, 104, 0.2);
    border-radius: 999px;
    color: var(--success);
    display: inline-flex;
    flex: 0 0 auto;
    font-size: 0.68rem;
    gap: 0.35rem;
    padding: 0.36rem 0.55rem;
  }

  .settings-live-dot {
    background: var(--success);
    border-radius: 50%;
    box-shadow: 0 0 0 0.2rem rgba(49, 141, 104, 0.12);
    height: 0.38rem;
    width: 0.38rem;
  }

  .settings-list {
    display: grid;
    gap: 0.5rem;
  }

  .settings-row {
    align-items: center;
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(82, 121, 153, 0.12);
    border-radius: 0.9rem;
    display: flex;
    gap: 0.9rem;
    justify-content: space-between;
    min-height: 3.55rem;
    padding: 0.58rem 0.65rem 0.58rem 0.82rem;
    transition: background-color 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
  }

  .settings-row:hover {
    background: rgba(255, 255, 255, 0.56);
    border-color: rgba(25, 142, 176, 0.2);
    box-shadow: 0 0.45rem 1rem rgba(44, 83, 113, 0.06);
    transform: translateY(-0.04rem);
  }

  .settings-label {
    display: flex;
    flex-direction: column;
    gap: 0.13rem;
    min-width: 0;
  }

  .settings-label strong {
    color: var(--text);
    font-size: 0.82rem;
    font-weight: 720;
  }

  .settings-label span {
    color: var(--muted);
    font-size: 0.68rem;
    line-height: 1.35;
  }

  .settings-segmented {
    flex: 0 0 auto;
    min-width: 9rem;
  }

  .custom-card .settings-segmented .segmented-track {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(226, 240, 247, 0.62));
    border-color: rgba(82, 121, 153, 0.2);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      inset 0 -1px 0 rgba(82, 121, 153, 0.1),
      0 0.5rem 1rem rgba(44, 83, 113, 0.08);
  }

  .custom-card .settings-segmented .segmented-option {
    font-size: 0.74rem;
    min-height: 2.15rem;
    padding-inline: 0.55rem;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .app-header,
    .main-navigation .segmented-track,
    .icon-button {
      backdrop-filter: none;
      background: var(--surface-strong);
    }

    .lggc {
      background: var(--surface-strong);
      box-shadow: var(--shadow-sm);
    }

    .custom-card {
      backdrop-filter: none;
      background: var(--surface-strong);
    }

    .n-modal-mask {
      backdrop-filter: none;
    }
  }

  @media screen and (max-width: 640px) {
    #root {
      --nav-height: 4.1rem;
    }

    .app-header {
      padding-inline: 0.85rem;
    }

    .nav-shell {
      gap: 0.65rem;
    }

    .brand-mark {
      font-size: 1rem;
    }

    .main-navigation {
      flex-basis: 10.8rem;
      min-width: 10.8rem;
    }

    .main-navigation .segmented-option {
      font-size: 0.85rem;
      padding-inline: 0.55rem;
    }

    .main-navigation .segmented-option-label {
      overflow: visible;
      text-overflow: clip;
    }

    #content {
      padding-top: var(--nav-height);
      padding-inline: 0.75rem;
    }

    .custom-card .n-card__content {
      padding: 0.95rem;
    }

    .settings-intro {
      flex-direction: column;
      gap: 0.55rem;
    }

    .settings-row {
      align-items: stretch;
      flex-direction: column;
      gap: 0.55rem;
    }

    .settings-segmented {
      width: 100%;
    }

    .custom-card .settings-segmented {
      min-width: 0;
    }
  }

  @media screen and (max-width: 400px) {
    .main-navigation {
      flex-basis: 10.5rem;
      min-width: 10.5rem;
    }

    .main-navigation .segmented-option {
      font-size: 0.8rem;
      padding-inline: 0.35rem;
    }
  }
</style>
