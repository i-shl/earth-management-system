<template>
  <div class="humans-management">
    <!-- 顶部统计卡片 -->
    <div class="stats-overview">
      <div class="stat-card neo-brutal-card" v-for="stat in statsCards" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <component :is="stat.icon" :size="24" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" :class="stat.trendType">{{ stat.trend }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 年龄分布 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><Users :size="20" /> 年龄分布</h3>
        </div>
        <div ref="ageChart" class="chart-content"></div>
      </div>

      <!-- 职业分布 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><Briefcase :size="20" /> 职业分布</h3>
        </div>
        <div ref="occupationChart" class="chart-content"></div>
      </div>

      <!-- 健康状况 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><Heart :size="20" /> 健康状况分析</h3>
        </div>
        <div ref="healthChart" class="chart-content"></div>
      </div>

      <!-- 收入分布 -->
      <div class="chart-panel neo-brutal-card">
        <div class="panel-header">
          <h3><DollarSign :size="20" /> 收入分布</h3>
        </div>
        <div ref="incomeChart" class="chart-content"></div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="panel-header">
      <div class="header-left">
        <h2>👥 人口数据列表</h2>
        <div class="header-stats">
          <span class="stat-badge">总计: {{ earthStore.humans.length }}</span>
          <span class="stat-badge active">活跃: {{ earthStore.activeHumans.length }}</span>
        </div>
      </div>
      <NeoButton @click="showAddDialog = true" class="add-btn">+ 新增记录</NeoButton>
    </div>

    <div class="filters">
      <div class="search-wrapper">
        <Search :size="18" class="search-icon" />
        <NeoInput v-model="humanSearch" placeholder="搜索姓名/国家/职位..." class="search-input" />
      </div>
      <div class="filter-group">
        <label>状态:</label>
        <NeoSelect
          v-model="humanFilterStatus"
          :options="statusFilterOptions"
          placeholder="全部状态"
          clearable
        />
      </div>
      <div class="filter-group">
        <label>国家:</label>
        <NeoSelect
          v-model="humanFilterCountry"
          :options="countryFilterOptions"
          placeholder="全部国家"
          clearable
        />
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>国家</th>
            <th>年龄</th>
            <th>职业</th>
            <th>学历</th>
            <th>健康</th>
            <th>年收入</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="human in filteredHumans" :key="human.id">
            <td class="id-cell">#{{ human.id }}</td>
            <td class="name-cell">
              <div class="name-wrapper">
                <User :size="16" />
                {{ human.name }}
              </div>
            </td>
            <td>
              <div class="country-cell">
                <MapPin :size="14" />
                {{ human.country }}
              </div>
            </td>
            <td>{{ human.age }}岁</td>
            <td>{{ human.occupation }}</td>
            <td>
              <span class="education-badge">{{ human.education }}</span>
            </td>
            <td>
              <div class="health-col">
                <div class="health-bar-bg">
                  <div class="health-bar-fill" :style="{ width: human.health + '%' }" :class="getHealthClass(human.health)"></div>
                </div>
                <span class="health-val">{{ human.health }}%</span>
              </div>
            </td>
            <td class="income-cell">${{ formatNumber(human.income) }}</td>
            <td>
              <span class="status-marker" :class="human.status">{{ getStatusLabel(human.status) }}</span>
            </td>
            <td>
              <div class="action-btns">
                <button @click="viewDetails(human)" class="action-btn view" title="查看详情">
                  <Eye :size="14" />
                </button>
                <button @click="editHuman(human)" class="action-btn edit" title="编辑">
                  <Edit :size="14" />
                </button>
                <button @click="deleteHuman(human)" class="action-btn delete" title="删除">
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加对话框 -->
    <NeoDialog v-model="showAddDialog" title="新增人口记录">
      <div class="dialog-mock">
        <p>此功能正在开发中，将连接到全球户籍数据库...</p>
        <NeoButton @click="showAddDialog = false" class="submit-btn">关闭</NeoButton>
      </div>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NeoButton, NeoInput, NeoDialog, NeoSelect } from 'neo-brutal-vue'
