import axios from 'axios'

const adminApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 토큰 자동 첨부
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminAccessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 응답 인터셉터: 401 자동 로그아웃
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminAccessToken')
      localStorage.removeItem('adminInfo')
      window.location.href = '/'
    }
    return Promise.reject(error)
  },
)

// ─── Types ────────────────────────────────────────────────

export interface AdminUserSummary {
  userId: number
  name: string
  email: string
  createdAt: string
  memoryCount: number
}

export interface AdminUserMemory {
  memoryId: number
  title: string
  summary: string
  memoryDate: string
  recordCount: number
}

export interface AdminUserDetail {
  userId: number
  name: string
  email: string
  createdAt: string
  totalMemories: number
  totalRecords: number
  photoCount: number
  textCount: number
  voiceCount: number
  memories: AdminUserMemory[]
}

export interface AdminUserStats {
  totalUsers: number
  newUsersToday: number
}

export interface ServiceStats {
  todayMemoryCount: number
  totalMemoryCount: number
  totalRecordCount: number
  photoCount: number
  textCount: number
  voiceCount: number
  photoPercent: number
  textPercent: number
  voicePercent: number
}

export interface AiMonitoringStats {
  totalRequests: number
  averageResponseTimeSec: number
  successRate: number
}

export interface AiLog {
  logId: number
  memoryId: string        // "MEM-2026-0413-005" 또는 "인사이트"
  userId: number
  userName: string
  status: 'SUCCESS' | 'TIMEOUT' | 'FAILED'
  responseTimeSec: number
  processedAt: string
}

export interface AiLogsPage {
  content: AiLog[]
  totalElements: number
  totalPages: number
  number: number          // 현재 페이지 (0-based)
}

// ─── Auth ─────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  const response = await axios.post('/api/admin/auth/login', { email, password }, {
    headers: { 'Content-Type': 'application/json' },
  })
  return response.data
}

// ─── Users ────────────────────────────────────────────────

export async function fetchUserStats(): Promise<AdminUserStats> {
  const res = await adminApi.get('/admin/users/stats')
  return res.data.data
}

export async function fetchUsers(search?: string): Promise<AdminUserSummary[]> {
  const params: Record<string, string> = {}
  if (search?.trim()) params.search = search.trim()
  const res = await adminApi.get('/admin/users', { params })
  return res.data.data || []
}

export async function fetchUserDetail(userId: number): Promise<AdminUserDetail> {
  const res = await adminApi.get(`/admin/users/${userId}`)
  return res.data.data
}

export async function updateUser(userId: number, name: string) {
  const res = await adminApi.put(`/admin/users/${userId}`, { name })
  return res.data
}

export async function deleteUser(userId: number) {
  await adminApi.delete(`/admin/users/${userId}`)
}

// ─── Stats ────────────────────────────────────────────────

export async function fetchServiceStats(): Promise<ServiceStats> {
  const res = await adminApi.get('/admin/stats/service')
  return res.data.data
}

export async function fetchAiMonitoringStats(): Promise<AiMonitoringStats> {
  const res = await adminApi.get('/admin/ai-monitoring/stats')
  return res.data.data
}

export async function fetchAiMonitoringLogs(page = 0, size = 20): Promise<AiLogsPage> {
  const res = await adminApi.get('/admin/ai-monitoring/logs', { params: { page, size } })
  return res.data.data
}

// ─── Inquiries ────────────────────────────────────────────

export interface InquirySummary {
  inquiryId: number
  userId: number
  userName: string
  title: string
  status: 'WAITING' | 'ANSWERED'
  createdAt: string
}

export interface InquiryDetail {
  inquiryId: number
  userId: number
  userName: string
  title: string
  content: string
  status: 'WAITING' | 'ANSWERED'
  replyContent: string | null
  repliedAt: string | null
  createdAt: string
}

export async function fetchInquiries(status?: string, keyword?: string): Promise<InquirySummary[]> {
  const params: Record<string, string> = {}
  if (status) params.status = status
  if (keyword?.trim()) params.keyword = keyword.trim()
  const res = await adminApi.get('/admin/inquiries', { params })
  return res.data.data || []
}

export async function fetchInquiryDetail(inquiryId: number): Promise<InquiryDetail> {
  const res = await adminApi.get(`/admin/inquiries/${inquiryId}`)
  return res.data.data
}

export async function replyInquiry(inquiryId: number, content: string) {
  await adminApi.post(`/admin/inquiries/${inquiryId}/reply`, { content })
}

export async function updateInquiryStatus(inquiryId: number, status: string) {
  await adminApi.patch(`/admin/inquiries/${inquiryId}/status`, { status })
}

// ─── Notices ──────────────────────────────────────────────

export interface NoticeSummary {
  noticeId: number
  title: string
  isPublic: boolean
  createdAt: string
}

export async function fetchNotices(): Promise<NoticeSummary[]> {
  const res = await adminApi.get('/admin/notices')
  return res.data.data || []
}

export async function createNotice(title: string, content: string, isPublic: boolean) {
  await adminApi.post('/admin/notices', { title, content, isPublic })
}

export async function updateNotice(noticeId: number, title: string, content: string, isPublic: boolean) {
  await adminApi.put(`/admin/notices/${noticeId}`, { title, content, isPublic })
}

export async function deleteNotice(noticeId: number) {
  await adminApi.delete(`/admin/notices/${noticeId}`)
}

export default adminApi
