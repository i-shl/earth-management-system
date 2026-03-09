<template>
  <div class="management-container" :class="{ 'dark-mode': themeStore.theme === 'dark' }">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <Globe class="globe-icon animate-spin" :size="32" />
        <div class="title-group">
          <h1 class="title">地球管理系统</h1>
          <span class="subtitle">GLOBAL CONTROL v2.1</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="status-indicator">
          <Activity class="icon pulse" :size="16" />
          系统运行中
        </div>
        
        <ThemeSwitcher />

        <NeoButton @click="router.push('/dashboard')" class="monitor-btn">
          <MonitorPlay :size="18" />
          数据大屏
        </NeoButton>

        <div class="user-profile">
          <div class="user-avatar"><User :size="20" /></div>
          <span class="username">{{ earthStore.currentUser?.username }}</span>
          <NeoButton @click="handleLogout" class="logout-link"><LogOut :size="16" /> 登出</NeoButton>
        </div>
      </div>
    </header>

    <div class="layout">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <Menu :size="18" />
          <span>管理控制台</span>
        </div>
        
        <nav class="nav-menu">
          <div class="nav-group" v-for="group in menuGroups" :key="group.label">
            <div class="group-label">{{ group.label }}</div>
            <div 
              v-for="item in group.items" 
              :key="item.key"
              class="nav-item"
              :class="{ active: isRouteActive(item.routeName) }"
              @click="router.push({ name: item.routeName })"
            >
              <component :is="item.icon" class="nav-icon" :size="18" />
              <span class="nav-label">{{ item.label }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
              <ChevronRight v-if="isRouteActive(item.routeName)" class="active-indicator" :size="16" />
            </div>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="time-box">
             <Calendar :size="14" />
             <span>{{ currentTime }}</span>
          </div>
        </div>
      </aside>

      <!-- 主视图区域 -->
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Globe, LogOut, User, Activity, Menu, LayoutDashboard,
  Map, Waves, Flag, Users, CloudRain, Zap, TreeDeciduous, Bell, ClipboardList,
  Dog, Wind, Satellite, MonitorPlay, ChevronRight, Calendar
} from 'lucide-vue-next'
import { NeoButton } from 'neo-brutal-vue'
import ThemeSwitcher from '../../components/common/ThemeSwitcher.vue'
import { useEarthStore } from '../../stores/earthStore'
import { useThemeStore } from '../../stores/themeStore'

const router = useRouter()
const route = useRoute()
const earthStore = useEarthStore()
const themeStore = useThemeStore()

const currentTime = ref('')
let timer: ReturnType<typeof setInterval> | null = null

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString()
}

const menuGroups = [
  {
    label: '控制中心',
    items: [
      { key: 'overview', routeName: 'Overview', label: '控制台概览', icon: LayoutDashboard },
    ]
  },
  {
    label: '地理要素',
    items: [
      { key: 'continents', routeName: 'Continents', label: '大洲分布', icon: Map },
      { key: 'oceans', routeName: 'Oceans', label: '海洋板块', icon: Waves },
      { key: 'countries', routeName: 'Countries', label: '国家主权', icon: Flag },
    ]
  },
  {
    label: '生物圈',
    items: [
      { key: 'humans', routeName: 'Humans', label: '人口普查', icon: Users },
      { key: 'species', routeName: 'Species', label: '物种多样性', icon: Dog },
    ]
  },
  {
    label: '生态环境',
    items: [
      { key: 'environment', routeName: 'Environment', label: '地表监控', icon: TreeDeciduous },
      { key: 'atmosphere', routeName: 'Atmosphere', label: '大气轨道', icon: CloudRain },
      { key: 'weather', routeName: 'Weather', label: '气象预报', icon: Wind },
      { key: 'resources', routeName: 'Resources', label: '资源储备', icon: Zap },
    ]
  },
  {
    label: '运维与太空',
    items: [
      { key: 'satellites', routeName: 'Satellites', label: '近地卫星', icon: Satellite },
      { key: 'events', routeName: 'Events', label: '紧急事态', icon: Bell, badge: earthStore.criticalEvents.length },
      { key: 'logs', routeName: 'Logs', label: '系统日志', icon: ClipboardList },
    ]
  }
]

const isRouteActive = (name: string) => {
  return route.name === name || route.matched.some(m => m.name === name)
}

const handleLogout = () => {
  earthStore.logout()
  router.push('/login')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  earthStore.initStore()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
@use "../../styles/variables" as *;

.management-container {
  min-height: 100vh;
  background-color: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
  transition: all 0.3s ease;
}

.header {
  height: 70px;
  background-color: var(--color-surface);
  border-bottom: $border-main;
  @include flex-between;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .globe-icon { color: $color-primary; }
    
    .title-group {
       h1 { font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -1px; }
       span { font-size: 10px; font-weight: 700; color: $color-primary; }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 25px;
  }
}

.status-indicator {
  padding: 6px 14px;
  background: $color-success;
  color: white;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid var(--color-border);
  box-shadow: 2px 2px 0 var(--color-border);
  
  .pulse { animation: pulse 2s infinite; }
}

.monitor-btn {
  background: var(--color-primary);
  color: white;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 20px;
  border-left: 2px dashed var(--color-border-subtle);

  .user-avatar { 
    width: 32px; height: 32px; background: $color-primary; color: white;
    border-radius: 50%; @include flex-center; border: 2.5px solid var(--color-border);
  }
  
  .username { font-weight: 800; font-size: 14px; }
  
  .logout-link {
    background: transparent; border: none; font-size: 12px; font-weight: 700;
    color: $color-error; cursor: pointer; display: flex; align-items: center; gap: 4px;
    &:hover { text-decoration: underline; }
  }
}

.layout {
  display: flex;
  height: calc(100vh - 70px);
}

.sidebar {
  width: 260px;
  background-color: var(--color-surface);
  border-right: $border-main;
  display: flex;
  flex-direction: column;
  
  .sidebar-header {
    padding: 20px 24px;
    font-weight: 950;
    font-size: 13px;
    text-transform: uppercase;
    color: $color-text-light;
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 10px 12px;
}

.nav-group {
  margin-bottom: 20px;
  
  .group-label {
    font-size: 11px;
    font-weight: 900;
    color: $color-text-light;
    padding-left: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
}

.nav-item {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  margin-bottom: 4px;
  border-radius: $radius-md;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
    transform: translateX(4px);
  }
  
  &.active {
    background-color: var(--color-primary);
    color: white;
    border: 2px solid var(--color-border);
    box-shadow: 3px 3px 0 var(--color-border);
    transform: translate(-2px, -2px);
    
    .nav-icon { color: white; }
  }
  
  .nav-icon { color: $color-primary; }
  .nav-label { flex: 1; }
  
  .nav-badge {
    background: $color-error;
    color: white;
    padding: 2px 6px;
    border-radius: $radius-sm;
    font-size: 10px;
    font-weight: 900;
  }
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px dashed var(--color-border-subtle);
  
  .time-box {
    background: var(--color-surface-alt);
    padding: 8px 12px;
    border-radius: $radius-sm;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.main-content {
  flex: 1;
  background-color: var(--color-bg);
  overflow-y: auto;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
