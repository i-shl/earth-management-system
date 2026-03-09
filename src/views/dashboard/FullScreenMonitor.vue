<template>
  <div class="fullscreen-monitor-container">
    <!-- 顶部 HUD 框架 -->
    <header class="monitor-header">
      <div class="header-left">
        <div class="brutal-logo">
          <Globe class="globe-icon" :size="32" />
          <div class="title-group">
            <h1 class="main-title">地球系统监控中心</h1>
            <div class="sub-title">中央指挥台 v2.0 // 状态: 正常运行</div>
          </div>
        </div>
      </div>
      
      <div class="header-center">
        <div class="hud-stat-box">
          <span class="label">运行时间</span>
          <span class="value">{{ uptime }}</span>
        </div>
        <div class="hud-stat-box">
          <span class="label">系统时间</span>
          <span class="value">{{ currentTime }}</span>
        </div>
      </div>

      <div class="header-right">
        <div class="control-group">
          <ThemeSwitcher />
          <NeoButton
            @click="router.push({ name: 'Overview' })"
            class="brutal-exit-btn"
            type="danger"
          >
            <LogOut :size="18" />
            <span>退出监控</span>
          </NeoButton>
        </div>
      </div>
    </header>

    <!-- 监控大屏主要展示区域 -->
    <main class="monitor-main">
      <DashboardMonitor />
      <!-- 全屏装饰性覆盖层 -->
      <div class="brutal-scanline"></div>
      <div class="brutal-corner tl"></div>
      <div class="brutal-corner tr"></div>
      <div class="brutal-corner bl"></div>
      <div class="brutal-corner br"></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Globe, LogOut } from 'lucide-vue-next'
import { NeoButton } from 'neo-brutal-vue'
import DashboardMonitor from './DashboardMonitor.vue'
import ThemeSwitcher from '../../components/common/ThemeSwitcher.vue'

const router = useRouter()

const currentTime = ref('')
const uptime = ref('00:00:00')
let timer: ReturnType<typeof setInterval> | null = null
const startTime = Date.now()

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { hour12: false })
  
  const diff = Math.floor((Date.now() - startTime) / 1000)
  const h = Math.floor(diff / 3600).toString().padStart(2, '0')
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
  const s = (diff % 60).toString().padStart(2, '0')
  uptime.value = `${h}:${m}:${s}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
@use "../../styles/variables" as *;

.fullscreen-monitor-container {
  width: 100vw;
  height: 100vh;
  background-color: $color-bg;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: $color-text;
  font-family: $font-mono;
  @include cyber-grid-bg;
}

.monitor-header {
  height: 90px;
  background: var(--color-surface);
  border-bottom: 4px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  z-index: 100;
}

.brutal-logo {
  display: flex;
  align-items: center;
  gap: 20px;
  
  .globe-icon { 
    color: $color-primary; 
    animation: spin 30s linear infinite;
    filter: drop-shadow(4px 4px 0 var(--color-border));
  }
  
  .title-group {
    .main-title { 
      font-size: 28px; 
      font-weight: 950; 
      letter-spacing: -1px; 
      margin: 0; 
      line-height: 1;
    }
    .sub-title { 
      font-size: 11px; 
      color: $color-primary; 
      font-weight: 800; 
      margin-top: 5px;
    }
  }
}

.header-center {
  display: flex;
  gap: 40px;
  .hud-stat-box {
    display: flex;
    flex-direction: column;
    .label { font-size: 10px; color: $color-text-light; text-transform: uppercase; font-weight: 900; }
    .value { font-size: 18px; font-weight: 950; color: $color-primary; }
  }
}

.header-right {
  .control-group {
    display: flex;
    flex-direction: row; // Explicitly row
    align-items: center;
    justify-content: flex-end;
    gap: 30px; // Larger gap to ensure no overlap from shadows
    flex-wrap: nowrap;
  }
}

.brutal-exit-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  line-height: 1;

  svg {
    vertical-align: middle;
  }
}

.monitor-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.brutal-scanline {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
  background-size: 100% 4px, 3px 100%;
  z-index: 50;
}

.brutal-corner {
  position: absolute;
  width: 40px; height: 40px;
  border: 6px solid var(--color-border);
  z-index: 60;
  &.tl { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
  &.tr { top: 20px; right: 20px; border-left: 0; border-bottom: 0; }
  &.bl { bottom: 20px; left: 20px; border-right: 0; border-top: 0; }
  &.br { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }
}

.monitor-footer {
  height: 50px;
  background: var(--color-border);
  color: var(--color-surface);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
}

.ticker-box {
  display: flex;
  width: 100%;
  overflow: hidden;
  .ticker-prefix { font-weight: 950; margin-right: 20px; white-space: nowrap; }
}

.ticker-track {
  display: flex;
  gap: 60px;
  animation: ticker-move 40s linear infinite;
}

.ticker-item { font-size: 13px; font-weight: 800; white-space: nowrap; }

@keyframes ticker-move {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
