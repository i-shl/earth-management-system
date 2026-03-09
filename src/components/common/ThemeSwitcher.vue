<template>
  <button 
    class="theme-switcher" 
    @click="themeStore.toggleTheme"
    :title="themeStore.theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'"
  >
    <component :is="themeStore.theme === 'light' ? Moon : Sun" :size="20" />
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useThemeStore } from '../../stores/themeStore'

const themeStore = useThemeStore()
</script>

<style lang="scss" scoped>
@use "../../styles/variables" as *;

.theme-switcher {
  width: 42px;
  height: 42px;
  background-color: var(--color-surface);
  color: var(--color-text);
  @include flex-center;
  border: 3px solid var(--color-border);
  box-shadow: 4px 4px 0 var(--color-border);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative; // Ensure it stays in flow
  z-index: 1;
  
  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--color-border);
    background-color: var(--color-primary);
    color: white;
  }
  
  &:active {
    transform: translate(2px, 2px);
    box-shadow: 0 0 0 var(--color-border);
  }
}
</style>
