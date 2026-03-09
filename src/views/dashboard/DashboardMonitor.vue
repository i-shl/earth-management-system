<template>
  <div class="dashboard-container">
    <!-- 顶部数据概览 -->
    <div class="stats-grid">
      <div class="stat-card neo-brutal-card" v-for="stat in topStats" :key="stat.label">
        <div class="stat-icon-area">{{ stat.icon }}</div>
        <div class="stat-info">
          <div class="stat-label">监测节点::{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trend">
            {{ stat.trend === 'up' ? '▲' : stat.trend === 'down' ? '▼' : '▬' }} {{ stat.change }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主交互中心 -->
    <div class="main-layout">
      <!-- 左侧：核心指标矩阵 -->
      <div class="charts-matrix">
        <div class="matrix-item neo-brutal-card" v-for="chart in chartsConfig" :key="chart.id">
          <div class="matrix-header">
            <div class="m-title">
              <span class="m-code">[{{ chart.code }}]</span>
              <span class="m-name">{{ chart.title }}</span>
            </div>
            <div class="m-status">实时更新中...</div>
          </div>
          <div :ref="chart.refName" class="matrix-canvas"></div>
        </div>
      </div>

      <!-- 右侧：指令流与预警 -->
      <div class="command-center">
        <div class="event-module neo-brutal-card">
          <div class="module-header">
            <div class="h-title">🚨 紧急突发事件指令集</div>
            <div class="h-count">{{ ongoingEvents.length }} 条待处理</div>
          </div>
          <div class="event-feed">
            <div
              v-for="event in recentEvents"
              :key="event.id"
              class="feed-node"
              :class="event.severity"
            >
              <div class="node-time">{{ formatTimeShort(event.timestamp) }}</div>
              <div class="node-content">
                <div class="node-t">{{ event.title }}</div>
                <div class="node-l">坐标::{{ event.location }}</div>
              </div>
              <div class="node-badge">{{ getSeverityText(event.severity) }}</div>
            </div>
          </div>
        </div>

        <div class="system-status-module neo-brutal-card">
          <div class="module-header">
            <div class="h-title">🛡️ 系统资源完整性</div>
          </div>
          <div class="status-grid">
            <div class="status-cell">
              <div class="s-label">CPU 负载</div>
              <div class="s-bar-container"><div class="s-bar" style="width: 42%"></div></div>
              <div class="s-val">42%</div>
            </div>
            <div class="status-cell">
              <div class="s-label">核心内存</div>
              <div class="s-bar-container"><div class="s-bar" style="width: 68%"></div></div>
              <div class="s-val">68%</div>
            </div>
            <div class="status-cell">
              <div class="s-label">数据吞吐</div>
              <div class="s-bar-container"><div class="s-bar" style="width: 85%"></div></div>
              <div class="s-val">85%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { useEarthStore } from '../../stores/earthStore'
import { useThemeStore } from '../../stores/themeStore'

const earthStore = useEarthStore()
const themeStore = useThemeStore()

const populationChart = ref<HTMLElement>()
const resourceChart = ref<HTMLElement>()
const environmentChart = ref<HTMLElement>()
const economyChart = ref<HTMLElement>()

const chartsConfig = [
  { id: 'pop', title: '全球人口地理分布', code: 'P-08', refName: populationChart },
  { id: 'res', title: '自然资源储备指数', code: 'R-44', refName: resourceChart },
  { id: 'env', title: '全球生态健康监测', code: 'E-12', refName: environmentChart },
  { id: 'eco', title: '地区生产总值(GDP)', code: 'G-99', refName: economyChart },
]

let chartInstances: echarts.ECharts[] = []

const topStats = computed(() => [
  { icon: '👥', value: formatNumber(earthStore.totalPopulation), label: '全球总人口', change: '+0.8%', trend: 'up' },
  { icon: '🗺️', value: earthStore.totalCountries.toString(), label: '注册国家', change: '+2', trend: 'up' },
  { icon: '🌊', value: earthStore.oceans.length.toString(), label: '公海领域', change: '0', trend: 'neutral' },
  { icon: '🗻', value: formatNumber(earthStore.totalLandArea), label: '陆地总面积', change: '-0.01%', trend: 'down' },
  { icon: '⚡', value: earthStore.avgHappinessIndex.toString(), label: '社会稳定性', change: '+0.2', trend: 'up' },
  { icon: '🔥', value: earthStore.criticalEvents.length.toString(), label: '紧急预警', change: '-1', trend: 'down' }
])

const ongoingEvents = computed(() => earthStore.ongoingEvents)
const recentEvents = computed(() => {
  return [...earthStore.events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 12)
})

const getSeverityText = (severity: string) => {
  const map: Record<string, string> = {
    critical: '危急',
    high: '高危',
    medium: '中等',
    low: '正常'
  }
  return map[severity] || severity
}

const formatNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatTimeShort = (timestamp: string) => {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const getChartThemeColors = () => {
  const isDark = themeStore.theme === 'dark'
  return isDark 
    ? ['#818cf8', '#a78bfa', '#fb7185', '#34d399', '#fbbf24'] 
    : ['#6366f1', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b']
}

const getDom = (target: HTMLElement | HTMLElement[] | null | undefined) => {
  if (!target) return null
  if (Array.isArray(target)) return target[0] || null
  return target
}

const initSubCharts = () => {
  const isDark = themeStore.theme === 'dark'
  const textColor = isDark ? '#fff' : '#000'
  const colors = getChartThemeColors()

  // Population
  const popDom = getDom(populationChart.value as unknown as HTMLElement | HTMLElement[] | null)
  if (popDom) {
    const chart = echarts.init(popDom)
    chart.setOption({
      backgroundColor: 'transparent',
      color: colors,
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        itemStyle: { borderRadius: 0, borderColor: '#000', borderWidth: 3 },
        label: { show: true, color: textColor, fontWeight: 'bold', fontSize: 10 },
        data: earthStore.continents.map(c => ({ name: c.name, value: c.population }))
      }]
    })
    chartInstances.push(chart)
  }

  // Resources
  const resDom = getDom(resourceChart.value as unknown as HTMLElement | HTMLElement[] | null)
  if (resDom) {
    const chart = echarts.init(resDom)
    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 20, bottom: 30, left: 50, right: 20 },
      xAxis: { type: 'category', data: earthStore.resources.slice(0, 5).map(r => r.name), axisLabel: { fontSize: 10, color: textColor, fontWeight: 'bold' }, axisLine: { lineStyle: { color: textColor, width: 3 } } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: textColor, opacity: 0.1 } }, axisLabel: { fontSize: 10, color: textColor, fontWeight: 'bold' }, axisLine: { lineStyle: { color: textColor, width: 3 } } },
      series: [{ type: 'bar', barWidth: 20, itemStyle: { color: colors[0], borderColor: '#000', borderWidth: 3, shadowColor: '#000', shadowBlur: 0, shadowOffsetX: 4, shadowOffsetY: 4 }, data: earthStore.resources.slice(0, 5).map(r => Math.log10(r.totalReserve)) }]
    })
    chartInstances.push(chart)
  }

  // Environment
  const envDom = getDom(environmentChart.value as unknown as HTMLElement | HTMLElement[] | null)
  if (envDom) {
    const chart = echarts.init(envDom)
    const env = earthStore.environments[0]
    if (env) {
      chart.setOption({
        backgroundColor: 'transparent',
        radar: {
          indicator: [
            { name: '空气质量', max: 100 }, { name: '水质', max: 100 }, { name: '土壤质量', max: 100 },
            { name: '生物多样性', max: 100 }, { name: '森林覆盖', max: 100 }
          ],
          shape: 'polygon',
          splitNumber: 4,
          axisName: { color: textColor, fontSize: 10, fontWeight: 'bold' },
          splitArea: { show: false },
          splitLine: { lineStyle: { color: textColor, width: 2, opacity: 0.2 } },
          axisLine: { lineStyle: { color: textColor, width: 2, opacity: 0.2 } }
        },
        series: [{
          type: 'radar',
          data: [{ value: [env.airQuality, env.waterQuality, env.soilQuality, env.biodiversity, env.forestCoverage] }],
          areaStyle: { color: colors[2], opacity: 0.5 },
          lineStyle: { color: colors[2], width: 4 },
          symbol: 'rect',
          symbolSize: 8,
          itemStyle: { color: '#000' }
        }]
      })
    }
    chartInstances.push(chart)
  }

  // Economy
  const ecoDom = getDom(economyChart.value as unknown as HTMLElement | HTMLElement[] | null)
  if (ecoDom) {
    const chart = echarts.init(ecoDom)
    const data = earthStore.allCountries.slice(0, 8).map(c => ({ name: c.name, value: c.gdp }))
    chart.setOption({
      backgroundColor: 'transparent',
      grid: { top: 20, bottom: 30, left: 60, right: 20 },
      xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { fontSize: 10, color: textColor, fontWeight: 'bold' }, axisLine: { lineStyle: { color: textColor, width: 3 } } },
      yAxis: { type: 'category', data: data.map(d => d.name).reverse(), axisLabel: { fontSize: 10, color: textColor, fontWeight: 'bold' }, axisLine: { lineStyle: { color: textColor, width: 3 } } },
      series: [{ type: 'bar', barWidth: 15, itemStyle: { color: colors[3], borderColor: '#000', borderWidth: 3, shadowColor: '#000', shadowBlur: 0, shadowOffsetX: 4, shadowOffsetY: 4 }, data: data.map(d => d.value).reverse() }]
    })
    chartInstances.push(chart)
  }
}

