<template>
  <div class="resource-management">
    <div class="section-header">
      <div class="header-left">
        <h2>⛽ 全球资源管理</h2>
        <span class="subtitle">管理 {{ earthStore.resources.length }} 种资源类型</span>
      </div>
      <NeoButton @click="showAddDialog = true" class="add-btn">
        + 添加资源
      </NeoButton>
    </div>

    <!-- 资源总览 -->
    <div class="resource-overview">
      <div class="overview-card energy">
        <div class="overview-icon">⚡</div>
        <div class="overview-info">
          <div class="overview-title">能源资源</div>
          <div class="overview-count">{{ energyResources.length }} 种</div>
        </div>
      </div>
      <div class="overview-card mineral">
        <div class="overview-icon">⛏️</div>
        <div class="overview-info">
          <div class="overview-title">矿产资源</div>
          <div class="overview-count">{{ mineralResources.length }} 种</div>
        </div>
      </div>
      <div class="overview-card water">
        <div class="overview-icon">💧</div>
        <div class="overview-info">
          <div class="overview-title">水资源</div>
          <div class="overview-count">{{ waterResources.length }} 种</div>
        </div>
      </div>
      <div class="overview-card forest">
        <div class="overview-icon">🌲</div>
        <div class="overview-info">
          <div class="overview-title">森林资源</div>
          <div class="overview-count">{{ forestResources.length }} 种</div>
        </div>
      </div>
      <div class="overview-card food">
        <div class="overview-icon">🌾</div>
        <div class="overview-info">
          <div class="overview-title">粮食资源</div>
          <div class="overview-count">{{ foodResources.length }} 种</div>
        </div>
      </div>
    </div>

    <!-- 资源储量分布图 -->
    <div class="resource-charts">
      <div class="chart-container">
        <h3>📊 资源储量分布</h3>
        <div ref="reserveChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <h3>📈 生产vs消费</h3>
        <div ref="productionChart" class="chart"></div>
      </div>
    </div>

    <!-- 资源列表 -->
    <div class="resource-list-section">
      <div class="list-header">
        <h3>📋 资源详情列表</h3>
        <div class="filters">
          <NeoSelect
            v-model="filterType"
            :options="typeFilterOptions"
            placeholder="所有类型"
            clearable
          />
          <NeoSelect
            v-model="sortBy"
            :options="sortOptions"
            placeholder="排序方式"
          />
        </div>
      </div>

      <div class="resource-grid">
        <div v-for="resource in filteredResources" :key="resource.id" class="resource-card">
          <div class="resource-header">
            <div class="resource-icon">{{ getResourceIcon(resource.type) }}</div>
            <div class="resource-title">
              <h4>{{ resource.name }}</h4>
              <span class="resource-type">{{ getTypeLabel(resource.type) }}</span>
            </div>
            <div class="sustainability-badge" :class="getSustainabilityClass(resource.sustainability)">
              {{ resource.sustainability }}%
            </div>
          </div>

          <div class="resource-stats">
            <div class="stat-row">
              <span class="stat-label">总储量</span>
              <span class="stat-value">{{ formatNumber(resource.totalReserve) }} {{ resource.unit }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">年产量</span>
              <span class="stat-value">{{ formatNumber(resource.annualProduction) }} {{ resource.unit }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">年消耗</span>
              <span class="stat-value">{{ formatNumber(resource.annualConsumption) }} {{ resource.unit }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">主要产区</span>
              <span class="stat-value">{{ resource.region }}</span>
            </div>
          </div>

          <div class="resource-balance">
            <div class="balance-header">
              <span>供需平衡</span>
              <span :class="getBalanceClass(resource)">{{ getBalanceText(resource) }}</span>
            </div>
            <div class="balance-bar">
              <div class="balance-fill" :style="{ width: getBalancePercent(resource) + '%' }" :class="getBalanceClass(resource)"></div>
            </div>
            <div class="balance-labels">
              <span>过剩</span>
              <span>平衡</span>
              <span>短缺</span>
            </div>
          </div>

          <div class="resource-actions">
            <NeoButton @click="viewDetails(resource)" class="action-btn view">详情</NeoButton>
            <NeoButton @click="editResource(resource)" class="action-btn edit">编辑</NeoButton>
            <NeoButton @click="allocateResource(resource)" class="action-btn allocate">调配</NeoButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加资源对话框 -->
    <NeoDialog v-model="showAddDialog" title="添加新资源">
      <form @submit.prevent="handleAddResource" class="resource-form">
        <NeoInput v-model="newResource.name" placeholder="资源名称" label="名称" required />
        <div class="form-row">
          <NeoSelect
            v-model="newResource.type"
            :options="resourceTypeOptions"
            placeholder="选择类型"
            required
          />
          <NeoInput v-model="newResource.unit" placeholder="单位" label="单位" required />
        </div>
        <div class="form-row">
          <NeoInput v-model.number="newResource.totalReserve" placeholder="总储量" label="总储量" type="number" />
          <NeoInput v-model.number="newResource.annualProduction" placeholder="年产量" label="年产量" type="number" />
        </div>
        <div class="form-row">
          <NeoInput v-model.number="newResource.annualConsumption" placeholder="年消耗" label="年消耗" type="number" />
          <NeoInput v-model.number="newResource.sustainability" placeholder="可持续性指数" label="可持续性(0-100)" type="number" />
        </div>
        <NeoInput v-model="newResource.region" placeholder="主要产区" label="产区" />
        <div class="form-actions">
          <NeoButton nativeType="button" @click="showAddDialog = false">取消</NeoButton>
          <NeoButton nativeType="submit" class="submit-btn">添加</NeoButton>
        </div>
      </form>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { NeoButton, NeoDialog, NeoInput, NeoSelect } from 'neo-brutal-vue'
import { useEarthStore, type Resource } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const reserveChart = ref<HTMLElement>()
const productionChart = ref<HTMLElement>()
const filterType = ref('')
const sortBy = ref('reserve')
const showAddDialog = ref(false)

let charts: echarts.ECharts[] = []
const handleResize = () => charts.forEach(c => c.resize())

const newResource = reactive({
  name: '',
  type: '' as Resource['type'],
  totalReserve: 0,
  annualProduction: 0,
  annualConsumption: 0,
  unit: '',
  region: '',
  sustainability: 50
})

const energyResources = computed(() => earthStore.resources.filter(r => r.type === 'energy'))
const mineralResources = computed(() => earthStore.resources.filter(r => r.type === 'mineral'))
const waterResources = computed(() => earthStore.resources.filter(r => r.type === 'water'))
const forestResources = computed(() => earthStore.resources.filter(r => r.type === 'forest'))
const foodResources = computed(() => earthStore.resources.filter(r => r.type === 'food'))

// 筛选和排序选项
const resourceTypeOptions = [
  { label: '能源', value: 'energy' },
  { label: '矿产', value: 'mineral' },
  { label: '水资源', value: 'water' },
  { label: '森林', value: 'forest' },
  { label: '粮食', value: 'food' }
]

const typeFilterOptions = resourceTypeOptions

const sortOptions = [
  { label: '按储量排序', value: 'reserve' },
  { label: '按产量排序', value: 'production' },
  { label: '按可持续性排序', value: 'sustainability' }
]

const filteredResources = computed(() => {
  let result = [...earthStore.resources]
  
  if (filterType.value) {
    result = result.filter(r => r.type === filterType.value)
  }
  
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'reserve': return b.totalReserve - a.totalReserve
      case 'production': return b.annualProduction - a.annualProduction
      case 'sustainability': return b.sustainability - a.sustainability
      default: return 0
    }
  })
  
  return result
})

const formatNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const getResourceIcon = (type: Resource['type']) => {
  const icons: Record<Resource['type'], string> = {
    energy: '⚡',
    mineral: '⛏️',
    water: '💧',
    forest: '🌲',
    food: '🌾'
  }
  return icons[type]
}

const getTypeLabel = (type: Resource['type']) => {
  const labels: Record<Resource['type'], string> = {
    energy: '能源',
    mineral: '矿产',
    water: '水资源',
    forest: '森林',
    food: '粮食'
  }
  return labels[type]
}

const getSustainabilityClass = (score: number) => {
  if (score >= 70) return 'excellent'
  if (score >= 50) return 'good'
  if (score >= 30) return 'moderate'
  return 'poor'
}

const getBalanceClass = (resource: Resource) => {
  const balance = resource.annualProduction - resource.annualConsumption
  const ratio = balance / resource.annualConsumption
  if (ratio > 0.1) return 'surplus'
  if (ratio < -0.1) return 'shortage'
  return 'balanced'
}

const getBalanceText = (resource: Resource) => {
  const balance = resource.annualProduction - resource.annualConsumption
  if (balance > 0) return `+${formatNumber(balance)} 过剩`
  if (balance < 0) return `${formatNumber(balance)} 短缺`
  return '平衡'
}

const getBalancePercent = (resource: Resource) => {
  const max = Math.max(resource.annualProduction, resource.annualConsumption) * 1.5
  const balance = resource.annualProduction - resource.annualConsumption
  return Math.min(100, Math.max(0, 50 + (balance / max) * 50))
}

const viewDetails = (resource: Resource) => {
  alert(`${resource.name} 详情：\n储量：${formatNumber(resource.totalReserve)} ${resource.unit}\n产量：${formatNumber(resource.annualProduction)} ${resource.unit}/年\n消耗：${formatNumber(resource.annualConsumption)} ${resource.unit}/年`)
}

const editResource = (resource: Resource) => {
  alert(`编辑 ${resource.name} 功能开发中...`)
}

const allocateResource = (resource: Resource) => {
  alert(`调配 ${resource.name} 功能开发中...`)
}

const handleAddResource = () => {
  if (!newResource.name || !newResource.type) return

  earthStore.addResource({ ...newResource })
  showAddDialog.value = false
  Object.assign(newResource, {
    name: '', type: '' as Resource['type'], totalReserve: 0,
    annualProduction: 0, annualConsumption: 0, unit: '', region: '', sustainability: 50,
  })
}