import { Users, Briefcase, Heart, DollarSign, Search, MapPin, User, Eye, Edit, Trash2, TrendingUp, Activity, GraduationCap } from 'lucide-vue-next'
import * as echarts from 'echarts'
import { useEarthStore } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const humanSearch = ref('')
const humanFilterStatus = ref('')
const humanFilterCountry = ref('')
const showAddDialog = ref(false)

const ageChart = ref<HTMLElement>()
const occupationChart = ref<HTMLElement>()
const healthChart = ref<HTMLElement>()
const incomeChart = ref<HTMLElement>()

let charts: echarts.ECharts[] = []

// 统计卡片数据
const statsCards = computed(() => {
  const humans = earthStore.humans
  const avgAge = humans.reduce((sum, h) => sum + h.age, 0) / humans.length
  const avgHealth = humans.reduce((sum, h) => sum + h.health, 0) / humans.length
  const avgIncome = humans.reduce((sum, h) => sum + h.income, 0) / humans.length
  const activeCount = humans.filter(h => h.status === 'active').length

  return [
    {
      icon: Users,
      label: '总人口',
      value: humans.length.toString(),
      trend: '+2 本月',
      trendType: 'up',
      color: '#667eea'
    },
    {
      icon: Activity,
      label: '活跃用户',
      value: activeCount.toString(),
      trend: `${((activeCount / humans.length) * 100).toFixed(0)}%`,
      trendType: 'up',
      color: '#2ed573'
    },
    {
      icon: Heart,
      label: '平均健康',
      value: avgHealth.toFixed(0) + '%',
      trend: '+3% vs 上月',
      trendType: 'up',
      color: '#ff6348'
    },
    {
      icon: TrendingUp,
      label: '平均年龄',
      value: avgAge.toFixed(0) + '岁',
      trend: '稳定',
      trendType: 'stable',
      color: '#ffa502'
    },
    {
      icon: DollarSign,
      label: '平均收入',
      value: '$' + formatNumber(Math.round(avgIncome)),
      trend: '+8% vs 上月',
      trendType: 'up',
      color: '#1e90ff'
    },
    {
      icon: GraduationCap,
      label: '高学历',
      value: humans.filter(h => h.education === '硕士' || h.education === '博士').length.toString(),
      trend: `${((humans.filter(h => h.education === '硕士' || h.education === '博士').length / humans.length) * 100).toFixed(0)}%`,
      trendType: 'up',
      color: '#9b59b6'
    }
  ]
})

// 唯一国家列表
const uniqueCountries = computed(() => {
  return [...new Set(earthStore.humans.map(h => h.country))].sort()
})

// 筛选选项
const statusFilterOptions = [
  { label: '活跃', value: 'active' },
  { label: '非活跃', value: 'inactive' },
  { label: '暂停', value: 'suspended' }
]

const countryFilterOptions = computed(() =>
  uniqueCountries.value.map(country => ({
    label: country,
    value: country
  }))
)

// 过滤后的人口数据
const filteredHumans = computed(() => {
  let result = [...earthStore.humans]
  if (humanSearch.value) {
    const q = humanSearch.value.toLowerCase()
    result = result.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.country.toLowerCase().includes(q) ||
      h.occupation.toLowerCase().includes(q)
    )
  }
  if (humanFilterStatus.value) {
    result = result.filter(h => h.status === humanFilterStatus.value)
  }
  if (humanFilterCountry.value) {
    result = result.filter(h => h.country === humanFilterCountry.value)
  }
  return result
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { active: '活跃', inactive: '离线', suspended: '暂停' }
  return map[status] || status
}

const getHealthClass = (health: number) => {
  if (health > 80) return 'excellent'
  if (health > 60) return 'good'
  return 'critical'
}

