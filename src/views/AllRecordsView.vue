<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAllRecords, type AdminRecord } from '@/api/adminApi'

const router = useRouter()
const records = ref<AdminRecord[]>([])
const loading = ref(false)
const error = ref(false)

const recordTypeLabel: Record<string, string> = {
  PHOTO: '사진',
  TEXT: '텍스트',
  VOICE: '음성',
}

onMounted(async () => {
  loading.value = true
  try {
    records.value = await fetchAllRecords()
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
      <button class="back-btn" @click="router.push({ path: '/dashboard', query: { tab: 'analysis' } })">← 대시보드로</button>
    </header>

    <main class="content">
      <div class="page-header">
        <h2 class="page-title">전체 기록 목록</h2>
        <p class="page-subtitle">전체 기록을 조회합니다</p>
      </div>

      <div v-if="loading" class="state-text">불러오는 중...</div>
      <div v-else-if="error" class="state-text error">데이터를 불러오지 못했습니다.</div>
      <div v-else class="table-wrap">
        <div class="count-label">총 {{ records.length }}건</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>기록 ID</th>
              <th>사용자 ID</th>
              <th>유형</th>
              <th>텍스트 내용</th>
              <th>미디어 유형</th>
              <th>기록 날짜</th>
              <th>녹음/촬영 일시</th>
              <th>생성일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="records.length === 0">
              <td colspan="8" class="empty-cell">기록이 없습니다.</td>
            </tr>
            <tr v-for="r in records" :key="r.recordId">
              <td class="mono">{{ r.recordId }}</td>
              <td class="mono">{{ r.userId }}</td>
              <td>
                <span class="type-badge" :class="r.recordType?.toLowerCase()">
                  {{ recordTypeLabel[r.recordType] ?? r.recordType }}
                </span>
              </td>
              <td class="text-cell">{{ r.textContent || '-' }}</td>
              <td>{{ r.mediaType || '-' }}</td>
              <td>{{ r.recordDate || '-' }}</td>
              <td class="mono-sm">{{ formatDate(r.recordedAt) }}</td>
              <td class="mono-sm">{{ formatDate(r.createdAt) }}</td>
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
.text-cell { max-width: 240px; font-size: 12px; color: #685E52; }

.type-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 500; }
.type-badge.photo { background: #FFF3EF; color: #AA7B72; }
.type-badge.text { background: #EEF2EA; color: #6F8063; }
.type-badge.voice { background: #F5F3EE; color: #8B7E6E; }

.empty-cell { text-align: center; color: #C9BEB1; padding: 40px; }
</style>
