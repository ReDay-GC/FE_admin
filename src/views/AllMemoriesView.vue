<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAllMemories, type AdminMemory } from '@/api/adminApi'

const router = useRouter()
const memories = ref<AdminMemory[]>([])
const loading = ref(false)
const error = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    memories.value = await fetchAllMemories()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string) {
  return dateStr ? dateStr.replace('T', ' ').slice(0, 16) : '-'
}
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="header-left">
        <img src="@/assets/logo.svg" alt="logo" class="header-logo" />
        <span class="brand">Re:Day</span>
        <span class="badge">Admin Console</span>
      </div>
      <button class="back-btn" @click="router.push('/dashboard')">← 대시보드로</button>
    </header>

    <main class="content">
      <div class="page-header">
        <h2 class="page-title">전체 기억 목록</h2>
        <p class="page-subtitle">전체 기억을 조회합니다</p>
      </div>

      <div v-if="loading" class="state-text">불러오는 중...</div>
      <div v-else-if="error" class="state-text error">데이터를 불러오지 못했습니다.</div>
      <div v-else class="table-wrap">
        <div class="count-label">총 {{ memories.length }}건</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>기억 ID</th>
              <th>사용자 ID</th>
              <th>제목</th>
              <th>감정</th>
              <th>기억 날짜</th>
              <th>생성일시</th>
              <th>요약</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="memories.length === 0">
              <td colspan="7" class="empty-cell">기억이 없습니다.</td>
            </tr>
            <tr v-for="m in memories" :key="m.memoryId">
              <td class="mono">{{ m.memoryId }}</td>
              <td class="mono">{{ m.userId }}</td>
              <td class="title-cell">{{ m.title }}</td>
              <td>
                <span v-if="m.emotion" class="emotion-badge">{{ m.emotion }}</span>
                <span v-else class="empty-val">-</span>
              </td>
              <td>{{ m.memoryDate || '-' }}</td>
              <td class="mono-sm">{{ formatDate(m.createdAt) }}</td>
              <td class="summary-cell">{{ m.summary || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #FAF8F5; font-family: sans-serif; }

.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 32px; background: #fff; border-bottom: 1px solid #F5F3EE; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-logo { width: 28px; height: 28px; }
.brand { font-size: 16px; font-weight: 700; color: #4A4038; }
.badge { background: #E9EFE4; color: #6F8063; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.back-btn { font-size: 12px; color: #A89C90; background: none; border: 1px solid #E5D4C1; border-radius: 6px; padding: 5px 12px; cursor: pointer; }
.back-btn:hover { color: #685E52; border-color: #C9BEB1; }

.content { padding: 28px 32px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 700; color: #2B2420; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: #A89C90; }

.state-text { font-size: 13px; color: #A89C90; padding: 40px 0; text-align: center; }
.state-text.error { color: #C0625A; }

.table-wrap { background: #fff; border-radius: 12px; border: 1px solid #F5F3EE; overflow: hidden; }
.count-label { font-size: 12px; color: #A89C90; padding: 14px 20px 0; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #FAF8F5; font-size: 12px; font-weight: 600; color: #8B7E6E; padding: 10px 14px; text-align: left; border-bottom: 1px solid #F5F3EE; white-space: nowrap; }
.data-table td { font-size: 13px; color: #4A4038; padding: 12px 14px; border-bottom: 1px solid #F5F3EE; vertical-align: top; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover td { background: #FAF8F5; }

.mono { font-family: monospace; color: #8B7E6E; }
.mono-sm { font-family: monospace; font-size: 12px; color: #8B7E6E; }
.title-cell { font-weight: 500; max-width: 200px; }
.summary-cell { color: #685E52; max-width: 280px; font-size: 12px; }
.emotion-badge { background: #FFF3EF; color: #AA7B72; font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 500; }
.empty-val { color: #C9BEB1; }
.empty-cell { text-align: center; color: #C9BEB1; padding: 40px; }
</style>
