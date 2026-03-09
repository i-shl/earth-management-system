<template>
  <div class="environment-monitor">
    <div class="section-header">
      <div class="header-left">
        <h2>🌱 环境监测系统</h2>
        <span class="subtitle">实时监测全球 {{ earthStore.environments.length }} 个区域</span>
      </div>
      <NeoButton @click="refreshData" class="refresh-btn">
        🔄 刷新数据
      </NeoButton>
    </div>

    <!-- 全球环境概览 -->
    <div class="global-environment">
      <div class="environment-card global">
        <div class="card-header">
          <span class="card-icon">🌍</span>
          <h3>全球环境综合指数</h3>
        </div>
        <div class="global-score">
          <div class="score-circle" :class="getGlobalScoreClass()">
            <span class="score-value">{{ globalEnvironmentScore }}</span>
            <span class="score-label">综合评分</span>
          </div>
        </div>
        <div class="global-alerts">
          <div class="alert-item critical" v-if="criticalAreas.length > 0">
            <span class="alert-icon">🚨</span>
            <span>{{ criticalAreas.length }} 个区域环境严重恶化</span>
          </div>
          <div class="alert-item warning" v-if="warningAreas.length > 0">
            <span class="alert-icon">⚠️</span>
            <span>{{ warningAreas.length }} 个区域需要注意</span>
          </div>
          <div class="alert-item good" v-if="goodAreas.length > 0">
            <span class="alert-icon">✅</span>
            <span>{{ goodAreas.length }} 个区域环境良好</span>
          </div>
        </div>
      </div>

      <!-- 关键指标 -->
      <div class="key-metrics">
        <div class="metric-card" v-for="metric in keyMetrics" :key="metric.label">
          <div class="metric-icon">{{ metric.icon }}</div>
          <div class="metric-info">
            <div class="metric-value" :class="metric.status">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-change" :class="metric.trend">{{ metric.change }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 环境指标图表 -->
    <div class="charts-section">
      <div class="chart-container">
        <h3>📊 各区域环境对比</h3>
        <div ref="regionChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <h3>📈 碳排放趋势</h3>
        <div ref="carbonChart" class="chart"></div>
      </div>
    </div>

    <!-- 区域环境详情 -->
    <div class="regions-section">
      <div class="section-title">
        <h3>🗺️ 区域环境详情</h3>
        <NeoSelect
          v-model="selectedRegion"
          :options="regionOptions"
          placeholder="选择区域"
        />
      </div>

      <div class="region-detail" v-if="currentRegion">
        <div class="detail-header">
          <h4>{{ currentRegion.region }}</h4>
          <div class="region-score" :class="getRegionScoreClass(currentRegion)">
            {{ calculateRegionScore(currentRegion) }}分
          </div>
        </div>

        <div class="indicators-grid">
          <div class="indicator-card" v-for="indicator in regionIndicators" :key="indicator.key">
            <div class="indicator-header">
              <span class="indicator-icon">{{ indicator.icon }}</span>
              <span class="indicator-name">{{ indicator.name }}</span>
            </div>
            <div class="indicator-value" :class="indicator.status">
              {{ indicator.value }}{{ indicator.unit }}
            </div>
            <div class="indicator-bar">
              <div class="indicator-fill" :style="{ width: indicator.percent + '%', background: indicator.color }"></div>
            </div>
            <div class="indicator-status">{{ indicator.statusText }}</div>
          </div>
        </div>

        <div class="environment-actions">
          <NeoButton @click="improveEnvironment" class="action-btn improve">
            🌱 启动环境改善计划
          </NeoButton>
          <NeoButton @click="addProtection" class="action-btn protect">
            🛡️ 加强环境保护
          </NeoButton>
          <NeoButton @click="viewReport" class="action-btn report">
            📊 查看详细报告
          </NeoButton>
        </div>
      </div>
    </div>

    <!-- 环境问题列表 -->
    <div class="issues-section">
      <h3>⚠️ 环境问题追踪</h3>
      <div class="issues-list">
        <div v-for="issue in environmentIssues" :key="issue.id" class="issue-card" :class="issue.severity">
          <div class="issue-header">
            <span class="issue-icon">{{ issue.icon }}</span>
            <div class="issue-info">
              <h4>{{ issue.title }}</h4>
              <p>{{ issue.description }}</p>
            </div>
            <div class="issue-severity" :class="issue.severity">{{ issue.severityText }}</div>
          </div>
          <div class="issue-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: issue.progress + '%' }"></div>
            </div>
            <span class="progress-text">处理进度: {{ issue.progress }}%</span>
          </div>
          <div class="issue-actions">
            <NeoButton @click="handleIssue(issue)" class="handle-btn">
              处理
            </NeoButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { NeoButton, NeoSelect } from 'neo-brutal-vue'