const resizeAll = () => chartInstances.forEach(c => c.resize())

watch(() => themeStore.theme, () => {
  chartInstances.forEach(c => c.dispose())
  chartInstances = []
  nextTick(() => {
    initSubCharts()
  })
})

onMounted(async () => {
  await nextTick()
  initSubCharts()
  window.addEventListener('resize', resizeAll)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeAll)
  chartInstances.forEach(c => c.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../styles/variables" as *;

.dashboard-container {
  min-height: auto;
  padding: 25px;
  background: $color-bg;
  color: $color-text;
  font-family: $font-mono;
  display: flex;
  flex-direction: column;
  gap: 25px;
  @include cyber-grid-bg;
}

// 顶部数据概览
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.stat-card {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--color-surface);
  
  .stat-icon-area {
    width: 50px; height: 50px;
    background: var(--color-border);
    color: var(--color-surface);
    @include flex-center;
    font-size: 28px;
    flex-shrink: 0;
  }
  
  .stat-info {
    flex: 1;
    .stat-label { font-size: 9px; font-weight: 900; color: $color-text-light; margin-bottom: 4px; }
    .stat-value { font-size: 22px; font-weight: 950; line-height: 1; margin-bottom: 4px; }
    .stat-trend {
      font-size: 10px; font-weight: 900;
      &.up { color: $color-success; }
      &.down { color: $color-error; }
      &.neutral { color: $color-info; }
    }
  }
}

// 主布局
.main-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 25px;
  min-height: 0;
}

