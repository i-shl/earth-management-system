<template>
  <div class="login-wrapper" :class="{ 'dark-mode': themeStore.theme === 'dark' }">
    <div class="background-elements">
      <div class="element e1 animate-float"></div>
      <div class="element e2 animate-float"></div>
      <div class="element e3 animate-float"></div>
    </div>

    <div class="login-container animate__animated animate__zoomIn">
      <div class="login-header">
        <Globe class="globe-icon" :size="48" />
        <div class="title-stack">
          <h1>EARTH CONTROL</h1>
          <p>GLOBAL MANAGEMENT INTERFACE</p>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label><User :size="14" /> 用户账号</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="输入管理员ID" 
            required
            class="neo-input"
          />
        </div>

        <div class="input-group">
          <label><Lock :size="14" /> 安全密钥</label>
          <input 
            v-model="password" 
            type="password" 
            placeholder="输入授权密码" 
            required
            class="neo-input"
          />
        </div>

        <div class="status-box" v-if="error">
          <AlertCircle :size="16" />
          <span>{{ error }}</span>
        </div>

        <button 
          type="submit" 
          class="login-btn neo-brutal-btn"
          :disabled="loading"
        >
          <Zap v-if="!loading" :size="20" />
          <Loader2 v-else class="animate-spin" :size="20" />
          {{ loading ? '身份验证中...' : '授权登入' }}
        </button>
      </form>

      <div class="login-footer">
        <span class="system-integrity">
          <Activity :size="14" /> 系统完整性: 100%
        </span>
        <ThemeSwitcher />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Globe, User, Lock, Activity, Zap, Loader2, AlertCircle } from 'lucide-vue-next'
import ThemeSwitcher from '../../components/common/ThemeSwitcher.vue'
import { useEarthStore } from '../../stores/earthStore'
import { useThemeStore } from '../../stores/themeStore'

const router = useRouter()
const earthStore = useEarthStore()
const themeStore = useThemeStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = '请提供完整的凭据'
    return
  }

  loading.value = true
  error.value = ''

  // 模拟生物识别和密钥验证
  setTimeout(() => {
    const success = earthStore.login(username.value, password.value)

    if (success) {
      router.push('/management/overview')
    } else {
      error.value = '授权失败: 账号或密钥无效'
    }

    loading.value = false
  }, 1200)
}
</script>

<style lang="scss" scoped>
@use "../../styles/variables" as *;

.login-wrapper {
  min-height: 100vh;
  background-color: var(--color-bg);
  @include flex-center;
  position: relative;
  overflow: hidden;
  transition: background-color 0.4s ease;
}

.background-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  
  .element {
    position: absolute;
    background: $color-primary;
    border: 3px solid var(--color-border);
    box-shadow: 8px 8px 0 var(--color-border);
    opacity: 0.1;
    z-index: 0;
    
    &.e1 { width: 300px; height: 300px; top: -100px; left: -50px; border-radius: 50%; }
    &.e2 { width: 200px; height: 200px; bottom: 50px; right: -50px; transform: rotate(45deg); }
    &.e3 { width: 150px; height: 150px; top: 30%; right: 20%; border-radius: 20px; }
  }
}

.login-container {
  width: 100%;
  max-width: 440px;
  background: var(--color-surface);
  border: 4px solid var(--color-border);
  box-shadow: 12px 12px 0 var(--color-border);
  padding: 50px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.login-header {
  @include flex-center;
  flex-direction: column;
  gap: 15px;
  text-align: center;
  
  .globe-icon { color: $color-primary; }
  
  .title-stack {
    h1 { font-size: 32px; font-weight: 1000; letter-spacing: -2px; margin-bottom: 4px; }
    p { font-size: 11px; font-weight: 800; color: $color-primary; letter-spacing: 2px; }
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  label { font-size: 13px; font-weight: 900; color: var(--color-text-light); display: flex; align-items: center; gap: 8px; }
  
  .neo-input {
    background: var(--color-bg);
    border: 3px solid var(--color-border);
    padding: 14px 18px;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text);
    outline: none;
    transition: $transition-smooth;
    
    &:focus {
      background: var(--color-surface);
      box-shadow: 4px 4px 0 $color-primary;
      transform: translate(-2px, -2px);
    }
  }
}

.status-box {
  padding: 10px 15px;
  background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
  border: 2px solid var(--color-error);
  color: var(--color-error);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: $radius-sm;
}

.login-btn {
  background-color: $color-success;
  color: #000;
  padding: 16px;
  font-size: 18px;
  font-weight: 1000;
  @include flex-center;
  gap: 12px;
  text-transform: uppercase;
  
  &:disabled { opacity: 0.7; cursor: not-allowed; }
}

.login-footer {
  @include flex-between;
  padding-top: 15px;
  border-top: 2px dashed var(--color-border-subtle);
  
  .system-integrity { font-size: 11px; font-weight: 800; color: $color-text-light; display: flex; align-items: center; gap: 6px; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}
</style>