import { useEarthStore, type Environment } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const regionChart = ref<HTMLElement>()
const carbonChart = ref<HTMLElement>()
const selectedRegion = ref(earthStore.environments[0]?.id || '')

let charts: echarts.ECharts[] = []
const handleResize = () => charts.forEach(c => c.resize())

// 区域选项
const regionOptions = computed(() =>
  earthStore.environments.map(env => ({
    label: env.region,
    value: env.id
  }))
)

// 计算全球环境评分
const globalEnvironment = computed(() => earthStore.environments[0])

const globalEnvironmentScore = computed(() => {
  const env = globalEnvironment.value
  if (!env) return 0
  const score = (
    env.airQuality * 0.2 +
    env.waterQuality * 0.2 +
    env.soilQuality * 0.15 +
    env.biodiversity * 0.2 +
    env.forestCoverage * 0.15 +
    env.wasteRecycling * 0.1
  )
  return Math.round(score)
})

const getGlobalScoreClass = () => {
  const score = globalEnvironmentScore.value
  if (score >= 70) return 'excellent'
  if (score >= 50) return 'good'
  if (score >= 30) return 'moderate'
  return 'poor'
}

const criticalAreas = computed(() => earthStore.environments.filter(e => calculateRegionScore(e) < 40))
const warningAreas = computed(() => earthStore.environments.filter(e => {
  const score = calculateRegionScore(e)
  return score >= 40 && score < 60
}))
const goodAreas = computed(() => earthStore.environments.filter(e => calculateRegionScore(e) >= 60))

// 关键指标
const keyMetrics = computed(() => {
  const env = globalEnvironment.value
  if (!env) return []
  
  return [
    { 
      icon: '🌡️', 
      value: '+1.2°C', 
      label: '全球升温',
      change: '较上年 +0.05°C',
      trend: 'up',
      status: 'warning'
    },
    { 
      icon: '🌊', 
      value: '3.4mm', 
      label: '海平面上升',
      change: '年均上升',
      trend: 'up',
      status: 'warning'
    },
    { 
      icon: '🌲', 
      value: env.forestCoverage + '%', 
      label: '森林覆盖率',
      change: '-0.3% 较上年',
      trend: 'down',
      status: 'moderate'
    },
    { 
      icon: '🔋', 
      value: env.renewableEnergy + '%', 
      label: '可再生能源',
      change: '+2.1% 较上年',
      trend: 'up',
      status: 'good'
    }
  ]
})

const currentRegion = computed(() => {
  return earthStore.environments.find(e => e.id === selectedRegion.value)
})

