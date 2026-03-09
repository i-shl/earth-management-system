<template>
  <div class="system-logs">
    <div class="panel-header">
      <h2>📋 系统运行日志</h2>
      <div class="header-actions">
        <NeoButton @click="exportLogs" class="action-btn export">导出数据</NeoButton>
        <NeoButton @click="clearLogs" class="action-btn clear">清空日志</NeoButton>
      </div>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>日志类型:</label>
        <NeoSelect
          v-model="filterType"
          :options="typeOptions"
          placeholder="全部类型"
          clearable
        />
      </div>
      <div class="filter-group">
        <label>操作角色:</label>
        <NeoSelect
          v-model="filterUser"
          :options="userOptions"
          placeholder="全部角色"
          clearable
        />
      </div>
    </div>

    <div class="logs-container">
      <div class="log-grid">
        <div v-for="log in filteredLogs" :key="log.id" class="log-card" :class="log.type">
          <div class="log-info">
            <span class="log-time">🕒 {{ formatTime(log.timestamp) }}</span>
            <span class="log-action">{{ log.action }}</span>
            <span class="log-user">@{{ log.user }}</span>
          </div>
          <div class="log-details">{{ log.details }}</div>
          <div class="log-marker" :class="log.type"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NeoButton, NeoSelect } from 'neo-brutal-vue'
import { useEarthStore } from '../../../stores/earthStore'

const earthStore = useEarthStore()
const filterType = ref('')
const filterUser = ref('')

// 筛选选项
const typeOptions = [
  { label: '常规信息', value: 'info' },
  { label: '系统成功', value: 'success' },
  { label: '管理警告', value: 'warning' },
  { label: '异常错误', value: 'error' }
]

const userOptions = [
  { label: '管理员', value: 'admin' },
  { label: '系统服务', value: 'system' }
]

const filteredLogs = computed(() => {
  let result = [...earthStore.systemLogs]
  if (filterType.value) result = result.filter(l => l.type === filterType.value)
  if (filterUser.value) result = result.filter(l => l.user === filterUser.value)
  return result
})

const formatTime = (ts: string) => new Date(ts).toLocaleString('zh-CN', { 
  month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' 
})

const clearLogs = () => {
  if (confirm('确定要清空所有日志吗？')) earthStore.systemLogs.length = 0
}

const exportLogs = () => alert('正在导出日志为 CSV 文件...')
</script>

<style lang="scss" scoped>
@use "../../../styles/variables" as *;

.system-logs { padding: 24px; }

.panel-header {
  @include flex-between;
  margin-bottom: 25px;
  h2 { margin: 0; font-size: 26px; font-weight: 900; color: $color-text; }
  .header-actions { display: flex; gap: 12px; }
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding: 15px;
  background: var(--color-surface);
  border: 3px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: 4px 4px 0 var(--color-border);

  .filter-group {
    display: flex;
    align-items: center;
    gap: 10px;
    label { font-size: 13px; font-weight: 800; text-transform: uppercase; color: $color-text-light; }
    :deep(.neo-select) {
      min-width: 140px;
      max-width: 160px;
    }
    .filter-select {
      padding: 10px;
      border: 2px solid var(--color-border);
      border-radius: $radius-md;
      font-size: 14px;
      font-weight: 700;
      background: var(--color-surface-alt);
      color: var(--color-text);
      cursor: pointer;
    }
  }
}

.logs-container {
  @include neobrutal-card;
  padding: 24px;
  max-height: 600px;
  overflow-y: auto;

  .log-grid { display: flex; flex-direction: column; gap: 12px; }
}

.log-card {
  position: relative;
  padding: 16px 20px;
  background: var(--color-surface-alt);
  border: 2px solid var(--color-border);
  border-radius: $radius-md;
  transition: $transition-smooth;

  &:hover { transform: translateX(5px); background: white; }

  &.info { border-left: 8px solid $color-primary; }
  &.success { border-left: 8px solid $color-success; }
  &.warning { border-left: 8px solid $color-warning; }
  &.error { border-left: 8px solid $color-error; }

  .log-info {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 5px;
    font-size: 12px;
    font-weight: 800;
    
    .log-time { color: $color-text-light; }
    .log-action { padding: 2px 8px; background: var(--color-divider); border: 1.5px solid var(--color-border); border-radius: 4px; text-transform: uppercase; }
    .log-user { color: $color-accent; font-weight: 900; }
  }

  .log-details { font-size: 14px; font-weight: 700; color: $color-text; line-height: 1.4; }
}

.action-btn {
  padding: 8px 16px;
  font-weight: 800;
  @include neobrutal-button;
  &.export { background: $color-info; color: white; }
  &.clear { background: #fef2f2; color: $color-error; border-color: $color-error; box-shadow: 2px 2px 0 $color-error; }
}
</style>
