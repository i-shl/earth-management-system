<template>
  <div class="continents-management">
    <!-- 顶部标题 + 操作区 -->
    <div class="panel-header">
      <div class="header-left">
        <h2>🌎 全球大洲管理系统</h2>
        <span class="subtitle">
          管理 {{ earthStore.continents.length }} 个大洲，{{ totalCountries }} 个国家
        </span>
      </div>
      <NeoButton @click="showAddContinentDialog = true" class="add-button">
        + 添加大洲
      </NeoButton>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-overview">
      <div
        v-for="stat in continentStats"
        :key="stat.label"
        class="stat-card"
      >
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" :class="stat.trendClass">
            {{ stat.trend }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3>🌍 大洲面积分布</h3>
          <span class="chart-desc">各大洲面积占比</span>
        </div>
        <div ref="areaChart" class="chart"></div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>👥 大洲人口分布</h3>
          <span class="chart-desc">各大洲人口对比</span>
        </div>
        <div ref="populationChart" class="chart"></div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>🌡️ 平均气温对比</h3>
          <span class="chart-desc">各大洲气候特征</span>
        </div>
        <div ref="tempChart" class="chart"></div>
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <h3>🏛️ 国家数量统计</h3>
          <span class="chart-desc">各大洲国家分布</span>
        </div>
        <div ref="countryChart" class="chart"></div>
      </div>
    </div>

    <!-- 大洲卡片列表 -->
    <div class="continents-section">
      <div class="section-title">
        <h3>🗺️ 大洲详细信息</h3>
      </div>
      <div class="continents-grid">
        <div
          v-for="continent in earthStore.continents"
          :key="continent.id"
          class="continent-card"
        >
          <div class="card-header">
            <h3>{{ continent.name }}</h3>
            <span class="climate-tag">{{ continent.climate }}</span>
          </div>
          <div class="continent-stats">
            <div class="stat">
              <span class="stat-label">面积</span>
              <span class="stat-value">
                {{ formatNumber(continent.area) }} km²
              </span>
            </div>
            <div class="stat">
              <span class="stat-label">人口</span>
              <span class="stat-value">
                {{ formatNumber(continent.population) }}
              </span>
            </div>
            <div class="stat">
              <span class="stat-label">国家数</span>
              <span class="stat-value">{{ continent.countries.length }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">平均气温</span>
              <span class="stat-value">{{ continent.avgTemp }}°C</span>
            </div>
          </div>
          <div class="card-actions">
            <NeoButton
              @click="viewContinentDetails(continent)"
              class="action-btn"
            >
              详情
            </NeoButton>
            <NeoButton
              @click="manageContinent(continent)"
              class="action-btn"
            >
              管理
            </NeoButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加大洲对话框 -->
    <NeoDialog v-model="showAddContinentDialog" title="添加新区域">
      <form @submit.prevent="handleAddContinent" class="dialog-form">
        <NeoInput
          v-model="newContinent.name"
          placeholder="大洲名称"
          label="名称"
          required
        />
        <div class="form-row">
          <NeoInput
            v-model.number="newContinent.area"
            placeholder="面积"
            label="面积 (km²)"
            type="number"
          />
          <NeoInput
            v-model.number="newContinent.population"
            placeholder="人口"
            label="人口"
            type="number"
          />
        </div>
        <div class="form-row">
          <NeoInput
            v-model="newContinent.climate"
            placeholder="气候类型"
            label="气候"
          />
          <NeoInput
            v-model.number="newContinent.avgTemp"
            placeholder="平均气温"
            label="气温(°C)"
            type="number"
          />
        </div>
        <div class="form-actions">
          <NeoButton
            nativeType="button"
            @click="showAddContinentDialog = false"
          >
            取消
          </NeoButton>
          <NeoButton nativeType="submit" class="submit-btn">
            添加
          </NeoButton>
        </div>
      </form>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { NeoButton, NeoDialog, NeoInput } from 'neo-brutal-vue'
import { useEarthStore, type Continent } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const showAddContinentDialog = ref(false)
const areaChart = ref<HTMLElement>()
const populationChart = ref<HTMLElement>()
const tempChart = ref<HTMLElement>()
const countryChart = ref<HTMLElement>()

let charts: echarts.ECharts[] = []
const handleResize = () => charts.forEach(c => c.resize())

const newContinent = reactive({
  name: '',
  area: 0,
  population: 0,
  climate: '',
  avgTemp: 0
})

// 统计数据
const totalCountries = computed(() =>
  earthStore.continents.reduce((sum, c) => sum + c.countries.length, 0)
)

const continentStats = computed(() => {
  const continents = earthStore.continents
  const totalArea = continents.reduce((sum, c) => sum + c.area, 0)
  const totalPop = continents.reduce((sum, c) => sum + c.population, 0)
  const avgTemp = continents.reduce((sum, c) => sum + c.avgTemp, 0) / continents.length
  const maxPopContinent = continents.reduce((max, c) => c.population > max.population ? c : max, continents[0])

  return [
    { icon: '🌍', value: formatNumber(totalArea) + ' km²', label: '总陆地面积', trend: '占地球29%', trendClass: 'neutral' },
    { icon: '👥', value: formatNumber(totalPop), label: '总人口', trend: '+1.2% 年增长', trendClass: 'success' },
    { icon: '🌡️', value: avgTemp.toFixed(1) + '°C', label: '平均气温', trend: '+0.8°C vs 1900', trendClass: 'warning' },
    { icon: '🏆', value: maxPopContinent?.name || '-', label: '人口最多大洲', trend: formatNumber(maxPopContinent?.population || 0), trendClass: 'neutral' }
  ]
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const viewContinentDetails = (continent: Continent) => {
  alert(`${continent.name} 详情：\n面积：${formatNumber(continent.area)} km²\n人口：${formatNumber(continent.population)}\n国家数：${continent.countries.length}\n气候：${continent.climate}\n平均气温：${continent.avgTemp}°C`)
}

const manageContinent = (continent: Continent) => {
  alert(`管理 ${continent.name} 功能开发中...`)
}

const handleAddContinent = () => {
  if (!newContinent.name) return
  earthStore.addContinent({ ...newContinent })
  showAddContinentDialog.value = false
  Object.assign(newContinent, { name: '', area: 0, population: 0, climate: '', avgTemp: 0 })
}

// 初始化面积分布图
const initAreaChart = () => {
  if (!areaChart.value) return

  const chart = echarts.init(areaChart.value)
  const data = earthStore.continents.map(c => ({
    name: c.name,
    value: c.area
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

// 初始化人口分布图
const initPopulationChart = () => {
  if (!populationChart.value) return

  const chart = echarts.init(populationChart.value)
  const data = earthStore.continents.map(c => ({
    name: c.name,
    value: c.population
  }))

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { fontWeight: 'bold', rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: '人口',
      axisLabel: { formatter: (value: number) => (value / 100000000).toFixed(1) + '亿' }
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
        formatter: (params: any) => (params.value / 100000000).toFixed(1) + '亿',
        fontWeight: 'bold'
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化气温对比图
const initTempChart = () => {
  if (!tempChart.value) return

  const chart = echarts.init(tempChart.value)
  const data = earthStore.continents.map(c => ({
    name: c.name,
    value: c.avgTemp
  }))

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { fontWeight: 'bold', rotate: 30 }
    },
    yAxis: {
      type: 'value',
      name: '温度 (°C)',
      axisLabel: { formatter: '{value}°C' }
    },
    series: [{
      type: 'line',
      data: data.map(d => d.value),
      smooth: true,
      lineStyle: {
        color: '#f59e0b',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245, 158, 11, 0.5)' },
          { offset: 1, color: 'rgba(245, 158, 11, 0.1)' }
        ])
      },
      itemStyle: { color: '#f59e0b' }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化国家数量图
const initCountryChart = () => {
  if (!countryChart.value) return

  const chart = echarts.init(countryChart.value)
  const data = earthStore.continents.map(c => ({
    name: c.name,
    value: c.countries.length
  }))

  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '70%',
      data: data,
      label: {
        show: true,
        formatter: '{b}: {c}',
        fontWeight: 'bold'
      },
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

onMounted(() => {
  initAreaChart()
  initPopulationChart()
  initTempChart()
  initCountryChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
})
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.continents-management {
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

.continents-section {
  @include neobrutal-card;
  padding: 25px;
  background: var(--color-surface);
}

.section-title {
  margin-bottom: 25px;

  h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 900;
    color: $color-text;
  }
}

.continents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.continent-card {
  @include neobrutal-card;
  padding: 24px;
  background: var(--color-surface);
  transition: $transition-smooth;

  &:hover { transform: translateY(-5px); }

  .card-header {
    @include flex-between;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 3px solid var(--color-divider);

    h3 { margin: 0; font-size: 20px; font-weight: 900; }
    .climate-tag {
      padding: 4px 10px;
      background: $color-info;
      color: white;
      border: 2px solid var(--color-border);
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      box-shadow: 2px 2px 0 var(--color-border);
    }
  }
}

.continent-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;

  .stat {
    .stat-label { font-size: 11px; font-weight: 700; color: $color-text-light; text-transform: uppercase; }
    .stat-value { font-size: 14px; font-weight: 900; color: $color-text; }
  }
}

.card-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  font-weight: 800;
  @include neobrutal-button;

  &:first-child { background: $color-primary; color: white; }
  &:last-child { background: $color-warning; color: white; }
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
