<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchAiMonitoringStats,
  fetchAiMonitoringLogs,
  type AiMonitoringStats,
  type AiLog,
} from '@/api/adminApi'

const stats = ref<AiMonitoringStats | null>(null)
const logs = ref<AiLog[]>([])
const loading = ref(false)
const currentPage = ref(0)
const totalPages = ref(0)
const pageSize = 20

function formatDateTime(iso: string) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : '-'
}

function statusLabel(status: string) {
  if (status === 'SUCCESS') return '성공'
  if (status === 'TIMEOUT') return '타임아웃'
  return '실패'
}

function statusClass(status: string) {
  if (status === 'SUCCESS') return 'badge-success'
  if (status === 'TIMEOUT') return 'badge-timeout'
  return 'badge-fail'
}

function memoryIdLabel(id: string) {
  if (id === '인사이트') return '인사이트'
  if (id?.startsWith('MEM')) return '기억 생성'
  return id
}

async function loadPage(page: number) {
  loading.value = true
  try {
    const [statsRes, logsRes] = await Promise.all([
      fetchAiMonitoringStats(),
      fetchAiMonitoringLogs(page, pageSize),
    ])
    stats.value = statsRes
    logs.value = logsRes.content
    totalPages.value = logsRes.totalPages
    currentPage.value = logsRes.number
  } catch { /* 무시 */ }
  finally { loading.value = false }
}

onMounted(() => loadPage(0))
</script>

<template>
  <div class="tab-header">
    <h2 class="tab-title">AI 서비스 모니터링</h2>
    <p class="tab-subtitle">AI 처리 현황을 실시간으로 모니터링합니다</p>
  </div>

  <div v-if="loading" class="state-text">불러오는 중...</div>

  <template v-else>
    <div class="tri-stats-row">
      <div class="tri-stat-card">
        <div class="tri-icon-wrap sub">🔄</div>
        <div class="tri-value">{{ stats?.totalRequests ?? '-' }}</div>
        <div class="tri-label">총 AI 호출</div>
      </div>
      <div class="tri-stat-card">
        <div class="tri-icon-wrap main">⏱</div>
        <div class="tri-value">{{ stats ? stats.averageResponseTimeSec + 's' : '-' }}</div>
        <div class="tri-label">평균 응답시간</div>
      </div>
      <div class="tri-stat-card">
        <div class="tri-icon-wrap brown">✅</div>
        <div class="tri-value">{{ stats ? stats.successRate + '%' : '-' }}</div>
        <div class="tri-label">성공률</div>
      </div>
    </div>

    <div class="table-section">
      <h3 class="section-title">실시간 AI 처리 로그</h3>
      <table class="log-table">
        <thead>
          <tr>
            <th>시간</th>
            <th>기억 ID</th>
            <th>사용자</th>
            <th>상태</th>
            <th>응답시간</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="logs.length === 0">
            <td colspan="5" class="empty-row">로그가 없습니다.</td>
          </tr>
          <tr v-for="log in logs" :key="log.logId">
            <td>{{ formatDateTime(log.processedAt) }}</td>
            <td>
              <span class="memory-id-badge">{{ memoryIdLabel(log.memoryId) }}</span>
            </td>
            <td>
              <div class="log-user">
                <div class="log-avatar">{{ log.userName.charAt(0) }}</div>
                {{ log.userName }}
              </div>
            </td>
            <td>
              <span class="status-badge" :class="statusClass(log.status)">
                {{ statusLabel(log.status) }}
              </span>
            </td>
            <td>{{ log.responseTimeSec }}s</td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 0" @click="loadPage(currentPage - 1)">이전</button>
        <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage >= totalPages - 1" @click="loadPage(currentPage + 1)">다음</button>
      </div>
    </div>
  </template>
</template>

<style scoped>
.tab-header { margin-bottom: 20px; }
.tab-title { font-size: 20px; font-weight: 700; color: #2B2420; margin-bottom: 4px; }
.tab-subtitle { font-size: 13px; color: #A89C90; }
.state-text { font-size: 13px; color: #A89C90; }

.tri-stats-row { display: flex; gap: 16px; margin-bottom: 20px; }
.tri-stat-card { flex: 1; background: #fff; border-radius: 12px; padding: 24px 20px; border: 1px solid #F5F3EE; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.tri-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.tri-icon-wrap.main { background: #FFE8E0; }
.tri-icon-wrap.sub { background: #E9EFE4; }
.tri-icon-wrap.brown { background: #F5F3EE; }
.tri-value { font-size: 28px; font-weight: 700; color: #2B2420; }
.tri-label { font-size: 12px; color: #A89C90; }

.table-section { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #F5F3EE; }
.section-title { font-size: 15px; font-weight: 600; color: #4A4038; margin-bottom: 14px; }

.log-table { width: 100%; border-collapse: collapse; }
.log-table th { text-align: left; font-size: 12px; color: #A89C90; font-weight: 500; padding: 8px 12px; border-bottom: 1px solid #F5F3EE; }
.log-table td { padding: 12px; font-size: 13px; color: #685E52; border-bottom: 1px solid #F5F3EE; }
.log-table tr:last-child td { border-bottom: none; }
.log-table tr:hover td { background: #FAF8F5; }
.empty-row { text-align: center; color: #C9BEB1; }

.log-user { display: flex; align-items: center; gap: 8px; }
.log-avatar { width: 26px; height: 26px; border-radius: 50%; background: #E9EFE4; color: #6F8063; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.memory-id-badge { display: inline-block; background: #F5F3EE; color: #685E52; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.3px; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge-success { background: #E9EFE4; color: #6F8063; }
.badge-timeout { background: #FFF3EF; color: #AA7B72; }
.badge-fail { background: #FFE8E0; color: #FB2C36; }

.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; padding-top: 16px; border-top: 1px solid #F5F3EE; margin-top: 4px; }
.page-btn { padding: 5px 14px; border: 1px solid #E5D4C1; border-radius: 6px; background: #fff; color: #685E52; font-size: 13px; cursor: pointer; }
.page-btn:hover:not(:disabled) { background: #FAF8F5; }
.page-btn:disabled { opacity: 0.4; cursor: default; }
.page-info { font-size: 13px; color: #A89C90; }
</style>