// 初始化年龄分布图表
const initAgeChart = () => {
  if (!ageChart.value) return

  const chart = echarts.init(ageChart.value)
  const ageGroups = {
    '20-30': 0,
    '31-40': 0,
    '41-50': 0,
    '50+': 0
  }

  earthStore.humans.forEach(h => {
    if (h.age <= 30) ageGroups['20-30']++
    else if (h.age <= 40) ageGroups['31-40']++
    else if (h.age <= 50) ageGroups['41-50']++
    else ageGroups['50+']++
  })

  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
      label: {
        show: true,
        formatter: '{b}: {c}人',
        color: '#333',
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化职业分布图表
const initOccupationChart = () => {
  if (!occupationChart.value) return

  const chart = echarts.init(occupationChart.value)
  const occupations: Record<string, number> = {}

  earthStore.humans.forEach(h => {
    occupations[h.occupation] = (occupations[h.occupation] || 0) + 1
  })

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: Object.keys(occupations),
      axisLabel: { rotate: 30, color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#666' }
    },
    series: [{
      type: 'bar',
      data: Object.values(occupations),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      },
      barWidth: '60%'
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化健康状况图表
const initHealthChart = () => {
  if (!healthChart.value) return

  const chart = echarts.init(healthChart.value)
  const healthData = earthStore.humans.map(h => h.health).sort((a, b) => a - b)

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: earthStore.humans.map((_, i) => `P${i + 1}`),
      axisLabel: { show: false }
    },
    yAxis: {
      type: 'value',
      name: '健康指数',
      axisLabel: { color: '#666' }
    },
    series: [{
      type: 'line',
      data: healthData,
      smooth: true,
      lineStyle: { color: '#2ed573', width: 3 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(46, 213, 115, 0.5)' },
          { offset: 1, color: 'rgba(46, 213, 115, 0.1)' }
        ])
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化收入分布图表
const initIncomeChart = () => {
  if (!incomeChart.value) return

  const chart = echarts.init(incomeChart.value)
  const incomeGroups = {
    '0-20万': 0,
    '20-30万': 0,
    '30-40万': 0,
    '40万+': 0
  }

  earthStore.humans.forEach(h => {
    if (h.income < 200000) incomeGroups['0-20万']++
    else if (h.income < 300000) incomeGroups['20-30万']++
    else if (h.income < 400000) incomeGroups['30-40万']++
    else incomeGroups['40万+']++
  })

  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '70%',
      data: Object.entries(incomeGroups).map(([name, value]) => ({ name, value })),
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        color: '#333',
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

const handleResize = () => {
  charts.forEach(chart => chart.resize())
}

const viewDetails = (human: any) => {
  alert(`查看详情: ${human.name}\n国家: ${human.country}\n职业: ${human.occupation}\n邮箱: ${human.email}\n电话: ${human.phone}`)
}

const editHuman = (human: any) => {
  alert(`编辑: ${human.name}`)
}

const deleteHuman = (human: any) => {
  if (confirm(`确定要删除 ${human.name} 的记录吗？`)) {
    alert(`已删除: ${human.name}`)
  }
}

onMounted(() => {
  initAgeChart()
  initOccupationChart()
  initHealthChart()
  initIncomeChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(chart => chart.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.humans-management {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

// 统计卡片
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  padding: 20px;
  display: flex;
  gap: 15px;
  align-items: center;
  transition: $transition-smooth;

  &:hover { transform: translateY(-5px); }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: $radius-md;
    @include flex-center;
    color: white;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    .stat-value { font-size: 22px; font-weight: 900; color: $color-text; letter-spacing: -1px; }
    .stat-label { font-size: 11px; color: $color-text-light; font-weight: 700; text-transform: uppercase; margin: 5px 0; }
    .stat-trend {
      font-size: 11px;
      font-weight: 800;
      &.up { color: $color-success; }
      &.down { color: $color-error; }
      &.stable { color: $color-text-light; }
    }
  }
}

// 图表区域
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.chart-panel {
  padding: 25px;
  min-height: 320px;

  .panel-header {
    margin-bottom: 20px;
    h3 {
      font-size: 18px;
      font-weight: 900;
      color: $color-text;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .chart-content {
    height: 250px;
  }
}

// 页面头部
.panel-header {
  @include flex-between;
  margin-bottom: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    h2 { margin: 0; font-size: 26px; font-weight: 900; color: $color-text; }
  }

  .header-stats {
    display: flex;
    gap: 12px;
    .stat-badge {
      padding: 6px 14px;
      border: 2px solid var(--color-border);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 800;
      background: var(--color-surface);
      box-shadow: 2px 2px 0 var(--color-border);
      &.active { background: $color-success; color: white; border-color: $color-success; }
    }
  }
}

// 筛选区域
.filters {
  display: flex;
  gap: 15px;
  padding: 18px;
  background: var(--color-surface);
  border: 3px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: 4px 4px 0 var(--color-border);

  .search-wrapper {
    flex: 1;
    position: relative;
    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: $color-text-light;
    }
    .search-input {
      width: 100%;
      padding-left: 40px;
    }
  }

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
    label { font-size: 12px; font-weight: 800; text-transform: uppercase; color: $color-text; }
    :deep(.neo-select) {
      min-width: 150px;
      max-width: 170px;
    }
    .filter-select {
      padding: 10px 14px;
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
}

// 表格容器
.table-container {
  @include neobrutal-card;
  padding: 24px;
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 10px;

    th {
      text-align: left;
      padding: 12px;
      font-size: 11px;
      font-weight: 900;
      color: $color-text-light;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    td {
      padding: 16px 12px;
      background: var(--color-surface);
      border-top: 2.5px solid var(--color-border);
      border-bottom: 2.5px solid var(--color-border);
      font-size: 13px;
      font-weight: 700;

      &:first-child { border-left: 2.5px solid var(--color-border); border-radius: $radius-md 0 0 $radius-md; }
      &:last-child { border-right: 2.5px solid var(--color-border); border-radius: 0 $radius-md $radius-md 0; }
    }

    .id-cell { color: $color-text-light; font-size: 11px; }

    .name-cell {
      color: $color-primary;
      font-weight: 900;
      .name-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .country-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      color: $color-text;
    }

    .education-badge {
      padding: 3px 8px;
      background: color-mix(in srgb, var(--color-primary) 15%, transparent);
      color: $color-primary;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
    }

    .income-cell { color: $color-success; font-weight: 900; }

    .health-col {
      display: flex;
      align-items: center;
      gap: 10px;
      .health-bar-bg {
        width: 70px;
        height: 8px;
        background: var(--color-divider);
        border: 1.5px solid var(--color-border);
        border-radius: 4px;
        overflow: hidden;
      }
      .health-bar-fill {
        height: 100%;
        transition: width 0.3s ease;
        &.excellent { background: $color-success; }
        &.good { background: $color-warning; }
        &.critical { background: $color-error; }
      }
      .health-val { font-size: 11px; font-weight: 800; }
    }

    .status-marker {
      padding: 4px 10px;
      border-radius: 6px;
      border: 1.5px solid var(--color-border);
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      box-shadow: 2px 2px 0 var(--color-border);

      &.active { background: color-mix(in srgb, var(--color-success) 15%, transparent); color: $color-success; border-color: $color-success; }
      &.inactive { background: var(--color-surface-alt); color: $color-text-light; }
      &.suspended { background: color-mix(in srgb, var(--color-warning) 15%, transparent); color: $color-warning; border-color: $color-warning; }
    }
  }
}

// 操作按钮
.action-btns {
  display: flex;
  gap: 6px;

  .action-btn {
    padding: 6px 8px;
    border: 2px solid var(--color-border);
    border-radius: $radius-md;
    background: var(--color-surface);
    cursor: pointer;
    transition: $transition-smooth;
    display: flex;
    align-items: center;
    justify-content: center;

    &.view {
      &:hover { background: $color-info; color: white; border-color: $color-info; }
    }
    &.edit {
      &:hover { background: $color-primary; color: white; border-color: $color-primary; }
    }
    &.delete {
      &:hover { background: $color-error; color: white; border-color: $color-error; }
    }
  }
}

.add-btn {
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

// 对话框
.dialog-mock {
  padding: 20px;
  text-align: center;
  p { margin-bottom: 20px; font-weight: 600; color: $color-text-light; }
  .submit-btn { background: $color-primary; color: white; @include neobrutal-button; }
}
</style>
