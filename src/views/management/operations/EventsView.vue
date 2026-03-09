<template>
  <div class="event-management">
    <div class="section-header">
      <div class="header-left">
        <h2>📢 全球事件管理</h2>
        <span class="subtitle">追踪 {{ earthStore.events.length }} 个事件，{{ criticalEvents.length }} 个紧急</span>
      </div>
      <NeoButton @click="showAddDialog = true" class="add-btn">
        + 发布事件
      </NeoButton>
    </div>

    <!-- 事件统计 -->
    <div class="event-stats">
      <div class="stat-card">
        <div class="stat-number">{{ earthStore.events.length }}</div>
        <div class="stat-label">总事件</div>
      </div>
      <div class="stat-card critical">
        <div class="stat-number">{{ criticalEvents.length }}</div>
        <div class="stat-label">危急事件</div>
      </div>
      <div class="stat-card ongoing">
        <div class="stat-number">{{ ongoingEvents.length }}</div>
        <div class="stat-label">进行中</div>
      </div>
      <div class="stat-card resolved">
        <div class="stat-number">{{ resolvedEvents.length }}</div>
        <div class="stat-label">已解决</div>
      </div>
    </div>

    <!-- 事件类型分布 -->
    <div class="charts-row">
      <div class="chart-container">
        <h3>📊 事件类型分布</h3>
        <div ref="typeChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <h3>📈 事件严重性分布</h3>
        <div ref="severityChart" class="chart"></div>
      </div>
    </div>

    <!-- 事件筛选 -->
    <div class="filters-section">
      <div class="filter-group">
        <label>类型:</label>
        <NeoSelect
          v-model="filterType"
          :options="typeFilterOptions"
          placeholder="全部"
          clearable
        />
      </div>
      <div class="filter-group">
        <label>严重性:</label>
        <NeoSelect
          v-model="filterSeverity"
          :options="severityFilterOptions"
          placeholder="全部"
          clearable
        />
      </div>
      <div class="filter-group">
        <label>状态:</label>
        <NeoSelect
          v-model="filterStatus"
          :options="statusFilterOptions"
          placeholder="全部"
          clearable
        />
      </div>
      <NeoInput v-model="searchQuery" placeholder="搜索事件..." class="search-input" />
    </div>

    <!-- 事件时间线 -->
    <div class="timeline-section">
      <h3>⏱️ 事件时间线</h3>
      <div class="timeline">
        <div 
          v-for="event in filteredEvents" 
          :key="event.id" 
          class="timeline-item"
          :class="[event.severity, event.status]"
        >
          <div class="timeline-marker">
            <span class="marker-icon">{{ getEventIcon(event.type) }}</span>
          </div>
          <div class="timeline-content">
            <div class="event-header">
              <h4>{{ event.title }}</h4>
              <div class="event-badges">
                <span class="badge type">{{ getTypeLabel(event.type) }}</span>
                <span class="badge severity" :class="event.severity">{{ getSeverityLabel(event.severity) }}</span>
                <span class="badge status" :class="event.status">{{ getStatusLabel(event.status) }}</span>
              </div>
            </div>
            <p class="event-description">{{ event.description }}</p>
            <div class="event-meta">
              <span class="meta-item">📍 {{ event.location }}</span>
              <span class="meta-item">🕐 {{ formatTime(event.timestamp) }}</span>
              <span class="meta-item" v-if="event.affectedPopulation > 0">
                👥 {{ formatNumber(event.affectedPopulation) }} 人受影响
              </span>
            </div>
            <div class="event-actions">
              <NeoButton 
                v-if="event.status !== 'resolved'" 
                @click="resolveEvent(event)" 
                class="action-btn resolve"
              >
                标记解决
              </NeoButton>
              <NeoButton @click="viewDetails(event)" class="action-btn view">
                查看详情
              </NeoButton>
              <NeoButton @click="escalateEvent(event)" class="action-btn escalate">
                升级
              </NeoButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加事件对话框 -->
    <NeoDialog v-model="showAddDialog" title="发布新事件">
      <form @submit.prevent="handleAddEvent" class="event-form">
        <NeoInput v-model="newEvent.title" placeholder="事件标题" label="标题" required />
        <div class="form-row">
          <NeoSelect
            v-model="newEvent.type"
            :options="typeOptions"
            placeholder="事件类型"
            required
          />
          <NeoSelect
            v-model="newEvent.severity"
            :options="severityOptions"
            placeholder="严重性"
            required
          />
        </div>
        <NeoInput v-model="newEvent.location" placeholder="发生地点" label="地点" />
        <NeoTextarea
          v-model="newEvent.description" 
          placeholder="事件描述" 
          label="描述"
        />
        <NeoInput 
          v-model.number="newEvent.affectedPopulation" 
          placeholder="受影响人数" 
          label="受影响人数" 
          type="number"
        />
        <div class="form-actions">
          <NeoButton nativeType="button" @click="showAddDialog = false">取消</NeoButton>
          <NeoButton nativeType="submit" class="submit-btn">发布事件</NeoButton>
        </div>
      </form>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { NeoButton, NeoDialog, NeoInput, NeoTextarea, NeoSelect } from 'neo-brutal-vue'
