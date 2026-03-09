<template>
  <div class="satellites-view animate__animated animate__fadeIn">
    <!-- 顶部 HUD 框架 -->
    <div class="hud-top-frame">
      <div class="hud-inner">
        <span class="hud-tag">轨道系统_v4.2</span>
        <div class="hud-divider"></div>
        <span class="hud-coords">坐标::28.61, 77.20 // 扫描::活跃</span>
      </div>
    </div>

    <div class="section-header">
      <div class="header-left">
        <h2 class="brutal-title">🛰️ 轨道卫星监测中心</h2>
        <div class="header-subtitle">
          <span class="label">状态:</span>
          <span class="val green">正常</span>
          <span class="sep">/</span>
          <span class="label">在轨节点:</span>
          <span class="val">8,422 活跃</span>
        </div>
      </div>
      <div class="header-right">
        <div class="live-tag neo-brutal-card">
          <span class="pulse-dot"></span>
          实时数据
        </div>
        <NeoButton @click="handleDeploy"><Rocket :size="18" /> 部署新任务</NeoButton>
      </div>
    </div>

    <!-- 数据面板 -->
    <div class="data-grid">
      <div v-for="panel in panels" :key="panel.label" class="data-panel neo-brutal-card">
        <div class="p-icon-box">{{ panel.icon }}</div>
        <div class="p-content">
          <div class="p-label">{{ panel.label }}</div>
          <div class="p-value">{{ panel.value }}</div>
          <div class="p-trend" :class="panel.trendType">{{ panel.trend }}</div>
        </div>
      </div>
    </div>

    <div class="orbit-layout">
      <!-- 核心雷达展示区 -->
      <div class="orbit-radar-container neo-brutal-card">
        <div class="radar-header">
          <div class="radar-title">
            <span class="t-main">近地轨道网格可视化</span>
            <span class="t-sub">参考编号: LEO-99-ALPHA</span>
          </div>
          <div class="radar-legend">
            <span class="l-item comm"><span class="dot"></span> 通信</span>
            <span class="l-item nav"><span class="dot"></span> 导航</span>
            <span class="l-item sci"><span class="dot"></span> 科研</span>
            <span class="l-item weather"><span class="dot"></span> 气象</span>
          </div>
        </div>

        <div class="radar-viewport">
          <!-- 背景网格 -->
          <div class="radar-grid"></div>
          
          <!-- 扫描线 -->
          <div class="radar-beam"></div>

          <!-- 轨道圆环 -->
          <div class="orbit-ring-brutal" v-for="n in 3" :key="n" :style="{ '--size': (150 + n * 120) + 'px' }"></div>

          <!-- 中心地球 -->
          <div class="earth-brutal-core">
            <div class="core-globe">🌍</div>
            <div class="core-ring"></div>
            <div class="core-ring outer"></div>
          </div>

          <!-- 卫星资产 -->
          <div v-for="s in satellites" :key="s.id" class="sat-node"
               :class="s.type"
               :style="{
                 animationDuration: s.speed + 's',
                 '--dist': s.distance * 1.6 + 'px',
                 animationDelay: s.delay + 's'
               }">
            <div class="sat-hitbox" @mouseenter="hoveredSat = s" @mouseleave="hoveredSat = null">
              <div class="sat-visual">
                <Satellite :size="14" />
              </div>
              <div class="sat-id-tag">{{ s.name }}</div>
            </div>
          </div>

          <!-- 悬浮详情卡 -->
          <transition name="brutal-pop">
            <div class="sat-detail-card neo-brutal-card" v-if="hoveredSat">
              <div class="d-header">
                <h4>ID://{{ hoveredSat.name }}</h4>
                <div class="d-badge" :class="hoveredSat.type">{{ getTypeLabel(hoveredSat.type) }}</div>
              </div>
              <div class="d-body">
                <div class="d-row">
                  <span class="l">运营商</span>
                  <span class="v">{{ hoveredSat.owner }}</span>
                </div>
                <div class="d-row">
                  <span class="l">轨道高度</span>
                  <span class="v">{{ hoveredSat.alt }} KM</span>
                </div>
                <div class="d-row">
                  <span class="l">运行速度</span>
                  <span class="v">{{ hoveredSat.vel }} KM/S</span>
                </div>
                <div class="d-row signal">
                  <span class="l">信号强度</span>
                  <div class="s-bar">
                    <div class="s-fill" :style="{ width: hoveredSat.signal + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="orbit-sidebar">
        <div class="sidebar-module neo-brutal-card">
          <div class="m-header">
            <span class="m-title">轨道统计数据</span>
            <span class="m-id">STAT_01</span>
          </div>
          <div class="orbit-stats-list">
            <div v-for="type in orbitTypes" :key="type.name" class="stat-row">
              <div class="row-top">
                <span class="name">{{ type.name }}</span>
                <span class="val">{{ type.count }}</span>
              </div>
              <div class="row-bar">
                <div class="fill" :style="{ width: type.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-module neo-brutal-card">
          <div class="m-header">
            <span class="m-title">活跃节点列表</span>
            <span class="m-id">NODE_08</span>
          </div>
          <div class="node-list-mini">
            <div v-for="sat in earthStore.satellites.slice(0, 5)" :key="sat.id" class="node-item">
              <div class="n-info">
                <span class="n-name">{{ sat.name }}</span>
                <span class="n-owner">{{ sat.owner }}</span>
              </div>
              <div class="n-status" :class="sat.status">
                <span class="dot"></span>
                {{ sat.status === 'active' ? '在线' : '离线' }}
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-module alert-brutal neo-brutal-card">
          <div class="m-header">
            <span class="m-title">卫星碰撞预警</span>
            <span class="m-id">ALRT_99</span>
          </div>
          <div class="alert-stack">
            <div class="alert-card-mini" :class="alert.level" v-for="(alert, idx) in alerts" :key="idx">
              <div class="a-icon">!</div>
              <div class="a-body">
                <div class="a-title">{{ alert.title }}</div>
                <div class="a-desc">{{ alert.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Rocket, Satellite } from 'lucide-vue-next'
import { NeoButton } from 'neo-brutal-vue'
import { useEarthStore } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const hoveredSat = ref<any>(null)

const panels = [
  { label: '在轨资产总数', value: '8,422', icon: '🛰️', trend: '+12 本月', trendType: 'up' },
  { label: '活跃监测节点', value: '5,108', icon: '⚡', trend: '稳定', trendType: 'stable' },
  { label: '识别空间碎片', value: '34,012', icon: '⚠️', trend: '-2.4%', trendType: 'down' },
  { label: '全球覆盖率', value: '99.8%', icon: '📡', trend: '+0.2%', trendType: 'up' },
]

const orbitTypes = [
  { name: '低轨道 (LEO)', count: '5,478', percent: 65 },
  { name: '中轨道 (MEO)', count: '2,108', percent: 25 },
  { name: '高轨道 (GEO)', count: '836', percent: 10 },
]

const alerts = [
  { level: 'low', title: '轨道接近警告', desc: 'Starlink-442 与 碎片-8812 距离过近' },
  { level: 'med', title: '轨道衰减提醒', desc: '国际空间站需要进行轨道高度修正' },
]

const satellites = ref([
  { id: 1, name: 'SL-239', type: 'communication', distance: 100, speed: 8, delay: 0, owner: 'SPACEX', alt: 550, vel: 7.8, signal: 98 },
  { id: 2, name: 'SL-442', type: 'communication', distance: 110, speed: 9, delay: 2, owner: 'SPACEX', alt: 550, vel: 7.8, signal: 95 },
  { id: 3, name: 'SL-881', type: 'communication', distance: 120, speed: 10, delay: 4, owner: 'SPACEX', alt: 550, vel: 7.8, signal: 97 },
  { id: 4, name: '北斗-G4', type: 'navigation', distance: 160, speed: 15, delay: 1, owner: '中国航天', alt: 21500, vel: 3.9, signal: 99 },
  { id: 5, name: 'GPS-II', type: 'navigation', distance: 170, speed: 16, delay: 3, owner: '美国航天', alt: 20200, vel: 3.9, signal: 100 },
  { id: 6, name: '伽利略-24', type: 'navigation', distance: 150, speed: 14, delay: 5, owner: '欧空局', alt: 23222, vel: 3.6, signal: 96 },
  { id: 7, name: '哈勃望远镜', type: 'scientific', distance: 130, speed: 11, delay: 2, owner: 'NASA', alt: 547, vel: 7.6, signal: 92 },
  { id: 8, name: '空间站-01', type: 'scientific', distance: 125, speed: 10, delay: 6, owner: '国际空间站', alt: 408, vel: 7.7, signal: 100 },
  { id: 9, name: '天宫三号', type: 'scientific', distance: 128, speed: 11, delay: 4, owner: '中国航天', alt: 389, vel: 7.7, signal: 98 },
  { id: 10, name: '气象卫-11', type: 'weather', distance: 200, speed: 20, delay: 0, owner: '欧空局', alt: 35786, vel: 3.1, signal: 94 },
  { id: 11, name: 'GOES-17', type: 'weather', distance: 195, speed: 19, delay: 3, owner: 'NOAA', alt: 35786, vel: 3.1, signal: 96 },
  { id: 12, name: '风云-4B', type: 'weather', distance: 205, speed: 21, delay: 5, owner: '中国航天', alt: 35786, vel: 3.1, signal: 93 },
])

const handleDeploy = () => {
  console.warn('部署功能开发中...')
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    communication: '通信',
    navigation: '导航',
    scientific: '科研',
    weather: '气象'
  }
  return labels[type] || type
}
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.satellites-view {
  padding: 30px 40px;
  background: $color-bg;
  min-height: 100vh;
  font-family: $font-mono;
  position: relative;
  overflow: hidden;
  @include cyber-grid-bg;
}