const regionIndicators = computed(() => {
  const env = currentRegion.value
  if (!env) return []
  
  return [
    { 
      key: 'air', 
      name: '空气质量', 
      icon: '💨', 
      value: env.airQuality, 
      unit: '',
      percent: env.airQuality,
      color: getIndicatorColor(env.airQuality),
      status: getIndicatorStatus(env.airQuality),
      statusText: getIndicatorText(env.airQuality)
    },
    { 
      key: 'water', 
      name: '水质', 
      icon: '💧', 
      value: env.waterQuality, 
      unit: '',
      percent: env.waterQuality,
      color: getIndicatorColor(env.waterQuality),
      status: getIndicatorStatus(env.waterQuality),
      statusText: getIndicatorText(env.waterQuality)
    },
    { 
      key: 'soil', 
      name: '土壤质量', 
      icon: '🌱', 
      value: env.soilQuality, 
      unit: '',
      percent: env.soilQuality,
      color: getIndicatorColor(env.soilQuality),
      status: getIndicatorStatus(env.soilQuality),
      statusText: getIndicatorText(env.soilQuality)
    },
    { 
      key: 'bio', 
      name: '生物多样性', 
      icon: '🦋', 
      value: env.biodiversity, 
      unit: '',
      percent: env.biodiversity,
      color: getIndicatorColor(env.biodiversity),
      status: getIndicatorStatus(env.biodiversity),
      statusText: getIndicatorText(env.biodiversity)
    },
    { 
      key: 'forest', 
      name: '森林覆盖', 
      icon: '🌳', 
      value: env.forestCoverage, 
      unit: '%',
      percent: env.forestCoverage,
      color: getIndicatorColor(env.forestCoverage),
      status: getIndicatorStatus(env.forestCoverage),
      statusText: getIndicatorText(env.forestCoverage)
    },
    { 
      key: 'waste', 
      name: '废物回收', 
      icon: '♻️', 
      value: env.wasteRecycling, 
      unit: '%',
      percent: env.wasteRecycling,
      color: getIndicatorColor(env.wasteRecycling),
      status: getIndicatorStatus(env.wasteRecycling),
      statusText: getIndicatorText(env.wasteRecycling)
    }
  ]
})

const environmentIssues = [
  { id: 1, icon: '🌊', title: '海洋塑料污染', description: '太平洋垃圾带持续扩大', severity: 'high', severityText: '严重', progress: 35 },
  { id: 2, icon: '🌲', title: '亚马逊森林砍伐', description: '雨林面积减少速度加快', severity: 'critical', severityText: '危急', progress: 20 },
  { id: 3, icon: '🏭', title: '工业废气排放', description: '亚洲地区PM2.5超标', severity: 'medium', severityText: '中等', progress: 55 },
  { id: 4, icon: '🐻‍❄️', title: '极地冰川融化', description: '北极海冰面积历史最低', severity: 'critical', severityText: '危急', progress: 15 },
  { id: 5, icon: '💧', title: '地下水位下降', description: '主要农业区水资源紧张', severity: 'high', severityText: '严重', progress: 40 }
]

const calculateRegionScore = (env: Environment) => {
  return Math.round(
    env.airQuality * 0.2 +
    env.waterQuality * 0.2 +
    env.soilQuality * 0.15 +
    env.biodiversity * 0.2 +
    env.forestCoverage * 0.15 +
    env.wasteRecycling * 0.1
  )
}

const getRegionScoreClass = (env: Environment) => {
  const score = calculateRegionScore(env)
  if (score >= 70) return 'excellent'
  if (score >= 50) return 'good'
  if (score >= 30) return 'moderate'
  return 'poor'
}

const getIndicatorColor = (value: number) => {
  if (value >= 80) return '#4CAF50'
  if (value >= 60) return '#FFC107'
  if (value >= 40) return '#FF9800'
  return '#f44336'
}

const getIndicatorStatus = (value: number) => {
  if (value >= 80) return 'excellent'
  if (value >= 60) return 'good'
  if (value >= 40) return 'moderate'
  return 'poor'
}

const getIndicatorText = (value: number) => {
  if (value >= 80) return '优秀'
  if (value >= 60) return '良好'
  if (value >= 40) return '一般'
  return '较差'
}

const refreshData = () => {
  alert('环境数据已刷新！')
}

const improveEnvironment = () => {
  alert('已启动环境改善计划！')
}

const addProtection = () => {
  alert('已加强环境保护措施！')
}

