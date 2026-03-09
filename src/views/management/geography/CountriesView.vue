<template>
  <div class="countries-management">
    <div class="section-header">
      <div class="header-left">
        <h2>🏳️ 国家管理</h2>
        <span class="subtitle">共管理 {{ earthStore.totalCountries }} 个国家/地区</span>
      </div>
      <NeoButton @click="showAddDialog = true" class="add-button">
        + 添加国家
      </NeoButton>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filters">
      <NeoInput
        v-model="searchQuery"
        placeholder="搜索国家名称..."
        class="search-input"
      />
      <NeoSelect
        v-model="filterContinent"
        :options="continentFilterOptions"
        placeholder="所有大洲"
        clearable
      />
      <NeoSelect
        v-model="sortBy"
        :options="sortOptions"
        placeholder="排序方式"
      />
    </div>

    <!-- 国家网格 -->
    <div class="countries-grid">
      <NeoCard v-for="country in filteredCountries" :key="country.id" class="country-card">
        <div class="country-header">
          <span class="country-flag">{{ country.flag }}</span>
          <div class="country-info">
            <h3 class="country-name">{{ country.name }}</h3>
            <span class="country-continent">{{ getContinentName(country.continentId) }}</span>
          </div>
          <div class="country-status" :class="getCountryStatus(country)">
            {{ getStatusLabel(country) }}
          </div>
        </div>

        <div class="country-stats">
          <div class="stat-row">
            <span class="stat-label">👥 人口</span>
            <span class="stat-value">{{ formatNumber(country.population) }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">📊 GDP</span>
            <span class="stat-value">${{ formatNumber(country.gdp) }}亿</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">📏 面积</span>
            <span class="stat-value">{{ formatNumber(country.area) }} km²</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">🏛️ 首都</span>
            <span class="stat-value">{{ country.capital }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">💱 货币</span>
            <span class="stat-value">{{ country.currency }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">🗣️ 语言</span>
            <span class="stat-value">{{ country.languages.join(', ') }}</span>
          </div>
        </div>

        <div class="country-metrics">
          <div class="metric">
            <div class="metric-label">幸福指数</div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: (country.happinessIndex / 10 * 100) + '%', background: getMetricColor(country.happinessIndex, 10) }"></div>
            </div>
            <div class="metric-value">{{ country.happinessIndex }}</div>
          </div>
          <div class="metric">
            <div class="metric-label">预期寿命</div>
            <div class="metric-bar">
              <div class="metric-fill" :style="{ width: (country.lifeExpectancy / 90 * 100) + '%', background: getMetricColor(country.lifeExpectancy, 90) }"></div>
            </div>
            <div class="metric-value">{{ country.lifeExpectancy }}岁</div>
          </div>
        </div>

        <div class="card-actions">
          <NeoButton @click="viewDetails(country)" class="action-button view">
            查看详情
          </NeoButton>
          <NeoButton @click="editCountry(country)" class="action-button edit">
            编辑
          </NeoButton>
          <NeoButton @click="managePopulation(country)" class="action-button manage">
            人口管理
          </NeoButton>
        </div>
      </NeoCard>
    </div>

    <!-- 添加国家对话框 -->
    <NeoDialog v-model="showAddDialog" title="添加新国家" class="country-dialog">
      <form @submit.prevent="handleAddCountry" class="country-form">
        <div class="form-row">
          <NeoInput v-model="newCountry.name" placeholder="国家名称" label="名称" required />
          <NeoInput v-model="newCountry.flag" placeholder="国旗emoji" label="国旗" />
        </div>
        <div class="form-row">
          <NeoSelect
            v-model="newCountry.continentId"
            :options="continentOptions"
            placeholder="选择大洲"
            required
          />
          <NeoInput v-model="newCountry.capital" placeholder="首都" label="首都" />
        </div>
        <div class="form-row">
          <NeoInput v-model.number="newCountry.population" placeholder="人口数量" label="人口" type="number" />
          <NeoInput v-model.number="newCountry.area" placeholder="面积(km²)" label="面积" type="number" />
        </div>
        <div class="form-row">
          <NeoInput v-model.number="newCountry.gdp" placeholder="GDP(亿美元)" label="GDP" type="number" />
          <NeoInput v-model="newCountry.currency" placeholder="货币名称" label="货币" />
        </div>
        <div class="form-actions">
          <NeoButton nativeType="button" @click="showAddDialog = false" class="cancel-btn">取消</NeoButton>
          <NeoButton nativeType="submit" class="submit-btn">添加国家</NeoButton>
        </div>
      </form>
    </NeoDialog>

    <!-- 国家详情对话框 -->
    <NeoDialog v-model="showDetailDialog" :title="selectedCountry?.name + ' 详情'" v-if="selectedCountry">
      <div class="detail-content">
        <div class="detail-header">
          <span class="detail-flag">{{ selectedCountry.flag }}</span>
          <div class="detail-title">
            <h3>{{ selectedCountry.name }}</h3>
            <p>{{ selectedCountry.government }}</p>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <label>首都</label>
            <value>{{ selectedCountry.capital }}</value>
          </div>
          <div class="detail-item">
            <label>人口</label>
            <value>{{ formatNumber(selectedCountry.population) }}</value>
          </div>
          <div class="detail-item">
            <label>面积</label>
            <value>{{ formatNumber(selectedCountry.area) }} km²</value>
          </div>
          <div class="detail-item">
            <label>GDP</label>
            <value>${{ formatNumber(selectedCountry.gdp) }}亿</value>
          </div>
          <div class="detail-item">
            <label>货币</label>
            <value>{{ selectedCountry.currency }}</value>
          </div>
          <div class="detail-item">
            <label>官方语言</label>
            <value>{{ selectedCountry.languages.join(', ') }}</value>
          </div>
          <div class="detail-item">
            <label>政体</label>
            <value>{{ selectedCountry.government }}</value>
          </div>
          <div class="detail-item">
            <label>幸福指数</label>
            <value :class="getScoreClass(selectedCountry.happinessIndex)">{{ selectedCountry.happinessIndex }}/10</value>
          </div>
        </div>
      </div>
    </NeoDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { NeoCard, NeoButton, NeoDialog, NeoInput, NeoSelect } from 'neo-brutal-vue'
import { useEarthStore, type Country } from '../../../stores/earthStore'

const earthStore = useEarthStore()

const searchQuery = ref('')
const filterContinent = ref('')
const sortBy = ref('population')
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const selectedCountry = ref<Country | null>(null)

const newCountry = reactive({
  name: '',
  flag: '',
  continentId: '',
  capital: '',
  population: 0,
  area: 0,
  gdp: 0,
  currency: '',
  languages: [],
  government: '',
  happinessIndex: 5,
  lifeExpectancy: 70
})

// 大洲选项
const continentOptions = computed(() =>
  earthStore.continents.map(c => ({
    label: c.name,
    value: c.id
  }))
)

// 大洲筛选选项
const continentFilterOptions = computed(() =>
  earthStore.continents.map(c => ({
    label: c.name,
    value: c.id
  }))
)

// 排序选项
const sortOptions = [
  { label: '按人口排序', value: 'population' },
  { label: '按GDP排序', value: 'gdp' },
  { label: '按面积排序', value: 'area' },
  { label: '按幸福指数排序', value: 'happiness' }
]

const filteredCountries = computed(() => {
  let result = [...earthStore.allCountries]
  
  // 搜索筛选
  if (searchQuery.value) {
    result = result.filter(c => 
      c.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.capital.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  // 大洲筛选
  if (filterContinent.value) {
    result = result.filter(c => c.continentId === filterContinent.value)
  }
  
  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'population': return b.population - a.population
      case 'gdp': return b.gdp - a.gdp
      case 'area': return b.area - a.area
      case 'happiness': return b.happinessIndex - a.happinessIndex
      default: return 0
    }
  })
  
  return result
})

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('zh-CN').format(num)
}

