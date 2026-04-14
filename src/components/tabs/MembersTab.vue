<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchUserStats,
  fetchUsers,
  fetchUserDetail,
  updateUser,
  deleteUser,
  type AdminUserSummary,
  type AdminUserDetail,
} from '@/api/adminApi'

// ─── 목록 & 통계 ──────────────────────────────────────────

const totalUsers = ref(0)
const newUsersToday = ref(0)
const members = ref<AdminUserSummary[]>([])
const searchQuery = ref('')
const loadingList = ref(false)
const listError = ref('')

async function loadStats() {
  try {
    const data = await fetchUserStats()
    totalUsers.value = data.totalUsers
    newUsersToday.value = data.newUsersToday
  } catch { /* 무시 */ }
}

async function loadMembers() {
  loadingList.value = true
  listError.value = ''
  try {
    members.value = await fetchUsers(searchQuery.value)
  } catch {
    listError.value = '회원 목록을 불러오지 못했습니다.'
  } finally {
    loadingList.value = false
  }
}

function onSearch() { loadMembers() }

function formatDate(iso: string) {
  return iso ? iso.slice(0, 10) : '-'
}

function formatNumber(n: number) {
  return n?.toLocaleString() ?? '0'
}

// ─── 회원 상세 모달 ───────────────────────────────────────

const modalOpen = ref(false)
const loadingDetail = ref(false)
const detail = ref<AdminUserDetail | null>(null)
const editMode = ref(false)
const editName = ref('')
const deleteConfirm = ref(false)

async function openDetail(userId: number) {
  modalOpen.value = true
  loadingDetail.value = true
  detail.value = null
  editMode.value = false
  deleteConfirm.value = false
  try {
    detail.value = await fetchUserDetail(userId)
    editName.value = detail.value.name
  } catch {
    modalOpen.value = false
    alert('회원 정보를 불러오지 못했습니다.')
  } finally {
    loadingDetail.value = false
  }
}

function closeModal() {
  modalOpen.value = false
  detail.value = null
  editMode.value = false
  deleteConfirm.value = false
}

async function saveEdit() {
  if (!detail.value || !editName.value.trim()) return
  try {
    await updateUser(detail.value.userId, editName.value.trim())
    detail.value.name = editName.value.trim()
    const target = members.value.find(m => m.userId === detail.value!.userId)
    if (target) target.name = editName.value.trim()
    editMode.value = false
  } catch {
    alert('회원 정보 수정에 실패했습니다.')
  }
}

async function onDeleteUser() {
  if (!detail.value) return
  try {
    await deleteUser(detail.value.userId)
    members.value = members.value.filter(m => m.userId !== detail.value!.userId)
    closeModal()
    totalUsers.value = Math.max(0, totalUsers.value - 1)
  } catch {
    alert('회원 삭제에 실패했습니다.')
  }
}

function getTypePercent(count: number) {
  if (!detail.value || detail.value.totalRecords === 0) return 0
  return Math.round((count / detail.value.totalRecords) * 100)
}

function getInitial(name: string) {
  return name?.charAt(0) ?? '?'
}

onMounted(() => {
  loadStats()
  loadMembers()
})
</script>

