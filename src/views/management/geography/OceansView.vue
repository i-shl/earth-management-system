<template>
  <div class="oceans-management">
    <div class="panel-header">
      <div class="header-left">
        <h2>🌊 全球海洋管理系统</h2>
        <span class="subtitle">监控 {{ earthStore.oceans.length }} 个海洋生态系统</span>
      </div>
      <NeoButton @click="showAddOceanDialog = true" class="add-button">
        + 添加海洋
      </NeoButton>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-overview">
      <div class="stat-card" v-for="stat in oceanStats" :key="stat.label">
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" :class="stat.trendClass">{{ stat.trend }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3>🌍 海洋面积分布</h3>
          <span class="chart-desc">全球五大洋面积占比</span>
        </div>
        <div ref="areaChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3>🌡️ 海洋温度对比</h3>
          <span class="chart-desc">各海洋平均温度</span>
        </div>
        <div ref="tempChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3>💧 污染指数监测</h3>
          <span class="chart-desc">海洋健康状况评估</span>
        </div>
        <div ref="pollutionChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3>📊 深度分析</h3>
          <span class="chart-desc">最大深度与平均深度对比</span>
        </div>
        <div ref="depthChart" class="chart"></div>
      </div>
    </div>

    <!-- 海洋详情卡片 -->
    <div class="oceans-section">
      <div class="section-title">
        <h3>🗺️ 海洋详细信息</h3>
        <div class="filter-buttons">
          <button :class="{ active: filterPollution === 'all' }" @click="filterPollution = 'all'">全部</button>
          <button :class="{ active: filterPollution === 'low' }" @click="filterPollution = 'low'">低污染</button>
          <button :class="{ active: filterPollution === 'medium' }" @click="filterPollution = 'medium'">中污染</button>
          <button :class="{ active: filterPollution === 'high' }" @click="filterPollution = 'high'">高污染</button>
        </div>
      </div>
      <div class="oceans-grid">
        <div v-for="ocean in filteredOceans" :key="ocean.id" class="ocean-card">
          <div class="ocean-header">
            <span class="ocean-icon">🌊</span>
            <h3>{{ ocean.name }}</h3>
            <div class="pollution-badge" :class="getPollutionClass(ocean.pollutionLevel)">
              {{ getPollutionLabel(ocean.pollutionLevel) }}
            </div>
          </div>
          <div class="ocean-stats">
            <div class="stat-row">
              <span class="label">面积:</span>
              <span class="value">{{ formatNumber(ocean.area) }} km²</span>
            </div>
            <div class="stat-row">
              <span class="label">最大深度:</span>
              <span class="value">{{ formatNumber(ocean.maxDepth) }} m</span>
            </div>
            <div class="stat-row">
              <span class="label">平均深度:</span>
              <span class="value">{{ formatNumber(ocean.avgDepth) }} m</span>
            </div>
            <div class="stat-row">
              <span class="label">水体体积:</span>
              <span class="value">{{ formatNumber(ocean.volume) }} km³</span>
            </div>
            <div class="stat-row">
              <span class="label">平均温度:</span>
              <span class="value">{{ ocean.temperature }}°C</span>
            </div>
            <div class="stat-row">
              <span class="label">盐度:</span>
              <span class="value">{{ ocean.salinity }}‰</span>
            </div>
          </div>
          <div class="pollution-level">
            <div class="pollution-header">
              <span class="label">污染指数:</span>
              <span class="level-value" :class="getPollutionClass(ocean.pollutionLevel)">{{ ocean.pollutionLevel }}%</span>
            </div>
            <div class="level-bar">
              <div class="level-fill" :style="{ width: ocean.pollutionLevel + '%' }" :class="getPollutionClass(ocean.pollutionLevel)"></div>
            </div>
          </div>
          <div class="ocean-actions">
            <NeoButton @click="viewOceanDetails(ocean)" class="action-btn">详情</NeoButton>
            <NeoButton @click="monitorOcean(ocean)" class="action-btn monitor">监测</NeoButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加海洋对话框 -->
    <NeoDialog v-model="showAddOceanDialog" title="添加海洋">
      <form @submit.prevent="handleAddOcean" class="dialog-form">
        <NeoInput v-model="newOcean.name" placeholder="海洋名称" label="名称" required />
        <div class="form-row">
          <NeoInput v-model.number="newOcean.area" placeholder="面积" label="面积 (km²)" type="number" />
          <NeoInput v-model.number="newOcean.maxDepth" placeholder="最大深度" label="最大深度 (m)" type="number" />
        </div>
        <div class="form-row">
          <NeoInput v-model.number="newOcean.temperature" placeholder="平均温度" label="温度(°C)" type="number" />
          <NeoInput v-model.number="newOcean.salinity" placeholder="盐度" label="盐度(‰)" type="number" />
        </div>
        <div class="form-actions">
          <NeoButton nativeType="button" @click="showAddOceanDialog = false">取消</NeoButton>
          <NeoButton nativeType="submit" class="submit-btn">添加</NeoButton>
        </div>
      </form>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { NeoButton, NeoDialog, NeoInput } from 'neo-brutal-vue'