// 初始化储量分布图
const initReserveChart = () => {
  if (!reserveChart.value) return
  
  const chart = echarts.init(reserveChart.value)
  const data = earthStore.resources.map(r => ({
    name: r.name,
    value: r.totalReserve,
    type: r.type
  }))

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} {d}%' },
    series: [{
      type: 'pie',
      radius: ['30%', '70%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 8
      },
      data: data
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化生产消费对比图
const initProductionChart = () => {
  if (!productionChart.value) return
  
  const chart = echarts.init(productionChart.value)
  const resources = earthStore.resources.slice(0, 8)

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['产量', '消耗'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: resources.map(r => r.name),
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '产量',
        type: 'bar',
        data: resources.map(r => r.annualProduction),
        itemStyle: { color: '#4CAF50' }
      },
      {
        name: '消耗',
        type: 'bar',
        data: resources.map(r => r.annualConsumption),
        itemStyle: { color: '#f44336' }
      }
    ]
  }

  chart.setOption(option)
  charts.push(chart)
}

onMounted(() => {
  initReserveChart()
  initProductionChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.resource-management {
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
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.resource-overview {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  @include neobrutal-card;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: var(--color-surface);
  transition: $transition-smooth;

  &:hover { transform: translate(-4px, -4px); box-shadow: 8px 8px 0 var(--color-border); }

  &.energy { background: color-mix(in srgb, #f59e0b 10%, var(--color-surface)); }
  &.mineral { background: color-mix(in srgb, #78716c 10%, var(--color-surface)); }
  &.water { background: color-mix(in srgb, var(--color-info) 10%, var(--color-surface)); }
  &.forest { background: color-mix(in srgb, var(--color-success) 10%, var(--color-surface)); }
  &.food { background: color-mix(in srgb, #fbbf24 10%, var(--color-surface)); }

  .overview-icon { font-size: 38px; }
  .overview-info {
    .overview-title { font-size: 12px; font-weight: 700; color: $color-text-light; text-transform: uppercase; }
    .overview-count { font-size: 22px; font-weight: 900; color: $color-text; letter-spacing: -1px; }
  }
}

.resource-charts {
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

.resource-list-section {
  @include neobrutal-card;
  padding: 25px;
}

.list-header {
  @include flex-between;
  margin-bottom: 25px;

  h3 { margin: 0; font-size: 22px; font-weight: 900; color: $color-text; }
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;

  :deep(.neo-select) {
    min-width: 160px;
    max-width: 180px;
  }
}

.filter-select {
  padding: 10px 16px;
  border: $border-dark;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 700;
  background: white;
  cursor: pointer;
  transition: $transition-smooth;

  &:focus { outline: none; background: color-mix(in srgb, var(--color-primary) 5%, transparent); }
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 25px;
}

.resource-card {
  padding: 24px;
  border-radius: $radius-lg;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  transition: $transition-smooth;

  &:hover { transform: translateY(-5px); box-shadow: 0 10px 0 rgba(0,0,0,0.05); }
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 3px solid var(--color-divider);
}

.resource-icon { font-size: 44px; }

.resource-title {
  flex: 1;
  h4 { margin: 0; font-size: 20px; font-weight: 900; color: $color-text; }
  .resource-type { font-size: 11px; font-weight: 800; color: $color-text-light; text-transform: uppercase; }
}

.sustainability-badge {
  padding: 5px 12px;
  border: 2px solid var(--color-border);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 3px 3px 0 var(--color-border);

  &.excellent { background: $color-success; color: white; }
  &.good { background: $color-warning; color: white; }
  &.moderate { background: #FF9800; color: white; }
  &.poor { background: $color-error; color: white; }
}

.resource-stats {
  margin-bottom: 20px;
}

.stat-row {
  @include flex-between;
  padding: 10px 0;
  border-bottom: 1.5px solid var(--color-divider);

  &:last-child { border-bottom: none; }

  .stat-label { font-size: 13px; font-weight: 700; color: $color-text-light; }
  .stat-value { font-size: 14px; font-weight: 800; color: $color-text; }
}

.resource-balance {
  margin-bottom: 25px;
  padding: 20px;
  background: var(--color-surface-alt);
  border: 2px solid var(--color-border);
  border-radius: $radius-md;

  .balance-header {
    @include flex-between;
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
  }

  .balance-bar {
    height: 12px;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
    position: relative;

    .balance-fill {
      height: 100%;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      &.surplus { background: $color-success; }
      &.balanced { background: $color-warning; }
      &.shortage { background: $color-error; }
    }
  }

  .balance-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 10px;
    font-weight: 900;
    color: $color-text-light;
    text-transform: uppercase;
  }
}

.resource-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  font-weight: 800;
  padding: 10px;
  @include neobrutal-button;

  &.view { background: $color-info; color: white; }
  &.edit { background: $color-warning; color: white; }
  &.allocate { background: $color-secondary; color: white; }
}

.resource-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}
</style>