<template>
  <!-- 통계 카드 -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-icon-wrap">
        <img src="/src/assets/icon-members.svg" class="stat-icon" />
      </div>
      <div>
        <div class="stat-value">{{ formatNumber(totalUsers) }}</div>
        <div class="stat-label">전체 사용자 수</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon-wrap">
        <img src="/src/assets/icon-user.svg" class="stat-icon" />
      </div>
      <div>
        <div class="stat-value">{{ formatNumber(newUsersToday) }}</div>
        <div class="stat-label">전일 신규 가입자 수</div>
      </div>
    </div>
  </div>

  <!-- 회원 목록 -->
  <div class="table-section">
    <h2 class="section-title">전체 회원 목록</h2>
    <div class="search-row">
      <input v-model="searchQuery" class="search-input" placeholder="이름 검색" @keyup.enter="onSearch" />
      <button class="search-btn" @click="onSearch">검색</button>
    </div>

    <div v-if="loadingList" class="state-text">불러오는 중...</div>
    <div v-else-if="listError" class="state-text error">{{ listError }}</div>

    <table v-else class="member-table">
      <thead>
        <tr>
          <th>이름</th>
          <th>이메일</th>
          <th>가입일</th>
          <th>기억 수</th>
          <th>자세히</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="members.length === 0">
          <td colspan="5" class="empty-row">조회된 회원이 없습니다.</td>
        </tr>
        <tr v-for="member in members" :key="member.userId">
          <td>{{ member.name }}</td>
          <td>{{ member.email }}</td>
          <td>{{ formatDate(member.createdAt) }}</td>
          <td>{{ member.memoryCount }}</td>
          <td><button class="detail-btn" @click="openDetail(member.userId)">∨</button></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 회원 상세 모달 -->
  <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">회원 상세</span>
        <button class="modal-close" @click="closeModal">✕</button>
      </div>

      <div v-if="loadingDetail" class="modal-loading">불러오는 중...</div>

      <template v-else-if="detail">
        <div class="modal-top">
          <!-- 프로필 카드 -->
          <div class="profile-card">
            <div class="avatar">{{ getInitial(detail.name) }}</div>
            <div class="profile-info">
              <template v-if="!editMode">
                <div class="profile-name">{{ detail.name }}</div>
              </template>
              <template v-else>
                <input v-model="editName" class="name-input" />
              </template>
              <div class="profile-email">{{ detail.email }}</div>
              <div class="profile-date">📅 가입일 {{ formatDate(detail.createdAt) }}</div>
            </div>
            <div class="profile-actions">
              <template v-if="!deleteConfirm && !editMode">
                <button class="btn-edit" @click="editMode = true">정보 수정</button>
                <button class="btn-delete" @click="deleteConfirm = true">회원 삭제</button>
              </template>
              <template v-else-if="editMode">
                <button class="btn-save" @click="saveEdit">저장</button>
                <button class="btn-cancel" @click="editMode = false">취소</button>
              </template>
              <template v-else-if="deleteConfirm">
                <p class="delete-confirm-text">정말 삭제하시겠습니까?</p>
                <button class="btn-delete-confirm" @click="onDeleteUser">삭제</button>
                <button class="btn-cancel" @click="deleteConfirm = false">취소</button>
              </template>
            </div>
          </div>

          <!-- 통계 영역 -->
          <div class="stats-area">
            <div class="stat-cards-row">
              <div class="stat-pill sub">
                <div class="pill-value">{{ detail.totalMemories }}</div>
                <div class="pill-label">기억 수</div>
              </div>
              <div class="stat-pill main">
                <div class="pill-value">{{ detail.totalRecords }}</div>
                <div class="pill-label">총 기록 수</div>
              </div>
            </div>
            <div class="type-distribution">
              <div class="dist-title">기록 유형별 분포</div>
              <div class="dist-row">
                <span class="dist-label">사진</span>
                <div class="dist-bar-wrap"><div class="dist-bar photo" :style="{ width: getTypePercent(detail.photoCount) + '%' }"></div></div>
                <span class="dist-count">{{ detail.photoCount }}</span>
              </div>
              <div class="dist-row">
                <span class="dist-label">텍스트</span>
                <div class="dist-bar-wrap"><div class="dist-bar text" :style="{ width: getTypePercent(detail.textCount) + '%' }"></div></div>
                <span class="dist-count">{{ detail.textCount }}</span>
              </div>
              <div class="dist-row">
                <span class="dist-label">음성</span>
                <div class="dist-bar-wrap"><div class="dist-bar voice" :style="{ width: getTypePercent(detail.voiceCount) + '%' }"></div></div>
                <span class="dist-count">{{ detail.voiceCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 기억 목록 -->
        <div class="memory-section">
          <div class="memory-title">기억 목록</div>
          <div v-if="detail.memories.length === 0" class="memory-empty">기억이 없습니다.</div>
          <div v-else class="memory-list">
            <div v-for="mem in detail.memories" :key="mem.memoryId" class="memory-item">
              <div class="memory-item-left">
                <div class="memory-item-title">{{ mem.title }}</div>
                <div class="memory-item-summary">{{ mem.summary }}</div>
              </div>
              <div class="memory-item-date">{{ mem.memoryDate }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.stats-row { display: flex; gap: 16px; margin-bottom: 28px; }
.stat-card { background: #fff; border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; flex: 1; border: 1px solid #F5F3EE; }
.stat-icon-wrap { width: 52px; height: 52px; border-radius: 50%; background: #F5F3EE; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-icon { width: 26px; height: 26px; opacity: 0.8; }
.stat-value { font-size: 24px; font-weight: 700; color: #4A4038; }
.stat-label { font-size: 12px; color: #A89C90; margin-top: 2px; }

.table-section { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #F5F3EE; }
.section-title { font-size: 15px; font-weight: 600; color: #4A4038; margin-bottom: 14px; }
.search-row { display: flex; gap: 8px; margin-bottom: 16px; }
.search-input { width: 240px; padding: 8px 12px; border: 1px solid #E5D4C1; border-radius: 8px; font-size: 13px; color: #4A4038; outline: none; }
.search-input::placeholder { color: #C9BEB1; }
.search-input:focus { border-color: #AA7B72; }
.search-btn { padding: 8px 16px; background: #AA7B72; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
.search-btn:hover { background: #8B5E56; }

.state-text { font-size: 13px; color: #A89C90; padding: 8px 0; }
.state-text.error { color: #FB2C36; }

.member-table { width: 100%; border-collapse: collapse; }
.member-table th { text-align: left; font-size: 12px; color: #A89C90; font-weight: 500; padding: 8px 12px; border-bottom: 1px solid #F5F3EE; }
.member-table td { padding: 12px; font-size: 13px; color: #685E52; border-bottom: 1px solid #F5F3EE; }
.member-table tr:last-child td { border-bottom: none; }
.member-table tr:hover td { background: #FAF8F5; }
.empty-row { text-align: center; color: #C9BEB1; }
.detail-btn { width: 36px; height: 28px; border: 1px solid #E5D4C1; border-radius: 6px; background: #FAF8F5; color: #685E52; font-size: 14px; cursor: pointer; }
.detail-btn:hover { background: #FFF3EF; border-color: #AA7B72; color: #AA7B72; }

/* 모달 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 16px; width: 680px; max-height: 80vh; overflow-y: auto; padding: 28px; display: flex; flex-direction: column; gap: 24px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 18px; font-weight: 700; color: #2B2420; }
.modal-close { width: 32px; height: 32px; border-radius: 50%; border: none; background: #F5F3EE; color: #685E52; font-size: 14px; cursor: pointer; }
.modal-close:hover { background: #FFE8E0; color: #AA7B72; }
.modal-loading { text-align: center; color: #A89C90; font-size: 14px; padding: 40px 0; }

.modal-top { display: grid; grid-template-columns: 220px 1fr; gap: 20px; }
.profile-card { background: #FAF8F5; border-radius: 12px; padding: 20px 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: #6F8063; color: #fff; font-size: 22px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.profile-info { text-align: center; }
.profile-name { font-size: 16px; font-weight: 700; color: #2B2420; margin-bottom: 4px; }
.profile-email { font-size: 12px; color: #8B7E6E; margin-bottom: 4px; }
.profile-date { font-size: 11px; color: #A89C90; }
.name-input { width: 100%; padding: 6px 10px; border: 1px solid #E5D4C1; border-radius: 8px; font-size: 14px; text-align: center; outline: none; }
.name-input:focus { border-color: #AA7B72; }
.profile-actions { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.btn-edit { width: 100%; padding: 8px 0; background: #F5F3EE; color: #685E52; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
.btn-delete { width: 100%; padding: 8px 0; background: #FFF3EF; color: #FB2C36; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
.btn-save { width: 100%; padding: 8px 0; background: #AA7B72; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
.btn-cancel { width: 100%; padding: 8px 0; background: #F5F3EE; color: #685E52; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
.btn-delete-confirm { width: 100%; padding: 8px 0; background: #FB2C36; color: #fff; border: none; border-radius: 8px; font-size: 13px; cursor: pointer; }
.delete-confirm-text { font-size: 12px; color: #FB2C36; text-align: center; margin: 0; }

.stats-area { display: flex; flex-direction: column; gap: 16px; }
.stat-cards-row { display: flex; gap: 12px; }
.stat-pill { flex: 1; border-radius: 12px; padding: 16px; text-align: center; }
.stat-pill.sub { background: #E9EFE4; }
.stat-pill.main { background: #FFE8E0; }
.pill-value { font-size: 28px; font-weight: 700; }
.stat-pill.sub .pill-value { color: #6F8063; }
.stat-pill.main .pill-value { color: #AA7B72; }
.pill-label { font-size: 12px; color: #8B7E6E; margin-top: 2px; }

.type-distribution { background: #FAF8F5; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.dist-title { font-size: 13px; font-weight: 600; color: #4A4038; margin-bottom: 4px; }
.dist-row { display: flex; align-items: center; gap: 8px; }
.dist-label { font-size: 12px; color: #8B7E6E; width: 36px; flex-shrink: 0; }
.dist-bar-wrap { flex: 1; height: 8px; background: #E5D4C1; border-radius: 4px; overflow: hidden; }
.dist-bar { height: 100%; border-radius: 4px; transition: width 0.3s; }
.dist-bar.photo { background: #6F8063; }
.dist-bar.text { background: #AA7B72; }
.dist-bar.voice { background: #A89C90; }
.dist-count { font-size: 12px; color: #8B7E6E; width: 28px; text-align: right; flex-shrink: 0; }

.memory-section { border-top: 1px solid #F5F3EE; padding-top: 20px; }
.memory-title { font-size: 14px; font-weight: 600; color: #4A4038; margin-bottom: 12px; }
.memory-empty { font-size: 13px; color: #C9BEB1; text-align: center; padding: 20px 0; }
.memory-list { display: flex; flex-direction: column; gap: 8px; }
.memory-item { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px 14px; background: #FAF8F5; border-radius: 10px; gap: 12px; }
.memory-item-left { flex: 1; }
.memory-item-title { font-size: 13px; font-weight: 600; color: #4A4038; margin-bottom: 4px; }
.memory-item-summary { font-size: 12px; color: #8B7E6E; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.memory-item-date { font-size: 11px; color: #A89C90; flex-shrink: 0; }
</style>
