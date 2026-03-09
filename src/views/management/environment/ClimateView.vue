<template>
  <div class="weather-system">
    <div class="section-header">
      <div class="header-left">
        <h2>🌤️ 全球天气系统</h2>
        <span class="subtitle">实时监控 {{ earthStore.weather.length }} 个监测点</span>
      </div>
      <div class="header-actions">
        <NeoButton @click="refreshWeather" class="refresh-btn">
          🔄 刷新数据
        </NeoButton>
        <NeoButton @click="showAddDialog = true" class="add-btn">
          + 添加监测点
        </NeoButton>
      </div>
    </div>

    <!-- 全球天气概览 -->
    <div class="weather-overview">
      <div class="overview-card" v-for="stat in weatherStats" :key="stat.label">
        <div class="overview-icon">{{ stat.icon }}</div>
        <div class="overview-content">
          <div class="overview-value">{{ stat.value }}</div>
          <div class="overview-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 天气地图 -->
    <div class="weather-map-section">
      <div class="panel-header">
        <h3>🗺️ 全球气象监测网络</h3>
        <div class="legend">
          <span class="legend-item"><span class="dot sunny"></span> 晴朗</span>
          <span class="legend-item"><span class="dot cloudy"></span> 多云</span>
          <span class="legend-item"><span class="dot rainy"></span> 降雨</span>
          <span class="legend-item"><span class="dot stormy"></span> 风暴</span>
          <span class="legend-item"><span class="dot snowy"></span> 降雪</span>
        </div>
      </div>
      <div ref="weatherMapChart" class="weather-map-chart"></div>
    </div>

    <!-- 城市天气列表 -->
    <div class="cities-weather">
      <div class="panel-header">
        <h3>🏙️ 主要城市天气</h3>
        <NeoInput 
          v-model="searchCity" 
          placeholder="搜索城市..." 
          class="search-input"
        />
      </div>
      <div class="weather-grid">
        <div v-for="w in filteredWeather" :key="w.id" class="weather-card" :class="w.condition">
          <div class="weather-header">
            <span class="weather-icon">{{ getWeatherIcon(w.condition) }}</span>
            <div class="location-info">
              <h4>{{ w.location }}</h4>
              <span class="weather-desc">{{ getWeatherDesc(w.condition) }}</span>
            </div>
            <div class="temperature">{{ w.temperature }}°C</div>
          </div>
          <div class="weather-details">
            <div class="detail-item">
              <span class="detail-icon">💧</span>
              <span class="detail-value">{{ w.humidity }}%</span>
              <span class="detail-label">湿度</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">💨</span>
              <span class="detail-value">{{ w.windSpeed }}km/h</span>
              <span class="detail-label">风速</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">📊</span>
              <span class="detail-value">{{ w.pressure }}hPa</span>
              <span class="detail-label">气压</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">👁️</span>
              <span class="detail-value">{{ w.visibility }}km</span>
              <span class="detail-label">能见度</span>
            </div>
          </div>
          <div class="weather-footer">
            <div class="air-quality" :class="getAQIClass(w.airQuality)">
              <span class="aqi-label">空气质量</span>
              <span class="aqi-value">{{ w.airQuality }} - {{ getAQILabel(w.airQuality) }}</span>
            </div>
            <div class="uv-index">
              <span class="uv-label">UV指数</span>
              <span class="uv-value" :class="getUVClass(w.uvIndex)">{{ w.uvIndex }}</span>
            </div>
          </div>
          <div class="wind-info">
            <span>🧭 {{ w.windDirection }}风</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 天气预报趋势 -->
    <div class="weather-trends">
      <div class="panel-header">
        <h3>📈 温度趋势</h3>
        <NeoSelect
          v-model="selectedCity"
          :options="cityOptions"
          placeholder="选择城市"
        />
      </div>
      <div ref="trendChart" class="trend-chart"></div>
    </div>

    <!-- 添加监测点对话框 -->
    <NeoDialog v-model="showAddDialog" title="添加气象监测点">
      <form @submit.prevent="handleAddWeather" class="weather-form">
        <NeoInput v-model="newWeather.location" placeholder="城市名称" label="位置" required />
        <div class="form-row">
          <NeoInput v-model.number="newWeather.temperature" placeholder="温度" label="温度(°C)" type="number" />
          <NeoInput v-model.number="newWeather.humidity" placeholder="湿度" label="湿度(%)" type="number" />
        </div>
        <div class="form-row">
          <NeoInput v-model.number="newWeather.windSpeed" placeholder="风速" label="风速(km/h)" type="number" />
          <NeoSelect
            v-model="newWeather.condition"
            :options="conditionOptions"
            placeholder="天气状况"
          />
        </div>
        <div class="form-actions">
          <NeoButton nativeType="button" @click="showAddDialog = false">取消</NeoButton>
          <NeoButton nativeType="submit" class="submit-btn">添加</NeoButton>
        </div>
      </form>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import * as echarts from 'echarts'