const viewReport = () => {
  alert('查看详细报告功能开发中...')
}

const handleIssue = (issue: any) => {
  alert(`开始处理：${issue.title}`)
}

// 初始化区域对比图
const initRegionChart = () => {
  if (!regionChart.value) return
  
  const chart = echarts.init(regionChart.value)
  const envs = earthStore.environments

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['空气质量', '水质', '土壤质量', '生物多样性'] },
    radar: {
      indicator: envs.map(e => ({ name: e.region, max: 100 }))
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: envs.map(e => e.airQuality),
          name: '空气质量',
          areaStyle: { opacity: 0.2 }
        },
        {
          value: envs.map(e => e.waterQuality),
          name: '水质',
          areaStyle: { opacity: 0.2 }
        },
        {
          value: envs.map(e => e.biodiversity),
          name: '生物多样性',
          areaStyle: { opacity: 0.2 }
        }
      ]
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化碳排放图
const initCarbonChart = () => {
  if (!carbonChart.value) return
  
  const chart = echarts.init(carbonChart.value)
  
  const years = ['2019', '2020', '2021', '2022', '2023', '2024']
  const data = [36800, 35400, 36200, 36500, 36600, 36800]

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: years
    },
    yAxis: {
      type: 'value',
      name: '亿吨CO₂'
    },
    series: [{
      type: 'line',
      data: data,
      smooth: true,
      lineStyle: { color: '#f44336', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(244, 67, 54, 0.5)' },
          { offset: 1, color: 'rgba(244, 67, 54, 0.1)' }
        ])
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

onMounted(() => {
  initRegionChart()
  initCarbonChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.environment-monitor {
  padding: 24px;
}

.section-header {
  @include flex-between;
  margin-bottom: 25px;

  h2 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -1px;
    color: $color-text;
  }
}

.subtitle {
  color: $color-text-light;
  font-size: 14px;
  font-weight: 600;
}

.refresh-btn {
  background: $color-info;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.global-environment {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 25px;
  margin-bottom: 30px;
}

.environment-card {
  @include neobrutal-card;
  padding: 25px;
  @include flex-center;
  flex-direction: column;

  .card-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    .card-icon { font-size: 32px; }
    h3 { margin: 0; font-size: 20px; font-weight: 900; color: $color-text; }
  }
}

.global-score {
  margin-bottom: 25px;
}

.score-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 6px solid;
  box-shadow: 6px 6px 0 var(--color-border);
  transition: $transition-smooth;

  &.excellent { border-color: var(--color-success); background: color-mix(in srgb, var(--color-success) 10%, transparent); }
  &.good { border-color: var(--color-warning); background: color-mix(in srgb, var(--color-warning) 10%, transparent); }
  &.moderate { border-color: #FF9800; background: color-mix(in srgb, #FF9800 10%, transparent); }
  &.poor { border-color: var(--color-error); background: color-mix(in srgb, var(--color-error) 10%, transparent); }

  .score-value { font-size: 42px; font-weight: 900; color: $color-text; }
  .score-label { font-size: 12px; font-weight: 800; color: $color-text-light; text-transform: uppercase; }
}

.global-alerts {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: $radius-md;
  font-size: 13px;
  font-weight: 700;
  border: 2px solid var(--color-border);
  box-shadow: 3px 3px 0 var(--color-border);

  &.critical { background: color-mix(in srgb, var(--color-error) 15%, transparent); color: var(--color-error); }
  &.warning { background: color-mix(in srgb, var(--color-warning) 15%, transparent); color: var(--color-warning); }
  &.good { background: color-mix(in srgb, var(--color-success) 15%, transparent); color: var(--color-success); }
}

.key-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.metric-card {
  @include neobrutal-card;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;

  .metric-icon { font-size: 40px; }
  .metric-info {
    flex: 1;
    .metric-value { font-size: 28px; font-weight: 900; letter-spacing: -1px; }
    .metric-label { font-size: 13px; color: $color-text-light; font-weight: 700; text-transform: uppercase; }
    .metric-change { font-size: 11px; font-weight: 800; margin-top: 4px; }
  }
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.chart-container {
  @include neobrutal-card;
  padding: 25px;

  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 900;
    color: $color-text;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before { content: ''; width: 4px; height: 16px; background: $color-primary; }
  }
}

.chart { height: 320px; }

.regions-section {
  @include neobrutal-card;
  padding: 25px;
  margin-bottom: 30px;
}

.section-title {
  @include flex-between;
  margin-bottom: 25px;

  h3 { margin: 0; font-size: 22px; font-weight: 900; color: $color-text; }

  :deep(.neo-select) {
    min-width: 180px;
    max-width: 200px;
  }
}

.region-select {
  padding: 10px 16px;
  border: $border-dark;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 700;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.detail-header {
  @include flex-between;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--color-divider);

  h4 { margin: 0; font-size: 24px; font-weight: 900; }

  .region-score {
    padding: 8px 20px;
    border: 2px solid var(--color-border);
    border-radius: 20px;
    font-size: 15px;
    font-weight: 900;
    box-shadow: 3px 3px 0 var(--color-border);

    &.excellent { background: $color-success; color: white; }
    &.good { background: $color-warning; color: white; }
    &.moderate { background: #FF9800; color: white; }
    &.poor { background: $color-error; color: white; }
  }
}

.indicators-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.indicator-card {
  padding: 20px;
  background: var(--color-surface-alt);
  border: 2px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: 4px 4px 0 var(--color-divider);

  .indicator-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    .indicator-icon { font-size: 22px; }
    .indicator-name { font-size: 12px; color: $color-text-light; font-weight: 700; text-transform: uppercase; }
  }

  .indicator-value {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 12px;
    letter-spacing: -1px;

    &.excellent { color: $color-success; }
    &.good { color: var(--color-warning); }
    &.moderate { color: #FF9800; }
    &.poor { color: $color-error; }
  }

  .indicator-bar {
    height: 10px;
    background: var(--color-surface);
    border: 1.5px solid var(--color-border);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 8px;

    .indicator-fill { height: 100%; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
  }

  .indicator-status { font-size: 12px; font-weight: 800; color: $color-text-light; }
}

.environment-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  flex: 1;
  font-weight: 800;
  padding: 12px;
  @include neobrutal-button;

  &.improve { background: $color-success; color: white; }
  &.protect { background: $color-primary; color: white; }
  &.report { background: $color-secondary; color: white; }
}

.issues-section {
  h3 {
    font-size: 22px;
    font-weight: 900;
    margin-bottom: 20px;
    color: $color-text;
  }
}

.issues-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.issue-card {
  @include neobrutal-card;
  padding: 24px;
  border-left-width: 8px;

  &.critical { border-left-color: $color-accent; }
  &.high { border-left-color: $color-warning; }
  &.medium { border-left-color: $color-primary; }

  .issue-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;

    .issue-icon { font-size: 36px; }
    .issue-info {
      flex: 1;
      h4 { margin: 0; font-size: 18px; font-weight: 900; }
      p { margin: 5px 0 0; color: $color-text-light; font-weight: 600; font-size: 14px; }
    }
  }

  .issue-severity {
    padding: 5px 12px;
    border: 2px solid #333;
    border-radius: $radius-md;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;

    &.critical { background: $color-accent; color: white; }
    &.high { background: $color-warning; color: white; }
    &.medium { background: $color-primary; color: white; }
  }

  .issue-progress {
    margin-bottom: 20px;
    .progress-bar {
      height: 12px;
      background: var(--color-divider);
      border: 2px solid var(--color-border);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
      .progress-fill { height: 100%; background: $color-primary; transition: width 0.5s; }
    }
    .progress-text { font-size: 12px; font-weight: 800; color: $color-text-light; }
  }
}

.handle-btn {
  background: $color-text;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}
</style>
