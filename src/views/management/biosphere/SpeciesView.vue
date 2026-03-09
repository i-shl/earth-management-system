<template>
  <div class="species-view animate__animated animate__fadeIn">
    <div class="section-header">
      <div class="header-content">
        <h2>🦓 生物多样性监控中心</h2>
        <p>全球物种资源、濒危状态及栖息地动态实时分析 - 监控 {{ earthStore.species.length }} 个物种</p>
      </div>
      <div class="header-actions">
        <NeoButton @click="exportReport" class="export-btn"><Download :size="16" /> 导出报告</NeoButton>
        <NeoButton @click="showAddDialog = true" class="add-btn"><Plus :size="16" /> 添加物种监控</NeoButton>
      </div>
    </div>

    <div class="stats-cards">
      <div class="stat-card neo-brutal-card" v-for="stat in summaryStats" :key="stat.label">
        <div class="stat-icon" :style="{ backgroundColor: stat.color }">
          <component :is="stat.icon" :size="24" />
        </div>
        <div class="stat-info">
          <span class="value">{{ stat.value }}</span>
          <span class="label">{{ stat.label }}</span>
          <span class="trend" :class="stat.trendClass">{{ stat.trend }}</span>
        </div>
      </div>
    </div>

    <!-- 数据分析图表 -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3>📊 物种状态分布</h3>
          <span class="chart-desc">各濒危等级物种数量</span>
        </div>
        <div ref="statusChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3>📈 物种类型分布</h3>
          <span class="chart-desc">哺乳动物、鸟类、爬行动物等</span>
        </div>
        <div ref="typeChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3>📉 种群趋势分析</h3>
          <span class="chart-desc">上升、稳定、下降趋势对比</span>
        </div>
        <div ref="trendChart" class="chart"></div>
      </div>
      <div class="chart-container">
        <div class="chart-header">
          <h3>🌍 栖息地健康度</h3>
          <span class="chart-desc">主要栖息地完存度评估</span>
        </div>
        <div ref="habitatChart" class="chart"></div>
      </div>
    </div>

    <div class="main-grid">
      <div class="species-list-section neo-brutal-card">
        <div class="list-header">
          <h3>受监控物种 ({{ filteredSpecies.length }} / {{ earthStore.species.length }})</h3>
          <div class="filter-controls">
            <NeoSelect
              v-model="filterStatus"
              :options="statusOptions"
              placeholder="全部状态"
              clearable
            />
            <NeoSelect
              v-model="filterType"
              :options="typeOptions"
              placeholder="全部类型"
              clearable
            />
            <div class="search-box">
              <Search :size="16" />
              <input type="text" v-model="searchQuery" placeholder="搜索物种..." />
            </div>
          </div>
        </div>
        
        <table class="neo-table">
          <thead>
            <tr>
              <th>物种名称</th>
              <th>分类</th>
              <th>当前状态</th>
              <th>数量</th>
              <th>趋势</th>
              <th>最后更新</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filteredSpecies" :key="s.id">
              <td class="name-cell">
                <div class="name-box">
                  <span class="indicator" :class="s.status"></span>
                  {{ s.name }}
                </div>
              </td>
              <td><span class="type-tag">{{ s.type }}</span></td>
              <td>
                <span class="status-badge" :class="s.status">
                   {{ getStatusText(s.status) }}
                </span>
              </td>
              <td class="font-mono">{{ s.population.toLocaleString() }}</td>
              <td>
                <div class="trend-box" :class="s.trend">
                   <ArrowUp v-if="s.trend === 'increasing'" :size="14" />
                   <ArrowDown v-else-if="s.trend === 'decreasing'" :size="14" />
                   <Minus v-else :size="14" />
                   {{ getTrendText(s.trend) }}
                </div>
              </td>
              <td class="time-cell">{{ s.lastSighting }}</td>
              <td>
                <button class="edit-link" @click="viewSpeciesDetails(s)">监控详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="habitat-info neo-brutal-card">
        <h3>主要栖息地状态</h3>
        <div class="habitat-list">
          <div v-for="h in habitats" :key="h.name" class="habitat-item">
            <div class="habitat-header">
              <span class="h-name">{{ h.name }}</span>
              <span class="h-health" :style="{ color: h.health > 70 ? 'var(--color-success)' : 'var(--color-warning)' }">
                {{ h.health }}% 完存度
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: h.health + '%', backgroundColor: h.color }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加物种对话框 -->
    <NeoDialog v-model="showAddDialog" title="添加物种监控">
      <form @submit.prevent="handleAddSpecies" class="species-form">
        <NeoInput v-model="newSpecies.name" placeholder="物种名称" label="名称" required />
        <div class="form-row">
          <NeoInput v-model="newSpecies.type" placeholder="物种类型" label="类型" />
          <NeoSelect
            v-model="newSpecies.status"
            :options="statusOptions"
            placeholder="选择状态"
            required
          />
        </div>
        <div class="form-row">
          <NeoInput v-model.number="newSpecies.population" placeholder="种群数量" label="数量" type="number" />
          <NeoSelect
            v-model="newSpecies.trend"
            :options="trendOptions"
            placeholder="选择趋势"
          />
        </div>
        <NeoInput v-model="newSpecies.lastSighting" placeholder="最后观测时间" label="最后观测" />
        <div class="form-actions">
          <NeoButton nativeType="button" @click="showAddDialog = false">取消</NeoButton>
          <NeoButton nativeType="submit" class="submit-btn">添加</NeoButton>
        </div>
      </form>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  Plus, Download, Search, Activity, ShieldAlert, Heart,
  ArrowUp, ArrowDown, Minus, TreeDeciduous
} from 'lucide-vue-next'
import { NeoButton, NeoDialog, NeoInput, NeoSelect } from 'neo-brutal-vue'
import { useEarthStore, type Species } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const showAddDialog = ref(false)
const filterStatus = ref('')
const filterType = ref('')
const searchQuery = ref('')
const statusChart = ref<HTMLElement>()
const typeChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()
const habitatChart = ref<HTMLElement>()