import { NeoButton, NeoDialog, NeoInput, NeoSelect } from 'neo-brutal-vue'
import { useEarthStore, type Weather } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const weatherMapChart = ref<HTMLElement>()
const trendChart = ref<HTMLElement>()
const searchCity = ref('')
const selectedCity = ref(earthStore.weather[0]?.location || '')
const showAddDialog = ref(false)

let charts: echarts.ECharts[] = []
const handleResize = () => charts.forEach(c => c.resize())

const newWeather = reactive({
  location: '',
  temperature: 20,
  humidity: 50,
  pressure: 1013,
  windSpeed: 10,
  windDirection: '北',
  condition: 'sunny' as Weather['condition'],
  visibility: 10,
  uvIndex: 5,
  airQuality: 70
})

// 选项数组
const cityOptions = computed(() =>
  earthStore.weather.map(w => ({
    label: w.location,
    value: w.location
  }))
)

const conditionOptions = [
  { label: '晴朗', value: 'sunny' },
  { label: '多云', value: 'cloudy' },
  { label: '降雨', value: 'rainy' },
  { label: '风暴', value: 'stormy' },
  { label: '降雪', value: 'snowy' }
]

// 天气统计
const weatherStats = computed(() => {
  const weather = earthStore.weather
  const avgTemp = weather.reduce((sum, w) => sum + w.temperature, 0) / weather.length
  const avgHumidity = weather.reduce((sum, w) => sum + w.humidity, 0) / weather.length
  const sunnyCount = weather.filter(w => w.condition === 'sunny').length
  const warningCount = weather.filter(w => w.condition === 'stormy' || w.airQuality < 50).length

  return [
    { icon: '🌡️', value: avgTemp.toFixed(1) + '°C', label: '全球平均气温' },
    { icon: '💧', value: avgHumidity.toFixed(0) + '%', label: '平均湿度' },
    { icon: '☀️', value: sunnyCount + '个', label: '晴朗城市' },
    { icon: '⚠️', value: warningCount + '个', label: '预警城市' }
  ]
})

const filteredWeather = computed(() => {
  if (!searchCity.value) return earthStore.weather
  return earthStore.weather.filter(w => 
    w.location.toLowerCase().includes(searchCity.value.toLowerCase())
  )
})

const getWeatherIcon = (condition: Weather['condition']) => {
  const icons: Record<Weather['condition'], string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rainy: '🌧️',
    stormy: '⛈️',
    snowy: '❄️'
  }
  return icons[condition]
}

const getWeatherDesc = (condition: Weather['condition']) => {
  const descs: Record<Weather['condition'], string> = {
    sunny: '晴朗',
    cloudy: '多云',
    rainy: '降雨',
    stormy: '雷暴',
    snowy: '降雪'
  }
  return descs[condition]
}

const getAQIClass = (aqi: number) => {
  if (aqi >= 80) return 'excellent'
  if (aqi >= 60) return 'good'
  if (aqi >= 40) return 'moderate'
  return 'poor'
}

const getAQILabel = (aqi: number) => {
  if (aqi >= 80) return '优'
  if (aqi >= 60) return '良'
  if (aqi >= 40) return '轻度污染'
  return '重度污染'
}

const getUVClass = (uv: number) => {
  if (uv <= 2) return 'low'
  if (uv <= 5) return 'moderate'
  if (uv <= 7) return 'high'
  return 'extreme'
}

const refreshWeather = () => {
  // 模拟刷新数据
  earthStore.weather.forEach(w => {
    w.temperature += (Math.random() - 0.5) * 2
    w.humidity = Math.max(0, Math.min(100, w.humidity + (Math.random() - 0.5) * 5))
  })
  initTrendChart()
}