import { useEarthStore, type Event } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const typeChart = ref<HTMLElement>()
const severityChart = ref<HTMLElement>()
const filterType = ref('')
const filterSeverity = ref('')
const filterStatus = ref('')
const searchQuery = ref('')
const showAddDialog = ref(false)

let charts: echarts.ECharts[] = []
const handleResize = () => charts.forEach(c => c.resize())

const newEvent = reactive({
  title: '',
  type: '' as Event['type'],
  severity: '' as Event['severity'],
  location: '',
  description: '',
  affectedPopulation: 0,
  status: 'ongoing' as Event['status']
})

const criticalEvents = computed(() => earthStore.events.filter(e => e.severity === 'critical'))
const ongoingEvents = computed(() => earthStore.events.filter(e => e.status === 'ongoing'))
const resolvedEvents = computed(() => earthStore.events.filter(e => e.status === 'resolved'))

// 筛选选项
const typeOptions = [
  { label: '自然灾害', value: 'natural' },
  { label: '政治事件', value: 'political' },
  { label: '经济事件', value: 'economic' },
  { label: '社会事件', value: 'social' },
  { label: '环境事件', value: 'environmental' }
]

const typeFilterOptions = typeOptions

const severityOptions = [
  { label: '危急', value: 'critical' },
  { label: '严重', value: 'high' },
  { label: '中等', value: 'medium' },
  { label: '轻微', value: 'low' }
]

const severityFilterOptions = severityOptions

const statusFilterOptions = [
  { label: '进行中', value: 'ongoing' },
  { label: '待处理', value: 'pending' },
  { label: '已解决', value: 'resolved' }
]

const filteredEvents = computed(() => {
  let result = [...earthStore.events]
  
  if (filterType.value) {
    result = result.filter(e => e.type === filterType.value)
  }
  if (filterSeverity.value) {
    result = result.filter(e => e.severity === filterSeverity.value)
  }
  if (filterStatus.value) {
    result = result.filter(e => e.status === filterStatus.value)
  }
  if (searchQuery.value) {
    result = result.filter(e => 
      e.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
})

const getEventIcon = (type: Event['type']) => {
  const icons: Record<Event['type'], string> = {
    natural: '🌪️',
    political: '🏛️',
    economic: '💹',
    social: '👥',
    environmental: '🌱'
  }
  return icons[type]
}

const getTypeLabel = (type: Event['type']) => {
  const labels: Record<Event['type'], string> = {
    natural: '自然灾害',
    political: '政治',
    economic: '经济',
    social: '社会',
    environmental: '环境'
  }
  return labels[type]
}

const getSeverityLabel = (severity: Event['severity']) => {
  const labels: Record<Event['severity'], string> = {
    critical: '危急',
    high: '严重',
    medium: '中等',
    low: '轻微'
  }
  return labels[severity]
}

const getStatusLabel = (status: Event['status']) => {
  const labels: Record<Event['status'], string> = {
    ongoing: '进行中',
    pending: '待处理',
    resolved: '已解决'
  }
  return labels[status]
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const resolveEvent = (event: Event) => {
  earthStore.updateEvent(event.id, { status: 'resolved' })
  alert(`事件 "${event.title}" 已标记为已解决`)
}

const viewDetails = (event: Event) => {
  alert(`事件详情：\n标题：${event.title}\n类型：${getTypeLabel(event.type)}\n地点：${event.location}\n描述：${event.description}\n受影响人数：${formatNumber(event.affectedPopulation)}`)
}

const escalateEvent = (event: Event) => {
  const newSeverity = event.severity === 'low' ? 'medium' : 
                      event.severity === 'medium' ? 'high' : 'critical'
  earthStore.updateEvent(event.id, { severity: newSeverity })
  alert(`事件 "${event.title}" 已升级为 ${getSeverityLabel(newSeverity)}`)
}

const handleAddEvent = () => {
  if (!newEvent.title || !newEvent.type || !newEvent.severity) return
  
  earthStore.addEvent({
    title: newEvent.title,
    type: newEvent.type,
    severity: newEvent.severity,
    location: newEvent.location,
    description: newEvent.description,
    status: 'ongoing',
    affectedPopulation: newEvent.affectedPopulation
  })
  
  showAddDialog.value = false
  Object.assign(newEvent, {
    title: '', type: '', severity: '', location: '', description: '', affectedPopulation: 0
  })
  
  charts.forEach(c => c.dispose())
  charts = []
  initCharts()
}

// 初始化图表
const initCharts = () => {
  // 类型分布图
  if (typeChart.value) {
    const chart = echarts.init(typeChart.value)
    const typeCount: Record<string, number> = {}
    earthStore.events.forEach(e => {
      typeCount[e.type] = (typeCount[e.type] || 0) + 1
    })
    
    chart.setOption({
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: Object.entries(typeCount).map(([type, count]) => ({
          name: getTypeLabel(type as Event['type']),
          value: count
        }))
      }]
    })
    charts.push(chart)
  }
  
  // 严重性分布图
  if (severityChart.value) {
    const chart = echarts.init(severityChart.value)
    const severityCount: Record<string, number> = {}
    earthStore.events.forEach(e => {
      severityCount[e.severity] = (severityCount[e.severity] || 0) + 1
    })
    
    chart.setOption({
      xAxis: {
        type: 'category',
        data: Object.keys(severityCount).map(s => getSeverityLabel(s as Event['severity']))
      },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: Object.values(severityCount),
        itemStyle: {
          color: (params: any) => {
            const colors = ['#f44336', '#FF9800', '#FFC107', '#4CAF50']
            return colors[params.dataIndex] || '#999'
          }
        }
      }]
    })
    charts.push(chart)
  }
}

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.event-management {
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

.add-btn {
  background: $color-accent;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.event-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  @include neobrutal-card;
  padding: 24px;
  text-align: center;
  background: var(--color-surface);
  transition: $transition-smooth;

  &:hover { transform: translateY(-5px); box-shadow: 8px 8px 0 var(--color-border); }

  .stat-number {
    font-size: 38px;
    font-weight: 900;
    color: $color-text;
    letter-spacing: -1px;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 800;
    color: $color-text-light;
    text-transform: uppercase;
    margin-top: 8px;
  }

  &.critical .stat-number { color: $color-error; }
  &.ongoing .stat-number { color: $color-warning; }
  &.resolved .stat-number { color: $color-success; }
}

.charts-row {
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

.chart { height: 280px; }

.filters-section {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--color-surface);
  border-radius: $radius-lg;
  border: 3px solid var(--color-border);
  align-items: center;
  box-shadow: 4px 4px 0 var(--color-border);

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;

    label { font-size: 13px; font-weight: 800; color: $color-text-light; text-transform: uppercase; }
    :deep(.neo-select) {
      min-width: 140px;
      max-width: 160px;
    }
    select {
      padding: 10px 14px;
      border: 2px solid var(--color-border);
      border-radius: $radius-md;
      font-size: 14px;
      font-weight: 700;
      background: var(--color-surface-alt);
      color: var(--color-text);
      cursor: pointer;
    }
  }

  .search-input { flex: 1; max-width: 300px; }
}

