<template>
  <div class="atmosphere-view animate__animated animate__fadeIn">
    <div class="section-header">
      <div class="header-content">
        <h2>🌤️ 大气层监控站</h2>
        <p>臭氧层空洞监测、温室气体浓度及大气质量分析</p>
      </div>
      <div class="header-right">
        <NeoButton class="launch-balloon"><Wind :size="16" /> 发射气象气球</NeoButton>
      </div>
    </div>

    <div class="main-stats">
      <div class="stat-main neo-brutal-card co2">
        <span class="label">CO2 平均浓度</span>
        <div class="value-row">
          <span class="value">{{ envData.co2Level }}</span>
          <span class="unit">ppm</span>
        </div>
        <div class="trend up">
          <ArrowUp :size="16" /> +2.1 ppm / yr
        </div>
      </div>

      <div class="stat-main neo-brutal-card ozone">
        <span class="label">全球平均臭氧层</span>
        <div class="value-row">
          <span class="value">{{ envData.ozoneLevel }}</span>
          <span class="unit">DU</span>
        </div>
        <div class="trend safe">
          <ArrowUp :size="16" /> +0.5 DU / yr
        </div>
      </div>

      <div class="stat-main neo-brutal-card temp">
        <span class="label">全球地表异常气温</span>
        <div class="value-row">
          <span class="value">+1.18</span>
          <span class="unit">°C</span>
        </div>
        <div class="status-warning">WARM ERA</div>
      </div>
    </div>

    <div class="detail-sections">
      <div class="layers-visual neo-brutal-card">
        <h3>大气垂直结构监测</h3>
        <div class="atmosphere-layers">
          <div v-for="layer in layers" :key="layer.name" 
               class="layer-bar" 
               :style="{ 
                 height: layer.height + 'px', 
                 backgroundColor: layer.color,
                 borderColor: 'var(--color-text)'
               }">
            <div class="layer-content">
              <span class="layer-name">{{ layer.name }}</span>
              <span class="layer-alt">{{ layer.alt }} km</span>
            </div>
            <div class="layer-data">
              <span class="temp">Temp: {{ layer.temp }}°C</span>
              <span class="pressure">Pres: {{ layer.pressure }} hPa</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pollution-map neo-brutal-card">
        <h3>主要污染物实时分布 (PPM)</h3>
        <div class="pollutant-list">
          <div v-for="p in pollutants" :key="p.name" class="pollutant-pill">
            <span class="p-name">{{ p.name }}</span>
            <span class="p-value">{{ p.value }}</span>
            <div class="p-status" :class="p.status"></div>
          </div>
        </div>
        
        <div class="alert-box neo-brutal-card animate-float" v-if="hasAlerts">
          <AlertTriangle class="alert-icon" :size="30" />
          <div class="alert-text">
            <h4>由于北极涡旋，臭氧层空洞正在扩大</h4>
            <p>已在北极地区检测到紫外线辐射异常。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Wind, ArrowUp, AlertTriangle } from 'lucide-vue-next'
import { NeoButton } from 'neo-brutal-vue'
import { useEarthStore } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const envData = computed(() => earthStore.environments[0] || { co2Level: 0, ozoneLevel: 0 })

const layers = [
  { name: '外层 space', alt: '500+', height: 40, temp: -200, pressure: 0, color: '#030712' },
  { name: '散逸层 thermosphere', alt: '85-500', height: 60, temp: 1500, pressure: 0.001, color: '#111827' },
  { name: '中间层 mesosphere', alt: '50-85', height: 80, temp: -90, pressure: 1, color: '#1e3a8a' },
  { name: '平流层 stratosphere', alt: '12-50', height: 100, temp: -15, pressure: 100, color: '#3b82f6' },
  { name: '对流层 troposphere', alt: '0-12', height: 120, temp: 15, pressure: 1013, color: '#60a5fa' },
]

const pollutants = [
  { name: 'PM2.5', value: '38', status: 'good' },
  { name: 'PM10', value: '45', status: 'good' },
  { name: 'NO2', value: '21', status: 'good' },
  { name: 'SO2', value: '15', status: 'safe' },
  { name: 'CH4', value: '1850', status: 'warning' },
]

const hasAlerts = ref(true)
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.atmosphere-view { padding: 30px; }

.section-header {
  @include flex-between; margin-bottom: 30px;
  h2 { font-size: 28px; font-weight: 950; margin-bottom: 5px; }
  p { color: $color-text-light; font-weight: 700; font-size: 14px; }
}

.main-stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; margin-bottom: 30px;
}

.stat-main {
  padding: 30px; display: flex; flex-direction: column; gap: 10px;
  .label { font-size: 12px; font-weight: 900; color: $color-text-light; text-transform: uppercase; }
  
  .value-row {
    display: flex; align-items: baseline; gap: 8px;
    .value { font-size: 42px; font-weight: 950; letter-spacing: -2px; }
    .unit { font-size: 14px; font-weight: 900; opacity: 0.6; }
  }
  
  .trend {
    font-size: 14px; font-weight: 900; display: flex; align-items: center; gap: 6px;
    &.up { color: $color-error; }
    &.safe { color: $color-success; }
  }
  
  .status-warning {
    background: var(--color-warning); color: var(--color-text); font-weight: 950; padding: 4px 12px;
    border-radius: 4px; font-size: 12px; margin-top: 10px; border: 2px solid var(--color-border);
  }
}

.detail-sections {
  display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
}

.layers-visual, .pollution-map {
  padding: 25px;
  h3 { font-size: 18px; font-weight: 950; margin-bottom: 25px; }
}

.atmosphere-layers {
  display: flex; flex-direction: column; gap: 10px;
}

.layer-bar {
  border: 3.5px solid var(--color-border); border-radius: $radius-md; padding: 15px 25px;
  display: flex; flex-direction: column; justify-content: space-between;
  color: white; @include flex-between; flex-direction: row;
  
  .layer-content {
    display: flex; align-items: baseline; gap: 15px;
    .layer-name { font-weight: 950; font-size: 16px; text-transform: uppercase; }
    .layer-alt { font-size: 12px; opacity: 0.7; font-weight: 700; }
  }
  
  .layer-data {
    display: flex; gap: 20px; font-size: 12px; font-family: monospace; font-weight: 800; opacity: 0.8;
  }
}

.pollutant-list {
  display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 30px;
}

.pollutant-pill {
  background: var(--color-surface); border: 2.5px solid var(--color-border); padding: 8px 15px; border-radius: 12px;
  box-shadow: 4px 4px 0 var(--color-border); display: flex; align-items: center; gap: 10px;
  
  .p-name { font-weight: 900; font-size: 12px; color: $color-text-light; }
  .p-value { font-weight: 950; font-size: 16px; font-family: monospace; }
  .p-status {
    width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--color-border);
    &.good { background: $color-success; }
    &.safe { background: $color-info; }
    &.warning { background: $color-warning; }
  }
}

.alert-box {
  background: $color-error; color: white; padding: 25px;
  display: flex; align-items: center; gap: 20px;
  border: 4px solid var(--color-border); box-shadow: 6px 6px 0 var(--color-border);
  
  h4 { font-size: 18px; font-weight: 950; margin-bottom: 5px; }
  p { font-size: 14px; font-weight: 700; opacity: 0.9; }
}
</style>
