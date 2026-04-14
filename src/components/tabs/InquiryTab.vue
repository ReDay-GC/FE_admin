<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchInquiries,
  fetchInquiryDetail,
  replyInquiry,
  type InquirySummary,
  type InquiryDetail,
} from '@/api/adminApi'

const inquiries = ref<InquirySummary[]>([])
const loading = ref(false)
const selectedStatus = ref('')
const keyword = ref('')

const detail = ref<InquiryDetail | null>(null)
const showModal = ref(false)
const replyText = ref('')
const replying = ref(false)

function formatDate(iso: string) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : '-'
}

async function load() {
  loading.value = true
  try {
    inquiries.value = await fetchInquiries(selectedStatus.value || undefined, keyword.value || undefined)
  } catch { /* 무시 */ }
  finally { loading.value = false }
}

async function openDetail(id: number) {
  try {
    detail.value = await fetchInquiryDetail(id)
    replyText.value = detail.value.replyContent ?? ''
    showModal.value = true
  } catch { /* 무시 */ }
}

function closeModal() {
  showModal.value = false
  detail.value = null
  replyText.value = ''
}

async function submitReply() {
  if (!detail.value || !replyText.value.trim()) return
  replying.value = true
  try {
    await replyInquiry(detail.value.inquiryId, replyText.value.trim())
    closeModal()
    await load()
  } catch { /* 무시 */ }
  finally { replying.value = false }
}

onMounted(load)
</script>