const handleAddWeather = () => {
  earthStore.addWeather({ ...newWeather })
  showAddDialog.value = false
  Object.assign(newWeather, {
    location: '', temperature: 20, humidity: 50,
    pressure: 1013, windSpeed: 10, windDirection: '北',
    condition: 'sunny', visibility: 10, uvIndex: 5, airQuality: 70
  })
}

// 初始化天气地图 - 使用散点图展示全球天气
const initWeatherMap = () => {
  if (!weatherMapChart.value) return

  const chart = echarts.init(weatherMapChart.value)

  // 为城市分配简化的坐标（经度, 纬度）
  const cityCoordinates: Record<string, [number, number]> = {
    '北京, 中国': [116.4, 39.9],
    '上海, 中国': [121.5, 31.2],
    '纽约, 美国': [-74.0, 40.7],
    '洛杉矶, 美国': [-118.2, 34.0],
    '伦敦, 英国': [-0.1, 51.5],
    '巴黎, 法国': [2.3, 48.9],
    '东京, 日本': [139.7, 35.7],
    '悉尼, 澳大利亚': [151.2, -33.9],
    '莫斯科, 俄罗斯': [37.6, 55.8],
    '开罗, 埃及': [31.2, 30.0],
    '里约热内卢, 巴西': [-43.2, -22.9],
    '孟买, 印度': [72.9, 19.1]
  }

  const data = earthStore.weather.map(w => {
    const coords = cityCoordinates[w.location] || [Math.random() * 360 - 180, Math.random() * 180 - 90]
    return {
      name: w.location,
      value: [...coords, w.temperature],
      condition: w.condition,
      itemStyle: {
        color: w.condition === 'sunny' ? '#FFD700' :
              w.condition === 'cloudy' ? '#A9A9A9' :
              w.condition === 'rainy' ? '#4682B4' :
              w.condition === 'stormy' ? '#8B0000' : '#FFFFFF',
        shadowBlur: 10,
        shadowColor: w.condition === 'sunny' ? '#FFD700' :
                      w.condition === 'cloudy' ? '#A9A9A9' :
                      w.condition === 'rainy' ? '#4682B4' :
                      w.condition === 'stormy' ? '#8B0000' : '#FFFFFF'
      }
    }
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>温度: ${params.value[2]}°C`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '经度',
      min: -180,
      max: 180,
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    yAxis: {
      type: 'value',
      name: '纬度',
      min: -60,
      max: 80,
      axisLabel: { color: '#fff' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: [{
      type: 'scatter',
      symbolSize: 20,
      data: data,
      label: {
        show: true,
        formatter: '{b}',
        position: 'top',
        color: '#fff',
        fontSize: 10
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChart.value) return
  
  // 销毁旧图表
  const existingChart = charts.find(c => c === echarts.getInstanceByDom(trendChart.value!))
  if (existingChart) {
    existingChart.dispose()
    charts = charts.filter(c => c !== existingChart)
  }
  
  const chart = echarts.init(trendChart.value)
  
  // 模拟24小时温度数据
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)
  const currentWeather = earthStore.weather.find(w => w.location === selectedCity.value)
  const baseTemp = currentWeather?.temperature || 20
  const tempData = hours.map((_, i) => {
    // 模拟昼夜温差
    const hourVariation = Math.sin((i - 6) * Math.PI / 12) * 8
    return (baseTemp + hourVariation + (Math.random() - 0.5) * 2).toFixed(1)
  })

  const option = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: { color: '#666' }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#666', formatter: '{value}°C' }
    },
    series: [{
      type: 'line',
      data: tempData,
      smooth: true,
      lineStyle: {
        color: '#667eea',
        width: 3
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.5)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
        ])
      }
    }]
  }

  chart.setOption(option)
  charts.push(chart)
}

onMounted(() => {
  initWeatherMap()
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c.dispose())
})

watch(selectedCity, initTrendChart)
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.weather-system {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  background: $color-info;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.add-btn {
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.weather-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.overview-card {
  @include neobrutal-card;
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 24px;
  background: var(--color-surface);
  transition: $transition-smooth;

  &:hover { transform: translate(-4px, -4px); box-shadow: 8px 8px 0 var(--color-border); }

  .overview-icon { font-size: 44px; }
  .overview-content {
    .overview-value { font-size: 24px; font-weight: 900; color: $color-text; letter-spacing: -1px; }
    .overview-label { font-size: 12px; font-weight: 700; color: $color-text-light; text-transform: uppercase; }
  }
}

.weather-map-section {
  @include neobrutal-card;
  padding: 25px;
  margin-bottom: 30px;
}

.panel-header {
  @include flex-between;
  margin-bottom: 20px;

  h3 { margin: 0; font-size: 20px; font-weight: 900; color: $color-text; }

  :deep(.neo-select) {
    min-width: 160px;
    max-width: 180px;
  }
}

.legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  color: $color-text-light;
  text-transform: uppercase;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);

  &.sunny { background: #FFD700; box-shadow: 0 0 10px #FFD700; }
  &.cloudy { background: #A9A9A9; }
  &.rainy { background: #4682B4; }
  &.stormy { background: #8B0000; }
  &.snowy { background: #FFFFFF; }
}

.weather-map-chart {
  height: 350px;
  background: #0f172a;
  border: 3px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
}

.cities-weather {
  @include neobrutal-card;
  padding: 25px;
  margin-bottom: 30px;
}

.search-input { width: 250px; }

.weather-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.weather-card {
  padding: 24px;
  border-radius: $radius-lg;
  border: 2px solid var(--color-border);
  transition: $transition-smooth;
  position: relative;
  overflow: hidden;

  &:hover { transform: translateY(-5px); }

  &.sunny { background: color-mix(in srgb, #FFD700 10%, var(--color-surface)); }
  &.cloudy { background: var(--color-surface-alt); }
  &.rainy { background: color-mix(in srgb, var(--color-info) 10%, var(--color-surface)); }
  &.stormy { background: color-mix(in srgb, var(--color-error) 10%, var(--color-surface)); }
  &.snowy { background: color-mix(in srgb, var(--color-secondary) 10%, var(--color-surface)); }
}

.weather-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1.5px solid var(--color-border-subtle);

  .weather-icon { font-size: 48px; filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1)); }
  .location-info {
    flex: 1;
    h4 { margin: 0; font-size: 18px; font-weight: 900; color: $color-text; }
    .weather-desc { font-size: 12px; font-weight: 700; color: $color-text-light; text-transform: uppercase; }
  }
  .temperature { font-size: 32px; font-weight: 900; color: $color-text; letter-spacing: -2px; }
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1.5px solid var(--color-border-subtle);

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.4);
    padding: 8px 12px;
    border-radius: $radius-md;
    border: 1px solid var(--color-border-subtle);

    .detail-icon { font-size: 16px; }
    .detail-value { font-size: 14px; font-weight: 800; color: $color-text; flex: 1; }
    .detail-label { font-size: 10px; font-weight: 700; color: $color-text-light; text-transform: uppercase; }
  }
}

.weather-footer {
  @include flex-between;
  
  .air-quality {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    background: var(--color-surface);
    border: 1.5px solid var(--color-border);
    border-radius: $radius-md;
    box-shadow: 2px 2px 0 #333;

    &.excellent { color: var(--color-success); }
    &.good { color: var(--color-warning); }
    &.moderate { color: #ff6348; }
    &.poor { color: $color-error; }

    .aqi-label { font-size: 10px; font-weight: 800; color: $color-text-light; text-transform: uppercase; }
    .aqi-value { font-size: 11px; font-weight: 900; }
  }

  .uv-index {
    .uv-label { font-size: 10px; font-weight: 800; color: $color-text-light; text-transform: uppercase; margin-right: 6px; }
    .uv-value {
      padding: 2px 8px;
      border: 1.5px solid var(--color-border);
      border-radius: 10px;
      font-size: 11px;
      font-weight: 900;
      box-shadow: 2px 2px 0 var(--color-border);

      &.low { background: $color-success; color: white; }
      &.moderate { background: $color-warning; color: white; }
      &.high { background: #e65100; color: white; }
      &.extreme { background: $color-error; color: white; }
    }
  }
}

.wind-info {
  margin-top: 15px;
  font-size: 11px;
  font-weight: 800;
  color: $color-text-light;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.weather-trends {
  @include neobrutal-card;
  padding: 25px;
}

.city-select {
  padding: 10px 16px;
  border: $border-dark;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 700;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.trend-chart {
  height: 280px;
}

.weather-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