// 左侧矩阵
.charts-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 25px;
}

.matrix-item {
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-alt);
  
  .matrix-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
    border-bottom: 3px solid var(--color-border);
    padding-bottom: 10px;
    
    .m-title {
      display: flex; gap: 10px;
      .m-code { color: $color-primary; font-weight: 950; }
      .m-name { font-weight: 950; letter-spacing: -0.5px; }
    }
    .m-status { font-size: 9px; font-weight: 900; color: $color-text-light; }
  }
  
  .matrix-canvas {
    flex: 1;
    min-height: 260px;
  }
}

// 右侧指令中心
.command-center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  min-height: 0;
}

.event-module {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  min-height: 0;
  
  .module-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
    .h-title { font-weight: 950; font-size: 16px; }
    .h-count { background: #000; color: #fff; padding: 2px 8px; font-size: 10px; font-weight: 900; }
  }
  
  .event-feed {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-right: 10px;
    
    &::-webkit-scrollbar { width: 8px; }
    &::-webkit-scrollbar-thumb { background: var(--color-border); }
    &::-webkit-scrollbar-track { background: var(--color-surface-alt); border: 2px solid var(--color-border); }
  }
}

.feed-node {
  padding: 12px;
  border: 3px solid var(--color-border);
  background: var(--color-surface-alt);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 15px;
  align-items: center;
  transition: all 0.2s;
  
  &:hover { transform: translate(-3px, -3px); box-shadow: 6px 6px 0 var(--color-border); }
  
  .node-time { font-weight: 950; color: $color-primary; font-size: 12px; }
  .node-t { font-weight: 950; font-size: 13px; }
  .node-l { font-size: 10px; font-weight: 800; color: $color-text-light; margin-top: 2px; }
  .node-badge { font-size: 9px; font-weight: 950; padding: 2px 6px; border: 2px solid currentColor; }
  
  &.critical { background: $color-error; color: white; border-color: #000; }
  &.high { border-left-width: 15px; border-left-color: $color-warning; }
}

.system-status-module {
  padding: 20px;
  background: var(--color-border);
  color: var(--color-surface);
  
  .h-title { font-weight: 950; font-size: 14px; margin-bottom: 15px; color: var(--color-surface); }
  
  .status-grid {
    display: flex; flex-direction: column; gap: 12px;
  }
  
  .status-cell {
    display: grid; grid-template-columns: 80px 1fr 40px; gap: 15px; align-items: center;
    .s-label { font-size: 10px; font-weight: 900; }
    .s-bar-container { height: 10px; background: var(--color-surface); border: 2px solid #000; }
    .s-bar { height: 100%; background: $color-primary; }
    .s-val { font-size: 10px; font-weight: 950; text-align: right; }
  }
}

@media (max-width: 1400px) {
  .stats-grid { grid-template-columns: repeat(3, 1fr); }
  .main-layout { grid-template-columns: 1fr; }
  .charts-matrix { height: 800px; }
}
</style>