// HUD Elements
.hud-top-frame {
  margin-bottom: 25px;
  .hud-inner {
    display: flex; align-items: center; gap: 20px;
    font-size: 11px; font-weight: 900; color: $color-text-light;
    .hud-tag { color: $color-primary; }
    .hud-divider { flex: 1; height: 3px; background: var(--color-border); }
  }
}

.section-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 35px;
  .brutal-title { font-size: 36px; font-weight: 950; letter-spacing: -2px; line-height: 1; margin: 0; }
  .header-subtitle { 
    margin-top: 8px; font-size: 12px; font-weight: 900; color: $color-text-light;
    .val { color: $color-primary; margin: 0 5px; }
    .green { color: $color-success; }
    .sep { opacity: 0.3; }
  }
}

.live-tag {
  @include neo-brutal-card;
  padding: 6px 16px; font-size: 12px; font-weight: 950; color: $color-primary;
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
  background: var(--color-surface);
  .pulse-dot { width: 8px; height: 8px; background: currentColor; border-radius: 50%; animation: brutal-blink 1s infinite; }
}

@keyframes brutal-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.brutal-btn {
  @include neo-brutal-btn;
  display: flex; align-items: center; gap: 10px;
}

// Data Grid
.data-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px;
  margin-bottom: 35px;
}