import { useEarthStore, type Ocean } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const showAddOceanDialog = ref(false)
const filterPollution = ref('all')
const areaChart = ref<HTMLElement>()
const tempChart = ref<HTMLElement>()
const pollutionChart = ref<HTMLElement>()
const depthChart = ref<HTMLElement>()

let charts: echarts.ECharts[] = []
const handleResize = () => charts.forEach(c => c.resize())

const newOcean = reactive({
  name: '',
  area: 0,
  maxDepth: 0,
  avgDepth: 0,
  volume: 0,
  temperature: 0,
  salinity: 0,
  pollutionLevel: 0
})

// 统计数据
const oceanStats = computed(() => {
  const oceans = earthStore.oceans
  const totalArea = oceans.reduce((sum, o) => sum + o.area, 0)
  const avgTemp = oceans.reduce((sum, o) => sum + o.temperature, 0) / oceans.length
  const avgPollution = oceans.reduce((sum, o) => sum + o.pollutionLevel, 0) / oceans.length
  const maxDepth = Math.max(...oceans.map(o => o.maxDepth))

  return [
    { icon: '🌍', value: formatNumber(totalArea) + ' km²', label: '总海洋面积', trend: '占地球71%', trendClass: 'neutral' },
    { icon: '🌡️', value: avgTemp.toFixed(1) + '°C', label: '平均温度', trend: '+0.3°C vs 去年', trendClass: 'warning' },
    { icon: '💧', value: avgPollution.toFixed(0) + '%', label: '平均污染指数', trend: avgPollution < 50 ? '健康' : '需关注', trendClass: avgPollution < 50 ? 'success' : 'danger' },
    { icon: '📏', value: formatNumber(maxDepth) + ' m', label: '最大深度', trend: '马里亚纳海沟', trendClass: 'neutral' }
  ]
})

