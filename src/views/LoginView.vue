<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '@/api/adminApi'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function login() {
  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = '이메일과 비밀번호를 입력해주세요.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const res = await adminLogin(email.value.trim(), password.value.trim())
    if (res.success && res.data?.token) {
      localStorage.setItem('adminAccessToken', res.data.token)
      localStorage.setItem('adminInfo', JSON.stringify({
        adminId: res.data.adminId,
        name: res.data.name,
        email: res.data.email,
      }))
      router.push('/dashboard')
    } else {
      errorMessage.value = res.message || '로그인에 실패했습니다.'
    }
  } catch (error: any) {
    const status = error.response?.status
    const msg = error.response?.data?.message
    if (status === 401) {
      errorMessage.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
    } else {
      errorMessage.value = `오류 (${status ?? 'network'}) ${msg ?? error.message ?? ''}`
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-bg">
    <div class="login-card">
      <img src="@/assets/logo.svg" alt="Re:Day logo" class="logo" />
      <h1 class="brand">Re:Day</h1>

      <div class="form-group">
        <label>이메일</label>
        <input
          v-model="email"
          type="email"
          placeholder="admin@reday.com"
          @keyup.enter="login"
        />
      </div>

      <div class="form-group">
        <label>비밀번호</label>
        <div class="password-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            @keyup.enter="login"
          />
          <button class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
            {{ showPassword ? '🙈' : '👁' }}
          </button>
        </div>
      </div>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <button class="login-btn" @click="login" :disabled="loading">
        {{ loading ? '로그인 중...' : '로그인' }}
      </button>

      <p class="copyright">© 2026 Re:Day Admin</p>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100vh;
  background-color: #FFF3EF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 60px 56px 48px;
  width: 460px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

.logo {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.brand {
  font-size: 20px;
  font-weight: 600;
  color: #4A4038;
  margin: 0 0 28px;
}

.form-group {
  width: 100%;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: #685E52;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E5D4C1;
  border-radius: 8px;
  font-size: 14px;
  color: #4A4038;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #AA7B72;
}

.form-group input::placeholder {
  color: #C9BEB1;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 40px;
}

.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.error-message {
  width: 100%;
  font-size: 13px;
  color: #FB2C36;
  text-align: center;
  margin-bottom: 4px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #AA7B72;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: #8B5E56;
}

.copyright {
  margin-top: 24px;
  font-size: 11px;
  color: #C9BEB1;
}
</style>