let charts: echarts.ECharts[] = []
const handleResize = () => charts.forEach(c => c.resize())

const newSpecies = ref({
  name: '',
  type: '',
  status: '' as Species['status'],
  population: 0,
  trend: 'stable' as Species['trend'],
  lastSighting: new Date().toISOString().split('T')[0]
})

// 选项数组
const statusOptions = [
  { label: '安全', value: 'safe' },
  { label: '易危', value: 'vulnerable' },
  { label: '濒危', value: 'endangered' },
  { label: '极危', value: 'critical' },
  { label: '绝灭', value: 'extinct' }
]

const typeOptions = [
  { label: '哺乳动物', value: '哺乳动物' },
  { label: '鸟类', value: '鸟类' },
  { label: '爬行动物', value: '爬行动物' },
  { label: '鱼类', value: '鱼类' },
  { label: '植物', value: '植物' }
]

const trendOptions = [
  { label: '上升', value: 'increasing' },
  { label: '稳定', value: 'stable' },
  { label: '下降', value: 'decreasing' }
]

const summaryStats = computed(() => {
  const species = earthStore.species
  const criticalCount = species.filter(s => s.status === 'critical').length
  const endangeredCount = species.filter(s => s.status === 'endangered').length
  const increasingCount = species.filter(s => s.trend === 'increasing').length
  const totalPopulation = species.reduce((sum, s) => sum + s.population, 0)

  return [
    {
      label: '监控中物种',
      value: species.length.toString(),
      icon: Activity,
      color: 'var(--color-primary)',
      trend: `+${increasingCount} 种群上升`,
      trendClass: 'success'
    },
    {
      label: '极度濒危',
      value: criticalCount.toString(),
      icon: ShieldAlert,
      color: 'var(--color-error)',
      trend: '需紧急保护',
      trendClass: 'danger'
    },
    {
      label: '濒危物种',
      value: endangeredCount.toString(),
      icon: TreeDeciduous,
      color: 'var(--color-warning)',
      trend: '重点关注',
      trendClass: 'warning'
    },
    {
      label: '总种群数量',
      value: formatNumber(totalPopulation),
      icon: Heart,
      color: 'var(--color-accent)',
      trend: '持续监测中',
      trendClass: 'neutral'
    },
  ]
})