<template>
  <div class="tab-header">
    <h2 class="tab-title">문의사항 관리</h2>
    <p class="tab-subtitle">사용자 문의를 확인하고 답변을 등록합니다</p>
  </div>

  <!-- 필터 + 검색 -->
  <div class="toolbar">
    <div class="filter-btns">
      <button class="filter-btn" :class="{ active: selectedStatus === '' }" @click="selectedStatus = ''; load()">전체</button>
      <button class="filter-btn" :class="{ active: selectedStatus === 'WAITING' }" @click="selectedStatus = 'WAITING'; load()">대기중</button>
      <button class="filter-btn" :class="{ active: selectedStatus === 'ANSWERED' }" @click="selectedStatus = 'ANSWERED'; load()">답변완료</button>
    </div>
    <div class="search-wrap">
      <input v-model="keyword" class="search-input" placeholder="제목 또는 내용 검색" @keyup.enter="load" />
      <button class="search-btn" @click="load">검색</button>
    </div>
  </div>

  <div class="table-section">
    <div v-if="loading" class="state-text">불러오는 중...</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>제목</th>
          <th>사용자</th>
          <th>상태</th>
          <th>등록일</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="inquiries.length === 0">
          <td colspan="5" class="empty-row">문의가 없습니다.</td>
        </tr>
        <tr v-for="item in inquiries" :key="item.inquiryId">
          <td class="td-title">{{ item.title }}</td>
          <td>{{ item.userName }}</td>
          <td>
            <span class="status-badge" :class="item.status === 'ANSWERED' ? 'badge-answered' : 'badge-waiting'">
              {{ item.status === 'ANSWERED' ? '답변완료' : '대기중' }}
            </span>
          </td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>
            <button class="action-btn" @click="openDetail(item.inquiryId)">상세보기</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 상세 모달 -->
  <div v-if="showModal && detail" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">문의 상세</h3>
        <button class="modal-close" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <div class="inquiry-meta">
          <span class="meta-user">{{ detail.userName }}</span>
          <span class="meta-date">{{ formatDate(detail.createdAt) }}</span>
          <span class="status-badge" :class="detail.status === 'ANSWERED' ? 'badge-answered' : 'badge-waiting'">
            {{ detail.status === 'ANSWERED' ? '답변완료' : '대기중' }}
          </span>
        </div>

        <div class="inquiry-title">{{ detail.title }}</div>
        <div class="inquiry-content">{{ detail.content }}</div>

        <div class="reply-section">
          <div class="reply-label">{{ detail.replyContent ? '등록된 답변' : '답변 작성' }}</div>
          <div v-if="detail.repliedAt" class="reply-date">{{ formatDate(detail.repliedAt) }} 답변</div>
          <textarea
            v-model="replyText"
            class="reply-textarea"
            :placeholder="detail.replyContent ? '' : '답변 내용을 입력하세요'"
            rows="5"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">닫기</button>
        <button class="btn-submit" :disabled="replying || !replyText.trim()" @click="submitReply">
          {{ replying ? '등록 중...' : (detail.replyContent ? '답변 수정' : '답변 등록') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-header { margin-bottom: 20px; }
.tab-title { font-size: 20px; font-weight: 700; color: #2B2420; margin-bottom: 4px; }
.tab-subtitle { font-size: 13px; color: #A89C90; }
.state-text { font-size: 13px; color: #A89C90; padding: 20px 0; }

.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
.filter-btns { display: flex; gap: 6px; }
.filter-btn { padding: 6px 14px; border: 1px solid #E5D4C1; border-radius: 6px; background: #fff; font-size: 13px; color: #A89C90; cursor: pointer; }
.filter-btn:hover { background: #FAF8F5; }
.filter-btn.active { background: #FFF3EF; color: #AA7B72; border-color: #AA7B72; font-weight: 600; }
.search-wrap { display: flex; gap: 6px; }
.search-input { padding: 6px 12px; border: 1px solid #E5D4C1; border-radius: 6px; font-size: 13px; color: #4A4038; width: 220px; outline: none; }
.search-input:focus { border-color: #AA7B72; }
.search-btn { padding: 6px 14px; background: #AA7B72; color: #fff; border: none; border-radius: 6px; font-size: 13px; cursor: pointer; }
.search-btn:hover { background: #8B5E57; }

.table-section { background: #fff; border-radius: 12px; border: 1px solid #F5F3EE; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 12px; color: #A89C90; font-weight: 500; padding: 10px 16px; border-bottom: 1px solid #F5F3EE; background: #FAF8F5; }
.data-table td { padding: 14px 16px; font-size: 13px; color: #685E52; border-bottom: 1px solid #F5F3EE; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #FAF8F5; }
.td-title { color: #2B2420; font-weight: 500; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-row { text-align: center; color: #C9BEB1; padding: 40px !important; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge-waiting { background: #FFF3EF; color: #AA7B72; }
.badge-answered { background: #E9EFE4; color: #6F8063; }

.action-btn { padding: 4px 12px; border: 1px solid #E5D4C1; border-radius: 6px; background: #fff; font-size: 12px; color: #685E52; cursor: pointer; }
.action-btn:hover { background: #FAF8F5; }

/* 모달 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 16px; width: 560px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #F5F3EE; }
.modal-title { font-size: 16px; font-weight: 700; color: #2B2420; }
.modal-close { background: none; border: none; font-size: 16px; color: #A89C90; cursor: pointer; }
.modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; }
.modal-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #F5F3EE; }

.inquiry-meta { display: flex; align-items: center; gap: 10px; }
.meta-user { font-size: 13px; font-weight: 600; color: #4A4038; }
.meta-date { font-size: 12px; color: #A89C90; }
.inquiry-title { font-size: 15px; font-weight: 700; color: #2B2420; }
.inquiry-content { font-size: 13px; color: #685E52; line-height: 1.7; background: #FAF8F5; border-radius: 8px; padding: 14px; white-space: pre-wrap; }

.reply-section { display: flex; flex-direction: column; gap: 6px; }
.reply-label { font-size: 13px; font-weight: 600; color: #4A4038; }
.reply-date { font-size: 11px; color: #A89C90; }
.reply-textarea { width: 100%; border: 1px solid #E5D4C1; border-radius: 8px; padding: 12px; font-size: 13px; color: #4A4038; resize: vertical; outline: none; box-sizing: border-box; font-family: inherit; }
.reply-textarea:focus { border-color: #AA7B72; }

.btn-cancel { padding: 8px 18px; border: 1px solid #E5D4C1; border-radius: 8px; background: #fff; font-size: 13px; color: #685E52; cursor: pointer; }
.btn-cancel:hover { background: #FAF8F5; }
.btn-submit { padding: 8px 18px; background: #AA7B72; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-submit:hover:not(:disabled) { background: #8B5E57; }
.btn-submit:disabled { opacity: 0.5; cursor: default; }
</style>
