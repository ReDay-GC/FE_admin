<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  type NoticeSummary,
} from '@/api/adminApi'

const notices = ref<NoticeSummary[]>([])
const loading = ref(false)

const showModal = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const form = ref({ title: '', content: '', isPublic: true })
const submitting = ref(false)

const showDeleteConfirm = ref(false)
const deleteTargetId = ref<number | null>(null)

function formatDate(iso: string) {
  return iso ? iso.replace('T', ' ').slice(0, 10) : '-'
}

async function load() {
  loading.value = true
  try {
    notices.value = await fetchNotices()
  } catch { /* 무시 */ }
  finally { loading.value = false }
}

function openCreate() {
  isEdit.value = false
  editId.value = null
  form.value = { title: '', content: '', isPublic: true }
  showModal.value = true
}

function openEdit(notice: NoticeSummary) {
  isEdit.value = true
  editId.value = notice.noticeId
  form.value = { title: notice.title, content: '', isPublic: notice.isPublic }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitForm() {
  if (!form.value.title.trim() || !form.value.content.trim()) return
  submitting.value = true
  try {
    if (isEdit.value && editId.value !== null) {
      await updateNotice(editId.value, form.value.title, form.value.content, form.value.isPublic)
    } else {
      await createNotice(form.value.title, form.value.content, form.value.isPublic)
    }
    closeModal()
    await load()
  } catch { /* 무시 */ }
  finally { submitting.value = false }
}

function confirmDelete(noticeId: number) {
  deleteTargetId.value = noticeId
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (deleteTargetId.value === null) return
  try {
    await deleteNotice(deleteTargetId.value)
    await load()
  } catch { /* 무시 */ }
  finally {
    showDeleteConfirm.value = false
    deleteTargetId.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="tab-header">
    <div class="header-row">
      <div>
        <h2 class="tab-title">공지사항 관리</h2>
        <p class="tab-subtitle">앱 사용자에게 공지사항을 등록하고 관리합니다</p>
      </div>
      <button class="btn-create" @click="openCreate">+ 새 공지 작성</button>
    </div>
  </div>

  <div class="table-section">
    <div v-if="loading" class="state-text">불러오는 중...</div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>제목</th>
          <th>공개 여부</th>
          <th>등록일</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="notices.length === 0">
          <td colspan="4" class="empty-row">등록된 공지사항이 없습니다.</td>
        </tr>
        <tr v-for="notice in notices" :key="notice.noticeId">
          <td class="td-title">{{ notice.title }}</td>
          <td>
            <span class="status-badge" :class="notice.isPublic ? 'badge-public' : 'badge-private'">
              {{ notice.isPublic ? '공개' : '비공개' }}
            </span>
          </td>
          <td>{{ formatDate(notice.createdAt) }}</td>
          <td>
            <div class="action-group">
              <button class="action-btn" @click="openEdit(notice)">수정</button>
              <button class="action-btn danger" @click="confirmDelete(notice.noticeId)">삭제</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- 작성/수정 모달 -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEdit ? '공지사항 수정' : '새 공지사항 작성' }}</h3>
        <button class="modal-close" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">제목</label>
          <input v-model="form.title" class="form-input" placeholder="공지 제목을 입력하세요" />
        </div>

        <div class="form-group">
          <label class="form-label">내용</label>
          <textarea v-model="form.content" class="form-textarea" placeholder="공지 내용을 입력하세요" rows="8" />
        </div>

        <div class="form-group">
          <label class="form-label">공개 여부</label>
          <div class="toggle-wrap">
            <button
              class="toggle-btn"
              :class="{ active: form.isPublic }"
              @click="form.isPublic = true"
            >공개</button>
            <button
              class="toggle-btn"
              :class="{ active: !form.isPublic }"
              @click="form.isPublic = false"
            >비공개</button>
          </div>
          <p class="form-hint">비공개 시 앱 사용자에게 노출되지 않습니다</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">취소</button>
        <button
          class="btn-submit"
          :disabled="submitting || !form.title.trim() || !form.content.trim()"
          @click="submitForm"
        >
          {{ submitting ? '저장 중...' : (isEdit ? '수정 완료' : '등록') }}
        </button>
      </div>
    </div>
  </div>

  <!-- 삭제 확인 -->
  <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
    <div class="modal modal-sm">
      <div class="modal-header">
        <h3 class="modal-title">공지사항 삭제</h3>
        <button class="modal-close" @click="showDeleteConfirm = false">✕</button>
      </div>
      <div class="modal-body">
        <p class="confirm-text">해당 공지사항을 삭제하시겠습니까?<br/>삭제 후 복구할 수 없습니다.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" @click="showDeleteConfirm = false">취소</button>
        <button class="btn-delete" @click="doDelete">삭제</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-header { margin-bottom: 20px; }
.header-row { display: flex; align-items: flex-start; justify-content: space-between; }
.tab-title { font-size: 20px; font-weight: 700; color: #2B2420; margin-bottom: 4px; }
.tab-subtitle { font-size: 13px; color: #A89C90; }
.state-text { font-size: 13px; color: #A89C90; padding: 20px 0; }

.btn-create { padding: 8px 16px; background: #AA7B72; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-create:hover { background: #8B5E57; }

.table-section { background: #fff; border-radius: 12px; border: 1px solid #F5F3EE; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 12px; color: #A89C90; font-weight: 500; padding: 10px 16px; border-bottom: 1px solid #F5F3EE; background: #FAF8F5; }
.data-table td { padding: 14px 16px; font-size: 13px; color: #685E52; border-bottom: 1px solid #F5F3EE; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #FAF8F5; }
.td-title { color: #2B2420; font-weight: 500; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty-row { text-align: center; color: #C9BEB1; padding: 40px !important; }

.status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge-public { background: #E9EFE4; color: #6F8063; }
.badge-private { background: #F5F3EE; color: #8B7E6E; }

.action-group { display: flex; gap: 6px; }
.action-btn { padding: 4px 12px; border: 1px solid #E5D4C1; border-radius: 6px; background: #fff; font-size: 12px; color: #685E52; cursor: pointer; }
.action-btn:hover { background: #FAF8F5; }
.action-btn.danger { color: #FB2C36; border-color: #FFE8E0; }
.action-btn.danger:hover { background: #FFE8E0; }

/* 모달 공통 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 16px; width: 560px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; }
.modal-sm { width: 400px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #F5F3EE; }
.modal-title { font-size: 16px; font-weight: 700; color: #2B2420; }
.modal-close { background: none; border: none; font-size: 16px; color: #A89C90; cursor: pointer; }
.modal-body { padding: 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; }
.modal-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 16px 24px; border-top: 1px solid #F5F3EE; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: #4A4038; }
.form-input { padding: 10px 12px; border: 1px solid #E5D4C1; border-radius: 8px; font-size: 13px; color: #2B2420; outline: none; }
.form-input:focus { border-color: #AA7B72; }
.form-textarea { padding: 10px 12px; border: 1px solid #E5D4C1; border-radius: 8px; font-size: 13px; color: #2B2420; resize: vertical; outline: none; font-family: inherit; }
.form-textarea:focus { border-color: #AA7B72; }
.form-hint { font-size: 11px; color: #A89C90; margin: 0; }

.toggle-wrap { display: flex; gap: 6px; }
.toggle-btn { padding: 6px 16px; border: 1px solid #E5D4C1; border-radius: 6px; background: #fff; font-size: 13px; color: #A89C90; cursor: pointer; }
.toggle-btn.active { background: #FFF3EF; color: #AA7B72; border-color: #AA7B72; font-weight: 600; }

.confirm-text { font-size: 14px; color: #4A4038; line-height: 1.7; margin: 0; }

.btn-cancel { padding: 8px 18px; border: 1px solid #E5D4C1; border-radius: 8px; background: #fff; font-size: 13px; color: #685E52; cursor: pointer; }
.btn-cancel:hover { background: #FAF8F5; }
.btn-submit { padding: 8px 18px; background: #AA7B72; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-submit:hover:not(:disabled) { background: #8B5E57; }
.btn-submit:disabled { opacity: 0.5; cursor: default; }
.btn-delete { padding: 8px 18px; background: #FB2C36; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.btn-delete:hover { background: #d9242e; }
</style>