const filteredOceans = computed(() => {
  if (filterPollution.value === 'all') return earthStore.oceans

  return earthStore.oceans.filter(o => {
    const pollutionClass = getPollutionClass(o.pollutionLevel)
    return pollutionClass === filterPollution.value
  })
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const getPollutionClass = (level: number) => {
  if (level < 40) return 'low'
  if (level < 70) return 'medium'
  return 'high'
}

const getPollutionLabel = (level: number) => {
  if (level < 40) return '低污染'
  if (level < 70) return '中污染'
  return '高污染'
}

const viewOceanDetails = (ocean: Ocean) => {
  alert(`${ocean.name} 详情：\n面积：${formatNumber(ocean.area)} km²\n最大深度：${formatNumber(ocean.maxDepth)} m\n平均温度：${ocean.temperature}°C\n污染指数：${ocean.pollutionLevel}%`)
}

const monitorOcean = (ocean: Ocean) => {
  alert(`开始监测 ${ocean.name}...`)
}

const handleAddOcean = () => {
  if (!newOcean.name) return
  earthStore.addOcean({ ...newOcean })
  showAddOceanDialog.value = false
  Object.assign(newOcean, { name: '', area: 0, maxDepth: 0, avgDepth: 0, volume: 0, temperature: 0, salinity: 0, pollutionLevel: 0 })
}

// 初始化面积分布图
const initAreaChart = () => {
  if (!areaChart.value) return

  const chart = echarts.init(areaChart.value)
  const data = earthStore.oceans.map(o => ({
    name: o.name,
    value: o.area
  }))

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} km² ({d}%)' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontWeight: 'bold'
      },
      data: data
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化温度对比图
const initTempChart = () => {
  if (!tempChart.value) return

  const chart = echarts.init(tempChart.value)
  const data = earthStore.oceans.map(o => ({
    name: o.name,
    value: o.temperature
  }))

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { rotate: 30, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      name: '温度 (°C)',
      axisLabel: { formatter: '{value}°C' }
    },
    series: [{
      type: 'bar',
      data: data.map(d => d.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ]),
        borderRadius: [8, 8, 0, 0]
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}°C',
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化污染指数图
const initPollutionChart = () => {
  if (!pollutionChart.value) return

  const chart = echarts.init(pollutionChart.value)
  const data = earthStore.oceans.map(o => ({
    name: o.name,
    value: o.pollutionLevel
  }))

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { rotate: 30, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      name: '污染指数 (%)',
      max: 100
    },
    series: [{
      type: 'line',
      data: data.map(d => d.value),
      smooth: true,
      lineStyle: {
        color: '#f44336',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(244, 67, 54, 0.5)' },
          { offset: 1, color: 'rgba(244, 67, 54, 0.1)' }
        ])
      },
      itemStyle: { color: '#f44336' },
      markLine: {
        data: [
          { yAxis: 40, name: '低污染线', lineStyle: { color: '#4CAF50' } },
          { yAxis: 70, name: '高污染线', lineStyle: { color: '#FF9800' } }
        ]
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化深度对比图
const initDepthChart = () => {
  if (!depthChart.value) return

  const chart = echarts.init(depthChart.value)
  const names = earthStore.oceans.map(o => o.name)
  const maxDepths = earthStore.oceans.map(o => o.maxDepth)
  const avgDepths = earthStore.oceans.map(o => o.avgDepth)

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['最大深度', '平均深度'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { rotate: 30, fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      name: '深度 (m)',
      axisLabel: { formatter: '{value}m' }
    },
    series: [
      {
        name: '最大深度',
        type: 'bar',
        data: maxDepths,
        itemStyle: { color: '#2196F3' }
      },
      {
        name: '平均深度',
        type: 'bar',
        data: avgDepths,
        itemStyle: { color: '#03A9F4' }
      }
    ]
  }

  chart.setOption(option)
  charts.push(chart)
}

onMounted(() => {
  initAreaChart()
  initTempChart()
  initPollutionChart()
  initDepthChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.oceans-management {
  padding: 24px;
}

.panel-header {
  @include flex-between;
  margin-bottom: 25px;

  .header-left {
    h2 {
      margin: 0;
      font-size: 26px;
      font-weight: 900;
      color: $color-text;
      letter-spacing: -1px;
    }
    .subtitle {
      color: $color-text-light;
      font-size: 14px;
      font-weight: 600;
      margin-top: 5px;
    }
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  @include neobrutal-card;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 24px;
  background: var(--color-surface);
  transition: $transition-smooth;

  &:hover { transform: translate(-4px, -4px); box-shadow: 8px 8px 0 var(--color-border); }

  .stat-icon { font-size: 44px; }
  .stat-content {
    flex: 1;
    .stat-value { font-size: 24px; font-weight: 900; color: $color-text; letter-spacing: -1px; }
    .stat-label { font-size: 12px; font-weight: 700; color: $color-text-light; text-transform: uppercase; }
    .stat-trend {
      font-size: 11px;
      font-weight: 800;
      margin-top: 4px;
      &.success { color: $color-success; }
      &.warning { color: $color-warning; }
      &.danger { color: $color-error; }
      &.neutral { color: $color-text-light; }
    }
  }
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  margin-bottom: 30px;
}

.chart-container {
  @include neobrutal-card;
  padding: 25px;
  background: var(--color-surface);

  .chart-header {
    margin-bottom: 20px;
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      color: $color-text;
    }
    .chart-desc {
      font-size: 12px;
      font-weight: 600;
      color: $color-text-light;
    }
  }
}

.chart {
  height: 300px;
}

.oceans-section {
  @include neobrutal-card;
  padding: 25px;
  background: var(--color-surface);
}

.section-title {
  @include flex-between;
  margin-bottom: 25px;

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: $color-text;
  }
}

.filter-buttons {
  display: flex;
  gap: 10px;

  button {
    padding: 8px 16px;
    border: 2px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface);
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: $transition-smooth;

    &:hover { background: var(--color-surface-alt); }
    &.active {
      background: $color-primary;
      color: white;
      box-shadow: 3px 3px 0 var(--color-border);
    }
  }
}

.oceans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.ocean-card {
  padding: 24px;
  border-radius: $radius-lg;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  transition: $transition-smooth;

  &:hover { transform: translateY(-5px); box-shadow: 0 10px 0 rgba(0,0,0,0.05); }

  .ocean-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 3px solid var(--color-divider);

    .ocean-icon { font-size: 30px; }
    h3 { margin: 0; font-size: 20px; font-weight: 900; flex: 1; }
    .pollution-badge {
      padding: 4px 10px;
      border: 2px solid var(--color-border);
      border-radius: 20px;
      font-size: 11px;
      font-weight: 900;
      box-shadow: 2px 2px 0 var(--color-border);
      &.low { background: $color-success; color: white; }
      &.medium { background: $color-warning; color: white; }
      &.high { background: $color-error; color: white; }
    }
  }
}

.ocean-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  .stat-row {
    display: flex;
    flex-direction: column;
    .label { font-size: 11px; font-weight: 700; color: $color-text-light; text-transform: uppercase; }
    .value { font-size: 13px; font-weight: 800; color: $color-text; }
  }
}

.pollution-level {
  background: var(--color-surface-alt);
  padding: 15px;
  border: 2px solid var(--color-border);
  border-radius: $radius-md;
  margin-bottom: 15px;

  .pollution-header {
    @include flex-between;
    margin-bottom: 8px;
    .label { font-size: 11px; font-weight: 800; color: $color-text; }
    .level-value { font-size: 12px; font-weight: 900; &.low { color: $color-success; } &.medium { color: $color-warning; } &.high { color: $color-error; } }
  }

  .level-bar {
    height: 10px;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 5px;
    overflow: hidden;

    .level-fill {
      height: 100%;
      transition: width 0.8s ease;
      &.low { background: $color-success; }
      &.medium { background: $color-warning; }
      &.high { background: $color-error; }
    }
  }
}

.ocean-actions {
  display: flex;
  gap: 10px;

  .action-btn {
    flex: 1;
    font-weight: 800;
    @include neobrutal-button;
    background: $color-primary;
    color: white;

    &.monitor {
      background: $color-info;
    }
  }
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 15px;
}

.submit-btn {
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.add-button {
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}
</style>