const filteredSpecies = computed(() => {
  let result = [...earthStore.species]

  if (filterStatus.value) {
    result = result.filter(s => s.status === filterStatus.value)
  }
  if (filterType.value) {
    result = result.filter(s => s.type === filterType.value)
  }
  if (searchQuery.value) {
    result = result.filter(s =>
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return result
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const habitats = [
  { name: '亚马逊热带雨林', health: 82, color: '#10b981' },
  { name: '大堡礁珊瑚区', health: 45, color: '#ef4444' },
  { name: '西伯利亚泰加林', health: 91, color: '#3b82f6' },
  { name: '撒哈拉以南萨瓦纳', health: 76, color: '#f59e0b' },
]

const getStatusText = (status: string) => {
  const map: any = { extinct: '绝灭', critical: '极危', endangered: '濒危', vulnerable: '易危', safe: '安全' }
  return map[status] || status
}

const getTrendText = (trend: string) => {
  const map: any = { increasing: '上升', decreasing: '下降', stable: '稳定' }
  return map[trend] || trend
}

const viewSpeciesDetails = (species: Species) => {
  alert(`${species.name} 详情：\n类型：${species.type}\n状态：${getStatusText(species.status)}\n种群数量：${formatNumber(species.population)}\n趋势：${getTrendText(species.trend)}\n最后观测：${species.lastSighting}`)
}

const exportReport = () => {
  alert('正在导出生物多样性报告...')
}

const handleAddSpecies = () => {
  if (!newSpecies.value.name || !newSpecies.value.status) return

  earthStore.addSpecies({ ...newSpecies.value })
  showAddDialog.value = false
  newSpecies.value = {
    name: '',
    type: '',
    status: '' as Species['status'],
    population: 0,
    trend: 'stable',
    lastSighting: new Date().toISOString().split('T')[0]
  }
}

// 初始化物种状态分布图
const initStatusChart = () => {
  if (!statusChart.value) return

  const chart = echarts.init(statusChart.value)
  const statusCount: Record<string, number> = {}
  earthStore.species.forEach(s => {
    statusCount[s.status] = (statusCount[s.status] || 0) + 1
  })

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
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
        formatter: '{b}\n{c}',
        fontWeight: 'bold'
      },
      data: [
        { name: '安全', value: statusCount['safe'] || 0, itemStyle: { color: '#4CAF50' } },
        { name: '易危', value: statusCount['vulnerable'] || 0, itemStyle: { color: '#FFC107' } },
        { name: '濒危', value: statusCount['endangered'] || 0, itemStyle: { color: '#FF9800' } },
        { name: '极危', value: statusCount['critical'] || 0, itemStyle: { color: '#f44336' } },
        { name: '绝灭', value: statusCount['extinct'] || 0, itemStyle: { color: '#666' } }
      ]
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化物种类型分布图
const initTypeChart = () => {
  if (!typeChart.value) return

  const chart = echarts.init(typeChart.value)
  const typeCount: Record<string, number> = {}
  earthStore.species.forEach(s => {
    typeCount[s.type] = (typeCount[s.type] || 0) + 1
  })

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: Object.keys(typeCount),
      axisLabel: { fontWeight: 'bold' }
    },
    yAxis: {
      type: 'value',
      name: '物种数量'
    },
    series: [{
      type: 'bar',
      data: Object.values(typeCount),
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
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化种群趋势图
const initTrendChart = () => {
  if (!trendChart.value) return

  const chart = echarts.init(trendChart.value)
  const trendCount = {
    increasing: earthStore.species.filter(s => s.trend === 'increasing').length,
    stable: earthStore.species.filter(s => s.trend === 'stable').length,
    decreasing: earthStore.species.filter(s => s.trend === 'decreasing').length
  }

  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '70%',
      data: [
        { name: '上升', value: trendCount.increasing, itemStyle: { color: '#4CAF50' } },
        { name: '稳定', value: trendCount.stable, itemStyle: { color: '#2196F3' } },
        { name: '下降', value: trendCount.decreasing, itemStyle: { color: '#f44336' } }
      ],
      label: {
        show: true,
        formatter: '{b}: {c}\n({d}%)',
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化栖息地健康度图
const initHabitatChart = () => {
  if (!habitatChart.value) return

  const chart = echarts.init(habitatChart.value)

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    yAxis: {
      type: 'category',
      data: habitats.map(h => h.name)
    },
    series: [{
      type: 'bar',
      data: habitats.map(h => ({
        value: h.health,
        itemStyle: { color: h.color }
      })),
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

onMounted(() => {
  initStatusChart()
  initTypeChart()
  initTrendChart()
  initHabitatChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.species-view {
  padding: 30px;
}

.section-header {
  @include flex-between;
  margin-bottom: 30px;

  h2 { font-size: 28px; font-weight: 950; margin-bottom: 5px; }
  p { color: $color-text-light; font-weight: 700; font-size: 14px; }

  .header-actions { display: flex; gap: 15px; }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: $transition-smooth;

  &:hover { transform: translate(-4px, -4px); box-shadow: 8px 8px 0 var(--color-border); }

  .stat-icon {
    width: 50px; height: 50px; border-radius: 12px; @include flex-center;
    color: white; border: 2.5px solid var(--color-border); box-shadow: 3px 3px 0 var(--color-border);
  }

  .stat-info {
    flex: 1;
    .value { font-size: 24px; font-weight: 950; display: block; }
    .label { font-size: 11px; font-weight: 800; color: $color-text-light; text-transform: uppercase; }
    .trend {
      font-size: 11px;
      font-weight: 800;
      margin-top: 4px;
      display: block;
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

.main-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 30px;
}

.species-list-section {
  padding: 25px;
  
  .list-header {
    @include flex-between;
    margin-bottom: 20px;
    h3 { font-size: 18px; font-weight: 900; }

    .filter-controls {
      display: flex;
      gap: 12px;
      align-items: center;

      :deep(.neo-select) {
        min-width: 140px;
        max-width: 160px;
      }

      .filter-select {
        padding: 8px 14px;
        border: 2.5px solid var(--color-border);
        border-radius: $radius-sm;
        font-size: 13px;
        font-weight: 700;
        background: var(--color-surface-alt);
        color: var(--color-text);
        cursor: pointer;
        transition: $transition-smooth;

        &:focus { outline: none; background: var(--color-surface); }
      }

      .search-box {
        background: var(--color-surface-alt); border: 2.5px solid var(--color-border);
        padding: 6px 12px; display: flex; align-items: center; gap: 10px;
        border-radius: $radius-sm;
        input { background: none; border: none; outline: none; font-weight: 700; width: 180px; color: var(--color-text); }
      }
    }
  }
}

.species-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
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

.neo-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th { text-align: left; padding: 15px; font-size: 12px; font-weight: 950; color: $color-text-light; text-transform: uppercase; border-bottom: 3px solid var(--color-border); }
  td { padding: 15px; border-bottom: 1px solid var(--color-border-subtle); font-weight: 700; font-size: 14px; }
  
  .name-box {
    display: flex; align-items: center; gap: 10px;
    .indicator {
      width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--color-border);
      &.safe { background: $color-success; }
      &.vulnerable { background: $color-warning; }
      &.endangered { background: $color-accent; }
      &.critical { background: $color-error; }
      &.extinct { background: #666; }
    }
  }
  
  .type-tag { font-size: 11px; background: color-mix(in srgb, var(--color-primary) 10%, transparent); color: var(--color-primary); padding: 2px 8px; border-radius: 4px; border: 1.5px solid var(--color-border); }
  
  .status-badge {
    font-size: 10px; padding: 4px 10px; border-radius: 20px; border: 2.5px solid var(--color-border); box-shadow: 2px 2px 0 var(--color-border);
    &.safe { background: $color-success; color: white; }
    &.endangered { background: $color-accent; color: white; }
    &.critical { background: $color-error; color: white; }
    &.vulnerable { background: $color-warning; color: white; }
    &.extinct { background: #333; color: white; }
  }
  
  .trend-box {
    display: flex; align-items: center; gap: 4px; font-size: 12px;
    &.increasing { color: $color-success; }
    &.decreasing { color: $color-error; }
    &.stable { color: $color-text-light; }
  }
  
  .edit-link { color: $color-primary; font-weight: 900; background: none; border: none; cursor: pointer; &:hover { text-decoration: underline; } }
}

.habitat-info {
  padding: 25px;
  h3 { margin-bottom: 25px; font-weight: 900; }
}

.habitat-list {
  display: flex; flex-direction: column; gap: 20px;
}

.habitat-item {
  .habitat-header {
    @include flex-between; font-size: 13px; font-weight: 900; margin-bottom: 8px;
  }
  
  .progress-bar {
    height: 12px; background: var(--color-surface-alt); border: 2.5px solid var(--color-border); border-radius: 20px; overflow: hidden;
    .progress-fill { height: 100%; transition: width 0.6s ease; }
  }
}
</style>
