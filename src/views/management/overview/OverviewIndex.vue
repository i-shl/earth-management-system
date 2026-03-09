<template>
  <div class="overview-container animate__animated animate__fadeIn">
    <!-- 顶部欢迎区 -->
    <div class="welcome-header">
      <div class="welcome-text">
        <h2>早安, {{ earthStore.currentUser?.username || '管理员' }}</h2>
        <p>欢迎回到地球管理系统主控制台。当前全球状态平衡。</p>
        <div class="time-info">
          <Clock :size="16" />
          <span>{{ currentTime }}</span>
        </div>
      </div>
      <div class="quick-stats">
        <div class="stat-card neo-brutal-card">
          <Activity class="icon" :size="32" />
          <div class="stat-info">
            <span class="label">系统活跃度</span>
            <span class="value">98.4%</span>
            <span class="trend up">↑ 2.3%</span>
          </div>
        </div>
        <div class="stat-card neo-brutal-card">
          <ShieldCheck class="icon" :size="32" />
          <div class="stat-info">
            <span class="label">安全等级</span>
            <span class="value">最高级</span>
            <span class="trend stable">稳定</span>
          </div>
        </div>
        <div class="stat-card neo-brutal-card">
          <Zap class="icon" :size="32" />
          <div class="stat-info">
            <span class="label">在线设备</span>
            <span class="value">{{ earthStore.satellites.filter(s => s.status === 'active').length }}</span>
            <span class="trend up">↑ 3</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 核心数据统计卡片 -->
    <div class="core-stats-grid">
      <div class="stat-box neo-brutal-card" v-for="stat in coreStats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <component :is="stat.icon" :size="28" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: stat.progress + '%', background: stat.color }"></div>
          </div>
          <div class="stat-meta">
            <span :class="['change', stat.changeType]">{{ stat.change }}</span>
            <span class="period">vs 上月</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要图表区域 -->
    <div class="main-charts-grid">
      <!-- 全球人口分布 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><Users :size="20" /> 全球人口分布</h3>
          <NeoSelect
            v-model="populationView"
            :options="populationViewOptions"
            placeholder="选择视图"
          />
        </div>
        <div ref="populationChart" class="chart-content"></div>
      </div>

      <!-- 资源储量分析 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><Fuel :size="20" /> 资源储量分析</h3>
          <NeoSelect
            v-model="resourceType"
            :options="resourceTypeOptions"
            placeholder="选择资源类型"
          />
        </div>
        <div ref="resourceChart" class="chart-content"></div>
      </div>

      <!-- 环境健康指数 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><Leaf :size="20" /> 环境健康指数</h3>
        </div>
        <div ref="environmentChart" class="chart-content"></div>
      </div>

      <!-- 全球事件热力图 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><AlertCircle :size="20" /> 全球事件分布</h3>
        </div>
        <div ref="eventHeatmap" class="chart-content"></div>
      </div>
    </div>

    <!-- 实时数据面板 -->
    <div class="realtime-panels">
      <!-- 紧急事件 -->
      <div class="panel neo-brutal-card urgent-events">
        <div class="panel-header">
          <h3><AlertTriangle :size="20" /> 紧急事件</h3>
          <span class="badge critical">{{ criticalEventsCount }}</span>
        </div>
        <div class="event-list">
          <div v-for="event in earthStore.criticalEvents.slice(0, 5)" :key="event.id" class="event-item" :class="event.severity">
            <div class="event-icon">{{ getEventIcon(event.type) }}</div>
            <div class="event-details">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-meta">
                <MapPin :size="12" />
                <span>{{ event.location }}</span>
                <span class="separator">•</span>
                <span>{{ formatTime(event.timestamp) }}</span>
              </div>
              <div class="event-impact">
                影响人口: {{ formatNumber(event.affectedPopulation) }}
              </div>
            </div>
            <div class="event-status" :class="event.status">
              {{ getStatusText(event.status) }}
            </div>
          </div>
          <div v-if="earthStore.criticalEvents.length === 0" class="no-data">
            <CheckCircle :size="40" />
            <p>暂无紧急事务</p>
          </div>
        </div>
      </div>

      <!-- 系统日志 -->
      <div class="panel neo-brutal-card system-logs">
        <div class="panel-header">
          <h3><FileText :size="20" /> 系统日志</h3>
          <NeoButton @click="refreshLogs" class="refresh-btn">
            <RefreshCw :size="14" />
          </NeoButton>
        </div>
        <div class="log-list">
          <div v-for="log in earthStore.systemLogs.slice(0, 8)" :key="log.id" class="log-item" :class="log.type">
            <div class="log-indicator"></div>
            <div class="log-content">
              <div class="log-header">
                <span class="log-action">{{ log.action }}</span>
                <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              </div>
              <div class="log-details">{{ log.details }}</div>
              <div class="log-user">
                <User :size="12" />
                {{ log.user }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 物种保护状态 -->
      <div class="panel neo-brutal-card species-status">
        <div class="panel-header">
          <h3><Bird :size="20" /> 物种保护状态</h3>
        </div>
        <div class="species-summary">
          <div v-for="status in speciesStatusSummary" :key="status.label" class="status-item" :class="status.class">
            <div class="status-count">{{ status.count }}</div>
            <div class="status-label">{{ status.label }}</div>
            <div class="status-bar">
              <div class="bar-fill" :style="{ width: status.percentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷功能入口 -->
    <div class="feature-grid">
      <div v-for="feature in features" :key="feature.name" class="feature-card neo-brutal-card" @click="router.push({ name: feature.routeName })">
        <component :is="feature.icon" :size="48" class="feature-icon" />
        <h4>{{ feature.name }}</h4>
        <p>{{ feature.desc }}</p>
        <div class="feature-badge" v-if="feature.badge">{{ feature.badge }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { NeoSelect, NeoButton } from 'neo-brutal-vue'
import {
  Activity, ShieldCheck, AlertTriangle, CheckCircle, Globe, Users, CloudRain,
  Zap, Satellite, TreeDeciduous, Clock, Fuel, Leaf, AlertCircle, MapPin,
  FileText, RefreshCw, User, Bird
} from 'lucide-vue-next'
import * as echarts from 'echarts'
import { useEarthStore } from '../../../stores/earthStore'
import type { Event } from '../../../stores/earthStore'

const router = useRouter()
const earthStore = useEarthStore()

const currentTime = ref('')
const populationView = ref('continent')
const resourceType = ref('all')

const populationChart = ref<HTMLElement>()
const resourceChart = ref<HTMLElement>()
const environmentChart = ref<HTMLElement>()
const eventHeatmap = ref<HTMLElement>()

let charts: echarts.ECharts[] = []
let timeInterval: number | null = null

// 视图选项
const populationViewOptions = [
  { label: '按大洲', value: 'continent' },
  { label: '按国家', value: 'country' }
]

const resourceTypeOptions = [
  { label: '全部资源', value: 'all' },
  { label: '能源', value: 'energy' },
  { label: '矿产', value: 'mineral' }
]

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 核心统计数据
const coreStats = computed(() => [
  {
    icon: Globe,
    label: '全球人口',
    value: formatNumber(earthStore.totalPopulation),
    progress: 78,
    change: '+0.8%',
    changeType: 'up',
    color: '#667eea'
  },
  {
    icon: Users,
    label: '国家/地区',
    value: earthStore.totalCountries.toString(),
    progress: 92,
    change: '+2',
    changeType: 'up',
    color: '#f093fb'
  },
  {
    icon: Satellite,
    label: '活跃卫星',
    value: earthStore.satellites.filter(s => s.status === 'active').length.toString(),
    progress: 85,
    change: '+3',
    changeType: 'up',
    color: '#4facfe'
  },
  {
    icon: AlertTriangle,
    label: '紧急事件',
    value: earthStore.criticalEvents.length.toString(),
    progress: 15,
    change: '-1',
    changeType: 'down',
    color: '#fa709a'
  },
  {
    icon: TreeDeciduous,
    label: '濒危物种',
    value: earthStore.species.filter(s => s.status === 'endangered' || s.status === 'critical').length.toString(),
    progress: 42,
    change: '+2',
    changeType: 'up',
    color: '#fee140'
  },
  {
    icon: Fuel,
    label: '资源类型',
    value: earthStore.resources.length.toString(),
    progress: 68,
    change: '0',
    changeType: 'stable',
    color: '#30cfd0'
  }
])

// 紧急事件数量
const criticalEventsCount = computed(() => earthStore.criticalEvents.length)

// 物种状态统计
const speciesStatusSummary = computed(() => {
  const total = earthStore.species.length
  const statusCounts = {
    extinct: earthStore.species.filter(s => s.status === 'extinct').length,
    critical: earthStore.species.filter(s => s.status === 'critical').length,
    endangered: earthStore.species.filter(s => s.status === 'endangered').length,
    vulnerable: earthStore.species.filter(s => s.status === 'vulnerable').length,
    safe: earthStore.species.filter(s => s.status === 'safe').length
  }

  return [
    { label: '已灭绝', count: statusCounts.extinct, percentage: (statusCounts.extinct / total) * 100, class: 'extinct' },
    { label: '极危', count: statusCounts.critical, percentage: (statusCounts.critical / total) * 100, class: 'critical' },
    { label: '濒危', count: statusCounts.endangered, percentage: (statusCounts.endangered / total) * 100, class: 'endangered' },
    { label: '易危', count: statusCounts.vulnerable, percentage: (statusCounts.vulnerable / total) * 100, class: 'vulnerable' },
    { label: '安全', count: statusCounts.safe, percentage: (statusCounts.safe / total) * 100, class: 'safe' }
  ]
})

// 功能卡片
const features = [
  { name: '大洲管理', routeName: 'Continents', icon: Globe, desc: '全球各大洲地理与人口概况', badge: earthStore.continents.length },
  { name: '人口监测', routeName: 'Humans', icon: Users, desc: '实时人口动态与健康监控', badge: earthStore.activeHumans.length },
  { name: '气象预警', routeName: 'Weather', icon: CloudRain, desc: '全球气象灾害实时追踪', badge: earthStore.weather.length },
  { name: '资源调度', routeName: 'Resources', icon: Zap, desc: '能源、粮食、矿产分配管理', badge: earthStore.resources.length },
  { name: '卫星定位', routeName: 'Satellites', icon: Satellite, desc: '近地轨道卫星群实时状态', badge: earthStore.satellites.filter(s => s.status === 'active').length },
  { name: '生态保护', routeName: 'Environment', icon: TreeDeciduous, desc: '森林覆盖率与空气质量监测', badge: null }
]

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// 格式化时间
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff}秒前`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}

// 获取事件图标
const getEventIcon = (type: Event['type']) => {
  const icons: Record<Event['type'], string> = {
    natural: '🌪️',
    political: '🏛️',
    economic: '💹',
    social: '👥',
    environmental: '🌱'
  }
  return icons[type] || '📌'
}

// 获取状态文本
const getStatusText = (status: Event['status']) => {
  const texts: Record<Event['status'], string> = {
    ongoing: '进行中',
    resolved: '已解决',
    pending: '待处理'
  }
  return texts[status]
}

// 刷新日志
const refreshLogs = () => {
  earthStore.addLog('刷新日志', '用户手动刷新系统日志', 'info')
}

// 初始化人口图表
const initPopulationChart = () => {
  if (!populationChart.value) return

  const chart = echarts.init(populationChart.value)
  const data = earthStore.continents.map(c => ({
    name: c.name,
    value: c.population
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#666' }
    },
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
        color: '#333',
        fontWeight: 'bold'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      data: data
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化资源图表
const initResourceChart = () => {
  if (!resourceChart.value) return

  const chart = echarts.init(resourceChart.value)
  const data = earthStore.resources.slice(0, 8).map(r => ({
    name: r.name,
    value: r.sustainability
  }))

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { rotate: 30, color: '#666' }
    },
    yAxis: {
      type: 'value',
      name: '可持续性指数',
      axisLabel: { color: '#666' }
    },
    series: [{
      type: 'bar',
      data: data.map(d => ({
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        }
      })),
      barWidth: '60%'
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化环境图表
const initEnvironmentChart = () => {
  if (!environmentChart.value) return

  const chart = echarts.init(environmentChart.value)
  const env = earthStore.environments[0]

  if (!env) return

  const option = {
    radar: {
      indicator: [
        { name: '空气质量', max: 100 },
        { name: '水质', max: 100 },
        { name: '土壤质量', max: 100 },
        { name: '生物多样性', max: 100 },
        { name: '森林覆盖', max: 100 },
        { name: '废物回收', max: 100 }
      ],
      axisName: { color: '#666', fontWeight: 'bold' }
    },
    series: [{
      type: 'radar',
      data: [{
        value: [
          env.airQuality,
          env.waterQuality,
          env.soilQuality,
          env.biodiversity,
          env.forestCoverage,
          env.wasteRecycling
        ],
        name: '全球环境',
        areaStyle: { color: 'rgba(102, 126, 234, 0.5)' },
        lineStyle: { color: '#667eea', width: 2 }
      }]
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化事件热力图
const initEventHeatmap = () => {
  if (!eventHeatmap.value) return

  const chart = echarts.init(eventHeatmap.value)

  const severityData = {
    critical: earthStore.events.filter(e => e.severity === 'critical').length,
    high: earthStore.events.filter(e => e.severity === 'high').length,
    medium: earthStore.events.filter(e => e.severity === 'medium').length,
    low: earthStore.events.filter(e => e.severity === 'low').length
  }

  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '70%',
      data: [
        { value: severityData.critical, name: '严重', itemStyle: { color: '#ff4757' } },
        { value: severityData.high, name: '高', itemStyle: { color: '#ffa502' } },
        { value: severityData.medium, name: '中', itemStyle: { color: '#f39c12' } },
        { value: severityData.low, name: '低', itemStyle: { color: '#2ed573' } }
      ],
      label: {
        show: true,
        formatter: '{b}: {c}',
        color: '#333',
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 调整图表大小
const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)

  initPopulationChart()
  initResourceChart()
  initEnvironmentChart()
  initEventHeatmap()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})
</script>

<script lang="ts">
export default { name: 'OverviewIndex' }
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.overview-container {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

// 欢迎区域
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .welcome-text {
    h2 { font-size: 32px; font-weight: 900; margin-bottom: 8px; color: $color-text; }
    p { color: $color-text-light; font-weight: 600; margin-bottom: 10px; }
    .time-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: $color-text-light;
      font-weight: 700;
    }
  }

  .quick-stats {
    display: flex;
    gap: 20px;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 25px;
  transition: $transition-smooth;

  &:hover { transform: translateY(-3px); }

  .icon { color: $color-primary; }
  .stat-info {
    .label { font-size: 11px; color: $color-text-light; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .value { font-size: 20px; font-weight: 900; display: block; color: $color-text; margin: 5px 0; }
    .trend {
      font-size: 11px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      &.up { background: color-mix(in srgb, var(--color-success) 15%, transparent); color: $color-success; }
      &.down { background: color-mix(in srgb, var(--color-error) 15%, transparent); color: $color-error; }
      &.stable { background: color-mix(in srgb, var(--color-warning) 15%, transparent); color: $color-warning; }
    }
  }
}

// 核心统计卡片
.core-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-box {
  padding: 20px;
  display: flex;
  gap: 15px;
  transition: $transition-smooth;

  &:hover { transform: translateY(-5px); }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: $radius-md;
    @include flex-center;
    color: white;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    .stat-value { font-size: 24px; font-weight: 900; color: $color-text; letter-spacing: -1px; }
    .stat-label { font-size: 12px; color: $color-text-light; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
    .stat-progress {
      height: 6px;
      background: var(--color-divider);
      border-radius: 3px;
      overflow: hidden;
      margin: 10px 0;
      .progress-bar { height: 100%; transition: width 0.3s ease; }
    }
    .stat-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      .change {
        font-weight: 800;
        &.up { color: $color-success; }
        &.down { color: $color-error; }
        &.stable { color: $color-text-light; }
      }
      .period { color: $color-text-light; }
    }
  }
}

// 图表区域
.main-charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.chart-panel {
  padding: 25px;
  min-height: 350px;

  .panel-header {
    @include flex-between;
    margin-bottom: 20px;
    h3 {
      font-size: 18px;
      font-weight: 900;
      color: $color-text;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    :deep(.neo-select) {
      min-width: 150px;
      max-width: 180px;
    }
    .view-selector {
      padding: 8px 12px;
      border: 2px solid var(--color-border);
      border-radius: $radius-md;
      font-size: 13px;
      font-weight: 700;
      background: var(--color-surface);
      color: $color-text;
      cursor: pointer;
      &:focus { outline: none; border-color: $color-primary; }
    }
  }

  .chart-content {
    height: 280px;
  }
}

// 实时数据面板
.realtime-panels {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 25px;
}

.panel {
  padding: 25px;

  .panel-header {
    @include flex-between;
    margin-bottom: 20px;
    h3 {
      font-size: 18px;
      font-weight: 900;
      color: $color-text;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 900;
      &.critical { background: $color-error; color: white; }
    }
    .refresh-btn {
      padding: 6px;
      border: 2px solid var(--color-border);
      border-radius: $radius-md;
      background: var(--color-surface);
      cursor: pointer;
      transition: $transition-smooth;
      &:hover { background: $color-primary; color: white; }
    }
  }
}

// 紧急事件
.urgent-events {
  .event-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 400px;
    overflow-y: auto;

    .event-item {
      display: flex;
      gap: 15px;
      padding: 15px;
      background: var(--color-surface-alt);
      border-radius: $radius-md;
      border-left: 4px solid;
      transition: $transition-smooth;

      &.critical { border-left-color: $color-error; }
      &.high { border-left-color: $color-warning; }
      &.medium { border-left-color: $color-primary; }
      &.low { border-left-color: $color-success; }

      &:hover { transform: translateX(5px); }

      .event-icon { font-size: 24px; }
      .event-details {
        flex: 1;
        .event-title { font-size: 14px; font-weight: 800; color: $color-text; margin-bottom: 6px; }
        .event-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: $color-text-light;
          font-weight: 600;
          margin-bottom: 6px;
          .separator { margin: 0 4px; }
        }
        .event-impact { font-size: 12px; color: $color-text-light; font-weight: 700; }
      }
      .event-status {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        height: fit-content;
        &.ongoing { background: color-mix(in srgb, var(--color-error) 15%, transparent); color: $color-error; }
        &.resolved { background: color-mix(in srgb, var(--color-success) 15%, transparent); color: $color-success; }
        &.pending { background: color-mix(in srgb, var(--color-warning) 15%, transparent); color: $color-warning; }
      }
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: $color-text-light;
      font-weight: 700;
      p { margin-top: 10px; }
    }
  }
}

// 系统日志
.system-logs {
  .log-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;

    .log-item {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: var(--color-surface-alt);
      border-radius: $radius-md;
      border-left: 3px solid;
      transition: $transition-smooth;

      &.info { border-left-color: $color-primary; }
      &.success { border-left-color: $color-success; }
      &.warning { border-left-color: $color-warning; }
      &.error { border-left-color: $color-error; }

      &:hover { transform: translateX(3px); }

      .log-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 6px;
        flex-shrink: 0;
      }

      .log-content {
        flex: 1;
        .log-header {
          @include flex-between;
          margin-bottom: 4px;
          .log-action { font-size: 13px; font-weight: 800; color: $color-text; }
          .log-time { font-size: 11px; color: $color-text-light; font-weight: 600; }
        }
        .log-details { font-size: 12px; color: $color-text-light; margin-bottom: 6px; }
        .log-user {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: $color-text-light;
          font-weight: 700;
        }
      }
    }
  }
}

// 物种状态
.species-status {
  .species-summary {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .status-item {
      .status-count { font-size: 28px; font-weight: 900; color: $color-text; }
      .status-label { font-size: 12px; color: $color-text-light; font-weight: 700; text-transform: uppercase; margin: 5px 0; }
      .status-bar {
        height: 8px;
        background: var(--color-divider);
        border-radius: 4px;
        overflow: hidden;
        .bar-fill { height: 100%; transition: width 0.3s ease; }
      }

      &.extinct .bar-fill { background: #95a5a6; }
      &.critical .bar-fill { background: $color-error; }
      &.endangered .bar-fill { background: $color-warning; }
      &.vulnerable .bar-fill { background: #f39c12; }
      &.safe .bar-fill { background: $color-success; }
    }
  }
}

// 功能卡片
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.feature-card {
  padding: 30px;
  text-align: center;
  cursor: pointer;
  position: relative;
  transition: $transition-smooth;

  .feature-icon { color: $color-primary; margin-bottom: 20px; transition: $transition-bounce; }
  h4 { font-size: 18px; font-weight: 900; margin-bottom: 10px; color: $color-text; }
  p { font-size: 13px; color: $color-text-light; font-weight: 600; }

  .feature-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: $color-primary;
    color: white;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 900;
    box-shadow: 2px 2px 0 var(--color-border);
  }

  &:hover {
    transform: translateY(-8px);
    background-color: var(--color-primary);
    border-color: var(--color-text);
    color: white;

    .feature-icon, p { color: white; }
    .feature-badge { background: white; color: $color-primary; }
  }
}
</style>