.timeline-section {
  @include neobrutal-card;
  padding: 30px;

  h3 { margin: 0 0 25px 0; font-size: 22px; font-weight: 900; color: $color-text; }
}

.timeline {
  position: relative;
  padding-left: 40px;

  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--color-border);
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
  padding: 24px;
  background: var(--color-surface-alt);
  border: 3px solid var(--color-border);
  border-radius: $radius-lg;
  transition: $transition-smooth;
  box-shadow: 4px 4px 0 var(--color-divider);

  &:hover { transform: translateX(8px); box-shadow: -4px 4px 0 rgba(0,0,0,0.1); }

  &.critical { border-left: 12px solid $color-error; }
  &.high { border-left: 12px solid $color-warning; }
  &.medium { border-left: 12px solid $color-primary; }
  &.low { border-left: 12px solid $color-success; }

  .timeline-marker {
    position: absolute;
    left: -54px;
    top: 20px;
    width: 36px;
    height: 36px;
    background: var(--color-surface);
    border: 3px solid var(--color-border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    box-shadow: 2px 2px 0 var(--color-border);
    .marker-icon { font-size: 18px; }
  }
}

.event-header {
  @include flex-between;
  margin-bottom: 15px;

  h4 { margin: 0; font-size: 20px; font-weight: 900; color: $color-text; }
}

.event-badges {
  display: flex;
  gap: 8px;

  .badge {
    padding: 4px 10px;
    border: 2px solid var(--color-border);
    border-radius: $radius-md;
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    box-shadow: 2px 2px 0 var(--color-border);

    &.type { background: $color-info; color: white; }
    &.severity {
      &.critical { background: $color-error; color: white; }
      &.high { background: $color-warning; color: white; }
      &.medium { background: $color-primary; color: white; }
      &.low { background: $color-success; color: white; }
    }
    &.status {
      &.ongoing { background: #fef2f2; color: $color-error; }
      &.pending { background: #fff8e1; color: $color-warning; }
      &.resolved { background: #e8f5e9; color: $color-success; }
    }
  }
}

.event-description {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: $color-text-light;
  line-height: 1.6;
}

.event-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 10px;
    background: var(--color-surface);
    border: 1.5px solid var(--color-divider);
  border-radius: $radius-md;

  .meta-item { font-size: 12px; font-weight: 700; color: $color-text-light; }
}

.event-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  font-weight: 800;
  padding: 8px 16px;
  @include neobrutal-button;

  &.resolve { background: $color-success; color: white; }
  &.view { background: $color-info; color: white; }
  &.escalate { background: $color-error; color: white; }
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-select {
  padding: 12px;
  border: $border-dark;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 600;
  &:focus { outline: none; border-color: $color-primary; }
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 15px;
}

.submit-btn {
  background: $color-accent;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}
</style>