.data-panel {
  padding: 20px; display: flex; align-items: center; gap: 20px;
  .p-icon-box { font-size: 32px; filter: drop-shadow(4px 4px 0 rgba(0,0,0,0.1)); }
  .p-label { font-size: 10px; font-weight: 900; color: $color-text-light; text-transform: uppercase; }
  .p-value { font-size: 24px; font-weight: 950; line-height: 1.2; }
  .p-trend { 
    font-size: 10px; font-weight: 950; margin-top: 5px;
    &.up { color: $color-success; } &.down { color: $color-error; } &.stable { color: $color-info; }
  }
}

// Orbit Layout
.orbit-layout {
  display: grid; grid-template-columns: 1fr 340px; gap: 35px;
}

.orbit-radar-container {
  height: 750px; display: flex; flex-direction: column; background: var(--color-surface-alt);
  padding: 0; overflow: hidden;
  
  .radar-header {
    padding: 20px 30px; border-bottom: 4px solid var(--color-border);
    display: flex; justify-content: space-between; align-items: center;
    .radar-title { 
      display: flex; flex-direction: column;
      .t-main { font-weight: 950; font-size: 16px; letter-spacing: 1px; }
      .t-sub { font-size: 10px; color: $color-primary; font-weight: 900; }
    }
  }
}

.radar-legend {
  display: flex; gap: 20px;
  .l-item {
    font-size: 10px; font-weight: 950; display: flex; align-items: center; gap: 8px;
    .dot { width: 10px; height: 10px; border: 2px solid var(--color-border); }
    &.comm .dot { background: $color-primary; }
    &.nav .dot { background: $color-success; }
    &.sci .dot { background: $color-warning; }
    &.weather .dot { background: $color-secondary; }
  }
}

.radar-viewport {
  flex: 1; position: relative; @include flex-center; background: rgba(0,0,0,0.2);
  .radar-grid { position: absolute; top: 0; left: 0; width: 100%; height: 100%; @include cyber-grid-bg; opacity: 0.2; }
  .radar-beam {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    // 直接使用主色的 RGBA，避免未定义的 $color-primary-hex 变量
    background: conic-gradient(from 0deg, rgba(59, 130, 246, 0.1) 0%, transparent 20%);
    animation: radar-rotate 4s linear infinite; pointer-events: none;
  }
}

@keyframes radar-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.orbit-ring-brutal {
  position: absolute; width: var(--size); height: var(--size);
  border: 2px solid var(--color-border); border-radius: 50%; opacity: 0.3;
}