const getContinentName = (id: string) => {
  return earthStore.continents.find(c => c.id === id)?.name || '未知'
}

const getCountryStatus = (country: Country) => {
  if (country.gdp > 10000) return 'developed'
  if (country.gdp > 1000) return 'developing'
  return 'underdeveloped'
}

const getStatusLabel = (country: Country) => {
  const status = getCountryStatus(country)
  const labels: Record<string, string> = {
    developed: '发达国家',
    developing: '发展中国家',
    underdeveloped: '欠发达国家'
  }
  return labels[status]
}

const getMetricColor = (value: number, max: number) => {
  const ratio = value / max
  if (ratio > 0.8) return '#2ed573'
  if (ratio > 0.6) return '#ffa502'
  if (ratio > 0.4) return '#ff6348'
  return '#ff4757'
}

const getScoreClass = (score: number) => {
  if (score >= 7) return 'excellent'
  if (score >= 5) return 'good'
  if (score >= 3) return 'average'
  return 'poor'
}

const viewDetails = (country: Country) => {
  selectedCountry.value = country
  showDetailDialog.value = true
}

const editCountry = (country: Country) => {
  alert(`编辑 ${country.name} 功能开发中...`)
}

const managePopulation = (country: Country) => {
  alert(`管理 ${country.name} 人口功能开发中...`)
}

