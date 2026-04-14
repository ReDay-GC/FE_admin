<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchServiceStats, type ServiceStats } from '@/api/adminApi'

const serviceStats = ref<ServiceStats | null>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    serviceStats.value = await fetchServiceStats()
  } catch { /* 무시 */ }
  finally { loading.value = false }
})
</script>

<template>
  <div class="tab-header">
    <h2 class="tab-title">서비스 통계 및 분석</h2>
    <p class="tab-subtitle">전체 서비스 수 현황을 모니터링합니다</p>
  </div>

  <div v-if="loading" class="state-text">불러오는 중...</div>

  <template v-else-if="serviceStats">
    <div class="tri-stats-row">
      <div class="tri-stat-card">
        <div class="tri-icon-wrap main">
          <img src="/src/assets/icon-calendar.svg" class="tri-icon" />
        </div>
        <div class="tri-value">{{ serviceStats.todayMemoryCount }}</div>
        <div class="tri-label">오늘 생성 기억</div>
      </div>
      <div class="tri-stat-card">
        <div class="tri-icon-wrap sub">
          <img src="/src/assets/icon-folder.svg" class="tri-icon" />
        </div>
        <div class="tri-value">{{ serviceStats.totalMemoryCount }}</div>
        <div class="tri-label">전체 기억</div>
      </div>
      <div class="tri-stat-card">
        <div class="tri-icon-wrap brown">
          <img src="/src/assets/icon-file.svg" class="tri-icon" />
        </div>
        <div class="tri-value">{{ serviceStats.totalRecordCount }}</div>
        <div class="tri-label">전체 기록</div>
      </div>
    </div>

    <div class="table-section">
      <h3 class="section-title">기록 유형별 분포</h3>
      <div class="dist-list">
        <div class="dist-row-lg">
          <div class="dist-label-lg">사진</div>
          <div class="dist-bar-wrap-lg"><div class="dist-bar-lg photo" :style="{ width: serviceStats.photoPercent + '%' }"></div></div>
          <span class="dist-num">{{ serviceStats.photoCount }}<span class="dist-pct">({{ serviceStats.photoPercent }}%)</span></span>
        </div>
        <div class="dist-row-lg">
          <div class="dist-label-lg">텍스트</div>
          <div class="dist-bar-wrap-lg"><div class="dist-bar-lg text" :style="{ width: serviceStats.textPercent + '%' }"></div></div>
          <span class="dist-num">{{ serviceStats.textCount }}<span class="dist-pct">({{ serviceStats.textPercent }}%)</span></span>
        </div>
        <div class="dist-row-lg">
          <div class="dist-label-lg">음성</div>
          <div class="dist-bar-wrap-lg"><div class="dist-bar-lg voice" :style="{ width: serviceStats.voicePercent + '%' }"></div></div>
          <span class="dist-num">{{ serviceStats.voiceCount }}<span class="dist-pct">({{ serviceStats.voicePercent }}%)</span></span>
        </div>
      </div>
      <div class="dist-total">총 기록 <strong>{{ serviceStats.totalRecordCount }}</strong></div>
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
.tri-icon { width: 22px; height: 22px; }
.tri-icon-wrap.main { background: #AA7B72; }
.tri-icon-wrap.sub { background: #6F8063; }
.tri-icon-wrap.brown { background: #8B7E6E; }
.tri-value { font-size: 28px; font-weight: 700; color: #2B2420; }
.tri-label { font-size: 12px; color: #A89C90; }

.table-section { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #F5F3EE; }
.section-title { font-size: 15px; font-weight: 600; color: #4A4038; margin-bottom: 16px; }
.dist-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
.dist-row-lg { display: flex; align-items: center; gap: 12px; }
.dist-label-lg { font-size: 13px; color: #685E52; width: 44px; flex-shrink: 0; }
.dist-bar-wrap-lg { flex: 1; height: 12px; background: #F5F3EE; border-radius: 6px; overflow: hidden; }
.dist-bar-lg { height: 100%; border-radius: 6px; transition: width 0.4s; }
.dist-bar-lg.photo { background: #AA7B72; }
.dist-bar-lg.text { background: #6F8063; }
.dist-bar-lg.voice { background: #A89C90; }
.dist-num { font-size: 13px; color: #4A4038; font-weight: 600; width: 90px; text-align: right; flex-shrink: 0; }
.dist-pct { font-size: 11px; color: #A89C90; font-weight: 400; margin-left: 4px; }
.dist-total { font-size: 13px; color: #8B7E6E; border-top: 1px solid #F5F3EE; padding-top: 12px; }
.dist-total strong { color: #4A4038; }
</style>