.earth-brutal-core {
  position: relative; z-index: 10;
  .core-globe { font-size: 100px; filter: drop-shadow(8px 8px 0 rgba(0,0,0,0.3)); }
  .core-ring {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 140px; height: 140px; border: 4px solid $color-primary; border-radius: 50%;
    animation: brutal-ripple 2s infinite;
    &.outer { animation-delay: 1s; }
  }
}

@keyframes brutal-ripple { 0% { transform: translate(-50%, -50%) scale(1); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; } }

.sat-node {
  position: absolute; animation: orbit-brutal linear infinite;
  .sat-hitbox {
    position: absolute; top: -20px; left: -20px; cursor: pointer;
    &:hover { transform: scale(1.5); z-index: 100; .sat-id-tag { opacity: 1; } }
  }
  .sat-visual { 
    padding: 6px; border: 3px solid currentColor; background: var(--color-surface);
    box-shadow: 3px 3px 0 #000;
  }
  .sat-id-tag {
    position: absolute; top: 110%; left: 50%; transform: translateX(-50%);
    background: #000; color: #fff; padding: 2px 6px; font-size: 9px; font-weight: 900;
    white-space: nowrap; opacity: 0; transition: 0.2s;
  }
  &.communication { color: $color-primary; } &.navigation { color: $color-success; }
  &.scientific { color: $color-warning; } &.weather { color: $color-secondary; }
}

@keyframes orbit-brutal { 
  from { transform: rotate(0deg) translateX(var(--dist)) rotate(0deg); }
  to { transform: rotate(360deg) translateX(var(--dist)) rotate(-360deg); }
}

// Sidebar
.orbit-sidebar { display: flex; flex-direction: column; gap: 25px; }
.sidebar-module {
  padding: 20px;
  .m-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 3px solid var(--color-border); padding-bottom: 8px; margin-bottom: 15px;
    .m-title { font-weight: 950; font-size: 12px; } .m-id { color: $color-primary; font-size: 10px; font-weight: 900; }
  }
}

.orbit-stats-list {
  display: flex; flex-direction: column; gap: 15px;
  .stat-row {
    .row-top { display: flex; justify-content: space-between; font-size: 11px; font-weight: 900; margin-bottom: 5px; }
    .row-bar { height: 12px; background: var(--color-surface); border: 2px solid var(--color-border); }
    .fill { height: 100%; background: $color-primary; border-right: 2px solid var(--color-border); }
  }
}

.node-list-mini {
  display: flex; flex-direction: column; gap: 10px;
  .node-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px; border: 2px solid var(--color-border);
    .n-name { font-weight: 950; font-size: 13px; display: block; }
    .n-owner { font-size: 9px; font-weight: 800; color: $color-text-light; }
    .n-status { 
      font-size: 9px; font-weight: 950; display: flex; align-items: center; gap: 6px;
      padding: 4px 8px; border: 2px solid currentColor;
      .dot { width: 6px; height: 6px; background: currentColor; }
      &.active { color: $color-success; }
    }
  }
}

.alert-brutal {
  background: var(--color-border); color: var(--color-surface);
  .m-title { color: var(--color-surface); } .m-id { color: $color-accent; }
  .alert-stack { display: flex; flex-direction: column; gap: 10px; }
  .alert-card-mini {
    padding: 10px; background: var(--color-surface); color: var(--color-text);
    border: 3px solid #000; box-shadow: 4px 4px 0 #000; display: flex; gap: 12px;
    .a-icon { font-weight: 950; color: $color-error; }
    .a-title { font-weight: 950; font-size: 11px; } .a-desc { font-size: 9px; opacity: 0.7; }
    &.med { border-left: 10px solid $color-error; }
  }
}

.sat-detail-card {
  position: absolute; bottom: 30px; right: 30px; width: 280px; z-index: 200;
  padding: 20px; background: var(--color-surface);
  .d-header { 
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 4px solid var(--color-border); padding-bottom: 10px; margin-bottom: 15px;
    h4 { margin: 0; font-weight: 950; }
    .d-badge { font-size: 10px; font-weight: 950; padding: 2px 8px; border: 2px solid currentColor; }
  }
  .d-row {
    display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px;
    .l { color: $color-text-light; font-weight: 800; } .v { font-weight: 950; }
    &.signal .s-bar { width: 80px; height: 10px; border: 2px solid var(--color-border); background: var(--color-surface-alt); }
    .s-fill { height: 100%; background: $color-success; }
  }
}

.brutal-pop-enter-active, .brutal-pop-leave-active { transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.brutal-pop-enter-from, .brutal-pop-leave-to { opacity: 0; transform: scale(0.5) translateY(20px); }

</style>
