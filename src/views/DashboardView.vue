<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MembersTab from '@/components/tabs/MembersTab.vue'
import AnalysisTab from '@/components/tabs/AnalysisTab.vue'
import LogsTab from '@/components/tabs/LogsTab.vue'
import InquiryTab from '@/components/tabs/InquiryTab.vue'
import NoticeTab from '@/components/tabs/NoticeTab.vue'

const router = useRouter()
const route = useRoute()

const tabs = [
  { id: 'members', label: '전체 회원 관리', icon: '/src/assets/icon-members.svg' },
  { id: 'analysis', label: 'AI 서비스 통계 및 분석', icon: '/src/assets/icon-chart.svg' },
  { id: 'logs', label: 'AI 서비스 로그 관리', icon: '/src/assets/icon-ai.svg' },
  { id: 'inquiry', label: '문의사항 관리', icon: '/src/assets/icon-inquiry.svg' },
  { id: 'notice', label: '공지사항 관리', icon: '/src/assets/icon-notice.svg' },
]

const validTabIds = tabs.map(t => t.id)

function resolveTab(tab: unknown): string {
  return typeof tab === 'string' && validTabIds.includes(tab) ? tab : 'members'
}

const currentTab = ref(resolveTab(route.query.tab))

watch(() => route.query.tab, (tab) => {
  currentTab.value = resolveTab(tab)
})

function selectTab(id: string) {
  router.replace({ path: '/dashboard', query: { tab: id } })
}

function logout() {
  localStorage.removeItem('adminAccessToken')
  localStorage.removeItem('adminInfo')
  router.push('/')
}
</script>

<template>
  <div class="dashboard">
    <!-- 헤더 -->
    <header class="header">
      <div class="header-left">
        <img src="@/assets/logo.svg" alt="logo" class="header-logo" />
        <span class="brand">Re:Day</span>
        <span class="badge">Admin Console</span>
      </div>
      <button class="logout-btn" @click="logout">로그아웃</button>
    </header>

    <!-- 탭 -->
    <nav class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: currentTab === tab.id }"
        @click="selectTab(tab.id)"
      >
        <img :src="tab.icon" class="tab-icon" />
        {{ tab.label }}
      </button>
    </nav>

    <main class="content">
      <MembersTab v-if="currentTab === 'members'" />
      <AnalysisTab v-else-if="currentTab === 'analysis'" />
      <LogsTab v-else-if="currentTab === 'logs'" />
      <InquiryTab v-else-if="currentTab === 'inquiry'" />
      <NoticeTab v-else-if="currentTab === 'notice'" />
    </main>
  </div>
</template>

<style scoped>
.dashboard { min-height: 100vh; background-color: #FAF8F5; font-family: sans-serif; }

.header { display: flex; align-items: center; justify-content: space-between; padding: 14px 32px; background: #ffffff; border-bottom: 1px solid #F5F3EE; }
.header-left { display: flex; align-items: center; gap: 10px; }
.header-logo { width: 28px; height: 28px; }
.brand { font-size: 16px; font-weight: 700; color: #4A4038; }
.badge { background-color: #E9EFE4; color: #6F8063; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; }
.logout-btn { font-size: 12px; color: #A89C90; background: none; border: 1px solid #E5D4C1; border-radius: 6px; padding: 5px 12px; cursor: pointer; }
.logout-btn:hover { color: #685E52; border-color: #C9BEB1; }

.tab-bar { display: flex; gap: 4px; padding: 12px 32px; background: #ffffff; border-bottom: 1px solid #F5F3EE; justify-content: space-around; }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: 8px; background: transparent; font-size: 13px; color: #A89C90; cursor: pointer; transition: all 0.15s; }
.tab-btn:hover { background-color: #F5F3EE; color: #685E52; }
.tab-btn.active { background-color: #FFF3EF; color: #AA7B72; font-weight: 600; }
.tab-icon { width: 16px; height: 16px; opacity: 0.6; }
.tab-btn.active .tab-icon { opacity: 1; }

.content { padding: 28px 32px; }
.empty-tab { display: flex; align-items: center; justify-content: center; height: 300px; color: #C9BEB1; font-size: 14px; }
</style>