const handleAddCountry = () => {
  if (!newCountry.name || !newCountry.continentId) return
  
  earthStore.addCountry(newCountry.continentId, {
    name: newCountry.name,
    population: newCountry.population,
    area: newCountry.area,
    capital: newCountry.capital,
    gdp: newCountry.gdp,
    flag: newCountry.flag || '🏳️',
    languages: newCountry.languages.length > 0 ? newCountry.languages : ['未知'],
    currency: newCountry.currency || '未知',
    government: newCountry.government || '未知',
    happinessIndex: newCountry.happinessIndex,
    lifeExpectancy: newCountry.lifeExpectancy
  })
  
  showAddDialog.value = false
  Object.assign(newCountry, {
    name: '', flag: '', continentId: '', capital: '',
    population: 0, area: 0, gdp: 0, currency: '',
    languages: [], government: '', happinessIndex: 5, lifeExpectancy: 70
  })
}
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.countries-management {
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

.add-button {
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 350px;
}

:deep(.neo-select) {
  min-width: 180px;
  max-width: 200px;
}

.filter-select {
  padding: 10px 16px;
  border: $border-dark;
  border-radius: $radius-md;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: $transition-smooth;

  &:focus {
    outline: none;
    background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  }
}

.countries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.country-card {
  @include neobrutal-card;
  padding: 24px;

  &:hover {
    transform: translate(-4px, -4px);
    box-shadow: 8px 8px 0 var(--color-border);
  }
}

.country-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--color-divider);
}

.country-flag {
  font-size: 44px;
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1));
}

.country-info {
  flex: 1;

  .country-name {
    margin: 0;
    font-size: 20px;
    font-weight: 900;
    color: $color-text;
  }

  .country-continent {
    font-size: 12px;
    color: $color-text-light;
    font-weight: 700;
    text-transform: uppercase;
  }
}

.country-status {
  padding: 5px 12px;
  border: 2px solid var(--color-border);
  border-radius: $radius-md;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;

  &.developed { background: color-mix(in srgb, var(--color-success) 20%, transparent); color: var(--color-success); }
  &.developing { background: color-mix(in srgb, var(--color-warning) 20%, transparent); color: var(--color-warning); }
  &.underdeveloped { background: color-mix(in srgb, var(--color-accent) 20%, transparent); color: var(--color-accent); }
}

.country-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-row {
  @include flex-between;
  font-size: 13px;

  .stat-label {
    color: $color-text-light;
    font-weight: 600;
  }

  .stat-value {
    color: $color-text;
    font-weight: 800;
  }
}

.country-metrics {
  margin-bottom: 20px;
  background: var(--color-surface-alt);
  padding: 15px;
  border-radius: $radius-md;
  border: 1.5px solid var(--color-divider);
}

.metric {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  &:last-child { margin-bottom: 0; }
}

.metric-label {
  font-size: 11px;
  color: $color-text-light;
  font-weight: 700;
  width: 70px;
  text-transform: uppercase;
}

.metric-bar {
  flex: 1;
  height: 10px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 5px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-value {
  font-size: 12px;
  color: $color-text;
  font-weight: 800;
  width: 50px;
  text-align: right;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.action-button {
  flex: 1;
  font-size: 12px;
  font-weight: 800;
  padding: 8px;
  @include neobrutal-button;

  &.view { background: $color-info; color: white; }
  &.edit { background: $color-warning; color: white; }
  &.manage { background: $color-secondary; color: white; }
}

.country-form {
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

.cancel-btn {
  background: $color-text-light;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.submit-btn {
  background: $color-success;
  color: white;
  font-weight: 800;
  @include neobrutal-button;
}

.detail-content {
  padding: 15px;

  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 25px;
    padding-bottom: 20px;
    border-bottom: 3px solid var(--color-divider);

    .detail-flag { font-size: 64px; }
    .detail-title {
      h3 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
      p { margin: 5px 0 0; color: $color-text-light; font-weight: 600; }
    }
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  padding: 15px;
  background: var(--color-surface-alt);
  border: 1.5px solid var(--color-divider);
  border-radius: $radius-lg;

  label {
    display: block;
    font-size: 11px;
    color: $color-text-light;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  value {
    font-size: 18px;
    font-weight: 800;
    color: $color-text;

    &.excellent { color: $color-success; }
    &.good { color: $color-warning; }
    &.average { color: #ff6348; }
    &.poor { color: $color-error; }
  }
}
</style>
